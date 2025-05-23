<?php
header("Access-Control-Allow-Origin: http://endurance-extrem-vtt.local");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
session_start();
header('Content-Type: text/plain');

if (empty($_SESSION['csrf_token']) || time() > ($_SESSION['csrf_token_exp'] ?? 0)) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    $_SESSION['csrf_token_exp'] = time() + 900; // 15 minutes
}

echo $_SESSION['csrf_token'];

