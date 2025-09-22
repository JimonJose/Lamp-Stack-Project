<?php
include '../../config/db.php';
include '../../config/auth_check.php';

$data = json_decode(file_get_contents("php://input"), true);
$name = $data['name'];
$email = $data['email'];
$phone = $data['phone'];
$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("INSERT INTO contacts (user_id, name, email, phone) VALUES (?, ?, ?, ?)");
$stmt->bind_param("isss", $user_id, $name, $email, $phone);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "contact_id" => $stmt->insert_id]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to add contact"]);
}
?>