import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { TrendingUp, Activity, DollarSign, PackageOpen, Edit, Trash2, Plus, ShieldAlert, Check, Users, Settings, X, Lock, Building2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { products, transfers, branches, role, currentBranch, profiles, addProduct, updateProductDetails, deleteProduct, addBranch, addProfile, updateProfile, deleteProfile, systemSettings, setSystemSettings, currentUser, suppliers, purchases } = useInventory();
  
  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({ id: '', name: '', presentation: '', description: '', category: '', price: 0, lot: '', stock: {}, expiryDates: {} });
  const [isNewCategory, setIsNewCategory] = useState(false);
  
  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [currentProfile, setCurrentProfile] = useState({ id: '', username: '', role: 'empleado', password: '', branch: '' });

  // Super admin state
  const [newBranchName, setNewBranchName] = useState('');

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  // Calculate metrics
  const totalValue = products.reduce((acc, p) => {
    let stockSum = 0;
    branches.forEach(b => stockSum += (p.stock[b] || 0));
    return acc + (p.price * stockSum);
  }, 0);

  // Filter profiles based on role:
  // Superadmin sees all profiles.
  // Admin only sees profiles belonging to their branch.
  const visibleProfiles = profiles.filter(p => {
    if (role === 'superadmin') return true;
    return p.branch === currentBranch;
  });

  const openAddProductModal = () => {
    setEditMode(false);
    setIsNewCategory(false);
    let initStock = {}; let initExpiry = {};
    branches.forEach(b => { initStock[b] = 0; initExpiry[b] = ''; });
    setCurrentProduct({ id: '', name: '', presentation: '', description: '', category: '', price: 0, lot: '', stock: initStock, expiryDates: initExpiry });
    setShowProductModal(true);
  };

  const openEditProductModal = (product) => {
    setEditMode(true);
    setIsNewCategory(false);
    const p = JSON.parse(JSON.stringify(product));
    p.stock = p.stock || {}; p.expiryDates = p.expiryDates || {};
    branches.forEach(b => { p.stock[b] = p.stock[b] || 0; p.expiryDates[b] = p.expiryDates[b] || ''; });
    p.description = p.description || '';
    p.presentation = p.presentation || '';
    setCurrentProduct(p);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (editMode) {
      await updateProductDetails(currentProduct.id, currentProduct);
    } else {
      await addProduct(currentProduct);
    }
    setShowProductModal(false);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto completamente?')) {
      await deleteProduct(id);
    }
  };

  const openAddProfileModal = () => {
    setEditProfileMode(false);
    setCurrentProfile({
      id: Date.now().toString(),
      username: '',
      role: 'empleado',
      password: '',
      branch: role === 'superadmin' ? branches[0] : currentBranch,
      createdBy: currentUser?.id
    });
    setShowProfileModal(true);
  };

  const openEditProfileModal = (prof) => {
    setEditProfileMode(true);
    setCurrentProfile({ ...prof });
    setShowProfileModal(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!currentProfile.password || currentProfile.password.trim() === '') {
       alert("Es estrictamente obligatorio asignar una contraseña para el perfil.");
       return;
    }

    if (editProfileMode) {
       updateProfile(currentProfile.id, currentProfile);
       alert('Empleado/Usuario actualizado con éxito.');
    } else {
       addProfile({ ...currentProfile, createdBy: currentUser?.id });
       alert('Empleado registrado exitosamente.');
    }
    setShowProfileModal(false);
  };

  const handleDeleteProfile = (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar al empleado "${name}"?`)) {
      deleteProfile(id);
    }
  };

  const handleAddBranch = async () => {
    if (newBranchName.trim() !== '') {
      await addBranch(newBranchName.trim());
      setNewBranchName('');
    }
  };

  return (
    <div className="container" style={{ padding: '8px 0px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary-dark)' }}>
          Panel de Control - Administración
        </h1>
        <p style={{ color: 'var(--color-text-light)', fontSize: '1.1rem', marginTop: '6px' }}>
          Gestión integral {role === 'superadmin' ? 'Universal (Super Administrador)' : `para ${currentBranch}`}.
        </p>
      </header>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div className="modern-box" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
            <DollarSign size={26} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: 0, fontWeight: '600' }}>Valor Total Inventario</p>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: '800' }}>Q{totalValue.toFixed(2)}</h3>
          </div>
        </div>
        
        <div className="modern-box" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: '50%', background: 'rgba(37, 51, 124, 0.1)', color: 'var(--color-primary)' }}>
            <PackageOpen size={26} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: 0, fontWeight: '600' }}>Productos en Catálogo</p>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: '800' }}>{products.length}</h3>
          </div>
        </div>

        <Link to="/proveedores" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="modern-box" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
            <div style={{ padding: '14px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
              <Building2 size={26} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: 0, fontWeight: '600' }}>Proveedores Activos</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: '800' }}>{suppliers.length}</h3>
            </div>
          </div>
        </Link>
        
        <Link to="/compras" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="modern-box" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
            <div style={{ padding: '14px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
              <ShoppingBag size={26} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: 0, fontWeight: '600' }}>Compras Registradas</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: '800' }}>{purchases.length}</h3>
            </div>
          </div>
        </Link>
      </div>

      {/* GESTOR DE EMPLEADOS POR ADMINISTRADOR */}
      <div className="modern-box" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-primary-dark)' }}>
              <Users color="var(--color-primary)" /> Gestión de Empleados y Cajeros
            </h2>
            <p style={{ color: 'var(--color-text-light)', fontSize: '0.88rem', marginTop: '2px' }}>
              {role === 'superadmin' ? 'Como Super Administrador puedes ver y editar a todos los empleados de la cadena.' : `Mostrando los empleados bajo tu administración en: ${currentBranch}.`}
            </p>
          </div>
          <button className="modern-btn modern-btn-primary" onClick={openAddProfileModal}>
            <Plus size={18} /> Agregar Empleado
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-light)' }}>
                <th style={{ padding: '10px' }}>Nombre / Empleado</th>
                <th style={{ padding: '10px' }}>Rol</th>
                <th style={{ padding: '10px' }}>Sucursal</th>
                <th style={{ padding: '10px' }}>Seguridad</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleProfiles.map(prof => (
                <tr key={prof.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: '700' }}>
                    {prof.username}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '3px 8px', 
                      borderRadius: '6px', 
                      fontWeight: '800', 
                      textTransform: 'uppercase',
                      background: prof.role === 'superadmin' ? 'rgba(239,68,68,0.1)' : prof.role === 'admin' ? 'rgba(37,51,124,0.1)' : 'rgba(16,185,129,0.1)',
                      color: prof.role === 'superadmin' ? 'var(--color-danger)' : prof.role === 'admin' ? 'var(--color-primary)' : 'var(--color-success)'
                    }}>
                      {prof.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--color-text)' }}>
                    {prof.branch === 'all' ? 'Universal' : prof.branch}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--color-success)' }}>
                      <Lock size={14} /> Contraseña Activa
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <button className="icon-btn" style={{ color: 'var(--color-primary)' }} onClick={() => openEditProfileModal(prof)} title="Editar Empleado">
                      <Edit size={18} />
                    </button>
                    {prof.id !== currentUser?.id && (
                      <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteProfile(prof.id, prof.username)} title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleProfiles.length === 0 && (
            <p style={{ color: 'var(--color-text-light)', padding: '16px 0', textAlign: 'center' }}>
              No hay empleados asignados a esta sucursal.
            </p>
          )}
        </div>
      </div>

      {/* GESTIÓN DE PRODUCTOS */}
      <div className="modern-box" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-primary-dark)' }}>
            <PackageOpen color="var(--color-primary)" /> Inventario y Catálogo de Productos
          </h2>
          <button className="modern-btn modern-btn-primary" onClick={openAddProductModal}>
            <Plus size={18} /> Nuevo Producto
          </button>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-light)' }}>
                <th style={{ padding: '10px 8px' }}>SKU</th>
                <th style={{ padding: '10px 8px' }}>Nombre</th>
                <th style={{ padding: '10px 8px' }}>Stock por Sucursal</th>
                <th style={{ padding: '10px 8px' }}>Precio</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '14px 8px', color: 'var(--color-text-light)' }}>{p.id}</td>
                  <td style={{ padding: '14px 8px', fontWeight: '700' }}>
                     {p.name}
                     {p.presentation && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: '500' }}>{p.presentation}</div>}
                     <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '2px' }}>{p.category}</div>
                  </td>
                  <td style={{ padding: '14px 8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {branches.map(b => (
                        <div key={b} style={{ fontSize: '0.82rem', color: role !== 'superadmin' && b !== currentBranch ? 'var(--color-text-light)' : 'var(--color-text)', fontWeight: b === currentBranch ? 'bold' : 'normal' }}>
                          {b}: {p.stock[b] || 0}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 8px', fontWeight: '800', color: 'var(--color-primary-dark)' }}>Q{p.price.toFixed(2)}</td>
                  <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                    <button className="icon-btn" style={{ color: 'var(--color-primary)' }} onClick={() => openEditProductModal(p)}><Edit size={18} /></button>
                    <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteProduct(p.id)}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUPERADMIN CONFIGURATION */}
      {role === 'superadmin' && (
        <div className="modern-box" style={{ border: '2px dashed var(--color-primary)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-primary-dark)' }}>
              <ShieldAlert /> Configuración de Super Administrador
            </h2>
            <p style={{ color: 'var(--color-text-light)', fontSize: '0.88rem', marginTop: '4px' }}>
              Parámetros globales y creación de sucursales.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* PERMISOS */}
            <div style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Settings size={18} /> Permisos Globales
              </h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={systemSettings.showOtherBranches} onChange={e => setSystemSettings({ ...systemSettings, showOtherBranches: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Empleados ven stock de otras sucursales</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={systemSettings.enableTransfers} onChange={e => setSystemSettings({ ...systemSettings, enableTransfers: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Habilitar Operaciones de Logística</span>
              </label>
            </div>

            {/* SUCURSALES */}
            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'rgba(37,51,124,0.03)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '10px' }}>Agregar Nueva Sucursal</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="modern-input" 
                  value={newBranchName}
                  onChange={e => setNewBranchName(e.target.value)}
                  placeholder="Nombre de la nueva sucursal..."
                />
                <button className="modern-btn modern-btn-primary" onClick={handleAddBranch} disabled={!newBranchName.trim()}>
                  <Plus />
                </button>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {branches.map(b => (
                  <span key={b} style={{ fontSize: '0.8rem', padding: '4px 10px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', fontWeight: 'bold' }}>{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EMPLEADO */}
      {showProfileModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="modern-box" style={{ width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
                {editProfileMode ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
              </h2>
              <button className="icon-btn" onClick={() => setShowProfileModal(false)}><X /></button>
            </div>
            
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>Nombre Completo</label>
                <input required type="text" className="modern-input" value={currentProfile.username} onChange={e => setCurrentProfile({ ...currentProfile, username: e.target.value })} placeholder="Ej. Juan Pérez" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>Rol</label>
                  <select 
                    className="modern-input" 
                    value={currentProfile.role} 
                    disabled={role !== 'superadmin'}
                    onChange={e => setCurrentProfile({ ...currentProfile, role: e.target.value })}
                  >
                    <option value="empleado">Empleado / Cajero</option>
                    {role === 'superadmin' && <option value="admin">Administrador</option>}
                    {role === 'superadmin' && <option value="superadmin">Super Admin</option>}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>Sucursal</label>
                  <select 
                    className="modern-input" 
                    value={currentProfile.branch} 
                    disabled={role !== 'superadmin'}
                    onChange={e => setCurrentProfile({ ...currentProfile, branch: e.target.value })}
                  >
                    {role === 'superadmin' && <option value="all">TODAS</option>}
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>Contraseña / Token de Acceso *</label>
                <input required type="text" className="modern-input" value={currentProfile.password} onChange={e => setCurrentProfile({ ...currentProfile, password: e.target.value })} placeholder="Ej. EMPL123" />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="modern-btn" onClick={() => setShowProfileModal(false)}>Cancelar</button>
                <button type="submit" className="modern-btn modern-btn-primary">
                  <Check size={18} /> Guardar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRODUCTO */}
      {showProductModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="modern-box" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{editMode ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button className="icon-btn" onClick={() => setShowProductModal(false)}><X /></button>
            </div>
            
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>SKU (Código)</label>
                  <input required disabled={editMode} type="text" className="modern-input" value={currentProduct.id} onChange={e => setCurrentProduct({ ...currentProduct, id: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>Categoría</label>
                  {!isNewCategory ? (
                    <select 
                       required
                       className="modern-input" 
                       value={currentProduct.category} 
                       onChange={(e) => {
                         if (e.target.value === 'NEW') {
                           setIsNewCategory(true);
                           setCurrentProduct({ ...currentProduct, category: '' });
                         } else {
                           setCurrentProduct({ ...currentProduct, category: e.target.value });
                         }
                       }}
                    >
                      <option value="">Seleccione...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="NEW" style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>+ Nueva Categoría</option>
                    </select>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input 
                         required
                         type="text" 
                         className="modern-input" 
                         placeholder="Nueva..." 
                         value={currentProduct.category} 
                         onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })} 
                      />
                      <button type="button" className="modern-btn" onClick={() => setIsNewCategory(false)}>X</button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>Nombre del Medicamento</label>
                <input required type="text" className="modern-input" value={currentProduct.name} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} placeholder="Ej. Amoxicilina 500mg" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>Presentación</label>
                  <input type="text" className="modern-input" value={currentProduct.presentation} onChange={e => setCurrentProduct({ ...currentProduct, presentation: e.target.value })} placeholder="Ej. (Caja 30 tabs)" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>Precio (Q)</label>
                  <input required type="number" step="0.01" className="modern-input" value={currentProduct.price} onChange={e => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>

              {/* STOCK POR SUCURSAL */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--color-primary-dark)' }}>Stock por Sucursales</span>
                {branches.map(b => (
                  <div key={b} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ width: '150px', fontSize: '0.85rem' }}>{b}:</span>
                    <input 
                      type="number" 
                      className="modern-input" 
                      style={{ width: '100px' }}
                      value={currentProduct.stock[b] || 0} 
                      onChange={e => setCurrentProduct({ ...currentProduct, stock: { ...currentProduct.stock, [b]: parseInt(e.target.value) || 0 } })} 
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" className="modern-btn" onClick={() => setShowProductModal(false)}>Cancelar</button>
                <button type="submit" className="modern-btn modern-btn-primary">
                  <Check size={18} /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
