<?php
header('Content-Type: application/json');

// Configuration DB
$servername = "localhost";
$username = "user";
$password = "password";
$dbname = "endurance_db";

// Sécurité
$data = [
    'prenom' => htmlspecialchars($_POST['prenom']),
    'nom' => htmlspecialchars($_POST['nom']),
    'email' => filter_var($_POST['email'], FILTER_SANITIZE_EMAIL)
];

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $conn->prepare("INSERT INTO newsletter (prenom, nom, email) VALUES (:prenom, :nom, :email)");
    $stmt->execute($data);

    echo json_encode(['success' => true]);
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>