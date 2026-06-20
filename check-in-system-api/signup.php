<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS'){
	http_response_code(200);
	exit;
}

require_once 'config.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if (empty($username) || empty($password)) {
	http_response_code(400);
	echo json_encode(["message" => "Username and password are required"]);
	exit;
}

try {
	$checkStmt = $pdo->prepare('SELECT user_id FROM users WHERE username = ?');
	$checkStmt->execute([$username]);

	if ($checkStmt->fetch()) {
		http_response_code(409);
		echo json_encode(["message" => "Username is already taken"]);
		exit;
	}

	$pass_enc = password_hash($password, PASSWORD_BCRYPT);
	$user_type = 'USER';
	
	$insertStmt = $pdo->prepare('INSERT INTO users (username, password, user_type) VALUES (?, ?, ?)');

	if ($insertStmt->execute([$username, $pass_enc, $user_type])) {
		http_response_code(201);
		echo json_encode(["message" => "Sign Up Successful"]);
	}
	else {
		http_response_code(500);
		echo json_encode(["message" => "Sign Up Unsuccessful"]);
	}
}
catch (\Exception $err) {
	http_response_code(500);
	echo json_encode(["message" => "An Error Occurred", "error_details" => $err->getMessage(), "file" => $err->getFile(), "line" => $err->getLine()]);
}
?>
