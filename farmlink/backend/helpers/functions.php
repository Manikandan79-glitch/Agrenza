<?php
/**
 * FarmLink — shared helper functions
 * (This file was missing from the project; reconstructed from the
 * function calls used across backend/api/**.php)
 */

/** Trim + strip tags from user input. */
function clean($value) {
    return trim(strip_tags((string) $value));
}

/** Is there a logged-in user in the session? */
function is_logged_in(): bool {
    return isset($_SESSION['user_id']);
}

/** Role of the currently logged-in user, or null. */
function current_role(): ?string {
    return $_SESSION['role'] ?? null;
}

/** Fetch the full row for the currently logged-in user. */
function get_current_user_data($conn) {
    if (!is_logged_in()) return null;

    $stmt = mysqli_prepare($conn, "SELECT * FROM users WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "i", $_SESSION['user_id']);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    return $result ? $result->fetch_assoc() : null;
}

/**
 * Validate + move an uploaded product image into UPLOAD_DIR.
 * Returns the stored filename on success, or false on invalid/missing file.
 */
function upload_product_image(string $fieldName) {
    if (!isset($_FILES[$fieldName]) || $_FILES[$fieldName]['error'] !== UPLOAD_ERR_OK) {
        return false;
    }

    $file = $_FILES[$fieldName];
    $allowed = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'gif' => 'image/gif'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!array_key_exists($ext, $allowed)) return false;

    // Check MIME type using finfo if available, otherwise getimagesize
    $mime = '';
    if (function_exists('finfo_open')) {
        $finfo = @finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $mime = (string) @finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
        }
    }
    if (empty($mime) && function_exists('getimagesize')) {
        $imgInfo = @getimagesize($file['tmp_name']);
        if ($imgInfo && isset($imgInfo['mime'])) {
            $mime = $imgInfo['mime'];
        }
    }

    if (!empty($mime) && !in_array($mime, array_values($allowed), true)) {
        // Only reject if mime was successfully detected and not in allowed list
        return false;
    }

    if (!is_dir(UPLOAD_DIR)) {
        @mkdir(UPLOAD_DIR, 0775, true);
    }

    $filename = uniqid('product_', true) . '.' . $ext;
    $destination = UPLOAD_DIR . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        return false;
    }

    return $filename;
}
