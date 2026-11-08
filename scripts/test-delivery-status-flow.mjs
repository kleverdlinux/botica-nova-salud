import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9359;
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
  console.log('--- 1. Probando servicio backend de actualización de estado delivery ---');
  const catalogoService = await import('../backend/src/services/catalogoService.js');
  
  // Listar pedidos antes
  const pedidosAntes = await catalogoService.listarPedidosDeliveryAdmin();
  console.log('Total pedidos web encontrados en backend:', pedidosAntes.length);
  if (pedidosAntes.length > 0) {
    console.log('Primer pedido web:', pedidosAntes[0].orderId, 'Estado inicial:', pedidosAntes[0].status);
  }

  // Actualizar estado a EN_CAMINO
  await catalogoService.actualizarEstadoPedidoDelivery({
    orderId: 'NS-2026-0024',
    nuevoEstado: 'EN_CAMINO',
    dni: '76880921'
  });
  console.log('Estado actualizado a EN_CAMINO en PostgreSQL.');

  // Verificar que el cliente recibe el estado actualizado
  const pedidosCliente = await catalogoService.obtenerPedidosCliente('76880921');
  const pedidoActualizado = pedidosCliente.find(p => p.id === 'NS-2026-0024' || p.serieNumero === 'B001-00000024');
  console.log('Verificación en cliente para NS-2026-0024:', pedidoActualizado?.status);

  console.log('--- 2. Verificando interfaz visual con Chrome ---');
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', `chrome_delivery_${Date.now()}`);
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

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // 1. Iniciar sesión como Admin y navegar a /app/ventas
    await send('Page.navigate', { url: 'http://localhost:5173/admin/login' });
    await sleep(1500);

    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('novasalud_token', 'demo-token');
        localStorage.setItem('novasalud_usuario', JSON.stringify({
          id: 1,
          nombre: 'Administrador General',
          email: 'admin@novasalud.com',
          rol: 'ADMIN'
        }));
      `
    });

    await send('Page.navigate', { url: 'http://localhost:5173/app/ventas' });
    await sleep(2500);

    // Activar pestaña Despachos & Delivery Web
    await send('Runtime.evaluate', {
      expression: `
        const btns = Array.from(document.querySelectorAll('button'));
        const btnDelivery = btns.find(b => b.innerText.includes('Despachos & Delivery Web'));
        if (btnDelivery) btnDelivery.click();
      `
    });
    await sleep(1500);

    let shotAdmin = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'test-admin-despachos-delivery.png'), Buffer.from(shotAdmin.data, 'base64'));

    // 2. Navegar al portal de cliente para verificar que ve "En Ruta"
    await send('Page.navigate', { url: 'http://localhost:5173/cliente' });
    await sleep(2000);

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
        window.location.reload();
      `
    });
    await sleep(2500);

    let shotClient = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'test-client-portal-en-ruta-live.png'), Buffer.from(shotClient.data, 'base64'));

    console.log('Prueba E2E completada y capturas guardadas.');
  } finally {
    chromeProc.kill();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

main().catch(console.error);

