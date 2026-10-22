<?php
/** GET /backend/api/auth/me.php — returns the logged-in user, or ok:false if none. */
require_once __DIR__ . '/../_bootstrap.php';

if (!is_logged_in()) json_ok(['user' => null]);

$user = get_current_user_data($conn);
if (!$user) json_ok(['user' => null]);

json_ok(['user' => [
    'id' => $user['id'],
    'name' => $user['name'],
    'email' => $user['email'] ?? null,
    'mobile' => $user['mobile'] ?? null,
    'role' => $user['role'],
    'created_at' => $user['created_at'] ?? null,
]]);
