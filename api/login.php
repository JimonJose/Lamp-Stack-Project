<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

header("Content-Type: application/json");

include '../config/db.php';
include '../config/session.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

$stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($id, $hash);

if ($stmt->num_rows > 0) {
    $stmt->fetch();
    if (password_verify($password, $hash)) {
	session_regenerate_id(true); // prevent session fixation
        $_SESSION['user_id'] = $id;
        echo json_encode(["status" => "success", "user_id" => $id]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid password"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "User not found"]);
}
?>
