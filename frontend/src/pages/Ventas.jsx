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
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { listarVentasApi, obtenerVentaPorIdApi } from '../api/ventasApi.js';
import { formatearMoneda, formatearFechaHoraLima } from '../utils/formateadores.js';
import ModalTicket from '../components/ModalTicket.jsx';
import toast from 'react-hot-toast';

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
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <Banknote className="w-3.5 h-3.5" />
            <span>Efectivo</span>
          </span>
        );
      case 'YAPE_PLIN':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Yape / Plin</span>
          </span>
        );
      case 'TARJETA':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Tarjeta</span>
          </span>
        );
      default:
        return <span className="text-xs font-semibold">{metodo}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <ReceiptText className="w-7 h-7 text-brand-600" />
            <span>Historial de Ventas</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {esAdmin
              ? 'Listado histórico completo de transacciones emitidas en Botica Nova Salud'
              : 'Tus ventas emitidas durante el turno de hoy en horario oficial Lima'}
          </p>
        </div>
      </div>

      {/* Tabla de Ventas Paginada */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
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
            <tbody className="divide-y divide-slate-100 bg-white">
              {cargando ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-2" />
                    <p className="text-sm font-medium">Cargando ventas...</p>
                  </td>
                </tr>
              ) : ventas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <ReceiptText className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-600">No hay ventas registradas</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {esAdmin
                        ? 'Aún no se han completado transacciones en el sistema.'
                        : 'No has realizado ventas hoy en tu turno.'}
                    </p>
                  </td>
                </tr>
              ) : (
                ventas.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition">
                    {/* Ticket */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200">
                        {v.ticket || `T-${String(v.id).padStart(6, '0')}`}
                      </span>
                    </td>

                    {/* Fecha y Hora Lima */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-700 font-medium">
                      {formatearFechaHoraLima(v.createdAt)}
                    </td>

                    {/* Cajero */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                      {v.usuario?.nombre || 'Cajero'}
                    </td>

                    {/* Cliente */}
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                      {v.clienteNom || 'Cliente General'}
                      {v.clienteDoc && <span className="text-[10px] text-slate-400 block font-mono">Doc: {v.clienteDoc}</span>}
                    </td>

                    {/* Método de Pago */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {renderBadgeMetodo(v.metodoPago)}
                    </td>

                    {/* Total */}
                    <td className="px-5 py-3.5 text-right font-black text-slate-900 text-sm whitespace-nowrap">
                      {formatearMoneda(v.total)}
                    </td>

                    {/* Acción: Ver / Reimprimir */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleVerDetalle(v.id)}
                        disabled={cargandoDetalleId === v.id}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs inline-flex items-center space-x-1.5 transition cursor-pointer"
                        title="Ver detalle y reimprimir ticket"
                      >
                        {cargandoDetalleId === v.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Printer className="w-3.5 h-3.5 text-brand-600" />
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
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Mostrando página <strong className="text-slate-900">{paginaActual}</strong> de{' '}
            <strong className="text-slate-900">{totalPaginas || 1}</strong> (Total: {total} transacciones)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => cargarVentas(paginaActual - 1)}
              disabled={paginaActual <= 1 || cargando}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
            <button
              onClick={() => cargarVentas(paginaActual + 1)}
              disabled={paginaActual >= totalPaginas || cargando}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
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
