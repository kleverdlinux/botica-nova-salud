import React, { useState } from 'react';
import { Printer, CheckCircle, X, ImageIcon, FileText, ChevronDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import { formatearMoneda, formatearFechaHoraLima } from '../utils/formateadores.js';
import { imprimirComprobanteA4 } from '../utils/impresionComprobanteA4.js';
import toast from '../utils/alertaSweet.js';

export default function ModalTicket({ venta, onClose }) {
  const [descargandoImagen, setDescargandoImagen] = useState(false);
  const [menuA4Abierto, setMenuA4Abierto] = useState(false);

  if (!venta) return null;

  // Clasificación tributaria SUNAT (según longitud del documento del cliente):
  // RUC (11 dígitos): Factura Electrónica
  // DNI (8 dígitos) o sin documento: Boleta de Venta Electrónica
  const docLimpio = String(venta.clienteDoc || '').trim();
  const esFactura = docLimpio.length === 11;
  const tipoComprobante = esFactura ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA';
  const etiquetaDoc = esFactura ? 'RUC:' : docLimpio.length === 8 ? 'DNI:' : 'DOC:';
  const etiquetaCliente = esFactura ? 'RAZÓN SOCIAL:' : 'CLIENTE:';

  const totalServidor = Number(venta.total) || 0;
  const subtotalNeto = totalServidor / 1.18;
  const igvCalculado = totalServidor - subtotalNeto;
  const detalles = venta.detalles || [];

  // Imprimir en ticketera térmica (80 mm)
  const handleImprimirTicket = () => {
    window.print();
  };

  // Imprimir o Guardar en PDF tamaño A4 formal (Vertical u Horizontal)
  const handleImprimirA4 = (orientacion = 'portrait') => {
    setMenuA4Abierto(false);
    imprimirComprobanteA4({ venta, esFactura, orientacion });
  };

  // Descargar imagen completa PNG sin recortes (captura al 100% todo el contenido)
  const handleDescargarImagen = async () => {
    const elementoTicket = document.getElementById('ticket-termico');
    if (!elementoTicket) return;

    setDescargandoImagen(true);
    try {
      // Para evitar que el scroll vertical de la ventana corte el ticket por la mitad,
      // se clona temporalmente fuera de pantalla sin restricciones de altura ni scroll
      const clone = elementoTicket.cloneNode(true);
      clone.id = 'ticket-termico-capture-clone';
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '330px';
      clone.style.maxWidth = '330px';
      clone.style.height = 'auto';
      clone.style.maxHeight = 'none';
      clone.style.overflow = 'visible';
      clone.style.boxShadow = 'none';
      clone.style.borderRadius = '16px';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        scrollY: 0,
        scrollX: 0
      });

      document.body.removeChild(clone);

      const dataUrl = canvas.toDataURL('image/png');
      const enlace = document.createElement('a');
      const ticketId = venta.ticket || `T-${String(venta.id).padStart(6, '0')}`;
      const nombreArchivo = `${esFactura ? 'Factura' : 'Boleta'}_${ticketId}_NovaSalud.png`;
      enlace.download = nombreArchivo;
      enlace.href = dataUrl;
      enlace.click();
      toast.success('Comprobante completo descargado como imagen PNG.');
    } catch (err) {
      console.error('Error generando imagen del ticket:', err);
      toast.error('No se pudo generar la imagen del comprobante.');
    } finally {
      setDescargandoImagen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Contenedor del Modal en Pantalla */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col font-sans">
        {/* Cabecera del Modal */}
        <div className="bg-teal-600 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <CheckCircle className="w-5 h-5 text-teal-200" />
            <div>
              <h3 className="font-bold text-base leading-tight">¡Venta Registrada Exitosamente!</h3>
              <p className="text-[11px] text-teal-100">Stock descontado en almacén • Kardex actualizado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-100 hover:text-white p-1 rounded-lg hover:bg-teal-700 transition cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vista Previa del Ticket Térmico */}
        <div className="py-6 px-4 bg-slate-100 dark:bg-neutral-950 max-h-[66vh] overflow-y-auto flex flex-col items-center">
          <div
            id="ticket-termico"
            className="w-[320px] max-w-full bg-white p-5 pb-8 text-black font-mono text-xs shadow-md border border-slate-300 rounded-2xl leading-relaxed select-none box-border"
          >
            {/* Encabezado */}
            <div className="text-center pb-2.5 border-b border-dashed border-black">
              <h2 className="text-base font-black tracking-tight uppercase">Botica Nova Salud</h2>
              <p className="text-[10px] font-semibold text-slate-800">R.U.C. 20100055231</p>
              <p className="text-[10px] text-slate-700">Jr. Huancavelica 450 - Lima, Perú</p>
              <p className="text-[10px] text-slate-700">Central Telefónica: (01) 445-8920</p>
              <div className="mt-1 pt-1 border-t border-dotted border-black/40">
                <span className="font-black text-[11px] tracking-wider uppercase bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300">
                  {tipoComprobante}
                </span>
              </div>
            </div>

            {/* Metadatos */}
            <div className="py-2.5 text-[11px] border-b border-dashed border-black space-y-0.5">
              <p><span className="font-bold">COMPROBANTE:</span> {venta.ticket || `T-${String(venta.id).padStart(6, '0')}`}</p>
              <p><span className="font-bold">FECHA / HORA:</span> {formatearFechaHoraLima(venta.createdAt || new Date())}</p>
              <p><span className="font-bold">CAJERO:</span> {venta.usuario?.nombre || 'Cajero Nova Salud'}</p>
              {venta.clienteNom && (
                <p><span className="font-bold">{etiquetaCliente}</span> {venta.clienteNom}</p>
              )}
              {venta.clienteDoc && (
                <p><span className="font-bold">{etiquetaDoc}</span> {venta.clienteDoc}</p>
              )}
              <p><span className="font-bold">FORMA DE PAGO:</span> {venta.metodoPago || 'EFECTIVO'}</p>
            </div>

            {/* Líneas de Productos */}
            <div className="py-2.5 border-b border-dashed border-black">
              <table className="w-full text-[10px] text-left">
                <thead>
                  <tr className="border-b border-black text-slate-900 font-bold">
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
                        <td className="py-1 font-bold text-slate-900">{cant}</td>
                        <td className="py-1 pr-1 truncate max-w-[130px] font-medium">{nombreProd}</td>
                        <td className="py-1 text-right whitespace-nowrap">{(Number(pu) || 0).toFixed(2)}</td>
                        <td className="py-1 text-right font-bold whitespace-nowrap">{(Number(sub) || 0).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Resumen de Montos con Desglose */}
            <div className="pt-2.5 text-[11px] border-b border-dashed border-black pb-2 space-y-0.5">
              <div className="flex justify-between text-slate-700">
                <span>SUBTOTAL NETO:</span>
                <span className="font-mono">{formatearMoneda(subtotalNeto)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>I.G.V. (18% SUNAT):</span>
                <span className="font-mono">{formatearMoneda(igvCalculado)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black border-t border-black pt-1 mt-1 text-black">
                <span>TOTAL A PAGAR:</span>
                <span className="font-mono text-base">{formatearMoneda(totalServidor)}</span>
              </div>
            </div>

            {/* Leyendas Obligatorias y Agradecimiento */}
            <div className="pt-3 pb-1 text-center text-[10px] text-slate-700 space-y-1">
              <p className="font-black uppercase tracking-wider text-[10px]">*** {tipoComprobante} ***</p>
              <p className="italic text-[9px] text-slate-600">Representación impresa del comprobante electrónico</p>
              <p className="text-[9px] text-slate-500 pt-0.5">
                Botica Nova Salud • Sistema de Control y Dispensación
              </p>
              <p className="pt-0.5 text-[10px] font-bold text-slate-900">
                ¡Gracias por cuidar su salud con nosotros!
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Acciones */}
        <div className="p-4 bg-white dark:bg-neutral-900 border-t border-slate-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            Nueva Venta
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Botón de Descargar como Imagen PNG (Completo al 100% para WhatsApp) */}
            <button
              type="button"
              onClick={handleDescargarImagen}
              disabled={descargandoImagen}
              className="px-3 py-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
              title="Descargar imagen PNG completa nítida para enviar al WhatsApp del cliente"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{descargandoImagen ? 'Generando...' : 'Descargar Imagen'}</span>
            </button>

            {/* 2. Menú Desplegable: PDF A4 / A5 Formal SUNAT */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuA4Abierto(!menuA4Abierto)}
                className="px-3 py-2 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                title="Generar Boleta o Factura en PDF formal institucional A4/A5"
              >
                <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>PDF Formal</span>
                <ChevronDown className="w-3 h-3 text-purple-500 dark:text-purple-400 ml-0.5" />
              </button>

              {menuA4Abierto && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xl py-1 z-20 font-sans text-xs animate-in fade-in slide-in-from-bottom-2 duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider border-b border-slate-100 dark:border-neutral-800">
                    Formato Oficial SUNAT
                  </div>
                  <button
                    type="button"
                    onClick={() => handleImprimirA4('portrait')}
                    className="w-full text-left px-3 py-2 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-purple-700 dark:hover:text-purple-300 text-slate-700 dark:text-neutral-200 font-semibold transition cursor-pointer flex items-center space-x-2"
                  >
                    <span>📄 A4 Vertical (Estándar SUNAT)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImprimirA4('landscape')}
                    className="w-full text-left px-3 py-2 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-purple-700 dark:hover:text-purple-300 text-slate-700 dark:text-neutral-200 font-semibold transition cursor-pointer flex items-center space-x-2 border-t border-slate-100 dark:border-neutral-800"
                  >
                    <span>📑 A5 Horizontal (Media Hoja)</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Botón de Imprimir Ticketera Térmica (80 mm) */}
            <button
              type="button"
              onClick={handleImprimirTicket}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-md shadow-teal-600/20 transition cursor-pointer"
              title="Imprimir en ticketera térmica de mostrador (80 mm)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Ticket 80mm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
