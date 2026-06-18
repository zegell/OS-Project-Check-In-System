<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	http_response_code(200);
	exit();
}

require_once 'config.php';

if (!isset($pdo)) {
	http_response_code(500);
	echo json_encode(["error" => "Database connection resource variable unavailable"]);
	exit();
}

if (empty($_GET['user_id'])) {
	http_response_code(400);
	echo json_encode(["error" => "Missing user identifier"]);
	exit();
}

$user_id = filter_var($_GET['user_id'], FILTER_VALIDATE_INT);

if ($user_id === false) {
	http_response_code(400);
	echo json_encode(["error" => "Invalid user identifier type"]);
	exit();
}

try {
	$sql = "SELECT checkin_id, latitude, longitude, check_in_time FROM check_ins WHERE user_id = :user_id ORDER BY check_in_time DESC";
	$stmt = $pdo->prepare($sql);
	$stmt->execute([':user_id' => $user_id]);
	$history = $stmt->fetchAll(PDO::FETCH_ASSOC);
	http_response_code(200);
	echo json_encode($history);
}
catch (\PDOException $err) {
	http_response_code(500);
	echo json_encode(["error" => "Database fetch failure", "details" => $err->getMessage()]);
	exit();
}
?>
