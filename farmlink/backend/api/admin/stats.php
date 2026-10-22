<?php
/** GET /backend/api/admin/stats.php */
require_once __DIR__ . '/../_bootstrap.php';
require_json_role('admin');

$conn = $GLOBALS['conn'];

// ── Date range filter ──────────────────────────────────────────────────────
$fromDate = $_GET['from'] ?? null;   // YYYY-MM-DD
$toDate   = $_GET['to']   ?? null;   // YYYY-MM-DD

// Validate format
function valid_date(?string $d): bool {
    if (!$d) return false;
    $dt = DateTime::createFromFormat('Y-m-d', $d);
    return $dt && $dt->format('Y-m-d') === $d;
}

$hasRange  = valid_date($fromDate) && valid_date($toDate);
$dateWhere = $hasRange
    ? "AND DATE(created_at) BETWEEN '" . mysqli_real_escape_string($conn, $fromDate) . "' AND '" . mysqli_real_escape_string($conn, $toDate) . "'"
    : "";

// ── Helpers ────────────────────────────────────────────────────────────────
$q = function($sql) use ($conn) {
    $res = mysqli_query($conn, $sql);
    if (!$res) return 0;
    $row = mysqli_fetch_assoc($res);
    return (int) ($row['c'] ?? 0);
};

$sum = function($sql) use ($conn) {
    $res = mysqli_query($conn, $sql);
    if (!$res) return 0.0;
    $row = mysqli_fetch_assoc($res);
    return (float) ($row['s'] ?? 0.0);
};

// ── Financial — respect date filter ────────────────────────────────────────
$totalIncome = $sum("SELECT COALESCE(SUM(total_amount), 0) s FROM orders WHERE status != 'cancelled' $dateWhere");
$commissionRate  = 0.05;
$platformEarnings = round($totalIncome * $commissionRate, 2);

$todayIncome = $sum("SELECT COALESCE(SUM(total_amount), 0) s FROM orders WHERE status != 'cancelled' AND DATE(created_at) = CURDATE()");

$totalOrders     = $q("SELECT COUNT(*) c FROM orders WHERE 1=1 $dateWhere");
$completedOrders = $q("SELECT COUNT(*) c FROM orders WHERE (status = 'delivered' OR status = 'completed') $dateWhere");

// ── Platform stats (not date-filtered — they are totals) ───────────────────
$sharedGmailRes = mysqli_query($conn, "
    SELECT COUNT(DISTINCT CONCAT(f.id, '_', b.id)) AS c
    FROM users f
    JOIN users b ON (
        (LOWER(f.email) = LOWER(b.email) AND f.email IS NOT NULL AND f.email != '')
        OR
        (f.mobile = b.mobile AND f.mobile IS NOT NULL AND f.mobile != '')
    )
    WHERE f.role = 'farmer' AND b.role = 'buyer'
");
$sharedGmailCount = ($sharedGmailRes && $row = mysqli_fetch_assoc($sharedGmailRes)) ? (int)$row['c'] : 0;

json_ok([
    'pending_farmers'    => $q("SELECT COUNT(*) c FROM users WHERE role='farmer' AND status='pending'"),
    'pending_products'   => $q("SELECT COUNT(*) c FROM products WHERE approval_status='pending'"),
    'pending_bulk'       => $q("SELECT COUNT(*) c FROM bulk_requests WHERE status='pending'"),
    'total_farmers'      => $q("SELECT COUNT(*) c FROM users WHERE role='farmer'"),
    'total_buyers'       => $q("SELECT COUNT(*) c FROM users WHERE role='buyer'"),
    'shared_gmail_count' => $sharedGmailCount,
    'total_products'     => $q("SELECT COUNT(*) c FROM products"),
    'approved_products'  => $q("SELECT COUNT(*) c FROM products WHERE approval_status='approved'"),
    'total_income'       => $totalIncome,
    'platform_earnings'  => $platformEarnings,
    'today_income'       => $todayIncome,
    'total_orders'       => $totalOrders,
    'completed_orders'   => $completedOrders,
    'filter_from'        => $hasRange ? $fromDate : null,
    'filter_to'          => $hasRange ? $toDate   : null,
]);
