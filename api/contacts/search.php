<?php
include '../../config/db.php';
include '../../config/auth_check.php';

$query = $_GET['query'] ?? '';
$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT id, name, email, phone FROM contacts 
                        WHERE user_id = ? AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)");
$search = "%" . $query . "%";
$stmt->bind_param("isss", $user_id, $search, $search, $search);
$stmt->execute();
$result = $stmt->get_result();

$contacts = [];
while ($row = $result->fetch_assoc()) {
    $contacts[] = $row;
}

echo json_encode($contacts);
?>