<?php
include __DIR__ . '/env.php';
loadEnv(__DIR__ . '/../.env');

$host = getenv("DB_HOST");
$user = getenv("DB_USER");
$pass = getenv("DB_PASS");
$dbname = getenv("DB_NAME");

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    error_log("DB connection error: " . $conn->connect_error);
    exit;
}

$conn->set_charset("utf8mb4");
?>

