<?php
/**
 * Agrenza — Gmail SMTP & Notification Mailer
 * -----------------------------------------------------------------
 * Sends real notification emails using:
 * 1. HTTPS Mail Relay (Next.js /api/send-mail on Vercel) — Bypasses cloud port blocks (Render blocks 25, 465, 587)
 * 2. Direct Gmail SMTP over SSL (port 465) fallback for local WAMP
 * Configuration is loaded from backend/config/mail-config.php.
 */

require_once __DIR__ . '/../config/mail-config.php';

/**
 * Returns the correct base frontend URL for email verification and action links.
 * Automatically chooses live Vercel domain when on production/mobile, or localhost during dev.
 */
function get_frontend_base_url(): string {
    if (!empty($_SERVER['HTTP_ORIGIN']) && preg_match('/\.vercel\.app$/', parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_HOST) ?? '')) {
        return rtrim($_SERVER['HTTP_ORIGIN'], '/');
    }
    if ((!empty($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], 'render.com') !== false) || getenv('RENDER')) {
        return 'https://agrenza.vercel.app';
    }
    return 'https://agrenza.vercel.app'; // Default to live Vercel frontend so mobile emails always work
}

/**
 * Dispatches email via Vercel HTTPS Mail Relay.
 * Works seamlessly on Render free tier where outbound raw SMTP ports are blocked.
 */
