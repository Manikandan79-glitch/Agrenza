<?php
require_once __DIR__ . '/../helpers/functions.php';
session_unset();
session_destroy();
session_start();
set_message('You have been logged out successfully.', 'success');
redirect(BASE_URL . 'index.php');
