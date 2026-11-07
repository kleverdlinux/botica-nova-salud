import { spawn } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9337;

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
  console.log('--- INICIANDO ESCANEO DE RESPONSIVIDAD MOVIL (375x667) ---');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--user-data-dir=' + process.env.TEMP + '/chrome_mobile_audit_' + Date.now()
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

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
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
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true
    });

    const evaluate = async (expr) => {
      const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return res.result?.result?.value;
    };

    // Login Admin para poder ver páginas públicas y privadas
    const loginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@novasalud.com', password: 'Admin123!' })
    });
    const { token, usuario } = await loginRes.json();

    await send('Page.navigate', { url: 'http://localhost:5173/admin/login' });
    await sleep(400);
    await evaluate(`
      localStorage.setItem('novasalud_token', '${token}');
      localStorage.setItem('novasalud_usuario', JSON.stringify(${JSON.stringify(usuario)}));
    `);

    const routesToCheck = [
      '/',
      '/productos',
      '/products',
      '/cart',
      '/checkout',
      '/cliente',
      '/about',
      '/product/panadol-antigripal-nf',
      '/product/apronax-550-mg',
      '/admin/login',
      '/visor-cliente',
      '/pago-movil',
      '/escanear-movil',
      '/terminal-movil',
      '/app/dashboard',
      '/app/pos',
      '/app/inventario',
      '/app/inventario?tab=kardex',
      '/app/inventario?tab=lotes',
      '/app/alertas',
      '/app/ventas',
      '/app/reportes',
      '/app/usuarios'
    ];

    const results = [];

    for (const route of routesToCheck) {
      await send('Page.navigate', { url: `http://localhost:5173${route}` });
      await sleep(1000);

      const check = await evaluate(`
        (() => {
          const clientW = document.documentElement.clientWidth;
          const scrollW = document.documentElement.scrollWidth;
          const bodyScrollW = document.body.scrollWidth;
          const maxW = Math.max(scrollW, bodyScrollW);
          const hasOverflow = maxW > clientW + 2;

          let offenders = [];
          if (hasOverflow) {
            const all = document.querySelectorAll('*');
            for (const el of all) {
              const rect = el.getBoundingClientRect();
              if (rect.right > clientW + 2 || el.scrollWidth > clientW + 2) {
                const tag = el.tagName.toLowerCase();
                const cls = (typeof el.className === 'string') ? el.className.split(' ').slice(0, 2).join('.') : '';
                const id = el.id ? '#' + el.id : '';
                offenders.push(tag + id + (cls ? '.' + cls : '') + ' [w:' + Math.round(rect.width) + 'px, r:' + Math.round(rect.right) + 'px]');
                if (offenders.length >= 4) break;
              }
            }
          }

          return { clientW, maxW, hasOverflow, offenders };
        })()
      `);

      if (check.hasOverflow) {
        console.log(`❌ OVERFLOW en ${route}: maxW ${check.maxW}px > clientW ${check.clientW}px`);
        console.log(`   Causantes: ${check.offenders.join(' | ')}`);
        results.push({ route, ...check });
      } else {
        console.log(`✅ OK: ${route} (${check.clientW}px)`);
      }
    }

    // Probar Modales en Móvil
    console.log('\n--- PROBANDO MODALES EN MOVIL ---');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await sleep(1000);

    // 1. Abrir Quotation Modal
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button, a'));
        const b = btns.find(x => x.innerText && (x.innerText.includes('ENVIAR RECETA') || x.innerText.includes('COTIZAR')));
        if (b) b.click();
      })()
    `);
    await sleep(600);
    let modalCheck = await evaluate(`
      (() => {
        const clientW = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        const hasOverflow = scrollW > clientW + 2;
        const modal = document.querySelector('.fixed.inset-0');
        const modalW = modal ? modal.scrollWidth : 0;
        return { clientW, scrollW, hasOverflow, modalW };
      })()
    `);
    console.log('QuotationModal en móvil:', modalCheck.hasOverflow ? `❌ OVERFLOW (${modalCheck.scrollW}px)` : '✅ OK');

    // Cerrar modal
    await evaluate(`
      (() => {
        const closeBtn = document.querySelector('button[aria-label*="Cerrar"]');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(400);

    // 2. Abrir MenuDrawer
    await evaluate(`
      (() => {
        const btn = document.querySelector('button[aria-label*="Menú"], button[aria-label*="menu"]');
        if (btn) btn.click();
      })()
    `);
    await sleep(600);
    modalCheck = await evaluate(`
      (() => {
        const clientW = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        return { clientW, scrollW, hasOverflow: scrollW > clientW + 2 };
      })()
    `);
    console.log('MenuDrawer en móvil:', modalCheck.hasOverflow ? `❌ OVERFLOW (${modalCheck.scrollW}px)` : '✅ OK');

    ws.close();
    console.log('\n--- ESCANEO DE RESPONSIVIDAD FINALIZADO ---');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chromeProc.kill();
  }
}

main();