function send_mail_via_https_relay(string $toEmail, string $toName, string $subject, string $htmlBody, array $attachments = []): bool {
    $relayUrl = 'https://agrenza.vercel.app/api/send-mail';
    $payload = json_encode([
        'to' => $toEmail,
        'subject' => $subject,
        'html' => $htmlBody,
        'attachments' => $attachments,
        'secret' => 'agrenza_secret_mail_relay_2026',
    ]);

    if (function_exists('curl_init')) {
        $ch = curl_init($relayUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'User-Agent: Agrenza-Backend/1.0',
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 12);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            $json = json_decode($response, true);
            if (!empty($json['ok'])) {
                return true;
            }
        }
        error_log("[Agrenza mailer] HTTPS Relay failed (HTTP $httpCode): " . ($curlError ?: $response));
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\nUser-Agent: Agrenza-Backend/1.0\r\n",
                'content' => $payload,
                'timeout' => 12,
            ],
        ]);
        $response = @file_get_contents($relayUrl, false, $context);
        if ($response) {
            $json = json_decode($response, true);
            if (!empty($json['ok'])) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Sends an HTML email via HTTPS Relay or direct SMTP.
 * Supports optional attachments: array of ['name' => 'filename.ext', 'type' => 'text/plain', 'content' => '...']
 * Returns true if dispatched, false otherwise.
 */
function send_mail(string $toEmail, string $toName, string $subject, string $htmlBody, array $attachments = []): bool {
    $toEmail = trim($toEmail);
    if ($toEmail === '') return false;

    // 1. Try Vercel HTTPS Mail Relay first (Works on Render and live cloud)
    if (send_mail_via_https_relay($toEmail, $toName, $subject, $htmlBody, $attachments)) {
        log_mail_locally($toEmail, $subject, $htmlBody, 'SENT_VIA_HTTPS_RELAY', $attachments);
        return true;
    }

    // 2. Direct SMTP Fallback (for environments with open port 465, like local WAMP)
    $isConfigured = (SMTP_USER !== 'youraddress@gmail.com' && SMTP_PASS !== 'xxxxxxxxxxxxxxxx');

    if ($isConfigured) {
        $conn = @fsockopen('ssl://' . SMTP_HOST, SMTP_PORT, $errno, $errstr, 6);
        if ($conn) {
            stream_set_timeout($conn, 6);

            $readResponse = function () use ($conn) {
                $data = '';
                while (($line = fgets($conn, 515)) !== false) {
                    $data .= $line;
                    if (isset($line[3]) && $line[3] === ' ') break;
                }
                return $data;
            };
            $command = function (string $cmd) use ($conn, $readResponse) {
                fwrite($conn, $cmd . "\r\n");
                return $readResponse();
            };

            $readResponse(); // server greeting
            $command('EHLO agrenza.local');
            $command('AUTH LOGIN');
            $command(base64_encode(SMTP_USER));
            $authResp = $command(base64_encode(SMTP_PASS));

            if (strpos($authResp, '235') !== false) {
                $command('MAIL FROM:<' . SMTP_USER . '>');
                $command('RCPT TO:<' . $toEmail . '>');
                $command('DATA');

                $headers = [
                    'From: ' . SMTP_FROM_NAME . ' <' . SMTP_USER . '>',
                    'To: ' . $toName . ' <' . $toEmail . '>',
                    'Subject: ' . $subject,
                    'MIME-Version: 1.0',
                    'Date: ' . date('r'),
                ];

                if (!empty($attachments)) {
                    $boundary = '=_Agrenza_' . md5(uniqid((string)microtime(), true));
                    $headers[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';

                    $bodyParts = [];
                    // HTML Part
                    $bodyParts[] = "--{$boundary}";
                    $bodyParts[] = 'Content-Type: text/html; charset=UTF-8';
                    $bodyParts[] = 'Content-Transfer-Encoding: 8bit';
                    $bodyParts[] = '';
                    $bodyParts[] = $htmlBody;

                    // Attachment Parts
                    foreach ($attachments as $att) {
                        $attName = $att['name'] ?? 'attachment.txt';
                        $attType = $att['type'] ?? 'text/plain';
                        $attContent = $att['content'] ?? '';
                        $encodedContent = chunk_split(base64_encode($attContent));

                        $bodyParts[] = "--{$boundary}";
                        $bodyParts[] = "Content-Type: {$attType}; name=\"{$attName}\"";
                        $bodyParts[] = "Content-Disposition: attachment; filename=\"{$attName}\"";
                        $bodyParts[] = 'Content-Transfer-Encoding: base64';
                        $bodyParts[] = '';
                        $bodyParts[] = $encodedContent;
                    }

                    $bodyParts[] = "--{$boundary}--";
                    $messageBody = implode("\r\n", $bodyParts);
                } else {
                    $headers[] = 'Content-Type: text/html; charset=UTF-8';
                    $messageBody = $htmlBody;
                }

                $message = implode("\r\n", $headers) . "\r\n\r\n" . $messageBody;

                fwrite($conn, $message . "\r\n.\r\n");
                $dataResp = $readResponse();

                $command('QUIT');
                fclose($conn);

                if (strpos($dataResp, '250') !== false) {
                    log_mail_locally($toEmail, $subject, $htmlBody, 'SENT_VIA_GMAIL_SMTP', $attachments);
                    return true;
                }
            } else {
                error_log('[Agrenza mailer] SMTP Auth failed: ' . $authResp);
                fclose($conn);
            }
        } else {
            error_log("[Agrenza mailer] Could not connect to SMTP server: $errstr ($errno)");
        }
    }

    // Fallback log
    log_mail_locally($toEmail, $subject, $htmlBody, 'MAIL_FAILED_LOGGED_LOCALLY', $attachments);
    return false;
}

/**
 * Logs email content to local dev log file for easy testing when offline.
 */
function log_mail_locally(string $toEmail, string $subject, string $htmlBody, string $status, array $attachments = []): void {
    $logDir = dirname(DEV_MAIL_LOG);
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0775, true);
    }

    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "========================================================\n"
              . "[$timestamp] Status: $status\n"
              . "To: $toEmail\n"
              . "Subject: $subject\n";

    if (!empty($attachments)) {
        $attNames = array_map(function($a) { return $a['name'] ?? 'attachment'; }, $attachments);
        $logEntry .= "Attachments: " . implode(', ', $attNames) . "\n";
    }

    $logEntry .= "--------------------------------------------------------\n"
              . strip_tags(str_replace(['<br>', '<p>', '</p>', '</div>', '3>', '</h2>'], "\n", $htmlBody)) . "\n";

    if (!empty($attachments)) {
        foreach ($attachments as $att) {
            $logEntry .= "--- ATTACHMENT: " . ($att['name'] ?? 'attachment') . " ---\n"
                      . ($att['content'] ?? '') . "\n"
                      . "--------------------------------------------------------\n";
        }
    }

    $logEntry .= "========================================================\n\n";

    @file_put_contents(DEV_MAIL_LOG, $logEntry, FILE_APPEND);
}

