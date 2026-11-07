import { spawn } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9336;

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
  console.log('--- TEST DE ROLES: CAJERO Y ALMACEN ---');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--user-data-dir=' + process.env.TEMP + '/chrome_role_test_' + Date.now()
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
        console.error(' [EXCEPTION]:', desc.split('\n')[0]);
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

    const evaluate = async (expr) => {
      const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return res.result?.result?.value;
    };

    const rolesToTest = [
      { email: 'cajero@novasalud.com', pass: 'Cajero123!', role: 'CAJERO' },
      { email: 'almacen@novasalud.com', pass: 'Almacen123!', role: 'ALMACEN' }
    ];

    for (const r of rolesToTest) {
      console.log(`\nProbando ROL: ${r.role} (${r.email})...`);
      const resLogin = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: r.email, password: r.pass })
      });
      const dataLogin = await resLogin.json();
      console.log('Login respuesta:', dataLogin.usuario?.rol);

      await send('Page.navigate', { url: 'http://localhost:5173/admin/login' });
      await sleep(400);

      await evaluate(`
        localStorage.setItem('novasalud_token', '${dataLogin.token}');
        localStorage.setItem('novasalud_usuario', JSON.stringify(${JSON.stringify(dataLogin.usuario)}));
      `);

      // Probar navegación a dashboard
      await send('Page.navigate', { url: 'http://localhost:5173/app/dashboard' });
      await sleep(1500);

      let check = await evaluate(`
        (() => {
          const body = document.body.innerText || '';
          const hasCrash = body.includes('Se produjo un error inesperado');
          const pre = document.querySelector('pre') ? document.querySelector('pre').innerText : '';
          return { hasCrash, pre };
        })()
      `);
      console.log(`  Dashboard como ${r.role}:`, check.hasCrash ? `❌ CRASH: ${check.pre}` : '✅ OK');

      // Probar inventario
      await send('Page.navigate', { url: 'http://localhost:5173/app/inventario' });
      await sleep(1500);
      check = await evaluate(`
        (() => {
          const body = document.body.innerText || '';
          const hasCrash = body.includes('Se produjo un error inesperado');
          const pre = document.querySelector('pre') ? document.querySelector('pre').innerText : '';
          return { hasCrash, pre };
        })()
      `);
      console.log(`  Inventario como ${r.role}:`, check.hasCrash ? `❌ CRASH: ${check.pre}` : '✅ OK');

      if (r.role === 'CAJERO') {
        // Probar POS
        await send('Page.navigate', { url: 'http://localhost:5173/app/pos' });
        await sleep(1500);
        check = await evaluate(`
          (() => {
            const body = document.body.innerText || '';
            const hasCrash = body.includes('Se produjo un error inesperado');
            const pre = document.querySelector('pre') ? document.querySelector('pre').innerText : '';
            return { hasCrash, pre };
          })()
        `);
        console.log(`  POS como ${r.role}:`, check.hasCrash ? `❌ CRASH: ${check.pre}` : '✅ OK');
      }

      if (r.role === 'ALMACEN') {
        // Probar Alertas
        await send('Page.navigate', { url: 'http://localhost:5173/app/alertas' });
        await sleep(1500);
        check = await evaluate(`
          (() => {
            const body = document.body.innerText || '';
            const hasCrash = body.includes('Se produjo un error inesperado');
            const pre = document.querySelector('pre') ? document.querySelector('pre').innerText : '';
            return { hasCrash, pre };
          })()
        `);
        console.log(`  Alertas como ${r.role}:`, check.hasCrash ? `❌ CRASH: ${check.pre}` : '✅ OK');
      }
    }

    ws.close();
    console.log('\n--- PRUEBA COMPLETADA ---');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    chromeProc.kill();
  }
}

main();
