import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { AlertTriangle, Clock, CalendarDays, ArchiveRestore } from 'lucide-react';

const QualityControl = () => {
  const { products, currentBranch, role, branches } = useInventory();
  
  const monitorBranches = role === 'superadmin' ? branches : [currentBranch];

  // Restructure array for rendering since we need to know which branch the alert belongs to
  const lowStockAlerts = [];
  const expiringAlerts = [];

  const today = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(today.getMonth() + 3);

  products.forEach(p => {
    monitorBranches.forEach(branch => {
      // Stock check
      if ((p.stock[branch] || 0) <= 5) {
        lowStockAlerts.push({ product: p, branch, stock: p.stock[branch] || 0 });
      }
      
      // Expiry check
      if (p.expiryDates && p.expiryDates[branch]) {
        const expiry = new Date(p.expiryDates[branch]);
        if (expiry <= threeMonthsFromNow) {
          expiringAlerts.push({ product: p, branch, expiryDateStr: p.expiryDates[branch], isExpired: expiry < today });
        }
      }
    });
  });

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <header>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary-dark)' }}>Control de Calidad y Alertas</h1>
        <p style={{ color: 'var(--color-text-light)' }}>{role === 'superadmin' ? 'Supervisando alertas críticas de manera GLOBAL para todas las sucursales.' : `Monitoreando métricas para ${currentBranch}.`}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginTop: '32px' }}>
        
        {/* Low Stock Panel */}
        <div className="modern-box" style={{ borderLeft: '6px solid var(--color-danger)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-danger)', fontSize: '1.4rem' }}>
            <AlertTriangle size={28} /> Alerta de Stock Bajo
          </h2>
          <p style={{ color: 'var(--color-text-light)', marginTop: '8px', fontSize: '0.9rem' }}>Productos con menos de 5 unidades.</p>
          
          <div style={{ marginTop: '24px', flex: 1, overflowY: 'auto', paddingRight: '12px' }}>
            {lowStockAlerts.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--color-text-light)', padding: '32px 0' }}>
                <ArchiveRestore size={48} opacity={0.5} />
                <p>El inventario está estable.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-light)' }}>
                    <th style={{ padding: '12px 8px', fontWeight: '600' }}>Producto</th>
                    <th style={{ padding: '12px 8px', fontWeight: '600' }}>Sucursal</th>
                    <th style={{ padding: '12px 8px', fontWeight: '600' }}>Unidades</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockAlerts.map((alert, idx) => (
                    <tr key={`${alert.product.id}-${alert.branch}-${idx}`} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-text)' }}>{alert.product.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>SKU: {alert.product.id}</div>
                      </td>
                      <td style={{ padding: '16px 8px', color: 'var(--color-text-light)', fontSize: '0.85rem', fontWeight: '700' }}>
                        {alert.branch}
                      </td>
                      <td style={{ padding: '16px 8px', fontWeight: '800', color: 'var(--color-danger)', fontSize: '1.2rem' }}>
                        {alert.stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Expiry Monitor */}
        <div className="modern-box" style={{ borderLeft: '6px solid var(--color-warning)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-warning)', fontSize: '1.4rem' }}>
            <CalendarDays size={28} /> Vencimientos Críticos
          </h2>
          <p style={{ color: 'var(--color-text-light)', marginTop: '8px', fontSize: '0.9rem' }}>Productos a vencer próximos 3 meses o ya vencidos.</p>
          
          <div style={{ marginTop: '24px', flex: 1, overflowY: 'auto', paddingRight: '12px' }}>
            {expiringAlerts.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--color-text-light)', padding: '32px 0' }}>
                <Clock size={48} opacity={0.5} />
                <p>No hay vencimientos reportados.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-light)' }}>
                    <th style={{ padding: '12px 8px', fontWeight: '600' }}>Producto</th>
                    <th style={{ padding: '12px 8px', fontWeight: '600' }}>Ubicación</th>
                    <th style={{ padding: '12px 8px', fontWeight: '600' }}>Expiración</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringAlerts.map((alert, idx) => {
                    return (
                      <tr key={`${alert.product.id}-${alert.branch}-exp-${idx}`} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '16px 8px' }}>
                          <div style={{ fontWeight: '700', color: 'var(--color-text)' }}>{alert.product.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Lote: {alert.product.lot}</div>
                        </td>
                        <td style={{ padding: '16px 8px', color: 'var(--color-text-light)', fontSize: '0.85rem', fontWeight: '700' }}>
                           {alert.branch}
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          <div style={{ fontWeight: '800', color: alert.isExpired ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                            {alert.expiryDateStr}
                          </div>
                          {alert.isExpired && <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--color-danger)', color: '#fff', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Vencido</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default QualityControl;