/**
 * Standard branded HTML email template for Agrenza.
 */
function mail_template(string $title, string $bodyHtml): string {
    $safeTitle = htmlspecialchars($title);
    return <<<HTML
    <div style="font-family: Arial, -apple-system, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #1b3821; padding: 22px 28px; text-align: left;">
            <span style="color: #ffffff; font-weight: 800; font-size: 22px; letter-spacing: -0.5px;">Agren<span style="color: #4c7a3d;">za</span></span>
            <span style="color: #9cb593; font-size: 13px; display: block; margin-top: 4px;">Soil to Doorstep — Fresh Produce Marketplace</span>
        </div>
        <div style="padding: 28px; color: #374151; font-size: 15px; line-height: 1.65;">
            <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px; font-weight: 700;">{$safeTitle}</h2>
            <div>{$bodyHtml}</div>
        </div>
        <div style="background: #f9fafb; padding: 16px 28px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">This is an automated security message from Agrenza.</p>
            <p style="margin: 4px 0 0;">Please do not share this verification code or your password with anyone.</p>
        </div>
    </div>
    HTML;
}

/**
 * Sends verification email to buyer with their auto-generated login password and attachment.
 */
function send_buyer_verification_mail(string $email, string $name, string $autoPassword, string $token, string $otpCode): bool {
    $subject = 'Verify your Agrenza account — Login password attached 🔐';
    $frontend = get_frontend_base_url();
    $verifyUrl = "{$frontend}/auth/email-verify?token=" . urlencode($token) . "&email=" . urlencode($email);

    $bodyHtml = <<<HTML
    <p>Hi <strong>{$name}</strong>,</p>
    <p>Welcome to Agrenza! To activate your buyer account, please verify your Gmail address.</p>
    
    <div style="background: #f0fdf4; border: 1.5px dashed #16a34a; border-radius: 8px; padding: 18px; margin: 20px 0; text-align: center;">
        <span style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #166534; font-weight: 600; display: block; margin-bottom: 6px;">Your 6-Digit Email Verification Code:</span>
        <span style="font-family: monospace; font-size: 32px; font-weight: 800; color: #15803d; letter-spacing: 6px;">{$otpCode}</span>
    </div>

    <div style="text-align: center; margin: 24px 0;">
        <a href="{$verifyUrl}" style="background: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-weight: 600; font-size: 15px; display: inline-block;">
            Verify Email Instantly
        </a>
    </div>

    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <span style="font-size: 14px; color: #92400e; font-weight: 700; display: block; margin-bottom: 4px;">🔑 Your Auto-Generated Login Password:</span>
        <div style="font-family: monospace; font-size: 20px; font-weight: 700; color: #78350f; background: #ffffff; padding: 8px 12px; border-radius: 6px; display: inline-block; border: 1px solid #fcd34d; margin-top: 6px;">
            {$autoPassword}
        </div>
        <p style="margin: 8px 0 0; font-size: 12px; color: #b45309;">
            Use your email (<strong>{$email}</strong>) and this password to log in once verified.
        </p>
    </div>

    <div style="background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; margin: 16px 0; font-size: 12px; color: #4b5563;">
        📎 <strong>Attachment:</strong> Your account credentials are also attached to this email as <code>agrenza_login_credentials.txt</code> for safe offline keeping.
    </div>

    <p style="font-size: 13px; color: #6b7280;">This verification code will expire in 24 hours.</p>
    HTML;

    $attachmentContent = <<<TXT
======================================================
           AGRENZA BUYER ACCOUNT CREDENTIALS
======================================================
Account Type     : Buyer
Full Name        : {$name}
Login Email      : {$email}
Login Password   : {$autoPassword}
Verification OTP : {$otpCode}
------------------------------------------------------
Verification Link:
{$verifyUrl}
------------------------------------------------------
Important:
Keep this document safe for your personal records.
Use your email and password to log in to Agrenza.
======================================================
TXT;

    $attachments = [
        [
            'name' => 'agrenza_login_credentials.txt',
            'type' => 'text/plain',
            'content' => $attachmentContent
        ]
    ];

    return send_mail($email, $name, $subject, mail_template('Welcome to Agrenza!', $bodyHtml), $attachments);
}

