import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { Package, Truck, AlertTriangle, ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { currentBranch, products, transfers } = useInventory();
  const [searchResults, setSearchResults] = React.useState([]);
  
  // Calculate specific branch metrics
  const branchProducts = products.filter(p => (p.stock[currentBranch] || 0) > 0);
  const lowStockCount = branchProducts.filter(p => (p.stock[currentBranch] || 0) <= 5).length;
  
  const pendingReceives = transfers.filter(t => t.toBranch === currentBranch && t.status === 'pending').length;
  const pendingSends = transfers.filter(t => t.fromBranch === currentBranch && t.status === 'pending').length;

  return (
    <div className="container" style={{ padding: '8px 0px' }}>
      <header style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--color-primary-dark)' }}>Inicio - {currentBranch}</h1>
            <p style={{ color: 'var(--color-text-light)', fontSize: '1.2rem', marginTop: '8px' }}>Resumen operativo de tu sucursal en tiempo real.</p>
          </div>
          <div style={{ flex: 1, minWidth: '300px', maxWidth: '500px', position: 'relative' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
               <Search size={20} color="var(--color-text-light)" />
               <input 
                 type="text" 
                 placeholder="Buscar producto..." 
                 style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem', color: 'var(--color-text)' }}
                 onChange={(e) => {
                    const term = e.target.value.toLowerCase();
                    if(!term) {
                       setSearchResults([]);
                       return;
                    }
                    setSearchResults(products.filter(p => p.name.toLowerCase().includes(term) || p.id.includes(term) || (p.description && p.description.toLowerCase().includes(term))).slice(0, 5));
                 }}
               />
             </div>
             {searchResults && searchResults.length > 0 && (
               <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: 'var(--color-surface)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)', zIndex: 100, overflow: 'hidden' }}>
                  {searchResults.map(p => (
                     <Link key={p.id} to={`/productos`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', textDecoration: 'none', color: 'inherit' }}>
                       <Package size={20} color="var(--color-primary)" />
                       <div>
                         <div style={{ fontWeight: '700' }}>{p.name}</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{p.id} | Stock aquí: {p.stock[currentBranch] || 0}</div>
                       </div>
                     </Link>
                  ))}
               </div>
             )}
          </div>
        </div>
      </header>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        
        <Link to="/productos" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="modern-box" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-primary)' }}>
              <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '16px' }}><Package size={28} /></div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '600' }}>Inventario Activo</h3>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: '800', margin: '8px 0 0 0', color: 'var(--color-text)' }}>
              {branchProducts.length} <span style={{fontSize:'1.1rem', color:'var(--color-text-light)', fontWeight:'500'}}>SKUs</span>
            </p>
          </div>
        </Link>

        <Link to="/calidad" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="modern-box" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', cursor: 'pointer', borderTop: lowStockCount > 0 ? '4px solid var(--color-danger)' : '1px solid rgba(226,232,240,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-danger)' }}>
              <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '16px' }}><AlertTriangle size={28} /></div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '600' }}>Stock Bajo</h3>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: '800', margin: '8px 0 0 0', color: 'var(--color-text)' }}>{lowStockCount}</p>
          </div>
        </Link>

        <Link to="/transferencias" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="modern-box" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-accent)' }}>
              <div style={{ padding: '12px', background: '#f5f3ff', borderRadius: '16px' }}><Truck size={28} /></div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '600', color: 'var(--color-primary-dark)' }}>Transferencias</h3>
            </div>
            <div style={{ display: 'flex', gap: '32px', marginTop: '8px' }}>
              <div>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', margin: '0 0 4px 0', fontWeight: '500' }}>Por Recibir</p>
                <p style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--color-text)' }}>{pendingReceives}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', margin: '0 0 4px 0', fontWeight: '500' }}>Enviados</p>
                <p style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--color-text)' }}>{pendingSends}</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions Flow */}
      <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: '700' }}>Accesos Rápidos</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <Link to="/operacion" style={{ textDecoration: 'none' }}>
          <div className="modern-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'var(--gradient-primary)', color: 'white', border: 'none', padding: '24px 32px' }}>
            <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>Escanear Producto</span>
            <ArrowRight size={24} />
          </div>
        </Link>
        <Link to="/transferencias" style={{ textDecoration: 'none' }}>
          <div className="modern-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '24px 32px' }}>
            <span style={{ fontWeight: '600', color: 'var(--color-text)', fontSize: '1.1rem' }}>Gestionar Envíos</span>
            <ArrowRight color="var(--color-text-light)" />
          </div>
        </Link>
        <Link to="/calidad" style={{ textDecoration: 'none' }}>
          <div className="modern-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '24px 32px' }}>
            <span style={{ fontWeight: '600', color: 'var(--color-text)', fontSize: '1.1rem' }}>Ver Alertas</span>
            <ArrowRight color="var(--color-text-light)" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Home;
