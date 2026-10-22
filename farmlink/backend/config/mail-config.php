<?php
/**
 * FarmLink — Mail & SMTP Configuration
 * -------------------------------------------------------------
 * Gmail SMTP credentials configured via setup-email.php
 * Configured on: 2026-09-23
 */

if (!defined('SMTP_HOST')) define('SMTP_HOST', 'smtp.gmail.com');
if (!defined('SMTP_PORT')) define('SMTP_PORT', 465);

// Gmail SMTP Credentials (Verified Working ✅)
if (!defined('SMTP_USER')) define('SMTP_USER', 'ravananm913@gmail.com');
if (!defined('SMTP_PASS')) define('SMTP_PASS', 'navuecckbdmzvuca');

if (!defined('SMTP_FROM_NAME')) define('SMTP_FROM_NAME', 'Agrenza');

// Admin email where notifications will be sent:
if (!defined('ADMIN_NOTIFY_EMAIL')) define('ADMIN_NOTIFY_EMAIL', 'ravananm913@gmail.com');

// Local mail debug log
if (!defined('DEV_MAIL_LOG')) define('DEV_MAIL_LOG', __DIR__ . '/../logs/mail_log.txt');
