import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'https://botica-nova-salud-khs4.onrender.com';
const OUTPUT_DIR = path.resolve('reportes');
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const ROUTES_PUBLIC = [
  { name: 'Inicio (Tienda Oficial)', path: '/' },
  { name: 'Catálogo de Productos', path: '/catalogo' },
  { name: 'Detalle de Producto', path: '/product/fotoprotector-isdin-fusion-water-magic-spf50' },
  { name: 'Nosotros / Identidad', path: '/about' },
  { name: 'Carrito de Compras', path: '/cart' },
  { name: 'Checkout / Pago', path: '/checkout' },
  { name: 'Portal de Clientes', path: '/cliente' },
  { name: 'Login Administrativo', path: '/admin/login' },
];

const ROUTES_PANEL = [
  { name: 'Panel Dashboard & KPIs', path: '/app/dashboard' },
  { name: 'Punto de Venta (POS)', path: '/app/pos' },
  { name: 'Inventario & Stock', path: '/app/inventario' },
  { name: 'Ventas & Transacciones', path: '/app/ventas' },
  { name: 'Alertas Farmacéuticas', path: '/app/alertas' },
  { name: 'Reportes & Kardex', path: '/app/reportes' },
  { name: 'Gestión de Usuarios', path: '/app/usuarios' },
  { name: 'Visor de Cliente', path: '/visor-cliente' },
  { name: 'Terminal Móvil', path: '/terminal-movil' },
  { name: 'Pago Móvil QR', path: '/pago-movil' },
];

