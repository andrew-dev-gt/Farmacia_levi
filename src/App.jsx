import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import Home from './pages/Home';
import Products from './pages/Products';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Transfers from './pages/Transfers';
import QualityControl from './pages/QualityControl';
import AdminDashboard from './pages/AdminDashboard';
import CartView from './pages/CartView';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import { 
  Home as HomeIcon, Scan, Truck, AlertTriangle, Shield, Menu, X, 
  Package, UserCircle, LogOut, PlusSquare, ShoppingCart, 
  Building2, ShoppingBag, PanelLeftClose, PanelLeftOpen 
} from 'lucide-react';

const LoginScreen = () => {
  const { login } = useInventory();
  const [typedPassword, setTypedPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const submitLogin = (e) => {
    e.preventDefault();
    if (login(typedPassword)) {
       setErrorMsg('');
    } else {
       setErrorMsg('Credencial incorrecta o no autorizada.');
    }
  };

  return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
         <div className="modern-box" style={{ maxWidth: '400px', width: '90%', padding: '40px', textAlign: 'center' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
               <div style={{ width: '80px', height: '80px', background: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                 <Shield size={40} />
               </div>
            </div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>Farmacias Levy</h1>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '32px' }}>Intranet Corporativa</p>
            
            <form onSubmit={submitLogin}>
               <input 
                 type="password" 
                 placeholder="Ingrese token de acceso..." 
                 className="modern-input" 
                 style={{ textAlign: 'center', letterSpacing: '2px', fontSize: '1.2rem', marginBottom: '16px' }}
                 value={typedPassword}
                 onChange={e => setTypedPassword(e.target.value)}
                 autoFocus
               />
               {errorMsg && <p style={{ color: 'var(--color-danger)', fontSize: '0.9rem', marginBottom: '16px', fontWeight: 'bold' }}>{errorMsg}</p>}
               <button type="submit" className="modern-btn modern-btn-primary" style={{ width: '100%' }}>Ingresar Seguro</button>
            </form>
         </div>
      </div>
  );
};

// Sidebar para Administradores y Super Administradores
const Sidebar = ({ isMobileOpen, setMobileOpen }) => {
  const { currentBranch, setCurrentBranch, role, currentUser, branches, logout, cart, sidebarCollapsed, setSidebarCollapsed } = useInventory();
  const location = useLocation();

  const handleLogout = () => {
      if (window.confirm('¿Estás seguro de cerrar sesión y abandonar esta terminal?')) {
          logout();
      }
  };

  const navLinks = [
    { path: '/', label: 'Inicio', icon: <HomeIcon size={20} /> },
    { path: '/productos', label: 'Catálogo Productos', icon: <Package size={20} /> },
    { path: '/cesta', label: 'Cesta de Ventas', icon: <ShoppingCart size={20} /> },
    { path: '/operacion', label: 'Lector Óptico (Caja)', icon: <Scan size={20} /> },
    { path: '/transferencias', label: 'Logística Envíos', icon: <Truck size={20} /> },
    { path: '/calidad', label: 'Calidad & Vencimiento', icon: <AlertTriangle size={20} /> }
  ];

  if (role === 'admin' || role === 'superadmin') {
    navLinks.push({ path: '/proveedores', label: 'Proveedores', icon: <Building2 size={20} /> });
    navLinks.push({ path: '/compras', label: 'Compras Distribuidores', icon: <ShoppingBag size={20} /> });
    navLinks.push({ path: '/admin', label: 'Panel Administrativo', icon: <Shield size={20} /> });
  }

  const isCollapsed = sidebarCollapsed;

  return (
    <>
      {isMobileOpen && <div className="mobile-overlay" style={{ display: 'block' }} onClick={() => setMobileOpen(false)} />}
      <aside 
        className={`sidebar ${isMobileOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`} 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          width: isCollapsed ? '72px' : '280px',
          transition: 'width 0.25s ease'
        }}
      >
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isCollapsed ? '16px 12px' : '20px 24px' }}>
          {!isCollapsed && (
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Levy <PlusSquare size={18} color="var(--color-danger)" />
            </h2>
          )}
          <button 
            className="icon-btn" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={isCollapsed ? 'Expandir menú lateral' : 'Ocultar menú lateral'}
            style={{ margin: isCollapsed ? '0 auto' : '0' }}
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
          <button className="mobile-only icon-btn" onClick={() => setMobileOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {!isCollapsed && (
          <div className="sidebar-section">
            <label style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', fontWeight: '700', letterSpacing: '0.5px' }}>SUCURSAL ACTUAL</label>
            {role === 'superadmin' ? (
                <select 
                  className="modern-input" 
                  style={{ marginTop: '6px', padding: '8px 10px', fontWeight: '600', fontSize: '0.85rem', color: 'var(--color-primary-dark)' }}
                  value={currentBranch} 
                  onChange={(e) => setCurrentBranch(e.target.value)}
                >
                  {branches.map(b => (
                    <option key={b} value={b}>📌 {b}</option>
                  ))}
                </select>
            ) : (
                <div style={{ marginTop: '6px', padding: '8px 10px', background: 'var(--color-bg)', borderRadius: '10px', border: '1px solid var(--color-border)', color: 'var(--color-primary-dark)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                   📌 {currentBranch}
                </div>
            )}
          </div>
        )}
        
        <nav className="sidebar-nav" style={{ flex: 1, padding: isCollapsed ? '12px 6px' : '16px 12px' }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const isCart = link.path === '/cesta';
            const cartQty = isCart ? cart.reduce((a, c) => a + c.quantity, 0) : 0;
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
                title={isCollapsed ? link.label : ''}
                style={{ 
                  display: 'flex', 
                  justifyContent: isCollapsed ? 'center' : 'space-between', 
                  alignItems: 'center',
                  padding: isCollapsed ? '12px 0' : '12px 16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   {link.icon}
                   {!isCollapsed && <span style={{ fontWeight: isActive ? '700' : '500', fontSize: '0.92rem' }}>{link.label}</span>}
                </div>
                {!isCollapsed && isCart && cartQty > 0 && (
                   <span className="cart-badge-inline pulse-anim">{cartQty}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card at Bottom */}
        <div style={{ padding: isCollapsed ? '12px 6px' : '14px 16px', background: 'var(--color-bg)', borderRadius: '14px', border: '1px solid var(--color-border)', margin: isCollapsed ? '8px 4px' : '12px 14px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserCircle color="var(--color-primary)" size={isCollapsed ? 26 : 30} />
              {!isCollapsed && (
                <div>
                   <div style={{ fontWeight: '800', fontSize: '0.88rem' }}>{currentUser.username}</div>
                   <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: '700' }}>{currentUser.role}</div>
                </div>
              )}
           </div>
           {!isCollapsed && (
             <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={handleLogout} title="Cerrar sesión">
                <LogOut size={18} />
             </button>
           )}
        </div>
      </aside>
    </>
  );
};

// VISTA EXCLUSIVA PARA EMPLEADOS (Sin menú lateral, solo productos y carrito)
const EmployeeViewLayout = () => {
  const { currentUser, logout, cart, currentBranch } = useInventory();

  const handleLogout = () => {
    if (window.confirm('¿Deseas cerrar tu sesión como cajero/empleado?')) {
      logout();
    }
  };

  const cartCount = cart.reduce((a, c) => a + c.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      {/* HEADER MINIMALISTA DE EMPLEADO */}
      <header style={{ 
        background: 'var(--color-surface)', 
        borderBottom: '1px solid var(--color-border)', 
        padding: '14px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-primary-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Farmacia Levy <PlusSquare size={18} color="var(--color-danger)" />
          </h2>
          <span style={{ fontSize: '0.85rem', background: 'var(--color-bg)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontWeight: '600', color: 'var(--color-primary)' }}>
            📍 {currentBranch}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* BOTÓN AL CARRITO */}
          <Link 
            to="/cesta" 
            className="modern-btn modern-btn-primary" 
            style={{ padding: '8px 16px', fontSize: '0.9rem', borderRadius: '10px' }}
          >
            <ShoppingCart size={18} />
            <span>Cesta</span>
            {cartCount > 0 && (
              <span style={{ background: 'var(--color-danger)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* NOMBRE DE EMPLEADO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--color-bg)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
            <UserCircle size={22} color="var(--color-primary)" />
            <span style={{ fontWeight: '750', fontSize: '0.9rem' }}>{currentUser.username}</span>
          </div>

          {/* BOTÓN CERRAR SESIÓN */}
          <button 
            className="modern-btn modern-btn-danger" 
            onClick={handleLogout} 
            style={{ padding: '8px 14px', fontSize: '0.85rem', borderRadius: '10px' }}
            title="Cerrar sesión"
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      {/* CONTENIDO SOLO CON PRODUCTOS Y CESTA */}
      <main style={{ flex: 1, padding: '20px 24px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/productos" replace />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/cesta" element={<CartView />} />
          <Route path="/operacion" element={<EmployeeDashboard />} />
          <Route path="*" element={<Navigate to="/productos" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const LayoutContainer = () => {
    const { currentUser, cart, role, sidebarCollapsed } = useInventory();
    const [isMobileOpen, setMobileOpen] = useState(false);

    if (!currentUser) {
        return <LoginScreen />;
    }

    // SI EL USUARIO ES EMPLEADO, RENDERIZAR VISTA SIN SIDEBAR
    if (role === 'empleado') {
      return <EmployeeViewLayout />;
    }

    // VISTA PARA ADMINISTRADOR Y SUPERADMINISTRADOR (Con menú lateral completo colapsable)
    return (
       <div className="app-layout">
          <Sidebar isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen} />
          
          <main 
            className="main-content"
            style={{ 
              width: sidebarCollapsed ? 'calc(100% - 72px)' : 'calc(100% - 280px)',
              transition: 'width 0.25s ease'
            }}
          >
            <header className="mobile-header">
              <button className="icon-btn" onClick={() => setMobileOpen(true)} style={{ color: 'var(--color-primary-dark)' }}>
                <Menu size={28} />
              </button>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 Farmacia Levy <PlusSquare size={20} color="var(--color-danger)" />
              </h2>
              <Link to="/cesta" className="icon-btn" style={{ position: 'relative', color: 'var(--color-primary-dark)' }}>
                 <ShoppingCart size={28} />
                 {cart.length > 0 && <span className="cart-badge-inline pulse-anim" style={{ position: 'absolute', top: -5, right: -5, padding: '2px 6px', fontSize: '0.7rem' }}>{cart.reduce((a,c)=>a+c.quantity,0)}</span>}
              </Link>
            </header>
            
            <div style={{ padding: '24px 20px', flex: 1, width: '100%' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/productos" element={<Products />} />
                <Route path="/operacion" element={<EmployeeDashboard />} />
                <Route path="/transferencias" element={<Transfers />} />
                <Route path="/calidad" element={<QualityControl />} />
                <Route path="/proveedores" element={<Suppliers />} />
                <Route path="/compras" element={<Purchases />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/cesta" element={<CartView />} />
              </Routes>
            </div>
          </main>
        </div>
    );
};

function App() {
  return (
    <InventoryProvider>
      <Router>
         <LayoutContainer />
      </Router>
    </InventoryProvider>
  );
}

export default App;
