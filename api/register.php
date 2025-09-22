<?php
header("Content-Type: application/json");
include '../config/db.php';
include '../config/session.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

// 1. Validate input
if (empty($email) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Email and password required"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Invalid email format"]);
    exit;
}

if (strlen($name) > 100) {
    echo json_encode(["status" => "error", "message" => "Name too long"]);
    exit;
}


// 2. Check for duplicates
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Email already registered"]);
    exit;
}

// 3. Hash the password
$hash = password_hash($password, PASSWORD_DEFAULT);

// 4. Insert new user
$stmt = $conn->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
$stmt->bind_param("ss", $email, $hash);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "user_id" => $stmt->insert_id]);
} else {
    echo json_encode(["status" => "error", "message" => "User registration failed: " . $stmt->error]);
}
?>

