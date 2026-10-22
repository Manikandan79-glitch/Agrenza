<?php
/**
 * FarmLink — Gmail SMTP Setup Page
 * Visit this page in your browser to configure email sending.
 * URL: http://localhost/farmlink/backend/admin/setup-email.php
 */
session_start();

$configPath = __DIR__ . '/../config/mail-config.php';
$message = '';
$messageType = '';

// Read current config
$currentUser = 'youraddress@gmail.com';
$currentPass = 'xxxxxxxxxxxxxxxx';
if (file_exists($configPath)) {
    $content = file_get_contents($configPath);
    if (preg_match("/define\('SMTP_USER',\s*'([^']+)'\)/", $content, $m)) {
        $currentUser = $m[1];
    }
    if (preg_match("/define\('SMTP_PASS',\s*'([^']+)'\)/", $content, $m)) {
        $currentPass = $m[1];
    }
}

$isConfigured = ($currentUser !== 'youraddress@gmail.com' && $currentPass !== 'xxxxxxxxxxxxxxxx');

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $gmail = trim($_POST['gmail'] ?? '');
    $appPass = trim(str_replace(' ', '', $_POST['app_password'] ?? '')); // Remove spaces from app password

    if (empty($gmail) || empty($appPass)) {
        $message = 'Please enter both Gmail address and App Password.';
        $messageType = 'error';
    } elseif (!filter_var($gmail, FILTER_VALIDATE_EMAIL)) {
        $message = 'Please enter a valid Gmail address.';
        $messageType = 'error';
    } elseif (strlen($appPass) !== 16) {
        $message = 'App Password must be exactly 16 characters (without spaces). You got ' . strlen($appPass) . ' characters.';
        $messageType = 'error';
    } else {
        $date = date('Y-m-d H:i:s');
        $newConfig = "<?php\n"
            . "/**\n"
            . " * FarmLink — Mail & SMTP Configuration\n"
            . " * -------------------------------------------------------------\n"
            . " * Gmail SMTP credentials configured via setup-email.php\n"
            . " * Configured on: {$date}\n"
            . " */\n\n"
            . "if (!defined('SMTP_HOST')) define('SMTP_HOST', 'smtp.gmail.com');\n"
            . "if (!defined('SMTP_PORT')) define('SMTP_PORT', 465);\n\n"
            . "// Gmail SMTP Credentials\n"
            . "if (!defined('SMTP_USER')) define('SMTP_USER', '{$gmail}');\n"
            . "if (!defined('SMTP_PASS')) define('SMTP_PASS', '{$appPass}');\n\n"
            . "if (!defined('SMTP_FROM_NAME')) define('SMTP_FROM_NAME', 'FarmLink');\n\n"
            . "// Admin email where notifications will be sent:\n"
            . "if (!defined('ADMIN_NOTIFY_EMAIL')) define('ADMIN_NOTIFY_EMAIL', '{$gmail}');\n\n"
            . "// Local mail debug log\n"
            . "if (!defined('DEV_MAIL_LOG')) define('DEV_MAIL_LOG', __DIR__ . '/../logs/mail_log.txt');\n";

        if (file_put_contents($configPath, $newConfig)) {
            $currentUser = $gmail;
            $currentPass = $appPass;
            $isConfigured = true;

            // Now test SMTP connection
            $testResult = testSmtpConnection($gmail, $appPass);
            if ($testResult === true) {
                // Send a real test email
                $testSent = sendTestEmail($gmail, $appPass);
                if ($testSent) {
                    $message = "✅ SUCCESS! Gmail SMTP is configured and working! A test email was sent to {$gmail}. Check your inbox!";
                    $messageType = 'success';
                } else {
                    $message = "⚠️ SMTP connected and authenticated, but test email delivery failed. The config is saved — try registering a user to test.";
                    $messageType = 'warning';
                }
            } else {
                $message = "❌ Config saved but SMTP connection failed: {$testResult}. Please check your App Password.";
                $messageType = 'error';
            }
        } else {
            $message = '❌ Failed to write config file. Check file permissions.';
            $messageType = 'error';
        }
    }
}

function testSmtpConnection(string $email, string $password) {
    $conn = @fsockopen('ssl://smtp.gmail.com', 465, $errno, $errstr, 10);
    if (!$conn) {
        return "Could not connect to smtp.gmail.com:465 — $errstr ($errno)";
    }

    stream_set_timeout($conn, 10);

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

    $readResponse(); // greeting
    $command('EHLO farmlink.local');
    $command('AUTH LOGIN');
    $command(base64_encode($email));
    $authResp = $command(base64_encode($password));

    $command('QUIT');
    fclose($conn);

    if (strpos($authResp, '235') !== false) {
        return true; // Auth OK
    }
    return "Authentication failed. Response: " . trim($authResp);
}

