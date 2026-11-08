import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  X,
  CheckCircle2,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';
import toast from '../utils/alertaSweet.js';
import { posDisplay } from '../utils/posDisplayChannel.js';

export default function ModalVincularDispositivo({
  isOpen,
  onClose,
  monto = 0,
  ticketId = '',
  dispositivoConectado,
  nombreDispositivo,
  onConectar,
  onDesconectar
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [ipLocal, setIpLocal] = useState('192.168.18.23');

  const calcularUrlTerminal = (ip) => {
    let base = '';
    if (typeof window !== 'undefined') {
      const { hostname, origin } = window.location;
      if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1') && !hostname.startsWith('192.168.') && !hostname.startsWith('10.')) {
        base = `${origin}/terminal-movil`;
      } else {
        base = `http://${ip || ipLocal}:5173/terminal-movil`;
      }
    } else {
      base = `http://${ip || ipLocal}:5173/terminal-movil`;
    }
    const params = new URLSearchParams();
    if (Number(monto) > 0) params.set('monto', Number(monto).toFixed(2));
    if (ticketId) params.set('ticket', ticketId);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const urlTerminal = calcularUrlTerminal(ipLocal);

  useEffect(() => {
    if (!isOpen) return;

    if (Number(monto) > 0) {
      posDisplay.enviarEstado({
        modo: 'CARRITO',
        total: Number(monto),
        ticketId: ticketId
      });
    }

    fetch('/api/dispositivos/info-conexion')
      .then((r) => r.json())
      .then((data) => {
        const ip = data.ipLocal || '192.168.18.23';
        setIpLocal(ip);
        const url = calcularUrlTerminal(ip);
        QRCode.toDataURL(url, {
          width: 240,
          margin: 1,
          color: { dark: '#042f2e', light: '#ffffff' }
        }).then((dataUrl) => setQrDataUrl(dataUrl));
      })
      .catch(() => {
        QRCode.toDataURL(urlTerminal, {
          width: 240,
          margin: 1,
          color: { dark: '#042f2e', light: '#ffffff' }
        }).then((dataUrl) => setQrDataUrl(dataUrl));
      });
  }, [isOpen]);

  const copiarEnlace = () => {
    navigator.clipboard.writeText(urlTerminal);
    setCopiado(true);
    toast.success('Enlace copiado al portapapeles');
    setTimeout(() => setCopiado(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-neutral-800 flex flex-col">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between bg-slate-50 dark:bg-neutral-950">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <Smartphone className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white leading-tight">
                Vincular Celular como Terminal POS
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Cobro Móvil Yape / Plin & Tarjeta
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido: Código QR y Enlace */}
        <div className="p-6 space-y-4 text-center">
          {monto > 0 && (
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800/60 flex items-center justify-between text-left">
              <div>
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
                  Total a Cobrar en Mostrador
                </span>
                <span className="text-xl font-black font-mono text-[#732282] dark:text-purple-300">
                  S/ {Number(monto).toFixed(2)}
                </span>
              </div>
              <span className="text-xs font-black text-purple-700 bg-purple-100 dark:bg-purple-900/60 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                Yape / Tarjeta
              </span>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-600 dark:text-neutral-300">
              Escanee este código con la cámara de su celular para abrir las opciones de pago (Yape / Plin o Tarjeta):
            </p>
          </div>

          {/* QR Central Grande */}
          <div className="p-3 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 inline-block shadow-inner mx-auto">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Vinculación Terminal Móvil"
                className="w-56 h-56 mx-auto rounded-xl object-contain bg-white p-2"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 dark:text-neutral-500 text-xs">
                Generando QR...
              </div>
            )}
          </div>

          {/* Enlace y botón copiar */}
          <div className="p-2.5 bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-2 text-left">
            <span className="truncate font-mono font-bold text-xs text-teal-800 dark:text-teal-300">
              {urlTerminal}
            </span>
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={copiarEnlace}
                className="px-2.5 py-1.5 bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
              >
                {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiado ? 'Copiado' : 'Copiar'}</span>
              </button>
              <a
                href={urlTerminal}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 rounded-lg transition"
                title="Probar en nueva pestaña"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Instrucciones Rápidas */}
          <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800 text-left text-xs text-teal-900 dark:text-teal-300 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Sincronización automática Wi-Fi:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-teal-800 dark:text-teal-400">
              Elija <strong>Yape</strong> o <strong>Tarjeta</strong> en su celular y muéstrelo al cliente para realizar el cobro. Los montos y confirmaciones se reflejan al instante en esta pantalla.
            </p>
          </div>

          {/* Botón de Cierre */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer"
          >
            Listo (Cerrar)
          </button>
        </div>
      </div>
    </div>
  );
}
