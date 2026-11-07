import React, { useState, useEffect } from 'react';
import { X, History, Loader2, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { obtenerKardexApi } from '../api/inventarioApi.js';
import { formatearFechaHoraLima } from '../utils/formateadores.js';
import { notificarError } from '../utils/alertaSweet.js';

export default function ModalKardex({ producto, onClose }) {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarKardex() {
      setCargando(true);
      try {
        const data = await obtenerKardexApi(producto.id);
        setMovimientos(data.movimientos || []);
      } catch (err) {
        console.error('Error al cargar kardex:', err);
        const msg = err.response?.data?.error || 'No se pudo cargar el historial de Kardex.';
        notificarError('Error en Kardex', msg);
      } finally {
        setCargando(false);
      }
    }

    cargarKardex();
  }, [producto.id]);

  const renderBadgeTipo = (tipo) => {
    switch (tipo) {
      case 'ENTRADA':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>ENTRADA</span>
          </span>
        );
      case 'SALIDA':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>SALIDA</span>
          </span>
        );
      case 'AJUSTE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>AJUSTE</span>
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200">{tipo}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Cabecera */}
        <div className="bg-slate-900 dark:bg-neutral-950 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-base">Kardex Físico: {producto.nombre}</h3>
              <p className="text-xs text-slate-400 dark:text-neutral-400">{producto.presentacion} • Stock actual: <strong className="text-white font-mono">{producto.stock} unidades</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Tabla */}
        <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-neutral-900">
          {cargando ? (
            <div className="py-16 text-center text-slate-500 dark:text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0d9488] mb-2" />
              <p className="text-sm font-medium">Cargando movimientos de inventario...</p>
            </div>
          ) : movimientos.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-neutral-500">
              <History className="w-12 h-12 mx-auto stroke-1 text-slate-300 dark:text-neutral-600 mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-neutral-300">Sin movimientos registrados</p>
              <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">Este producto aún no cuenta con movimientos de Kardex.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-neutral-800 rounded-xl">
              <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-neutral-800">
                <thead className="bg-slate-50 dark:bg-neutral-950 text-slate-700 dark:text-neutral-300 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Fecha y Hora (Lima)</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3 text-right">Cantidad</th>
                    <th className="px-4 py-3 text-right">Stock Anterior</th>
                    <th className="px-4 py-3 text-right">Stock Nuevo</th>
                    <th className="px-4 py-3">Motivo / Operación</th>
                    <th className="px-4 py-3">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                  {movimientos.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap font-mono">
                        {formatearFechaHoraLima(m.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {renderBadgeTipo(m.tipo)}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-white font-mono">
                        {m.tipo === 'ENTRADA' ? `+${m.cantidad}` : m.tipo === 'SALIDA' ? `-${m.cantidad}` : m.cantidad}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 dark:text-neutral-400 font-medium font-mono">
                        {m.stockAnterior}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                        {m.stockNuevo}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-neutral-300 max-w-xs truncate" title={m.motivo}>
                        {m.motivo}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-neutral-400 whitespace-nowrap">
                        {m.usuario?.nombre || 'Sistema'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition cursor-pointer border border-neutral-700"
          >
            Cerrar Kardex
          </button>
        </div>
      </div>
    </div>
  );
}
