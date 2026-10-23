<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/../helpers/mailer.php';

$testTo = $_GET['to'] ?? 'ravananm913@gmail.com';
$testName = $_GET['name'] ?? 'Agrenza Tester';

$res = send_mail(
    $testTo,
    $testName,
    'Agrenza Live Test Mail — ' . date('H:i:s'),
    mail_template('Cloud Test Email', '<p>This is a live test email sent from Agrenza system to verify real delivery.</p><p>Timestamp: <strong>' . date('Y-m-d H:i:s') . '</strong></p>')
);

json_ok([
    'sent' => $res,
    'to' => $testTo,
    'time' => date('Y-m-d H:i:s'),
    'frontend_url' => get_frontend_base_url(),
]);
