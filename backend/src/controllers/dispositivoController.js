import os from 'os';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hub de sincronización en tiempo real para dispositivos móviles y terminales POS

const clientesSSE = new Set();
let ultimoEstado = {
  modo: 'REPOSO', // 'REPOSO' | 'CARRITO' | 'YAPE_PLIN' | 'TARJETA' | 'EXITO'
  items: [],
  total: 0,
  ticketId: '',
  clienteNom: '',
  timestamp: Date.now()
};

/**
 * Obtener la IP IPv4 local en la red Wi-Fi/Ethernet para que los celulares se conecten
 */
export const obtenerIpLocal = () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('127.')) {
        return net.address;
      }
    }
  }
  return '192.168.18.23'; // Fallback a la IP de red local
};

/**
 * Canal SSE (Server-Sent Events) para sincronizar laptop <-> celular en vivo por Wi-Fi
 */
export const conectarStream = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const ipLocal = obtenerIpLocal();

  // Enviar estado actual al conectarse con la IP local garantizada
  res.write(`data: ${JSON.stringify({
    tipo: 'ESTADO_ACTUAL',
    payload: {
      ...ultimoEstado,
      ipLocal,
      urlTerminal: `http://${ipLocal}:5173/terminal-movil`
    }
  })}\n\n`);

  clientesSSE.add(res);

  // Notificar a todos que hay un dispositivo conectado
  broadcast({
    tipo: 'DISPOSITIVOS_ACTUALIZADOS',
    payload: {
      totalConectados: clientesSSE.size,
      ipLocal,
      urlTerminal: `http://${ipLocal}:5173/terminal-movil`
    }
  });

  // Latido cada 20 segundos para mantener la conexión activa en redes Wi-Fi
  const pingInterval = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch (e) {
      clearInterval(pingInterval);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(pingInterval);
    clientesSSE.delete(res);
    broadcast({
      tipo: 'DISPOSITIVOS_ACTUALIZADOS',
      payload: {
        totalConectados: clientesSSE.size,
        ipLocal
      }
    });
  });
};

/**
 * Emitir un evento desde el POS o desde el celular
 */
export const emitirEvento = (req, res) => {
  const { tipo, payload } = req.body;

  if (!tipo) {
    return res.status(400).json({ error: 'Campo "tipo" requerido.' });
  }

  const evento = {
    tipo,
    payload: payload || {},
    timestamp: Date.now()
  };

  // Si actualiza el estado del cobro, guardarlo en memoria
  if (tipo === 'ACTUALIZAR_ESTADO') {
    ultimoEstado = { ...ultimoEstado, ...payload, timestamp: Date.now() };
  }

  broadcast(evento);

  return res.status(200).json({ ok: true, totalConectados: clientesSSE.size });
};

/**
 * Consultar el estado actual y número de dispositivos conectados
 */
export const obtenerEstado = (req, res) => {
  const ipLocal = obtenerIpLocal();
  return res.status(200).json({
    estado: ultimoEstado,
    dispositivosConectados: clientesSSE.size,
    ipLocal,
    urlTerminal: `http://${ipLocal}:5173/terminal-movil`,
    urlVisor: `http://${ipLocal}:5173/visor-cliente`
  });
};

/**
 * Información de conectividad de red USB y periféricos del sistema
 */
