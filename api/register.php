<?php
header("Content-Type: application/json");
include '../config/db.php';
include '../config/session.php';

$data = json_decode(file_get_contents("php://input"), true);
$username = trim((string)($data['username'] ?? ''));
$password = (string)($data['password'] ?? '');

/* Input validation */
if ($username === '' || mb_strlen($username) > 100 || !preg_match('/^[A-Za-z0-9._-]{3,100}$/', $username)) {
    echo json_encode(["status" => "error", "message" => "Invalid username"]); exit;
}
if (mb_strlen($password) < 8 || mb_strlen($password) > 200) {
    echo json_encode(["status" => "error", "message" => "Invalid password"]); exit;
}

$stmt = $conn->prepare("SELECT UserID FROM Users WHERE Username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Username already taken"]); exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO Users (Username, Password) VALUES (?, ?)");
$stmt->bind_param("ss", $username, $hash);

if ($stmt->execute()) {
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int)$stmt->insert_id;
    echo json_encode(["status" => "success", "user_id" => (int)$stmt->insert_id]);
} else {
    echo json_encode(["status" => "error", "message" => "Registration failed"]);
}

