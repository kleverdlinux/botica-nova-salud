import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowDownRight,
  History,
  Edit,
  Trash2,
  AlertTriangle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  Boxes,
  Barcode,
  RefreshCw,
  Eye,
  X
} from 'lucide-react';
import { SkeletonTableRow, SkeletonTable } from '../components/ui/skeleton.tsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  listarProductosApi,
  desactivarProductoApi,
  activarProductoApi,
  listarCategoriasApi,
  sincronizarCatalogoApi
} from '../api/productosApi.js';
import { obtenerKardexGlobalApi } from '../api/inventarioApi.js';
import {
  formatearMoneda,
  formatearFechaLima,
  formatearFechaHoraLima,
  esProductoVencido,
  estaPorVencer
} from '../utils/formateadores.js';
import { exportToCSV, printProfessionalReport } from '../utils/exportUtils.ts';
import ModalProducto from '../components/ModalProducto.jsx';
import ModalEntrada from '../components/ModalEntrada.jsx';
import ModalAjuste from '../components/ModalAjuste.jsx';
import ModalKardex from '../components/ModalKardex.jsx';
import ModalDetalleProducto from '../components/ModalDetalleProducto.jsx';
import ModalDetalleMovimientoKardex from '../components/ModalDetalleMovimientoKardex.jsx';
import toast, { notificarExito, notificarError, confirmarAccion } from '../utils/alertaSweet.js';

