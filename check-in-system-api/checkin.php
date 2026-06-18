<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS'){
	http_response_code(200);
	exit();
}

require_once 'config.php';

if (!isset($pdo)) {
	http_response_code(500);
	echo json_encode(["error" => "Database connection resource variable unavailable"]);
	exit();
}

$incomingData = file_get_contents("php://input");
$request = json_decode($incomingData, true);

if (empty($request['user_id']) || !isset($request['latitude']) || !isset($request['longitude'])) {
	http_response_code(400);
	echo json_encode(["error" => "Incomplete payload details"]);
	exit();
}

$user_id = filter_var($request['user_id'], FILTER_VALIDATE_INT);
$latitude = filter_var($request['latitude'], FILTER_VALIDATE_FLOAT);
$longitude = filter_var($request['longitude'], FILTER_VALIDATE_FLOAT);

if ($user_id === false || $latitude === false || $longitude === false) {
	http_response_code(400);
	echo json_encode(["error" => "Invalid coordinate values"]);
	exit();
}

try {
	$sql = "INSERT INTO check_ins (user_id, latitude, longitude, check_in_time) VALUES (:user_id, :latitude, :longitude, NOW())";
	$stmt = $pdo->prepare($sql);
	$stmt->execute([':user_id' => $user_id, ':latitude' => $latitude, ':longitude' => $longitude]);
	http_response_code(201);
	echo json_encode(["status" => "success", "message" => "Coordinates logged successfully"]);
}
catch (\PDOException $err) {
	http_response_code(500);
	echo json_encode(["error" => "Database transaction failure", "details" => $err->getMessage()]);
	exit();
}
?>
