<?php
/**
 * GET /backend/api/admin/shared-emails.php
 * Returns a list of all accounts that share the SAME Gmail / Email OR same Mobile number across Farmer and Buyer roles.
 */
require_once __DIR__ . '/../_bootstrap.php';
require_json_role('admin');

// Helper to fetch rich account details for a user
function get_role_details(mysqli $conn, int $userId, string $role): ?array {
    if ($role === 'farmer') {
        $stmt = mysqli_prepare($conn, "
            SELECT u.id, u.name, u.mobile, u.email, u.status, u.aadhaar, u.admin_remark, u.created_at,
                   COUNT(DISTINCT p.id) AS total_products,
                   COALESCE(SUM(oi.subtotal), 0) AS total_sales
            FROM users u
            LEFT JOIN products p ON p.farmer_id = u.id
            LEFT JOIN order_items oi ON oi.farmer_id = u.id
            WHERE u.id = ?
            GROUP BY u.id
            LIMIT 1
        ");
        mysqli_stmt_bind_param($stmt, "i", $userId);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt)->fetch_assoc();
        if (!$res) return null;
        return [
            'id' => (int)$res['id'],
            'name' => $res['name'],
            'mobile' => $res['mobile'],
            'email' => $res['email'],
            'status' => $res['status'],
            'aadhaar' => $res['aadhaar'],
            'remark' => $res['admin_remark'],
            'joined' => $res['created_at'],
            'total_products' => (int)$res['total_products'],
            'total_sales' => (float)$res['total_sales'],
        ];
    } else {
        $stmt = mysqli_prepare($conn, "
            SELECT u.id, u.name, u.mobile, u.email, u.status, u.created_at,
                   COUNT(DISTINCT o.id) AS total_orders,
                   COALESCE(SUM(o.total_amount), 0) AS total_spent
            FROM users u
            LEFT JOIN orders o ON o.buyer_id = u.id
            WHERE u.id = ?
            GROUP BY u.id
            LIMIT 1
        ");
        mysqli_stmt_bind_param($stmt, "i", $userId);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt)->fetch_assoc();
        if (!$res) return null;
        return [
            'id' => (int)$res['id'],
            'name' => $res['name'],
            'mobile' => $res['mobile'],
            'email' => $res['email'],
            'status' => $res['status'],
            'joined' => $res['created_at'],
            'total_orders' => (int)$res['total_orders'],
            'total_spent' => (float)$res['total_spent'],
        ];
    }
}

// Find all matches between a farmer and a buyer where LOWER(email) matches OR mobile matches
$sql = "
    SELECT f.id AS farmer_id, b.id AS buyer_id,
           f.email AS f_email, b.email AS b_email,
           f.mobile AS f_mobile, b.mobile AS b_mobile
    FROM users f
    JOIN users b ON (
        (LOWER(f.email) = LOWER(b.email) AND f.email IS NOT NULL AND f.email != '')
        OR
        (f.mobile = b.mobile AND f.mobile IS NOT NULL AND f.mobile != '')
    )
    WHERE f.role = 'farmer' AND b.role = 'buyer'
    ORDER BY LEAST(f.created_at, b.created_at) DESC
";

$res = mysqli_query($conn, $sql);
$sharedList = [];
$seenPairs = [];

if ($res) {
    while ($row = mysqli_fetch_assoc($res)) {
        $farmerId = (int)$row['farmer_id'];
        $buyerId = (int)$row['buyer_id'];
        $pairKey = $farmerId . '_' . $buyerId;
        if (isset($seenPairs[$pairKey])) continue;
        $seenPairs[$pairKey] = true;

        $emailMatch = (strtolower($row['f_email'] ?? '') === strtolower($row['b_email'] ?? '')) && !empty($row['f_email']);
        $mobileMatch = (($row['f_mobile'] ?? '') === ($row['b_mobile'] ?? '')) && !empty($row['f_mobile']);

        $sharedBy = 'email';
        if ($emailMatch && $mobileMatch) {
            $sharedBy = 'both';
        } elseif ($mobileMatch) {
            $sharedBy = 'mobile';
        }

        $farmerData = get_role_details($conn, $farmerId, 'farmer');
        $buyerData = get_role_details($conn, $buyerId, 'buyer');

        if ($farmerData && $buyerData) {
            $sharedList[] = [
                'email' => $farmerData['email'] ?: $buyerData['email'] ?: 'No Email',
                'mobile' => $farmerData['mobile'] ?: $buyerData['mobile'],
                'shared_by' => $sharedBy,
                'farmer' => $farmerData,
                'buyer' => $buyerData
            ];
        }
    }
}

json_ok([
    'total_shared' => count($sharedList),
    'shared_accounts' => $sharedList
]);
