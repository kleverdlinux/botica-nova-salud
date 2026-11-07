import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  Printer,
  Download,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  X,
  ExternalLink,
  Clock,
  MapPin,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { CustomerOrder } from '@/utils/orderStorage';

interface BoletaModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: CustomerOrder | null;
}

/**
 * Obtiene la fecha de emisión en formato YYYY-MM-DD para el QR oficial SUNAT,
 * garantizando sincronización exacta con la hora local de Perú (America/Lima / UTC-5)
 * y con la fecha textual visible impresa en el comprobante.
 */
function obtenerFechaSunat(fechaDirecta?: string, orderDate?: string, orderTimestamp?: number): string {
  // 1. Si ya tiene fechaSunat en formato YYYY-MM-DD
  if (fechaDirecta && /^\d{4}-\d{2}-\d{2}$/.test(fechaDirecta.trim())) {
    return fechaDirecta.trim();
  }

  // 2. Extraer de la cadena textual de la boleta (order.date) para que coincida exactamente con lo impreso
  if (orderDate) {
    const meses: Record<string, string> = {
      enero: '01',
      febrero: '02',
      marzo: '03',
      abril: '04',
      mayo: '05',
      junio: '06',
      julio: '07',
      agosto: '08',
      septiembre: '09',
      setiembre: '09',
      octubre: '10',
      noviembre: '11',
      diciembre: '12',
    };

    // Caso español: "viernes, 6 de noviembre de 2026, 8:31 p. m." o "6 de noviembre de 2026"
    const matchEspanol = orderDate.toLowerCase().match(/(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})/);
    if (matchEspanol) {
      const dia = matchEspanol[1].padStart(2, '0');
      const mes = meses[matchEspanol[2]];
      const anio = matchEspanol[3];
      if (mes) return `${anio}-${mes}-${dia}`;
    }

    // Caso dd/mm/yyyy o dd-mm-yyyy
    const matchNumerico = orderDate.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (matchNumerico) {
      const dia = matchNumerico[1].padStart(2, '0');
      const mes = matchNumerico[2].padStart(2, '0');
      const anio = matchNumerico[3];
      return `${anio}-${mes}-${dia}`;
    }

    // Caso yyyy-mm-dd
    const matchIso = orderDate.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{2})/);
    if (matchIso) {
      return `${matchIso[1]}-${matchIso[2]}-${matchIso[3]}`;
    }
  }

  // 3. Respaldo por timestamp en zona horaria oficial de Perú (America/Lima)
  const d = orderTimestamp ? new Date(orderTimestamp) : new Date();
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(d);
  } catch {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export const BoletaModal: React.FC<BoletaModalProps> = ({ isOpen, onClose, order }) => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isQrZoomed, setIsQrZoomed] = useState(false);
  const [fechaSunatStr, setFechaSunatStr] = useState<string>('');
  const [cadenaSunatStr, setCadenaSunatStr] = useState<string>('');

  // Generación en vivo de código QR oficial bajo normativa SUNAT
  useEffect(() => {
    if (!order) return;

    try {
      const rucEmisor = '20601234567';
      const esFactura =
        order.tipoComprobante === 'FACTURA' || order.serieNumero?.startsWith('F');
      const tipoDocSunat = esFactura ? '01' : '03';
      const partesSerie = (order.serieNumero || 'B001-00004521').split('-');
      const serie = partesSerie[0] || (esFactura ? 'F001' : 'B001');
      const correlativo = partesSerie[1] || '00004521';

      const totalNum = Number(order.total) || 0;
      const subtotalNum = Number(order.subtotal) || totalNum;
      const igvNum = Number(((subtotalNum * 0.18) / 1.18).toFixed(2));

      // Sincronizar fecha exacta con hora peruana (America/Lima / UTC-5)
      const fechaIso = obtenerFechaSunat(order.fechaSunat, order.date, order.timestamp);
      setFechaSunatStr(fechaIso);

      const tipoDocCliente = esFactura ? '6' : '1';
      const numDocCliente = esFactura
        ? order.customer.ruc || '20000000001'
        : order.customer.dni || '00000000';
      const codigoHash = 'e9a4f210d7a6b890f5c1';

      // Cadena oficial de representación impresa SUNAT:
      // RUC|TIPO_DOC|SERIE|NUMERO|MTO_IGV|MTO_TOTAL|FECHA|TIPO_DOC_CLIENTE|NUM_DOC_CLIENTE|HASH|
      const cadenaSunat = `${rucEmisor}|${tipoDocSunat}|${serie}|${correlativo}|${igvNum.toFixed(
        2
      )}|${totalNum.toFixed(2)}|${fechaIso}|${tipoDocCliente}|${numDocCliente}|${codigoHash}|`;
      setCadenaSunatStr(cadenaSunat);

      // Generar a 500px de alta resolución y nivel de corrección 'L' para módulos más grandes y máxima legibilidad
      QRCode.toDataURL(cadenaSunat, {
        width: 500,
        margin: 2,
        errorCorrectionLevel: 'L',
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url: string) => setQrCodeUrl(url))
        .catch((err: any) => console.error('Error generando QR SUNAT:', err));
    } catch (e) {
      console.error('Error al construir QR:', e);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleGoToClientPanel = () => {
    onClose();
    navigate('/mi-cuenta', { state: { tab: 'pedidos', highlightOrder: order.id } });
  };

  const esFactura =
    order.tipoComprobante === 'FACTURA' || order.serieNumero?.startsWith('F');

  const whatsappMessage = encodeURIComponent(
    `Hola Botica Nova Salud, confirmo mi pedido con ${
      esFactura ? 'Factura' : 'Boleta'
    } Electrónica ${order.serieNumero} (Pedido ${order.id}) por un total de S/ ${(
      Number(order.total) || 0
    ).toFixed(2)}. Titular: ${
      esFactura && order.customer.razonSocial
        ? order.customer.razonSocial
        : `${order.customer.firstName} ${order.customer.lastName}`
    }.`
  );

  const subtotalNeto = ((Number(order.subtotal) || 0) / 1.18).toFixed(2);
  const igvCalculado = (
    (Number(order.subtotal) || 0) -
    (Number(order.subtotal) || 0) / 1.18
  ).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto sm:overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 print:p-0 print:bg-white"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh] text-[#18181b] animate-in zoom-in-95 duration-200 print:border-none print:shadow-none print:max-w-none print:rounded-none print:max-h-none">
        {/* ========================================================
            HEADER DEL MODAL (Fondo blanco, diseño unificado)
            ======================================================== */}
        <div className="px-5 py-3 border-b border-zinc-100 bg-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0d9488]">
              <CheckCircle2 className="w-4 h-4 text-[#0d9488]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-[#18181b]">
                  ¡Pedido y Pago Confirmados con Éxito!
                </h2>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-[#0d9488] border border-teal-200">
                  SUNAT ELECTRÓNICO
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium">
                Comprobante tributario oficial emitido y guardado en tu panel de cliente
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-black transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* ========================================================
            CUERPO HORIZONTAL EN 2 COLUMNAS (DOCUMENTO + BOTONES DERECHA)
            ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto md:overflow-hidden">
          {/* ====================================================================
              COLUMNA IZQUIERDA (7 u 8 cols): BOLETA / FACTURA FÍSICA AUTÉNTICA
              ==================================================================== */}
          <div
            ref={printRef}
            className="md:col-span-7 lg:col-span-8 p-4 sm:p-5 flex flex-col justify-between space-y-3 bg-white border-b md:border-b-0 md:border-r border-zinc-200 overflow-y-auto print:border-none print:p-8"
          >
            <div className="space-y-3">
              {/* Encabezado de la Boleta / Factura */}
              <div className="grid grid-cols-12 gap-3 items-start pb-3 border-b border-zinc-200">
                {/* Logo & Datos Fiscales Botica */}
                <div className="col-span-7 sm:col-span-7 space-y-0.5">
                  <div className="text-xl font-black tracking-tight text-zinc-950">
                    NOVA<span className="text-[#0d9488] ml-0.5">SALUD</span>
                  </div>
                  <div className="text-[11px] font-extrabold text-zinc-800">
                    BOTICA NOVA SALUD E.I.R.L.
                  </div>
                  <div className="text-[10px] text-zinc-500 leading-tight">
                    Av. Principal 1248, Lima · Perú<br />
                    Central: +51 955 545 561 · farmacia@boticanovasalud.pe<br />
                    Dirección Técnica: Q.F. Regente Colegiada CQFP
                  </div>
                </div>

                {/* Recuadro RUC Oficial SUNAT */}
                <div className="col-span-5 sm:col-span-5 border-2 border-zinc-900 rounded-xl p-2.5 text-center space-y-0.5 bg-zinc-50/60 print:bg-transparent">
                  <div className="font-mono font-bold text-[11px] tracking-wider text-zinc-800">
                    R.U.C. 20601234567
                  </div>
                  <div className="bg-[#0d9488] text-white font-black uppercase py-0.5 text-[10px] rounded tracking-wider">
                    {esFactura ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA'}
                  </div>
                  <div className="font-mono font-black text-xs sm:text-sm tracking-wider text-zinc-950 pt-0.5">
                    {order.serieNumero}
                  </div>
                </div>
              </div>

              {/* Datos del Cliente y Despacho */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-zinc-50/80 border border-zinc-200/90 rounded-xl p-2.5 text-[11px]">
                <div className="space-y-1">
                  <div>
                    <span className="text-zinc-400 block text-[9.5px] uppercase font-extrabold">
                      {esFactura ? 'Razón Social / Empresa:' : 'Señor(a):'}
                    </span>
                    <span className="font-bold text-zinc-900 truncate block">
                      {esFactura && order.customer.razonSocial
                        ? order.customer.razonSocial
                        : `${order.customer.firstName} ${order.customer.lastName}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[9.5px] uppercase font-extrabold">
                      {esFactura ? 'R.U.C. Cliente:' : 'DNI / Documento:'}
                    </span>
                    <span className="font-mono font-bold text-zinc-900">
                      {esFactura && order.customer.ruc
                        ? order.customer.ruc
                        : order.customer.dni}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[9.5px] uppercase font-extrabold">
                      Teléfono de Contacto:
                    </span>
                    <span className="font-mono text-zinc-800">{order.customer.phone}</span>
                  </div>
                </div>

                <div className="space-y-1 sm:border-l sm:border-zinc-200 sm:pl-3">
                  <div>
                    <span className="text-zinc-400 block text-[9.5px] uppercase font-extrabold">
                      Fecha de Emisión:
                    </span>
                    <span className="text-zinc-800">{order.date}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[9.5px] uppercase font-extrabold">
                      Dirección de Entrega:
                    </span>
                    <span className="text-zinc-800 truncate block">
                      {order.customer.address} ({order.customer.district})
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[9.5px] uppercase font-extrabold">
                      Método y Pago:
                    </span>
                    <span className="font-bold text-[#0d9488] truncate block">
                      {order.paymentDetails}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabla de Medicamentos / Ítems */}
              <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-100 text-zinc-700 uppercase font-black text-[9.5px] tracking-wider border-b border-zinc-200">
                      <th className="py-1.5 px-2.5 text-center w-10">Cant.</th>
                      <th className="py-1.5 px-2.5">Descripción del Medicamento / Producto</th>
                      <th className="py-1.5 px-2.5 text-right w-20">P. Unit</th>
                      <th className="py-1.5 px-2.5 text-right w-20">Importe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/80">
                    {order.items.map((item, idx) => (
                      <tr key={`${item.id}-${idx}`} className="hover:bg-zinc-50/50">
                        <td className="py-1.5 px-2.5 text-center font-mono font-bold text-zinc-900 text-[11px]">
                          {item.quantity}
                        </td>
                        <td className="py-1.5 px-2.5">
                          <span className="font-bold text-zinc-900 block text-[11px]">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {item.presentation}
                          </span>
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono text-zinc-600 text-[11px]">
                          S/ {(Number(item.price) || 0).toFixed(2)}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono font-bold text-zinc-900 text-[11px]">
                          S/ {(Number(item.subtotal) || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Liquidación: QR Real SUNAT Ampliado + Totales Tributarios */}
              <div className="grid grid-cols-12 gap-3 items-end pt-1">
                {/* Código QR Real SUNAT de Alta Legibilidad y Tamaño Aumentado */}
                <div className="col-span-12 sm:col-span-7 flex items-center gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                  <div
                    onClick={() => setIsQrZoomed(true)}
                    className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-1 rounded-xl border-2 border-zinc-300 hover:border-[#0d9488] flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition-all group"
                    title="Clic para ampliar código QR"
                  >
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="Código QR Oficial SUNAT"
                        className="w-full h-full object-contain [image-rendering:pixelated] group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-[10px] font-mono">
                        Generando QR...
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 text-[10px] text-zinc-500 min-w-0">
                    <span className="font-black text-zinc-900 uppercase block tracking-tight text-[11px]">
                      Representación Impresa SUNAT
                    </span>
                    <span className="block font-mono text-[9px] text-zinc-700 bg-white px-2 py-0.5 rounded border border-zinc-200 truncate">
                      Hash: e9a4f210d7a6b890f5c1d683
                    </span>
                    <span className="text-[9.5px] text-zinc-500 block leading-tight">
                      Fecha SUNAT: <strong className="text-zinc-800 font-mono font-bold">{fechaSunatStr}</strong> · R.I. SUNAT N° 034-005.
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsQrZoomed(true)}
                      className="text-[9.5px] font-bold text-[#0d9488] hover:underline cursor-pointer flex items-center gap-1 pt-0.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Ver QR en pantalla completa</span>
                    </button>
                  </div>
                </div>

                {/* Resumen de Totales */}
                <div className="col-span-12 sm:col-span-5 bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-zinc-600">
                    <span>Op. Gravada:</span>
                    <span>S/ {subtotalNeto}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>I.G.V. (18%):</span>
                    <span>S/ {igvCalculado}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Delivery Lima:</span>
                    <span className="text-emerald-700 font-bold">
                      {order.shipping === 0
                        ? 'S/ 0.00 (Gratis)'
                        : `S/ ${(Number(order.shipping) || 0).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-black text-zinc-950 border-t border-zinc-300 pt-1 font-sans">
                    <span>IMPORTE TOTAL:</span>
                    <span className="text-[#0d9488] font-mono text-sm">
                      S/ {(Number(order.total) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje de Atención Farmacéutica Footer */}
            <div className="border-t border-dashed border-zinc-200 pt-2 text-center text-[9.5px] text-zinc-400">
              ¡Gracias por confiar tu salud en Botica Nova Salud! Central: +51 955 545 561
            </div>
          </div>

          {/* ====================================================================
              COLUMNA DERECHA (5 ó 4 cols): PANEL LATERAL DE ACCIONES Y REDIRECCIÓN
              ==================================================================== */}
          <div className="md:col-span-5 lg:col-span-4 p-4 sm:p-5 flex flex-col justify-between space-y-3.5 bg-zinc-50/80 print:hidden">
            <div className="space-y-3.5">
              {/* Tarjeta de Estado y Despacho */}
              <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-zinc-900 uppercase tracking-tight">
                    Pedido en Preparación
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-tight">
                  Tus medicamentos ya se encuentran precintados en nuestro tópico central para despacho exprés.
                </p>

                <div className="pt-2 border-t border-zinc-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span className="text-[11px]">Código Pedido:</span>
                    <strong className="font-mono text-zinc-900">{order.id}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span className="text-[11px]">Comprobante:</span>
                    <strong className="font-mono text-[#0d9488]">{order.serieNumero}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span className="text-[11px]">Despacho Lima:</span>
                    <span className="font-bold text-zinc-800 text-[11px]">
                      {order.customer.district || 'Lima Cercado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción Agrupados al Lado Derecho */}
              <div className="space-y-2 pt-1">
                {/* 1. Botón Principal: Ver en Mi Panel de Cliente */}
                <button
                  type="button"
                  onClick={handleGoToClientPanel}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] active:scale-[0.99] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-teal-700/20"
                >
                  <span>Ver en Mi Panel de Cliente</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 2. Botón Imprimir / PDF */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-100 active:scale-[0.99] text-zinc-800 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <Printer className="w-4 h-4 text-[#0d9488]" />
                  <span>Imprimir Comprobante</span>
                </button>

                {/* 3. Botón Enviar a WhatsApp */}
                <a
                  href={`https://wa.me/51955545561?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  <span>Compartir por WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Pie de Panel Derecho */}
            <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Garantía DIGEMID</span>
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-500 hover:text-black font-bold uppercase text-[10px] cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Zoom para Código QR Oficial SUNAT */}
      {isQrZoomed && (
        <div
          className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsQrZoomed(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-zinc-200 text-center space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <span className="text-xs font-black uppercase text-zinc-900 tracking-wider">
                Código QR Oficial SUNAT
              </span>
              <button
                type="button"
                onClick={() => setIsQrZoomed(false)}
                className="p-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-black transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-64 h-64 mx-auto bg-white p-2 rounded-2xl border-2 border-zinc-900 shadow-md flex items-center justify-center">
              {qrCodeUrl && (
                <img
                  src={qrCodeUrl}
                  alt="QR Oficial SUNAT Ampliado"
                  className="w-full h-full object-contain [image-rendering:pixelated]"
                />
              )}
            </div>

            <div className="space-y-2 text-xs text-zinc-600">
              <p className="font-mono font-bold text-zinc-900">{order.serieNumero}</p>

              <div className="bg-zinc-50 rounded-xl p-2.5 text-left font-mono text-[11px] text-zinc-700 border border-zinc-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Fecha Emisión SUNAT:</span>
                  <span className="font-bold text-zinc-900">{fechaSunatStr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total a Pagar:</span>
                  <span className="font-bold text-[#0d9488]">S/ {(Number(order.total) || 0).toFixed(2)}</span>
                </div>
                <div className="pt-1.5 border-t border-zinc-200">
                  <span className="text-zinc-400 block text-[9.5px]">Contenido QR oficial:</span>
                  <p className="text-[9.5px] text-zinc-800 break-all select-all font-mono bg-white p-1.5 rounded border border-zinc-200 mt-0.5 leading-snug">
                    {cadenaSunatStr}
                  </p>
                </div>
              </div>

              <p className="text-[10.5px] text-zinc-500 pt-0.5">
                Escanea con la cámara de tu teléfono móvil o con la app de SUNAT. La fecha coincide exactamente con el comprobante de pago emitido.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsQrZoomed(false)}
              className="w-full py-2.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md shadow-teal-700/20"
            >
              Volver al Comprobante
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoletaModal;
