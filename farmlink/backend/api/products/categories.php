<?php
/** GET /backend/api/products/categories.php */
require_once __DIR__ . '/../_bootstrap.php';

$result = mysqli_query($conn, "SELECT DISTINCT id, name FROM categories GROUP BY name ORDER BY name ASC");
$categories = [];
while ($row = mysqli_fetch_assoc($result)) {
    $categories[] = [
        'id' => (int) $row['id'],
        'name' => $row['name']
    ];
}
json_ok(['categories' => $categories]);
