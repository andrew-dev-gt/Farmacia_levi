import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { ShoppingBag, Plus, Trash2, Calendar, Building2, Package, Search, DollarSign, Check, FileText } from 'lucide-react';

const Purchases = () => {
  const { purchases, suppliers, products, currentBranch, branches, addPurchase, currentUser } = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [branchForStock, setBranchForStock] = useState(currentBranch);
  const [addToStock, setAddToStock] = useState(true);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Purchase items
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [unitCost, setUnitCost] = useState('');

  const availableProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.includes(searchTerm)
  );

  const handleAddItem = () => {
    if (!selectedProduct) return;
    const quantity = parseInt(qty, 10);
    const cost = parseFloat(unitCost);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Ingresa una cantidad válida mayor a 0');
      return;
    }
    if (isNaN(cost) || cost < 0) {
      alert('Ingresa un costo unitario válido');
      return;
    }

    setPurchaseItems(prev => [
      ...prev,
      {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        unitCost: cost,
        subtotal: quantity * cost
      }
    ]);

    setSelectedProduct(null);
    setSearchTerm('');
    setQty(1);
    setUnitCost('');
  };

  const handleRemoveItem = (index) => {
    setPurchaseItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalPurchase = purchaseItems.reduce((acc, item) => acc + item.subtotal, 0);

  const handleSavePurchase = async (e) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      alert('Selecciona un proveedor');
      return;
    }
    if (purchaseItems.length === 0) {
      alert('Agrega al menos un producto a la compra');
      return;
    }

    const supplierObj = suppliers.find(s => s.id === selectedSupplierId);

    const purchaseRecord = {
      id: 'PUR-' + Date.now().toString(36).toUpperCase(),
      supplierId: selectedSupplierId,
      supplierName: supplierObj ? supplierObj.companyName : 'Proveedor Desconocido',
      branch: branchForStock,
      invoiceNumber: invoiceNumber.trim() || 'S/N',
      items: purchaseItems,
      total: totalPurchase,
      addToStock,
      notes,
      buyerName: currentUser?.username || 'Admin',
      date: new Date().toISOString()
    };

    await addPurchase(purchaseRecord);
    alert('¡Compra registrada correctamente!' + (addToStock ? ` El stock fue sumado a ${branchForStock}.` : ''));
    
    // Reset modal
    setShowModal(false);
    setPurchaseItems([]);
    setSelectedSupplierId('');
    setInvoiceNumber('');
    setNotes('');
  };

  return (
    <div className="container" style={{ padding: '8px 0px' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShoppingBag color="var(--color-primary)" size={36} /> Compras a Distribuidores
          </h1>
          <p style={{ color: 'var(--color-text-light)', fontSize: '1.1rem', marginTop: '6px' }}>
            Registro de abastecimiento, órdenes de compra y facturas de proveedores.
          </p>
        </div>

        <button className="modern-btn modern-btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Registrar Nueva Compra
        </button>
      </header>

      {/* HISTORIAL DE COMPRAS */}
      <div className="modern-box">
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-primary-dark)', marginBottom: '20px' }}>
          Historial de Facturas y Compras
        </h2>

        {purchases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' }}>
            <ShoppingBag size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
            <p>No se han registrado compras a proveedores todavía.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {purchases.slice().reverse().map(pur => (
              <div key={pur.id} style={{ background: 'var(--color-bg)', padding: '18px', borderRadius: '14px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-primary)', background: 'rgba(37,51,124,0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                        {pur.id}
                      </span>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)' }}>{pur.supplierName}</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                      Factura No.: <strong>{pur.invoiceNumber}</strong> | Destino: <strong>{pur.branch}</strong> | Registrado por: {pur.buyerName}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: '850', color: 'var(--color-success)' }}>
                      Q{pur.total.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                      {new Date(pur.date).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* DETALLE DE ITEMS */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-light)', textTransform: 'uppercase' }}>Productos Adquiridos:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    {pur.items.map((it, idx) => (
                      <span key={idx} style={{ fontSize: '0.82rem', padding: '4px 10px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                        {it.productName} <strong>(x{it.quantity})</strong> — Q{it.subtotal.toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>

                {pur.notes && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', fontStyle: 'italic', margin: 0 }}>
                    Nota: "{pur.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL NUEVA COMPRA */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="modern-box" style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary-dark)', marginBottom: '18px' }}>
              Registrar Compra a Distribuidor
            </h2>

            <form onSubmit={handleSavePurchase} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>
                    Proveedor *
                  </label>
                  <select 
                    className="modern-input"
                    required
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                  >
                    <option value="">Selecciona un proveedor...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.companyName} ({s.type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>
                    No. Factura / Comprobante
                  </label>
                  <input 
                    type="text"
                    className="modern-input"
                    placeholder="Ej. FAC-98214"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>
                    Ingresar Stock a Sucursal
                  </label>
                  <select 
                    className="modern-input"
                    value={branchForStock}
                    onChange={e => setBranchForStock(e.target.value)}
                  >
                    {branches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                    <input 
                      type="checkbox"
                      checked={addToStock}
                      onChange={e => setAddToStock(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    Sumar automáticamente al inventario
                  </label>
                </div>
              </div>

              <hr style={{ borderColor: 'var(--color-border)', margin: '4px 0' }} />

              {/* SECCIÓN AGREGAR PRODUCTOS */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary-dark)' }}>
                Agregar Productos Adquiridos
              </h3>

              <div>
                <input 
                  type="text" 
                  className="modern-input" 
                  placeholder="Buscar producto por nombre o código..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {searchTerm.trim() !== '' && (
                <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '10px', background: 'var(--color-bg)', padding: '6px' }}>
                  {availableProducts.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => { setSelectedProduct(p); setSearchTerm(''); }}
                      style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                    >
                      <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{p.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>SKU: {p.id}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedProduct && (
                <div style={{ background: 'rgba(37, 51, 124, 0.04)', border: '1px solid var(--color-accent)', padding: '12px', borderRadius: '12px' }}>
                  <strong style={{ color: 'var(--color-primary-dark)', display: 'block', marginBottom: '8px' }}>
                    {selectedProduct.name}
                  </strong>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-light)' }}>Cantidad</label>
                      <input 
                        type="number"
                        min="1"
                        className="modern-input"
                        value={qty}
                        onChange={e => setQty(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-light)' }}>Costo Unitario (Q)</label>
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        className="modern-input"
                        placeholder="Ej. 25.50"
                        value={unitCost}
                        onChange={e => setUnitCost(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button type="button" className="modern-btn modern-btn-primary" onClick={handleAddItem}>
                        <Plus size={18} /> Agregar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* LISTADO DE ITEMS AGREGADOS */}
              {purchaseItems.length > 0 && (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead style={{ background: 'var(--color-bg)' }}>
                      <tr>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Producto</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center' }}>Cant.</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Costo U.</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Subtotal</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseItems.map((item, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: '600' }}>{item.productName}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>Q{item.unitCost.toFixed(2)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700' }}>Q{item.subtotal.toFixed(2)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <button type="button" className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => handleRemoveItem(idx)}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ padding: '12px', background: 'var(--color-bg)', textAlign: 'right', fontWeight: '850', fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>
                    Total Compra: Q{totalPurchase.toFixed(2)}
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>
                  Notas Adicionales
                </label>
                <textarea 
                  className="modern-input" 
                  rows="2"
                  placeholder="Observaciones de la entrega o condición de pago..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="modern-btn" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="modern-btn modern-btn-primary" disabled={purchaseItems.length === 0}>
                  <Check size={18} /> Registrar Factura de Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
