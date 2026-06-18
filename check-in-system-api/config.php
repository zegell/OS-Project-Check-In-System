<?php

$host = '127.0.0.1';
$db = 'check_in_system_db';
$user = 'USERNAME'; #ENTER YOUR DB USERNAME HERE
$pass = 'PASSWORD'; #ENTER YOUR DB PASSWORD HERE
$charset = 'utf8mb4';

#$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
#$dsn = "mysql:unix_socket=/run/mysqld/mysqld.sock;dbname=$db;charset=$charset";
$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";

$options = [
	PDO:: ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
	PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
	PDO::ATTR_EMULATE_PREPARES => false,

];

try {
	$pdo = new PDO($dsn, $user, $pass, $options);
}
catch (\PDOException $error){
	http_response_code(500);
	echo json_encode(["error" => "Database connection failed"]);
	exit;
}
?>
