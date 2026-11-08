import React, { useState, useEffect, useCallback } from 'react';
import {
  ReceiptText,
  Printer,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { listarVentasApi, obtenerVentaPorIdApi } from '../api/ventasApi.js';
import { formatearMoneda, formatearFechaHoraLima } from '../utils/formateadores.js';
import { exportToCSV, printProfessionalReport } from '../utils/exportUtils.ts';
import ModalTicket from '../components/ModalTicket.jsx';
import toast, { notificarExito, notificarError } from '../utils/alertaSweet.js';

export default function Ventas() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMIN';

  const [ventas, setVentas] = useState([]);
  const [total, setTotal] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);

  // Venta seleccionada para ver detalle y reimprimir
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [cargandoDetalleId, setCargandoDetalleId] = useState(null);

  const cargarVentas = useCallback(async (p = 1) => {
    setCargando(true);
    try {
      const data = await listarVentasApi({ page: p, limit: 20 });
      setVentas(data.ventas || []);
      setTotal(data.total || 0);
      setPaginaActual(data.paginaActual || 1);
      setTotalPaginas(data.totalPaginas || 1);
    } catch (err) {
      console.error('Error al cargar ventas:', err);
      toast.error('No se pudo cargar el historial de ventas.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarVentas(1);
    const handleNewOrder = () => {
      cargarVentas(1);
    };
    window.addEventListener('new-order-placed', handleNewOrder);
    return () => window.removeEventListener('new-order-placed', handleNewOrder);
  }, [cargarVentas]);

  const handleVerDetalle = async (id) => {
    setCargandoDetalleId(id);
    try {
      const ventaCompleta = await obtenerVentaPorIdApi(id);
      setVentaSeleccionada(ventaCompleta);
    } catch (err) {
      console.error('Error al obtener detalle de la venta:', err);
      const msg = err.response?.data?.error || 'Error al obtener detalle de venta.';
      toast.error(msg);
    } finally {
      setCargandoDetalleId(null);
    }
  };

  const renderBadgeMetodo = (metodo) => {
    switch (metodo) {
      case 'EFECTIVO':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Banknote className="w-3.5 h-3.5" />
            <span>Efectivo</span>
          </span>
        );
      case 'YAPE_PLIN':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Yape / Plin</span>
          </span>
        );
      case 'TARJETA':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Tarjeta</span>
          </span>
        );
      default:
        return <span className="text-xs font-semibold text-slate-800 dark:text-neutral-200">{metodo}</span>;
    }
  };

  const handleExportVentasExcel = () => {
    if (!ventas || ventas.length === 0) {
      toast.error('No hay ventas registradas para exportar.');
      return;
    }
    const headers = ['N° Comprobante', 'Fecha y Hora', 'Cajero / Usuario', 'Cliente Doc', 'Cliente Nombre', 'Método de Pago', 'Total (S/)'];
    const rows = ventas.map(v => [
      `T-${String(v.id).padStart(6, '0')}`,
      formatearFechaHoraLima(v.createdAt),
      v.usuario?.nombre || 'Personal Botica',
      v.clienteDoc || 'Público General',
      v.clienteNom || 'Cliente Mostrador',
      v.metodoPago,
      (Number(v.total) || 0).toFixed(2),
    ]);
    exportToCSV(`ventas_novasalud_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    toast.success('Historial de ventas exportado a Excel.');
  };

  const handlePrintVentasPDF = () => {
    if (!ventas || ventas.length === 0) {
      toast.error('No hay ventas registradas para imprimir.');
      return;
    }
    const sumaTotal = ventas.reduce((acc, v) => acc + Number(v.total), 0);
    printProfessionalReport({
      title: 'Reporte Oficial de Ventas y Comprobantes Emitidos',
      subtitle: 'Registro Diario de Transacciones de Botica Nova Salud',
      metaInfo: [
        { label: 'Total Ventas Listadas', value: `${ventas.length} transacciones` },
        { label: 'Fecha de Reporte', value: new Date().toLocaleDateString('es-PE') },
        { label: 'Generado por', value: usuario?.nombre || 'Administración' },
      ],
      columns: [
        { header: 'Ticket', width: '80px' },
        { header: 'Fecha y Hora' },
        { header: 'Cliente / Documento' },
        { header: 'Método', width: '90px' },
        { header: 'Total (S/)', width: '90px' },
      ],
      rows: ventas.map(v => [
        `T-${String(v.id).padStart(6, '0')}`,
        formatearFechaHoraLima(v.createdAt),
        `${v.clienteNom || 'Cliente'} (${v.clienteDoc || '-'})`,
        v.metodoPago,
        formatearMoneda(Number(v.total)),
      ]),
      totals: [
        { label: 'Total Recaudado en Lote', value: formatearMoneda(sumaTotal) },
        { label: 'Base Imponible (82%)', value: formatearMoneda(sumaTotal / 1.18) },
        { label: 'I.G.V. Total (18%)', value: formatearMoneda(sumaTotal - sumaTotal / 1.18) },
      ],
    });
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <ReceiptText className="w-7 h-7 text-[#0d9488] dark:text-teal-400" />
            <span>Historial de Ventas</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            {esAdmin
              ? 'Listado histórico completo de transacciones emitidas en Botica Nova Salud'
              : 'Tus ventas emitidas durante el turno de hoy en horario oficial Perú'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botón Excel */}
          <button
            onClick={handleExportVentasExcel}
            className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold shadow-2xs flex items-center space-x-1.5 transition cursor-pointer"
            title="Exportar ventas a Excel (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Excel (.csv)</span>
          </button>

          {/* Botón PDF */}
          <button
            onClick={handlePrintVentasPDF}
            className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold shadow-2xs flex items-center space-x-1.5 transition cursor-pointer"
            title="Imprimir reporte oficial de ventas en PDF"
          >
            <Printer className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Reporte PDF</span>
          </button>
        </div>
      </div>

      {/* Tabla de Ventas Paginada */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-neutral-800">
            <thead className="bg-slate-50 dark:bg-neutral-950 text-slate-700 dark:text-neutral-300 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Ticket</th>
                <th className="px-5 py-3.5">Fecha y Hora (Lima)</th>
                <th className="px-5 py-3.5">Cajero / Responsable</th>
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">Método de Pago</th>
                <th className="px-5 py-3.5 text-right">Total Cobrado</th>
                <th className="px-5 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60 bg-white dark:bg-neutral-900">
              {cargando ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500 dark:text-neutral-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0d9488] dark:text-teal-400 mb-2" />
                    <p className="text-sm font-medium">Cargando ventas...</p>
                  </td>
                </tr>
              ) : ventas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 dark:text-neutral-500">
                    <ReceiptText className="w-12 h-12 mx-auto stroke-1 text-slate-300 dark:text-neutral-600 mb-2" />
                    <p className="text-sm font-medium text-slate-600 dark:text-neutral-300">No hay ventas registradas</p>
                    <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">
                      {esAdmin
                        ? 'Aún no se han completado transacciones en el sistema.'
                        : 'No has realizado ventas hoy en tu turno.'}
                    </p>
                  </td>
                </tr>
              ) : (
                ventas.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition">
                    {/* Ticket */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md text-xs border border-slate-200 dark:border-neutral-700">
                        {v.ticket || `T-${String(v.id).padStart(6, '0')}`}
                      </span>
                    </td>

                    {/* Fecha y Hora Lima */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-700 dark:text-neutral-300 font-medium">
                      {formatearFechaHoraLima(v.createdAt)}
                    </td>

                    {/* Cajero */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 dark:text-neutral-400 font-medium">
                      {v.usuario?.nombre || 'Cajero'}
                    </td>

                    {/* Cliente */}
                    <td className="px-5 py-3.5 text-slate-600 dark:text-neutral-300 max-w-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {v.clienteNom?.replace(/\s*\[Web Delivery.*?\]/g, '') || 'Cliente General'}
                        </span>
                        {v.clienteNom?.includes('Web Delivery') && (
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            Tienda Web
                          </span>
                        )}
                      </div>
                      {v.clienteDoc && (
                        <span className="text-[10px] text-slate-400 dark:text-neutral-500 block font-mono">
                          Doc: {v.clienteDoc}
                        </span>
                      )}
                    </td>

                    {/* Método de Pago */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {renderBadgeMetodo(v.metodoPago)}
                    </td>

                    {/* Total */}
                    <td className="px-5 py-3.5 text-right font-black text-slate-900 dark:text-white text-sm whitespace-nowrap font-mono">
                      {formatearMoneda(v.total)}
                    </td>

                    {/* Acción: Ver / Reimprimir */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleVerDetalle(v.id)}
                        disabled={cargandoDetalleId === v.id}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 font-bold rounded-lg text-xs inline-flex items-center space-x-1.5 transition cursor-pointer border border-slate-200 dark:border-neutral-700"
                        title="Ver detalle y reimprimir ticket"
                      >
                        {cargandoDetalleId === v.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0d9488]" />
                        ) : (
                          <Printer className="w-3.5 h-3.5 text-[#0d9488] dark:text-teal-400" />
                        )}
                        <span>Ticket</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-neutral-400">
          <div>
            Mostrando página <strong className="text-slate-900 dark:text-white font-mono">{paginaActual}</strong> de{' '}
            <strong className="text-slate-900 dark:text-white font-mono">{totalPaginas || 1}</strong> (Total: {total} transacciones)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => cargarVentas(paginaActual - 1)}
              disabled={paginaActual <= 1 || cargando}
              className="px-3 py-1.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
            <button
              onClick={() => cargarVentas(paginaActual + 1)}
              disabled={paginaActual >= totalPaginas || cargando}
              className="px-3 py-1.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Reutilizado para Reimprimir Ticket Térmico 80mm */}
      {ventaSeleccionada && (
        <ModalTicket
          venta={ventaSeleccionada}
          onClose={() => setVentaSeleccionada(null)}
        />
      )}
    </div>
  );
}

