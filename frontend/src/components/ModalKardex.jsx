import React, { useState, useEffect } from 'react';
import { X, History, Loader2, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { obtenerKardexApi } from '../api/inventarioApi.js';
import { formatearFechaHoraLima } from '../utils/formateadores.js';
import toast from 'react-hot-toast';

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
        toast.error(msg);
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
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>ENTRADA</span>
          </span>
        );
      case 'SALIDA':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>SALIDA</span>
          </span>
        );
      case 'AJUSTE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>AJUSTE</span>
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800">{tipo}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Cabecera */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-brand-400" />
            <div>
              <h3 className="font-bold text-base">Kardex Físico: {producto.nombre}</h3>
              <p className="text-xs text-slate-400">{producto.presentacion} • Stock actual: <strong className="text-white">{producto.stock} unidades</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Tabla */}
        <div className="p-6 overflow-y-auto flex-1">
          {cargando ? (
            <div className="py-16 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-2" />
              <p className="text-sm font-medium">Cargando movimientos de inventario...</p>
            </div>
          ) : movimientos.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <History className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">Sin movimientos registrados</p>
              <p className="text-xs text-slate-400 mt-0.5">Este producto aún no cuenta con movimientos de Kardex.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
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
                <tbody className="divide-y divide-slate-100 bg-white">
                  {movimientos.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {formatearFechaHoraLima(m.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {renderBadgeTipo(m.tipo)}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-slate-900">
                        {m.tipo === 'ENTRADA' ? `+${m.cantidad}` : m.tipo === 'SALIDA' ? `-${m.cantidad}` : m.cantidad}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 font-medium">
                        {m.stockAnterior}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {m.stockNuevo}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-xs truncate" title={m.motivo}>
                        {m.motivo}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
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
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
          >
            Cerrar Kardex
          </button>
        </div>
      </div>
    </div>
  );
}
