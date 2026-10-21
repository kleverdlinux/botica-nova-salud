import React from 'react';
import { Printer, CheckCircle, X } from 'lucide-react';
import { formatearMoneda, formatearFechaHoraLima } from '../utils/formateadores.js';

export default function ModalTicket({ venta, onClose }) {
  if (!venta) return null;

  const handleImprimir = () => {
    window.print();
  };

  const totalServidor = Number(venta.total);
  const detalles = venta.detalles || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Contenedor del Modal en Pantalla (oculto durante la impresión real) */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera del Modal */}
        <div className="bg-brand-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-brand-200" />
            <h3 className="font-semibold text-lg">¡Venta Registrada!</h3>
          </div>
          <button
            onClick={onClose}
            className="text-brand-100 hover:text-white p-1 rounded-lg hover:bg-brand-700 transition"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vista Previa del Ticket Térmico de 80mm */}
        <div className="p-6 bg-slate-100 max-h-[65vh] overflow-y-auto flex justify-center">
          <div
            id="ticket-termico"
            className="w-[80mm] bg-white p-4 text-black font-mono text-xs shadow-md border border-slate-300 rounded leading-relaxed select-none"
          >
            {/* Encabezado */}
            <div className="text-center pb-2 border-b border-dashed border-black">
              <h2 className="text-base font-bold tracking-tight uppercase">Botica Nova Salud</h2>
              <p className="text-[10px]">RUC: 20100055231</p>
              <p className="text-[10px]">Jr. Huancavelica 450 - Lima</p>
              <p className="text-[10px]">Teléfono: (01) 445-8920</p>
            </div>

            {/* Metadatos */}
            <div className="py-2 text-[11px] border-b border-dashed border-black space-y-0.5">
              <p><span className="font-bold">TICKET:</span> {venta.ticket || `T-${String(venta.id).padStart(6, '0')}`}</p>
              <p><span className="font-bold">FECHA:</span> {formatearFechaHoraLima(venta.createdAt || new Date())}</p>
              <p><span className="font-bold">CAJERO:</span> {venta.usuario?.nombre || 'Cajero Nova Salud'}</p>
              {venta.clienteNom && (
                <p><span className="font-bold">CLIENTE:</span> {venta.clienteNom}</p>
              )}
              {venta.clienteDoc && (
                <p><span className="font-bold">DOC:</span> {venta.clienteDoc}</p>
              )}
              <p><span className="font-bold">PAGO:</span> {venta.metodoPago || 'EFECTIVO'}</p>
            </div>

            {/* Líneas de Productos */}
            <div className="py-2 border-b border-dashed border-black">
              <table className="w-full text-[10px] text-left">
                <thead>
                  <tr className="border-b border-black">
                    <th className="pb-1 w-6">CANT</th>
                    <th className="pb-1">DESCRIPCIÓN</th>
                    <th className="pb-1 text-right">P.U.</th>
                    <th className="pb-1 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dotted divide-slate-300">
                  {detalles.map((d, idx) => {
                    const cant = Number(d.cantidad);
                    const pu = Number(d.precioUnitario);
                    const sub = Number(d.subtotal || pu * cant);
                    const nombreProd = d.producto?.nombre || `Prod. #${d.productoId}`;
                    return (
                      <tr key={idx} className="align-top">
                        <td className="py-1 font-bold">{cant}</td>
                        <td className="py-1 pr-1 truncate max-w-[120px]">{nombreProd}</td>
                        <td className="py-1 text-right whitespace-nowrap">{pu.toFixed(2)}</td>
                        <td className="py-1 text-right font-semibold whitespace-nowrap">{sub.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total Cobrado */}
            <div className="pt-2 text-right space-y-1">
              <div className="flex justify-between items-center text-sm font-bold border-t border-black pt-1">
                <span>TOTAL A PAGAR:</span>
                <span>{formatearMoneda(totalServidor)}</span>
              </div>
            </div>

            {/* Leyendas Obligatorias */}
            <div className="pt-4 text-center text-[9px] text-slate-700 space-y-1 border-t border-dashed border-black mt-3">
              <p className="font-bold uppercase tracking-wider">*** TICKET INTERNO ***</p>
              <p className="italic">No es comprobante de pago electrónico (SUNAT).</p>
              <p className="text-[8px] text-slate-500 pt-1">
                Datos de demostración para fines académicos (SENATI PIAD-527).
              </p>
              <p className="pt-1">¡Gracias por cuidar su salud con nosotros!</p>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
          >
            Nueva Venta
          </button>
          <button
            type="button"
            onClick={handleImprimir}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium flex items-center space-x-2 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket (80mm)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
