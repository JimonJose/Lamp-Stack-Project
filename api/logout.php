<?php
include '../config/session.php';
session_unset();
session_destroy();
setcookie(session_name(), '', time() - 3600, '/'); 
echo json_encode(["status" => "success", "message" => "Logged out"]);
?>