async function runAudit() {
  console.log('Iniciando auditoría integral multiruta y responsividad móvil...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const results = [];

  // Helper para auditar una página
  async function auditPage(page, routeInfo, isMobile = true) {
    const viewport = isMobile
      ? { width: 375, height: 667, isMobile: true, hasTouch: true }
      : { width: 1280, height: 800, isMobile: false, hasTouch: false };

    await page.setViewport(viewport);

    const consoleErrors = [];
    const onConsole = (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    };
    page.on('console', onConsole);

    const startTime = Date.now();
    let statusOk = true;
    let errorMsg = null;

    try {
      await page.goto(`${BASE_URL}${routeInfo.path}`, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
    } catch (e) {
      statusOk = false;
      errorMsg = e.message;
    }

    const loadTimeMs = Date.now() - startTime;

    // Medición de responsividad y desbordamiento horizontal
    const layoutMetrics = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const bodyScrollWidth = document.body ? document.body.scrollWidth : 0;
      const maxScroll = Math.max(scrollWidth, bodyScrollWidth);
      const hasHorizontalOverflow = maxScroll > docWidth + 2; // margen de tolerancia de 2px

      // Buscar elementos que desbordan el ancho de pantalla
      const overflowingElements = [];
      const allEls = document.querySelectorAll('*');
      for (const el of allEls) {
        const rect = el.getBoundingClientRect();
        if (rect.right > docWidth + 5 && rect.width > 0 && rect.height > 0) {
          overflowingElements.push({
            tag: el.tagName.toLowerCase(),
            class: (el.className || '').toString().slice(0, 50),
            right: Math.round(rect.right),
            overflow: Math.round(rect.right - docWidth),
          });
          if (overflowingElements.length >= 5) break;
        }
      }

      return {
        docWidth,
        maxScroll,
        hasHorizontalOverflow,
        overflowingElements,
      };
    });

    const safeName = routeInfo.path.replace(/[^a-z0-9]/gi, '_').replace(/^_+/, '') || 'home';
    const screenshotName = `${safeName}_${isMobile ? 'mobile' : 'desktop'}.jpg`;
    const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotName);

    try {
      await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 75 });
    } catch (e) {}

    page.off('console', onConsole);

    const res = {
      name: routeInfo.name,
      path: routeInfo.path,
      isMobile,
      statusOk,
      errorMsg,
      loadTimeMs,
      docWidth: layoutMetrics.docWidth,
      maxScroll: layoutMetrics.maxScroll,
      hasOverflow: layoutMetrics.hasHorizontalOverflow,
      overflowingElements: layoutMetrics.overflowingElements,
      consoleErrorsCount: consoleErrors.length,
      consoleErrors: consoleErrors.slice(0, 3),
      screenshot: `screenshots/${screenshotName}`,
    };

    results.push(res);
    console.log(
      `[${isMobile ? 'MÓVIL' : 'DESKTOP'}] ${routeInfo.name} (${routeInfo.path}): ` +
      `${layoutMetrics.hasHorizontalOverflow ? 'ALERTA: Desbordamiento' : 'OK: 100% Responsivo'} | ` +
      `Carga: ${loadTimeMs}ms | Errores consola: ${consoleErrors.length}`
    );
  }

  // 1. Auditar páginas públicas
  const page = await browser.newPage();
  console.log('\n--- AUDITANDO PÁGINAS PÚBLICAS ---');
  for (const r of ROUTES_PUBLIC) {
    await auditPage(page, r, true);
  }

  // 2. Iniciar sesión para auditar paneles administrativos
  console.log('\n--- INICIANDO SESIÓN PARA AUDITAR PANELES ADMINISTRATIVOS ---');
  try {
    const loginRes = await page.evaluate(async () => {
      try {
        const resp = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@novasalud.com', password: 'Admin123!' }),
        });
        const data = await resp.json();
        if (data.token) {
          localStorage.setItem('novasalud_token', data.token);
          localStorage.setItem('token', data.token);
          localStorage.setItem('novasalud_usuario', JSON.stringify(data.usuario));
          localStorage.setItem('usuario', JSON.stringify(data.usuario));
          return { ok: true, data };
        }
        return { ok: false, data };
      } catch (err) {
        return { ok: false, err: err.message };
      }
    });
    console.log('Autenticación en backend:', loginRes.ok ? 'EXITOSA' : 'FALLO');
  } catch (e) {
    console.log('Error en autenticación:', e.message);
  }

  // 3. Auditar paneles
  console.log('\n--- AUDITANDO PANELES ADMINISTRATIVOS (MÓVIL & TABLET) ---');
  for (const r of ROUTES_PANEL) {
    await auditPage(page, r, true);
  }

  await browser.close();

  // 4. Generar reporte HTML interactivo
  console.log('\n--- GENERANDO REPORTE VISUAL INTERACTIVO ---');
  const total = results.length;
  const responsiveCount = results.filter((r) => !r.hasOverflow).length;
  const overflowCount = total - responsiveCount;
  const errorsTotal = results.reduce((acc, r) => acc + r.consoleErrorsCount, 0);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Auditoría Integral de Responsividad & Rendimiento | Botica Nova Salud</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; }
    .container { max-width: 1400px; margin: 0 auto; }
    header { margin-bottom: 32px; border-bottom: 1px solid #334155; padding-bottom: 20px; }
    h1 { font-size: 26px; font-weight: 800; color: #38bdf8; }
    .meta { color: #94a3b8; font-size: 13px; margin-top: 6px; }
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .kpi { background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; }
    .kpi-title { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.05em; }
    .kpi-value { font-size: 32px; font-weight: 900; margin-top: 8px; }
    .text-emerald { color: #10b981; }
    .text-rose { color: #f43f5e; }
    .text-sky { color: #38bdf8; }
    table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; }
    th { background: #0f172a; padding: 14px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
    td { padding: 14px 16px; border-top: 1px solid #334155; font-size: 13px; vertical-align: middle; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; }
    .badge-ok { background: #064e3b; color: #6ee7b7; border: 1px solid #059669; }
    .badge-warn { background: #4c1d95; color: #c4b5fd; border: 1px solid #7c3aed; }
    .badge-error { background: #881337; color: #fca5a5; border: 1px solid #e11d48; }
    .thumb { width: 60px; height: 100px; object-fit: cover; border-radius: 6px; border: 1px solid #475569; cursor: pointer; transition: transform 0.2s; }
    .thumb:hover { transform: scale(1.8); z-index: 10; position: relative; }
    .url { font-family: monospace; font-size: 12px; color: #38bdf8; text-decoration: none; }
    .url:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Reporte Ejecutivo de Responsividad y Estabilidad Integral</h1>
      <p class="meta">Botica Nova Salud | Servidor de Producción en Render (${BASE_URL}) | Fecha: ${new Date().toLocaleString()}</p>
    </header>

    <div class="kpis">
      <div class="kpi">
        <div class="kpi-title">Total de Rutas Auditadas</div>
        <div class="kpi-value text-sky">${total}</div>
      </div>
      <div class="kpi">
        <div class="kpi-title">Rutas 100% Responsivas Móvil</div>
        <div class="kpi-value text-emerald">${responsiveCount} / ${total}</div>
      </div>
      <div class="kpi">
        <div class="kpi-title">Desbordamientos Horizontales</div>
        <div class="kpi-value ${overflowCount === 0 ? 'text-emerald' : 'text-rose'}">${overflowCount}</div>
      </div>
      <div class="kpi">
        <div class="kpi-title">Errores de Consola JS</div>
        <div class="kpi-value ${errorsTotal === 0 ? 'text-emerald' : 'text-rose'}">${errorsTotal}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Vista Previa</th>
          <th>Módulo / Pantalla</th>
          <th>Ruta URL</th>
          <th>Responsividad Móvil (375px)</th>
          <th>Tiempo Carga</th>
          <th>Errores JS</th>
        </tr>
      </thead>
      <tbody>
        ${results.map((r) => `
          <tr>
            <td>
              <a href="${r.screenshot}" target="_blank">
                <img src="${r.screenshot}" class="thumb" alt="${r.name}" />
              </a>
            </td>
            <td><strong>${r.name}</strong></td>
            <td><a href="${BASE_URL}${r.path}" target="_blank" class="url">${r.path}</a></td>
            <td>
              ${r.hasOverflow
                ? `<span class="badge badge-error">Desborda (+${r.maxScroll - r.docWidth}px)</span>`
                : `<span class="badge badge-ok">100% Responsivo</span>`
              }
            </td>
            <td>${r.loadTimeMs} ms</td>
            <td>
              ${r.consoleErrorsCount === 0
                ? `<span class="badge badge-ok">0 errores</span>`
                : `<span class="badge badge-error">${r.consoleErrorsCount} errores</span>`
              }
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;

  const reportPath = path.join(OUTPUT_DIR, 'auditoria-completa.html');
  fs.writeFileSync(reportPath, html, 'utf-8');
  console.log(`\nReporte generado con éxito en: ${reportPath}`);
}

runAudit().catch((err) => {
  console.error('Error durante la auditoría:', err);
  process.exit(1);
});