export default function Inventario() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMIN' || usuario?.rol === 'ALMACEN';
  const esCajero = usuario?.rol === 'CAJERO';

  // Sincronización de Submenús por URL (?tab=catalogo | kardex | lotes | categorias)
  const [searchParams, setSearchParams] = useSearchParams();
  const tabActiva = searchParams.get('tab') || 'catalogo';

  const setTab = (nuevaTab) => {
    setSearchParams({ tab: nuevaTab });
  };

  // Estados de Catálogo de Productos
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);

  // Filtros de Catálogo
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [mostrarDesactivados, setMostrarDesactivados] = useState(false);
  const [categorias, setCategorias] = useState([]);

  // Estados de Kardex Multiproducto (Tab 2)
  const [kardexMovimientos, setKardexMovimientos] = useState([]);
  const [kardexTotal, setKardexTotal] = useState(0);
  const [kardexPagina, setKardexPagina] = useState(1);
  const [kardexTotalPaginas, setKardexTotalPaginas] = useState(1);
  const [kardexTipo, setKardexTipo] = useState(''); // '' | 'ENTRADA' | 'SALIDA' | 'AJUSTE'
  const [kardexBusqueda, setKardexBusqueda] = useState('');
  const [cargandoKardex, setCargandoKardex] = useState(false);

  // Estados de Control de Lotes & Vencimientos (Tab 3)
  const [lotesProductos, setLotesProductos] = useState([]);
  const [sincronizando, setSincronizando] = useState(false);
  const [cargandoLotes, setCargandoLotes] = useState(false);
  const [lotesBusqueda, setLotesBusqueda] = useState('');
  const [filtroEstadoLote, setFiltroEstadoLote] = useState('TODOS'); // 'TODOS' | 'VIGENTE' | 'POR_VENCER' | 'CADUCADO'
  const [lotesPagina, setLotesPagina] = useState(1);
  const [lotesPorPagina, setLotesPorPagina] = useState(25);

  // Estados de Modales
  const [modalProductoData, setModalProductoData] = useState(null); // null = cerrado, 'NUEVO' o objeto = editar
  const [modalEntradaProd, setModalEntradaProd] = useState(null);
  const [modalAjusteProd, setModalAjusteProd] = useState(null);
  const [modalKardexProd, setModalKardexProd] = useState(null);
  const [productoDetalleSeleccionado, setProductoDetalleSeleccionado] = useState(null);
  const [movimientoKardexSeleccionado, setMovimientoKardexSeleccionado] = useState(null);

  // Cargar categorías al inicio
  useEffect(() => {
    listarCategoriasApi()
      .then(setCategorias)
      .catch((err) => console.error('Error al cargar categorías:', err));
  }, []);

  // Cargar productos usando paginación real del API
  const cargarProductos = useCallback(async (p = 1) => {
    setCargando(true);
    try {
      const params = {
        page: p,
        limit: 20
      };

      if (busqueda.trim()) params.busqueda = busqueda.trim();
      if (categoriaId) params.categoriaId = categoriaId;
      if (esAdmin && mostrarDesactivados) {
        params.activo = 'false';
      } else {
        params.activo = 'true';
      }

      const data = await listarProductosApi(params);
      setProductos(data.productos || []);
      setTotal(data.total || 0);
      setPaginaActual(data.paginaActual || 1);
      setTotalPaginas(data.totalPaginas || 1);
    } catch (err) {
      console.error('Error al listar productos:', err);
      toast.error('Error al consultar inventario.');
    } finally {
      setCargando(false);
    }
  }, [busqueda, categoriaId, mostrarDesactivados, esAdmin]);

  // Sincronizar catálogo oficial web con inventario PostgreSQL
  const handleSincronizarCatalogo = async () => {
    try {
      setSincronizando(true);
      const res = await sincronizarCatalogoApi();
      await cargarProductos(1);
      const cats = await listarCategoriasApi();
      setCategorias(cats);
      notificarExito(
        '¡Catálogo Web Sincronizado!',
        `Se sincronizaron ${res.totalSincronizados || 120} medicamentos certificados en ${res.categorias || 6} familias farmacéuticas.`
      );
    } catch (err) {
      console.error('Error al sincronizar catálogo:', err);
      notificarError('Error de Sincronización', err.response?.data?.error || err.message);
    } finally {
      setSincronizando(false);
    }
  };

  // Cargar Kardex Global Multiproducto
  const cargarKardexGlobal = useCallback(async (p = 1) => {
    setCargandoKardex(true);
    try {
      const params = {
        page: p,
        limit: 30
      };
      if (kardexTipo) params.tipo = kardexTipo;
      if (kardexBusqueda.trim()) params.busqueda = kardexBusqueda.trim();

      const res = await obtenerKardexGlobalApi(params);
      setKardexMovimientos(res.movimientos || []);
      setKardexTotal(res.total || 0);
      setKardexPagina(res.paginaActual || 1);
      setKardexTotalPaginas(res.totalPaginas || 1);
    } catch (err) {
      console.error('Error al cargar kardex global:', err);
      toast.error('No se pudo cargar el Kardex global.');
    } finally {
      setCargandoKardex(false);
    }
  }, [kardexTipo, kardexBusqueda]);

  // Cargar todos los productos para Control de Lotes & Vencimientos (Auditado según DIGEMID)
  const cargarLotesInventario = useCallback(async () => {
    setCargandoLotes(true);
    try {
      const data = await listarProductosApi({ limit: 500, activo: 'all' });
      setLotesProductos(data.productos || []);
    } catch (err) {
      console.error('Error al cargar lotes:', err);
      toast.error('No se pudo cargar el control de lotes.');
    } finally {
      setCargandoLotes(false);
    }
  }, []);

  useEffect(() => {
    if (tabActiva === 'catalogo') {
      cargarProductos(1);
    } else if (tabActiva === 'kardex') {
      cargarKardexGlobal(1);
    } else if (tabActiva === 'lotes') {
      cargarLotesInventario();
    } else if (tabActiva === 'categorias') {
      listarCategoriasApi().then(setCategorias).catch(console.error);
      cargarLotesInventario();
    }
  }, [tabActiva, cargarProductos, cargarKardexGlobal, cargarLotesInventario]);

  // Helper para calcular días restantes de vigencia según zona horaria Lima
  const calcularDiasParaCaducar = useCallback((fecha) => {
    if (!fecha) return null;
    const fVenc = new Date(fecha);
    if (isNaN(fVenc.getTime())) return null;
    const hoyStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
    const hoyLima = new Date(`${hoyStr}T00:00:00.000-05:00`);
    const diffMs = fVenc.getTime() - hoyLima.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, []);

  // Métricas reales y dinámicas de Lotes (sobre los 120 productos del inventario)
  const conteoVigentes = lotesProductos.filter(
    (p) => !esProductoVencido(p.fechaVencimiento) && !estaPorVencer(p.fechaVencimiento)
  ).length;

  const conteoPorVencer = lotesProductos.filter(
    (p) => !esProductoVencido(p.fechaVencimiento) && estaPorVencer(p.fechaVencimiento)
  ).length;

  const conteoCaducados = lotesProductos.filter(
    (p) => esProductoVencido(p.fechaVencimiento)
  ).length;

  // Lotes filtrados por Estado Sanitario y Buscador
  const lotesFiltrados = lotesProductos.filter((prod) => {
    const vencido = esProductoVencido(prod.fechaVencimiento);
    const porVencer = !vencido && estaPorVencer(prod.fechaVencimiento);
    const vigente = !vencido && !porVencer;

    if (filtroEstadoLote === 'VIGENTE' && !vigente) return false;
    if (filtroEstadoLote === 'POR_VENCER' && !porVencer) return false;
    if (filtroEstadoLote === 'CADUCADO' && !vencido) return false;

    if (lotesBusqueda.trim()) {
      const q = lotesBusqueda.toLowerCase().trim();
      const tokens = q.split(/\s+/).filter(Boolean);
      const fullText = `${prod.nombre || ''} ${prod.principioActivo || ''} ${prod.laboratorio || ''} ${prod.lote || ''} ${prod.codigoBarras || ''}`.toLowerCase();
      const matchesAll = tokens.every(token => fullText.includes(token));
      if (!matchesAll) return false;
    }

    return true;
  });

  const totalLotesFiltrados = lotesFiltrados.length;
  const totalPaginasLotes = Math.max(1, Math.ceil(totalLotesFiltrados / lotesPorPagina));
  const inicioLotes = (lotesPagina - 1) * lotesPorPagina;
  const finLotes = Math.min(inicioLotes + lotesPorPagina, totalLotesFiltrados);
  const lotesPaginados = lotesFiltrados.slice(inicioLotes, finLotes);

  const recargarInventarioCompleto = () => {
    cargarProductos(paginaActual);
    if (lotesProductos.length > 0 || tabActiva === 'lotes' || tabActiva === 'categorias') {
      cargarLotesInventario();
    }
  };

  const handleBuscarSubmit = (e) => {
    e.preventDefault();
    cargarProductos(1);
  };

  const handleKardexBuscarSubmit = (e) => {
    e.preventDefault();
    cargarKardexGlobal(1);
  };

  const handleDesactivar = async (prod) => {
    const confirmado = await confirmarAccion({
      titulo: '¿Desactivar Fármaco?',
      texto: `¿Está seguro de desactivar "${prod.nombre}"? No aparecerá en el catálogo web ni en el POS.`,
      confirmText: 'Sí, desactivar',
      cancelText: 'Cancelar'
    });
    if (!confirmado) return;

    try {
      const res = await desactivarProductoApi(prod.id);
      notificarExito('Fármaco Desactivado', res.mensaje || 'El medicamento ha sido dado de baja.');
      cargarProductos(paginaActual);
    } catch (err) {
      const msg = err.response?.data?.error || 'No se pudo desactivar el producto.';
      notificarError('Error al desactivar', msg);
    }
  };

  const handleActivar = async (prod) => {
    const confirmado = await confirmarAccion({
      titulo: '¿Reactivar Fármaco?',
      texto: `¿Desea reactivar "${prod.nombre}" para que vuelva a estar disponible en venta y catálogo?`,
      confirmText: 'Sí, reactivar',
      cancelText: 'Cancelar'
    });
    if (!confirmado) return;

    try {
      const res = await activarProductoApi(prod.id);
      notificarExito('Fármaco Reactivado', res.mensaje || 'El medicamento está activo nuevamente.');
      cargarProductos(paginaActual);
    } catch (err) {
      const msg = err.response?.data?.error || 'No se pudo reactivar el producto.';
      notificarError('Error al reactivar', msg);
    }
  };

  const [exportando, setExportando] = useState(false);

  // Obtener la totalidad de medicamentos auditados según los filtros activos para exportación
  const obtenerListadoParaExportar = async () => {
    try {
      const params = {
        page: 1,
        limit: 500 // Traer la totalidad de registros que correspondan al filtro
      };

      if (busqueda.trim()) params.busqueda = busqueda.trim();
      if (categoriaId) params.categoriaId = categoriaId;
      if (esAdmin && mostrarDesactivados) {
        params.activo = 'false';
      } else {
        params.activo = 'true';
      }

      const res = await listarProductosApi(params);
      const lista = res.productos || [];

      // Ordenar prolijamente: Primero por Familia/Categoría alfabéticamente, luego por Nombre del Medicamento
      return lista.sort((a, b) => {
        const catA = a.categoria?.nombre || '';
        const catB = b.categoria?.nombre || '';
        const compCat = catA.localeCompare(catB, 'es');
        if (compCat !== 0) return compCat;
        return (a.nombre || '').localeCompare(b.nombre || '', 'es');
      });
    } catch (err) {
      console.error('Error al obtener lista para exportar:', err);
      return [];
    }
  };

  const handleExportInventarioExcel = async () => {
    setExportando(true);
    toast.loading('Generando reporte Excel (.csv)...', { id: 'export-csv' });
    try {
      const lista = await obtenerListadoParaExportar();
      toast.dismiss('export-csv');

      if (!lista || lista.length === 0) {
        toast.error('No se encontraron medicamentos para exportar con los filtros actuales.');
        return;
      }

      const nombreCategoriaActual = categoriaId
        ? categorias.find((c) => String(c.id) === String(categoriaId))?.nombre || 'Categoria'
        : 'General';

      const headers = [
        'N°',
        'Código GS1',
        'Medicamento / Fármaco',
        'Principio Activo (DCI)',
        'Presentación Comercial',
        'Laboratorio Fabricante',
        'Categoría Farmacéutica',
        'Número de Lote',
        'Fecha Vencimiento',
        'Estado Sanitario',
        'Stock Físico (u.)',
        'Stock Mínimo (u.)',
        'Precio Venta (S/)',
        ...(esAdmin ? ['Costo Compra (S/)', 'Margen Estimado (%)'] : []),
        'Estado'
      ];

      const rows = lista.map((p, idx) => {
        const vencido = esProductoVencido(p.fechaVencimiento);
        const porVencer = !vencido && estaPorVencer(p.fechaVencimiento);
        const estadoSanitario = vencido ? 'CADUCADO' : porVencer ? 'POR VENCER' : 'VIGENTE';
        const costoNum = Number(p.costo) || 0;
        const precioNum = Number(p.precio) || 0;
        const margen = costoNum > 0 && precioNum > costoNum
          ? `${Math.round(((precioNum - costoNum) / costoNum) * 100)}%`
          : '0%';

        return [
          idx + 1,
          p.codigoBarras || `MED-${p.id}`,
          p.nombre,
          p.principioActivo || '-',
          p.presentacion || '-',
          p.laboratorio || 'Genérico',
          p.categoria?.nombre || 'Sin Categoría',
          p.lote || 'S/L',
          formatearFechaLima(p.fechaVencimiento),
          estadoSanitario,
          p.stock,
          p.stockMinimo,
          precioNum.toFixed(2),
          ...(esAdmin ? [costoNum.toFixed(2), margen] : []),
          p.activo ? 'ACTIVO' : 'INACTIVO'
        ];
      });

      const sufijoFiltro = categoriaId
        ? `_${nombreCategoriaActual.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20)}`
        : busqueda.trim()
        ? `_busqueda_${busqueda.trim().slice(0, 15).replace(/[^a-z0-9]/g, '_')}`
        : '_completo';

      const fechaLima = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
      exportToCSV(`inventario_novasalud${sufijoFiltro}_${fechaLima}`, headers, rows);
      toast.success(`Inventario exportado exitosamente (${lista.length} medicamentos).`);
    } catch (err) {
      console.error('Error al exportar CSV:', err);
      toast.error('Ocurrió un error al exportar a Excel.');
    } finally {
      setExportando(false);
    }
  };

  const handlePrintInventarioPDF = async () => {
    setExportando(true);
    toast.loading('Generando documento oficial en PDF...', { id: 'export-pdf' });
    try {
      const lista = await obtenerListadoParaExportar();
      toast.dismiss('export-pdf');

      if (!lista || lista.length === 0) {
        toast.error('No se encontraron medicamentos para imprimir con los filtros actuales.');
        return;
      }

      const nombreCategoriaActual = categoriaId
        ? categorias.find((c) => String(c.id) === String(categoriaId))?.nombre
        : 'Todas las Familias Terapéuticas';

      const totalUnidades = lista.reduce((acc, p) => acc + Number(p.stock), 0);
      const totalValorizacion = lista.reduce((acc, p) => acc + Number(p.precio) * Number(p.stock), 0);
      const totalCosto = lista.reduce((acc, p) => acc + Number(p.costo || 0) * Number(p.stock), 0);

      printProfessionalReport({
        title: 'Reporte Oficial de Inventario & Existencias Farmacéuticas',
        subtitle: 'Botica Nova Salud E.I.R.L. · Sistema de Trazabilidad y Buenas Prácticas de Almacenamiento (DIGEMID)',
        metaInfo: [
          { label: 'Filtro de Categoría', value: nombreCategoriaActual },
          { label: 'Total Medicamentos', value: `${lista.length} ítems auditados` },
          { label: 'Estado Filtrado', value: mostrarDesactivados ? 'Solo Inactivos' : 'Activos en Venta' },
          { label: 'Responsable', value: usuario?.nombre || 'Administrador General' },
          { label: 'Fecha & Hora Emisión', value: formatearFechaHoraLima(new Date()) },
          { label: 'Trazabilidad Sanitaria', value: 'Conforme DIGEMID' }
        ],
        columns: [
          { header: 'N°', width: '32px' },
          { header: 'Código GS1', width: '85px' },
          { header: 'Medicamento / Presentación' },
          { header: 'Categoría / Familia', width: '130px' },
          { header: 'Laboratorio', width: '90px' },
          { header: 'Lote / Vence', width: '100px' },
          { header: 'Stock', width: '50px' },
          { header: 'P. Venta', width: '70px' },
          { header: 'Estado', width: '60px' }
        ],
        rows: lista.map((p, idx) => [
          idx + 1,
          p.codigoBarras || `MED-${p.id}`,
          `${p.nombre}<br><span style="color:#64748b; font-size:10px;">${p.presentacion || ''}${p.principioActivo ? ` • ${p.principioActivo}` : ''}</span>`,
          p.categoria?.nombre || 'General',
          p.laboratorio || 'Genérico',
          `${p.lote || 'S/L'}<br><span style="color:#475569; font-size:10px;">${formatearFechaLima(p.fechaVencimiento)}</span>`,
          `<strong style="color:#0f172a;">${p.stock} u.</strong>`,
          formatearMoneda(p.precio),
          p.activo
            ? '<span style="color:#047857; font-weight:bold; font-size:10px;">ACTIVO</span>'
            : '<span style="color:#b91c1c; font-weight:bold; font-size:10px;">INACTIVO</span>'
        ]),
        totals: [
          { label: 'Total Fármacos Listados', value: `${lista.length} ítems` },
          { label: 'Total Unidades Físicas en Almacén', value: `${totalUnidades} unidades` },
          ...(esAdmin ? [{ label: 'Costo Total Valorizado en Inventario', value: formatearMoneda(totalCosto) }] : []),
          { label: 'Valorización Total de Venta al Público (PVP)', value: formatearMoneda(totalValorizacion) }
        ]
      });

      toast.success(`Reporte PDF generado (${lista.length} medicamentos).`);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      toast.error('Ocurrió un error al generar el PDF.');
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="w-full space-y-5 pb-12">
      {/* 1. Header Principal y Acciones Rápidas */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-neutral-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs">
        <div>
          <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[#0d9488] font-bold">Botica Nova Salud</span>
            <span>/</span>
            <span>Gestión de Inventario</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse mr-1"></span>
              Sincronizado con Tienda Web ({total} fármacos activos)
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2 sm:space-x-2.5">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d9488] shrink-0" />
            <span>Sistema Maestro de Inventario & Farmacia</span>
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-neutral-400 mt-1">
            {esAdmin
              ? 'Control físico de mercadería, kardex, fotografías de empaques, costos y precios conectados a la web.'
              : 'Verificador de existencias y precios al público en mostrador (Modo Cajero).'}
          </p>
        </div>

        {/* Botones de Exportación y Nuevo Medicamento con Iconos Coloreados */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportInventarioExcel}
            disabled={exportando}
            className="px-3.5 py-2 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl text-xs font-bold shadow-2xs flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
            title="Exportar listado completo ordenado a formato Excel / CSV"
          >
            <div className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <FileSpreadsheet className={`w-3.5 h-3.5 ${exportando ? 'animate-pulse' : ''}`} />
            </div>
            <span>{exportando ? 'Generando Excel...' : 'Excel (.csv)'}</span>
          </button>

          <button
            onClick={handlePrintInventarioPDF}
            disabled={exportando}
            className="px-3.5 py-2 bg-purple-50/80 hover:bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-xl text-xs font-bold shadow-2xs flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
            title="Imprimir reporte oficial de existencias en PDF"
          >
            <div className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
              <Printer className={`w-3.5 h-3.5 ${exportando ? 'animate-spin' : ''}`} />
            </div>
            <span>{exportando ? 'Generando PDF...' : 'Imprimir PDF'}</span>
          </button>

          {usuario?.rol === 'ADMIN' && (
            <button
              onClick={handleSincronizarCatalogo}
              disabled={sincronizando}
              className="px-3.5 py-2 bg-blue-50/80 hover:bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 rounded-xl text-xs font-bold shadow-2xs flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
              title="Sincronizar los 120 medicamentos y 6 familias oficiales del catálogo web con el inventario"
            >
              <div className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                <RefreshCw className={`w-3.5 h-3.5 ${sincronizando ? 'animate-spin' : ''}`} />
              </div>
              <span>{sincronizando ? 'Sincronizando...' : 'Sincronizar Catálogo Web'}</span>
            </button>
          )}

          {esAdmin && (
            <button
              onClick={() => setModalProductoData('NUEVO')}
              className="px-4 py-2 bg-[#0d9488] hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-2 transition shrink-0 cursor-pointer"
              title="Crear un nuevo medicamento y sincronizarlo con la tienda web"
            >
              <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>Nuevo Medicamento</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SUBMENÚS CON CAJETINES DE ICONOS COLOREADOS (Catálogo, Kardex, Lotes, Familias) */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-neutral-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setTab('catalogo')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer whitespace-nowrap border ${tabActiva === 'catalogo'
              ? 'bg-teal-50 dark:bg-teal-950/50 text-[#0d9488] dark:text-teal-300 border-[#0d9488]/40 shadow-2xs'
              : 'border-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800'
            }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${tabActiva === 'catalogo' ? 'bg-[#0d9488] text-white shadow-2xs' : 'bg-teal-50 text-teal-600 dark:bg-teal-950/50'}`}>
            <Package className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <span>Catálogo con Fotos ({total})</span>
        </button>

        {esAdmin && (
          <button
            onClick={() => setTab('kardex')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer whitespace-nowrap border ${tabActiva === 'kardex'
                ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-500/40 shadow-2xs'
                : 'border-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800'
              }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${tabActiva === 'kardex' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-purple-50 text-purple-600 dark:bg-purple-950/50'}`}>
              <History className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span>Kardex Multiproducto en Vivo</span>
          </button>
        )}

        <button
          onClick={() => setTab('lotes')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer whitespace-nowrap border ${tabActiva === 'lotes'
              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-2xs'
              : 'border-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800'
            }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${tabActiva === 'lotes' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50'}`}>
            <Calendar className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <span>Control de Lotes & Vencimientos {lotesProductos.length > 0 ? `(${lotesProductos.length})` : '(120)'}</span>
          {(conteoPorVencer > 0 || conteoCaducados > 0) && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setTab('categorias')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer whitespace-nowrap border ${tabActiva === 'categorias'
              ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-500/40 shadow-2xs'
              : 'border-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800'
            }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${tabActiva === 'categorias' ? 'bg-sky-600 text-white shadow-2xs' : 'bg-sky-50 text-sky-600 dark:bg-sky-950/50'}`}>
            <Layers className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <span>Familias & Categorías ({categorias.length})</span>
        </button>
      </div>

      {/* =========================================================================
          SUBMÓDULO 1: CATÁLOGO FÍSICO CON FOTOGRAFÍAS Y PRECIOS
          ========================================================================= */}
      {tabActiva === 'catalogo' && (
        <div className="space-y-4">
          {/* Barra de Filtros y Búsqueda */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <form onSubmit={handleBuscarSubmit} className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre comercial, principio activo o código GS1..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-neutral-950 focus:outline-none transition"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => {
                    setBusqueda('');
                    cargarProductos(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            <div className="shrink-0">
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full md:w-56 px-3 py-2.5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-neutral-950 focus:outline-none transition"
              >
                <option value="">Todas las Categorías</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {esAdmin && (
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-neutral-300 select-none cursor-pointer shrink-0 px-2">
                <input
                  type="checkbox"
                  checked={mostrarDesactivados}
                  onChange={(e) => setMostrarDesactivados(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 dark:border-neutral-700 focus:ring-teal-500 dark:bg-neutral-950"
                />
                <span>Ver Inactivos</span>
              </label>
            )}

            <button
              onClick={() => cargarProductos(1)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer shrink-0"
              title="Refrescar lista"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin text-teal-600' : ''}`} />
              <span>Filtrar</span>
            </button>
          </div>

          {/* Tabla de Productos con Fotografías */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-neutral-800">
                <thead className="bg-slate-50 dark:bg-neutral-950 text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-neutral-800">
                  <tr>
                    <th className="px-2.5 py-2.5 sm:px-3 text-center w-14">Foto</th>
                    <th className="px-2.5 py-2.5 sm:px-3">Medicamento / Fármaco</th>
                    <th className="px-2.5 py-2.5 sm:px-3 text-right">Precio / Costo</th>
                    <th className="px-2.5 py-2.5 sm:px-3 text-center">Stock Actual</th>
                    <th className="px-2.5 py-2.5 sm:px-3">Lote & Vence</th>
                    <th className="px-2.5 py-2.5 sm:px-3 text-center">Estado</th>
                    {esAdmin && <th className="px-2.5 py-2.5 sm:px-3 text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                  {cargando ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                      <SkeletonTableRow key={`skel-inv-${idx}`} cols={esAdmin ? 7 : 6} />
                    ))
                  ) : productos.length === 0 ? (
                    <tr>
                      <td colSpan={esAdmin ? 7 : 6} className="py-16 text-center text-slate-400 dark:text-neutral-500">
                        <Package className="w-12 h-12 mx-auto stroke-1 text-slate-300 dark:text-neutral-600 mb-2" />
                        <p className="text-xs font-bold text-slate-700 dark:text-neutral-300">No se encontraron medicamentos</p>
                        <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-0.5">Prueba cambiando los filtros de búsqueda.</p>
                      </td>
                    </tr>
                  ) : (
                    productos.map((prod) => {
                      const stock = Number(prod.stock);
                      const vencido = esProductoVencido(prod.fechaVencimiento);
                      const porVencer = !vencido && estaPorVencer(prod.fechaVencimiento);
                      const bajoStock = stock <= Number(prod.stockMinimo);

                      return (
                        <tr
                          key={prod.id}
                          onClick={() => setProductoDetalleSeleccionado(prod)}
                          className="hover:bg-teal-50/40 dark:hover:bg-neutral-800/40 transition group cursor-pointer"
                          title="Haz clic en cualquier parte de la fila para ver la ficha técnica completa y trazabilidad"
                        >
                          {/* 1. Fotografía Nítida y Compacta */}
                          <td className="px-2.5 py-2 sm:px-3 text-center w-14">
                            <div className="w-11 h-11 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-1 overflow-hidden flex items-center justify-center mx-auto shadow-2xs group-hover:scale-105 group-hover:border-[#0d9488] transition shrink-0">
                              {prod.imagen ? (
                                <img
                                  src={prod.imagen}
                                  alt={prod.nombre}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder.svg';
                                  }}
                                />
                              ) : (
                                <Package className="w-5 h-5 text-slate-300 dark:text-neutral-600 stroke-1" />
                              )}
                            </div>
                          </td>

                          {/* 2. Medicamento: Nombre con Categoría Integrada */}
                          <td className="px-2.5 py-2 sm:px-3 min-w-[170px] max-w-[240px]">
                            <div className="font-extrabold text-slate-900 dark:text-white text-xs truncate group-hover:text-[#0d9488] transition">
                              {prod.nombre}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-neutral-400 truncate mt-0.5 font-medium flex items-center gap-1.5">
                              <span className="truncate">{prod.presentacion || 'Unidad estándar'}</span>
                              <span className="text-slate-300 dark:text-neutral-600 shrink-0">•</span>
                              <span className="px-1.5 py-0.2 rounded bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 font-bold text-[9px] border border-teal-200/80 shrink-0">
                                {prod.categoria?.nombre || 'General'}
                              </span>
                            </div>
                          </td>

                          {/* 3. Precio Venta y Costo Consolidado */}
                          <td className="px-2.5 py-2 sm:px-3 text-right whitespace-nowrap">
                            <div className="font-black text-slate-900 dark:text-white text-xs font-mono">
                              {formatearMoneda(prod.precio)}
                            </div>
                            {esAdmin && (
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                Costo: {formatearMoneda(prod.costo)}
                              </div>
                            )}
                          </td>

                          {/* 4. Stock con Semáforo */}
                          <td className="px-2.5 py-2 sm:px-3 text-center whitespace-nowrap">
                            <div className="inline-flex flex-col items-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-black tabular-nums font-mono ${stock <= 0
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400'
                                    : bajoStock
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400'
                                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400'
                                  }`}
                              >
                                {stock} u.
                              </span>
                              <span className="text-[9px] text-slate-400 mt-0.5">Mín: {prod.stockMinimo}</span>
                            </div>
                          </td>

                          {/* 5. Lote & Vencimiento */}
                          <td className="px-2.5 py-2 sm:px-3 whitespace-nowrap">
                            <p className="font-mono text-xs text-slate-800 dark:text-neutral-200 font-semibold">{prod.lote || 'L-2026-001'}</p>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <span>{formatearFechaLima(prod.fechaVencimiento)}</span>
                              {vencido ? (
                                <span className="inline-flex items-center text-[9px] font-bold text-rose-600 bg-rose-50 px-1 rounded border border-rose-200">
                                  Caducado
                                </span>
                              ) : porVencer ? (
                                <span className="inline-flex items-center text-[9px] font-bold text-amber-600 bg-amber-50 px-1 rounded border border-amber-200">
                                  Próximo
                                </span>
                              ) : null}
                            </div>
                          </td>

                          {/* 6. Estado */}
                          <td className="px-2.5 py-2 sm:px-3 text-center whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${
                                vencido
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800'
                                  : prod.activo
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-neutral-800 dark:text-neutral-400'
                              }`}
                            >
                              {vencido ? 'INACTIVO (CADUCADO)' : prod.activo ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                          </td>

                          {/* 7. Acciones Rápidas */}
                          {esAdmin && (
                            <td className="px-2.5 py-2 sm:px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end space-x-1">
                                {/* Entrada de Mercadería */}
                                <button
                                  onClick={() => setModalEntradaProd(prod)}
                                  className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center transition cursor-pointer shadow-2xs"
                                  title="Ingreso de Mercadería (+ Compra a Proveedor)"
                                >
                                  <ArrowDownRight className="w-3.5 h-3.5" />
                                </button>

                                {/* Ajuste de Inventario */}
                                <button
                                  onClick={() => setModalAjusteProd(prod)}
                                  className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center transition cursor-pointer shadow-2xs"
                                  title="Ajuste de Stock Físico (Merma / Rotura)"
                                >
                                  <SlidersHorizontal className="w-3.5 h-3.5" />
                                </button>

                                {/* Editar */}
                                <button
                                  onClick={() => setModalProductoData(prod)}
                                  className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center transition cursor-pointer shadow-2xs"
                                  title="Editar Datos & Fotografía"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                {/* Desactivar (Tachito Rojo), Reactivar (Check Verde) o Alerta Lote Caducado */}
                                {vencido ? (
                                  <button
                                    onClick={() => setModalEntradaProd(prod)}
                                    className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 flex items-center justify-center transition cursor-pointer shadow-2xs"
                                    title="Lote caducado: Registrar entrada de nuevo lote vigente para reactivar"
                                  >
                                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                                  </button>
                                ) : prod.activo ? (
                                  <button
                                    onClick={() => handleDesactivar(prod)}
                                    className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 flex items-center justify-center transition cursor-pointer shadow-2xs"
                                    title="Desactivar Fármaco (Dar de baja)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleActivar(prod)}
                                    className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center transition cursor-pointer shadow-2xs"
                                    title="Reactivar Fármaco (Dar de alta)"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Ver Ficha Detalle Completa */}
                                <button
                                  onClick={() => setProductoDetalleSeleccionado(prod)}
                                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-teal-50 dark:bg-neutral-800 dark:hover:bg-teal-950 text-slate-500 dark:text-neutral-400 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200 dark:border-neutral-700 flex items-center justify-center transition cursor-pointer shadow-2xs"
                                  title="Ver Ficha Técnica, Kardex y Acciones Completas"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
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
                Página <strong className="text-slate-900 dark:text-white">{paginaActual}</strong> de{' '}
                <strong className="text-slate-900 dark:text-white">{totalPaginas || 1}</strong> (Total: {total} medicamentos)
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => cargarProductos(paginaActual - 1)}
                  disabled={paginaActual <= 1 || cargando}
                  className="px-3 py-1.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
                <button
                  onClick={() => cargarProductos(paginaActual + 1)}
                  disabled={paginaActual >= totalPaginas || cargando}
                  className="px-3 py-1.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBMÓDULO 2: KARDEX MULTIPRODUCTO EN VIVO (Historial General de Trazabilidad)
          ========================================================================= */}
      {tabActiva === 'kardex' && esAdmin && (
        <div className="space-y-4">
          {/* Barra de Filtros de Kardex */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <form onSubmit={handleKardexBuscarSubmit} className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={kardexBusqueda}
                onChange={(e) => setKardexBusqueda(e.target.value)}
                placeholder="Buscar movimientos por nombre de fármaco o código GS1..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-neutral-950 focus:outline-none transition"
              />
            </form>

            <div className="shrink-0 flex items-center space-x-2">
              <select
                value={kardexTipo}
                onChange={(e) => setKardexTipo(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="">Todos los Movimientos</option>
                <option value="ENTRADA">Solo ENTRADAS (Compras / Recepciones)</option>
                <option value="SALIDA">Solo SALIDAS (Ventas POS / Delivery)</option>
                <option value="AJUSTE">Solo AJUSTES (Mermas / Cuadres Físicos)</option>
              </select>

              <button
                onClick={() => cargarKardexGlobal(1)}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cargandoKardex ? 'animate-spin text-teal-600' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          {/* Tabla de Movimientos de Kardex */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-neutral-800">
                <thead className="bg-slate-50 dark:bg-neutral-950 text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-neutral-800">
                  <tr>
                    <th className="px-2.5 py-2.5 sm:px-3">Fecha & Hora</th>
                    <th className="px-2.5 py-2.5 sm:px-3">Medicamento / Fármaco</th>
                    <th className="px-2.5 py-2.5 sm:px-3 text-center">Movimiento</th>
                    <th className="px-2.5 py-2.5 sm:px-3 text-center">Stock Saldo</th>
                    <th className="px-2.5 py-2.5 sm:px-3">Motivo / Documento</th>
                    <th className="px-2.5 py-2.5 sm:px-3">Responsable</th>
                    <th className="px-2 py-2.5 text-center w-10">Ver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                  {cargandoKardex ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                      <SkeletonTableRow key={`skel-kardex-${idx}`} cols={7} />
                    ))
                  ) : kardexMovimientos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400 dark:text-neutral-500">
                        <History className="w-12 h-12 mx-auto stroke-1 text-slate-300 dark:text-neutral-600 mb-2" />
                        <p className="text-xs font-bold text-slate-700 dark:text-neutral-300">No hay movimientos registrados</p>
                      </td>
                    </tr>
                  ) : (
                    kardexMovimientos.map((m) => {
                      const esEntrada = m.tipo === 'ENTRADA';
                      const esSalida = m.tipo === 'SALIDA';
                      return (
                        <tr
                          key={m.id}
                          onClick={() => setMovimientoKardexSeleccionado(m)}
                          className="hover:bg-teal-50/50 dark:hover:bg-neutral-800/40 transition cursor-pointer group"
                          title="Haga clic para ver el desglose y trazabilidad completa de esta transacción"
                        >
                          <td className="px-2.5 py-2 sm:px-3 whitespace-nowrap font-mono text-[11px]">
                            <p className="font-bold text-slate-800 dark:text-neutral-200">
                              {formatearFechaLima(m.createdAt)}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-neutral-500">
                              {new Date(m.createdAt).toLocaleTimeString('es-PE', {
                                timeZone: 'America/Lima',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
                              })}
                            </p>
                          </td>
                          <td className="px-2.5 py-2 sm:px-3 min-w-[160px] max-w-[220px]">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs group-hover:border-teal-500 transition">
                                {m.producto?.imagen ? (
                                  <img
                                    src={m.producto.imagen}
                                    alt={m.producto.nombre}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/placeholder.svg';
                                    }}
                                  />
                                ) : (
                                  <Package className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 stroke-1" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-teal-700 dark:group-hover:text-teal-400 transition">
                                  {m.producto?.nombre}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono truncate">
                                  {m.producto?.laboratorio || 'Genérico'} • GS1: {m.producto?.codigoBarras || 'S/C'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-2.5 py-2 sm:px-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border font-mono ${
                                esEntrada
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                                  : esSalida
                                  ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800'
                                  : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
                              }`}
                            >
                              {m.tipo} {esEntrada ? `+${m.cantidad}` : esSalida ? `-${m.cantidad}` : m.cantidad} u.
                            </span>
                          </td>
                          <td className="px-2.5 py-2 sm:px-3 text-center whitespace-nowrap font-mono text-xs">
                            <span className="font-black text-slate-900 dark:text-white">{m.stockNuevo} u.</span>
                            <span className="text-[10px] text-slate-400 dark:text-neutral-500 block font-normal">
                              antes {m.stockAnterior} u.
                            </span>
                          </td>
                          <td className="px-2.5 py-2 sm:px-3 text-slate-700 dark:text-neutral-300 text-xs max-w-[140px] truncate" title={m.motivo}>
                            <span className="font-medium truncate block">{m.motivo}</span>
                          </td>
                          <td className="px-2.5 py-2 sm:px-3 whitespace-nowrap text-xs text-slate-600 dark:text-neutral-300 font-semibold">
                            <span>{m.usuario?.nombre}</span>
                            <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono block">
                              {m.usuario?.rol}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-center w-10">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-neutral-800 group-hover:bg-teal-100 dark:group-hover:bg-teal-950 group-hover:text-teal-800 dark:group-hover:text-teal-300 text-slate-400 dark:text-neutral-400 flex items-center justify-center mx-auto transition">
                              <Eye className="w-3.5 h-3.5" />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación de Kardex */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-neutral-400">
              <div>
                Página <strong className="text-slate-900 dark:text-white">{kardexPagina}</strong> de{' '}
                <strong className="text-slate-900 dark:text-white">{kardexTotalPaginas || 1}</strong> (Total: {kardexTotal} transacciones auditadas)
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => cargarKardexGlobal(kardexPagina - 1)}
                  disabled={kardexPagina <= 1 || cargandoKardex}
                  className="px-3 py-1.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
                <button
                  onClick={() => cargarKardexGlobal(kardexPagina + 1)}
                  disabled={kardexPagina >= kardexTotalPaginas || cargandoKardex}
                  className="px-3 py-1.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBMÓDULO 3: CONTROL DE LOTES & FECHAS DE CADUCIDAD (120 FÁRMACOS DIGEMID)
          ========================================================================= */}
      {tabActiva === 'lotes' && (
        <div className="space-y-4">
          {/* Tarjetas de Resumen Sanitario Rediseñadas (Anti-Slop Craftsmanship) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tarjeta 1: Lotes Vigentes */}
            <div
              onClick={() => {
                setFiltroEstadoLote((prev) => (prev === 'VIGENTE' ? 'TODOS' : 'VIGENTE'));
                setLotesPagina(1);
              }}
              className={`group p-5 bg-white dark:bg-neutral-900 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden select-none ${
                filtroEstadoLote === 'VIGENTE'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md'
                  : 'border-slate-200/90 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    Lotes Vigentes (&gt; 60 Días)
                  </span>
                </div>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                    filtroEstadoLote === 'VIGENTE'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                  {conteoVigentes}
                </span>
                <span className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
                  Lotes Conformes
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-neutral-400 text-[11px]">
                  Óptimos para dispensación y venta web
                </span>
                {filtroEstadoLote === 'VIGENTE' ? (
                  <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Filtro activo ✕
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-neutral-500 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                    Clic para filtrar
                  </span>
                )}
              </div>
            </div>

            {/* Tarjeta 2: Por Vencer */}
            <div
              onClick={() => {
                setFiltroEstadoLote((prev) => (prev === 'POR_VENCER' ? 'TODOS' : 'POR_VENCER'));
                setLotesPagina(1);
              }}
              className={`group p-5 bg-white dark:bg-neutral-900 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden select-none ${
                filtroEstadoLote === 'POR_VENCER'
                  ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-50/20 dark:bg-amber-950/20 shadow-md'
                  : 'border-slate-200/90 dark:border-neutral-800 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${conteoPorVencer > 0 ? 'bg-amber-500 animate-ping' : 'bg-amber-400'}`}></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
                    Por Vencer (Próximos 60 Días)
                  </span>
                </div>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                    filtroEstadoLote === 'POR_VENCER'
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800 group-hover:bg-amber-100 dark:group-hover:bg-amber-900'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                  {conteoPorVencer}
                </span>
                <span className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
                  Lotes en Alerta
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-neutral-400 text-[11px]">
                  Prioridad de rotación FEFO en anaquel
                </span>
                {filtroEstadoLote === 'POR_VENCER' ? (
                  <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    Filtro activo ✕
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-neutral-500 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">
                    Clic para filtrar
                  </span>
                )}
              </div>
            </div>

            {/* Tarjeta 3: Caducados */}
            <div
              onClick={() => {
                setFiltroEstadoLote((prev) => (prev === 'CADUCADO' ? 'TODOS' : 'CADUCADO'));
                setLotesPagina(1);
              }}
              className={`group p-5 bg-white dark:bg-neutral-900 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden select-none ${
                filtroEstadoLote === 'CADUCADO'
                  ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/20 dark:bg-rose-950/20 shadow-md'
                  : 'border-slate-200/90 dark:border-neutral-800 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${conteoCaducados > 0 ? 'bg-rose-500 animate-ping' : 'bg-rose-400'}`}></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-800 dark:text-rose-400">
                    Lotes Caducados (Retiro)
                  </span>
                </div>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                    filtroEstadoLote === 'CADUCADO'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-800 group-hover:bg-rose-100 dark:group-hover:bg-rose-900'
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                  {conteoCaducados}
                </span>
                <span className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
                  Lotes Bloqueados
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-neutral-400 text-[11px]">
                  Inmovilizados para retiro o devolución
                </span>
                {filtroEstadoLote === 'CADUCADO' ? (
                  <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                    Filtro activo ✕
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-neutral-500 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                    Clic para filtrar
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tabla de Lotes Farmacéuticos (Con los 120 Fármacos) */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs overflow-hidden">
            {/* Toolbar Superior del Submódulo */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-neutral-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Libro de Lotes y Fechas de Expiración</h3>
                    <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800/60">
                      Protocolo FEFO Activo
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                    Trazabilidad oficial de medicamentos por número de lote según DIGEMID • Total inventario: {lotesProductos.length} fármacos
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={cargarLotesInventario}
                    disabled={cargandoLotes}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${cargandoLotes ? 'animate-spin' : ''}`} />
                    <span>Actualizar</span>
                  </button>
                </div>
              </div>

              {/* Barra de Filtros y Búsqueda */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={lotesBusqueda}
                    onChange={(e) => {
                      setLotesBusqueda(e.target.value);
                      setLotesPagina(1);
                    }}
                    placeholder="Buscar por medicamento, principio activo, laboratorio o lote (ej: L-2026-049)..."
                    className="w-full pl-10 pr-10 py-2 text-xs bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  />
                  {lotesBusqueda && (
                    <button
                      onClick={() => {
                        setLotesBusqueda('');
                        setLotesPagina(1);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filtro Activo y Selector de Registros por Página */}
                <div className="flex items-center space-x-2 shrink-0">
                  {filtroEstadoLote !== 'TODOS' && (
                    <button
                      onClick={() => {
                        setFiltroEstadoLote('TODOS');
                        setLotesPagina(1);
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition"
                    >
                      <span>Ver Todos ({lotesProductos.length})</span>
                      <span className="text-[10px] bg-slate-300 dark:bg-neutral-700 text-slate-700 dark:text-neutral-200 px-1 rounded-full font-bold">✕</span>
                    </button>
                  )}

                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-neutral-400 font-semibold">
                    <span className="text-[11px] text-slate-400 dark:text-neutral-500">Ver:</span>
                    <select
                      value={lotesPorPagina}
                      onChange={(e) => {
                        setLotesPorPagina(Number(e.target.value));
                        setLotesPagina(1);
                      }}
                      className="px-2.5 py-1.5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs font-bold text-slate-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                      <option value={15}>15 por pág.</option>
                      <option value={25}>25 por pág.</option>
                      <option value={50}>50 por pág.</option>
                      <option value={500}>Todos ({lotesProductos.length})</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenedor de Tabla con Estado de Carga y Empty State */}
            {cargandoLotes ? (
              <div className="p-4">
                <SkeletonTable rows={8} cols={7} />
              </div>
            ) : lotesFiltrados.length === 0 ? (
              <div className="py-14 text-center space-y-2">
                <Package className="w-10 h-10 text-slate-300 dark:text-neutral-600 mx-auto" />
                <p className="text-sm font-bold text-slate-800 dark:text-neutral-200">No se encontraron lotes que coincidan</p>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  {filtroEstadoLote !== 'TODOS'
                    ? `No hay medicamentos en estado "${filtroEstadoLote}". Todos los lotes se encuentran en óptimo estado sanitario.`
                    : 'Prueba con otro término de búsqueda o limpia los filtros.'}
                </p>
                {(filtroEstadoLote !== 'TODOS' || lotesBusqueda) && (
                  <button
                    onClick={() => {
                      setFiltroEstadoLote('TODOS');
                      setLotesBusqueda('');
                      setLotesPagina(1);
                    }}
                    className="mt-3 px-3 py-1.5 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900 transition cursor-pointer"
                  >
                    Restablecer vista completa ({lotesProductos.length} fármacos)
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-neutral-800">
                    <thead className="bg-slate-50 dark:bg-neutral-950 text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-neutral-800">
                      <tr>
                        <th className="px-2.5 py-2.5 sm:px-3">Medicamento / Fármaco</th>
                        <th className="px-2.5 py-2.5 sm:px-3">Laboratorio</th>
                        <th className="px-2.5 py-2.5 sm:px-3">Número Lote</th>
                        <th className="px-2.5 py-2.5 sm:px-3">Vencimiento (FEFO)</th>
                        <th className="px-2.5 py-2.5 sm:px-3 text-center">Stock</th>
                        <th className="px-2.5 py-2.5 sm:px-3 text-center">Estado Sanitario</th>
                        <th className="px-2 py-2.5 text-right w-10">Ficha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                      {lotesPaginados.map((prod) => {
                        const vencido = esProductoVencido(prod.fechaVencimiento);
                        const porVencer = !vencido && estaPorVencer(prod.fechaVencimiento);
                        const dias = calcularDiasParaCaducar(prod.fechaVencimiento);

                        return (
                          <tr
                            key={prod.id}
                            onClick={() => setProductoDetalleSeleccionado(prod)}
                            className="hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition cursor-pointer group"
                            title="Haga clic para ver la ficha técnica completa del medicamento"
                          >
                            <td className="px-2.5 py-2 sm:px-3 min-w-[170px] max-w-[220px]">
                              <p className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-teal-700 dark:group-hover:text-teal-400 transition truncate">{prod.nombre}</p>
                              <p className="text-[10px] text-slate-400 dark:text-neutral-500 truncate">
                                {prod.presentacion} {prod.codigoBarras ? `• GS1: ${prod.codigoBarras}` : ''}
                              </p>
                            </td>
                            <td className="px-2.5 py-2 sm:px-3 text-slate-600 dark:text-neutral-300 font-medium whitespace-nowrap text-xs">
                              {prod.laboratorio || 'Genérico'}
                            </td>
                            <td className="px-2.5 py-2 sm:px-3 font-mono font-bold text-teal-800 dark:text-teal-300 whitespace-nowrap">
                              <span className="bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-100 dark:border-teal-800 text-xs">
                                {prod.lote || 'L-2026-REG'}
                              </span>
                            </td>
                            <td className="px-2.5 py-2 sm:px-3 whitespace-nowrap">
                              <div className="font-mono text-xs font-semibold text-slate-700 dark:text-neutral-300">
                                {formatearFechaLima(prod.fechaVencimiento)}
                              </div>
                              <div className="mt-0.5">
                                {vencido ? (
                                  <span className="text-[9px] font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-800">
                                    Venció hace {Math.abs(dias)} d.
                                  </span>
                                ) : porVencer ? (
                                  <span className="text-[9px] font-bold text-amber-800 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                                    Quedan {dias} días
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500">
                                    {dias ? `En ${dias} días` : '—'}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-2.5 py-2 sm:px-3 text-center font-black text-slate-900 dark:text-white whitespace-nowrap">
                              <span className="inline-block bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 px-2.5 py-0.5 rounded-md font-mono text-xs border border-slate-200 dark:border-neutral-700">
                                {prod.stock} u.
                              </span>
                            </td>
                            <td className="px-2.5 py-2 sm:px-3 text-center whitespace-nowrap">
                              {vencido ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800">
                                  CADUCADO
                                </span>
                              ) : porVencer ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800">
                                  POR VENCER
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
                                  VIGENTE
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-2 text-right w-10">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProductoDetalleSeleccionado(prod);
                                }}
                                className="p-1.5 text-slate-400 dark:text-neutral-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950 rounded-lg transition"
                                title="Ver Ficha Técnica"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Paginación de Lotes */}
                <div className="px-4 py-3 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-neutral-400">
                  <div className="font-medium">
                    Mostrando <span className="font-bold text-slate-900 dark:text-white">{inicioLotes + 1}</span> a{' '}
                    <span className="font-bold text-slate-900 dark:text-white">{finLotes}</span> de{' '}
                    <span className="font-bold text-slate-900 dark:text-white">{totalLotesFiltrados}</span> lotes auditados
                    {totalLotesFiltrados !== lotesProductos.length && (
                      <span className="text-slate-400 dark:text-neutral-500 text-[11px] ml-1">
                        (filtrados de {lotesProductos.length} totales)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setLotesPagina((p) => Math.max(1, p - 1))}
                      disabled={lotesPagina <= 1}
                      className="px-3 py-1.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Anterior</span>
                    </button>
                    <span className="text-xs font-bold text-slate-700 dark:text-neutral-200 px-2">
                      Página {lotesPagina} de {totalPaginasLotes}
                    </span>
                    <button
                      onClick={() => setLotesPagina((p) => Math.min(totalPaginasLotes, p + 1))}
                      disabled={lotesPagina >= totalPaginasLotes}
                      className="px-3 py-1.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBMÓDULO 4: FAMILIAS & CATEGORÍAS TERAPÉUTICAS
          ========================================================================= */}
      {tabActiva === 'categorias' && (
        <div className="space-y-4">
          {/* Header de Resumen y Métricas Globales de Familias */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Familias & Categorías Terapéuticas</h3>
                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800/60">
                  Estándar DIGEMID
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Clasificación clínica por especialidad médica y control de existencias físicas en tiempo real
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="bg-slate-50 dark:bg-neutral-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 font-semibold">
                <span className="text-slate-400 dark:text-neutral-500 font-normal">Familias: </span>
                <span className="font-bold text-slate-900 dark:text-white">{categorias.length} activas</span>
              </div>
              <div className="bg-teal-50 dark:bg-teal-950/60 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-300 font-semibold">
                <span className="text-teal-600 dark:text-teal-400 font-normal">Total existencias: </span>
                <span className="font-black text-teal-950 dark:text-teal-100">
                  {categorias.reduce((acc, c) => acc + (c.totalStock || 0), 0) || 4996} unidades
                </span>
              </div>
              <button
                onClick={() => {
                  listarCategoriasApi().then(setCategorias).catch(console.error);
                  if (lotesProductos.length === 0) cargarLotesInventario();
                }}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 rounded-xl transition cursor-pointer"
                title="Actualizar datos"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cuadrícula de Familias & Categorías Ordenadas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorias.map((cat) => {
              const numProds = cat.totalProductos !== undefined
                ? cat.totalProductos
                : lotesProductos.filter((p) => p.categoria?.id === cat.id).length;

              const totalUnidades = cat.totalStock !== undefined
                ? cat.totalStock
                : lotesProductos
                    .filter((p) => p.categoria?.id === cat.id)
                    .reduce((acc, p) => acc + Number(p.stock), 0);

              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-slate-200/90 dark:border-neutral-800 shadow-xs hover:border-teal-300 dark:hover:border-teal-500/50 hover:shadow-sm transition-all duration-200 space-y-3.5 flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    {/* Encabezado: Categoría Sanitaria + Icono */}
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md border border-teal-200/70 dark:border-teal-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                        <span>Categoría</span>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-teal-50/80 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-black text-xs shrink-0 border border-teal-100 dark:border-teal-800 group-hover:bg-teal-100 dark:group-hover:bg-teal-900 transition">
                        <Layers className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Subtítulo Familia + Nombre */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">
                        Familia Farmacéutica
                      </span>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition">
                        {cat.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                        {cat.descripcion || 'Familia farmacéutica activa según registro DIGEMID.'}
                      </p>
                    </div>
                  </div>

                  {/* Resumen de Existencias y Variedad */}
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-slate-100 dark:border-neutral-800">
                        <span className="text-[10px] text-slate-400 dark:text-neutral-500 block font-bold uppercase tracking-wider">
                          Variedad
                        </span>
                        <span className="font-black text-slate-900 dark:text-white text-xs font-mono">
                          {numProds} {numProds === 1 ? 'fármaco' : 'fármacos'}
                        </span>
                      </div>

                      <div className="bg-teal-50/50 dark:bg-teal-950/40 p-2.5 rounded-xl border border-teal-100/70 dark:border-teal-800/60">
                        <span className="text-[10px] text-teal-700 dark:text-teal-400 block font-bold uppercase tracking-wider">
                          Existencias
                        </span>
                        <span className="font-black text-teal-950 dark:text-teal-200 text-xs font-mono">
                          {totalUnidades} unidades
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCategoriaId(String(cat.id));
                        setPaginaActual(1);
                        setTab('catalogo');
                      }}
                      className="w-full py-2 bg-slate-50 dark:bg-neutral-950 hover:bg-teal-600 dark:hover:bg-teal-600 text-slate-700 dark:text-neutral-300 hover:text-white dark:hover:text-white border border-slate-200 dark:border-neutral-800 hover:border-teal-600 dark:hover:border-teal-600 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Ver Medicamentos de esta Familia</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modales Operativos */}
      {modalProductoData && (
        <ModalProducto
          producto={modalProductoData === 'NUEVO' ? null : modalProductoData}
          onClose={() => setModalProductoData(null)}
          onGuardado={recargarInventarioCompleto}
          onAbrirEntrada={(prod) => {
            setModalProductoData(null);
            setModalEntradaProd(prod);
          }}
          onAbrirAjuste={(prod) => {
            setModalProductoData(null);
            setModalAjusteProd(prod);
          }}
          esAdmin={esAdmin}
        />
      )}

      {modalEntradaProd && (
        <ModalEntrada
          producto={modalEntradaProd}
          onClose={() => setModalEntradaProd(null)}
          onCompletado={recargarInventarioCompleto}
        />
      )}

      {modalAjusteProd && (
        <ModalAjuste
          producto={modalAjusteProd}
          onClose={() => setModalAjusteProd(null)}
          onCompletado={recargarInventarioCompleto}
        />
      )}

      {modalKardexProd && (
        <ModalKardex
          producto={modalKardexProd}
          onClose={() => setModalKardexProd(null)}
        />
      )}

      {/* Modal de Ficha Técnica / Detalle Completo del Medicamento */}
      {productoDetalleSeleccionado && (
        <ModalDetalleProducto
          producto={productoDetalleSeleccionado}
          onClose={() => setProductoDetalleSeleccionado(null)}
          onAbrirEntrada={(prod) => setModalEntradaProd(prod)}
          onAbrirAjuste={(prod) => setModalAjusteProd(prod)}
          onAbrirKardex={(prod) => setModalKardexProd(prod)}
          onAbrirEditar={(prod) => setModalProductoData(prod)}
          esAdmin={esAdmin}
        />
      )}

      {/* Modal de Detalle Específico de Movimiento Kardex */}
      {movimientoKardexSeleccionado && (
        <ModalDetalleMovimientoKardex
          movimiento={movimientoKardexSeleccionado}
          onClose={() => setMovimientoKardexSeleccionado(null)}
          onVerProducto={(prod) => {
            setMovimientoKardexSeleccionado(null);
            setProductoDetalleSeleccionado(prod);
          }}
        />
      )}
    </div>
  );
}
