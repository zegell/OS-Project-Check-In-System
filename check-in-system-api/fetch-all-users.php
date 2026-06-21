<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once 'config.php';

try {
	$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
	$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
       	
	if ($page < 1) $page = 1;
	if ($limit < 1) $limit = 10;

	$offset = ($page - 1) * $limit;
	
	$countSql = "SELECT COUNT(*) FROM users";
	$countStmt = $pdo->query($countSql);
	$totalRecords = (int)$countStmt->fetchColumn();
	$totalPages = ceil($totalRecords / $limit);

	$sql = "SELECT user_id, username, user_type FROM users ORDER BY user_id ASC LIMIT :limit OFFSET :offset";
	$stmt = $pdo->prepare($sql);
	$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
	$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
	$stmt->execute();
	$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

	$response = [
		"data" => $users,
		"pagination" => [
			"total_records" => $totalRecords,
			"total_pages" => $totalPages === 0 ? 1 : $totalPages,
			"current_page" => $page,
			"limit" => $limit
		]
	];

	http_response_code(200);
	echo json_encode($response);
}
catch (\PDOException $err) {
	http_response_code(500);
	echo json_encode(["error" => "Failed to fetch users", "details" => $err->getMessage()]);
}
?>