function sendTestEmail(string $email, string $password): bool {
    $conn = @fsockopen('ssl://smtp.gmail.com', 465, $errno, $errstr, 10);
    if (!$conn) return false;

    stream_set_timeout($conn, 10);

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

    $readResponse();
    $command('EHLO farmlink.local');
    $command('AUTH LOGIN');
    $command(base64_encode($email));
    $authResp = $command(base64_encode($password));

    if (strpos($authResp, '235') === false) {
        fclose($conn);
        return false;
    }

    $command('MAIL FROM:<' . $email . '>');
    $command('RCPT TO:<' . $email . '>');
    $command('DATA');

    $subject = 'FarmLink — Email Setup Successful! ✅';
    $body = <<<HTML
<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
    <div style="background: #1b3821; padding: 22px 28px;">
        <span style="color: #ffffff; font-weight: 800; font-size: 22px;">Farm<span style="color: #4c7a3d;">Link</span></span>
    </div>
    <div style="padding: 28px; color: #374151; font-size: 15px; line-height: 1.65;">
        <h2 style="color: #16a34a;">✅ Email Setup Successful!</h2>
        <p>Congratulations! Your FarmLink Gmail SMTP is now configured and working correctly.</p>
        <p>From now on, all verification emails (with OTP codes and login passwords) will be delivered to users' Gmail inboxes automatically.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 8px; margin: 16px 0;">
            <strong>What works now:</strong><br>
            ✅ Buyer registration verification emails<br>
            ✅ Farmer registration verification emails<br>
            ✅ Auto-generated passwords sent via email<br>
            ✅ Password attached as farmlink_login_credentials.txt<br>
            ✅ Farmer approval/rejection notifications
        </div>
        <p style="font-size: 13px; color: #9ca3af;">This is a test email sent at: {$timestamp}</p>
    </div>
</div>
HTML;
    $timestamp = date('Y-m-d H:i:s');
    $body = str_replace('{$timestamp}', $timestamp, $body);

    $headers = [
        'From: FarmLink <' . $email . '>',
        'To: ' . $email,
        'Subject: ' . $subject,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'Date: ' . date('r'),
    ];

    $msg = implode("\r\n", $headers) . "\r\n\r\n" . $body;
    fwrite($conn, $msg . "\r\n.\r\n");
    $dataResp = $readResponse();

    $command('QUIT');
    fclose($conn);

    return (strpos($dataResp, '250') !== false);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FarmLink — Gmail SMTP Setup</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, -apple-system, sans-serif; background: #f3f4f6; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); max-width: 520px; width: 100%; overflow: hidden; }
        .header { background: #1b3821; padding: 24px 28px; color: #fff; }
        .header h1 { font-size: 22px; font-weight: 800; }
        .header h1 span { color: #4c7a3d; }
        .header p { color: #9cb593; font-size: 13px; margin-top: 4px; }
        .body { padding: 28px; }
        .status { padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; font-weight: 600; }
        .status.configured { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
        .status.not-configured { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
        .msg { padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
        .msg.success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
        .msg.error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
        .msg.warning { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
        label { display: block; font-weight: 600; font-size: 14px; color: #374151; margin-bottom: 6px; margin-top: 16px; }
        input[type="email"], input[type="text"] { width: 100%; padding: 10px 14px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 15px; outline: none; transition: border 0.2s; }
        input:focus { border-color: #16a34a; }
        .help { font-size: 12px; color: #6b7280; margin-top: 4px; }
        button { width: 100%; padding: 12px; background: #16a34a; color: #fff; border: none; border-radius: 999px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 24px; }
        button:hover { background: #15803d; }
        .steps { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 20px; font-size: 13px; color: #4b5563; line-height: 1.7; }
        .steps strong { color: #111827; }
        .steps a { color: #2563eb; }
        .steps ol { padding-left: 18px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1>Farm<span>Link</span> — Email Setup</h1>
            <p>Configure Gmail SMTP to send verification emails</p>
        </div>
        <div class="body">
            <!-- Current Status -->
            <?php if ($isConfigured): ?>
                <div class="status configured">
                    ✅ SMTP is configured — Sender: <strong><?= htmlspecialchars($currentUser) ?></strong>
                </div>
            <?php else: ?>
                <div class="status not-configured">
                    ❌ SMTP is NOT configured — Emails are only saved to local log, not sent to Gmail!
                </div>
            <?php endif; ?>

            <!-- Result Message -->
            <?php if ($message): ?>
                <div class="msg <?= $messageType ?>"><?= $message ?></div>
            <?php endif; ?>

            <!-- Setup Form -->
            <form method="POST">
                <label>Your Gmail Address</label>
                <input type="email" name="gmail" value="<?= htmlspecialchars($currentUser !== 'youraddress@gmail.com' ? $currentUser : '') ?>" placeholder="e.g. ravanam913@gmail.com" required>
                <span class="help">This Gmail will be used to send all FarmLink emails (verification, passwords, notifications).</span>

                <label>Gmail App Password (16 characters)</label>
                <input type="text" name="app_password" placeholder="e.g. abcd efgh ijkl mnop" required>
                <span class="help">Generate at: <a href="https://myaccount.google.com/apppasswords" target="_blank">myaccount.google.com/apppasswords</a> (spaces will be removed automatically)</span>

                <button type="submit">💌 Save & Test Email Connection</button>
            </form>

            <!-- Instructions -->
            <div class="steps">
                <strong>How to get your Gmail App Password:</strong>
                <ol>
                    <li>Go to <a href="https://myaccount.google.com/security" target="_blank">Google Account Security</a></li>
                    <li>Turn on <strong>2-Step Verification</strong> (if not already on)</li>
                    <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank">App Passwords</a></li>
                    <li>Type app name: <strong>FarmLink</strong> → Click <strong>Create</strong></li>
                    <li>Copy the 16-character password and paste it above</li>
                </ol>
            </div>
        </div>
    </div>
</body>
</html>
