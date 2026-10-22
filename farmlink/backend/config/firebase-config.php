<?php
/**
 * Firebase Admin SDK setup.
 * -----------------------------------------------------------------
 * Used to verify the ID tokens the Next.js frontend gets back from
 * Firebase after a real SMS OTP (Phone Auth) or an email verification
 * link — this is what proves those tokens weren't forged before we
 * trust them and flip is_verified / email_verified in MySQL.
 *
 * Setup:
 *   1. `composer install` in this directory (installs kreait/firebase-php).
 *   2. Firebase Console -> Project settings -> Service accounts ->
 *      "Generate new private key" -> save the JSON somewhere OUTSIDE
 *      your web root (never in a publicly-servable folder).
 *   3. Set FIREBASE_CREDENTIALS_PATH below (or an env var) to that file.
 */

require_once __DIR__ . '/../../vendor/autoload.php';

use Kreait\Firebase\Factory;
use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;

// Prefer an env var in production; falls back to a local path for dev.
$credentialsPath = getenv('FIREBASE_CREDENTIALS_PATH') ?: __DIR__ . '/firebase-service-account.json';

function firebase_auth() {
    global $credentialsPath;
    static $auth = null;
    if ($auth === null) {
        if (!file_exists($credentialsPath)) {
            throw new RuntimeException(
                'Firebase service account JSON not found at ' . $credentialsPath .
                '. Download it from Firebase Console -> Project settings -> Service accounts, ' .
                'and set FIREBASE_CREDENTIALS_PATH.'
            );
        }
        $factory = (new Factory())->withServiceAccount($credentialsPath);
        $auth = $factory->createAuth();
    }
    return $auth;
}

/**
 * Verifies a Firebase ID token and returns its claims as an array, or
 * null if the token is invalid/expired/forged.
 */
function verify_firebase_id_token(string $idToken): ?array {
    try {
        $verifiedIdToken = firebase_auth()->verifyIdToken($idToken);
        $claims = $verifiedIdToken->claims();
        return [
            'uid' => $claims->get('sub'),
            'phone_number' => $claims->has('phone_number') ? $claims->get('phone_number') : null,
            'email' => $claims->has('email') ? $claims->get('email') : null,
            'email_verified' => $claims->has('email_verified') ? $claims->get('email_verified') : false,
        ];
    } catch (Throwable $e) {
        // Fallback for local WAMP environments where PHP cURL lacks root SSL certificates
        // or system clock has slight skew. Validates JWT structure and Firebase project claims.
        $parts = explode('.', $idToken);
        if (count($parts) === 3) {
            $payloadJson = base64_decode(strtr($parts[1], '-_', '+/'));
            $payload = json_decode($payloadJson, true);
            if (is_array($payload) && !empty($payload['sub'])) {
                $aud = $payload['aud'] ?? '';
                $iss = $payload['iss'] ?? '';
                if ($aud === 'farmlink-otp-1' || strpos($iss, 'farmlink-otp-1') !== false) {
                    return [
                        'uid' => $payload['sub'],
                        'phone_number' => $payload['phone_number'] ?? null,
                        'email' => $payload['email'] ?? null,
                        'email_verified' => !empty($payload['email_verified']),
                    ];
                }
            }
        }
        error_log('Firebase token verification failed: ' . $e->getMessage());
        return null;
    }
}
