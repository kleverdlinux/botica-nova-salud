import { spawn } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9335;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getDebuggerUrl() {
  for (let i = 0; i < 20; i++) {
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
  console.log('Lanzando Chrome para detección de excepciones...');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--user-data-dir=' + process.env.TEMP + '/chrome_crash_hunt_' + Date.now()
  ]);

  try {
    const wsUrl = await getDebuggerUrl();
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let msgId = 1;
    const callbacks = new Map();
    const exceptions = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const desc = msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text;
        exceptions.push(desc);
        console.error(' [EXCEPTION DETECTED]:', desc.split('\n')[0]);
      } else if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
        console.error(' [CONSOLE ERROR]:', msg.params.entry.text);
      }
    };

    const send = (method, params = {}) => {
      const id = msgId++;
      return new Promise(resolve => {
        callbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await send('Runtime.enable');
    await send('Page.enable');
    await send('Log.enable');

    // Función de evaluación simple
    const evaluate = async (expr) => {
      const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return res.result?.result?.value;
    };

    const testRoute = async (url, desc) => {
      exceptions.length = 0;
      await send('Page.navigate', { url });
      await sleep(1000);

      const pageState = await evaluate(`
        (() => {
          const body = document.body ? document.body.innerText : '';
          const hasCrash = body.includes('Se produjo un error inesperado');
          const pre = document.querySelector('pre') ? document.querySelector('pre').innerText : '';
          const title = document.title;
          return { hasCrash, pre, title, textLen: body.length };
        })()
      `);

      if (pageState?.hasCrash) {
        console.log(`❌ CRASH en ${desc} (${url}): ${pageState.pre}`);
        return { ok: false, error: pageState.pre };
      } else {
        console.log(`✅ OK: ${desc} (chars: ${pageState?.textLen})`);
        return { ok: true };
      }
    };

    console.log('\n--- FASE 1: PROBANDO COMO GUEST (SIN LOGIN) ---');
    await send('Page.navigate', { url: 'http://localhost:5173/admin/login' });
    await sleep(500);
    await evaluate(`localStorage.clear(); sessionStorage.clear();`);

    const guestRoutes = [
      ['http://localhost:5173/', 'Inicio / Landing'],
      ['http://localhost:5173/productos', 'Catálogo /productos'],
      ['http://localhost:5173/tienda', 'Tienda /tienda'],
      ['http://localhost:5173/products', 'Products /products'],
      ['http://localhost:5173/product/panadol-antigripal-nf', 'Ficha Panadol'],
      ['http://localhost:5173/product/apronax-550-mg', 'Ficha Apronax'],
      ['http://localhost:5173/product/losartan-50mg-iqfarma', 'Ficha Losartán'],
      ['http://localhost:5173/product/no-existe', 'Ficha Inexistente (404)'],
      ['http://localhost:5173/cart', 'Carrito'],
      ['http://localhost:5173/checkout', 'Checkout'],
      ['http://localhost:5173/cliente', 'Portal Cliente (Sin Auth)'],
      ['http://localhost:5173/about', 'Nosotros / About'],
      ['http://localhost:5173/admin/login', 'Login Administrativo'],
      ['http://localhost:5173/visor-cliente', 'Visor Cliente Pantalla'],
      ['http://localhost:5173/pago-movil', 'Pago Móvil QR'],
      ['http://localhost:5173/escanear-movil', 'Escanear Móvil'],
      ['http://localhost:5173/terminal-movil', 'Terminal Móvil'],
      ['http://localhost:5173/app/dashboard', 'Ruta Privada sin Login -> Redirect a Login'],
      ['http://localhost:5173/app/pos', 'POS sin Login -> Redirect a Login'],
      ['http://localhost:5173/app/inventario', 'Inventario sin Login -> Redirect a Login']
    ];

    for (const [url, desc] of guestRoutes) {
      await testRoute(url, desc);
    }

    console.log('\n--- FASE 2: PROBANDO CON LOGIN ADMIN ---');
    const loginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@novasalud.com', password: 'Admin123!' })
    });
    const { token, usuario } = await loginRes.json();

    await evaluate(`
      localStorage.setItem('novasalud_token', '${token}');
      localStorage.setItem('novasalud_usuario', JSON.stringify(${JSON.stringify(usuario)}));
    `);

    const adminRoutes = [
      ['http://localhost:5173/app/dashboard', 'Dashboard Admin'],
      ['http://localhost:5173/app/pos', 'Punto de Venta POS'],
      ['http://localhost:5173/app/inventario', 'Inventario - Tab Catálogo'],
      ['http://localhost:5173/app/inventario?tab=kardex', 'Inventario - Tab Kardex'],
      ['http://localhost:5173/app/inventario?tab=lotes', 'Inventario - Tab Lotes'],
      ['http://localhost:5173/app/alertas', 'Alertas de Stock y Vencimiento'],
      ['http://localhost:5173/app/ventas', 'Historial de Ventas'],
      ['http://localhost:5173/app/reportes', 'Reportes y Finanzas'],
      ['http://localhost:5173/app/usuarios', 'Gestión de Usuarios']
    ];

    for (const [url, desc] of adminRoutes) {
      await testRoute(url, desc);
    }

    console.log('\n--- FASE 3: PROBANDO ACCIONES DENTRO DE LAS PAGINAS ---');

    // 1. En POS: Interactuar con teclado / búsqueda / cobrar
    console.log('Probando interacciones en POS...');
    await send('Page.navigate', { url: 'http://localhost:5173/app/pos' });
    await sleep(1200);
    const posInteract = await evaluate(`
      (() => {
        try {
          // Buscar input de búsqueda
          const searchInput = document.querySelector('input[placeholder*="Buscar"]');
          if (searchInput) {
            searchInput.value = 'Panadol';
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
          // Presionar F12 para modal cobro si hubiera items
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F12', bubbles: true }));
          return { ok: true, foundSearch: !!searchInput };
        } catch (e) {
          return { ok: false, error: e.message };
        }
      })()
    `);
    await sleep(600);
    const posCrash = await evaluate(`document.body.innerText.includes('Se produjo un error inesperado')`);
    console.log('POS tras interactuar:', posCrash ? '❌ CRASH' : '✅ OK', posInteract);

    // 2. En Inventario: Cambiar tabs y abrir modales
    console.log('Probando interacciones en Inventario...');
    await send('Page.navigate', { url: 'http://localhost:5173/app/inventario' });
    await sleep(1200);
    const invInteract = await evaluate(`
      (() => {
        try {
          const buttons = Array.from(document.querySelectorAll('button'));
          // Click en botón "Nuevo Medicamento"
          const btnNuevo = buttons.find(b => b.innerText.includes('Nuevo Medicamento') || b.innerText.includes('Nuevo'));
          if (btnNuevo) btnNuevo.click();
          return { ok: true, clicked: btnNuevo ? btnNuevo.innerText.trim() : 'ninguno' };
        } catch (e) {
          return { ok: false, error: e.message };
        }
      })()
    `);
    await sleep(600);
    const invCrash = await evaluate(`document.body.innerText.includes('Se produjo un error inesperado')`);
    console.log('Inventario tras click nuevo medicamento:', invCrash ? '❌ CRASH' : '✅ OK', invInteract);

    // 3. En Reportes: Cambiar pestañas o filtros
    console.log('Probando interacciones en Reportes...');
    await send('Page.navigate', { url: 'http://localhost:5173/app/reportes' });
    await sleep(1200);
    const repCrash = await evaluate(`document.body.innerText.includes('Se produjo un error inesperado')`);
    console.log('Reportes:', repCrash ? '❌ CRASH' : '✅ OK');

    // 4. En Alertas
    console.log('Probando interacciones en Alertas...');
    await send('Page.navigate', { url: 'http://localhost:5173/app/alertas' });
    await sleep(1200);
    const altCrash = await evaluate(`document.body.innerText.includes('Se produjo un error inesperado')`);
    console.log('Alertas:', altCrash ? '❌ CRASH' : '✅ OK');

    // 5. En Usuarios
    console.log('Probando interacciones en Usuarios...');
    await send('Page.navigate', { url: 'http://localhost:5173/app/usuarios' });
    await sleep(1200);
    const usrCrash = await evaluate(`document.body.innerText.includes('Se produjo un error inesperado')`);
    console.log('Usuarios:', usrCrash ? '❌ CRASH' : '✅ OK');

    console.log('\n--- FASE 4: PROBANDO CLIENTE CON SESION DE CLIENTE (PORTAL) ---');
    // Registrar un cliente ficticio en localStorage y probar las 4 pestañas de /cliente
    await evaluate(`
      const testClient = {
        id: '72345678',
        name: 'Carlos Mendoza',
        dni: '72345678',
        email: 'carlos.mendoza@gmail.com',
        phone: '987654321',
        address: 'Av. Brasil 1234',
        district: 'Jesús María'
      };
      localStorage.setItem('botica_cliente_activo', JSON.stringify(testClient));
    `);
    await send('Page.navigate', { url: 'http://localhost:5173/cliente' });
    await sleep(1000);
    const clienteCrash = await evaluate(`document.body.innerText.includes('Se produjo un error inesperado')`);
    console.log('Portal Cliente (Autenticado):', clienteCrash ? '❌ CRASH' : '✅ OK');

    // Cambiar pestañas en /cliente
    const clientTabs = ['Mi Botiquín', 'Ficha Médica', 'Datos de Contacto', 'Mis Pedidos'];
    for (const tabName of clientTabs) {
      await evaluate(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText.includes('${tabName}'));
          if (btn) btn.click();
        })()
      `);
      await sleep(500);
      const tabCrash = await evaluate(`document.body.innerText.includes('Se produjo un error inesperado')`);
      console.log(`  Pestaña [${tabName}]:`, tabCrash ? '❌ CRASH' : '✅ OK');
    }

    ws.close();
    console.log('\n--- FIN DE DIAGNOSTICO COMPLETO ---');

  } catch (err) {
    console.error('Error general:', err);
  } finally {
    chromeProc.kill();
  }
}

main();
