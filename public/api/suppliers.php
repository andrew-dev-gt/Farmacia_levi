<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM suppliers ORDER BY companyName ASC");
    sendJson($stmt->fetchAll());
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['id']) || !isset($input['companyName'])) {
        sendJson(['error' => 'Datos inválidos'], 400);
    }
    
    $sql = "INSERT INTO suppliers (id, companyName, nit, type, phone, email, address, notes)
            VALUES (:id, :companyName, :nit, :type, :phone, :email, :address, :notes)
            ON DUPLICATE KEY UPDATE 
                companyName = VALUES(companyName),
                nit = VALUES(nit),
                type = VALUES(type),
                phone = VALUES(phone),
                email = VALUES(email),
                address = VALUES(address),
                notes = VALUES(notes)";
                
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id' => $input['id'],
        ':companyName' => $input['companyName'],
        ':nit' => $input['nit'] ?? '',
        ':type' => $input['type'] ?? '',
        ':phone' => $input['phone'] ?? '',
        ':email' => $input['email'] ?? '',
        ':address' => $input['address'] ?? '',
        ':notes' => $input['notes'] ?? ''
    ]);
    
    sendJson(['success' => true]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM suppliers WHERE id = :id");
        $stmt->execute([':id' => $id]);
    }
    sendJson(['success' => true]);
}
