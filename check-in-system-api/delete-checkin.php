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

if (empty($data['checkin_id'])) {
	http_response_code(400);
	echo json_encode(["error" => "Missing check-in id"]);
	exit();
}

$checkin_id = filter_val($data['checkin_id'], FILTER_VALIDATE_INT);

if ($checkin_id === false) {
	http_response_code(400);
	echo json_encode(["error" => "Invalid check-in id"]);
	exit();
}

try {
	$sql = "DELETE FROM check_ins WHERE checkin_id = :checkin_id";
	$stmt = $pdo->prepare($sql);
	$stmt->execute([':checkin_id' => $checkin_id]);

	http_response_code(200);
	echo json_encode(["success" => true, "message" => "Check-in deleted"]);
}
catch (\Throwable $err) {
	http_response_code(500);
	echo json_encode(["error" => "Dataase removal error", "details" => $err->getMessage()]);
}
?>
