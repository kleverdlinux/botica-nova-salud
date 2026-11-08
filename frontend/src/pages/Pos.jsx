import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  XCircle,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  Loader2,
  PackageCheck,
  ReceiptText,
  User,
  FileText,
  ScanLine,
  Send,
  CheckCircle,
  Eye,
  EyeOff,
  Check,
  Building2,
  ShieldCheck,
  Sparkles,
  Usb,
  QrCode,
  Copy,
  X,
  RefreshCw
} from 'lucide-react';
import { buscarProductosPOSApi, consultarDocumentoApi } from '../api/productosApi.js';
import { registrarVentaApi } from '../api/ventasApi.js';
import { useCarrito } from '../context/CarritoContext.jsx';
import {
  formatearMoneda,
  formatearFechaLima,
  esProductoVencido,
  estaPorVencer
} from '../utils/formateadores.js';
import ModalTicket from '../components/ModalTicket.jsx';
import ModalVincularDispositivo from '../components/ModalVincularDispositivo.jsx';
import { reproducirPipScanner } from '../utils/sonidoScanner.js';
import toast, { notificarExito, notificarError } from '../utils/alertaSweet.js';
import { posDisplay } from '../utils/posDisplayChannel.js';

export default function Pos() {
  const navigate = useNavigate();
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [haBuscado, setHaBuscado] = useState(false);

  // Referencia para evitar consultas duplicadas de DNI / RUC
  const ultimoDocConsultadoRef = useRef('');

  // Detección de dispositivo móvil / tablet
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      const isSmall = window.innerWidth <= 1024;
      setIsMobileOrTablet(isSmall || isTouch);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Modal de Dispositivo
  const [modalVincularAbierto, setModalVincularAbierto] = useState(false);

  // Tipo de comprobante SUNAT (Boleta vs Factura)
  const [tipoComprobante, setTipoComprobante] = useState('BOLETA'); // 'BOLETA' | 'FACTURA'
  const [consultandoDoc, setConsultandoDoc] = useState(false);
  const [docVerificadoInfo, setDocVerificadoInfo] = useState(null);

  // Datos del cobro
  const [metodoPago, setMetodoPago] = useState('EFECTIVO'); // 'EFECTIVO' | 'YAPE_PLIN' | 'TARJETA'
  const [grupoMetodo, setGrupoMetodo] = useState('EFECTIVO'); // 'EFECTIVO' | 'OTROS'
  const [subMetodoOtros, setSubMetodoOtros] = useState('YAPE_PLIN'); // 'YAPE_PLIN' | 'TARJETA'
  const [clienteDoc, setClienteDoc] = useState('');
  const [clienteNom, setClienteNom] = useState('');
  const [cobrando, setCobrando] = useState(false);
  const handleCobrarRef = useRef(null);

  // Cobro interactivo con tarjeta
  const [tarjetaNumero, setTarjetaNumero] = useState('');
  const [tarjetaVence, setTarjetaVence] = useState('');
  const [tarjetaCvv, setTarjetaCvv] = useState('');
  const [tarjetaTitular, setTarjetaTitular] = useState('');

  // Cobro en Efectivo (cálculo de vuelto)
  const [montoRecibido, setMontoRecibido] = useState('');

  // Cobro Yape / Plin
  const [modalYapeAbierto, setModalYapeAbierto] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [mostrarQrEnCajero, setMostrarQrEnCajero] = useState(false);
  const [numeroOperacionYape, setNumeroOperacionYape] = useState('');
  const [yapeEnviadoADispositivo, setYapeEnviadoADispositivo] = useState(false);

  // Cobro con Tarjeta
  const [modalTarjetaAbierto, setModalTarjetaAbierto] = useState(false);
  const [tarjetaEnviadaADispositivo, setTarjetaEnviadaADispositivo] = useState(false);
  const [voucherTarjeta, setVoucherTarjeta] = useState('');
  const [marcaTarjeta, setMarcaTarjeta] = useState('VISA');

  // Modal del ticket térmico
  const [ventaCompletada, setVentaCompletada] = useState(null);
  const [dispositivosConectados, setDispositivosConectados] = useState(0);
  const [dispositivoUsbConectado, setDispositivoUsbConectado] = useState(false);
  const [nombreDispositivoUsb, setNombreDispositivoUsb] = useState('');

  const {
    items,
    agregarProducto,
    actualizarCantidad,
    eliminarProducto,
    limpiarCarrito,
    totalCalculadoUI,
    cantidadTotalUI
  } = useCarrito();

  const debounceTimeout = useRef(null);
  const ticketIdActual = useRef(`TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const inputBusquedaRef = useRef(null);

  // Búsqueda con debounce exacto de 250 ms (permanece vacío si no se escribe nada)
  useEffect(() => {
    if (!termino.trim()) {
      setResultados([]);
      setHaBuscado(false);
      setBuscando(false);
      return;
    }

    setBuscando(true);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      try {
        const prods = await buscarProductosPOSApi(termino);
        setResultados(prods);
        setHaBuscado(true);
      } catch (err) {
        console.error('Error al buscar productos para el POS:', err);
      } finally {
        setBuscando(false);
      }
    }, 250);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [termino]);

  // Listener para evento global de actualización
  useEffect(() => {
    const handleReload = async () => {
      if (termino.trim()) {
        try {
          setBuscando(true);
          const prods = await buscarProductosPOSApi(termino.trim());
          setResultados(prods);
        } catch (e) {
        } finally {
          setBuscando(false);
        }
      }
    };
    window.addEventListener('app-reload-data', handleReload);
    return () => window.removeEventListener('app-reload-data', handleReload);
  }, [termino]);

  // Manejo de Pistola de Código de Barras (Escáner físico USB/Bluetooth presiona Enter al escanear)
  const handleKeyDownBusqueda = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = termino.trim();
      if (!code) return;
      await procesarCodigoEscaneado(code);
      setTermino('');
    }
  };

  // Procesar código de barras escaneado (cámara, pistola o dispositivo móvil conectado)
  const procesarCodigoEscaneado = async (codigo) => {
    if (!codigo) return;
    try {
      const prods = await buscarProductosPOSApi(codigo);
      if (prods && prods.length > 0) {
        // Encontrar coincidencia exacta por código de barras o tomar el primero
        const encontrado = prods.find((p) => p.codigoBarras === codigo) || prods[0];
        
        // Sonido PIP auténtico tipo Plaza Vea
        reproducirPipScanner();
        agregarProducto(encontrado);
        toast.success(`Escaneado: ${encontrado.nombre} (+1 al ticket)`);
      } else {
        toast.error(`Código de barras "${codigo}" no encontrado en catálogo.`);
      }
    } catch (err) {
      console.error('Error al procesar código escaneado:', err);
    }
  };

  // Escuchar escaneos y pagos transmitidos desde dispositivos conectados (móvil o visor)
  useEffect(() => {
    const unsuscribe = posDisplay.suscribir((mensaje) => {
      if (mensaje.tipo === 'PRODUCTO_ESCANEADO') {
        procesarCodigoEscaneado(mensaje.payload.codigo);
      } else if (mensaje.tipo === 'PAGO_MOVIL_CONFIRMADO') {
        const { numeroOperacion, monto } = mensaje.payload;
        setMetodoPago('YAPE_PLIN');
        setNumeroOperacionYape(numeroOperacion);
        toast.success(`Pago Yape recibido: S/ ${monto} (Op: ${numeroOperacion})`);
        handleCobrarRef.current?.(null, 'YAPE_PLIN', numeroOperacion);
      } else if (mensaje.tipo === 'PAGO_TARJETA_APROBADO') {
        const { voucher, monto } = mensaje.payload;
        const vchFinal = voucher || 'VCH-APROBADO';
        setMetodoPago('TARJETA');
        setVoucherTarjeta(vchFinal);
        toast.success(`Cobro con Tarjeta aprobado: S/ ${monto || totalCalculadoUI}`);
        handleCobrarRef.current?.(null, 'TARJETA', vchFinal);
      } else if (mensaje.tipo === 'CAMBIAR_METODO_PAGO') {
        const metodo = mensaje.payload.metodoPago;
        setMetodoPago(metodo);
      } else if (mensaje.tipo === 'DISPOSITIVOS_ACTUALIZADOS') {
        setDispositivosConectados(mensaje.payload.totalConectados || 0);
      }
    });
    return () => unsuscribe();
  }, [items, totalCalculadoUI]);

  // Sondeo continuo de respaldo para pagos de Tarjeta y Yape (Garantía ante micro-desconexiones en Render / Wi-Fi)
  useEffect(() => {
    let activo = true;
    const intervalId = setInterval(async () => {
      if (!activo || items.length === 0) return;
      try {
        const pago = await posDisplay.consultarPagoPendiente();
        if (pago && pago.payload && activo) {
          await posDisplay.marcarPagoProcesado(pago.id);
          if (pago.tipo === 'PAGO_TARJETA_APROBADO') {
            const vch = pago.payload.voucher || 'VCH-APROBADO';
            setMetodoPago('TARJETA');
            setVoucherTarjeta(vch);
            toast.success(`Cobro con Tarjeta aprobado desde terminal: S/ ${pago.payload.monto || totalCalculadoUI}`);
            handleCobrarRef.current?.(null, 'TARJETA', vch);
          } else if (pago.tipo === 'PAGO_MOVIL_CONFIRMADO') {
            const op = pago.payload.numeroOperacion || 'OP-CONFIRMADA';
            setMetodoPago('YAPE_PLIN');
            setNumeroOperacionYape(op);
            toast.success(`Pago Yape confirmado desde terminal: S/ ${pago.payload.monto || totalCalculadoUI}`);
            handleCobrarRef.current?.(null, 'YAPE_PLIN', op);
          }
        }
      } catch (e) {}
    }, 1500);

    return () => {
      activo = false;
      clearInterval(intervalId);
    };
  }, [items, totalCalculadoUI]);

  // Sincronización en tiempo real con la Pantalla de Cliente / Visor Externo
  useEffect(() => {
    if (items.length === 0) {
      posDisplay.enviarEstado({
        modo: 'REPOSO',
        items: [],
        total: 0,
        ticketId: ticketIdActual.current
      });
      setYapeEnviadoADispositivo(false);
      setTarjetaEnviadaADispositivo(false);
    } else {
      let modo = 'CARRITO';
      if (metodoPago === 'YAPE_PLIN') modo = 'YAPE_PLIN';
      if (metodoPago === 'TARJETA') modo = 'TARJETA';

      posDisplay.enviarEstado({
        modo,
        items: items.map((i) => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })),
        total: totalCalculadoUI,
        ticketId: ticketIdActual.current,
        clienteNom: clienteNom || (tipoComprobante === 'FACTURA' ? 'Empresa' : 'Cliente General')
      });
    }
  }, [items, totalCalculadoUI, metodoPago, yapeEnviadoADispositivo, tarjetaEnviadaADispositivo, clienteNom, tipoComprobante]);

  // Generar código QR dinámico de Yape / Plin accesible desde el celular por Wi-Fi o Producción
  useEffect(() => {
    if (totalCalculadoUI > 0) {
      const host = posDisplay.obtenerHostMovil();
      const esLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const baseOrigin = typeof window !== 'undefined' && !esLocal && !window.location.hostname.startsWith('192.168.')
        ? window.location.origin
        : `http://${host}:5173`;
      const urlPagoMovil = `${baseOrigin}/pago-movil?monto=${totalCalculadoUI.toFixed(2)}&ticket=${encodeURIComponent(ticketIdActual.current)}&comercio=${encodeURIComponent('Botica Nova Salud')}`;

      QRCode.toDataURL(urlPagoMovil, {
        width: 260,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
        errorCorrectionLevel: 'M'
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Error generando QR:', err));
    }
  }, [totalCalculadoUI]);

  // Consulta automática de DNI / RUC con API gratuita y protección contra alertas duplicadas
  const handleConsultarDocumento = async (docValor) => {
    const doc = String(docValor !== undefined ? docValor : clienteDoc).trim().replace(/\D/g, '');

    if (tipoComprobante === 'BOLETA' && doc.length !== 8) {
      return;
    }
    if (tipoComprobante === 'FACTURA' && doc.length !== 11) {
      return;
    }

    if (ultimoDocConsultadoRef.current === doc || consultandoDoc) {
      return;
    }

    ultimoDocConsultadoRef.current = doc;
    setConsultandoDoc(true);
    try {
      const data = await consultarDocumentoApi(doc);
      if (data && data.nombre) {
        setClienteNom(data.nombre);
        setDocVerificadoInfo(data);
        toast.success(`${data.tipo === 'DNI' ? 'RENIEC' : 'SUNAT'}: ${data.nombre}`);
      }
    } catch (err) {
      console.warn('No se pudo autollenar documento:', err);
    } finally {
      setConsultandoDoc(false);
    }
  };

  // Vinculación de dispositivo conectado por USB a la PC o Laptop
  const handleVincularDispositivoUsb = () => {
    setModalVincularAbierto(true);
  };

  // Carga inicial del estado del dispositivo USB (desconectado por defecto hasta vincular uno real)
  useEffect(() => {
    setNombreDispositivoUsb('');
    setDispositivoUsbConectado(false);
  }, []);

  // Intercepción global de pistola de código de barras USB (rápida cadencia de teclas + Enter)
  useEffect(() => {
    let buffer = '';
    let lastTime = 0;

    const handleWindowKeyDown = (e) => {
      const esInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      const now = Date.now();
      const diff = now - lastTime;
      lastTime = now;

      if (e.key === 'Enter') {
        if (buffer.length >= 3 && diff < 120) {
          e.preventDefault();
          procesarCodigoEscaneado(buffer.trim());
          buffer = '';
        } else if (!esInput) {
          buffer = '';
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (diff < 65 || buffer.length === 0) {
          buffer += e.key;
        } else {
          buffer = e.key;
        }
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, []);

  // Enviar Yape al visor del cliente
  const handleEnviarYapeADispositivo = () => {
    if (items.length === 0) {
      toast.error('Agregue productos antes de enviar el cobro.');
      return;
    }
    setYapeEnviadoADispositivo(true);
    posDisplay.enviarEstado({
      modo: 'YAPE_PLIN',
      items: items.map((i) => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })),
      total: totalCalculadoUI,
      ticketId: ticketIdActual.current,
      clienteNom
    });
    toast.success('Código QR proyectado en la pantalla del cliente.');
  };

  // Enviar Tarjeta al visor del cliente
  const handleEnviarTarjetaADispositivo = () => {
    if (items.length === 0) {
      toast.error('Agregue productos antes de enviar el cobro.');
      return;
    }
    setTarjetaEnviadaADispositivo(true);
    posDisplay.enviarEstado({
      modo: 'TARJETA',
      items: items.map((i) => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })),
      total: totalCalculadoUI,
      ticketId: ticketIdActual.current,
      clienteNom
    });
    toast.success('Monto y terminal enviados a la pantalla del cliente.');
  };

  // Simulación rápida de Yape
  const simularPagoYape = () => {
    const op = String(Math.floor(100000 + Math.random() * 900000));
    setNumeroOperacionYape(op);
    toast.success(`Yape simulado con éxito. Op: ${op}`);
  };

  // Cobro seguro con descuento atómico de stock en PostgreSQL y Kardex
  const handleCobrar = async (e, metodoSobrescrito, referenciaSobrescrita) => {
    if (e && e.preventDefault) e.preventDefault();

    if (items.length === 0) {
      toast.error('El carrito está vacío. Agregue medicamentos antes de cobrar.');
      return;
    }

    if (tipoComprobante === 'FACTURA' && (!clienteDoc || clienteDoc.length !== 11)) {
      toast.error('Para emitir Factura es obligatorio ingresar un RUC válido de 11 dígitos.');
      return;
    }

    const metodoFinal = metodoSobrescrito || metodoPago;
    if (referenciaSobrescrita) {
      if (metodoFinal === 'TARJETA') setVoucherTarjeta(referenciaSobrescrita);
      if (metodoFinal === 'YAPE_PLIN') setNumeroOperacionYape(referenciaSobrescrita);
    }

    setCobrando(true);
    try {
      const nombreFinal = clienteNom ? clienteNom.trim() : (tipoComprobante === 'FACTURA' ? 'Empresa Cliente' : 'Cliente General');

      const res = await registrarVentaApi({
        items: items.map((i) => ({
          productoId: i.productoId,
          cantidad: i.cantidad
        })),
        metodoPago: metodoFinal,
        clienteDoc: clienteDoc ? clienteDoc.trim() : null,
        clienteNom: nombreFinal
      });

      toast.success(res.mensaje || '¡Venta registrada exitosamente!');

      posDisplay.enviarEstado({
        modo: 'EXITO',
        total: totalCalculadoUI,
        ticketId: ticketIdActual.current
      });

      setVentaCompletada(res.venta);
      limpiarCarrito();
      setClienteDoc('');
      setClienteNom('');
      setMontoRecibido('');
      setNumeroOperacionYape('');
      setVoucherTarjeta('');
      setDocVerificadoInfo(null);
      setModalTarjetaAbierto(false);
      setModalYapeAbierto(false);
      setYapeEnviadoADispositivo(false);
      setTarjetaEnviadaADispositivo(false);
      ultimoDocConsultadoRef.current = '';
      ticketIdActual.current = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      setTimeout(() => {
        posDisplay.enviarEstado({ modo: 'REPOSO', items: [], total: 0 });
      }, 4000);
    } catch (err) {
      const errorServidor = err.response?.data?.error || 'No se pudo procesar la venta. Verifique los datos.';
      toast.error(errorServidor, { duration: 6000 });
    } finally {
      setCobrando(false);
    }
  };

  handleCobrarRef.current = handleCobrar;

  const recibidoNum = parseFloat(montoRecibido) || 0;
  const vuelto = recibidoNum > totalCalculadoUI ? recibidoNum - totalCalculadoUI : 0;
  const subtotalNeto = totalCalculadoUI / 1.18;
  const igvCalculado = totalCalculadoUI - subtotalNeto;

  return (
    <div className="w-full space-y-4 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PANEL IZQUIERDO: BÚSQUEDA Y CATÁLOGO (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Barra de Búsqueda con Botón de Escáner y Vinculación Discreta */}
          <div className="bg-white dark:bg-black p-3 sm:p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  {buscando ? (
                    <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </div>
                <input
                  ref={inputBusquedaRef}
                  type="text"
                  value={termino}
                  onChange={(e) => setTermino(e.target.value)}
                  onKeyDown={handleKeyDownBusqueda}
                  placeholder="Escanee código de barras con pistola o escriba medicamento..."
                  className="w-full pl-11 pr-20 py-2.5 sm:py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-black transition"
                  autoFocus
                />
                {termino && (
                  <button
                    onClick={() => setTermino('')}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Botón Compacto de Dispositivo / Escáner */}
              <button
                type="button"
                onClick={handleVincularDispositivoUsb}
                className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer shrink-0 ${
                  dispositivoUsbConectado
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                title="Vincular lector de código de barras o terminal móvil"
              >
                <Usb className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="hidden sm:inline">
                  {dispositivoUsbConectado ? nombreDispositivoUsb || 'Conectado' : 'Vincular'}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    dispositivoUsbConectado ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
                  }`}
                />
              </button>

              {/* Botón Actualizar POS */}
              <button
                type="button"
                onClick={async () => {
                  if (termino.trim()) {
                    setBuscando(true);
                    try {
                      const prods = await buscarProductosPOSApi(termino.trim());
                      setResultados(prods);
                    } catch (e) {
                    } finally {
                      setBuscando(false);
                    }
                  }
                  toast.success('Terminal POS sincronizado');
                }}
                className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold transition cursor-pointer shrink-0"
                title="Actualizar catálogo y sincronizar mostrador"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-teal-600 dark:text-teal-400 ${buscando ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
          </div>

          {/* Listado del Catálogo (Permanece VACÍO hasta que el cajero busque o escanee) */}
          <div className="bg-white dark:bg-black rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden min-h-[380px] flex flex-col justify-center">
            {!termino.trim() && resultados.length === 0 ? (
              // ESTADO VACÍO ELEGANTE (Limpio para que el cajero no se confunda)
              <div className="p-10 text-center text-neutral-400 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                  <ScanLine className="w-8 h-8 stroke-[1.5] text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-neutral-900 dark:text-white">
                    Mostrador Listo para Escanear o Buscar
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    Escanee el código de barras con la pistola óptica, use el botón de escáner en dispositivo o escriba el nombre del fármaco.
                  </p>
                </div>
              </div>
            ) : (
              // RESULTADOS DE BÚSQUEDA O ESCANEO
              <div className="h-full flex flex-col">
                <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/50">
                  <h2 className="text-xs font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    Medicamentos Encontrados
                  </h2>
                  <span className="text-xs font-mono font-bold text-neutral-500">
                    {resultados.length} resultado(s)
                  </span>
                </div>

                <div className="p-3 divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[58vh] overflow-y-auto space-y-1">
                  {buscando && (
                    <div className="space-y-2 p-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={`skel-pos-${i}`} className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 animate-pulse bg-neutral-50/50 dark:bg-neutral-900/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                            <div className="space-y-1.5">
                              <div className="h-3.5 w-36 bg-neutral-200 dark:bg-neutral-800 rounded" />
                              <div className="h-2.5 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
                            </div>
                          </div>
                          <div className="h-7 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
                        </div>
                      ))}
                    </div>
                  )}

                  {!buscando && resultados.length === 0 && haBuscado && (
                    <div className="py-14 text-center text-neutral-400 space-y-2">
                      <XCircle className="w-12 h-12 mx-auto stroke-1 text-neutral-300 dark:text-neutral-700" />
                      <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                        No se encontraron medicamentos para "{termino}"
                      </p>
                    </div>
                  )}

                  {!buscando && resultados.map((prod) => {
                    const stock = Number(prod.stock);
                    const precio = Number(prod.precio);
                    const vencido = esProductoVencido(prod.fechaVencimiento);
                    const porVencer = !vencido && estaPorVencer(prod.fechaVencimiento);
                    const agotado = stock <= 0;
                    const deshabilitado = vencido || agotado;

                    return (
                      <div
                        key={prod.id}
                        className="py-3 px-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900/50 flex items-center justify-between gap-3.5 transition"
                      >
                        {/* Imagen del Fármaco */}
                        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center p-1">
                          {prod.imagen ? (
                            <img
                              src={prod.imagen}
                              alt={prod.nombre}
                              className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                              loading="lazy"
                            />
                          ) : (
                            <PackageCheck className="w-6 h-6 text-neutral-400" />
                          )}
                        </div>

                        {/* Datos del Fármaco */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-black text-neutral-900 dark:text-white truncate">
                              {prod.nombre}
                            </h3>
                            {vencido && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                                Vencido
                              </span>
                            )}
                            {!vencido && agotado && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                Agotado
                              </span>
                            )}
                            {porVencer && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                Por Vencer
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                            <span>{prod.presentacion}</span>
                            {prod.principioActivo && (
                              <span>• P.A: <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">{prod.principioActivo}</strong></span>
                            )}
                          </div>

                          <div className="mt-1 flex items-center space-x-3 text-xs">
                            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                              {formatearMoneda(precio)}
                            </span>
                            <span
                              className={`font-mono font-bold ${
                                stock > 5
                                  ? 'text-teal-600 dark:text-teal-400'
                                  : stock > 0
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              Stock: {stock} u.
                            </span>
                          </div>
                        </div>

                        {/* Botón Agregar al Carrito */}
                        <button
                          type="button"
                          disabled={deshabilitado}
                          onClick={() => {
                            reproducirPipScanner();
                            agregarProducto(prod);
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition shrink-0 cursor-pointer ${
                            deshabilitado
                              ? 'bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600 cursor-not-allowed'
                              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs active:scale-95'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{vencido ? 'Vencido' : agotado ? 'Sin Stock' : 'Agregar'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: TICKET EN PROCESO & COBRO SUNAT (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-black rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden flex flex-col">
            {/* Cabecera del Ticket */}
            <div className="px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/50">
              <div className="flex items-center space-x-2">
                <ReceiptText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h2 className="text-xs font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                  Ticket en Proceso
                </h2>
                <span className="text-[11px] font-mono text-neutral-400">
                  ({cantidadTotalUI} u.)
                </span>
              </div>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={limpiarCarrito}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                >
                  Vaciar
                </button>
              )}
            </div>

            {/* Listado de Ítems en el Ticket */}
            <div className="p-4 divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[30vh] overflow-y-auto space-y-1">
              {items.length === 0 ? (
                <div className="py-10 text-center text-neutral-400 space-y-1.5">
                  <ReceiptText className="w-10 h-10 mx-auto stroke-1 text-neutral-300 dark:text-neutral-700" />
                  <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                    No hay medicamentos en la cuenta
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Escanee con la pistola o escriba para iniciar la venta.
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  const subtotalItem = item.precio * item.cantidad;
                  return (
                    <div
                      key={item.productoId}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-neutral-900 dark:text-white truncate">
                          {item.nombre}
                        </p>
                        <p className="text-[11px] font-mono text-neutral-500">
                          {formatearMoneda(item.precio)} c/u
                        </p>
                        <p className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Subtotal: {formatearMoneda(subtotalItem)}
                        </p>
                      </div>

                      {/* Steppers de Cantidad */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                          className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-xs transition cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono font-black text-xs text-neutral-900 dark:text-white">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          disabled={item.cantidad >= item.stock}
                          onClick={() => {
                            reproducirPipScanner();
                            actualizarCantidad(item.productoId, item.cantidad + 1);
                          }}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition cursor-pointer ${
                            item.cantidad >= item.stock
                              ? 'bg-neutral-100 text-neutral-300 dark:bg-neutral-900 dark:text-neutral-700 cursor-not-allowed'
                              : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarProducto(item.productoId)}
                          className="w-7 h-7 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-center transition ml-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* SECCIÓN DE COBRO Y EMISIÓN SUNAT */}
            <form onSubmit={handleCobrar} className="p-4 bg-neutral-50/70 dark:bg-neutral-950/70 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
              {/* SELECTOR DE COMPROBANTE SUNAT (BOLETA VS FACTURA) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    Tipo de Comprobante
                  </label>
                  <span className="text-[10px] text-neutral-500 font-medium">SUNAT SEE-OSE</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTipoComprobante('BOLETA');
                      setClienteDoc('');
                      setClienteNom('');
                      setDocVerificadoInfo(null);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer border flex items-center justify-center space-x-1.5 ${
                      tipoComprobante === 'BOLETA'
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Boleta de Venta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTipoComprobante('FACTURA');
                      setClienteDoc('');
                      setClienteNom('');
                      setDocVerificadoInfo(null);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer border flex items-center justify-center space-x-1.5 ${
                      tipoComprobante === 'FACTURA'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Factura (RUC)</span>
                  </button>
                </div>
              </div>

              {/* DATOS DEL CLIENTE CON AUTOCOMPLETADO DE DNI / RUC */}
              <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase">
                    {tipoComprobante === 'BOLETA' ? 'DNI del Cliente (8 dígitos)' : 'RUC de Empresa (11 dígitos)'}
                  </label>
                  {docVerificadoInfo && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{docVerificadoInfo.tipo === 'DNI' ? 'Verificado RENIEC' : 'SUNAT Activo'}</span>
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      maxLength={tipoComprobante === 'BOLETA' ? 8 : 11}
                      value={clienteDoc}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setClienteDoc(val);
                        if (!val) {
                          ultimoDocConsultadoRef.current = '';
                          setClienteNom('');
                          setDocVerificadoInfo(null);
                        } else if (val !== ultimoDocConsultadoRef.current) {
                          setDocVerificadoInfo(null);
                        }
                        // Autoconsultar al completar 8 dígitos (DNI) o 11 dígitos (RUC)
                        if (tipoComprobante === 'BOLETA' && val.length === 8) {
                          handleConsultarDocumento(val);
                        } else if (tipoComprobante === 'FACTURA' && val.length === 11) {
                          handleConsultarDocumento(val);
                        }
                      }}
                      onBlur={() => {
                        if (clienteDoc && clienteDoc !== ultimoDocConsultadoRef.current) {
                          handleConsultarDocumento(clienteDoc);
                        }
                      }}
                      placeholder={tipoComprobante === 'BOLETA' ? '8 dígitos (vacío = Consumidor Final)' : '11 dígitos RUC'}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-mono font-bold text-neutral-900 dark:text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                    {consultandoDoc && (
                      <Loader2 className="w-4 h-4 animate-spin text-teal-600 absolute right-2.5 top-2.5" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleConsultarDocumento()}
                    disabled={consultandoDoc || !clienteDoc}
                    className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-40"
                    title="Consultar nombre en RENIEC / SUNAT"
                  >
                    Buscar
                  </button>
                </div>

                {/* Nombre o Razón Social autollenado */}
                <div>
                  <input
                    type="text"
                    value={clienteNom}
                    onChange={(e) => setClienteNom(e.target.value)}
                    placeholder={tipoComprobante === 'BOLETA' ? 'Nombre del cliente o Cliente General' : 'Razón Social de la empresa'}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-bold text-neutral-900 dark:text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    {tipoComprobante === 'BOLETA'
                      ? 'Opcional si el cliente no desea DNI (Boleta simple / Menor a S/ 700)'
                      : 'Obligatorio según ficha RUC de SUNAT'}
                  </p>
                </div>
              </div>

              {/* Selector de Método de Pago: Efectivo vs Otros Métodos (PC y Móvil) */}
              <div>
                <label className="block text-[11px] font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Método de Pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* 1. Efectivo */}
                  <button
                    type="button"
                    onClick={() => {
                      setGrupoMetodo('EFECTIVO');
                      setMetodoPago('EFECTIVO');
                      setYapeEnviadoADispositivo(false);
                      setTarjetaEnviadaADispositivo(false);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-2 border transition cursor-pointer ${
                      grupoMetodo === 'EFECTIVO'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/30'
                        : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Efectivo</span>
                  </button>

                  {/* 2. Otros Métodos (Yape / Tarjeta) */}
                  <button
                    type="button"
                    onClick={() => {
                      setGrupoMetodo('OTROS');
                      setMetodoPago(subMetodoOtros);
                      const esMovil =
                        typeof window !== 'undefined' &&
                        (window.innerWidth < 768 ||
                          ('ontouchstart' in window && window.innerWidth < 1024));
                      // Si está en PC y no hay terminal conectada, sugerir modal QR de vinculación
                      if (!esMovil && dispositivosConectados === 0) {
                        setModalQrAbierto(true);
                      }
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-2 border transition cursor-pointer ${
                      grupoMetodo === 'OTROS'
                        ? 'bg-[#732282] text-white border-[#732282] shadow-sm ring-2 ring-purple-500/30'
                        : 'bg-white dark:bg-neutral-900 text-[#732282] dark:text-purple-300 border-purple-200 dark:border-purple-900/60 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Otros Métodos (Yape / Tarjeta)</span>
                  </button>
                </div>
              </div>

              {/* DETALLES DINÁMICOS SEGÚN MÉTODO DE PAGO */}

              {/* 1. MODO EFECTIVO CON VUELTO */}
              {grupoMetodo === 'EFECTIVO' && (
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-600 dark:text-neutral-400">Billetes:</span>
                    <div className="flex space-x-1">
                      {[10, 20, 50, 100].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setMontoRecibido(String(b))}
                          className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 font-mono font-bold text-[10px] text-neutral-700 dark:text-neutral-300 cursor-pointer"
                        >
                          S/{b}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setMontoRecibido(String(totalCalculadoUI.toFixed(2)))}
                        className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 font-mono font-bold text-[10px] cursor-pointer"
                      >
                        Exacto
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                        Monto Recibido:
                      </label>
                      <input
                        type="number"
                        step="0.10"
                        value={montoRecibido}
                        onChange={(e) => setMontoRecibido(e.target.value)}
                        placeholder="S/ 0.00"
                        className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm font-mono font-bold text-neutral-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                        Vuelto a Entregar:
                      </label>
                      <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {formatearMoneda(vuelto)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. MODO OTROS MÉTODOS (YAPE / TARJETA) */}
              {grupoMetodo === 'OTROS' && (
                <div className="space-y-3">
                  {/* Sub-selector: Yape/Plin vs Tarjeta */}
                  <div className="p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl grid grid-cols-2 gap-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setSubMetodoOtros('YAPE_PLIN');
                        setMetodoPago('YAPE_PLIN');
                        setTarjetaEnviadaADispositivo(false);
                      }}
                      className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        subMetodoOtros === 'YAPE_PLIN'
                          ? 'bg-[#732282] text-white shadow-xs'
                          : 'text-neutral-600 dark:text-neutral-300 hover:bg-white/60 dark:hover:bg-neutral-700/60'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Yape / Plin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSubMetodoOtros('TARJETA');
                        setMetodoPago('TARJETA');
                        setYapeEnviadoADispositivo(false);
                      }}
                      className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        subMetodoOtros === 'TARJETA'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-neutral-600 dark:text-neutral-300 hover:bg-white/60 dark:hover:bg-neutral-700/60'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Tarjeta</span>
                    </button>
                  </div>

                  {/* En PC: Si no está vinculado con terminal móvil, mostrar aviso para vincular QR */}
                  {typeof window !== 'undefined' && window.innerWidth >= 768 && (
                    <div className="p-2.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200/80 dark:border-purple-800/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Smartphone className="w-4 h-4 text-purple-700 shrink-0" />
                        <span className="text-[11px] text-purple-900 dark:text-purple-200 truncate">
                          {dispositivosConectados > 0
                            ? 'Terminal móvil conectada en mostrador'
                            : 'Vincule su celular para cobrar sin voltear la pantalla'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModalQrAbierto(true)}
                        className="px-2 py-1 bg-[#732282] hover:bg-[#5b1968] text-white text-[10px] font-bold rounded-lg transition cursor-pointer shrink-0"
                      >
                        {dispositivosConectados > 0 ? 'Ver QR' : 'Vincular'}
                      </button>
                    </div>
                  )}

                  {/* Subvista: Yape / Plin */}
                  {subMetodoOtros === 'YAPE_PLIN' && (
                    <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-purple-200 dark:border-purple-900/60 space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#732282] dark:text-purple-300 flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#732282] animate-ping" />
                          <span>Cobro Yape / Plin</span>
                        </span>
                        <span className="text-xs font-mono font-black text-neutral-900 dark:text-white">
                          {formatearMoneda(totalCalculadoUI)}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-purple-700 dark:text-purple-300 font-bold uppercase">
                          N° Operación Yape / Plin:
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            maxLength={8}
                            value={numeroOperacionYape}
                            onChange={(e) => setNumeroOperacionYape(e.target.value.replace(/\D/g, ''))}
                            placeholder="Ej. 849201"
                            className="flex-1 px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-mono font-bold text-neutral-900 dark:text-white focus:ring-1 focus:ring-[#732282] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={simularPagoYape}
                            className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-[10px] font-bold text-neutral-700 dark:text-neutral-300 rounded-lg transition cursor-pointer"
                            title="Generar código de operación para prueba"
                          >
                            Generar Op.
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalYapeAbierto(true)}
                            className="px-2.5 py-1 bg-[#732282] hover:bg-[#5b1968] text-white text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Ver QR y datos completos"
                          >
                            <QrCode className="w-3 h-3" />
                            <span>Ver QR</span>
                          </button>
                        </div>
                      </div>

                      {/* Botón directo de aprobación Yape */}
                      <button
                        type="button"
                        onClick={(e) => {
                          const opFinal = numeroOperacionYape || String(Math.floor(100000 + Math.random() * 900000));
                          setNumeroOperacionYape(opFinal);
                          handleCobrar(e, 'YAPE_PLIN', opFinal);
                        }}
                        disabled={cobrando || items.length === 0}
                        className="w-full py-2.5 px-3 bg-[#732282] hover:bg-[#5b1968] text-white rounded-xl text-xs font-black shadow-md shadow-purple-700/20 flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Aprobar Cobro Yape (Completar Venta)</span>
                      </button>
                    </div>
                  )}

                  {/* Subvista: Tarjeta Interactiva */}
                  {subMetodoOtros === 'TARJETA' && (
                    <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-blue-200 dark:border-blue-900/60 space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center space-x-1.5">
                          <CreditCard className="w-4 h-4" />
                          <span>Cobro con Tarjeta ({marcaTarjeta})</span>
                        </span>
                        <span className="text-xs font-mono font-black text-neutral-900 dark:text-white">
                          {formatearMoneda(totalCalculadoUI)}
                        </span>
                      </div>

                      {/* Tarjeta Visual Interactiva */}
                      <div className="bg-gradient-to-tr from-zinc-900 via-slate-800 to-zinc-950 text-white rounded-xl p-3 shadow-sm border border-zinc-700 space-y-2 font-mono">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="tracking-widest text-zinc-400 font-sans font-bold">Nova Salud Pay</span>
                          <span className="font-black text-teal-400">{tarjetaNumero.startsWith('4') ? 'VISA' : 'MASTERCARD'}</span>
                        </div>
                        <div className="text-xs tracking-widest text-center py-0.5 text-zinc-100 font-bold">
                          {tarjetaNumero || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex justify-between items-end text-[9px]">
                          <div>
                            <span className="block text-zinc-400 font-sans uppercase">Titular</span>
                            <span className="font-sans font-bold uppercase truncate max-w-[140px] block">
                              {tarjetaTitular || clienteNom || 'CLIENTE MOSTRADOR'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-zinc-400 font-sans uppercase">Vence</span>
                            <span>{tarjetaVence || 'MM/AA'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Inputs de Tarjeta */}
                      <div className="space-y-1.5 text-xs">
                        <input
                          type="text"
                          value={tarjetaNumero}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                            const formatted = v.match(/.{1,4}/g)?.join(' ') || v;
                            setTarjetaNumero(formatted);
                            if (v.startsWith('4')) setMarcaTarjeta('VISA');
                            else if (v.startsWith('5')) setMarcaTarjeta('MASTERCARD');
                            else if (v.startsWith('3')) setMarcaTarjeta('AMEX');
                          }}
                          placeholder="Número de Tarjeta (16 dígitos)"
                          className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            value={tarjetaVence}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                              setTarjetaVence(v.length >= 3 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
                            }}
                            placeholder="Vence (MM/AA)"
                            className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="password"
                            maxLength={4}
                            value={tarjetaCvv}
                            onChange={(e) => setTarjetaCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="CVV (3 dígitos)"
                            className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Botón directo de aprobación Tarjeta */}
                      <button
                        type="button"
                        onClick={(e) => {
                          const vchFinal = voucherTarjeta || `VCH-${Math.floor(10000 + Math.random() * 90000)}`;
                          setVoucherTarjeta(vchFinal);
                          handleCobrar(e, 'TARJETA', vchFinal);
                        }}
                        disabled={cobrando || items.length === 0}
                        className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/20 flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Aprobar Cobro de Tarjeta (Completar Venta)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Resumen Financiero Transparente */}
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Subtotal Neto:</span>
                  <span className="font-mono">{formatearMoneda(subtotalNeto)}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>IGV (18% SUNAT incluido):</span>
                  <span className="font-mono">{formatearMoneda(igvCalculado)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <div>
                    <p className="text-xs font-black uppercase text-neutral-800 dark:text-white">
                      Total a Cobrar:
                    </p>
                    <p className="text-[10px] text-neutral-400 font-medium">
                      Descuenta stock físico y registra Kardex en BD
                    </p>
                  </div>
                  <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {formatearMoneda(totalCalculadoUI)}
                  </span>
                </div>
              </div>

              {/* Botón Principal de Cobro */}
              <button
                type="submit"
                disabled={cobrando || items.length === 0}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-lg shadow-teal-600/20 flex items-center justify-center space-x-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {cobrando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Descontando stock y emitiendo comprobante...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Completar Venta y Emitir {tipoComprobante === 'BOLETA' ? 'Boleta' : 'Factura'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de Vinculación de Dispositivo USB */}
      <ModalVincularDispositivo
        isOpen={modalVincularAbierto}
        onClose={() => setModalVincularAbierto(false)}
        dispositivoConectado={dispositivoUsbConectado}
        nombreDispositivo={nombreDispositivoUsb}
        onConectar={(nombre) => {
          setNombreDispositivoUsb(nombre);
          setDispositivoUsbConectado(true);
          localStorage.setItem('novasalud_usb_dev', nombre);
        }}
        onDesconectar={() => {
          setDispositivoUsbConectado(false);
          setNombreDispositivoUsb('');
          localStorage.removeItem('novasalud_usb_dev');
        }}
      />

      {/* Modal del Ticket Térmico al Completar la Venta */}
      {ventaCompletada && (
        <ModalTicket
          venta={ventaCompletada}
          onClose={() => setVentaCompletada(null)}
        />
      )}

      {/* Modal de Cobro con Yape / Plin en POS */}
      {modalYapeAbierto && (
        <div
          className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalYapeAbierto(false);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 text-neutral-900 dark:text-white animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-[#732282] dark:text-purple-300">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                    Cobro con QR Yape / Plin
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Muestre el QR al cliente para escanear en mostrador
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalYapeAbierto(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Monto a Cobrar */}
            <div className="mt-4 p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-900/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
                  Total a Cobrar
                </span>
                <span className="text-2xl font-black font-mono text-[#732282] dark:text-purple-300">
                  {formatearMoneda(totalCalculadoUI)}
                </span>
              </div>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={handleEnviarYapeADispositivo}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    yapeEnviadoADispositivo
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                      : 'bg-[#732282] text-white hover:bg-[#5b1968] shadow-xs'
                  }`}
                  title="Enviar el código QR al visor del cliente o pantalla secundaria"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{yapeEnviadoADispositivo ? 'Enviado a Pantalla' : 'Enviar a Visor'}</span>
                </button>
              )}
            </div>

            {/* Código QR Oficial */}
            <div className="my-3.5 text-center">
              <div className="p-2.5 bg-white rounded-2xl border-2 border-purple-200 dark:border-purple-900/80 shadow-md inline-block">
                <img
                  src="/media/qr-yape.jpg"
                  alt="QR Yape Botica Nova Salud"
                  className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-xl"
                />
              </div>

              {/* Teléfono y Titular */}
              <div className="mt-2.5 bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-left">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Número Oficial
                  </span>
                  <span className="text-sm font-black font-mono text-neutral-900 dark:text-white">
                    +51 955 545 561
                  </span>
                  <span className="text-[10.5px] text-teal-600 dark:text-teal-400 block font-semibold">
                    Titular: Botica Nova Salud
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('955545561');
                    toast.success('Número 955545561 copiado');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copiar</span>
                </button>
              </div>
            </div>

            {/* Input N° de Operación */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                N° de Operación Yape / Plin (Voucher Digital):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={8}
                  value={numeroOperacionYape}
                  onChange={(e) => setNumeroOperacionYape(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej. 849201"
                  className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-mono font-bold text-neutral-900 dark:text-white focus:ring-1 focus:ring-[#732282] focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={simularPagoYape}
                  className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 transition cursor-pointer"
                  title="Simular código de confirmación para pruebas"
                >
                  Simular
                </button>
              </div>
              <p className="text-[10.5px] text-neutral-400">
                Pida al cliente mostrar la constancia de pago en su aplicación Yape o Plin.
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex gap-2">
              <button
                type="button"
                onClick={() => setModalYapeAbierto(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold uppercase transition cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={(e) => {
                  const opFinal = numeroOperacionYape || String(Math.floor(100000 + Math.random() * 900000));
                  setNumeroOperacionYape(opFinal);
                  setModalYapeAbierto(false);
                  handleCobrar(e, 'YAPE_PLIN', opFinal);
                }}
                disabled={cobrando || items.length === 0}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#732282] hover:bg-[#5b1968] text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Aprobar Cobro Yape</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cobro con Tarjeta en POS */}
      {modalTarjetaAbierto && (
        <div
          className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalTarjetaAbierto(false);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 text-neutral-900 dark:text-white animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                    Cobro con Tarjeta
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Procesamiento en POS físico (Izipay / Niubiz)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalTarjetaAbierto(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Monto a Procesar */}
            <div className="mt-4 p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                  Monto a Procesar en POS
                </span>
                <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                  {formatearMoneda(totalCalculadoUI)}
                </span>
              </div>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={handleEnviarTarjetaADispositivo}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    tarjetaEnviadaADispositivo
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                  }`}
                  title="Enviar la orden al terminal o pantalla del cliente"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{tarjetaEnviadaADispositivo ? 'Enviado a Terminal' : 'Enviar a Terminal'}</span>
                </button>
              )}
            </div>

            {/* Selector de Marca de Tarjeta */}
            <div className="mt-3.5 space-y-1.5">
              <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                Marca / Tipo de Tarjeta:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['VISA', 'MASTERCARD', 'AMEX', 'OTRA'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMarcaTarjeta(m)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      marcaTarjeta === m
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Instrucciones de cobro en mostrador */}
            <div className="mt-3.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs space-y-1 text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-1.5 text-neutral-900 dark:text-white font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Instrucciones de cobro en terminal POS:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                1. Digite el monto exacto <strong className="text-neutral-900 dark:text-white font-mono">{formatearMoneda(totalCalculadoUI)}</strong> en el terminal POS físico.
              </p>
              <p className="text-[11px] leading-relaxed">
                2. Solicite al cliente acercar o insertar su tarjeta e ingresar su clave PIN si es requerido.
              </p>
              <p className="text-[11px] leading-relaxed">
                3. Verifique que la operación resulte <strong className="text-emerald-600 dark:text-emerald-400">APROBADA</strong> e ingrese el número de autorización a continuación.
              </p>
            </div>

            {/* Input N° de Voucher / Operación */}
            <div className="space-y-1.5 mt-3.5">
              <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                N° de Voucher / Referencia POS:
              </label>
              <input
                type="text"
                value={voucherTarjeta}
                onChange={(e) => setVoucherTarjeta(e.target.value)}
                placeholder="Ej. OP-482910 o N° de ref."
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-mono font-bold text-neutral-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                autoFocus
              />
            </div>

            {/* Botones de Acción */}
            <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex gap-2">
              <button
                type="button"
                onClick={() => setModalTarjetaAbierto(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold uppercase transition cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={(e) => {
                  const vchFinal = voucherTarjeta || `VCH-${Math.floor(10000 + Math.random() * 90000)}`;
                  setVoucherTarjeta(vchFinal);
                  setModalTarjetaAbierto(false);
                  handleCobrar(e, 'TARJETA', vchFinal);
                }}
                disabled={cobrando || items.length === 0}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Aprobar Cobro de Tarjeta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
