import React, { useState } from 'react';
import { X, ArrowDownRight, Loader2 } from 'lucide-react';
import { registrarEntradaApi } from '../api/inventarioApi.js';
import toast from 'react-hot-toast';

export default function ModalEntrada({ producto, onClose, onCompletado }) {
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cant = parseInt(cantidad, 10);
    if (!cant || cant <= 0) {
      toast.error('La cantidad a ingresar debe ser mayor a 0.');
      return;
    }

    if (!motivo.trim()) {
      toast.error('El motivo o justificación de la entrada es obligatorio.');
      return;
    }

    setGuardando(true);
    try {
      const res = await registrarEntradaApi({
        productoId: producto.id,
        cantidad: cant,
        motivo: motivo.trim()
      });

      toast.success(res.mensaje || `Ingreso de ${cant} unidades registrado con éxito.`);
      onCompletado();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al registrar la entrada de inventario.';
      toast.error(msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowDownRight className="w-5 h-5 text-emerald-200" />
            <h3 className="font-bold text-base">Registrar Entrada de Stock</h3>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <p><span className="font-bold text-slate-900">Producto:</span> {producto.nombre}</p>
            <p><span className="font-bold text-slate-900">Presentación:</span> {producto.presentacion}</p>
            <p><span className="font-bold text-slate-900">Stock actual en sistema:</span> <strong className="text-emerald-700">{producto.stock} unidades</strong></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Cantidad a Ingresar *
            </label>
            <input
              type="number"
              min="1"
              required
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ej. 20"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Motivo o Documento de Compra *
            </label>
            <textarea
              required
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Compra según Factura F001-9821 de Droguería Central"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition disabled:opacity-50 cursor-pointer"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <span>Confirmar Entrada</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
