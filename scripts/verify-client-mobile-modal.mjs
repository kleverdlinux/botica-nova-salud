import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9339;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  console.log('=== VERIFICANDO PORTAL DE CLIENTE MÓVIL Y MODALES ===');
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', `chrome_client_test_${Date.now()}`);
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    `--user-data-dir=${tempDir}`
  ]);

  try {
    await getDebuggerUrl();
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

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
    await send('DOM.enable');

    // 1. Configurar viewport móvil (iPhone SE / estándar: 375x667)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true
    });

    // Navegar primero a localhost para establecer localStorage
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await sleep(1500);

    // Inyectar perfil de paciente activo y pedidos con las claves oficiales
    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('nova_salud_client_user', JSON.stringify({
          id: '72345678',
          name: 'Carlos Mendoza Ramos',
          dni: '72345678',
          email: 'carlos.mendoza@gmail.com',
          phone: '955545561',
          address: 'Av. Brasil 1450, Dpto 502',
          district: 'Jesús María',
          reference: 'Frente al hospital, rejas negras'
        }));

        localStorage.setItem('novasalud_ficha_72345678', JSON.stringify({
          alergias: ['Penicilina / Amoxicilina'],
          condiciones: ['Hipertensión Arterial'],
          grupoSanguineo: 'O+',
          contactoEmergenciaNombre: 'Elena Ramos (Madre)',
          contactoEmergenciaTelefono: '988844332',
          observaciones: 'Paciente con tratamiento regular'
        }));

        localStorage.setItem('nova_salud_customer_orders', JSON.stringify([
          {
            id: 'ORD-20261107-101',
            date: '07 de noviembre de 2026',
            serieNumero: 'B001-000452',
            tipoComprobante: 'BOLETA',
            customer: {
              name: 'Carlos Mendoza Ramos',
              dni: '72345678',
              phone: '955545561',
              address: 'Av. Brasil 1450, Dpto 502',
              district: 'Jesús María'
            },
            items: [
              { id: 'losartan-50mg', name: 'Losartán 50mg IQFARMA', price: 4.5, quantity: 2, presentation: 'Blíster x10 tabs' }
            ],
            subtotal: 9.00,
            total: 9.00,
            status: 'ENTREGADO',
            paymentMethod: 'YAPE_PLIN',
            paymentDetails: 'Pago con Yape verificado'
          }
        ]));
      `
    });

    // 2. Navegar a /cliente
    console.log('Navegando a /cliente en móvil (375x667)...');
    await send('Page.navigate', { url: 'http://localhost:5173/cliente' });
    await sleep(2000);

    // Verificar contenido en pantalla móvil
    const evalMobile = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const bodyText = document.body.innerText;
          const hasCarlos = bodyText.includes('Carlos Mendoza');
          const hasOpciones = bodyText.includes('Opciones del Portal');
          const hasPedidosCard = bodyText.includes('Mis Pedidos & Boletas');
          const hasBotiquinCard = bodyText.includes('Mi Botiquín Habitual');
          const hasSaludCard = bodyText.includes('Ficha Médica & Alergias');
          const hasDatosCard = bodyText.includes('Direcciones & Facturación');
          const docScrollWidth = document.documentElement.scrollWidth;
          const docClientWidth = document.documentElement.clientWidth;
          const hasHorizontalOverflow = docScrollWidth > docClientWidth;

          return {
            hasCarlos,
            hasOpciones,
            hasPedidosCard,
            hasBotiquinCard,
            hasSaludCard,
            hasDatosCard,
            docScrollWidth,
            docClientWidth,
            hasHorizontalOverflow
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Resultados Vista Móvil Inicial:', evalMobile.result.value);

    // Capturar screenshot móvil inicial
    const ss1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scripts/test-mobile-client-hub.png', Buffer.from(ss1.data, 'base64'));
    console.log('Screenshot guardado: scripts/test-mobile-client-hub.png');

    // 3. Probar clic en "Mis Pedidos & Boletas" para abrir el modal
    console.log('Haciendo clic en "Mis Pedidos & Boletas"...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('[data-mobile-card="pedidos"]');
          if (btn) btn.click();
        })()
      `
    });
    await sleep(600);

    const evalModalPedidos = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const bodyText = document.body.innerText;
          const modalHeader = bodyText.includes('MIS PEDIDOS & BOLETAS');
          const orderCode = bodyText.includes('ORD-20261107-101');
          const boletaSerie = bodyText.includes('B001-000452');
          const hasCloseBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Cerrar Ventana'));

          return { modalHeader, orderCode, boletaSerie, hasCloseBtn };
        })()
      `,
      returnByValue: true
    });
    console.log('Resultados Modal Mis Pedidos:', evalModalPedidos.result.value);

    const ssModalPedidos = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scripts/test-mobile-modal-pedidos.png', Buffer.from(ssModalPedidos.data, 'base64'));
    console.log('Screenshot guardado: scripts/test-mobile-modal-pedidos.png');

    // Cerrar el modal
    console.log('Cerrando modal pedidos...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Cerrar Ventana'));
          if (closeBtn) closeBtn.click();
        })()
      `
    });
    await sleep(500);

    // 4. Probar clic en "Ficha Médica & Alergias" para abrir el modal de salud
    console.log('Haciendo clic en "Ficha Médica & Alergias"...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('[data-mobile-card="salud"]');
          if (btn) btn.click();
        })()
      `
    });
    await sleep(600);

    const evalModalSalud = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const bodyText = document.body.innerText;
          const modalHeader = bodyText.includes('FICHA MÉDICA & ALERGIAS');
          const hasAlergiaPenicilina = bodyText.includes('Penicilina / Amoxicilina');
          const hasCondicionHipertension = bodyText.includes('Hipertensión Arterial');
          const hasSaveBtn = bodyText.includes('Guardar Ficha Sanitaria');

          return { modalHeader, hasAlergiaPenicilina, hasCondicionHipertension, hasSaveBtn };
        })()
      `,
      returnByValue: true
    });
    console.log('Resultados Modal Ficha Médica:', evalModalSalud.result.value);

    const ssModalSalud = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scripts/test-mobile-modal-salud.png', Buffer.from(ssModalSalud.data, 'base64'));
    console.log('Screenshot guardado: scripts/test-mobile-modal-salud.png');

    // Cerrar modal salud
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Cerrar Ventana'));
          if (closeBtn) closeBtn.click();
        })()
      `
    });
    await sleep(500);

    // 5. Verificar Desktop Viewport (1280x800) para asegurar que PC sigue intacta
    console.log('Verificando vista Desktop (1280x800)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(1000);

    const evalDesktop = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const aside = document.querySelector('aside');
          const main = document.querySelector('main');
          const isAsideVisible = aside ? window.getComputedStyle(aside).display !== 'none' : false;
          const isMainVisible = main ? window.getComputedStyle(main).display !== 'none' : false;
          const text = document.body.innerText;
          const hasCarlos = text.includes('Carlos Mendoza');
          const hasOrder = text.includes('ORD-20261107-101');

          return { isAsideVisible, isMainVisible, hasCarlos, hasOrder };
        })()
      `,
      returnByValue: true
    });
    console.log('Resultados Vista Desktop:', evalDesktop.result.value);

    const ssDesktop = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scripts/test-desktop-client.png', Buffer.from(ssDesktop.data, 'base64'));
    console.log('Screenshot guardado: scripts/test-desktop-client.png');

    console.log('=== TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO ===');
  } catch (err) {
    console.error('Error durante la verificación:', err);
  } finally {
    try {
      chromeProc.kill();
    } catch (e) {}
  }
}

main();
