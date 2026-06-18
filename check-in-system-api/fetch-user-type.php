<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once 'config.php';

if (empty($_GET['user_id'])) {
	http_response_code(400);
	echo json_encode(["error" => "Missing user id"]);
	exit();
}

$user_id = filter_var($_GET['user_id'], FILTER_VALIDATE_INT);

try {
	$sql = "SELECT user_id, username, user_type FROM users WHERE user_id = :user_id LIMIT 1";
	$stmt = $pdo->prepare($sql);
	$stmt->execute(['user_id' => $user_id]);
	$user = $stmt->fetch(PDO::FETCH_ASSOC);

	if ($user) {
		http_response_code(200);
		echo json_encode($user);
	}
	else {
		http_response_code(404);
		echo json_encode(["error" => "User account not found"]);
	}
}
catch (\Throwable $err) {
	http_response_code(500);
	echo json_encode(["error" => "User retrieval failure", "details" => $err-> getMessage()]);
}
?>
