import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  CreditCard,
  Smartphone,
  CheckCircle,
  Clock,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Sparkles,
  HeartPulse,
  Receipt
} from 'lucide-react';
import { posDisplay } from '../utils/posDisplayChannel.js';
import { formatearMoneda } from '../utils/formateadores.js';

export default function VisorCliente() {
  const [estadoPos, setEstadoPos] = useState({
    modo: 'REPOSO', // 'REPOSO' | 'CARRITO' | 'YAPE_PLIN' | 'TARJETA' | 'EXITO'
    items: [],
    total: 0,
    ticketId: '',
    clienteNom: '',
    qrDataUrl: ''
  });

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [esFullscreen, setEsFullscreen] = useState(false);
  const [horaLima, setHoraLima] = useState('');

  // Reloj local de Lima
  useEffect(() => {
    const actualizarHora = () => {
      const ahora = new Date();
      setHoraLima(ahora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    actualizarHora();
    const interval = setInterval(actualizarHora, 1000);
    return () => clearInterval(interval);
  }, []);

  // Suscribirse al canal del POS
  useEffect(() => {
    // Cargar estado inicial si existe
    const inicial = posDisplay.obtenerEstadoActual();
    if (inicial) {
      setEstadoPos(inicial);
    }

    const unsuscribe = posDisplay.suscribir((mensaje) => {
      if (mensaje.tipo === 'ACTUALIZAR_ESTADO') {
        setEstadoPos(mensaje.payload);
      }
    });

    return () => unsuscribe();
  }, []);

  // Generar QR dinámico cuando esté en modo YAPE_PLIN
  useEffect(() => {
    if (estadoPos.modo === 'YAPE_PLIN' && estadoPos.total > 0) {
      // URL para que el celular del cliente abra la pantalla de pago simulado
      const host = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      const urlPagoMovil = `${window.location.protocol}//${host}${port}/pago-movil?monto=${estadoPos.total.toFixed(2)}&ticket=${encodeURIComponent(estadoPos.ticketId || 'TKT-001')}&comercio=${encodeURIComponent('Botica Nova Salud')}`;

      QRCode.toDataURL(urlPagoMovil, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Error generando QR:', err));
    }
  }, [estadoPos.modo, estadoPos.total, estadoPos.ticketId]);

  // Manejo de pantalla completa
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setEsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setEsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-teal-500 selection:text-white font-sans overflow-hidden">
      {/* Barra Superior del Visor de Cliente */}
      <header className="px-8 py-5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-500/10">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Botica Nova Salud</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Caja 01 • Mostrador
              </span>
            </h1>
            <p className="text-xs text-slate-400">Atención profesional farmacéutica y dispensación segura</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>{horaLima}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            title={esFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {esFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Contenido Central según el Modo del POS */}
      <main className="flex-1 p-8 flex items-center justify-center">
        {/* 1. Modo Reposo: Bienvenida al Cliente */}
        {estadoPos.modo === 'REPOSO' && (
          <div className="max-w-2xl text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-teal-500/10 border-2 border-teal-500/30 flex items-center justify-center text-teal-400 shadow-2xl shadow-teal-500/20">
              <HeartPulse className="w-12 h-12 animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                ¡Bienvenido a Botica Nova Salud!
              </h2>
              <p className="text-slate-400 text-base mt-2 max-w-lg mx-auto">
                Dispensación ética, medicamentos con registro sanitario DIGEMID y asesoría farmacéutica personalizada.
              </p>
            </div>
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-teal-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>Caja disponible • Su atención iniciará en breve</span>
            </div>
          </div>
        )}

        {/* 2. Modo Carrito: Mostrando Productos al Cliente */}
        {estadoPos.modo === 'CARRITO' && (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
            {/* Lista de Medicamentos */}
            <div className="md:col-span-7 bg-slate-950/60 rounded-3xl border border-slate-800 p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-teal-400" />
                  <span>Su Cuenta en Mostrador</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {estadoPos.items?.length || 0} producto(s)
                </span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {estadoPos.items?.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{item.nombre}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.cantidad} u. × {formatearMoneda(item.precio)}
                      </p>
                    </div>
                    <span className="text-base font-black font-mono text-teal-400 shrink-0">
                      {formatearMoneda(item.precio * item.cantidad)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total a Pagar Grande */}
            <div className="md:col-span-5 bg-gradient-to-br from-slate-950 to-slate-900 rounded-3xl border border-slate-800 p-8 text-center space-y-5 shadow-2xl">
              <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
                Total a Pagar
              </span>
              <div className="text-5xl font-black font-mono tracking-tight text-white py-2">
                {formatearMoneda(estadoPos.total || 0)}
              </div>
              <p className="text-xs text-slate-400">
                Incluye IGV (18%) conforme a ley peruana
              </p>
              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Elija su método de pago con el cajero</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Modo YAPE / PLIN: Código QR Gigante */}
        {estadoPos.modo === 'YAPE_PLIN' && (
          <div className="max-w-xl w-full bg-slate-950/80 rounded-3xl border border-slate-800 p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Cabecera Yape / Plin */}
            <div className="flex items-center justify-center space-x-3">
              <span className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-black tracking-wider uppercase">
                Yape
              </span>
              <span className="text-slate-600 font-bold">•</span>
              <span className="px-3.5 py-1.5 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-xs font-black tracking-wider uppercase">
                Plin
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Escanee el Código QR para Pagar
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Apunte con la cámara de su celular o desde su app bancaria
              </p>
            </div>

            {/* Contenedor del QR con Logo Central */}
            <div className="relative inline-block p-4 bg-white rounded-3xl shadow-2xl mx-auto border-4 border-slate-700">
              <img
                src="/media/qr-yape.jpg"
                alt="QR Yape Botica Nova Salud"
                className="w-64 h-64 mx-auto rounded-xl object-contain"
              />
            </div>

            {/* Datos Comerciales */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Titular de Cuenta:</span>
                <span className="font-bold text-white">Botica Nova Salud S.A.C.</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Celular Yape / Plin:</span>
                <span className="font-bold text-teal-400 font-mono tracking-wider">955 545 561</span>
              </div>
              <div className="flex items-center justify-between text-base pt-2 border-t border-slate-800">
                <span className="font-bold text-slate-300">Monto Exacto:</span>
                <span className="text-2xl font-black font-mono text-teal-400">
                  {formatearMoneda(estadoPos.total || 0)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 animate-pulse">
              Esperando confirmación del pago en caja...
            </p>
          </div>
        )}

        {/* 4. Modo TARJETA: Ventanita Informativa del Terminal POS */}
        {estadoPos.modo === 'TARJETA' && (
          <div className="max-w-lg w-full bg-slate-950/80 rounded-3xl border border-slate-800 p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-600/10 border-2 border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-500/10">
              <CreditCard className="w-10 h-10 animate-pulse" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Pago con Tarjeta
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Acerque o inserte su tarjeta en el terminal inalámbrico
              </p>
            </div>

            <div className="py-4 px-6 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total a Cobrar</span>
              <p className="text-4xl font-black font-mono text-white mt-1">
                {formatearMoneda(estadoPos.total || 0)}
              </p>
            </div>

            {/* Marcas de Tarjetas Aceptadas */}
            <div className="flex items-center justify-center space-x-3 text-xs font-bold text-slate-400">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">Visa</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">Mastercard</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">Contactless )))</span>
            </div>

            <div className="inline-flex items-center space-x-2 text-xs text-blue-400 font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Esperando lectura del chip o pase de tarjeta...</span>
            </div>
          </div>
        )}

        {/* 5. Modo EXITO: Pago Confirmado */}
        {estadoPos.modo === 'EXITO' && (
          <div className="max-w-md text-center space-y-6 animate-in zoom-in duration-300">
            <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-2xl shadow-emerald-500/20">
              <CheckCircle className="w-14 h-14" />
            </div>

            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                ¡Pago Confirmado!
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Su comprobante se está imprimiendo en el mostrador.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
              ¡Muchas gracias por confiar en Botica Nova Salud!
            </div>
          </div>
        )}
      </main>

      {/* Pie del Visor */}
      <footer className="px-8 py-3 border-t border-slate-800 bg-slate-950/80 text-center text-xs text-slate-500">
        Botica Nova Salud • Farmacia & Bioquímica • RUC 20100055231 • Lima, Perú
      </footer>
    </div>
  );
}

