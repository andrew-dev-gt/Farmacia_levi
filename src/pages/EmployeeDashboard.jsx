import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import Scanner from '../components/Scanner';
import { Package, ShoppingCart, Plus, Minus, Check, X, AlertCircle } from 'lucide-react';

const EmployeeDashboard = () => {
  const { currentBranch, getProductById, products, addToCart } = useInventory();
  const [searchList, setSearchList] = useState([]);
  const [errorMSG, setErrorMSG] = useState('');

  // MODAL / POP-UP DE ESCANEO
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scanQty, setScanQty] = useState(1);

  const handleProductFound = (product) => {
    setErrorMSG('');
    const stockAvailable = product.stock[currentBranch] || 0;
    if (stockAvailable <= 0) {
      setErrorMSG(`El producto "${product.name}" no tiene existencias físicas en ${currentBranch}.`);
      return;
    }
    setScannedProduct(product);
    setScanQty(1);
  };

  const handleManualSearch = async (value) => {
    const val = value.trim().toLowerCase();
    setErrorMSG('');
    if (!val) { setSearchList([]); return; }
    
    // SKU exacto primero
    const exactMatch = await getProductById(val);
    if (exactMatch) {
      handleProductFound(exactMatch);
      setSearchList([]);
      return;
    }
    
    // Búsqueda por texto
    const termMatches = products.filter(p => 
      p.name.toLowerCase().includes(val) || 
      (p.description && p.description.toLowerCase().includes(val))
    );
    if (termMatches.length > 0) {
      setSearchList(termMatches);
    } else {
      setSearchList([]);
      setErrorMSG('Producto no encontrado.');
    }
  };

  const handleConfirmScanAdd = () => {
    if (!scannedProduct) return;
    const qty = parseInt(scanQty, 10);
    if (isNaN(qty) || qty <= 0) return;
    const localStock = scannedProduct.stock[currentBranch] || 0;
    if (qty > localStock) {
      alert(`Solo hay ${localStock} disponibles en esta sucursal.`);
      return;
    }
    addToCart(scannedProduct, qty);
    setScannedProduct(null);
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <header>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary-dark)' }}>
            Lector de Entradas y Caja Rápida
          </h1>
          <p style={{ color: 'var(--color-text-light)' }}>
            Sucursal: <strong>{currentBranch}</strong>. Al escanear un código se abrirá una ventana para elegir cuántas unidades agregar.
          </p>
        </header>

        <div className="modern-box">
          <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Escaneo con Cámara / Lector de Barras
          </h3>
          
          <div style={{ marginBottom: '24px' }}>
            <Scanner onScan={async (code) => {
              const p = await getProductById(code);
              if (p) {
                handleProductFound(p);
              } else {
                setErrorMSG(`Código "${code}" no registrado en el inventario.`);
              }
            }} />
          </div>
          
          <hr style={{ borderColor: 'var(--color-border)', margin: '32px 0' }}/>
          
          <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>
            Búsqueda Manual Alternativa
          </p>
          <input 
            type="text" 
            placeholder="Escribe código de barra o nombre del producto..." 
            className="modern-input"
            style={{ fontSize: '1.1rem', padding: '16px' }}
            onChange={(e) => handleManualSearch(e.target.value)}
          />
          {errorMSG && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', marginTop: '12px', fontWeight: 'bold' }}>
              <AlertCircle size={18} /> {errorMSG}
            </div>
          )}

          {searchList.length > 0 && (
            <div style={{ marginTop: '16px', background: 'var(--color-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-border)', maxHeight: '350px', overflowY: 'auto' }}>
              {searchList.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 8px', borderBottom: '1px solid var(--color-border)' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--color-text)' }}>
                      {p.name} {p.presentation && <span style={{ color: 'var(--color-text-light)', fontSize: '0.85rem' }}>{p.presentation}</span>}
                    </strong>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: (p.stock[currentBranch] || 0) > 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 'bold' }}>
                      Disponibles: {p.stock[currentBranch] || 0} unidades | Q{p.price.toFixed(2)}
                    </span>
                  </div>
                  <button 
                    className="modern-btn modern-btn-primary" 
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }} 
                    disabled={(p.stock[currentBranch] || 0) === 0}
                    onClick={() => {
                      handleProductFound(p);
                      setSearchList([]);
                    }}
                  >
                    Seleccionar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* POP-UP DE ESCANEO / SELECCIÓN DE CANTIDAD */}
      {scannedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="modern-box" style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
            <button className="icon-btn" style={{ position: 'absolute', top: '16px', right: '16px' }} onClick={() => setScannedProduct(null)}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'rgba(37,51,124,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={32} color="var(--color-primary)" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-light)' }}>
                  SKU: {scannedProduct.id}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-primary-dark)' }}>
                  {scannedProduct.name}
                </h3>
              </div>
            </div>

            <div style={{ background: 'var(--color-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Precio unitario:</span>
                <strong style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>Q{scannedProduct.price.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Existencias en {currentBranch}:</span>
                <strong style={{ color: 'var(--color-success)', fontSize: '1.1rem' }}>{scannedProduct.stock[currentBranch] || 0}</strong>
              </div>
            </div>

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
              Modificar cantidad a ingresar a la cesta:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <button 
                type="button" 
                className="modern-btn" 
                style={{ padding: '10px 16px' }}
                onClick={() => setScanQty(q => Math.max(1, q - 1))}
              >
                <Minus size={18} />
              </button>
              <input 
                type="number" 
                min="1"
                max={scannedProduct.stock[currentBranch] || 1}
                className="modern-input" 
                style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: '800' }}
                value={scanQty}
                onChange={e => setScanQty(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button 
                type="button" 
                className="modern-btn" 
                style={{ padding: '10px 16px' }}
                onClick={() => setScanQty(q => Math.min(scannedProduct.stock[currentBranch] || 1, q + 1))}
              >
                <Plus size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '10px', background: 'rgba(37,51,124,0.04)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>Total a cargar:</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)' }}>
                Q{(scannedProduct.price * scanQty).toFixed(2)}
              </strong>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="modern-btn" style={{ flex: 1 }} onClick={() => setScannedProduct(null)}>
                Cancelar
              </button>
              <button type="button" className="modern-btn modern-btn-primary" style={{ flex: 2 }} onClick={handleConfirmScanAdd}>
                <ShoppingCart size={18} /> Agregar a la Cesta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
