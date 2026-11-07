<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM purchases ORDER BY created_at DESC");
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
    
    $sql = "INSERT INTO purchases (id, supplierId, date, items, total)
            VALUES (:id, :supplierId, :date, :items, :total)";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id' => $input['id'],
        ':supplierId' => $input['supplierId'] ?? '',
        ':date' => $input['date'] ?? date('Y-m-d H:i:s'),
        ':items' => json_encode($input['items'] ?? []),
        ':total' => (float)($input['total'] ?? 0)
    ]);
    
    sendJson(['success' => true]);
}
