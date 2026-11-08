import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9351;
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
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', `chrome_sync_${Date.now()}`);
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

    // ==========================================
    // 1. Simulación en Celular Móvil (390x844)
    // ==========================================
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });

    await send('Page.navigate', { url: 'http://localhost:5173/cliente' });
    await sleep(1500);

    // Inyectar usuario DNI 76880921, SIN pedidos en localStorage (para probar que PostgreSQL los trae)
    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('nova_salud_client_user', JSON.stringify({
          id: '76880921',
          dni: '76880921',
          name: 'Kleverd Apaza Quispe',
          email: 'kleverd@novasalud.pe',
          phone: '955545561',
          address: 'Jr. Mariano Núñez 485',
          district: 'Juliaca Cercado',
          avatar: null
        }));
        localStorage.removeItem('nova_salud_customer_orders');
        window.location.reload();
      `
    });

    await sleep(2500);

    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'test-sync-mobile-orders-verified.png'), Buffer.from(shot.data, 'base64'));
    console.log('Captura movil generada con éxito.');

    // ==========================================
    // 2. Simulación en Laptop / Desktop (1280x800)
    // ==========================================
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await send('Page.navigate', { url: 'http://localhost:5173/cliente' });
    await sleep(2500);

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'test-sync-laptop-orders-verified.png'), Buffer.from(shot.data, 'base64'));
    console.log('Captura laptop generada con éxito.');

    // Verificar en el DOM cuántos pedidos se muestran
    const evalRes = await send('Runtime.evaluate', {
      expression: `
        document.body.innerText.includes('Mis Pedidos') ?
        document.body.innerText.split('Mis Pedidos')[1].slice(0, 100) : 'No encontrado'
      `
    });
    console.log('Texto DOM:', evalRes.result.value);

  } finally {
    chromeProc.kill();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

main().catch(console.error);
