<?php
declare(strict_types=1);

session_start();

// Activation du log d'erreurs
ini_set('display_errors', '0');
error_reporting(E_ALL);
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Détection requête AJAX
$isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) &&
        strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

// Header JSON pour AJAX
if ($isAjax) {
    header('Content-Type: application/json');
} else {
    header('Content-Type: text/html');
}
header('X-Content-Type-Options: nosniff');

// === 1. CSRF check ===
if (
    !isset($_POST['csrf_token']) ||
    !hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'])
) {
    $message = "Token CSRF invalide.";
    if ($isAjax) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => $message]);
    } else {
        $_SESSION['newsletter_message'] = $message;
        header("Location: /index.html");
    }
    exit;
}

// === 2. Données et validation ===
$prenom = mb_substr(trim($_POST['prenom'] ?? ''), 0, 50);
$nom    = mb_substr(trim($_POST['nom'] ?? ''), 0, 50);
$email  = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);

$errors = [];

if (!preg_match('/^[\p{L}\s\-]{2,50}$/u', $prenom)) {
    $errors[] = "Prénom invalide (lettres et tirets uniquement).";
}
if (!preg_match('/^[\p{L}\s\-]{2,50}$/u', $nom)) {
    $errors[] = "Nom invalide (lettres et tirets uniquement).";
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Email invalide.";
}

// Anti-spam simple
if (isset($_SESSION['last_submission']) && (time() - $_SESSION['last_submission']) < 10) {
    $errors[] = "Veuillez patienter avant une nouvelle soumission.";
}

if (!empty($errors)) {
    http_response_code(400);
    $message = implode("\n", $errors);
    if ($isAjax) {
        echo json_encode(['success' => false, 'message' => $message]);
    } else {
        $_SESSION['newsletter_message'] = $message;
        header("Location: /index.html");
    }
    exit;
}

// === 3. Simuler l'enregistrement ===
$_SESSION['last_submission'] = time();
$message = "Merci $prenom, vous êtes bien inscrit à notre newsletter !";

if ($isAjax) {
    echo json_encode(['success' => true, 'message' => $message]);
} else {
    $_SESSION['newsletter_message'] = $message;
    header("Location: /index.html");
}
exit;
