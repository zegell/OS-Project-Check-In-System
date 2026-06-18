<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once 'config.php';

try {
	$sql = "SELECT u.username, c.checkin_id, c.longitude, c.latitude, c.check_in_time FROM check_ins c JOIN users u ON c.user_id = u.user_id ORDER BY c.check_in_time DESC";
	$stmt = $pdo->prepare($sql);
	$stmt->execute();
	$checkins =$stmt->fetchAll(PDO::FETCH_ASSOC);

	http_response_code(200);
	echo json_encode($checkins);
}
catch (\PDOException $err) {
	http_response_code(500);
	echo json_encode(["error" => "Failed to fetch check-ins", "details" => $err->getMessage()]);
}
?>
