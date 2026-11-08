import { formatearMoneda, formatearFechaHoraLima } from './formateadores.js';
import { montoALetras } from './numeroALetras.js';

export function imprimirComprobanteA4({ venta, esFactura = false, orientacion = 'portrait' }) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor habilite las ventanas emergentes para generar el comprobante en PDF.');
    return;
  }

  const total = Number(venta.total) || 0;
  const subtotalNeto = total / 1.18;
  const igvCalculado = total - subtotalNeto;
  const detalles = venta.detalles || [];

  const tipoTitulo = esFactura ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA';
  const serieCorrelativo = esFactura
    ? `F001-${String(venta.id).padStart(8, '0')}`
    : `B001-${String(venta.id).padStart(8, '0')}`;

  const clienteDoc = (venta.clienteDoc || '').trim();
  const clienteNom = (venta.clienteNom || 'CLIENTE GENERAL').trim();
  const etiquetaDoc = esFactura ? 'R.U.C.' : clienteDoc.length === 8 ? 'D.N.I.' : 'DOC. IDENTIDAD';
  const etiquetaNom = esFactura ? 'RAZÓN SOCIAL' : 'SEÑOR(ES)';

  const fechaEmision = formatearFechaHoraLima(venta.createdAt || new Date());
  const textoMonto = montoALetras(total);

  // Generar cadena para simular QR oficial de SUNAT: RUC|TIPO|SERIE|NUMERO|IGV|TOTAL|FECHA|DOC_CLIENTE|NUM_DOC
  const qrString = `20100055231|${esFactura ? '01' : '03'}|${serieCorrelativo}|${igvCalculado.toFixed(2)}|${total.toFixed(2)}|${fechaEmision}|${clienteDoc}|`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(qrString)}`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${tipoTitulo} - ${serieCorrelativo}</title>
  <style>
    @page {
      size: ${orientacion === 'landscape' ? 'A4 landscape' : 'A4 portrait'};
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      color: #1e293b;
      line-height: 1.35;
      background: #ffffff;
      padding: 10px;
    }
    .header-box {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      gap: 20px;
    }
    .empresa-info {
      flex: 1;
    }
    .empresa-nombre {
      font-size: 18px;
      font-weight: 900;
      color: #0f766e;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }
    .empresa-sub {
      font-size: 10px;
      color: #64748b;
      line-height: 1.4;
    }
    .ruc-box {
      width: 250px;
      border: 2px solid #0f766e;
      border-radius: 8px;
      text-align: center;
      padding: 10px 8px;
      background: #f0fdfa;
    }
    .ruc-box .ruc-num {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
    }
    .ruc-box .doc-titulo {
      font-size: 12px;
      font-weight: 900;
      color: #0f766e;
      padding: 4px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .ruc-box .doc-serie {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      font-family: monospace;
    }
    .datos-cliente {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 14px;
      background: #f8fafc;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 6px 16px;
      font-size: 10.5px;
    }
    .datos-cliente div span.label {
      font-weight: bold;
      color: #475569;
      display: inline-block;
      min-width: 100px;
    }
    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 10.5px;
    }
    table.items-table th {
      background: #0f766e;
      color: #ffffff;
      font-weight: 800;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #0f766e;
      text-transform: uppercase;
      font-size: 9.5px;
    }
    table.items-table td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    table.items-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .totales-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      margin-top: 6px;
    }
    .totales-izq {
      flex: 1;
    }
    .monto-letras {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 10px;
      background: #f8fafc;
      font-size: 10px;
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 10px;
    }
    .qr-hash-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .qr-hash-box img {
      width: 80px;
      height: 80px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 2px;
    }
    .qr-text {
      font-size: 9px;
      color: #64748b;
      line-height: 1.35;
    }
    .totales-tabla {
      width: 240px;
      border-collapse: collapse;
      font-size: 10.5px;
    }
    .totales-tabla td {
      padding: 4px 6px;
    }
    .totales-tabla tr.total-final {
      background: #0f766e;
      color: #ffffff;
      font-weight: 900;
      font-size: 12px;
    }
    .totales-tabla tr.total-final td {
      padding: 6px 8px;
    }
    .footer-nota {
      margin-top: 20px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 9px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <!-- 1. Encabezado Oficial -->
  <div class="header-box">
    <div class="empresa-info">
      <div class="empresa-nombre">Botica Nova Salud</div>
      <div class="empresa-sub">
        <strong>BOTICA NOVA SALUD E.I.R.L.</strong><br>
        Jr. Mariano Núñez 485 - Cercado de Juliaca, San Román, Puno - Perú<br>
        Teléfono: (051) 321-450 &bull; Celular / WhatsApp: 955 545 561<br>
        Email: atencion@boticanovasalud.pe &bull; Web: www.boticanovasalud.pe
      </div>
    </div>
    <div class="ruc-box">
      <div class="ruc-num">R.U.C. 20100055231</div>
      <div class="doc-titulo">${tipoTitulo}</div>
      <div class="doc-serie">${serieCorrelativo}</div>
    </div>
  </div>

  <!-- 2. Información del Adquiriente / Cliente -->
  <div class="datos-cliente">
    <div><span class="label">${etiquetaNom}:</span> <strong>${clienteNom}</strong></div>
    <div><span class="label">FECHA DE EMISIÓN:</span> ${fechaEmision}</div>
    <div><span class="label">${etiquetaDoc}:</span> <strong>${clienteDoc || 'SIN DOCUMENTO'}</strong></div>
    <div><span class="label">MONEDA:</span> SOLES (PEN)</div>
    <div><span class="label">DIRECCIÓN:</span> JULIACA, PUNO, PERÚ</div>
    <div><span class="label">FORMA DE PAGO:</span> ${venta.metodoPago || 'EFECTIVO (CONTADO)'}</div>
    <div><span class="label">CAJERO:</span> ${venta.usuario?.nombre || 'Administrador'}</div>
    <div><span class="label">N° TICKET INTERNO:</span> ${venta.ticket || `T-${String(venta.id).padStart(6, '0')}`}</div>
  </div>

  <!-- 3. Tabla de Productos -->
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 30px; text-align: center;">ÍTEM</th>
        <th style="width: 75px;">CÓDIGO</th>
        <th style="width: 50px; text-align: center;">CANT</th>
        <th style="width: 50px; text-align: center;">UNIDAD</th>
        <th>DESCRIPCIÓN</th>
        <th style="width: 80px; text-align: right;">P. UNITARIO</th>
        <th style="width: 80px; text-align: right;">SUBTOTAL</th>
      </tr>
    </thead>
    <tbody>
      ${detalles
        .map((d, idx) => {
          const cant = Number(d.cantidad);
          const pu = Number(d.precioUnitario);
          const sub = Number(d.subtotal || pu * cant);
          const prodNombre = d.producto?.nombre || `Producto #${d.productoId}`;
          const prodCod = d.producto?.codigoBarras || `MED-${d.productoId}`;
          return `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td style="font-family: monospace; font-size: 9.5px;">${prodCod}</td>
          <td style="text-align: center; font-weight: bold;">${cant}</td>
          <td style="text-align: center; font-size: 9px; color: #64748b;">NIU</td>
          <td><strong>${prodNombre}</strong></td>
          <td style="text-align: right; font-family: monospace;">S/ ${pu.toFixed(2)}</td>
          <td style="text-align: right; font-family: monospace; font-weight: bold;">S/ ${sub.toFixed(2)}</td>
        </tr>
      `;
        })
        .join('')}
    </tbody>
  </table>

  <!-- 4. Resumen y Desglose Tributario -->
  <div class="totales-container">
    <div class="totales-izq">
      <div class="monto-letras">${textoMonto}</div>
      <div class="qr-hash-box">
        <img src="${qrUrl}" alt="Código QR SUNAT" onerror="this.style.display='none'" />
        <div class="qr-text">
          <strong>Representación impresa de la ${esFactura ? 'Factura' : 'Boleta'} de Venta Electrónica.</strong><br>
          Generada según normativa vigente de SUNAT.<br>
          Consulte la validez de este comprobante en el portal de SUNAT.<br>
          <em>¡Gracias por confiar en Botica Nova Salud!</em>
        </div>
      </div>
    </div>

    <table class="totales-tabla">
      <tr>
        <td style="color: #64748b;">OP. GRAVADA:</td>
        <td style="text-align: right; font-family: monospace;">${formatearMoneda(subtotalNeto)}</td>
      </tr>
      <tr>
        <td style="color: #64748b;">OP. EXONERADA:</td>
        <td style="text-align: right; font-family: monospace;">S/ 0.00</td>
      </tr>
      <tr>
        <td style="color: #64748b;">OP. INAFECTA:</td>
        <td style="text-align: right; font-family: monospace;">S/ 0.00</td>
      </tr>
      <tr>
        <td style="color: #64748b;">I.G.V. (18%):</td>
        <td style="text-align: right; font-family: monospace;">${formatearMoneda(igvCalculado)}</td>
      </tr>
      <tr class="total-final">
        <td>TOTAL A PAGAR:</td>
        <td style="text-align: right; font-family: monospace;">${formatearMoneda(total)}</td>
      </tr>
    </table>
  </div>

  <div class="footer-nota">
    Botica Nova Salud &bull; Sistema Farmacéutico &bull; Sede Central: Jr. Mariano Núñez 485, Juliaca &bull; Consultas: 955 545 561
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