/**
 * Sends verification email to farmer with auto-generated/assigned password and attachment.
 */
function send_farmer_verification_mail(string $email, string $name, string $password, string $token, string $otpCode): bool {
    $subject = 'Verify your Agrenza Farmer Registration — Login password attached 🌾';
    $frontend = get_frontend_base_url();
    $verifyUrl = "{$frontend}/auth/email-verify?token=" . urlencode($token) . "&email=" . urlencode($email);

    $bodyHtml = <<<HTML
    <p>Hi <strong>{$name}</strong>,</p>
    <p>Thank you for registering as a farmer partner with Agrenza. Please confirm your Gmail address to activate your account and submit your application for admin review.</p>
    
    <div style="background: #f0fdf4; border: 1.5px dashed #16a34a; border-radius: 8px; padding: 18px; margin: 20px 0; text-align: center;">
        <span style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #166534; font-weight: 600; display: block; margin-bottom: 6px;">Your 6-Digit Email Verification Code:</span>
        <span style="font-family: monospace; font-size: 32px; font-weight: 800; color: #15803d; letter-spacing: 6px;">{$otpCode}</span>
    </div>

    <div style="text-align: center; margin: 24px 0;">
        <a href="{$verifyUrl}" style="background: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-weight: 600; font-size: 15px; display: inline-block;">
            Verify Farmer Email
        </a>
    </div>

    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <span style="font-size: 14px; color: #92400e; font-weight: 700; display: block; margin-bottom: 4px;">🔑 Your Auto-Generated Login Password:</span>
        <div style="font-family: monospace; font-size: 20px; font-weight: 700; color: #78350f; background: #ffffff; padding: 8px 12px; border-radius: 6px; display: inline-block; border: 1px solid #fcd34d; margin-top: 6px;">
            {$password}
        </div>
        <p style="margin: 8px 0 0; font-size: 12px; color: #b45309;">
            Keep this password safe! Use your email (<strong>{$email}</strong>) and this password to log in once verified and approved.
        </p>
    </div>

    <div style="background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; margin: 16px 0; font-size: 12px; color: #4b5563;">
        📎 <strong>Attachment:</strong> Your account credentials are also attached to this email as <code>agrenza_login_credentials.txt</code> for safe offline keeping.
    </div>

    <p style="font-size: 13px; color: #6b7280;">
        Once verified, your Aadhaar and contact details will be reviewed by our admin team before final activation.
    </p>
    HTML;

    $attachmentContent = <<<TXT
======================================================
           AGRENZA FARMER ACCOUNT CREDENTIALS
======================================================
Account Type     : Farmer Partner
Full Name        : {$name}
Login Email      : {$email}
Login Password   : {$password}
Verification OTP : {$otpCode}
------------------------------------------------------
Verification Link:
{$verifyUrl}
------------------------------------------------------
Important:
Keep this document safe for your personal records.
Once your email is verified, admin will review your
farmer credentials and activate your produce sales portal.
======================================================
TXT;

    $attachments = [
        [
            'name' => 'agrenza_login_credentials.txt',
            'type' => 'text/plain',
            'content' => $attachmentContent
        ]
    ];

    return send_mail($email, $name, $subject, mail_template('Farmer Email Verification & Login Password', $bodyHtml), $attachments);
}

/**
 * Sends farmer approval or rejection notification to BOTH the Farmer and the Admin Gmail.
 */
