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
  FileSpreadsheet,
  Truck,
  CheckCircle2,
  Clock,
  PackageCheck,
  AlertCircle,
  MapPin,
  Phone,
  MessageCircle,
  RefreshCw,
  ShoppingBag,
  Search,
  X,
  Filter
} from 'lucide-react';
import { SkeletonTableRow } from '../components/ui/skeleton.tsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  listarVentasApi,
  obtenerVentaPorIdApi,
  actualizarEstadoPedidoDeliveryApi,
  listarPedidosDeliveryApi
} from '../api/ventasApi.js';
import { formatearMoneda, formatearFechaHoraLima } from '../utils/formateadores.js';
import { exportToCSV, printProfessionalReport } from '../utils/exportUtils.ts';
import ModalTicket from '../components/ModalTicket.jsx';
import toast, { notificarExito, notificarError } from '../utils/alertaSweet.js';

export default function Ventas() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMIN';

  const [tabActiva, setTabActiva] = useState('todas'); // 'todas' | 'delivery'
  const [ventas, setVentas] = useState([]);
  const [total, setTotal] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);

  // Filtros Avanzados para Historial de Ventas
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('TODAS'); // 'TODAS' | 'HOY' | 'AYER' | '7DIAS' | 'MES'
  const [filtroMetodo, setFiltroMetodo] = useState('TODOS'); // 'TODOS' | 'EFECTIVO' | 'YAPE_PLIN' | 'TARJETA'
  const [filtroTipo, setFiltroTipo] = useState('TODOS'); // 'TODOS' | 'BOLETA' | 'FACTURA' | 'TICKET'

  // Pedidos Web Delivery y estados de trazabilidad
  const [pedidosDelivery, setPedidosDelivery] = useState([]);
  const [cargandoDelivery, setCargandoDelivery] = useState(false);
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState(null);
  const [pedidoDetalleModal, setPedidoDetalleModal] = useState(null);

  // Venta seleccionada para ver detalle y reimprimir
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [cargandoDetalleId, setCargandoDetalleId] = useState(null);

  const cargarVentas = useCallback(async (p = 1) => {
    setCargando(true);
    try {
      const params = { page: p, limit: 20 };
      if (busqueda.trim()) params.busqueda = busqueda.trim();
      if (filtroMetodo !== 'TODOS') params.metodoPago = filtroMetodo;

      // Calcular fechas según filtroFecha
      const now = new Date();
      if (filtroFecha === 'HOY') {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        params.fechaInicio = d.toISOString();
      } else if (filtroFecha === 'AYER') {
        const dAyer = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const dFinAyer = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
        params.fechaInicio = dAyer.toISOString();
        params.fechaFin = dFinAyer.toISOString();
      } else if (filtroFecha === '7DIAS') {
        const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        params.fechaInicio = d7.toISOString();
      } else if (filtroFecha === 'MES') {
        const dMes = new Date(now.getFullYear(), now.getMonth(), 1);
        params.fechaInicio = dMes.toISOString();
      }

      const data = await listarVentasApi(params);
      let lista = data.ventas || [];

      // Filtro local adicional de tipo de comprobante (Boleta vs Factura vs Ticket)
      if (filtroTipo !== 'TODOS') {
        lista = lista.filter(v => {
          const esFactura = v.clienteDoc && v.clienteDoc.length === 11;
          const esBoleta = v.clienteDoc && v.clienteDoc.length === 8;
          if (filtroTipo === 'FACTURA') return esFactura;
          if (filtroTipo === 'BOLETA') return esBoleta;
          if (filtroTipo === 'TICKET') return !esFactura && !esBoleta;
          return true;
        });
      }

      setVentas(lista);
      setTotal(data.total || 0);
      setPaginaActual(data.paginaActual || 1);
      setTotalPaginas(data.totalPaginas || 1);
    } catch (err) {
      console.error('Error al cargar ventas:', err);
      toast.error('No se pudo cargar el historial de ventas.');
    } finally {
      setCargando(false);
    }
  }, [busqueda, filtroFecha, filtroMetodo, filtroTipo]);

  const cargarPedidosDelivery = useCallback(async () => {
    setCargandoDelivery(true);
    try {
      const res = await listarPedidosDeliveryApi();
      if (res?.ok && Array.isArray(res.pedidos)) {
        setPedidosDelivery(res.pedidos);
      }
    } catch (err) {
      console.warn('Error al cargar pedidos delivery:', err);
    } finally {
      setCargandoDelivery(false);
    }
  }, []);

  useEffect(() => {
    cargarVentas(1);
    cargarPedidosDelivery();
    const handleNewOrder = () => {
      cargarVentas(1);
      cargarPedidosDelivery();
    };
    window.addEventListener('new-order-placed', handleNewOrder);
    window.addEventListener('app-reload-data', handleNewOrder);
    return () => {
      window.removeEventListener('new-order-placed', handleNewOrder);
      window.removeEventListener('app-reload-data', handleNewOrder);
    };
  }, [cargarVentas, cargarPedidosDelivery]);

  const handleCambiarEstado = async (orderId, nuevoEstado, dni, ventaId) => {
    setCambiandoEstadoId(orderId || ventaId);
    try {
      await actualizarEstadoPedidoDeliveryApi({ orderId, nuevoEstado, dni, ventaId });
      const nombresEstados = {
        EN_PREPARACION: 'En Preparación (Tópico Central)',
        EN_CAMINO: 'En Ruta / Motorizado Asignado',
        ENTREGADO: 'Entregado Conforme',
        CANCELADO: 'Cancelado'
      };
      notificarExito(
        'Estado de Entrega Actualizado',
        `El pedido cambió a "${nombresEstados[nuevoEstado] || nuevoEstado}". El cliente ya puede ver el avance en su portal.`
      );
      await cargarPedidosDelivery();
      await cargarVentas(paginaActual);
    } catch (err) {
      notificarError('Error al Actualizar', 'No se pudo actualizar el estado de entrega.');
    } finally {
      setCambiandoEstadoId(null);
    }
  };

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

      {/* Selector de Pestañas: Todas las Ventas vs Despachos & Delivery Web */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTabActiva('todas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              tabActiva === 'todas'
                ? 'bg-[#0d9488] text-white shadow-xs'
                : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>Todas las Ventas</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
              {total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTabActiva('delivery');
              cargarPedidosDelivery();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              tabActiva === 'delivery'
                ? 'bg-[#0d9488] text-white shadow-xs'
                : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Despachos & Delivery Web</span>
            {pedidosDelivery.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-black animate-pulse">
                {pedidosDelivery.length}
              </span>
            )}
          </button>
        </div>

        {tabActiva === 'delivery' && (
          <button
            type="button"
            onClick={cargarPedidosDelivery}
            disabled={cargandoDelivery}
            className="px-3 py-1.5 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refrescar pedidos web"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargandoDelivery ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        )}
      </div>

      {/* ========================================================
          VISTA 1: CONTROL DE DESPACHOS & DELIVERY WEB
          ======================================================== */}
      {tabActiva === 'delivery' ? (
        <div className="space-y-4">
          {/* Métricas Rápidas de Despacho */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 block">
                Total Web Juliaca
              </span>
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white block mt-0.5">
                {pedidosDelivery.length}
              </span>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                En Preparación
              </span>
              <span className="text-xl font-black font-mono text-amber-700 dark:text-amber-400 block mt-0.5">
                {pedidosDelivery.filter((p) => p.status === 'EN_PREPARACION' || !p.status).length}
              </span>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                En Ruta / Motorizado
              </span>
              <span className="text-xl font-black font-mono text-blue-700 dark:text-blue-400 block mt-0.5">
                {pedidosDelivery.filter((p) => p.status === 'EN_CAMINO').length}
              </span>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Entregados Conformes
              </span>
              <span className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400 block mt-0.5">
                {pedidosDelivery.filter((p) => p.status === 'ENTREGADO').length}
              </span>
            </div>
          </div>

          {/* Listado de Pedidos para Despacho */}
          <div className="space-y-3">
            {cargandoDelivery ? (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-neutral-800">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0d9488] mb-2" />
                <p className="text-sm font-medium text-slate-600 dark:text-neutral-300">
                  Cargando pedidos de delivery...
                </p>
              </div>
            ) : pedidosDelivery.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-neutral-800">
                <Truck className="w-12 h-12 mx-auto stroke-1 text-slate-300 dark:text-neutral-600 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-neutral-300">
                  No hay pedidos web de delivery pendientes
                </p>
                <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">
                  Las compras hechas en la tienda web con entrega a domicilio aparecerán automáticamente aquí.
                </p>
              </div>
            ) : (
              pedidosDelivery.map((pedido) => {
                const esCambiando = cambiandoEstadoId === pedido.orderId || cambiandoEstadoId === pedido.ventaId;
                const totalItemsCount = pedido.items?.reduce((acc, it) => acc + (it.cantidad || 1), 0) || 0;

                return (
                  <div
                    key={pedido.orderId || pedido.ventaId}
                    className="bg-white dark:bg-neutral-900 rounded-xl px-4 py-3 border border-slate-200 dark:border-neutral-800 shadow-2xs hover:border-teal-400 dark:hover:border-teal-600 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    {/* Bloque Izquierdo: Identificadores, Cliente y Total */}
                    <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                      <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-xs border border-slate-200 dark:border-neutral-700">
                        {pedido.orderId}
                      </span>
                      <span className="font-mono text-[11px] text-teal-700 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                        {pedido.serieNumero}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-medium">
                        {formatearFechaHoraLima(pedido.fecha)}
                      </span>
                      <span className="text-slate-300 dark:text-neutral-700 hidden sm:inline">•</span>
                      <div className="font-bold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-[220px]">
                        {pedido.clienteNom}
                      </div>
                      {pedido.telefono && (
                        <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono hidden md:inline">
                          ({pedido.telefono})
                        </span>
                      )}
                      <span className="text-slate-300 dark:text-neutral-700 hidden sm:inline">•</span>
                      <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                        {totalItemsCount} producto(s)
                      </span>
                      <span className="font-mono font-black text-sm text-[#0d9488] dark:text-teal-400 ml-1">
                        {formatearMoneda(pedido.total)}
                      </span>
                    </div>

                    {/* Bloque Derecho: Selector de Estado Moderno & Botones */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                      {/* Dropdown de Estado Moderno (Sin emojis toscos, paleta sutil) */}
                      <select
                        value={pedido.status || 'EN_PREPARACION'}
                        disabled={esCambiando}
                        onChange={(e) =>
                          handleCambiarEstado(
                            pedido.orderId,
                            e.target.value,
                            pedido.clienteDoc,
                            pedido.ventaId
                          )
                        }
                        className={`text-[11px] font-bold rounded-lg px-2.5 py-1.5 border transition cursor-pointer outline-none ${
                          pedido.status === 'ENTREGADO'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : pedido.status === 'EN_CAMINO'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : pedido.status === 'CANCELADO'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        <option value="EN_PREPARACION">En Preparación (Tópico)</option>
                        <option value="EN_CAMINO">En Ruta (Motorizado)</option>
                        <option value="ENTREGADO">Entregado Conforme</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>

                      {/* Botón Ver Detalle */}
                      <button
                        type="button"
                        onClick={() => setPedidoDetalleModal(pedido)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-neutral-700 shadow-2xs"
                        title="Ver detalle completo de entrega y productos"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#0d9488] dark:text-teal-400" />
                        <span>Ver Detalle</span>
                      </button>

                      {/* Botón Reimprimir Ticket */}
                      <button
                        type="button"
                        onClick={() => handleVerDetalle(pedido.ventaId)}
                        className="p-1.5 bg-white hover:bg-slate-50 dark:bg-neutral-900 hover:dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 font-bold rounded-lg text-xs transition cursor-pointer border border-slate-200 dark:border-neutral-800"
                        title="Reimprimir Ticket de Venta"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#0d9488]" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* ========================================================
            VISTA 2: TODAS LAS VENTAS (HISTORIAL COMPLETO CON PAGING Y FILTROS)
            ======================================================== */
        <div className="space-y-3">
          {/* Barra de Filtros Avanzados: Nombre/Doc, Fecha, Método y Tipo */}
          <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-2.5 text-xs">
            {/* Buscador predictivo por cliente, DNI, RUC o ticket */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por cliente, DNI, RUC o N° ticket (ej: T-000001)..."
                className="w-full pl-8 pr-8 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Selector de Rango de Fecha */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-950 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
              >
                <option value="TODAS">Todas las fechas</option>
                <option value="HOY">Hoy (Turno actual)</option>
                <option value="AYER">Ayer</option>
                <option value="7DIAS">Últimos 7 días</option>
                <option value="MES">Este mes</option>
              </select>
            </div>

            {/* Selector de Método de Pago */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-950 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 shrink-0">
              <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={filtroMetodo}
                onChange={(e) => setFiltroMetodo(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
              >
                <option value="TODOS">Todos los métodos</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="YAPE_PLIN">Yape / Plin</option>
                <option value="TARJETA">Tarjeta</option>
              </select>
            </div>

            {/* Selector de Tipo de Comprobante */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-950 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 shrink-0">
              <ReceiptText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
              >
                <option value="TODOS">Todos los comprobantes</option>
                <option value="BOLETA">Boletas (DNI)</option>
                <option value="FACTURA">Facturas (RUC)</option>
                <option value="TICKET">Ticket Mostrador</option>
              </select>
            </div>

            {/* Botón Restablecer */}
            {(busqueda || filtroFecha !== 'TODAS' || filtroMetodo !== 'TODOS' || filtroTipo !== 'TODOS') && (
              <button
                type="button"
                onClick={() => {
                  setBusqueda('');
                  setFiltroFecha('TODAS');
                  setFiltroMetodo('TODOS');
                  setFiltroTipo('TODOS');
                }}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-500 hover:text-rose-600 bg-slate-100 dark:bg-neutral-800 transition cursor-pointer shrink-0"
              >
                Limpiar
              </button>
            )}
          </div>

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
                    Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonTableRow key={i} cols={7} />
                    ))
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
                  ventas.map((v) => {
                    const esWeb = v.clienteNom?.includes('Web Delivery') || v.clienteNom?.includes('Tienda Web');
                    const matchOrder = pedidosDelivery.find((p) => p.ventaId === v.id);
                    const estadoWeb = matchOrder?.status || 'EN_PREPARACION';

                    return (
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
                            {esWeb && (
                              <span
                                onClick={() => {
                                  setTabActiva('delivery');
                                  cargarPedidosDelivery();
                                }}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider border cursor-pointer ${
                                  estadoWeb === 'ENTREGADO'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : estadoWeb === 'EN_CAMINO'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                                title="Clic para gestionar despacho"
                              >
                                <Truck className="w-2.5 h-2.5" />
                                <span>
                                  {estadoWeb === 'ENTREGADO'
                                    ? 'Entregado'
                                    : estadoWeb === 'EN_CAMINO'
                                    ? 'En Ruta'
                                    : 'Delivery Web'}
                                </span>
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
                    );
                  })
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
      </div>
    )}

      {/* Modal de Detalle Completo del Pedido Web Delivery */}
      {pedidoDetalleModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-start sm:items-center justify-center animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPedidoDetalleModal(null);
          }}
        >
          <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-neutral-800 p-5 sm:p-6 text-slate-800 dark:text-neutral-200 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#0d9488]" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Detalle de Pedido Delivery Web
                  </h3>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 mt-0.5">
                    <span>{pedidoDetalleModal.orderId}</span>
                    <span>•</span>
                    <span className="text-teal-700 dark:text-teal-400 font-bold">{pedidoDetalleModal.serieNumero}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPedidoDetalleModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Datos del Receptor y Destino */}
            <div className="bg-slate-50 dark:bg-neutral-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800/80 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Titular:</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">
                  {pedidoDetalleModal.clienteNom}
                </span>
              </div>
              {pedidoDetalleModal.clienteDoc && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">DNI/RUC:</span>
                  <span className="font-mono text-slate-700 dark:text-neutral-300">
                    {pedidoDetalleModal.clienteDoc}
                  </span>
                </div>
              )}
              {pedidoDetalleModal.telefono && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Celular:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-800 dark:text-neutral-200 font-bold">
                      {pedidoDetalleModal.telefono}
                    </span>
                    <a
                      href={`https://wa.me/51${pedidoDetalleModal.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Hola ${pedidoDetalleModal.clienteNom}, te saludamos de Botica Nova Salud respecto a tu pedido ${pedidoDetalleModal.orderId}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 text-[11px]"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-start pt-1 border-t border-slate-200/60 dark:border-neutral-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Destino:</span>
                <div className="text-right">
                  <p className="font-bold text-slate-800 dark:text-neutral-200">{pedidoDetalleModal.direccion}</p>
                  <p className="text-[11px] text-slate-500">{pedidoDetalleModal.distrito || 'Juliaca Cercado'} • Puno</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-neutral-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Método Pago:</span>
                <span className="font-bold text-slate-800 dark:text-neutral-200">
                  {pedidoDetalleModal.metodoPago === 'YAPE_PLIN'
                    ? 'Yape / Plin'
                    : pedidoDetalleModal.metodoPago === 'TARJETA'
                    ? 'Tarjeta Débito/Crédito'
                    : 'Contra Entrega en Efectivo'}
                </span>
              </div>
            </div>

            {/* Fármacos Pedidos */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                Fármacos en el Pedido ({pedidoDetalleModal.items?.length || 0})
              </span>
              <div className="max-h-44 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-neutral-800/60 border border-slate-200 dark:border-neutral-800 rounded-xl p-2.5 bg-slate-50/50 dark:bg-neutral-950/30 text-xs">
                {pedidoDetalleModal.items?.map((it, idx) => (
                  <div key={idx} className="pt-1 first:pt-0 flex items-center justify-between text-slate-700 dark:text-neutral-300">
                    <div className="truncate pr-2">
                      <strong className="text-slate-900 dark:text-white font-mono">{it.cantidad}x</strong> {it.nombre}
                      {it.presentacion && <span className="text-[11px] text-slate-400 ml-1">({it.presentacion})</span>}
                    </div>
                    <span className="font-mono font-bold text-slate-800 dark:text-neutral-200 shrink-0">
                      {formatearMoneda((it.precio || 0) * (it.cantidad || 1))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total y Acciones */}
            <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Pedido
                </span>
                <span className="text-lg font-black font-mono text-[#0d9488]">
                  {formatearMoneda(pedidoDetalleModal.total)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const vId = pedidoDetalleModal.ventaId;
                    setPedidoDetalleModal(null);
                    if (vId) handleVerDetalle(vId);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-neutral-700"
                >
                  <Printer className="w-3.5 h-3.5 text-[#0d9488]" />
                  <span>Ver Ticket</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPedidoDetalleModal(null)}
                  className="px-4 py-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

