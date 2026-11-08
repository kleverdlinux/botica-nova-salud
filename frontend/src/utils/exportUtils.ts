/**
 * Utilidades para exportación de reportes a Excel (CSV con codificación UTF-8 para Perú/Latam)
 * e impresión / guardado directo en PDF con diseño profesional Botica Nova Salud.
 */

export interface ReportItem {
  [key: string]: string | number | boolean | null | undefined;
}

export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  // \uFEFF asegura que Excel reconozca tildes y caracteres en español
  const BOM = '\uFEFF';
  const csvContent =
    BOM +
    [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const val = cell === null || cell === undefined ? '' : String(cell);
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface PrintReportOptions {
  title: string;
  subtitle?: string;
  metaInfo?: { label: string; value: string }[];
  columns: { header: string; width?: string }[];
  rows: (string | number)[][];
  totals?: { label: string; value: string }[];
}

export function printProfessionalReport(options: PrintReportOptions): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor habilite las ventanas emergentes para generar el reporte impreso/PDF.');
    return;
  }

  const dateStr = new Date().toLocaleString('es-PE', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8" />
      <title>${options.title} - Botica Nova Salud</title>
      <style>
        @page { size: A4; margin: 15mm 15mm 20mm 15mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #18181b;
          margin: 0;
          padding: 24px;
          font-size: 12px;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0d9488;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .logo-title {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #111827;
        }
        .logo-title span { color: #0d9488; }
        .pharmacy-info {
          font-size: 11px;
          color: #52525b;
          margin-top: 4px;
        }
        .report-badge {
          text-align: right;
        }
        .report-type {
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          color: #0f172a;
        }
        .report-date {
          font-size: 10px;
          color: #71717a;
          margin-top: 4px;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
        }
        .meta-item { font-size: 11px; }
        .meta-label { font-weight: 600; color: #64748b; text-transform: uppercase; font-size: 10px; }
        .meta-value { font-weight: 700; color: #0f172a; margin-top: 2px; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
          font-size: 11px;
        }
        th {
          background-color: #0d9488;
          color: #ffffff;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.05em;
          padding: 10px 12px;
          text-align: left;
        }
        td {
          padding: 9px 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
        }
        tr:nth-child(even) td { background-color: #f8fafc; }
        .totals-box {
          margin-left: auto;
          width: 280px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          background: #fafafa;
          margin-bottom: 30px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 12px;
        }
        .totals-row.main {
          border-top: 1px solid #cbd5e1;
          margin-top: 6px;
          padding-top: 8px;
          font-weight: 800;
          font-size: 14px;
          color: #0d9488;
        }
        .footer-note {
          border-top: 1px dashed #cbd5e1;
          padding-top: 14px;
          font-size: 10px;
          color: #64748b;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo-title">NOVA<span>SALUD</span></div>
          <div class="pharmacy-info">
            BOTICA NOVA SALUD E.I.R.L. · RUC: 20601234567<br />
            Jr. Mariano Núñez 485, Cercado de Juliaca · San Román, Puno · Regente Químico Farmacéutico CQFP
          </div>
        </div>
        <div class="report-badge">
          <div class="report-type">${options.title}</div>
          ${options.subtitle ? `<div style="font-size: 11px; color: #52525b;">${options.subtitle}</div>` : ''}
          <div class="report-date">Emitido: ${dateStr}</div>
        </div>
      </div>

      ${
        options.metaInfo && options.metaInfo.length > 0
          ? `
        <div class="meta-grid">
          ${options.metaInfo
            .map(
              (m) => `
            <div class="meta-item">
              <div class="meta-label">${m.label}</div>
              <div class="meta-value">${m.value}</div>
            </div>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }

      <table>
        <thead>
          <tr>
            ${options.columns
              .map((c) => `<th style="${c.width ? `width:${c.width};` : ''}">${c.header}</th>`)
              .join('')}
          </tr>
        </thead>
        <tbody>
          ${options.rows
            .map(
              (r) => `
            <tr>
              ${r.map((cell) => `<td>${cell}</td>`).join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      ${
        options.totals && options.totals.length > 0
          ? `
        <div class="totals-box">
          ${options.totals
            .map((t, idx) => `
            <div class="totals-row ${idx === options.totals!.length - 1 ? 'main' : ''}">
              <span>${t.label}:</span>
              <span>${t.value}</span>
            </div>
          `)
            .join('')}
        </div>
      `
          : ''
      }

      <div class="footer-note">
        <span>Sistema de Gestión de Inventario y Ventas · Botica Nova Salud</span>
        <span>Documento administrativo oficial para control interno y DIGEMID</span>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

