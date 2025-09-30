<?php
header("Content-Type: application/json");
include '../config/db.php';
include '../config/session.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Not logged in"]); exit;
}

$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT UserID, Username FROM Users WHERE UserID = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();

if ($user) {
    echo json_encode(["status" => "success", "user" => $user]);
} else {
    echo json_encode(["status" => "error", "message" => "User not found"]);
}

