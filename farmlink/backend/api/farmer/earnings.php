<?php
/** GET /backend/api/farmer/earnings.php */
require_once __DIR__ . '/../_bootstrap.php';
require_json_role('farmer');

$farmerId = (int) $_SESSION['user_id'];

// ── Date range filter ──────────────────────────────────────────────────────
$fromDate = $_GET['from'] ?? null;
$toDate   = $_GET['to']   ?? null;

function valid_date(?string $d): bool {
    if (!$d) return false;
    $dt = DateTime::createFromFormat('Y-m-d', $d);
    return $dt && $dt->format('Y-m-d') === $d;
}

$hasRange  = valid_date($fromDate) && valid_date($toDate);
$dateWhere = $hasRange
    ? "AND DATE(o.created_at) BETWEEN '" . mysqli_real_escape_string($conn, $fromDate) . "' AND '" . mysqli_real_escape_string($conn, $toDate) . "'"
    : "";

// ── Totals ─────────────────────────────────────────────────────────────────
$total = (float) mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT COALESCE(SUM(oi.subtotal),0) t
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE oi.farmer_id = $farmerId AND oi.item_status = 'delivered' $dateWhere"
))['t'];

$pendingAmount = (float) mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT COALESCE(SUM(oi.subtotal),0) t
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE oi.farmer_id = $farmerId AND oi.item_status IN ('pending','confirmed','shipped') $dateWhere"
))['t'];

// Today's earnings (always today regardless of filter)
$todayEarned = (float) mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT COALESCE(SUM(oi.subtotal),0) t
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE oi.farmer_id = $farmerId AND oi.item_status = 'delivered'
       AND DATE(o.created_at) = CURDATE()"
))['t'];

// Order count
$orderCount = (int) mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT COUNT(DISTINCT oi.order_id) c
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE oi.farmer_id = $farmerId AND oi.item_status = 'delivered' $dateWhere"
))['c'];

// ── History ────────────────────────────────────────────────────────────────
$historyRes = mysqli_query($conn,
    "SELECT oi.id, oi.quantity_kg, oi.subtotal, oi.item_status,
            o.created_at AS order_date, p.name AS product_name
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN products p ON p.id = oi.product_id
     WHERE oi.farmer_id = $farmerId AND oi.item_status = 'delivered' $dateWhere
     ORDER BY o.created_at DESC"
);
$history = [];
while ($row = mysqli_fetch_assoc($historyRes)) {
    $history[] = [
        'date'         => $row['order_date'],
        'product_name' => $row['product_name'],
        'qty'          => (float) $row['quantity_kg'],
        'amount'       => (float) $row['subtotal'],
        'status'       => $row['item_status'],
    ];
}

json_ok([
    'total_earned'   => $total,
    'pending_amount' => $pendingAmount,
    'today_earned'   => $todayEarned,
    'order_count'    => $orderCount,
    'history'        => $history,
    'filter_from'    => $hasRange ? $fromDate : null,
    'filter_to'      => $hasRange ? $toDate   : null,
]);
