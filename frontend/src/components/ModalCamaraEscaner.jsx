import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  ScanLine,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { reproducirPipScanner } from '../utils/sonidoScanner.js';

export default function ModalCamaraEscaner({ isOpen, onClose, onDetectarCodigo }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [ultimoEscaneado, setUltimoEscaneado] = useState(null);
  const [codigoManual, setCodigoManual] = useState('');

  useEffect(() => {
    if (!isOpen) {
      detenerCamara();
      return;
    }
    iniciarCamara();
    return () => detenerCamara();
  }, [isOpen]);

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
        iniciarDeteccionContinua();
      }
    } catch (err) {
      setCameraError('No se encontró una cámara activa o no tiene permisos en el navegador.');
    }
  };

  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
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
            procesarCodigo(code);
          }
        } catch (e) {}
      }, 400);

      return () => clearInterval(interval);
    } catch (e) {}
  };

  const procesarCodigo = (codigo) => {
    const code = String(codigo).trim();
    if (!code) return;
    reproducirPipScanner();
    setUltimoEscaneado(code);
    if (onDetectarCodigo) onDetectarCodigo(code);
    setTimeout(() => setUltimoEscaneado(null), 1800);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!codigoManual.trim()) return;
    procesarCodigo(codigoManual.trim());
    setCodigoManual('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white dark:bg-black rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200 dark:border-neutral-800 flex flex-col">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/60 dark:bg-neutral-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
              <Camera className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-black text-base text-neutral-900 dark:text-white leading-tight">
                Escáner Óptico de Medicamentos
              </h3>
              <p className="text-xs text-neutral-500">
                Apunta al código de barras del producto
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visor de Cámara */}
        <div className="p-6 space-y-4">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border-2 border-neutral-200 dark:border-neutral-800">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Guía Láser */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-4/5 h-3/5 border-2 border-dashed border-teal-400/80 rounded-xl relative overflow-hidden">
                <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-bounce" />
              </div>
            </div>

            {ultimoEscaneado && (
              <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white animate-in zoom-in-95 duration-100">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-1 animate-bounce" />
                <p className="text-sm font-black">¡Código Escaneado! (PIP)</p>
                <p className="text-xs font-mono text-emerald-300 font-bold">{ultimoEscaneado}</p>
                <p className="text-[11px] text-emerald-200/80 mt-1">+1 unidad agregada al ticket</p>
              </div>
            )}

            {cameraError && (
              <div className="p-4 text-center text-slate-300 text-xs space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <p>{cameraError}</p>
              </div>
            )}
          </div>

          {/* Ingreso manual de código */}
          <form onSubmit={handleManualSubmit} className="flex space-x-2">
            <input
              type="text"
              value={codigoManual}
              onChange={(e) => setCodigoManual(e.target.value)}
              placeholder="Escriba código de barras (ej: 775000000101)..."
              className="flex-1 px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer"
            >
              Agregar (PIP)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

