import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Truck, Plus, Trash2, Edit, Search, Phone, Mail, MapPin, Building2, X, Check } from 'lucide-react';

const Suppliers = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState({
    id: '',
    companyName: '',
    nit: '',
    type: 'Distribuidor',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const filteredSuppliers = suppliers.filter(s => 
    s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.nit && s.nit.includes(searchTerm)) ||
    (s.type && s.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAddModal = () => {
    setEditMode(false);
    setCurrentSupplier({
      id: 'SUP-' + Date.now().toString(36).toUpperCase(),
      companyName: '',
      nit: '',
      type: 'Distribuidor',
      phone: '',
      email: '',
      address: '',
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (supplier) => {
    setEditMode(true);
    setCurrentSupplier({ ...supplier });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentSupplier.companyName.trim()) {
      alert('El nombre de la empresa es obligatorio.');
      return;
    }
    if (editMode) {
      await updateSupplier(currentSupplier.id, currentSupplier);
    } else {
      await addSupplier(currentSupplier);
    }
    setShowModal(false);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar al proveedor "${name}"?`)) {
      await deleteSupplier(id);
    }
  };

  return (
    <div className="container" style={{ padding: '8px 0px' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building2 color="var(--color-primary)" size={36} /> Proveedores y Distribuidores
          </h1>
          <p style={{ color: 'var(--color-text-light)', fontSize: '1.1rem', marginTop: '6px' }}>
            Directorio corporativo para compras farmacéuticas y suministros.
          </p>
        </div>

        <button className="modern-btn modern-btn-primary" onClick={openAddModal}>
          <Plus size={20} /> Registrar Proveedor
        </button>
      </header>

      {/* SEARCH AND COUNTER */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', flex: 1 }}>
          <Search size={20} color="var(--color-text-light)" />
          <input 
            type="text" 
            placeholder="Buscar por nombre de empresa, NIT o tipo..." 
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '1rem', color: 'var(--color-text)' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ padding: '12px 20px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', fontWeight: '700', color: 'var(--color-primary-dark)' }}>
          Total: {filteredSuppliers.length}
        </div>
      </div>

      {/* SUPPLIERS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredSuppliers.map(s => (
          <div key={s.id} className="modern-box" style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(37,51,124,0.08)', color: 'var(--color-primary)', fontWeight: '800', textTransform: 'uppercase' }}>
                  {s.type || 'Distribuidor'}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary-dark)', marginTop: '8px' }}>
                  {s.companyName}
                </h3>
                {s.nit && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '2px' }}>NIT: <strong>{s.nit}</strong></p>}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="icon-btn" style={{ color: 'var(--color-primary)' }} onClick={() => openEditModal(s)} title="Editar">
                  <Edit size={18} />
                </button>
                <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(s.id, s.companyName)} title="Eliminar">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {s.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)' }}>
                  <Phone size={15} color="var(--color-text-light)" /> {s.phone}
                </div>
              )}
              {s.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)' }}>
                  <Mail size={15} color="var(--color-text-light)" /> {s.email}
                </div>
              )}
              {s.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)' }}>
                  <MapPin size={15} color="var(--color-text-light)" /> {s.address}
                </div>
              )}
            </div>

            {s.notes && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', fontStyle: 'italic', margin: 0 }}>
                "{s.notes}"
              </p>
            )}
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-light)' }}>
          <Building2 size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
          <h3>No se encontraron proveedores registrados.</h3>
          <p style={{ marginTop: '6px' }}>Haz clic en "Registrar Proveedor" para añadir uno nuevo.</p>
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR PROVEEDOR */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="modern-box" style={{ width: '100%', maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-primary-dark)' }}>
                {editMode ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X /></button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>
                  Nombre de la Empresa *
                </label>
                <input 
                  type="text" 
                  required 
                  className="modern-input" 
                  placeholder="Ej. Distribuidora Farmacéutica Central"
                  value={currentSupplier.companyName}
                  onChange={e => setCurrentSupplier({ ...currentSupplier, companyName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>
                    Tipo de Proveedor
                  </label>
                  <select 
                    className="modern-input"
                    value={currentSupplier.type}
                    onChange={e => setCurrentSupplier({ ...currentSupplier, type: e.target.value })}
                  >
                    <option value="Distribuidor">Distribuidor</option>
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Importador">Importador</option>
                    <option value="Mayorista">Mayorista</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>
                    NIT
                  </label>
                  <input 
                    type="text" 
                    className="modern-input" 
                    placeholder="Ej. 123456-7"
                    value={currentSupplier.nit}
                    onChange={e => setCurrentSupplier({ ...currentSupplier, nit: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>
                    Teléfono
                  </label>
                  <input 
                    type="text" 
                    className="modern-input" 
                    placeholder="Ej. 2222-3333"
                    value={currentSupplier.phone}
                    onChange={e => setCurrentSupplier({ ...currentSupplier, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>
                    Correo Electrónico
                  </label>
                  <input 
                    type="email" 
                    className="modern-input" 
                    placeholder="ventas@empresa.com"
                    value={currentSupplier.email}
                    onChange={e => setCurrentSupplier({ ...currentSupplier, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>
                  Dirección
                </label>
                <input 
                  type="text" 
                  className="modern-input" 
                  placeholder="Ciudad, zona, calle..."
                  value={currentSupplier.address}
                  onChange={e => setCurrentSupplier({ ...currentSupplier, address: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>
                  Notas / Observaciones
                </label>
                <textarea 
                  className="modern-input" 
                  rows="2"
                  placeholder="Condiciones de pago, contacto principal, etc."
                  value={currentSupplier.notes}
                  onChange={e => setCurrentSupplier({ ...currentSupplier, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="modern-btn" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="modern-btn modern-btn-primary">
                  <Check size={18} /> Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
