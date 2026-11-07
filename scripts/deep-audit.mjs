import { spawn } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9334;

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
      const errText = res.exceptionDetails.exception?.description || res.exceptionDetails.text || 'Eval error';
      throw new Error(errText);
    }
    return res.result?.value;
  }

  async navigate(url) {
    this.errors = [];
    await this.send('Page.navigate', { url });
    await sleep(1500);
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

async function runAudit() {
  console.log('--- INICIANDO AUDITORIA DINAMICA COMPLETA ---');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--disable-extensions',
    '--user-data-dir=' + process.env.TEMP + '/chrome_deep_audit_' + Date.now()
  ]);

  try {
    const wsUrl = await getDebuggerUrl();
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    const client = new CDPClient(pageTab.webSocketDebuggerUrl);
    await client.connect();

    // 1. Obtener Token Admin
    let adminToken = '';
    let adminUser = null;
    try {
      const loginRes = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@novasalud.com', password: 'Admin123!' })
      });
      const data = await loginRes.json();
      adminToken = data.token;
      adminUser = data.usuario;
    } catch (e) {
      console.warn('No se pudo conectar a backend local para login admin:', e.message);
    }

    const testScenarios = [
      { name: 'GUEST (Sin iniciar sesión) - DESKTOP 1280x800', width: 1280, height: 800, mobile: false, auth: false },
      { name: 'GUEST (Sin iniciar sesión) - MOVIL 375x667', width: 375, height: 667, mobile: true, auth: false },
      { name: 'ADMIN (Sesión iniciada) - DESKTOP 1280x800', width: 1280, height: 800, mobile: false, auth: true },
      { name: 'ADMIN (Sesión iniciada) - MOVIL 375x667', width: 375, height: 667, mobile: true, auth: true },
    ];

    const allRoutes = [
      '/',
      '/productos',
      '/products',
      '/tienda',
      '/cart',
      '/carrito',
      '/checkout',
      '/cliente',
      '/about',
      '/nosotros',
      '/servicios',
      '/reclamaciones',
      '/catalogo',
      '/product/panadol-antigripal-nf',
      '/product/apronax-550-mg',
      '/product/losartan-50mg-iqfarma',
      '/product/producto-que-no-existe-404',
      '/project/medicina-general',
      '/visor-cliente',
      '/pago-movil',
      '/escanear-movil',
      '/terminal-movil',
      '/admin/login',
      '/app/dashboard',
      '/app/pos',
      '/app/inventario',
      '/app/alertas',
      '/app/ventas',
      '/app/reportes',
      '/app/usuarios'
    ];

    const detectedIssues = [];

    for (const scenario of testScenarios) {
      console.log(`\n======================================================`);
      console.log(`ESCENARIO: ${scenario.name}`);
      console.log(`======================================================`);

      await client.setViewport(scenario.width, scenario.height, scenario.mobile);

      // Configurar localStorage según escenario
      await client.navigate('http://localhost:5173/admin/login');
      if (scenario.auth && adminToken) {
        await client.evaluate(`
          localStorage.setItem('novasalud_token', '${adminToken}');
          localStorage.setItem('novasalud_usuario', JSON.stringify(${JSON.stringify(adminUser)}));
        `);
      } else {
        await client.evaluate(`
          localStorage.clear();
          sessionStorage.clear();
        `);
      }

      for (const route of allRoutes) {
        // Si es guest y la ruta es de /app/, la app redirige a login o muestra ruta protegida, probémosla
        await client.navigate(`http://localhost:5173${route}`);
        await sleep(700);

        const check = await client.evaluate(`
          (() => {
            const bodyText = document.body.innerText || '';
            const isErrorBoundary = bodyText.includes('Se produjo un error inesperado');
            const preError = document.querySelector('pre') ? document.querySelector('pre').innerText : null;
            const scrollW = document.documentElement.scrollWidth;
            const clientW = document.documentElement.clientWidth;
            const isOverflow = scrollW > clientW + 2;
            
            // Buscar elementos desbordantes
            let overflowingElements = [];
            if (isOverflow) {
              const all = document.querySelectorAll('*');
              for (const el of all) {
                if (el.scrollWidth > clientW + 5 && el.offsetWidth > clientW) {
                  const tag = el.tagName.toLowerCase();
                  const cls = (el.className && typeof el.className === 'string') ? el.className.split(' ').slice(0, 3).join('.') : '';
                  overflowingElements.push(tag + (cls ? '.' + cls : ''));
                  if (overflowingElements.length >= 3) break;
                }
              }
            }

            return {
              isErrorBoundary,
              preError,
              isOverflow,
              scrollW,
              clientW,
              overflowingElements,
              currentUrl: window.location.pathname
            };
          })()
        `);

        if (check.isErrorBoundary) {
          console.error(`💥 CRASH en ${route} -> ${check.preError}`);
          detectedIssues.push({
            scenario: scenario.name,
            route,
            type: 'CRASH',
            details: check.preError
          });
        } else if (check.isOverflow && scenario.mobile) {
          console.warn(`📐 OVERFLOW en ${route} (${check.scrollW}px > ${check.clientW}px) -> ${check.overflowingElements.join(', ')}`);
          detectedIssues.push({
            scenario: scenario.name,
            route,
            type: 'OVERFLOW',
            details: `${check.scrollW}px > ${check.clientW}px (${check.overflowingElements.join(', ')})`
          });
        } else {
          // OK
        }
      }

      // Probar interacciones dinámicas en inicio y catálogo
      if (!scenario.auth) {
        console.log(`\nProbando aperturas de Modales en Inicio (${scenario.name})...`);
        await client.navigate('http://localhost:5173/');
        await sleep(1000);

        // Probar abrir Modal de Cotización
        try {
          const resCot = await client.evaluate(`
            (() => {
              // Buscar botón o link de cotización o enviar receta
              const buttons = Array.from(document.querySelectorAll('button, a'));
              const cotBtn = buttons.find(b => b.innerText && (b.innerText.includes('ENVIAR RECETA') || b.innerText.includes('Cotizar') || b.innerText.includes('COTIZAR')));
              if (cotBtn) {
                cotBtn.click();
                return 'Clicked ' + cotBtn.innerText.trim();
              }
              return 'No cotBtn found';
            })()
          `);
          await sleep(800);
          const crashCheck = await client.evaluate(`document.body.innerText.includes('Se produjo un error inesperado')`);
          if (crashCheck) {
            console.error(`💥 CRASH al abrir QuotationModal!`);
            detectedIssues.push({ scenario: scenario.name, route: '/ (Modal Cotizacion)', type: 'CRASH', details: 'QuotationModal crashed' });
          } else {
            console.log(`  Modal Cotización: ${resCot}`);
          }
        } catch (e) {
          console.error(`  Error probando cotización:`, e.message);
        }

        // Probar abrir Modal de Servicios
        try {
          await client.evaluate(`
            (() => {
              const buttons = Array.from(document.querySelectorAll('button, a'));
              const btn = buttons.find(b => b.innerText && b.innerText.includes('SERVICIOS'));
              if (btn) btn.click();
            })()
          `);
          await sleep(600);
          const crashCheck = await client.evaluate(`document.body.innerText.includes('Se produjo un error inesperado')`);
          if (crashCheck) {
            console.error(`💥 CRASH al abrir ServicesModal!`);
            detectedIssues.push({ scenario: scenario.name, route: '/ (Modal Servicios)', type: 'CRASH', details: 'ServicesModal crashed' });
          }
        } catch (e) {}

        // Probar abrir Modal de Nosotros
        try {
          await client.evaluate(`
            (() => {
              const buttons = Array.from(document.querySelectorAll('button, a'));
              const btn = buttons.find(b => b.innerText && b.innerText.includes('NOSOTROS'));
              if (btn) btn.click();
            })()
          `);
          await sleep(600);
          const crashCheck = await client.evaluate(`document.body.innerText.includes('Se produjo un error inesperado')`);
          if (crashCheck) {
            console.error(`💥 CRASH al abrir BrandModal!`);
            detectedIssues.push({ scenario: scenario.name, route: '/ (Modal Nosotros)', type: 'CRASH', details: 'BrandModal crashed' });
          }
        } catch (e) {}
      }
    }

    client.close();

    console.log('\n======================================================');
    console.log('REPORTE FINAL DE ERRORES Y DESBORDES:');
    console.log('======================================================');
    if (detectedIssues.length === 0) {
      console.log('¡Ningún error fatal ni desborde detectado en los recorridos iniciales!');
    } else {
      detectedIssues.forEach((issue, idx) => {
        console.log(`[${idx + 1}] [${issue.type}] [${issue.scenario}] ${issue.route}: ${issue.details}`);
      });
    }

  } catch (err) {
    console.error('Error fatal durante la auditoría:', err);
  } finally {
    chromeProc.kill();
  }
}

runAudit();