function send_farmer_decision_notifications(array $farmer, string $action, string $remark = ''): void {
    $farmerEmail = $farmer['email'] ?? '';
    $farmerName = $farmer['name'] ?? 'Farmer';
    $farmerMobile = $farmer['mobile'] ?? '';
    $isApproved = ($action === 'approve');
    $frontend = get_frontend_base_url();

    // 1. Email to Farmer
    if ($farmerEmail !== '') {
        if ($isApproved) {
            $farmerSubject = 'Congratulations! Your Agrenza Farmer Account has been Approved ✅';
            $farmerBody = <<<HTML
            <p>Hi <strong>{$farmerName}</strong>,</p>
            <p style="color: #15803d; font-size: 16px; font-weight: 600;">
                Great news — your farmer partner application on Agrenza has been APPROVED by the admin!
            </p>
            <p>You can now log in to your Farmer Dashboard to list your fresh harvest, manage stock, and sell directly to buyers at fair market rates.</p>
            <div style="text-align: center; margin: 24px 0;">
                <a href="{$frontend}/auth/login" style="background: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-weight: 600; font-size: 15px; display: inline-block;">
                    Log In to Farmer Portal
                </a>
            </div>
            HTML;
        } else {
            $farmerSubject = 'Update regarding your Agrenza Farmer Application ✕';
            $reasonHtml = ($remark !== '') ? "<div style='background:#fef2f2; border:1px solid #fecaca; padding:12px; border-radius:6px; margin:14px 0;'><strong style='color:#991b1b;'>Reason for rejection:</strong> <span style='color:#b91c1c;'>" . htmlspecialchars($remark) . "</span></div>" : "";
            $farmerBody = <<<HTML
            <p>Hi <strong>{$farmerName}</strong>,</p>
            <p style="color: #b91c1c; font-size: 15px;">
                We regret to inform you that your farmer account application on Agrenza was not approved at this time.
            </p>
            {$reasonHtml}
            <p>If you believe this was in error or you have updated Aadhaar verification documents, please feel free to reach out to Agrenza support.</p>
            HTML;
        }
        send_mail($farmerEmail, $farmerName, $farmerSubject, mail_template($isApproved ? 'Account Approved' : 'Application Status Update', $farmerBody));
    }

    // 2. Notification Email to Admin Gmail
    $adminEmail = (defined('ADMIN_NOTIFY_EMAIL') && ADMIN_NOTIFY_EMAIL !== '') ? ADMIN_NOTIFY_EMAIL : SMTP_USER;
    if ($adminEmail !== '' && $adminEmail !== 'youraddress@gmail.com') {
        $statusText = $isApproved ? 'APPROVED' : 'REJECTED';
        $adminSubject = "[Admin Alert] Farmer Application {$statusText}: {$farmerName}";
        $adminBody = <<<HTML
        <p>This is an automated notification regarding an admin action on a farmer application:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
            <tr><td style="padding: 6px 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold; width: 140px;">Farmer Name:</td><td style="padding: 6px 10px; border: 1px solid #e5e7eb;">{$farmerName}</td></tr>
            <tr><td style="padding: 6px 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Mobile:</td><td style="padding: 6px 10px; border: 1px solid #e5e7eb;">{$farmerMobile}</td></tr>
            <tr><td style="padding: 6px 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Email:</td><td style="padding: 6px 10px; border: 1px solid #e5e7eb;">{$farmerEmail}</td></tr>
            <tr><td style="padding: 6px 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Decision:</td><td style="padding: 6px 10px; border: 1px solid #e5e7eb; font-weight: bold; color: " . ($isApproved ? '#16a34a' : '#dc2626') . ";">{$statusText}</td></tr>
            <tr><td style="padding: 6px 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Admin Remark:</td><td style="padding: 6px 10px; border: 1px solid #e5e7eb;">" . htmlspecialchars($remark ?: 'None') . "</td></tr>
            <tr><td style="padding: 6px 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Timestamp:</td><td style="padding: 6px 10px; border: 1px solid #e5e7eb;">" . date('Y-m-d H:i:s') . "</td></tr>
        </table>
        HTML;
        send_mail($adminEmail, 'Agrenza Admin', $adminSubject, mail_template('Admin Alert: Farmer Application ' . $statusText, $adminBody));
    }
}
