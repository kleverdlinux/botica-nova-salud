import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9348;
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/c5864821-fe51-4e53-866b-5dceb635d61c';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getDebuggerUrl() {
  for (let i = 0; i < 25; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const data = await res.json();
      if (data.webSocketDebuggerUrl) return data.webSocketDebuggerUrl;
    } catch (e) {}
    await sleep(200);
  }
  throw new Error('Chrome debugging port not available');
}

async function main() {
  console.log('=== VERIFICANDO CORRECCIONES EN NAVEGADOR REAL (CDP) ===');
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', `chrome_fixes_test_${Date.now()}`);
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    `--user-data-dir=${tempDir}`,
  ]);

  try {
    await getDebuggerUrl();
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const tabs = await listRes.json();
    const pageTab = tabs.find((t) => t.type === 'page') || tabs[0];

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = id++;
        const handler = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    async function captureScreenshot(filename) {
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(ARTIFACT_DIR, filename);
      fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
      console.log(`✓ Screenshot guardado: ${filename}`);
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    // 1. Configurar Viewport Móvil Xiaomi / Redmi (360x800, scale 2)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 360,
      height: 800,
      deviceScaleFactor: 2,
      mobile: true,
    });

    // TEST 1: Detalle de Producto al tope (Header NO tapa breadcrumbs)
    console.log('1. Navegando a detalle de producto /product/panadol-antigripal-nf...');
    await send('Page.navigate', { url: 'http://localhost:5173/product/panadol-antigripal-nf' });
    await sleep(2500);

    // Scroll exacto al tope
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0); document.documentElement.scrollTop = 0;' });
    await sleep(600);
    await captureScreenshot('test-fix-product-detail-mobile-top.png');

    // TEST 2: Inyectar pedido y abrir BoletaModal
    console.log('2. Inyectando pedido y cliente activo...');
    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('nova_salud_client_user', JSON.stringify({
          id: '76880921',
          dni: '76880921',
          name: 'Kleverd Apaza Quispe',
          email: 'kleverd@cliente.novasalud.pe',
          phone: '955545561',
          address: 'Av. Brasil 1450, Dpto 401',
          district: 'Jesús María'
        }));
        localStorage.setItem('nova_salud_customer_orders', JSON.stringify([{
          id: 'NS-2026-4521',
          serieNumero: 'B001-00004521',
          tipoComprobante: 'BOLETA',
          date: 'sábado, 7 de noviembre de 2026, 8:05 p. m.',
          fechaSunat: '2026-11-07',
          timestamp: Date.now(),
          customer: {
            firstName: 'Kleverd',
            lastName: 'Apaza Quispe',
            email: 'kleverd@cliente.novasalud.pe',
            phone: '955545561',
            dni: '76880921',
            address: 'Av. Brasil 1450, Dpto 401',
            district: 'Jesús María'
          },
          items: [{
            id: 'panadol-antigripal-nf',
            name: 'PANADOL ANTIGRIPAL NF',
            presentation: 'Sobre x2 tabs',
            quantity: 3,
            price: 2.4,
            subtotal: 7.2
          }],
          subtotal: 7.2,
          igv: 1.1,
          shipping: 0,
          total: 7.2,
          paymentMethod: 'YAPE_PLIN',
          paymentDetails: 'Yape / Plin Móvil - Operación N° 849201',
          status: 'CONFIRMADO'
        }]));
      `,
    });

    await send('Page.navigate', { url: 'http://localhost:5173/mi-cuenta' });
    await sleep(1500);

    // Clic en pedidos para abrir el modal móvil
    console.log('3. Abriendo pedidos...');
    await send('Runtime.evaluate', {
      expression: `
        const btn = document.querySelector('button[data-mobile-card="pedidos"]');
        if (btn) btn.click();
      `,
    });
    await sleep(800);

    // Clic en botón del comprobante SUNAT
    console.log('4. Abriendo BoletaModal...');
    await send('Runtime.evaluate', {
      expression: `
        const boletaBtn = document.querySelector('button[title*="comprobante"]');
        if (boletaBtn) boletaBtn.click();
      `,
    });
    await sleep(1200);
    await captureScreenshot('test-fix-boleta-modal-mobile-top.png');

    // Scroll dentro del modal para ver la tabla, QR y botones
    console.log('5. Haciendo scroll en BoletaModal para ver QR...');
    await send('Runtime.evaluate', {
      expression: `
        const modalBackdrop = document.querySelector('.fixed.inset-0.z-\\\\[100\\\\]');
        if (modalBackdrop) {
          modalBackdrop.scrollTo(0, 400);
        }
      `,
    });
    await sleep(600);
    await captureScreenshot('test-fix-boleta-modal-mobile-qr.png');

    // Clic en "Ver en Mi Panel de Cliente"
    console.log('6. Clic en "Ver en Mi Panel de Cliente"...');
    await send('Runtime.evaluate', {
      expression: `
        const allBtns = Array.from(document.querySelectorAll('button'));
        const verBtn = allBtns.find(b => b.textContent && b.textContent.includes('Ver en Mi Panel de Cliente'));
        if (verBtn) verBtn.click();
      `,
    });
    await sleep(800);
    await captureScreenshot('test-fix-credentials-modal-mobile.png');

    console.log('=== VERIFICACIONES FINALIZADAS ===');
  } catch (err) {
    console.error('Error durante la verificación:', err);
  } finally {
    try {
      chromeProc.kill();
    } catch {}
  }
}

main();
