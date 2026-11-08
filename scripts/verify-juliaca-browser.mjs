import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9349;
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
  console.log('=== VERIFICANDO TRASLADO A JULIACA, PUNO EN NAVEGADOR ===');
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', `chrome_juliaca_${Date.now()}`);
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

    await send('Page.enable');
    await send('Runtime.enable');

    // 1. Verificación en Móvil (360x800) de Portal de Cliente con sesión activa
    await send('Emulation.setDeviceMetricsOverride', {
      width: 360,
      height: 800,
      deviceScaleFactor: 2,
      mobile: true,
    });

    await send('Page.navigate', { url: 'http://localhost:5173/portal-cliente' });
    await sleep(2000);

    // Inyectar sesión de prueba con dirección de Juliaca
    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('novasalud_active_client', JSON.stringify({
          id: '76880921',
          dni: '76880921',
          name: 'Kleverd Apaza Quispe',
          email: 'kleverd@example.com',
          phone: '955545561',
          address: 'Jr. Mariano Núñez 485',
          district: 'Juliaca Cercado',
          avatar: null,
          fichaSalud: { grupoSanguineo: 'O+', alergias: [], condiciones: [] }
        }));
        window.location.reload();
      `
    });
    await sleep(2500);

    const clientShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'test-juliaca-client-portal-mobile.png'), Buffer.from(clientShot.data, 'base64'));
    console.log('Capturado: test-juliaca-client-portal-mobile.png');

    // 2. Verificación de Ficha de Producto con badge Delivery Juliaca
    await send('Page.navigate', { url: 'http://localhost:5173/producto/panadol-antigripal-nf' });
    await sleep(2000);

    const productShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'test-juliaca-product-detail-mobile.png'), Buffer.from(productShot.data, 'base64'));
    console.log('Capturado: test-juliaca-product-detail-mobile.png');

    // 3. Verificación de Página Nosotros / Ubicación en Juliaca (Desktop 1440x900)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await send('Page.navigate', { url: 'http://localhost:5173/nosotros' });
    await sleep(2500);

    // Scroll a sección de ubicación
    await send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: 900, behavior: 'instant' });`
    });
    await sleep(1500);

    const aboutShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'test-juliaca-about-location-desktop.png'), Buffer.from(aboutShot.data, 'base64'));
    console.log('Capturado: test-juliaca-about-location-desktop.png');

    ws.close();
  } finally {
    chromeProc.kill();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

main().catch(console.error);
