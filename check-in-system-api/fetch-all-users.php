<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once 'config.php';

try {
	$sql = "SELECT user_id, username, user_type FROM users ORDER BY user_id ASC";
	$stmt = $pdo->prepare($sql);
	$stmt->execute();
	$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

	http_response_code(200);
	echo json_encode($users);
}
catch (\PDOException $err) {
	http_response_code(500);
	echo json_encode(["error" => "Failed to fetch users", "details" => $err->getMessage()]);
}
?>
