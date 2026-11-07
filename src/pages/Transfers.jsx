import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Truck, Check, Send, Search, Plus, Trash2, User, ArrowRight, Package } from 'lucide-react';

const Transfers = () => {
  const { currentBranch, branches, transfers, products, requestBatchTransfer, receiveTransfer, currentUser } = useInventory();
  
  // Batch transfer list
  const [transferList, setTransferList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [targetBranch, setTargetBranch] = useState(
    branches.find(b => b !== currentBranch) || (currentBranch === 'Sucursal Centro' ? 'Salida de Tejutla' : 'Sucursal Centro')
  );
  const [senderName, setSenderName] = useState(currentUser?.username || '');

  // Filter transfers intended for this branch and pending
  const incomingTransfers = transfers.filter(t => t.toBranch === currentBranch && t.status === 'pending');
  // Filter transfers sent from this branch
  const outgoingTransfers = transfers.filter(t => t.fromBranch === currentBranch);

  // Filter products for search
  const availableProducts = products.filter(p => {
    const stockHere = p.stock[currentBranch] || 0;
    if (stockHere <= 0) return false;
    const match = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  p.id.includes(searchTerm) || 
                  (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return match;
  });

  const handleAddToList = () => {
    if (!selectedProduct) return;
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      alert('Ingresa una cantidad válida mayor a 0');
      return;
    }
    const currentStock = selectedProduct.stock[currentBranch] || 0;
    const alreadyInList = transferList.find(item => item.productId === selectedProduct.id)?.quantity || 0;
    if (alreadyInList + qty > currentStock) {
      alert(`No hay suficiente stock en ${currentBranch}. Disponible: ${currentStock}, Ya en lista: ${alreadyInList}`);
      return;
    }

    setTransferList(prev => {
      const exists = prev.find(item => item.productId === selectedProduct.id);
      if (exists) {
        return prev.map(item => item.productId === selectedProduct.id ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        presentation: selectedProduct.presentation || '',
        price: selectedProduct.price,
        quantity: qty,
        maxStock: currentStock
      }];
    });

    setSelectedProduct(null);
    setSearchTerm('');
    setQuantity(1);
  };

  const handleRemoveFromList = (productId) => {
    setTransferList(prev => prev.filter(item => item.productId !== productId));
  };

  const handleSendBatch = async () => {
    if (transferList.length === 0) {
      alert('Agrega al menos un producto a la lista de envío.');
      return;
    }
    if (!targetBranch || targetBranch === currentBranch) {
      alert('Selecciona una sucursal destino diferente a la actual.');
      return;
    }
    if (!senderName.trim()) {
      alert('Indica el nombre de la persona que envía.');
      return;
    }

    if (!window.confirm(`¿Confirmas el envío de ${transferList.length} producto(s) hacia ${targetBranch}?`)) {
      return;
    }

    const res = await requestBatchTransfer(transferList, currentBranch, targetBranch, senderName);
    const failures = res.filter(r => !r.success);
    if (failures.length > 0) {
      alert(`Se enviaron productos, pero ${failures.length} fallaron por problemas de stock.`);
    } else {
      alert('¡Todo el listado de productos fue enviado exitosamente!');
    }
    setTransferList([]);
  };

  const handleReceive = async (id) => {
    const success = await receiveTransfer(id);
    if (success) alert('Transferencia recibida. Stock sumado al inventario local.');
  };

  return (
    <div className="container" style={{ padding: '8px 0px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2.3rem', fontWeight: '800', color: 'var(--color-primary-dark)' }}>
          <Truck color="var(--color-primary)" size={36} /> Logística y Envíos Multi-Producto
        </h1>
        <p style={{ color: 'var(--color-text-light)', marginTop: '6px' }}>
          Sucursal actual de origen: <strong>{currentBranch}</strong>. Prepara un listado de múltiples productos y despáchalos en bloque.
        </p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
        {/* FORMULARIO DE ARMADO DE PAQUETE */}
        <div className="modern-box" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={22} color="var(--color-primary)" /> 1. Configurar Envío y Destino
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>
                Sucursal Destino:
              </label>
              <select 
                className="modern-input" 
                value={targetBranch}
                onChange={(e) => setTargetBranch(e.target.value)}
              >
                {branches.filter(b => b !== currentBranch).map(b => (
                  <option key={b} value={b}>📍 {b}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>
                Quién Envía (Responsable):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input 
                  type="text" 
                  className="modern-input" 
                  placeholder="Nombre de remitente..."
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--color-border)', margin: '4px 0' }} />

          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} /> 2. Buscar y Agregar Productos
          </h3>

          <div>
            <input 
              type="text" 
              className="modern-input" 
              placeholder="Buscar por nombre, código SKU o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* LISTA DE RESULTADOS DE BÚSQUEDA */}
          {searchTerm.trim() !== '' && (
            <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '10px', background: 'var(--color-bg)', padding: '6px' }}>
              {availableProducts.length === 0 ? (
                <div style={{ padding: '8px', fontSize: '0.85rem', color: 'var(--color-text-light)', textAlign: 'center' }}>
                  No se encontraron productos con stock en {currentBranch}
                </div>
              ) : (
                availableProducts.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => { setSelectedProduct(p); setSearchTerm(''); }}
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      background: selectedProduct?.id === p.id ? 'rgba(37,51,124,0.1)' : 'transparent',
                      borderBottom: '1px solid rgba(0,0,0,0.04)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>SKU: {p.id}</div>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                      Stock: {p.stock[currentBranch] || 0}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PRODUCTO SELECCIONADO PARA AGREGAR */}
          {selectedProduct && (
            <div style={{ background: 'rgba(37, 51, 124, 0.04)', border: '1px solid var(--color-accent)', padding: '12px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: 'var(--color-primary-dark)' }}>{selectedProduct.name}</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 'bold' }}>
                  Disponible: {selectedProduct.stock[currentBranch] || 0}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="number" 
                  min="1" 
                  max={selectedProduct.stock[currentBranch] || 1}
                  className="modern-input" 
                  style={{ width: '100px' }}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <button type="button" className="modern-btn modern-btn-primary" onClick={handleAddToList} style={{ flex: 1, padding: '10px' }}>
                  <Plus size={18} /> Agregar al Paquete
                </button>
              </div>
            </div>
          )}

          {/* LISTADO DE PRODUCTOS A ENVIAR */}
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>Paquete Actual ({transferList.length} artículos):</span>
              {transferList.length > 0 && (
                <button 
                  type="button" 
                  onClick={() => setTransferList([])}
                  style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Vaciar lista
                </button>
              )}
            </div>

            {transferList.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', border: '2px dashed var(--color-border)', borderRadius: '12px', color: 'var(--color-text-light)' }}>
                Busca productos arriba y agrégalos al listado de envío.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {transferList.map(item => (
                  <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--color-bg)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Cantidad a despachar: <strong>{item.quantity}</strong></div>
                    </div>
                    <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => handleRemoveFromList(item.productId)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            type="button" 
            className="modern-btn modern-btn-primary" 
            disabled={transferList.length === 0}
            onClick={handleSendBatch}
            style={{ 
              padding: '16px', 
              fontSize: '1.05rem', 
              marginTop: '12px',
              opacity: transferList.length === 0 ? 0.5 : 1,
              cursor: transferList.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <Send size={20} /> Despachar Todo el Listado ({transferList.reduce((acc, i) => acc + i.quantity, 0)} unidades)
          </button>
        </div>

        {/* RECEPCIONES Y ENVIOS EN CURSO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* RECEPCIONES PENDIENTES */}
          <div className="modern-box">
            <h2 style={{ color: 'var(--color-warning)', fontSize: '1.3rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              Recepciones Pendientes en {currentBranch}
            </h2>
            {incomingTransfers.length === 0 ? (
              <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem' }}>No hay transferencias entrantes hacia {currentBranch}.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {incomingTransfers.map(t => (
                  <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem', display: 'block' }}>{t.productName}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>{t.quantity} unidades</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                        Origen: {t.fromBranch} {t.senderName ? `(Enviado por: ${t.senderName})` : ''}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleReceive(t.id)} 
                      className="modern-btn modern-btn-primary" 
                      style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                      title="Confirmar recepción e ingresar al stock"
                    >
                      <Check size={18} /> Recibir
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* ENVIADOS EN CAMINO */}
          <div className="modern-box">
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px' }}>Envíos Realizados Recientes</h2>
            {outgoingTransfers.length === 0 ? (
              <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem' }}>No hay envíos registrados desde {currentBranch}.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                {outgoingTransfers.slice(-10).reverse().map(t => (
                  <div key={t.id} style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{t.productName} ({t.quantity} un.)</strong>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontWeight: '700',
                        background: t.status === 'pending' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                        color: t.status === 'pending' ? 'var(--color-warning)' : 'var(--color-success)'
                      }}>
                        {t.status === 'pending' ? 'En Tránsito' : 'Recibido'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                      Destino: <strong>{t.toBranch}</strong> {t.senderName ? `| Remitente: ${t.senderName}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfers;
