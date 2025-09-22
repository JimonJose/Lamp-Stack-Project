<?php
header("Content-Type: application/json");
include '../../config/db.php';
include '../../config/auth_check.php';

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT ContactID, FirstName, LastName FROM Contacts WHERE UserID = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();

$out = [];
while ($row = $res->fetch_assoc()) { $out[] = $row; }
echo json_encode($out);

