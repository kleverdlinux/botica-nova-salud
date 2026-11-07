import { spawn } from 'child_process';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', '--remote-debugging-port=9339', '--no-sandbox'
]);

setTimeout(async () => {
  try {
    const v = await fetch('http://127.0.0.1:9339/json/version').then(r => r.json());
    const ws = new WebSocket(v.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    const send = (m, p) => new Promise(r => {
      const i = id++;
      const handler = e => {
        const d = JSON.parse(e.data);
        if (d.id === i) { ws.removeEventListener('message', handler); r(d); }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: i, method: m, params: p }));
    });

    await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
    await send('Page.navigate', { url: 'http://localhost:5173/productos' });
    await new Promise(r => setTimeout(r, 1500));

    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const els = Array.from(document.querySelectorAll('*'));
        const offending = [];
        for (const el of els) {
          const rect = el.getBoundingClientRect();
          if (rect.right > 377) {
            offending.push({
              tag: el.tagName,
              cls: typeof el.className === 'string' ? el.className : '',
              id: el.id,
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              text: (el.innerText || '').slice(0, 35)
            });
          }
        }
        return offending.slice(0, 15);
      })()`,
      returnByValue: true
    });

    console.log('Offending elements in /productos:');
    console.log(JSON.stringify(res, null, 2));
    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    chrome.kill();
  }
}, 1000);
