<?php
header("Content-Type: application/json");
include '../../config/db.php';
include '../../config/auth_check.php';

$contactId = filter_var($_GET['contactId'] ?? null, FILTER_VALIDATE_INT, ["options" => ["min_range" => 1]]);
$user_id = $_SESSION['user_id'];

if (!$contactId) {
    echo json_encode(["status" => "error", "message" => "Invalid contactId"]); exit;
}

$stmt = $conn->prepare("DELETE FROM Contacts WHERE ContactID = ? AND UserID = ?");
$stmt->bind_param("ii", $contactId, $user_id);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to delete contact"]);
}

