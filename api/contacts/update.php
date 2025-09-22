<?php
header("Content-Type: application/json");
include '../../config/db.php';
include '../../config/auth_check.php';

$data = json_decode(file_get_contents("php://input"), true);
$contactId = (int)($data['contactId'] ?? 0);
$first = trim((string)($data['firstName'] ?? ''));
$last  = trim((string)($data['lastName'] ?? '');
$user_id = $_SESSION['user_id'];

/* Input validation */
if ($contactId <= 0) {
    echo json_encode(["status" => "error", "message" => "Invalid contactId"]); exit;
}
if (mb_strlen($first) > 100 || mb_strlen($last) > 100) {
    echo json_encode(["status" => "error", "message" => "Name too long"]); exit;
}
$nameOk = function($s){ return $s === '' || preg_match('/^[\p{L}\p{M}\s\'\-.]{0,100}$/u', $s); };
if (!$nameOk($first) || !$nameOk($last)) {
    echo json_encode(["status" => "error", "message" => "Invalid name characters"]); exit;
}

$stmt = $conn->prepare(
  "UPDATE Contacts SET FirstName = ?, LastName = ? WHERE ContactID = ? AND UserID = ?"
);
$stmt->bind_param("ssii", $first, $last, $contactId, $user_id);

if ($stmt->execute() && $stmt->affected_rows >= 0) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to update contact"]);
}

