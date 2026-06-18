<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
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
	$stmt = $pdo->prepare('SELECT user_id, username, password, user_type FROM users WHERE username = ?');
	$stmt->execute([$username]);
	$user = $stmt->fetch(PDO::FETCH_ASSOC);

	if ($user && password_verify($password, $user['password'])) {
		unset($user['password']);
		http_response_code(200);
		echo json_encode($user);
	}
	else {
		http_response_code(401);
		echo json_encode(["message" => "Invalid username or password"]);
	}
}
catch (\Exception $err){
	http_response_code(500);
	echo json_encode([
		"message" => "An error occured",
		"error_details" => $err->getMessage(),
		"file" => $err->getFile(),
		"line" => $err->getLine()
	]);
}
?>
