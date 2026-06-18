<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	http_response_code(200);
	exit();
}

require_once 'config.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (empty($data['user_id'])) {
	http_response_code(400);
	echo json_encode(["error" => "Missing target user id"]);
	exit();
}

$user_id = filter_var($data['user_id'], FILTER_VALIDATE_INT);

if ($user_id === false) {
	http_response_code(400);
	echo json_encode(["error" => "Invalid user id type"]);
	exit();
}

try {
	$sqlUser = "DELETE FROM users WHERE user_id = :user_id";
	$stmt = $pdo->prepare($sqlUser);
	$stmt->execute([':user_id' => $user_id]);

	http_response_code(200);
	echo json_encode(["success" => true, "message" => "User and history has been deleted"]);
}
catch (\Throwable $err) {
	http_response_code(500);
	echo json_encode(["error" => "Database error", "details" => $err->getMessage()]);
}
?>
