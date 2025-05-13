<?php
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');
require_once __DIR__ . '/../config/database.php'; // Adaptez le chemin selon votre structure
session_start();
header('Content-Type: application/json');
header('X-Frame-Options: SAMEORIGIN');
header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com");

// Validation CSRF
if (!isset($_POST['csrf_token'])) {
    jsonResponse(false, 'Token CSRF manquant', 403);
}

if ($_POST['csrf_token'] !== ($_SESSION['csrf_token'] ?? '') || time() > ($_SESSION['csrf_token_exp'] ?? 0)) {
    jsonResponse(false, 'Token CSRF expiré ou invalide', 403);
}


// Fonction de réponse
function jsonResponse($success, $message, $httpCode = 200, $errorCode = null) {
    http_response_code($httpCode);
    $response = [
        'success' => $success,
        'message' => $message
    ];
    if ($errorCode !== null) {
        $response['code'] = $errorCode;
    }
    echo json_encode($response);
    exit;
}


// Validation CSRF
if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== ($_SESSION['csrf_token'] ?? '') || time() > ($_SESSION['csrf_token_exp'] ?? 0)) {
    jsonResponse(false, 'Token CSRF expiré ou invalide', 403);
}


// Nettoyage
$prenom = htmlspecialchars($_POST['prenom'] ?? '', ENT_QUOTES, 'UTF-8');
$nom = htmlspecialchars($_POST['nom'] ?? '', ENT_QUOTES, 'UTF-8');
$email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);

// Validation
if (empty($prenom) || strlen($prenom) > 50) jsonResponse(false, 'Prénom invalide', 400);
if (empty($nom) || strlen($nom) > 50) jsonResponse(false, 'Nom invalide', 400);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) jsonResponse(false, 'Email invalide', 400);

try {
    $pdo = new PDO(
        'mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8',
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Vérification email existant
    $stmt = $pdo->prepare("SELECT 1 FROM subscribers WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) jsonResponse(false, 'Email déjà inscrit', 409);

    // Insertion
    $stmt = $pdo->prepare("INSERT INTO subscribers (prenom, nom, email) VALUES (?, ?, ?)");
    $stmt->execute([$prenom, $nom, $email]);
    
    jsonResponse(true, 'Inscription réussie');

} catch (PDOException $e) {
    error_log('DB Error: '.$e->getMessage());
    jsonResponse(false, 'Erreur serveur', 500);
}