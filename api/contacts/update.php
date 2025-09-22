<?php
include '../../config/db.php';
include '../../config/auth_check.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];
$name = $data['name'];
$email = $data['email'];
$phone = $data['phone'];
$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("UPDATE contacts SET name=?, email=?, phone=? WHERE id=? AND user_id=?");
$stmt->bind_param("sssii", $name, $email, $phone, $id, $user_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to update contact"]);
}
?>