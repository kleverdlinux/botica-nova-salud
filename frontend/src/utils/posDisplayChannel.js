// Sincronización en tiempo real Laptop <-> Celular a través de red local Wi-Fi y SSE

const CHANNEL_NAME = 'novasalud_pos_display_channel';
const STORAGE_KEY = 'novasalud_pos_display_state';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    // Dominio en la nube (Render, Railway, producción)
    if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1') && !hostname.startsWith('192.168.') && !hostname.startsWith('10.')) {
      return '/api';
    }
    // Red local Wi-Fi en desarrollo
    if (hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
      return `http://${hostname}:4000/api`;
    }
  }
  return 'http://localhost:4000/api';
};

class PosDisplayManager {
  constructor() {
    this.channel = typeof window !== 'undefined' && 'BroadcastChannel' in window
      ? new BroadcastChannel(CHANNEL_NAME)
      : null;
    this.eventSource = null;
    this.subscriptores = new Set();
    this.totalDispositivos = 0;
    this.ipLocal = '192.168.18.23';
    this.iniciarStreamSSE();
  }

  iniciarStreamSSE() {
    if (typeof window === 'undefined') return;

    try {
      const streamUrl = `${getApiBaseUrl()}/dispositivos/stream`;
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.payload?.ipLocal) {
            this.ipLocal = data.payload.ipLocal;
          }
          if (data.tipo === 'DISPOSITIVOS_ACTUALIZADOS') {
            this.totalDispositivos = data.payload.totalConectados;
          }
          this.notificarSubscriptores(data);
        } catch (e) {}
      };

      this.eventSource.onerror = () => {
        // Reconexión automática nativa de EventSource
      };
    } catch (e) {
      console.warn('No se pudo inicializar EventSource:', e);
    }
  }

  obtenerHostMovil() {
    if (typeof window !== 'undefined') {
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return window.location.hostname;
      }
    }
    return this.ipLocal || '192.168.18.23';
  }

  obtenerUrlTerminal() {
    if (typeof window !== 'undefined') {
      const { protocol, host, hostname } = window.location;
      if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1') && !hostname.startsWith('192.168.')) {
        return `${protocol}//${host}/terminal-movil`;
      }
    }
    const host = this.obtenerHostMovil();
    return `http://${host}:5173/terminal-movil`;
  }

  obtenerUrlVisor() {
    if (typeof window !== 'undefined') {
      const { protocol, host, hostname } = window.location;
      if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1') && !hostname.startsWith('192.168.')) {
        return `${protocol}//${host}/visor-cliente`;
      }
    }
    const host = this.obtenerHostMovil();
    return `http://${host}:5173/visor-cliente`;
  }

  notificarSubscriptores(data) {
    for (const callback of this.subscriptores) {
      try {
        callback(data);
      } catch (err) {
        console.error('Error en suscriptor:', err);
      }
    }
  }

  // Enviar el estado del POS a la pantalla del cliente y dispositivos móviles conectados
  enviarEstado(estadoData) {
    const payload = {
      ...estadoData,
      timestamp: Date.now()
    };

    // 1. Guardar en almacenamiento local
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {}
    }

    // 2. Emitir por BroadcastChannel (mismo navegador)
    if (this.channel) {
      try {
        this.channel.postMessage({ tipo: 'ACTUALIZAR_ESTADO', payload });
      } catch (e) {}
    }

    // 3. Emitir por el backend para que llegue al CELULAR o tablet en la red Wi-Fi
    this.emitirAlServidor('ACTUALIZAR_ESTADO', payload);
  }

  // Notificar que un cliente completó el pago en su móvil
  notificarPagoMovil(pagoData) {
    const payload = {
      ...pagoData,
      timestamp: Date.now()
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('novasalud_ultimo_pago_movil', JSON.stringify(payload));
    }

    if (this.channel) {
      this.channel.postMessage({ tipo: 'PAGO_MOVIL_CONFIRMADO', payload });
    }

    this.emitirAlServidor('PAGO_MOVIL_CONFIRMADO', payload);
  }

  // Cambiar método de pago desde el celular (YAPE_PLIN o TARJETA)
  cambiarMetodoPago(metodoPago) {
    const payload = { metodoPago, timestamp: Date.now() };
    if (typeof window !== 'undefined') {
      localStorage.setItem('novasalud_cambio_metodo', JSON.stringify(payload));
    }
    if (this.channel) {
      this.channel.postMessage({ tipo: 'CAMBIAR_METODO_PAGO', payload });
    }
    this.emitirAlServidor('CAMBIAR_METODO_PAGO', payload);
  }

  // Notificar aprobación de pago con tarjeta desde el celular
  notificarPagoTarjeta(datos) {
    const payload = { ...datos, timestamp: Date.now() };
    if (typeof window !== 'undefined') {
      localStorage.setItem('novasalud_ultimo_pago_tarjeta', JSON.stringify(payload));
    }
    if (this.channel) {
      this.channel.postMessage({ tipo: 'PAGO_TARJETA_APROBADO', payload });
    }
    this.emitirAlServidor('PAGO_TARJETA_APROBADO', payload);
  }

  // Notificar que un producto fue escaneado desde el celular o lector óptico
  notificarProductoEscaneado(codigo) {
    const payload = {
      codigo: String(codigo).trim(),
      timestamp: Date.now()
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('novasalud_ultimo_escaneo', JSON.stringify(payload));
    }

    if (this.channel) {
      this.channel.postMessage({ tipo: 'PRODUCTO_ESCANEADO', payload });
    }

    this.emitirAlServidor('PRODUCTO_ESCANEADO', payload);
  }

  async emitirAlServidor(tipo, payload) {
    try {
      await fetch(`${getApiBaseUrl()}/dispositivos/evento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, payload })
      });
    } catch (e) {
      // Sin bloqueo ante micro-desconexiones
    }
  }

  // Obtener el estado actual guardado
  obtenerEstadoActual() {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  // Suscribirse a cambios desde cualquier ventana o dispositivo conectado
  suscribir(callback) {
    if (typeof window === 'undefined' || !callback) return () => {};

    this.subscriptores.add(callback);

    // Escuchar por BroadcastChannel
    const handleChannelMessage = (event) => {
      if (event.data) {
        callback(event.data);
      }
    };

    if (this.channel) {
      this.channel.addEventListener('message', handleChannelMessage);
    }

    // Escuchar por evento 'storage'
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          callback({ tipo: 'ACTUALIZAR_ESTADO', payload: JSON.parse(event.newValue) });
        } catch (e) {}
      } else if (event.key === 'novasalud_ultimo_pago_movil' && event.newValue) {
        try {
          callback({ tipo: 'PAGO_MOVIL_CONFIRMADO', payload: JSON.parse(event.newValue) });
        } catch (e) {}
      } else if (event.key === 'novasalud_ultimo_escaneo' && event.newValue) {
        try {
          callback({ tipo: 'PRODUCTO_ESCANEADO', payload: JSON.parse(event.newValue) });
        } catch (e) {}
      } else if (event.key === 'novasalud_cambio_metodo' && event.newValue) {
        try {
          callback({ tipo: 'CAMBIAR_METODO_PAGO', payload: JSON.parse(event.newValue) });
        } catch (e) {}
      } else if (event.key === 'novasalud_ultimo_pago_tarjeta' && event.newValue) {
        try {
          callback({ tipo: 'PAGO_TARJETA_APROBADO', payload: JSON.parse(event.newValue) });
        } catch (e) {}
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      this.subscriptores.delete(callback);
      if (this.channel) {
        this.channel.removeEventListener('message', handleChannelMessage);
      }
      window.removeEventListener('storage', handleStorage);
    };
  }
}

export const posDisplay = new PosDisplayManager();
