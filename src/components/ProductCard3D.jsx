import React from 'react';
import { Plus } from 'lucide-react';

const ProductCard3D = ({ product, branch, onAddCart }) => {
  if (!product) return null;
  
  const stock = product.stock[branch] || 0;
  const isLowStock = stock <= 5;
  
  return (
    <div className="modern-box product-card" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '16px',
      maxWidth: '350px',
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center' }}>
        <img 
          src={product.image} 
          alt={product.name} 
          style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '12px', boxShadow: 'var(--neumorphic-shadow)' }} 
        />
      </div>
      
      <div>
        <h3 style={{ fontSize: '1.25rem' }}>{product.name}</h3>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>{product.description}</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
          ${product.price.toFixed(2)}
        </span>
        <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
          <div>Lote: <span style={{ fontWeight: '600' }}>{product.lot}</span></div>
          <div>Vence: <span style={{ fontWeight: '600' }}>{product.expiryDate}</span></div>
        </div>
      </div>
      
      <div style={{ 
        padding: '12px', 
        borderRadius: '8px', 
        background: isLowStock ? 'var(--color-warning)' : 'var(--color-bg)',
        boxShadow: 'var(--neumorphic-shadow-inset)',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Stock Local ({branch})</span>
        <span style={{ fontWeight: 'bold' }}>{stock} un.</span>
      </div>
      
      <button 
        className="neumorphic-btn neumorphic-btn-primary" 
        onClick={() => onAddCart(product)}
        disabled={stock <= 0}
        style={{ width: '100%', opacity: stock <= 0 ? 0.5 : 1 }}
      >
        <Plus size={20} />
        Añadir al Carrito
      </button>
    </div>
  );
};

export default ProductCard3D;