export const obtenerInfoConexion = (req, res) => {
  const ipLocal = obtenerIpLocal();
  const nets = os.networkInterfaces();
  const interfaces = [];
  let anclajeUsbActivo = false;

  for (const [name, addrs] of Object.entries(nets)) {
    for (const net of addrs) {
      if (net.family === 'IPv4' && !net.internal) {
        const esUsb = /rndis|ncm|cdc|remote ndis|usb/i.test(name);
        if (esUsb) anclajeUsbActivo = true;
        interfaces.push({
          nombre: name,
          ip: net.address,
          esUsb
        });
      }
    }
  }

  const host = req.get('host');
  const isCloud = host && !host.includes('localhost') && !host.includes('127.0.0.1') && !host.startsWith('192.168.');
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';

  const urlTerminal = isCloud ? `${protocol}://${host}/terminal-movil` : `http://${ipLocal}:5173/terminal-movil`;
  const urlVisor = isCloud ? `${protocol}://${host}/visor-cliente` : `http://${ipLocal}:5173/visor-cliente`;

  return res.status(200).json({
    ipLocal,
    anclajeUsbActivo,
    interfaces,
    urlTerminal,
    urlVisor,
    perifericosConocidos: [
      { id: 'touchpad', nombre: 'Touchpad Integrado (Laptop ASUS FX507)', tipo: 'touchpad', detalle: 'Panel táctil interno I2C (HIDI2C Device)' },
      { id: 'mouse', nombre: 'Mouse Inalámbrico 2.4G', tipo: 'mouse', detalle: 'Dongle receptor USB (2.4G Mouse)' },
      { id: 'webcam', nombre: 'Cámara Web HD (Laptop)', tipo: 'camara', detalle: 'Dispositivo de video integrado USB' }
    ]
  });
};

let cacheDispositivoUsb = null;
let cacheTimestampUsb = 0;

/**
 * Detección real del dispositivo USB conectado a la máquina física
 */
export const detectarDispositivoUsbPrincipal = () => {
  const ahora = Date.now();
  // Retornar cache si tiene menos de 15 segundos
  if (cacheDispositivoUsb && (ahora - cacheTimestampUsb < 15000)) {
    return cacheDispositivoUsb;
  }

  const sinDispositivo = {
    id: 'ninguno',
    nombre: 'Ningún dispositivo detectado',
    tipo: 'NINGUNO',
    fabricante: '',
    puerto: 'Conecte su celular o lector por USB',
    conectado: false
  };

  // En entornos en la nube (Render / Linux), la conexión con celulares es 100% vía Wi-Fi / Web
  if (process.platform !== 'win32') {
    cacheDispositivoUsb = sinDispositivo;
    cacheTimestampUsb = ahora;
    return sinDispositivo;
  }

  try {
    const psFile = path.resolve(__dirname, '../utils/detectarUsb.ps1');
    const stdout = execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${psFile}"`, {
      encoding: 'utf8',
      timeout: 10000
    });
    const items = JSON.parse(stdout);
    const lista = Array.isArray(items) ? items : [items];

    for (const item of lista) {
      const id = item.InstanceId || '';
      const name = item.FriendlyName || '';
      const clase = item.Class || '';

      // Xiaomi / Redmi (VID 2717)
      if (id.includes('VID_2717')) {
        const resultado = {
          id: 'xiaomi',
          nombre: 'Celular Xiaomi / Redmi',
          tipo: 'CELULAR',
          fabricante: 'Xiaomi Inc.',
          puerto: 'Conectado por cable USB',
          conectado: true
        };
        cacheDispositivoUsb = resultado;
        cacheTimestampUsb = ahora;
        return resultado;
      }
      // Samsung (VID 04E8)
      if (id.includes('VID_04E8')) {
        const resultado = {
          id: 'samsung',
          nombre: 'Celular Samsung Galaxy',
          tipo: 'CELULAR',
          fabricante: 'Samsung Electronics',
          puerto: 'Conectado por cable USB',
          conectado: true
        };
        cacheDispositivoUsb = resultado;
        cacheTimestampUsb = ahora;
        return resultado;
      }
      // Motorola (VID 22B8)
      if (id.includes('VID_22B8')) {
        const resultado = {
          id: 'motorola',
          nombre: 'Celular Motorola',
          tipo: 'CELULAR',
          fabricante: 'Motorola Mobility',
          puerto: 'Conectado por cable USB',
          conectado: true
        };
        cacheDispositivoUsb = resultado;
        cacheTimestampUsb = ahora;
        return resultado;
      }
      // Apple (VID 05AC)
      if (id.includes('VID_05AC')) {
        const resultado = {
          id: 'apple',
          nombre: 'Celular iPhone',
          tipo: 'CELULAR',
          fabricante: 'Apple Inc.',
          puerto: 'Conectado por cable USB',
          conectado: true
        };
        cacheDispositivoUsb = resultado;
        cacheTimestampUsb = ahora;
        return resultado;
      }
      // Otro móvil MTP o WPD
      if (clase === 'WPD' || /samsung|redmi|xiaomi|motorola|huawei|iphone|celular/i.test(name)) {
        const resultado = {
          id: 'movil',
          nombre: `Celular Móvil (${name})`,
          tipo: 'CELULAR',
          fabricante: 'Dispositivo Portátil',
          puerto: 'Conectado por cable USB',
          conectado: true
        };
        cacheDispositivoUsb = resultado;
        cacheTimestampUsb = ahora;
        return resultado;
      }
      // Lector de código de barras
      if (/barcode|scanner|lector|laser|pos/i.test(name)) {
        const resultado = {
          id: 'scanner',
          nombre: name || 'Lector de Código de Barras USB',
          tipo: 'LECTOR',
          fabricante: 'Periférico POS',
          puerto: 'Puerto USB',
          conectado: true
        };
        cacheDispositivoUsb = resultado;
        cacheTimestampUsb = ahora;
        return resultado;
      }
    }
  } catch (err) {
    console.warn('Error al detectar USB:', err.message);
  }

  cacheDispositivoUsb = sinDispositivo;
  cacheTimestampUsb = ahora;
  return sinDispositivo;
};

