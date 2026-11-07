import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Package, Search, Filter, ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Products = () => {
  const { products, systemSettings, role, currentBranch, branches, addToCart, cart } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal para agregar con cantidad seleccionada
  const [modalProduct, setModalProduct] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState(1);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.id.includes(searchTerm) || 
                          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === '' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleOpenAddModal = (product, e) => {
    e.stopPropagation();
    setModalProduct(product);
    setQuantityToAdd(1);
  };

  const handleConfirmAddToCart = () => {
    if (!modalProduct) return;
    const qty = parseInt(quantityToAdd, 10);
    if (isNaN(qty) || qty <= 0) return;
    const availableStock = modalProduct.stock[currentBranch] || 0;
    if (qty > availableStock) {
      alert(`Solo hay ${availableStock} unidades disponibles en ${currentBranch}`);
      return;
    }
    addToCart(modalProduct, qty);
    setModalProduct(null);
  };

  return (
    <div className="container" style={{ padding: '8px 0px', position: 'relative' }}>
      {/* HEADER Y FILTROS */}
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--color-primary-dark)' }}>
            Catálogo de Productos
          </h1>
          <p style={{ color: 'var(--color-text-light)', fontSize: '1rem', marginTop: '4px' }}>
            Sucursal: <strong>{currentBranch}</strong> — Vista compacta y optimizada para ventas rápidas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1, maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', flex: 1, minWidth: '160px' }}>
            <Filter size={18} color="var(--color-text-light)" />
            <select 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--color-text)', appearance: 'none' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', flex: 2, minWidth: '220px' }}>
            <Search size={18} color="var(--color-text-light)" />
            <input 
              type="text" 
              placeholder="Buscar producto o código..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--color-text)' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* GRID COMPACTO DE PRODUCTOS (Muchos más productos por fila, diseño limpio) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', 
        gap: '12px',
        marginBottom: '40px'
      }}>
        {filteredProducts.map(product => {
          const localStock = product.stock[currentBranch] || 0;
          const isOutOfStock = localStock <= 0;

          return (
            <div 
              key={product.id} 
              className="modern-box product-card-compact" 
              style={{ 
                padding: '12px', 
                borderRadius: '14px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                gap: '8px',
                opacity: isOutOfStock ? 0.6 : 1,
                cursor: 'pointer'
              }}
              onClick={(e) => !isOutOfStock && handleOpenAddModal(product, e)}
            >
              {/* IMAGEN DEL PRODUCTO */}
              <div style={{ 
                width: '100%', 
                height: '110px', 
                borderRadius: '10px', 
                background: 'rgba(37, 51, 124, 0.04)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden',
                position: 'relative'
              }}>
                {product.image ? (
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Package size={36} color="var(--color-accent)" />
                )}
                <span style={{ 
                  position: 'absolute', 
                  top: '6px', 
                  right: '6px', 
                  fontSize: '0.7rem', 
                  padding: '2px 6px', 
                  borderRadius: '6px', 
                  fontWeight: '800',
                  background: isOutOfStock ? 'rgba(239,68,68,0.9)' : 'rgba(16,185,129,0.9)',
                  color: 'white'
                }}>
                  {isOutOfStock ? 'Agotado' : `${localStock} un.`}
                </span>
              </div>

              {/* INFORMACIÓN BÁSICA: NOMBRE Y PRECIO */}
              <div>
                <h4 style={{ 
                  margin: '0', 
                  fontSize: '0.88rem', 
                  fontWeight: '700', 
                  lineHeight: '1.25',
                  height: '36px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  color: 'var(--color-primary-dark)'
                }}>
                  {product.name}
                </h4>
                
                <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: '850', color: 'var(--color-primary)' }}>
                    Q{product.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* BOTÓN RÁPIDO PARA AGREGAR */}
              <button 
                type="button"
                className="modern-btn modern-btn-primary"
                disabled={isOutOfStock}
                onClick={(e) => handleOpenAddModal(product, e)}
                style={{ 
                  padding: '6px 10px', 
                  fontSize: '0.8rem', 
                  width: '100%', 
                  borderRadius: '8px',
                  marginTop: '4px'
                }}
              >
                <ShoppingCart size={14} /> Añadir
              </button>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-light)' }}>
          No se encontraron productos coincidentes.
        </div>
      )}

      {/* BOTÓN FLOTANTE DIRECTO AL CARRITO */}
      <Link 
        to="/cesta" 
        className="floating-cart-btn"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          background: 'var(--color-primary)',
          color: 'white',
          padding: '14px 22px',
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 24px rgba(37,51,124,0.4)',
          textDecoration: 'none',
          fontWeight: '800',
          fontSize: '1rem',
          zIndex: 99,
          transition: 'transform 0.2s'
        }}
      >
        <ShoppingCart size={22} />
        <span>Ver Cesta</span>
        {totalCartItems > 0 && (
          <span style={{ 
            background: 'var(--color-danger)', 
            color: 'white', 
            borderRadius: '50%', 
            width: '24px', 
            height: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: '900'
          }}>
            {totalCartItems}
          </span>
        )}
      </Link>

      {/* POP-UP / MODAL PARA SELECCIONAR CANTIDAD AL AGREGAR */}
      {modalProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }} onClick={() => setModalProduct(null)}>
          <div className="modern-box" style={{ width: '100%', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>
              {modalProduct.name}
            </h3>
            {modalProduct.presentation && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>
                {modalProduct.presentation}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg)', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Precio Unitario:</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '850', color: 'var(--color-primary)' }}>
                  Q{modalProduct.price.toFixed(2)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Stock en Sucursal:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-success)' }}>
                  {modalProduct.stock[currentBranch] || 0} un.
                </div>
              </div>
            </div>

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)', marginBottom: '8px' }}>
              ¿Cuántas unidades deseas agregar?
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <button 
                type="button" 
                className="modern-btn" 
                style={{ padding: '10px 16px' }}
                onClick={() => setQuantityToAdd(q => Math.max(1, q - 1))}
              >
                <Minus size={18} />
              </button>
              <input 
                type="number" 
                min="1" 
                max={modalProduct.stock[currentBranch] || 1}
                className="modern-input" 
                style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: '800' }}
                value={quantityToAdd}
                onChange={e => setQuantityToAdd(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button 
                type="button" 
                className="modern-btn" 
                style={{ padding: '10px 16px' }}
                onClick={() => setQuantityToAdd(q => Math.min(modalProduct.stock[currentBranch] || 1, q + 1))}
              >
                <Plus size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Subtotal a añadir:</span>
              <span style={{ fontSize: '1.3rem', fontWeight: '850', color: 'var(--color-primary-dark)' }}>
                Q{(modalProduct.price * quantityToAdd).toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="modern-btn" style={{ flex: 1 }} onClick={() => setModalProduct(null)}>
                Cancelar
              </button>
              <button type="button" className="modern-btn modern-btn-primary" style={{ flex: 2 }} onClick={handleConfirmAddToCart}>
                <Check size={18} /> Añadir a la Cesta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
