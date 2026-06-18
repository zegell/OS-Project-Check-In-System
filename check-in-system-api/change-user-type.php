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

if (empty($data['user_id']) || empty($data['new_type'])) {
	http_response_code(400);
	echo json_encode(["error" => "Missing user identifier / role"]);
	exit();
}

$user_id = filter_var($data['user_id'], FILTER_VALIDATE_INT);
$new_type = strtoupper(trim($data['new_type']));

if (!in_array($new_type, ['USER', 'ADMIN'])) {
	http_response_code(400);
	echo json_encode(["error" => "Unauthorised access tier role requested"]);
	exit();
}

try {
	$sql = "UPDATE users SET user_type = :new_type WHERE user_id = :user_id";
	$stmt = $pdo->prepare($sql);
	$stmt->execute([':new_type' => $new_type, ':user_id' => $user_id]);

	http_response_code(200);
	echo json_encode(["success" => true, "message" => "User type updated"]);
}
catch (\Throwable $err) {
	http_response_code(500);
	echo json_encode(["error" => "Database update failure", "details" => $err->getMessage()]);
}
?>