let cacheEstadoUsb = null;

// Sondeo periódico no bloqueante de dispositivos USB
function refrescarDeteccionUsb() {
  if (process.platform !== 'win32') return;
  try {
    const psFile = path.resolve(__dirname, '../utils/detectarUsb.ps1');
    exec(`powershell -NoProfile -ExecutionPolicy Bypass -File "${psFile}"`, { timeout: 15000 }, (err, stdout) => {
      if (!err && stdout && stdout.trim()) {
        try {
          const parsed = JSON.parse(stdout);
          const lista = Array.isArray(parsed) ? parsed : [parsed];
          const movil = lista.find(x => x.InstanceId && (x.InstanceId.includes('2717') || x.InstanceId.includes('04E8') || x.InstanceId.includes('22B8') || x.InstanceId.includes('05AC') || (x.FriendlyName && x.FriendlyName.includes('MTP'))));

          if (movil) {
            const present = movil.Present === true;
            let nombre = 'Celular Xiaomi / Redmi';
            if (movil.InstanceId && movil.InstanceId.includes('04E8')) nombre = 'Celular Samsung Galaxy';
            else if (movil.InstanceId && movil.InstanceId.includes('22B8')) nombre = 'Celular Motorola';
            else if (movil.InstanceId && movil.InstanceId.includes('05AC')) nombre = 'Celular iPhone';

            cacheEstadoUsb = {
              nombre,
              tipo: 'CELULAR',
              puerto: 'Cable USB conectado a la laptop',
              conectado: present,
              enModoSoloCarga: !present,
              mensaje: present
                ? 'Celular enlazado y listo para operar'
                : 'Cable USB detectado. En la pantalla de su celular toque la notificación "Cargando por USB" y elija "Transferencia de archivos".'
            };
            return;
          }
        } catch (e) {}
      }
      cacheEstadoUsb = null;
    });
  } catch (err) {
    // Evitar caídas por restricciones de permisos en ejecución de procesos
    cacheEstadoUsb = null;
  }
}

// Iniciar sondeo
refrescarDeteccionUsb();
setInterval(refrescarDeteccionUsb, 10000);

/**
 * Endpoint para obtener el dispositivo USB conectado en tiempo real con diagnóstico exacto
 */
export const obtenerDispositivoDetectado = (req, res) => {
  const ipLocal = obtenerIpLocal();
  return res.status(200).json({
    dispositivo: cacheEstadoUsb,
    ipLocal,
    urlTerminal: `http://${ipLocal}:5173/terminal-movil`
  });
};

function broadcast(datos) {
  const mensaje = `data: ${JSON.stringify(datos)}\n\n`;
  for (const client of clientesSSE) {
    try {
      client.write(mensaje);
    } catch (err) {
      clientesSSE.delete(client);
    }
  }
}
