import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  ScanLine,
  CheckCircle2,
  Volume2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Wifi
} from 'lucide-react';
import { reproducirPipScanner } from '../utils/sonidoScanner.js';
import { posDisplay } from '../utils/posDisplayChannel.js';

export default function EscanerMovil() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [ultimoEscaneado, setUltimoEscaneado] = useState(null);
  const [codigoManual, setCodigoManual] = useState('');
  const [totalEscaneados, setTotalEscaneados] = useState(0);

  useEffect(() => {
    iniciarCamara();
    return () => {
      detenerCamara();
    };
  }, []);

  const iniciarCamara = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        iniciarDeteccionContinua();
      }
    } catch (err) {
      console.warn('No se pudo acceder a la cámara trasera:', err.message);
      setCameraError('Permiso de cámara no concedido o no disponible.');
      setCameraActive(false);
    }
  };

  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const iniciarDeteccionContinua = () => {
    if (!('BarcodeDetector' in window)) return;

    try {
      const detector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a']
      });

      const interval = setInterval(async () => {
        if (!videoRef.current || !streamRef.current) {
          clearInterval(interval);
          return;
        }

        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            enviarCodigoAlPos(code);
          }
        } catch (e) {}
      }, 400);

      return () => clearInterval(interval);
    } catch (e) {}
  };

  const enviarCodigoAlPos = (codigo) => {
    const codeLimpio = String(codigo).trim();
    if (!codeLimpio) return;

    // 1. Sonido PIP idéntico a Plaza Vea en el celular
    reproducirPipScanner();

    // 2. Transmitir por canal en vivo al POS de la computadora
    posDisplay.notificarProductoEscaneado(codeLimpio);

    setUltimoEscaneado(codeLimpio);
    setTotalEscaneados((prev) => prev + 1);

    setTimeout(() => {
      setUltimoEscaneado(null);
    }, 1500);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!codigoManual.trim()) return;
    enviarCodigoAlPos(codigoManual.trim());
    setCodigoManual('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Cabecera Móvil */}
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight leading-tight">Pistola Escáner Móvil</h1>
            <p className="text-[11px] text-teal-400 font-medium">Conectado al POS de Nova Salud</p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-teal-300">
          {totalEscaneados} items
        </div>
      </header>

      {/* Visor de Cámara */}
      <main className="flex-1 p-4 flex flex-col justify-center space-y-4 max-w-md mx-auto w-full">
        <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Mira Láser */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className="w-4/5 h-3/5 border-2 border-dashed border-teal-400/80 rounded-2xl relative overflow-hidden">
              <div className="w-full h-0.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)] animate-bounce" />
            </div>
          </div>

          {/* Feedback PIP */}
          {ultimoEscaneado && (
            <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white animate-in zoom-in-95 duration-100">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mb-1 animate-bounce" />
              <p className="text-base font-black">¡PIP! Transmitido a la Laptop</p>
              <p className="text-sm font-mono text-emerald-300 font-bold">{ultimoEscaneado}</p>
            </div>
          )}

          {cameraError && (
            <div className="p-4 text-center text-slate-300 text-xs space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <p>{cameraError}</p>
            </div>
          )}
        </div>

        {/* Input Manual o con botones de prueba */}
        <form onSubmit={handleManualSubmit} className="flex space-x-2">
          <input
            type="text"
            value={codigoManual}
            onChange={(e) => setCodigoManual(e.target.value)}
            placeholder="Escriba o pegue código..."
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-teal-600/20 active:scale-95 transition cursor-pointer"
          >
            Pistolear (PIP)
          </button>
        </form>

        {/* Códigos de prueba rápidos */}
        <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/80 text-center space-y-2">
          <p className="text-[11px] text-slate-400 font-semibold">Tocar para probar códigos de anaquel:</p>
          <div className="flex flex-wrap justify-center gap-1.5 text-[10px] font-mono font-bold">
            {['775000000101', '775000000102', '775000000103', '775000000104'].map((c) => (
              <button
                key={c}
                onClick={() => enviarCodigoAlPos(c)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 active:scale-95 transition"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="p-3 bg-slate-900 border-t border-slate-800 text-center text-[10px] text-slate-500">
        Botica Nova Salud • Terminal Óptico Móvil
      </footer>
    </div>
  );
}

