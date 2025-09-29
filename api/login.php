<?php
header("Content-Type: application/json");
include '../config/db.php';
include '../config/session.php';

$data = json_decode(file_get_contents("php://input"), true);
$username = trim((string)($data['username'] ?? ''));
$password = (string)($data['password'] ?? '');

/* Input validation */
if ($username === '' || mb_strlen($username) > 100 || !preg_match('/^[A-Za-z0-9._-]{3,100}$/', $username)) {
    echo json_encode(["status" => "error", "message" => "Invalid login"]); exit;
}
if (mb_strlen($password) < 8 || mb_strlen($password) > 200) {
    echo json_encode(["status" => "error", "message" => "Invalid login"]); exit;
}

$stmt = $conn->prepare("SELECT UserID, Password FROM Users WHERE Username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($userId, $hash);

if ($stmt->num_rows > 0) {
    $stmt->fetch();
    if (password_verify($password, $hash)) {
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int)$userId;
        echo json_encode(["status" => "success", "user_id" => (int)$userId]); exit;
    }
}

echo json_encode(["status" => "error", "message" => "Invalid login"]);

