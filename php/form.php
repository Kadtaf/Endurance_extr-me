<?php
session_start();
header('Content-Type: application/json');

// Config
define('DB_HOST', 'endurance_extreme');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'endurance_extreme');
define('ENVIRONMENT', 'development'); // À passer à 'production' en prod

// Fonction de réponse
function jsonResponse($success, $message, $code = 200) {
    http_response_code($code);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

// Validation CSRF
if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    jsonResponse(false, 'Token CSRF invalide', 403);
}

// Nettoyage
$prenom = htmlspecialchars($_POST['prenom'] ?? '', ENT_QUOTES, 'UTF-8');
$nom = htmlspecialchars($_POST['nom'] ?? '', ENT_QUOTES, 'UTF-8');
$email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);

// Validation
if (empty($prenom) || strlen($prenom) > 50) jsonResponse(false, 'Prénom invalide', 400);
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