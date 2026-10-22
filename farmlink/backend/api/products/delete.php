<?php
/** POST /backend/api/products/delete.php   Body: { id } */
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_fail('POST required.', 405);
require_json_role('farmer');

$body = json_body();
$id = (int) ($body['id'] ?? 0);
$farmerId = (int) $_SESSION['user_id'];

$stmt = mysqli_prepare($conn, "DELETE FROM products WHERE id = ? AND farmer_id = ?");
mysqli_stmt_bind_param($stmt, "ii", $id, $farmerId);
mysqli_stmt_execute($stmt);

if (mysqli_stmt_affected_rows($stmt) === 0) json_fail('Product not found.', 404);

json_ok(['deleted' => true]);
