<?php
header("Content-Type: application/json");

require_once 'config.php';

try {

    $adminUsername = 'USERNAME';  #CHANGE THE USERNAME HERE
    $adminPassword = 'PASSWORD'; #CHANGE THE PASSWORD HERE
    $userType = 'ADMIN';
    $hashedPassword = password_hash($adminPassword, PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (username, password, user_type) VALUES (:username, :password, :user_type)";
    $stmt = $pdo->prepare($sql);
    
    $stmt->execute([
        ':username'  => $adminUsername,
        ':password'  => $hashedPassword,
        ':user_type' => $userType
    ]);

    http_response_code(201);
    echo json_encode([
        "success" => true, 
        "message" => "Admin user '$adminUsername' created successfully!"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    
    if ($e->getCode() == 23000) {
        echo json_encode(["success" => false, "message" => "Error: That username already exists."]);
    } else {
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
    }
}

?>
