import React, { useState } from 'react';
import { X, SlidersHorizontal, Loader2, AlertTriangle } from 'lucide-react';
import { registrarAjusteApi } from '../api/inventarioApi.js';
import { notificarExito, notificarError, notificarAdvertencia } from '../utils/alertaSweet.js';

export default function ModalAjuste({ producto, onClose, onCompletado }) {
  const [stockReal, setStockReal] = useState('');
  const [motivo, setMotivo] = useState('');
  const [guardando, setGuardando] = useState(false);

  const stockActual = Number(producto.stock);
  const conteoNumerico = stockReal !== '' ? parseInt(stockReal, 10) : null;
  const diferencia = conteoNumerico !== null && !isNaN(conteoNumerico) ? conteoNumerico - stockActual : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (stockReal === '' || isNaN(conteoNumerico) || conteoNumerico < 0) {
      notificarError('Conteo Inválido', 'Debe ingresar un conteo físico válido (0 o mayor).');
      return;
    }

    if (conteoNumerico === stockActual) {
      notificarAdvertencia('Sin Variación', 'El stock físico es idéntico al stock del sistema. No se requiere ajuste.');
      return;
    }

    if (!motivo.trim()) {
      notificarError('Motivo Requerido', 'El motivo o justificación del ajuste físico es obligatorio.');
      return;
    }

    setGuardando(true);
    try {
      const res = await registrarAjusteApi({
        productoId: producto.id,
        stockReal: conteoNumerico,
        motivo: motivo.trim()
      });

      notificarExito('Ajuste Registrado', res.mensaje || `Ajuste aplicado: nuevo stock ${conteoNumerico} unidades.`);
      onCompletado();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al procesar el ajuste de inventario.';
      notificarError('Error en Ajuste', msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-amber-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-200" />
            <h3 className="font-bold text-base">Ajuste de Inventario Físico</h3>
          </div>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 dark:bg-neutral-950 p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 text-xs text-slate-700 dark:text-neutral-300 space-y-1">
            <p><span className="font-bold text-slate-900 dark:text-white">Producto:</span> {producto.nombre}</p>
            <p><span className="font-bold text-slate-900 dark:text-white">Presentación:</span> {producto.presentacion}</p>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-neutral-800 mt-1">
              <span className="font-bold text-slate-700 dark:text-neutral-400">Stock registrado en sistema:</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">{stockActual} unidades</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase mb-1">
              Conteo Físico Real (Unidades) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={stockReal}
              onChange={(e) => setStockReal(e.target.value)}
              placeholder="Ingrese el stock contado en estante"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none"
              autoFocus
            />
            {conteoNumerico !== null && !isNaN(conteoNumerico) && (
              <p
                className={`text-xs font-semibold mt-1.5 flex items-center ${
                  diferencia > 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : diferencia < 0
                    ? 'text-rose-700 dark:text-rose-400'
                    : 'text-slate-500 dark:text-neutral-400'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1 inline shrink-0" />
                {diferencia > 0
                  ? `Sobrante: +${diferencia} unidades`
                  : diferencia < 0
                  ? `Faltante: ${diferencia} unidades`
                  : 'Sin diferencia con el sistema (No permitido)'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase mb-1">
              Motivo o Justificación del Ajuste *
            </label>
            <textarea
              required
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Auditoría de inventario físico mensual / Merma por rotura de blíster"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-2 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center space-x-2 transition disabled:opacity-50 cursor-pointer"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Ajustando...</span>
                </>
              ) : (
                <span>Aplicar Ajuste</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
