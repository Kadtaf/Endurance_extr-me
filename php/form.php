<?php
// 🔒 Sécurité : Aucun espace avant cette ligne !
declare(strict_types=1);

// 📁 Configuration des erreurs
ini_set('display_errors', '0'); // Désactivé en prod
error_reporting(E_ALL);
ini_set('log_errors', '1');
ini_set('error_log', __DIR__.'/../../logs/php_errors.log');

// 🔄 Session et headers
session_start();
header('Content-Type: application/json; charset=utf-8');
header('X-Frame-Options: SAMEORIGIN');
header("Content-Security-Policy: default-src 'self'");

// 🗃️ Connexion DB
require_once __DIR__.'/../config/database.php';

// 🛡️ Validation CSRF (version simplifiée)
if (empty($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'])) {
    http_response_code(403);
    exit(json_encode(['success' => false, 'message' => 'Token CSRF invalide']));
}

// 🧹 Nettoyage des données
$prenom = trim(htmlspecialchars($_POST['prenom'] ?? '', ENT_QUOTES, 'UTF-8'));
$nom = trim(htmlspecialchars($_POST['nom'] ?? '', ENT_QUOTES, 'UTF-8'));
$email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);

// ✅ Validation
$errors = [];
if (empty($prenom)) $errors[] = 'Prénom requis';
if (strlen($prenom) > 50) $errors[] = 'Prénom trop long';
if (empty($nom)) $errors[] = 'Nom requis';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Email invalide';

if (!empty($errors)) {
    http_response_code(400);
    exit(json_encode(['success' => false, 'message' => implode(', ', $errors)]));
}

try {
    // 🗃️ Requêtes DB
    $pdo = new PDO(
        'mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );

    // 🔍 Vérification email existant
    $stmt = $pdo->prepare("SELECT id FROM subscribers WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        exit(json_encode(['success' => false, 'message' => 'Email déjà inscrit']));
    }

    // ➕ Insertion
    $stmt = $pdo->prepare("INSERT INTO subscribers (prenom, nom, email, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->execute([$prenom, $nom, $email]);

    // 🎉 Succès
    echo json_encode([
        'success' => true,
        'message' => 'INSCRIPTION REUSSIE'
    ]);
    exit;

} catch (PDOException $e) {
    error_log('Database Error: '.$e->getMessage());
    http_response_code(500);
    exit(json_encode(['success' => false, 'message' => 'Erreur serveur']));
}