import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;

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
    await sleep(300);
  }
  throw new Error('Could not connect to Chrome debugging port');
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
    this.events = [];
    this.errors = [];
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else if (msg.method) {
        if (msg.method === 'Runtime.exceptionThrown') {
          this.errors.push(msg.params.exceptionDetails);
        } else if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
          this.errors.push(msg.params.entry);
        }
      }
    };

    await this.send('Runtime.enable');
    await this.send('Page.enable');
    await this.send('Log.enable');
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || 'Eval error');
    }
    return res.result?.value;
  }

  async navigate(url) {
    this.errors = [];
    await this.send('Page.navigate', { url });
    await sleep(1500); // Wait for React lazy-loading & hydration
  }

  async setViewport(width, height, isMobile = false) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: isMobile
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  console.log('Iniciando Chrome Headless...');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--disable-extensions',
    '--user-data-dir=' + process.env.TEMP + '/chrome_botica_test_' + Date.now()
  ]);

  try {
    const wsUrl = await getDebuggerUrl();
    console.log('Conectado a Chrome CDP:', wsUrl);

    // Get the first open page target
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    console.log('Usando tab:', pageTab.id, pageTab.url);

    const client = new CDPClient(pageTab.webSocketDebuggerUrl);
    await client.connect();

    // Iniciar sesión como ADMIN en localStorage para poder probar rutas públicas y privadas
    console.log('Configurando sesión admin en localStorage...');
    await client.navigate('http://localhost:5173/admin/login');
    
    // Obtener token admin de login API local
    const loginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@novasalud.com', password: 'Admin123!' })
    });
    const { token, usuario } = await loginRes.json();

    await client.evaluate(`
      localStorage.setItem('novasalud_token', '${token}');
      localStorage.setItem('novasalud_usuario', JSON.stringify(${JSON.stringify(usuario)}));
    `);

    const routesToTest = [
      '/',
      '/tienda',
      '/productos',
      '/products',
      '/product/panadol-antigripal-nf',
      '/product/apronax-550-mg',
      '/product/losartan-50mg-iqfarma',
      '/cart',
      '/checkout',
      '/cliente',
      '/about',
      '/visor-cliente',
      '/pago-movil',
      '/escanear-movil',
      '/terminal-movil',
      '/app/dashboard',
      '/app/pos',
      '/app/inventario',
      '/app/alertas',
      '/app/ventas',
      '/app/reportes',
      '/app/usuarios'
    ];

    const viewports = [
      { name: 'MÓVIL (iPhone SE 375x667)', width: 375, height: 667, mobile: true },
      { name: 'PC (Desktop 1280x800)', width: 1280, height: 800, mobile: false }
    ];

    const report = [];

    for (const vp of viewports) {
      console.log(`\n========================================`);
      console.log(`PROBANDO MODO: ${vp.name}`);
      console.log(`========================================`);
      await client.setViewport(vp.width, vp.height, vp.mobile);

      for (const route of routesToTest) {
        const fullUrl = `http://localhost:5173${route}`;
        await client.navigate(fullUrl);
        await sleep(1000); // Esperar renderizado completo

        // Verificar si apareció la pantalla de error
        const domInfo = await client.evaluate(`
          (() => {
            const hasErrorHeading = document.body.innerText.includes('Se produjo un error inesperado');
            const hasErrorText = document.body.innerText.includes('El sistema detectó una excepción');
            const errorPre = document.querySelector('pre') ? document.querySelector('pre').innerText : null;
            const scrollWidth = document.documentElement.scrollWidth;
            const clientWidth = document.documentElement.clientWidth;
            const hasOverflow = scrollWidth > clientWidth + 2;
            const pageTitle = document.title;
            return {
              hasErrorHeading,
              hasErrorText,
              errorPre,
              scrollWidth,
              clientWidth,
              hasOverflow,
              pageTitle,
              bodySnippet: document.body.innerText.substring(0, 150)
            };
          })()
        `);

        const isCrashed = domInfo.hasErrorHeading || domInfo.hasErrorText;
        const resultItem = {
          mode: vp.name,
          route,
          isCrashed,
          errorMessage: domInfo.errorPre,
          hasOverflow: domInfo.hasOverflow,
          scrollWidth: domInfo.scrollWidth,
          clientWidth: domInfo.clientWidth,
          consoleErrors: client.errors.map(e => e.text || e.description || JSON.stringify(e))
        };

        report.push(resultItem);

        if (isCrashed) {
          console.error(`❌ CRASH en ${route} (${vp.name}):`);
          console.error(`   Error: ${domInfo.errorPre}`);
        } else if (domInfo.hasOverflow && vp.mobile) {
          console.warn(`⚠️ OVERFLOW horizontal en ${route} (${vp.name}): scrollWidth ${domInfo.scrollWidth} > clientWidth ${domInfo.clientWidth}`);
        } else {
          console.log(`✅ OK: ${route} (${domInfo.clientWidth}px)`);
        }
      }
    }

    client.close();

    console.log('\n========================================');
    console.log('RESUMEN DE AUDITORÍA:');
    const crashes = report.filter(r => r.isCrashed);
    const overflows = report.filter(r => r.hasOverflow && r.mode.includes('MÓVIL'));

    console.log(`Total rutas probadas: ${report.length}`);
    console.log(`Total crashes (Se produjo un error): ${crashes.length}`);
    console.log(`Total overflows móviles: ${overflows.length}`);

    if (crashes.length > 0) {
      console.log('\nRUTAS CON ERROR:');
      crashes.forEach(c => console.log(`- ${c.mode}: ${c.route} -> ${c.errorMessage}`));
    }
    if (overflows.length > 0) {
      console.log('\nRUTAS CON OVERFLOW:');
      overflows.forEach(o => console.log(`- ${o.route}: scrollWidth ${o.scrollWidth} > clientWidth ${o.clientWidth}`));
    }

  } catch (err) {
    console.error('Error durante la prueba:', err);
  } finally {
    chromeProc.kill();
  }
}

main();
