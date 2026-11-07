import React, { useState } from 'react';
import { X, ArrowDownRight, Loader2, Calendar, Barcode, AlertTriangle } from 'lucide-react';
import { registrarEntradaApi } from '../api/inventarioApi.js';
import { notificarExito, notificarError } from '../utils/alertaSweet.js';
import { esProductoVencido, formatearFechaLima } from '../utils/formateadores.js';

export default function ModalEntrada({ producto, onClose, onCompletado }) {
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [nuevoLote, setNuevoLote] = useState('');
  const [nuevaFechaVencimiento, setNuevaFechaVencimiento] = useState('');
  const [guardando, setGuardando] = useState(false);

  const vencido = producto ? esProductoVencido(producto.fechaVencimiento) : false;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cant = parseInt(cantidad, 10);
    if (!cant || cant <= 0) {
      notificarError('Cantidad Inválida', 'La cantidad a ingresar debe ser mayor a 0.');
      return;
    }

    if (!motivo.trim()) {
      notificarError('Motivo Requerido', 'El motivo o justificación de la entrada es obligatorio.');
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        productoId: producto.id,
        cantidad: cant,
        motivo: motivo.trim()
      };

      if (nuevoLote.trim()) {
        payload.lote = nuevoLote.trim();
      }
      if (nuevaFechaVencimiento) {
        payload.fechaVencimiento = nuevaFechaVencimiento;
      }

      const res = await registrarEntradaApi(payload);

      notificarExito(
        'Entrada Registrada',
        res.activo
          ? `Ingreso de ${cant} u. completado. El fármaco está ACTIVO y disponible para venta.`
          : res.mensaje || `Ingreso de ${cant} unidades registrado con éxito en Kardex.`
      );
      onCompletado();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al registrar la entrada de inventario.';
      notificarError('Error de Almacén', msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowDownRight className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-extrabold text-base">Registrar Entrada de Mercadería</h3>
              <p className="text-[11px] text-emerald-200">Recepción de compras y asignación de lotes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white p-1.5 rounded-xl hover:bg-emerald-600/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 dark:bg-neutral-950 p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 text-xs text-slate-700 dark:text-neutral-300 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-sm">{producto?.nombre}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${producto?.activo ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'}`}>
                {producto?.activo ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </div>
            <p className="text-slate-500 dark:text-neutral-400">{producto?.presentacion} • Lote actual: <span className="font-mono font-bold text-slate-700 dark:text-neutral-200">{producto?.lote || 'S/L'}</span> ({formatearFechaLima(producto?.fechaVencimiento)})</p>
            <p className="text-slate-500 dark:text-neutral-400">Stock actual en almacén: <strong className="text-emerald-700 dark:text-emerald-400 text-xs font-mono">{producto?.stock} unidades</strong></p>

            {vencido && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Lote actual caducado:</strong> Ingrese el nuevo número de lote y su fecha de vencimiento vigente para reactivar automáticamente el fármaco en mostrador y tienda web.
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase mb-1">
                Cantidad a Ingresar *
              </label>
              <input
                type="number"
                min="1"
                required
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="Ej. 20"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase mb-1">
                Nuevo Número de Lote
              </label>
              <input
                type="text"
                value={nuevoLote}
                onChange={(e) => setNuevoLote(e.target.value)}
                placeholder={producto?.lote || 'Ej. L-2026-095'}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase mb-1">
              Nueva Fecha de Vencimiento (FEFO)
            </label>
            <input
              type="date"
              value={nuevaFechaVencimiento}
              onChange={(e) => setNuevaFechaVencimiento(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase mb-1">
              Motivo o Documento de Compra *
            </label>
            <textarea
              required
              rows={2}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Factura F001-9821 de Droguería Central · Recepción conforme"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-2 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Registrar Ingreso</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
