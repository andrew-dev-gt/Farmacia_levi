import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { ShoppingCart, Plus, Minus, Trash2, Tag, CheckCircle, ArrowLeft, Printer, Calculator, UserCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { generateInvoicePDF } from '../utils/pdfGenerator';

const CartView = () => {
  const { currentBranch, cart, updateProductStock, updateCartQuantity, clearCart, currentUser, recordSale } = useInventory();
  const navigate = useNavigate();

  // Client Data
  const [clientData, setClientData] = useState({
    nit: 'CF',
    name: '',
    address: '',
    phone: ''
  });

  // Discounts
  const [discountType, setDiscountType] = useState('none'); 
  const [discountValue, setDiscountValue] = useState(0);

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrev, setCalcPrev] = useState(null);
  const [calcOp, setCalcOp] = useState(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  let discountAmount = 0;
  if (discountType === 'percentage') discountAmount = subtotal * (discountValue / 100);
  if (discountType === 'fixed') discountAmount = discountValue;
  const total = Math.max(0, subtotal - discountAmount);

  // Calculator handlers
  const handleCalcNum = (num) => {
    setCalcDisplay(prev => (prev === '0' || prev === 'Error') ? String(num) : prev + String(num));
  };

  const handleCalcOp = (op) => {
    setCalcPrev(parseFloat(calcDisplay));
    setCalcOp(op);
    setCalcDisplay('0');
  };

  const handleCalcEquals = () => {
    if (calcPrev === null || calcOp === null) return;
    const current = parseFloat(calcDisplay);
    let result = 0;
    if (calcOp === '+') result = calcPrev + current;
    if (calcOp === '-') result = calcPrev - current;
    if (calcOp === '*') result = calcPrev * current;
    if (calcOp === '/') result = current !== 0 ? calcPrev / current : 'Error';

    setCalcDisplay(result === 'Error' ? 'Error' : String(Number(result.toFixed(2))));
    setCalcPrev(null);
    setCalcOp(null);
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcPrev(null);
    setCalcOp(null);
  };

  const handleCheckout = async (andPrint = false) => {
    if (cart.length === 0) return;
    
    const confirmMsg = `¿Proceder con la venta por Q${total.toFixed(2)}?\nSe descontará físicamente del stock de ${currentBranch}.`;
    if (!window.confirm(confirmMsg)) return;
    
    // Descontar inventario
    const promises = cart.map(item => updateProductStock(item.product.id, currentBranch, -item.quantity));
    await Promise.all(promises);

    // Registrar venta en historial
    const saleRecord = {
      id: 'VEN-' + Date.now().toString(36).toUpperCase(),
      branch: currentBranch,
      cashier: currentUser?.username || 'Cajero',
      client: clientData,
      items: cart.map(c => ({
        id: c.product.id,
        name: c.product.name,
        price: c.product.price,
        quantity: c.quantity
      })),
      subtotal,
      discountAmount,
      total,
      date: new Date().toISOString()
    };
    await recordSale(saleRecord);

    if (andPrint) {
      generateInvoicePDF({
        cart,
        clientData,
        subtotal,
        discountAmount,
        total,
        branch: currentBranch,
        cashierName: currentUser?.username
      });
    }

    clearCart();
    setDiscountType('none');
    setDiscountValue(0);
    alert('¡Venta completada con éxito y descontada del inventario!');
    navigate('/productos');
  };

  return (
    <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '8px 0' }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/productos" className="modern-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={20} /> Volver a Productos
        </Link>
        <button onClick={() => clearCart()} className="icon-btn" style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>
          Vaciar Cesta
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* COLUMNA 1: LISTADO DE PRODUCTOS */}
        <div className="modern-box" style={{ display: 'flex', flexDirection: 'column', minHeight: '520px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-primary-dark)' }}>
              <ShoppingCart size={28} color="var(--color-primary)" /> Carrito de Venta
            </h2>
            <span style={{ background: 'var(--color-bg)', color: 'var(--color-primary-dark)', padding: '6px 14px', borderRadius: '14px', fontWeight: '800', fontSize: '0.95rem', border: '1px solid var(--color-border)' }}>
              {cart.reduce((a, c) => a + c.quantity, 0)} Items
            </span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--color-text-light)', marginTop: '80px' }}>
                <ShoppingCart size={60} style={{ opacity: 0.15, margin: '0 auto 20px' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Cesta Vacía</h3>
                <p style={{ marginTop: '6px', fontSize: '0.95rem' }}>Selecciona productos en el Catálogo o usa el lector óptico.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} style={{ display: 'flex', gap: '12px', background: 'var(--color-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--color-border)', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--color-primary-dark)' }}>{item.product.name}</div>
                    <div style={{ color: 'var(--color-text-light)', fontSize: '0.8rem' }}>Precio unitario: Q{item.product.price.toFixed(2)}</div>
                    <div style={{ color: 'var(--color-primary)', fontWeight: '800', fontSize: '1.1rem', marginTop: '4px' }}>
                      Q{(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <button className="icon-btn" style={{ padding: 4, color: 'var(--color-danger)' }} onClick={() => updateCartQuantity(item.product.id, 0)} title="Remover">
                      <Trash2 size={18} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '4px 6px' }}>
                      <button className="icon-btn" style={{ padding: 2 }} onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}><Minus size={15} /></button>
                      <input 
                        type="number"
                        min="1"
                        max={item.product.stock[currentBranch] || 1}
                        value={item.quantity}
                        onChange={(e) => updateCartQuantity(item.product.id, parseInt(e.target.value) || 1)}
                        style={{ width: '42px', textAlign: 'center', border: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '0.95rem' }}
                      />
                      <button 
                        className="icon-btn" 
                        style={{ padding: 2 }} 
                        disabled={item.quantity >= (item.product.stock[currentBranch] || 0)}
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA 2: DATOS DEL CLIENTE Y RESUMEN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* DATOS DEL CLIENTE */}
          <div className="modern-box">
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '14px', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} color="var(--color-primary)" /> Datos para Factura (Opcionales)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-light)' }}>NIT (o CF)</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input 
                    type="text" 
                    className="modern-input" 
                    value={clientData.nit}
                    onChange={e => setClientData({ ...clientData, nit: e.target.value })}
                    placeholder="CF o NIT..."
                  />
                  <button 
                    type="button" 
                    className="modern-btn" 
                    style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    onClick={() => setClientData({ ...clientData, nit: 'CF' })}
                  >
                    CF
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-light)' }}>Nombre del Cliente</label>
                <input 
                  type="text" 
                  className="modern-input" 
                  value={clientData.name}
                  onChange={e => setClientData({ ...clientData, name: e.target.value })}
                  placeholder="Consumidor Final"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-light)' }}>Dirección</label>
                <input 
                  type="text" 
                  className="modern-input" 
                  value={clientData.address}
                  onChange={e => setClientData({ ...clientData, address: e.target.value })}
                  placeholder="Ciudad..."
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-light)' }}>Teléfono</label>
                <input 
                  type="text" 
                  className="modern-input" 
                  value={clientData.phone}
                  onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                  placeholder="Opcional..."
                />
              </div>
            </div>
          </div>

          {/* TOTAL Y ACCIONES */}
          <div className="modern-box">
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>
              Totales y Cobro
            </h3>

            {/* DESCUENTOS */}
            <div style={{ marginBottom: '16px', background: 'var(--color-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)', marginBottom: '8px' }}>
                <Tag size={16} /> Descuento / Promoción
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select className="modern-input" style={{ flex: 1 }} value={discountType} onChange={(e) => { setDiscountType(e.target.value); setDiscountValue(0); }}>
                  <option value="none">Sin Descuento</option>
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto Fijo (Q)</option>
                </select>
                {discountType !== 'none' && (
                  <input 
                    type="number" 
                    className="modern-input" 
                    style={{ width: '90px' }} 
                    placeholder="Valor" 
                    min="0"
                    value={discountValue || ''}
                    onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                  />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.95rem', color: 'var(--color-text-light)' }}>
              <span>Subtotal</span>
              <strong>Q{subtotal.toFixed(2)}</strong>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.95rem', color: 'var(--color-danger)' }}>
                <span>Descuento</span>
                <strong>- Q{discountAmount.toFixed(2)}</strong>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px 0', background: 'rgba(37,51,124,0.05)', padding: '16px', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--color-text-light)', textTransform: 'uppercase' }}>Total Final</span>
              <strong style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', lineHeight: '1' }}>Q{total.toFixed(2)}</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="modern-btn modern-btn-primary" 
                style={{ width: '100%', padding: '16px', fontSize: '1.05rem', background: cart.length === 0 ? 'var(--color-border)' : 'var(--color-success)', color: cart.length === 0 ? 'var(--color-text-light)' : 'white' }}
                disabled={cart.length === 0}
                onClick={() => handleCheckout(true)}
              >
                <Printer size={20} /> Cobrar e Imprimir PDF
              </button>

              <button 
                className="modern-btn" 
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
                disabled={cart.length === 0}
                onClick={() => handleCheckout(false)}
              >
                <CheckCircle size={18} /> Solo Cobrar (Sin PDF)
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA 3: CALCULADORA DE CAJA */}
        <div className="modern-box" style={{ background: 'var(--color-surface)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '14px', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={22} color="var(--color-primary)" /> Calculadora de Caja
          </h3>

          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '10px' }}>
            Calcula vuelto o sumatorias rápidamente sin salir de la pantalla.
          </p>

          {/* DISPLAY */}
          <div style={{ background: '#0f172a', color: '#38bdf8', padding: '16px', borderRadius: '12px', textAlign: 'right', fontSize: '1.8rem', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '12px', overflow: 'hidden' }}>
            {calcDisplay}
          </div>

          {/* BOTONES CALCULADORA */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            <button type="button" className="modern-btn" style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' }} onClick={handleCalcClear}>C</button>
            <button type="button" className="modern-btn" style={{ fontWeight: 'bold' }} onClick={() => handleCalcOp('/')}>÷</button>
            <button type="button" className="modern-btn" style={{ fontWeight: 'bold' }} onClick={() => handleCalcOp('*')}>×</button>
            <button type="button" className="modern-btn" style={{ fontWeight: 'bold' }} onClick={() => handleCalcOp('-')}>-</button>

            {[7, 8, 9].map(n => (
              <button key={n} type="button" className="modern-btn" style={{ fontSize: '1.1rem', fontWeight: 'bold' }} onClick={() => handleCalcNum(n)}>{n}</button>
            ))}
            <button type="button" className="modern-btn" style={{ fontWeight: 'bold' }} onClick={() => handleCalcOp('+')}>+</button>

            {[4, 5, 6].map(n => (
              <button key={n} type="button" className="modern-btn" style={{ fontSize: '1.1rem', fontWeight: 'bold' }} onClick={() => handleCalcNum(n)}>{n}</button>
            ))}
            <button type="button" className="modern-btn modern-btn-primary" style={{ gridRow: 'span 2', height: '100%', fontSize: '1.4rem' }} onClick={handleCalcEquals}>=</button>

            {[1, 2, 3].map(n => (
              <button key={n} type="button" className="modern-btn" style={{ fontSize: '1.1rem', fontWeight: 'bold' }} onClick={() => handleCalcNum(n)}>{n}</button>
            ))}

            <button type="button" className="modern-btn" style={{ gridColumn: 'span 2', fontSize: '1.1rem', fontWeight: 'bold' }} onClick={() => handleCalcNum(0)}>0</button>
            <button type="button" className="modern-btn" style={{ fontWeight: 'bold' }} onClick={() => handleCalcNum('.')}>.</button>
          </div>

          {/* CÁLCULO DE CAMBIO RÁPIDO */}
          <div style={{ marginTop: '16px', background: 'var(--color-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-light)' }}>Atajo de vuelto rápido:</span>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              {[50, 100, 200].map(billete => (
                <button 
                  key={billete}
                  type="button" 
                  className="modern-btn" 
                  style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                  onClick={() => {
                    const cambio = billete - total;
                    alert(`Pago con Q${billete}.00\nTotal: Q${total.toFixed(2)}\nVuelto: Q${cambio >= 0 ? cambio.toFixed(2) : '0.00 (Falta dinero)'}`);
                  }}
                >
                  Q{billete}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;
