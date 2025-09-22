<?php
header("Content-Type: application/json");
include '../../config/db.php';
include '../../config/auth_check.php';

$data = json_decode(file_get_contents("php://input"), true);
$first = trim((string)($data['firstName'] ?? ''));
$last  = trim((string)($data['lastName'] ?? ''));
$user_id = $_SESSION['user_id'];

/* Input validation */
if ($first === '' && $last === '') {
    echo json_encode(["status" => "error", "message" => "First or Last name required"]); exit;
}
if (mb_strlen($first) > 100 || mb_strlen($last) > 100) {
    echo json_encode(["status" => "error", "message" => "Name too long"]); exit;
}
$nameOk = function($s){ return $s === '' || preg_match('/^[\p{L}\p{M}\s\'\-.]{0,100}$/u', $s); };
if (!$nameOk($first) || !$nameOk($last)) {
    echo json_encode(["status" => "error", "message" => "Invalid name characters"]); exit;
}

$stmt = $conn->prepare("INSERT INTO Contacts (FirstName, LastName, UserID) VALUES (?, ?, ?)");
$stmt->bind_param("ssi", $first, $last, $user_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "contactId" => $stmt->insert_id]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to add contact"]);
}

