<?php
header("Content-Type: application/json");
include '../../config/db.php';
include '../../config/auth_check.php';

$data = json_decode(file_get_contents("php://input"), true);
$contactId = (int)($data['contactId'] ?? 0);
$first = trim((string)($data['firstName'] ?? ''));
$last  = trim((string)($data['lastName'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$phone = trim((string)($data['phone'] ?? ''));
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
if ($email !== '' && (mb_strlen($email) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL))) {
    echo json_encode(["status" => "error", "message" => "Invalid email"]); exit;
}
if ($phone !== '' && (mb_strlen($phone) > 30 || !preg_match('/^[0-9+\-\s().]{0,30}$/', $phone))) {
    echo json_encode(["status" => "error", "message" => "Invalid phone"]); exit;
}

$stmt = $conn->prepare(
  "UPDATE Contacts SET FirstName = ?, LastName = ?, Email = ?, PhoneNumber = ? WHERE ContactID = ? AND UserID = ?"
);
$stmt->bind_param("ssssii", $first, $last, $email, $phone, $contactId, $user_id);

if ($stmt->execute() && $stmt->affected_rows >= 0) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to update contact"]);
}

