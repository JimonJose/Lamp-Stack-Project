<?php
include '../../config/db.php';
include '../../config/auth_check.php';

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT id, name, email, phone FROM contacts WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$contacts = [];
while ($row = $result->fetch_assoc()) {
    $contacts[] = $row;
}

echo json_encode($contacts);
?>