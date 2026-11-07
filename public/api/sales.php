<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM sales ORDER BY created_at DESC");
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['items'] = $r['items'] ? json_decode($r['items'], true) : [];
        $r['total'] = (float)$r['total'];
    }
    sendJson($rows);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['id'])) {
        sendJson(['error' => 'Datos inválidos'], 400);
    }
    
    $sql = "INSERT INTO sales (id, branch, items, total, date)
            VALUES (:id, :branch, :items, :total, :date)";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id' => $input['id'],
        ':branch' => $input['branch'] ?? '',
        ':items' => json_encode($input['items'] ?? []),
        ':total' => (float)($input['total'] ?? 0),
        ':date' => $input['date'] ?? date('Y-m-d H:i:s')
    ]);
    
    sendJson(['success' => true]);
}
