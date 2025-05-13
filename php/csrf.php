<?php
session_start();
header('Content-Type: text/plain');

if (empty($_SESSION['csrf_token']) || time() > ($_SESSION['csrf_token_exp'] ?? 0)) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    $_SESSION['csrf_token_exp'] = time() + 900; // 15 minutes
}

echo $_SESSION['csrf_token'];