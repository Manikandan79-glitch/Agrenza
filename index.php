<?php
/**
 * Agrenza Cloud API — Root Gateway & Health Status Page
 * Hosted on Render.com Web Services
 */
$tidbConnected = false;
$tidbError = null;

try {
    require_once __DIR__ . '/farmlink/backend/config/db.php';
    if (isset($conn) && $conn instanceof mysqli && @mysqli_ping($conn)) {
        $tidbConnected = true;
    }
} catch (Throwable $e) {
    $tidbError = $e->getMessage();
}

$frontendUrl = 'https://agrenza.vercel.app';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agrenza Cloud API — System Status</title>
    <link rel="icon" href="https://agrenza.vercel.app/agrenza-logo-small.jpg">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 16px;
            max-width: 620px;
            width: 100%;
            padding: 36px 32px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
            text-align: center;
        }
        .brand {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.5px;
            margin-bottom: 4px;
        }
        .brand span { color: #4ade80; }
        .tagline {
            color: #94a3b8;
            font-size: 14px;
            margin-bottom: 24px;
        }
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #064e3b;
            border: 1px solid #059669;
            color: #34d399;
            padding: 8px 18px;
            border-radius: 9999px;
            font-size: 13.5px;
            font-weight: 600;
            margin-bottom: 26px;
        }
        .pulse {
            width: 9px;
            height: 9px;
            background: #34d399;
            border-radius: 50%;
            box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7);
            animation: pulse-green 1.8s infinite;
        }
        @keyframes pulse-green {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(52, 211, 153, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
        }
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            text-align: left;
            margin-bottom: 24px;
        }
        .grid-item {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 10px;
            padding: 12px 14px;
        }
        .grid-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            margin-bottom: 4px;
        }
        .grid-val {
            font-size: 13px;
            font-weight: 600;
            color: #e2e8f0;
        }
        .btn-primary {
            display: inline-block;
            background: #16a34a;
            color: #ffffff;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            padding: 13px 28px;
            border-radius: 10px;
            margin-bottom: 16px;
            transition: all 0.15s ease;
            box-shadow: 0 4px 6px -1px rgba(22, 163, 74, 0.3);
        }
        .btn-primary:hover {
            background: #15803d;
            transform: translateY(-1px);
        }
        .api-links {
            font-size: 12.5px;
            color: #64748b;
            line-height: 1.8;
            margin-top: 10px;
        }
        .api-links a {
            color: #38bdf8;
            text-decoration: none;
        }
        .api-links a:hover {
            text-decoration: underline;
        }
        .footer {
            margin-top: 24px;
            padding-top: 18px;
            border-top: 1px solid #334155;
            font-size: 11.5px;
            color: #64748b;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="brand">Agren<span>za</span></div>
        <div class="tagline">Soil to Doorstep — Production Cloud REST API</div>

        <div class="status-badge">
            <span class="pulse"></span>
            All Cloud API Services Operational
        </div>

        <div class="grid">
            <div class="grid-item">
                <div class="grid-label">Runtime Engine</div>
                <div class="grid-val">PHP <?= phpversion() ?> · Apache 2.4 (Docker)</div>
            </div>
            <div class="grid-item">
                <div class="grid-label">Database Tier</div>
                <div class="grid-val">
                    <?php if ($tidbConnected): ?>
                        <span style="color:#4ade80;">✓ TiDB Cloud (AWS Tokyo)</span>
                    <?php else: ?>
                        <span style="color:#f87171;">✕ <?= htmlspecialchars($tidbError ?: 'Connecting...') ?></span>
                    <?php endif; ?>
                </div>
            </div>
            <div class="grid-item">
                <div class="grid-label">Hosting Platform</div>
                <div class="grid-val">Render.com Web Services</div>
            </div>
            <div class="grid-item">
                <div class="grid-label">Frontend Origin</div>
                <div class="grid-val"><a href="<?= $frontendUrl ?>" style="color:#38bdf8;text-decoration:none;">agrenza.vercel.app</a></div>
            </div>
        </div>

        <a href="<?= $frontendUrl ?>" class="btn-primary">
            Launch Agrenza Marketplace &rarr;
        </a>

        <div class="api-links">
            <div>Quick Test API: <a href="/farmlink/backend/api/products/list.php" target="_blank">/products/list.php</a> &bull; <a href="/farmlink/backend/api/admin/farmers.php" target="_blank">/admin/farmers.php</a> &bull; <a href="/farmlink/backend/api/test-mail.php" target="_blank">/test-mail.php</a></div>
        </div>

        <div class="footer">
            <strong>BCA Final Year Project</strong> &bull; MANIKANDAN M (Reg: 23083070500112001)<br>
            Government Arts and Science College, Palkulam, Kanyakumari – 629401
        </div>
    </div>
</body>
</html>
