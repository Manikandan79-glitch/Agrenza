<?php
/**
 * FarmLink — Email Authenticity, Original vs Fake & Duplicate Identifier
 * ------------------------------------------------------------------------
 * Identifies whether an email entered by a buyer or farmer is:
 * 1. "original" (Authentic personal/business email with verified MX records)
 * 2. "disposable" / "fake" (Temporary/throwaway fake email service)
 * 3. "duplicate" (Already registered in FarmLink)
 * 4. "invalid_format" / "invalid_gmail" (Malformed address or illegal characters)
 * 5. "invalid_domain" (Domain doesn't exist or has no mail exchange servers)
 */

const DISPOSABLE_EMAIL_DOMAINS = [
    'mailinator.com',
    'tempmail.com',
    'tempmailo.com',
    '10minutemail.com',
    '10minemail.com',
    'guerrillamail.com',
    'guerrillamailblock.com',
    'guerrillamail.net',
    'guerrillamail.org',
    'yopmail.com',
    'yopmail.fr',
    'yopmail.net',
    'trashmail.com',
    'sharklasers.com',
    'getnada.com',
    'throwawaymail.com',
    'throwawaymail.org',
    'dispostable.com',
    'temp-mail.org',
    'temp-mail.io',
    'fakeinbox.com',
    'fakemailgenerator.com',
    'crazymailing.com',
    'maildrop.cc',
    'mailpoof.com',
    'getairmail.com',
    'inboxkitten.com',
    'mohmal.com',
    'generator.email',
    'emailondeck.com',
    'mytemp.email',
    'mytempmail.com',
    'burnermail.io',
    'dropmail.me',
    'zillamail.com',
    'nada.ltd',
    'getairmail.com',
    'tmail.ws',
    'trashmail.net',
    'tempinbox.com',
];

/**
 * Identifies and validates whether an email is Original, Fake/Disposable, Duplicate, or Invalid.
 *
 * @param string $email
 * @param mysqli $conn
 * @param int|null $excludeUserId
 * @return array
 */
