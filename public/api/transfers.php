<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM transfers ORDER BY created_at DESC");
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['items'] = $r['items'] ? json_decode($r['items'], true) : [];
    }
    sendJson($rows);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['id'])) {
        sendJson(['error' => 'Datos inválidos'], 400);
    }
    
    $sql = "INSERT INTO transfers (id, fromBranch, toBranch, items, date, status)
            VALUES (:id, :fromBranch, :toBranch, :items, :date, :status)
            ON DUPLICATE KEY UPDATE status = VALUES(status)";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id' => $input['id'],
        ':fromBranch' => $input['fromBranch'] ?? '',
        ':toBranch' => $input['toBranch'] ?? '',
        ':items' => json_encode($input['items'] ?? []),
        ':date' => $input['date'] ?? date('Y-m-d H:i:s'),
        ':status' => $input['status'] ?? 'pending'
    ]);
    
    sendJson(['success' => true]);
}
