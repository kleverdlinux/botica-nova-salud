import React, { useState } from 'react';
import { X, SlidersHorizontal, Loader2, AlertTriangle } from 'lucide-react';
import { registrarAjusteApi } from '../api/inventarioApi.js';
import toast from 'react-hot-toast';

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
      toast.error('Debe ingresar un conteo físico válido (0 o mayor).');
      return;
    }

    if (conteoNumerico === stockActual) {
      toast.error('El stock físico es idéntico al stock del sistema. No se requiere ajuste.');
      return;
    }

    if (!motivo.trim()) {
      toast.error('El motivo o justificación del ajuste físico es obligatorio.');
      return;
    }

    setGuardando(true);
    try {
      const res = await registrarAjusteApi({
        productoId: producto.id,
        stockReal: conteoNumerico,
        motivo: motivo.trim()
      });

      toast.success(res.mensaje || `Ajuste aplicado: nuevo stock ${conteoNumerico} unidades.`);
      onCompletado();
      onClose();
    } catch (err) {
      // Muestra el mensaje exacto del servidor (por ejemplo, 400 stock idéntico o 409 stock cambió)
      const msg = err.response?.data?.error || 'Error al procesar el ajuste de inventario.';
      toast.error(msg, { duration: 6000 });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-amber-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-200" />
            <h3 className="font-bold text-base">Ajuste de Inventario Físico</h3>
          </div>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <p><span className="font-bold text-slate-900">Producto:</span> {producto.nombre}</p>
            <p><span className="font-bold text-slate-900">Presentación:</span> {producto.presentacion}</p>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 mt-1">
              <span className="font-bold text-slate-700">Stock registrado en sistema:</span>
              <span className="text-sm font-extrabold text-slate-900">{stockActual} unidades</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Conteo Físico Real (Unidades) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={stockReal}
              onChange={(e) => setStockReal(e.target.value)}
              placeholder="Ingrese el stock contado en estante"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
              autoFocus
            />
            {conteoNumerico !== null && !isNaN(conteoNumerico) && (
              <p
                className={`text-xs font-semibold mt-1.5 flex items-center ${
                  diferencia > 0
                    ? 'text-emerald-700'
                    : diferencia < 0
                    ? 'text-rose-700'
                    : 'text-slate-500'
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
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Motivo o Justificación del Ajuste *
            </label>
            <textarea
              required
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Auditoría de inventario físico mensual / Merma por rotura de blíster"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-600/20 flex items-center space-x-2 transition disabled:opacity-50 cursor-pointer"
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
