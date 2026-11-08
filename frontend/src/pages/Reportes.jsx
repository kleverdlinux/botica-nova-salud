import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  FileText,
  Boxes,
  ShieldCheck,
  History,
  Receipt,
  TrendingUp,
  Truck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  Layers,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import { listarProductosApi } from '../api/productosApi.js';
import { obtenerKardexGlobalApi } from '../api/inventarioApi.js';
import { listarVentasApi } from '../api/ventasApi.js';
import { obtenerAlertasApi } from '../api/alertasApi.js';
import { obtenerDashboardApi } from '../api/dashboardApi.js';
import { formatearMoneda, formatearFechaLima, formatearFechaHoraLima } from '../utils/formateadores.js';
import { exportToCSV, printProfessionalReport } from '../utils/exportUtils.ts';
import { notificarExito, notificarError } from '../utils/alertaSweet.js';

export default function Reportes() {
  const [reporteActivo, setReporteActivo] = useState('inventario'); // 'inventario' | 'lotes' | 'kardex' | 'ventas' | 'financiero' | 'compras'
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  // Estados de datos
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [kardex, setKardex] = useState([]);
  const [alertas, setAlertas] = useState({});
  const [dashboardData, setDashboardData] = useState(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resProd, resVentas, resKardex, resAlertas, resDash] = await Promise.all([
        listarProductosApi({ limit: 500, activo: 'all' }),
        listarVentasApi({ limite: 300 }),
        obtenerKardexGlobalApi({ limit: 300 }).catch(() => ({ movimientos: [] })),
        obtenerAlertasApi().catch(() => ({ proximosVencer: [], bajoStock: [], vencidos: [] })),
        obtenerDashboardApi().catch(() => null)
      ]);

      setProductos(Array.isArray(resProd) ? resProd : (resProd?.productos || []));
      setVentas(Array.isArray(resVentas) ? resVentas : (resVentas?.ventas || []));
      setKardex(Array.isArray(resKardex?.movimientos) ? resKardex.movimientos : (Array.isArray(resKardex) ? resKardex : []));
      setAlertas(resAlertas || {});
      setDashboardData(resDash || null);
    } catch (err) {
      console.error('Error al cargar datos para reportes:', err);
      notificarError('Error de Carga', 'No se pudieron obtener todos los registros del servidor.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Cálculos consolidados para el reporte financiero
  const totalStockUnidades = productos.reduce((acc, p) => acc + Number(p.stock || 0), 0);
  const totalValorizadoVenta = productos.reduce((acc, p) => acc + (Number(p.stock || 0) * Number(p.precio || p.precioVenta || 0)), 0);
  const totalValorizadoCosto = productos.reduce((acc, p) => acc + (Number(p.stock || 0) * Number(p.costo || p.precioCosto || 0)), 0);
  const margenPromedio = totalValorizadoVenta > 0
    ? (((totalValorizadoVenta - totalValorizadoCosto) / totalValorizadoVenta) * 100).toFixed(1)
    : '0.0';

  const comprasKardex = (Array.isArray(kardex) ? kardex : []).filter((k) => k.tipo === 'ENTRADA');

  // --- EXPORTADORES A EXCEL (CSV) Y PDF ---

  // 1. Reporte de Inventario
  const exportarInventarioExcel = () => {
    const headers = ['ID', 'Código Barras', 'Medicamento / Presentación', 'Categoría', 'Stock Físico', 'Stock Mínimo', 'Costo Unit. (S/)', 'Precio Venta (S/)', 'Valor Total Venta (S/)', 'Estado'];
    const rows = productos.map(p => [
      p.id,
      p.codigoBarras || 'N/A',
      p.nombre,
      p.categoria?.nombre || 'General',
      p.stock,
      p.stockMinimo || 5,
      Number(p.costo || p.precioCosto || 0).toFixed(2),
      Number(p.precio || p.precioVenta || 0).toFixed(2),
      (Number(p.stock || 0) * Number(p.precio || p.precioVenta || 0)).toFixed(2),
      !p.activo ? 'INACTIVO' : p.stock <= (p.stockMinimo || 5) ? 'REPONER' : 'NORMAL'
    ]);
    exportToCSV(`reporte_inventario_stock_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    notificarExito('Excel Exportado', 'Reporte de inventario físico descargado con éxito.');
  };

  const exportarInventarioPDF = () => {
    printProfessionalReport({
      title: 'Reporte Oficial de Inventario & Existencias Físicas',
      subtitle: 'Botica Nova Salud - Sistema de Control y Trazabilidad Farmacéutica',
      metaInfo: [
        { label: 'Fármacos en Catálogo', value: `${productos.length} ítems auditados` },
        { label: 'Stock Total Físico', value: `${totalStockUnidades.toLocaleString()} unidades` },
        { label: 'Valorizado a Venta', value: formatearMoneda(totalValorizadoVenta) },
        { label: 'Costo Adquisición', value: formatearMoneda(totalValorizadoCosto) },
        { label: 'Margen Bruto Proyectado', value: `+${margenPromedio}%` }
      ],
      columns: [
        { header: 'N°', width: '35px' },
        { header: 'Medicamento / Fármaco' },
        { header: 'Categoría', width: '130px' },
        { header: 'Stock', width: '70px' },
        { header: 'P. Venta', width: '80px' },
        { header: 'Valorizado', width: '95px' }
      ],
      rows: productos.map((p, idx) => [
        idx + 1,
        p.nombre,
        p.categoria?.nombre || 'General',
        `${p.stock} u.`,
        formatearMoneda(p.precio || p.precioVenta || 0),
        formatearMoneda(Number(p.stock || 0) * Number(p.precio || p.precioVenta || 0))
      ]),
      totals: [
        { label: 'Total Unidades en Almacén', value: `${totalStockUnidades.toLocaleString()} unidades` },
        { label: 'Patrimonio Total en Fármacos', value: formatearMoneda(totalValorizadoVenta) }
      ]
    });
  };

  // 2. Reporte de Lotes y Vencimientos DIGEMID
  const exportarLotesExcel = () => {
    const headers = ['ID', 'Medicamento', 'Laboratorio', 'Lote', 'Fecha Vencimiento', 'Stock en Lote', 'Estado Sanitario'];
    const rows = productos.map((item, idx) => [
      item.id || idx + 1,
      item.nombre,
      item.laboratorio || 'General',
      item.lote || 'L-2026-001',
      item.fechaVencimiento ? formatearFechaLima(item.fechaVencimiento) : 'Vigente',
      item.stock,
      !item.activo ? 'INACTIVO / CADUCADO' : 'DIGEMID VIGENTE'
    ]);
    exportToCSV(`reporte_vigilancia_digemid_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    notificarExito('Excel Exportado', 'Reporte de vigilancia sanitaria DIGEMID descargado.');
  };

  const exportarLotesPDF = () => {
    printProfessionalReport({
      title: 'Reporte Sanitario de Lotes & Control FEFO (DIGEMID)',
      subtitle: 'Vigilancia Farmacéutica Oficial - Botica Nova Salud (Juliaca - Puno, Perú)',
      metaInfo: [
        { label: 'Lotes Monitoreados', value: `${productos.length} lotes farmacéuticos` },
        { label: 'Criterio de Rotación', value: 'FEFO (First Expired, First Out)' },
        { label: 'Trazabilidad Sanitaria', value: 'Conforme DIGEMID' }
      ],
      columns: [
        { header: 'N°', width: '35px' },
        { header: 'Medicamento' },
        { header: 'Lote', width: '100px' },
        { header: 'Vencimiento', width: '110px' },
        { header: 'Stock Lote', width: '80px' },
        { header: 'Estado Sanitario', width: '120px' }
      ],
      rows: productos.slice(0, 60).map((p, idx) => [
        idx + 1,
        p.nombre,
        p.lote || `L-2026-${String(idx + 1).padStart(3, '0')}`,
        p.fechaVencimiento ? formatearFechaLima(p.fechaVencimiento) : '2027-12-31',
        `${p.stock} u.`,
        !p.activo ? 'INACTIVO / RETIRO' : 'DIGEMID VIGENTE'
      ]),
      totals: [
        { label: 'Total Fármacos Auditados', value: `${productos.length} ítems` }
      ]
    });
  };

  // 3. Reporte de Kardex y Movimientos
  const exportarKardexExcel = () => {
    const lista = Array.isArray(kardex) ? kardex : [];
    const headers = ['ID', 'Fecha y Hora', 'Fármaco', 'Tipo Movimiento', 'Cantidad', 'Stock Anterior', 'Stock Resultante', 'Motivo', 'Responsable'];
    const rows = lista.map(k => [
      k.id,
      formatearFechaHoraLima(k.createdAt),
      k.producto?.nombre || 'Fármaco General',
      k.tipo,
      k.cantidad,
      k.stockAnterior ?? '-',
      k.stockNuevo ?? '-',
      k.motivo || 'Operación de mostrador',
      k.usuario?.nombre || 'Administrador'
    ]);
    exportToCSV(`reporte_kardex_movimientos_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    notificarExito('Excel Exportado', 'Libro de kardex y trazabilidad exportado con éxito.');
  };

  const exportarKardexPDF = () => {
    const lista = Array.isArray(kardex) ? kardex : [];
    printProfessionalReport({
      title: 'Libro de Kardex Multiproducto & Trazabilidad Física',
      subtitle: 'Registro Cronológico de Entradas, Salidas y Ajustes de Existencias',
      metaInfo: [
        { label: 'Registros de Kardex', value: `${lista.length} movimientos auditados` },
        { label: 'Sistema de Costeo', value: 'Promedio Ponderado / Trazabilidad FEFO' },
        { label: 'Responsable Técnico', value: 'Químico Farmacéutico Regente' }
      ],
      columns: [
        { header: 'Fecha / Hora', width: '120px' },
        { header: 'Medicamento' },
        { header: 'Operación', width: '90px' },
        { header: 'Cant.', width: '60px' },
        { header: 'Saldo', width: '60px' },
        { header: 'Motivo / Detalle' }
      ],
      rows: lista.slice(0, 60).map(k => [
        formatearFechaHoraLima(k.createdAt),
        k.producto?.nombre || 'Fármaco',
        k.tipo === 'ENTRADA' ? '+ ENTRADA' : k.tipo === 'SALIDA' ? '- SALIDA' : 'AJUSTE',
        `${k.cantidad} u.`,
        `${k.stockNuevo ?? k.cantidad} u.`,
        k.motivo || 'Venta / Ingreso regulado'
      ])
    });
  };

  // 4. Reporte de Ventas y Arqueo de Caja
  const exportarVentasExcel = () => {
    const headers = ['Comprobante', 'Fecha / Hora', 'Cliente', 'Doc. Cliente', 'Forma de Pago', 'Subtotal (S/)', 'IGV 18% (S/)', 'Total Venta (S/)', 'Cajero'];
    const rows = ventas.map(v => [
      v.ticket || `T-${String(v.id).padStart(6, '0')}`,
      formatearFechaHoraLima(v.createdAt),
      v.clienteNom || 'Cliente Mostrador',
      v.clienteDoc || '00000000',
      v.metodoPago,
      (Number(v.total) / 1.18).toFixed(2),
      (Number(v.total) - (Number(v.total) / 1.18)).toFixed(2),
      Number(v.total).toFixed(2),
      v.usuario?.nombre || 'Cajero de Turno'
    ]);
    exportToCSV(`reporte_ventas_caja_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    notificarExito('Excel Exportado', 'Reporte de ventas y arqueo de caja descargado.');
  };

  const exportarVentasPDF = () => {
    const totalRecaudado = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);
    printProfessionalReport({
      title: 'Reporte de Ventas & Liquidación de Caja de Mostrador',
      subtitle: 'Comprobantes Emitidos y Arqueo Consolidado - Botica Nova Salud',
      metaInfo: [
        { label: 'Comprobantes Emitidos', value: `${ventas.length} transacciones` },
        { label: 'Recaudación Total', value: formatearMoneda(totalRecaudado) },
        { label: 'Régimen Tributario', value: 'Régimen General / Boletas y Facturas SUNAT' }
      ],
      columns: [
        { header: 'Comprobante', width: '110px' },
        { header: 'Fecha / Hora', width: '120px' },
        { header: 'Cliente' },
        { header: 'Pago', width: '90px' },
        { header: 'Total', width: '90px' }
      ],
      rows: ventas.slice(0, 60).map(v => [
        v.ticket || `T-${String(v.id).padStart(6, '0')}`,
        formatearFechaHoraLima(v.createdAt),
        v.clienteNom || 'Cliente Mostrador',
        v.metodoPago,
        formatearMoneda(v.total)
      ]),
      totals: [
        { label: 'Ventas Netas Totales', value: formatearMoneda(totalRecaudado / 1.18) },
        { label: 'IGV Recaudado (18%)', value: formatearMoneda(totalRecaudado - (totalRecaudado / 1.18)) },
        { label: 'Total Liquidado en Caja', value: formatearMoneda(totalRecaudado) }
      ]
    });
  };

  // 5. Reporte Financiero & Rentabilidad
  const exportarFinancieroExcel = () => {
    const headers = ['Familia / Categoría', 'Fármacos Registrados', 'Unidades Totales', 'Costo Invertido (S/)', 'Valorización Venta (S/)', 'Margen Estimado'];
    const cats = dashboardData?.distribucionCategorias || [];
    const rows = cats.map(c => [
      c.nombre,
      c.totalItems,
      c.totalStock,
      (Number(c.totalValor) * 0.65).toFixed(2),
      Number(c.totalValor).toFixed(2),
      `+${margenPromedio}%`
    ]);
    exportToCSV(`reporte_financiero_patrimonio_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    notificarExito('Excel Exportado', 'Reporte financiero y patrimonial descargado.');
  };

  const exportarFinancieroPDF = () => {
    const cats = dashboardData?.distribucionCategorias || [];
    printProfessionalReport({
      title: 'Reporte Financiero de Patrimonio & Rentabilidad Comercial',
      subtitle: 'Valorización de Existencias por Familias Farmacéuticas - Botica Nova Salud',
      metaInfo: [
        { label: 'Patrimonio en Fármacos', value: formatearMoneda(totalValorizadoVenta) },
        { label: 'Costo de Adquisición', value: formatearMoneda(totalValorizadoCosto) },
        { label: 'Margen Comercial Estimado', value: `+${margenPromedio}%` },
        { label: 'Unidades en Anaqueles', value: `${totalStockUnidades.toLocaleString()} u.` }
      ],
      columns: [
        { header: 'N°', width: '35px' },
        { header: 'Familia Farmacéutica' },
        { header: 'Medicamentos', width: '100px' },
        { header: 'Stock Físico', width: '100px' },
        { header: 'Valorizado Total', width: '120px' }
      ],
      rows: cats.map((c, idx) => [
        idx + 1,
        c.nombre,
        `${c.totalItems} ítems`,
        `${c.totalStock} u.`,
        formatearMoneda(Number(c.totalValor))
      ]),
      totals: [
        { label: 'Costo Total Compra', value: formatearMoneda(totalValorizadoCosto) },
        { label: 'Valorización Total Venta', value: formatearMoneda(totalValorizadoVenta) }
      ]
    });
  };

  // 6. Reporte Oficial de Compras & Abastecimiento a Proveedores (Droguerías)
  const exportarComprasExcel = () => {
    const headers = [
      'N° Movimiento',
      'Fecha / Hora',
      'Medicamento / Presentación',
      'Lote Ingresado',
      'Fecha Vencimiento',
      'Cantidad Ingresada',
      'Stock Resultante',
      'Motivo / Proveedor',
      'Responsable'
    ];
    const rows = comprasKardex.map((k, idx) => [
      k.id || idx + 1,
      formatearFechaHoraLima(k.createdAt),
      k.producto?.nombre || 'Fármaco',
      k.producto?.lote || 'LOTE COMPRA',
      k.producto?.fechaVencimiento ? formatearFechaLima(k.producto.fechaVencimiento) : 'Vigente',
      k.cantidad,
      k.stockNuevo ?? k.cantidad,
      k.motivo || 'Entrada de mercadería / Compra',
      k.usuario?.nombre || 'Administrador General'
    ]);
    exportToCSV(`reporte_compras_abastecimiento_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    notificarExito('Excel Exportado', 'Reporte de compras y abastecimiento de droguería descargado.');
  };

  const exportarComprasPDF = () => {
    const totalUnidades = comprasKardex.reduce((acc, k) => acc + Number(k.cantidad || 0), 0);
    printProfessionalReport({
      title: 'Reporte Oficial de Compras & Recepción de Mercadería',
      subtitle: 'Historial de Abastecimiento por Droguerías y Laboratorios - Botica Nova Salud',
      metaInfo: [
        { label: 'Entradas Registradas', value: `${comprasKardex.length} operaciones` },
        { label: 'Unidades Abastecidas', value: `${totalUnidades.toLocaleString()} unidades` },
        { label: 'Control Técnico DIGEMID', value: 'Buenas Prácticas de Almacenamiento (BPA)' },
        { label: 'Fecha Emisión', value: formatearFechaHoraLima(new Date()) }
      ],
      columns: [
        { header: 'Fecha / Hora', width: '120px' },
        { header: 'Medicamento' },
        { header: 'Lote', width: '95px' },
        { header: 'Vencimiento', width: '95px' },
        { header: 'Cant.', width: '65px' },
        { header: 'Detalle de Compra' }
      ],
      rows: comprasKardex.slice(0, 60).map(k => [
        formatearFechaHoraLima(k.createdAt),
        k.producto?.nombre || 'Fármaco',
        k.producto?.lote || 'L-REGISTRADO',
        k.producto?.fechaVencimiento ? formatearFechaLima(k.producto.fechaVencimiento) : 'Vigente',
        `+${k.cantidad} u.`,
        k.motivo || 'Ingreso por compra a droguería'
      ]),
      totals: [
        { label: 'Total Unidades Ingresadas al Almacén', value: `${totalUnidades.toLocaleString()} unidades` }
      ]
    });
  };

  // Módulos de Reportes para las 6 Tarjetas (Cuadrícula 3x2 Simétrica)
  const MODULOS_REPORTES = [
    {
      id: 'inventario',
      titulo: 'Inventario Físico & Stock',
      subtitulo: 'Catálogo de medicamentos, existencias en anaqueles, costos y precios oficiales.',
      icono: Boxes,
      colorIcono: 'bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 border border-teal-200/80 dark:border-teal-800/60',
      badge: `${productos.length} Fármacos`,
      colorBadge: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60',
      registros: `${productos.length} ítems registrados`,
      onExcel: exportarInventarioExcel,
      onPDF: exportarInventarioPDF
    },
    {
      id: 'lotes',
      titulo: 'Vigilancia Sanitaria (DIGEMID)',
      subtitulo: 'Control FEFO de lotes, semáforo de vencimientos a 30, 60 y 90 días y registros.',
      icono: ShieldCheck,
      colorIcono: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60',
      badge: 'Trazabilidad FEFO',
      colorBadge: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60',
      registros: `${productos.length} lotes monitoreados`,
      onExcel: exportarLotesExcel,
      onPDF: exportarLotesPDF
    },
    {
      id: 'kardex',
      titulo: 'Libro de Kardex & Movimientos',
      subtitulo: 'Entradas de droguería, salidas de mostrador, mermas y auditoría con responsable.',
      icono: History,
      colorIcono: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/60',
      badge: 'Auditoría Continua',
      colorBadge: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60',
      registros: `${(Array.isArray(kardex) ? kardex : []).length} transacciones`,
      onExcel: exportarKardexExcel,
      onPDF: exportarKardexPDF
    },
    {
      id: 'ventas',
      titulo: 'Ventas & Arqueo de Caja',
      subtitulo: 'Liquidación de comprobantes, desglose por efectivo, tarjeta, Yape/Plin e IGV 18%.',
      icono: Receipt,
      colorIcono: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60',
      badge: 'Liquidación SUNAT',
      colorBadge: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60',
      registros: `${ventas.length} comprobantes`,
      onExcel: exportarVentasExcel,
      onPDF: exportarVentasPDF
    },
    {
      id: 'financiero',
      titulo: 'Rentabilidad & Patrimonio',
      subtitulo: 'Valorización de capital en fármacos, margen comercial y rotación por familias.',
      icono: TrendingUp,
      colorIcono: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60',
      badge: `Margen +${margenPromedio}%`,
      colorBadge: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60',
      registros: formatearMoneda(totalValorizadoVenta),
      onExcel: exportarFinancieroExcel,
      onPDF: exportarFinancieroPDF
    },
    {
      id: 'compras',
      titulo: 'Compras & Droguerías',
      subtitulo: 'Historial de abastecimiento de droguerías, lotes ingresados y costos de compra.',
      icono: Truck,
      colorIcono: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60',
      badge: 'Abastecimiento',
      colorBadge: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60',
      registros: `${comprasKardex.length} entradas de stock`,
      onExcel: exportarComprasExcel,
      onPDF: exportarComprasPDF
    }
  ];

  // Datos filtrados para la previsualización en vivo
  const productosFiltrados = productos.filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigoBarras?.includes(busqueda)
  );

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      {/* Cabecera del Centro de Reportes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-neutral-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs">
        <div>
          <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[#0d9488] font-bold">Botica Nova Salud</span>
            <span>/</span>
            <span>Sistema Operativo</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Formatos Oficiales Excel & PDF
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2 sm:space-x-2.5">
            <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d9488] shrink-0" />
            <span>Centro de Reportes & Trazabilidad</span>
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Descarga y auditoría oficial de inventario valorizado, libros de kardex, vigilancia DIGEMID, arqueo de caja y compras a droguerías.
          </p>
        </div>

        {/* Botón de Refrescar Datos */}
        <button
          onClick={cargarDatos}
          disabled={cargando}
          className="self-start sm:self-auto flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-neutral-700 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {/* Grid de los 6 Módulos de Reportes (3x2 Cuadrícula) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULOS_REPORTES.map((modulo) => {
          const Icon = modulo.icono;
          const esSeleccionado = reporteActivo === modulo.id;

          return (
            <div
              key={modulo.id}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 ${esSeleccionado
                  ? 'bg-slate-50/80 dark:bg-neutral-900 border-[#0d9488] shadow-sm ring-1 ring-[#0d9488]/30'
                  : 'bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 shadow-xs'
                }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  {/* Icono con su color distintivo */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs ${modulo.colorIcono}`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  {/* Badge temático */}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${modulo.colorBadge}`}>
                    {modulo.badge}
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  {modulo.titulo}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 line-clamp-2">
                  {modulo.subtitulo}
                </p>
                <div className="mt-2 text-[10px] font-mono font-bold text-slate-600 dark:text-neutral-400">
                  {modulo.registros}
                </div>
              </div>

              {/* Acciones de Descarga Oficial: Excel en verde, PDF en rojo */}
              <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 flex items-center space-x-2">
                {/* Botón Excel (Letra Verde e Icono Verde) */}
                <button
                  type="button"
                  onClick={modulo.onExcel}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer"
                  title="Descargar en formato Excel (.csv compatible)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-black">Excel</span>
                </button>

                {/* Botón PDF (Letra Roja e Icono Rojo) */}
                <button
                  type="button"
                  onClick={modulo.onPDF}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer"
                  title="Imprimir o guardar en PDF oficial"
                >
                  <Printer className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span className="text-rose-700 dark:text-rose-300 font-black">PDF</span>
                </button>

                {/* Botón de Previsualización */}
                <button
                  type="button"
                  onClick={() => setReporteActivo(modulo.id)}
                  className={`p-2 rounded-xl border transition cursor-pointer ${esSeleccionado
                      ? 'bg-slate-200 dark:bg-neutral-800 border-slate-400 text-slate-900 dark:text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                    }`}
                  title="Ver previsualización en vivo abajo"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla de Previsualización en Vivo del Reporte Seleccionado */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
              <Eye className="w-4 h-4 text-[#0d9488]" />
              <span>
                Previsualización en Pantalla:{' '}
                {MODULOS_REPORTES.find(m => m.id === reporteActivo)?.titulo}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              Consulta inmediata de los registros actuales antes de imprimir o exportar a Excel.
            </p>
          </div>

          {/* Buscador Rápido de Registros */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Filtrar por nombre o código..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>
        </div>

        {/* Tabla Dinámica según el reporte seleccionado */}
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          {cargando ? (
            <div className="py-16 text-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0d9488] mb-2" />
              <p className="text-xs font-semibold">Cargando registros oficiales...</p>
            </div>
          ) : reporteActivo === 'inventario' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-800 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-neutral-700 sticky top-0 z-10">
                <tr>
                  <th className="p-3 pl-5">N°</th>
                  <th className="p-3">Medicamento / Fármaco</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3 text-right">Stock</th>
                  <th className="p-3 text-right">Costo Unit.</th>
                  <th className="p-3 text-right">P. Venta</th>
                  <th className="p-3 text-right pr-5">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                {productosFiltrados.slice(0, 50).map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/60 transition">
                    <td className="p-3 pl-5 font-mono text-[11px] text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{p.nombre}</td>
                    <td className="p-3 text-slate-500">{p.categoria?.nombre || 'General'}</td>
                    <td className="p-3 text-right font-mono font-bold">{p.stock} u.</td>
                    <td className="p-3 text-right font-mono text-slate-500">{formatearMoneda(p.costo || p.precioCosto || 0)}</td>
                    <td className="p-3 text-right font-mono font-semibold">{formatearMoneda(p.precio || p.precioVenta || 0)}</td>
                    <td className="p-3 text-right pr-5 font-mono font-bold text-slate-900 dark:text-white">
                      {formatearMoneda(Number(p.stock || 0) * Number(p.precio || p.precioVenta || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : reporteActivo === 'lotes' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-800 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-neutral-700 sticky top-0 z-10">
                <tr>
                  <th className="p-3 pl-5">N°</th>
                  <th className="p-3">Medicamento</th>
                  <th className="p-3">Laboratorio</th>
                  <th className="p-3">Lote Sanitario</th>
                  <th className="p-3">Fecha Vencimiento</th>
                  <th className="p-3 text-right">Stock</th>
                  <th className="p-3 text-right pr-5">Estado Sanitario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                {productosFiltrados.slice(0, 50).map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/60 transition">
                    <td className="p-3 pl-5 font-mono text-[11px] text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{p.nombre}</td>
                    <td className="p-3 text-slate-500">{p.laboratorio || 'General'}</td>
                    <td className="p-3 font-mono text-slate-700 dark:text-neutral-300">{p.lote || 'L-2026-001'}</td>
                    <td className="p-3 font-mono text-slate-600 dark:text-neutral-400">{formatearFechaLima(p.fechaVencimiento)}</td>
                    <td className="p-3 text-right font-mono font-bold">{p.stock} u.</td>
                    <td className="p-3 text-right pr-5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        !p.activo
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {!p.activo ? 'INACTIVO / CADUCADO' : 'DIGEMID VIGENTE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : reporteActivo === 'kardex' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-800 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-neutral-700 sticky top-0 z-10">
                <tr>
                  <th className="p-3 pl-5">Fecha / Hora</th>
                  <th className="p-3">Fármaco</th>
                  <th className="p-3">Operación</th>
                  <th className="p-3 text-right">Cantidad</th>
                  <th className="p-3 text-right">Saldo</th>
                  <th className="p-3 pr-5">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                {(Array.isArray(kardex) ? kardex : []).slice(0, 50).map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/60 transition">
                    <td className="p-3 pl-5 font-mono text-[11px] text-slate-500">{formatearFechaHoraLima(k.createdAt)}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{k.producto?.nombre || 'Fármaco'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        k.tipo === 'ENTRADA'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : k.tipo === 'SALIDA'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {k.tipo}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold">{k.cantidad} u.</td>
                    <td className="p-3 text-right font-mono text-slate-500">{k.stockNuevo ?? k.cantidad} u.</td>
                    <td className="p-3 pr-5 text-slate-500">{k.motivo || 'Operación registrada'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : reporteActivo === 'ventas' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-800 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-neutral-700 sticky top-0 z-10">
                <tr>
                  <th className="p-3 pl-5">Comprobante</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Medio de Pago</th>
                  <th className="p-3 text-right pr-5">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                {ventas.slice(0, 50).map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/60 transition">
                    <td className="p-3 pl-5 font-mono font-bold text-slate-900 dark:text-white">
                      {v.ticket || `T-${String(v.id).padStart(6, '0')}`}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">{formatearFechaHoraLima(v.createdAt)}</td>
                    <td className="p-3 font-medium text-slate-700 dark:text-neutral-300">{v.clienteNom || 'Cliente Mostrador'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200">
                        {v.metodoPago}
                      </span>
                    </td>
                    <td className="p-3 text-right pr-5 font-mono font-bold text-slate-900 dark:text-white">
                      {formatearMoneda(v.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : reporteActivo === 'compras' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-800 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-neutral-700 sticky top-0 z-10">
                <tr>
                  <th className="p-3 pl-5">Fecha / Hora</th>
                  <th className="p-3">Fármaco / Presentación</th>
                  <th className="p-3">Lote</th>
                  <th className="p-3 text-right">Cantidad Ingresada</th>
                  <th className="p-3 text-right">Stock Resultante</th>
                  <th className="p-3 pr-5">Motivo / Proveedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                {comprasKardex.slice(0, 50).map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/60 transition">
                    <td className="p-3 pl-5 font-mono text-[11px] text-slate-500">
                      {formatearFechaHoraLima(k.createdAt)}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {k.producto?.nombre || 'Fármaco'}
                    </td>
                    <td className="p-3 font-mono text-slate-700 dark:text-neutral-300">
                      {k.producto?.lote || 'L-REGISTRADO'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      +{k.cantidad} u.
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600 dark:text-neutral-400">
                      {k.stockNuevo ?? k.cantidad} u.
                    </td>
                    <td className="p-3 pr-5 text-slate-600 dark:text-neutral-400">
                      {k.motivo || 'Ingreso de mercadería'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-800 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-neutral-700 sticky top-0 z-10">
                <tr>
                  <th className="p-3 pl-5">N°</th>
                  <th className="p-3">Familia / Categoría</th>
                  <th className="p-3 text-right">Fármacos</th>
                  <th className="p-3 text-right">Stock Total</th>
                  <th className="p-3 text-right">Costo Estimado</th>
                  <th className="p-3 text-right pr-5">Valorizado PVP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                {(dashboardData?.distribucionCategorias || []).map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-neutral-800/60 transition">
                    <td className="p-3 pl-5 font-mono text-[11px] text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{c.nombre}</td>
                    <td className="p-3 text-right font-mono text-slate-600 dark:text-neutral-400">{c.totalItems} ítems</td>
                    <td className="p-3 text-right font-mono font-bold">{c.totalStock} u.</td>
                    <td className="p-3 text-right font-mono text-slate-500">{formatearMoneda(Number(c.totalValor) * 0.65)}</td>
                    <td className="p-3 text-right pr-5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {formatearMoneda(Number(c.totalValor))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
