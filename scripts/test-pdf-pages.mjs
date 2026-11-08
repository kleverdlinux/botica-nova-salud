import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9365;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_pdf_final_' + Date.now());
  const proc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    `--user-data-dir=${tempDir}`
  ]);

  try {
    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
        const data = await res.json();
        if (data.webSocketDebuggerUrl) { wsUrl = data.webSocketDebuggerUrl; break; }
      } catch (e) {}
      await sleep(200);
    }
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    const pageTab = list.find(t => t.type === 'page') || list[0];
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = id++;
        const handler = (evt) => {
          const m = JSON.parse(evt.data);
          if (m.id === curId) {
            ws.removeEventListener('message', handler);
            if (m.error) reject(m.error); else resolve(m.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
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
    await sleep(3000);

    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[title="Ver comprobante electrónico SUNAT"]');
          if (btn) btn.click();
        })()
      `
    });
    await sleep(2000);

    // Emulate print and measure top and dimensions
    await send('Emulation.setEmulatedMedia', { media: 'print' });
    await sleep(500);

    const box = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `
        (() => {
          const el = document.getElementById('seccion-boleta-imprimible');
          if (!el) return 'Elemento no encontrado';
          const r = el.getBoundingClientRect();
          return {
            rect: { top: r.top, left: r.left, width: r.width, height: r.height }
          };
        })()
      `
    });
    console.log('BOX IN PRINT MEDIA (NO INJECTION):', JSON.stringify(box.result.value, null, 2));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/ASUS/.gemini/antigravity/brain/c5864821-fe51-4e53-866b-5dceb635d61c/test-final-print-preview.png', Buffer.from(shot.data, 'base64'));

    const pdfRes = await send('Page.printToPDF', {
      printBackground: true,
      paperWidth: 8.27,
      paperHeight: 11.69,
      marginTop: 0.2,
      marginBottom: 0.2,
      marginLeft: 0.2,
      marginRight: 0.2,
    });
    const pdfBuffer = Buffer.from(pdfRes.data, 'base64');
    fs.writeFileSync('C:/Users/ASUS/.gemini/antigravity/brain/c5864821-fe51-4e53-866b-5dceb635d61c/boleta-final-verified.pdf', pdfBuffer);
    const pdfText = pdfBuffer.toString('latin1');
    const pageMatches = pdfText.match(/\/Type\s*\/Page\b/g);
    console.log('Verified PDF Page Count:', pageMatches ? pageMatches.length : 'unknown');

  } finally {
    proc.kill();
  }
}
main().catch(console.error);
