export const generateInvoicePDF = ({ cart, clientData, subtotal, discountAmount, total, branch, cashierName }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-GT');
  const invoiceNum = `FLV-${Date.now().toString(36).toUpperCase()}`;

  const nitDisplay = clientData.nit && clientData.nit.trim() !== '' ? clientData.nit : 'CF';

  const itemsHTML = cart.map((item, i) => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:13px;">${i + 1}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;font-size:13px;">${item.product.name}${item.product.presentation ? ' ' + item.product.presentation : ''}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:13px;">${item.quantity}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:13px;">Q${item.product.price.toFixed(2)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:13px;font-weight:bold;">Q${(item.product.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Factura ${invoiceNum}</title>
      <style>
        @media print {
          body { margin: 0; padding: 20px; }
          .no-print { display: none !important; }
        }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 24px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #25337c; padding-bottom: 16px; margin-bottom: 20px; }
        .logo-area h1 { color: #25337c; font-size: 24px; margin: 0; }
        .logo-area p { color: #64748b; font-size: 12px; margin: 4px 0 0 0; }
        .invoice-info { text-align: right; }
        .invoice-info .inv-num { font-size: 18px; font-weight: 800; color: #25337c; }
        .invoice-info .inv-date { font-size: 12px; color: #64748b; margin-top: 4px; }
        .client-section { display: flex; gap: 32px; margin-bottom: 20px; }
        .client-box { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
        .client-box h3 { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; }
        .client-box p { font-size: 13px; margin: 2px 0; }
        .client-box .value { font-weight: 700; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        thead th { background: #25337c; color: white; padding: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .totals { display: flex; justify-content: flex-end; }
        .totals-box { width: 280px; }
        .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .totals-row.total { border-top: 2px solid #25337c; font-size: 20px; font-weight: 800; color: #25337c; padding-top: 12px; margin-top: 8px; }
        .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-area">
          <h1>💊 Farmacias Levy</h1>
          <p>Sucursal: ${branch}</p>
          <p>Cajero(a): ${cashierName || 'N/A'}</p>
        </div>
        <div class="invoice-info">
          <div class="inv-num">${invoiceNum}</div>
          <div class="inv-date">${dateStr} — ${timeStr}</div>
        </div>
      </div>

      <div class="client-section">
        <div class="client-box">
          <h3>Datos del Cliente</h3>
          <p>NIT: <span class="value">${nitDisplay}</span></p>
          ${clientData.name ? `<p>Nombre: <span class="value">${clientData.name}</span></p>` : ''}
          ${clientData.address ? `<p>Dirección: <span class="value">${clientData.address}</span></p>` : ''}
          ${clientData.phone ? `<p>Teléfono: <span class="value">${clientData.phone}</span></p>` : ''}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align:center;width:40px;">#</th>
            <th style="text-align:left;">Producto</th>
            <th style="text-align:center;width:60px;">Cant.</th>
            <th style="text-align:right;width:90px;">P. Unit.</th>
            <th style="text-align:right;width:100px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-box">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>Q${subtotal.toFixed(2)}</span>
          </div>
          ${discountAmount > 0 ? `
          <div class="totals-row" style="color:#ef4444;">
            <span>Descuento:</span>
            <span>- Q${discountAmount.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="totals-row total">
            <span>TOTAL:</span>
            <span>Q${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>Gracias por su compra en Farmacias Levy</p>
        <p>Conserve este documento como comprobante de su compra</p>
      </div>

      <div class="no-print" style="text-align:center;margin-top:24px;">
        <button onclick="window.print()" style="padding:12px 32px;background:#25337c;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer;font-weight:bold;">
          🖨️ Imprimir / Guardar PDF
        </button>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=850,height=700');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  }
};
