<?php
header("Content-Type: application/json");
include '../../config/db.php';
include '../../config/auth_check.php';

$q = trim((string)($_GET['q'] ?? ''));

/* Input validation */
if ($q === '') { echo json_encode([]); exit; }
$q = mb_substr($q, 0, 100);

$user_id = $_SESSION['user_id'];
$like = "%$q%";

$stmt = $conn->prepare(
  "SELECT ContactID, FirstName, LastName
     FROM Contacts
    WHERE UserID = ?
      AND (FirstName LIKE ? OR LastName LIKE ?)"
);
$stmt->bind_param("iss", $user_id, $like, $like);
$stmt->execute();
$res = $stmt->get_result();

$out = [];
while ($row = $res->fetch_assoc()) { $out[] = $row; }
echo json_encode($out);

