<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once 'config.php';

try {
	$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
	$limit =  isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
	
	if ($page < 1) $page = 1;
	if ($limit < 1) $limit = 10;
	
	$offset = ($page - 1) * $limit;

	$countSql = "SELECT COUNT(*) FROM check_ins";
	$countStmt = $pdo->query($countSql);
	$totalRecords = (int)$countStmt->fetchColumn();
	$totalPages = ceil($totalRecords / $limit);

	$sql = "SELECT u.username, c.checkin_id, c.longitude, c.latitude, c.check_in_time FROM check_ins c JOIN users u ON c.user_id = u.user_id ORDER BY c.check_in_time DESC LIMIT :limit OFFSET :offset";
	$stmt = $pdo->prepare($sql);
	$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
	$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
	$stmt->execute();
	$checkins =$stmt->fetchAll(PDO::FETCH_ASSOC);

	$response = [
		"data" => $checkins,
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
	echo json_encode(["error" => "Failed to fetch check-ins", "details" => $err->getMessage()]);
}
?>
