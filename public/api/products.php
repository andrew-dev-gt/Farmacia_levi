<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM products ORDER BY name ASC");
    $rows = $stmt->fetchAll();
    
    // Decodificar JSON fields
    foreach ($rows as &$r) {
        $r['stock'] = $r['stock'] ? json_decode($r['stock'], true) : [];
        $r['expiryDates'] = $r['expiryDates'] ? json_decode($r['expiryDates'], true) : [];
        $r['price'] = (float)$r['price'];
    }
    
    sendJson($rows);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['id']) || !isset($input['name'])) {
        sendJson(['error' => 'Datos inválidos'], 400);
    }
    
    $id = trim($input['id']);
    $name = trim($input['name']);
    $presentation = $input['presentation'] ?? '';
    $description = $input['description'] ?? '';
    $category = $input['category'] ?? '';
    $price = (float)($input['price'] ?? 0);
    $lot = $input['lot'] ?? '';
    $stock = json_encode($input['stock'] ?? []);
    $expiryDates = json_encode($input['expiryDates'] ?? []);

    // Consulta parametrizada segura contra Inyecciones SQL (UPSERT)
    $sql = "INSERT INTO products (id, name, presentation, description, category, price, lot, stock, expiryDates)
            VALUES (:id, :name, :presentation, :description, :category, :price, :lot, :stock, :expiryDates)
            ON DUPLICATE KEY UPDATE 
                name = VALUES(name),
                presentation = VALUES(presentation),
                description = VALUES(description),
                category = VALUES(category),
                price = VALUES(price),
                lot = VALUES(lot),
                stock = VALUES(stock),
                expiryDates = VALUES(expiryDates)";
                
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id' => $id,
        ':name' => $name,
        ':presentation' => $presentation,
        ':description' => $description,
        ':category' => $category,
        ':price' => $price,
        ':lot' => $lot,
        ':stock' => $stock,
        ':expiryDates' => $expiryDates
    ]);
    
    sendJson(['success' => true, 'id' => $id]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        sendJson(['error' => 'ID requerido'], 400);
    }
    
    $stmt = $pdo->prepare("DELETE FROM products WHERE id = :id");
    $stmt->execute([':id' => $id]);
    sendJson(['success' => true]);
}