function validate_email_authenticity(string $email, mysqli $conn, ?int $excludeUserId = null, ?string $role = null): array {
    $email = strtolower(trim($email));

    if ($email === '') {
        return [
            'ok' => false,
            'status' => 'invalid_format',
            'is_original' => false,
            'is_duplicate' => false,
            'provider' => null,
            'error' => 'Email address is required.',
            'message' => 'Email address is required.'
        ];
    }

    // 1. Basic RFC Syntax check
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return [
            'ok' => false,
            'status' => 'invalid_format',
            'is_original' => false,
            'is_duplicate' => false,
            'provider' => null,
            'error' => 'Invalid email format (e.g. yourname@gmail.com).',
            'message' => 'Please enter a valid email format.'
        ];
    }

    $parts = explode('@', $email);
    if (count($parts) !== 2) {
        return [
            'ok' => false,
            'status' => 'invalid_format',
            'is_original' => false,
            'is_duplicate' => false,
            'provider' => null,
            'error' => 'Invalid email structure.',
            'message' => 'Invalid email structure.'
        ];
    }

    $username = trim($parts[0]);
    $domain = strtolower(trim($parts[1]));

    // 2. Identify Email Service Provider
    $provider = 'Custom Domain';
    if ($domain === 'gmail.com' || $domain === 'googlemail.com') {
        $provider = 'Gmail';
    } elseif (in_array($domain, ['yahoo.com', 'yahoo.co.in', 'ymail.com'], true)) {
        $provider = 'Yahoo Mail';
    } elseif (in_array($domain, ['outlook.com', 'hotmail.com', 'live.com'], true)) {
        $provider = 'Microsoft Outlook';
    } elseif ($domain === 'icloud.com') {
        $provider = 'Apple iCloud';
    }

    // 3. Gmail-Specific validation (if Gmail, check username rules)
    if ($provider === 'Gmail') {
        // Gmail usernames: 6-30 characters, letters, numbers, dots. No consecutive dots.
        $cleanUser = str_replace('.', '', $username);
        if (strlen($cleanUser) < 6 || strlen($cleanUser) > 30) {
            return [
                'ok' => false,
                'status' => 'invalid_gmail',
                'is_original' => false,
                'is_duplicate' => false,
                'provider' => 'Gmail',
                'error' => 'Gmail usernames must be between 6 and 30 characters.',
                'message' => 'Gmail username must be 6–30 characters long.'
            ];
        }
        if (strpos($username, '..') !== false) {
            return [
                'ok' => false,
                'status' => 'invalid_gmail',
                'is_original' => false,
                'is_duplicate' => false,
                'provider' => 'Gmail',
                'error' => 'Gmail does not allow consecutive dots (..).',
                'message' => 'Consecutive dots (..) are not valid in Gmail.'
            ];
        }
    }

    // 4. Check if domain is in Disposable / Fake temporary email blacklist
    if (in_array($domain, DISPOSABLE_EMAIL_DOMAINS, true)) {
        return [
            'ok' => false,
            'status' => 'disposable',
            'is_original' => false,
            'is_duplicate' => false,
            'provider' => 'Disposable Fake Service',
            'error' => "Fake / temporary email detected (@{$domain}). Please use an authentic personal Gmail or email.",
            'message' => 'Fake / disposable email detected. Please use your real personal Gmail.'
        ];
    }

    // 5. Check domain MX / DNS records (ensures domain is real and can receive email)
    if (function_exists('checkdnsrr')) {
        $hasMx = @checkdnsrr($domain, 'MX');
        $hasA  = @checkdnsrr($domain, 'A');
        if (!$hasMx && !$hasA) {
            return [
                'ok' => false,
                'status' => 'invalid_domain',
                'is_original' => false,
                'is_duplicate' => false,
                'provider' => null,
                'error' => "The email domain '@{$domain}' is not active or cannot receive emails.",
                'message' => "The domain '@{$domain}' does not have active mail servers."
            ];
        }
    }

    // 6. Check Duplicate in database (users table)
    if ($role !== null) {
        $sql = "SELECT id, role, email_verified FROM users WHERE LOWER(email) = LOWER(?) AND role = ?";
        if ($excludeUserId !== null) {
            $sql .= " AND id != " . (int)$excludeUserId;
        }
        $sql .= " LIMIT 1";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ss", $email, $role);
    } else {
        $sql = "SELECT id, role, email_verified FROM users WHERE LOWER(email) = LOWER(?)";
        if ($excludeUserId !== null) {
            $sql .= " AND id != " . (int)$excludeUserId;
        }
        $sql .= " LIMIT 1";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $email);
    }

    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);

    if ($res && $res->num_rows > 0) {
        $row = $res->fetch_assoc();
        return [
            'ok' => false,
            'status' => 'duplicate',
            'is_original' => true,
            'is_duplicate' => true,
            'provider' => $provider,
            'error' => 'This email is already registered for this role. Please log in.',
            'message' => 'This email is already registered for this role. Please log in instead.'
        ];
    }

    // 7. Verified as Original & Authentic Email
    return [
        'ok' => true,
        'status' => 'original',
        'is_original' => true,
        'is_duplicate' => false,
        'provider' => $provider,
        'error' => null,
        'message' => "✓ Authentic {$provider} address — ready for verification"
    ];
}

/**
 * Validates mobile number uniqueness.
 */
function validate_mobile_uniqueness(string $mobile, mysqli $conn, ?int $excludeUserId = null, ?string $role = null): array {
    $mobile = trim($mobile);
    if (!preg_match('/^[0-9]{10}$/', $mobile)) {
        return ['ok' => false, 'is_duplicate' => false, 'error' => 'Enter a valid 10-digit mobile number.'];
    }

    if ($role !== null) {
        $sql = "SELECT id FROM users WHERE mobile = ? AND role = ?";
        if ($excludeUserId !== null) {
            $sql .= " AND id != " . (int)$excludeUserId;
        }
        $sql .= " LIMIT 1";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ss", $mobile, $role);
    } else {
        $sql = "SELECT id FROM users WHERE mobile = ?";
        if ($excludeUserId !== null) {
            $sql .= " AND id != " . (int)$excludeUserId;
        }
        $sql .= " LIMIT 1";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $mobile);
    }

    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);

    if ($res && $res->num_rows > 0) {
        return [
            'ok' => false,
            'is_duplicate' => true,
            'error' => 'This mobile number is already registered for this role. Please log in.'
        ];
    }

    return ['ok' => true, 'is_duplicate' => false, 'error' => null];
}
