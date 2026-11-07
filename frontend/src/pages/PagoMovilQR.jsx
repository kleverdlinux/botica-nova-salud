import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Share2,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  Building2,
  Check,
  Copy,
  Sparkles
} from 'lucide-react';
import { posDisplay } from '../utils/posDisplayChannel.js';
import { formatearMoneda } from '../utils/formateadores.js';

export default function PagoMovilQR() {
  const [searchParams] = useSearchParams();
  const montoQuery = parseFloat(searchParams.get('monto') || '0');
  const ticketQuery = searchParams.get('ticket') || 'TKT-001';
  const comercioQuery = searchParams.get('comercio') || 'Botica Nova Salud S.A.C.';

  const [billetera, setBilletera] = useState('YAPE'); // 'YAPE' | 'PLIN'
  const [pagando, setPagando] = useState(false);
  const [pagado, setPagado] = useState(false);
  const [numeroOperacion, setNumeroOperacion] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [copiado, setCopiado] = useState(false);

  const monto = montoQuery > 0 ? montoQuery : 24.5;

  const handlePagar = () => {
    setPagando(true);

    // Simulación de procesamiento de red bancaria (1.2 segundos)
    setTimeout(() => {
      const opGenerado = String(Math.floor(100000 + Math.random() * 900000));
      const ahora = new Date();
      const fechaStr = ahora.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
      const horaStr = ahora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

      setNumeroOperacion(opGenerado);
      setFechaHora(`${fechaStr} - ${horaStr}`);
      setPagado(true);
      setPagando(false);

      // Notificar al POS de la computadora o laptop a través del canal en vivo
      posDisplay.notificarPagoMovil({
        monto,
        numeroOperacion: opGenerado,
        metodo: billetera,
        ticket: ticketQuery,
        cliente: 'Cliente Móvil'
      });
    }, 1200);
  };

  const copiarOperacion = () => {
    navigator.clipboard.writeText(numeroOperacion);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const colorPrincipal = billetera === 'YAPE' ? 'bg-[#732282]' : 'bg-[#00d2c6]';
  const colorBoton = billetera === 'YAPE' ? 'bg-[#732282] hover:bg-[#5b1968]' : 'bg-[#00b3a8] hover:bg-[#009b91]';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-purple-500 selection:text-white">
      {/* Contenedor tipo teléfono móvil */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        {!pagado ? (
          // PANTALLA 1: CONFIRMACIÓN Y BOTÓN DE YAPEO
          <>
            {/* Cabecera de la Billetera */}
            <div className={`${colorPrincipal} text-white p-5 text-center transition-colors duration-300 relative`}>
              {/* Selector Yape / Plin */}
              <div className="inline-flex p-1 bg-black/20 rounded-xl mb-3 text-xs font-bold">
                <button
                  onClick={() => setBilletera('YAPE')}
                  className={`px-4 py-1 rounded-lg transition ${
                    billetera === 'YAPE' ? 'bg-white text-[#732282] shadow-sm' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Yape
                </button>
                <button
                  onClick={() => setBilletera('PLIN')}
                  className={`px-4 py-1 rounded-lg transition ${
                    billetera === 'PLIN' ? 'bg-white text-[#009b91] shadow-sm' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Plin
                </button>
              </div>

              <h1 className="text-xl font-black tracking-tight">
                {billetera === 'YAPE' ? 'Pagar con Yape' : 'Pagar con Plin'}
              </h1>
              <p className="text-xs text-white/80 mt-0.5">Escaneaste el QR en el mostrador</p>
            </div>

            {/* Datos del Comercio y Monto */}
            <div className="p-6 space-y-6">
              {/* Tarjeta del Comercio */}
              <div className="flex items-center space-x-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 flex items-center justify-center font-bold text-lg">
                  NS
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Destinatario
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {comercioQuery}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">955 545 561</p>
                </div>
              </div>

              {/* QR Yape Oficial */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-purple-200 shadow-xs">
                <img
                  src="/media/qr-yape.jpg"
                  alt="QR Yape Botica Nova Salud"
                  className="w-44 h-44 object-contain rounded-xl"
                />
                <span className="text-[10px] text-purple-700 font-bold uppercase mt-1">
                  Escanea con tu app Yape o Plin
                </span>
              </div>

              {/* Monto Grande a Transferir */}
              <div className="text-center py-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Monto a Transferir
                </span>
                <div className="text-4xl font-black text-slate-900 font-mono tracking-tight mt-1">
                  {formatearMoneda(monto)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ticket de Venta: <span className="font-mono font-bold text-slate-600">{ticketQuery}</span>
                </p>
              </div>

              {/* Garantía de Seguridad */}
              <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pago verificado directamente en el POS</span>
              </div>

              {/* Botón Principal de Pagar */}
              <button
                onClick={handlePagar}
                disabled={pagando}
                className={`w-full py-4 rounded-2xl text-white font-black text-base shadow-lg transition transform active:scale-95 cursor-pointer flex items-center justify-center space-x-2 ${colorBoton}`}
              >
                {pagando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transfiriendo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>
                      {billetera === 'YAPE'
                        ? `¡Yapear ${formatearMoneda(monto)}!`
                        : `¡Plinear ${formatearMoneda(monto)}!`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          // PANTALLA 2: CONSTANCIA OFICIAL DE YAPEO EXITOSO
          <div className="p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            {/* Check Oficial */}
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                ¡Pago Exitoso!
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                {billetera === 'YAPE' ? '¡Yapeaste!' : '¡Plineaste!'}
              </h2>
              <p className="text-3xl font-black font-mono text-[#732282] mt-2">
                {formatearMoneda(monto)}
              </p>
            </div>

            {/* Recuadro de Constancia */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Destino:</span>
                <span className="font-bold text-slate-800">{comercioQuery}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Número de Celular:</span>
                <span className="font-mono font-bold text-slate-800">*** *** 321</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500">N° de Operación:</span>
                <div className="flex items-center space-x-1.5 font-mono font-black text-slate-900 text-sm">
                  <span>{numeroOperacion}</span>
                  <button
                    onClick={copiarOperacion}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 transition"
                    title="Copiar número"
                  >
                    {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Fecha y Hora:</span>
                <span>{fechaHora}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center space-x-1.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>El pago ha sido transmitido a la pantalla del cajero.</span>
            </div>

            <button
              onClick={() => setPagado(false)}
              className="w-full py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
            >
              Realizar otro pago
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-4 text-center">
        Simulador de Cobro Omnicanal • Botica Nova Salud
      </p>
    </div>
  );
}

