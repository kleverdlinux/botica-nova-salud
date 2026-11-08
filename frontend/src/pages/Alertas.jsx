import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
  Package,
  ArrowDownRight,
  Edit,
  Eye,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { obtenerAlertasApi } from '../api/alertasApi.js';
import {
  formatearMoneda,
  formatearFechaLima,
  calcularDiasParaCaducar
} from '../utils/formateadores.js';
import { SkeletonTableRow } from '../components/ui/skeleton.tsx';
import ModalEntrada from '../components/ModalEntrada.jsx';
import ModalProducto from '../components/ModalProducto.jsx';
import ModalDetalleProducto from '../components/ModalDetalleProducto.jsx';
import toast from '../utils/alertaSweet.js';

export default function Alertas() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMIN' || usuario?.rol === 'ALMACEN';

  const [tabActiva, setTabActiva] = useState('vencidos'); // 'vencidos' | 'porVencer' | 'bajoStock'
  const [alertas, setAlertas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Modales interactivos para resolver alertas in-situ
  const [productoParaEntrada, setProductoParaEntrada] = useState(null);
  const [productoParaEditar, setProductoParaEditar] = useState(null);
  const [productoParaDetalle, setProductoParaDetalle] = useState(null);

  const cargarAlertas = async () => {
    setCargando(true);
    try {
      const data = await obtenerAlertasApi();
      setAlertas(data);
    } catch (err) {
      console.error('Error al cargar alertas:', err);
      toast.error('No se pudieron consultar las alertas del sistema.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAlertas();
  }, []);

  const conteos = alertas?.conteos || { bajoStock: 0, porVencer: 0, vencidos: 0 };
  const listaBruta = alertas ? alertas[tabActiva] || [] : [];

  // Filtrado local por buscador
  const listaFiltrada = listaBruta.filter((p) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase().trim();
    return (
      p.nombre?.toLowerCase().includes(q) ||
      p.principioActivo?.toLowerCase().includes(q) ||
      p.lote?.toLowerCase().includes(q) ||
      p.codigoBarras?.toLowerCase().includes(q) ||
      p.laboratorio?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full space-y-5 pb-12">
      {/* 1. Encabezado Oficial */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-neutral-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs">
        <div>
          <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[#0d9488] dark:text-teal-400 font-bold">Botica Nova Salud</span>
            <span>/</span>
            <span>Alertas Sanitarias & Control de Existencias</span>
            {conteos.vencidos > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1"></span>
                {conteos.vencidos} lote(s) caducado(s)
              </span>
            )}
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2 sm:space-x-2.5">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d9488] dark:text-teal-400 shrink-0" />
            <span>Monitoreo de Alertas Sanitarias y Stock Físico</span>
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Trazabilidad DIGEMID · Detección automática de lotes vencidos, rotación FEFO preventiva y quiebres de existencias.
          </p>
        </div>

        <button
          onClick={cargarAlertas}
          disabled={cargando}
          className="px-4 py-2.5 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer disabled:opacity-50 shrink-0 border border-slate-200 dark:border-neutral-700"
          title="Consultar alertas en tiempo real"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin text-teal-600 dark:text-teal-400' : ''}`} />
          <span>Actualizar Alertas</span>
        </button>
      </div>

      {/* 2. Tarjetas de Resumen Interactivas (Anti-Slop Craftsmanship) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarjeta 1: Lotes Caducados (Prioridad Crítica) */}
        <div
          onClick={() => setTabActiva('vencidos')}
          className={`group p-5 bg-white dark:bg-neutral-900 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden select-none ${
            tabActiva === 'vencidos'
              ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/20 dark:bg-rose-950/20 shadow-md'
              : 'border-slate-200/90 dark:border-neutral-800 hover:border-rose-300 dark:hover:border-rose-800/60 hover:shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${conteos.vencidos > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-300 dark:bg-neutral-700'}`}></span>
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-800 dark:text-rose-400">
                Lotes Caducados (Retiro)
              </span>
            </div>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                tabActiva === 'vencidos'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-800 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/60'
              }`}
            >
              <XCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {conteos.vencidos}
            </span>
            <span className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
              {conteos.vencidos === 1 ? 'Lote Inmovilizado' : 'Lotes Inmovilizados'}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-neutral-400 text-[11px]">
              Bloqueados de venta web y mostrador POS
            </span>
            {tabActiva === 'vencidos' ? (
              <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                Viendo lista ✕
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-slate-400 dark:text-neutral-500 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                Clic para filtrar
              </span>
            )}
          </div>
        </div>

        {/* Tarjeta 2: Por Vencer (Protocolo FEFO ≤ 60 días) */}
        <div
          onClick={() => setTabActiva('porVencer')}
          className={`group p-5 bg-white dark:bg-neutral-900 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden select-none ${
            tabActiva === 'porVencer'
              ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-50/20 dark:bg-amber-950/20 shadow-md'
              : 'border-slate-200/90 dark:border-neutral-800 hover:border-amber-300 dark:hover:border-amber-800/60 hover:shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${conteos.porVencer > 0 ? 'bg-amber-500 animate-pulse' : 'bg-slate-300 dark:bg-neutral-700'}`}></span>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Por Vencer (≤ 60 Días)
              </span>
            </div>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                tabActiva === 'porVencer'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/60'
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {conteos.porVencer}
            </span>
            <span className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
              {conteos.porVencer === 1 ? 'Lote en Observación' : 'Lotes en Observación'}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-neutral-400 text-[11px]">
              Prioridad de rotación FEFO en dispensación
            </span>
            {tabActiva === 'porVencer' ? (
              <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                Viendo lista ✕
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-slate-400 dark:text-neutral-500 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">
                Clic para filtrar
              </span>
            )}
          </div>
        </div>

        {/* Tarjeta 3: Bajo Stock (Quiebres de Inventario) */}
        <div
          onClick={() => setTabActiva('bajoStock')}
          className={`group p-5 bg-white dark:bg-neutral-900 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden select-none ${
            tabActiva === 'bajoStock'
              ? 'border-orange-500 ring-2 ring-orange-500/30 bg-orange-50/20 dark:bg-orange-950/20 shadow-md'
              : 'border-slate-200/90 dark:border-neutral-800 hover:border-orange-300 dark:hover:border-orange-800/60 hover:shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${conteos.bajoStock > 0 ? 'bg-orange-500 animate-pulse' : 'bg-slate-300 dark:bg-neutral-700'}`}></span>
              <span className="text-[11px] font-black uppercase tracking-wider text-orange-800 dark:text-orange-400">
                Bajo Stock (≤ Mínimo)
              </span>
            </div>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                tabActiva === 'bajoStock'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/60'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {conteos.bajoStock}
            </span>
            <span className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
              {conteos.bajoStock === 1 ? 'Fármaco Crítico' : 'Fármacos Críticos'}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-neutral-400 text-[11px]">
              Alcanzaron o rompieron umbral mínimo
            </span>
            {tabActiva === 'bajoStock' ? (
              <span className="text-[10px] font-extrabold text-orange-800 dark:text-orange-300 bg-orange-100/70 dark:bg-orange-950/80 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                Viendo lista ✕
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-slate-400 dark:text-neutral-500 group-hover:text-orange-700 dark:group-hover:text-orange-400 transition">
                Clic para filtrar
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Barra de Búsqueda y Filtro de Lista */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar medicamento, principio activo, laboratorio o código GS1..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-neutral-100 rounded-xl text-xs focus:bg-white dark:focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-neutral-400">
          <span>Mostrando:</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 font-bold">
            {listaFiltrada.length} fármacos detectados
          </span>
        </div>
      </div>

      {/* 4. Tabla Rediseñada, Limpia y No Cargada */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-neutral-800">
            <thead className="bg-slate-50 dark:bg-neutral-950 text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-2.5 py-2.5 sm:px-3 text-center w-14">Foto</th>
                <th className="px-2.5 py-2.5 sm:px-3">Medicamento / Fármaco</th>
                <th className="px-2.5 py-2.5 sm:px-3">Lote & Vencimiento</th>
                <th className="px-2.5 py-2.5 sm:px-3 text-center">Stock Físico</th>
                <th className="px-2.5 py-2.5 sm:px-3 text-right">P. Venta</th>
                <th className="px-2.5 py-2.5 sm:px-3 text-center">Diagnóstico Sanitario</th>
                {esAdmin && <th className="px-2.5 py-2.5 sm:px-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
              {cargando ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <SkeletonTableRow key={`skel-alerta-${idx}`} cols={esAdmin ? 7 : 6} />
                ))
              ) : listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan={esAdmin ? 7 : 6} className="py-16 text-center text-slate-400 dark:text-neutral-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto stroke-1 text-emerald-500 mb-2" />
                    <p className="text-xs font-bold text-slate-800 dark:text-neutral-200">
                      {tabActiva === 'vencidos'
                        ? 'Excelente: No hay lotes caducados en inventario'
                        : tabActiva === 'porVencer'
                        ? 'Conforme: No hay lotes próximos a caducar en los próximos 60 días'
                        : 'Abastecido: Todos los productos tienen existencias suficientes'}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-0.5">
                      {busqueda ? 'No se encontraron resultados con el filtro actual.' : 'El inventario cumple con las especificaciones sanitarias.'}
                    </p>
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((prod) => {
                  const stock = Number(prod.stock);
                  const min = Number(prod.stockMinimo || 5);
                  const dias = calcularDiasParaCaducar(prod.fechaVencimiento);
                  const esCaducado = dias !== null && dias <= 0;

                  return (
                    <tr
                      key={prod.id}
                      onClick={() => setProductoParaDetalle(prod)}
                      className="hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition group cursor-pointer"
                      title="Haz clic para ver la ficha técnica completa del fármaco"
                    >
                      {/* 1. Miniatura Nítida y Compacta */}
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

                      {/* 2. Medicamento: Nombre + Presentación + Categoría Ordenada */}
                      <td className="px-2.5 py-2 sm:px-3 min-w-[180px] max-w-[260px]">
                        <div className="font-extrabold text-slate-900 dark:text-white text-xs truncate group-hover:text-[#0d9488] dark:group-hover:text-teal-400 transition">
                          {prod.nombre}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-neutral-400 truncate mt-0.5 font-medium flex items-center gap-1.5">
                          <span className="truncate">{prod.presentacion || 'Unidad estándar'}</span>
                          <span className="text-slate-300 dark:text-neutral-700 shrink-0">•</span>
                          <span className="px-1.5 py-0.2 rounded bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-300 font-bold text-[9px] border border-teal-200/80 dark:border-teal-800 shrink-0">
                            {prod.categoria?.nombre || 'General'}
                          </span>
                        </div>
                        {prod.codigoBarras && (
                          <div className="text-[9px] font-mono text-slate-400 dark:text-neutral-500 mt-0.5">
                            GS1: {prod.codigoBarras}
                          </div>
                        )}
                      </td>

                      {/* 3. Lote & Vencimiento con Contador FEFO */}
                      <td className="px-2.5 py-2 sm:px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-neutral-200 bg-slate-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-neutral-700">
                            {prod.lote || 'S/L'}
                          </span>
                          <span className="text-slate-600 dark:text-neutral-300 font-semibold text-xs font-mono">
                            {formatearFechaLima(prod.fechaVencimiento)}
                          </span>
                        </div>
                        <div className="mt-0.5">
                          {esCaducado ? (
                            <span className="text-[9px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-800 inline-block">
                              Venció hace {Math.abs(dias)} días
                            </span>
                          ) : tabActiva === 'porVencer' ? (
                            <span className="text-[9px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800 inline-block">
                              Quedan {dias} días para caducar
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500">
                              {dias ? `Vence en ${dias} d.` : '—'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Stock Físico con Semáforo y Mínimo */}
                      <td className="px-2.5 py-2 sm:px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-black tabular-nums font-mono ${
                            stock <= 0
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : stock <= min
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700'
                          }`}
                        >
                          {stock} u.
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-neutral-500 block mt-0.5 font-mono">
                          Mínimo: {min} u.
                        </span>
                      </td>

                      {/* 5. Precio Venta */}
                      <td className="px-2.5 py-2 sm:px-3 text-right font-black text-slate-900 dark:text-white whitespace-nowrap text-xs font-mono">
                        {formatearMoneda(prod.precio)}
                      </td>

                      {/* 6. Diagnóstico Sanitario */}
                      <td className="px-2.5 py-2 sm:px-3 text-center whitespace-nowrap">
                        {esCaducado || tabActiva === 'vencidos' ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              CADUCADO · NO VENDER
                            </span>
                            <span className="text-[9px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                              Retirado de tienda web
                            </span>
                          </div>
                        ) : tabActiva === 'porVencer' ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              PRÓXIMO A VENCER
                            </span>
                            <span className="text-[9px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                              Prioridad rotación FEFO
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${stock <= 0 ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800' : 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800'}`}>
                              {stock <= 0 ? 'AGOTADO (0 u.)' : `QUIEBRE STOCK (${stock}/${min})`}
                            </span>
                            <span className="text-[9px] text-slate-400 dark:text-neutral-500 font-medium mt-0.5">
                              Requiere reposición
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 7. Acciones Rápidas con Botones Coloreados */}
                      {esAdmin && (
                        <td className="px-2.5 py-2 sm:px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-1">
                            {/* Entrada de Stock / Nuevo Lote */}
                            <button
                              onClick={() => setProductoParaEntrada(prod)}
                              className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-center transition cursor-pointer shadow-2xs"
                              title="Ingresar nuevo lote o reponer stock"
                            >
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            </button>

                            {/* Editar Fármaco */}
                            <button
                              onClick={() => setProductoParaEditar(prod)}
                              className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800 flex items-center justify-center transition cursor-pointer shadow-2xs"
                              title="Editar datos, lote o fecha de expiración"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Ficha Técnica Detallada */}
                            <button
                              onClick={() => setProductoParaDetalle(prod)}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-teal-50 dark:hover:bg-neutral-700 text-slate-500 dark:text-neutral-300 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200 dark:border-neutral-700 flex items-center justify-center transition cursor-pointer shadow-2xs"
                              title="Ver ficha técnica completa"
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
      </div>

      {/* Modales Interactivos Integrados en Alertas */}
      {productoParaEntrada && (
        <ModalEntrada
          producto={productoParaEntrada}
          onClose={() => setProductoParaEntrada(null)}
          onCompletado={() => {
            setProductoParaEntrada(null);
            cargarAlertas();
          }}
        />
      )}

      {productoParaEditar && (
        <ModalProducto
          producto={productoParaEditar}
          onClose={() => setProductoParaEditar(null)}
          onGuardado={() => {
            setProductoParaEditar(null);
            cargarAlertas();
          }}
          onAbrirEntrada={(p) => {
            setProductoParaEditar(null);
            setProductoParaEntrada(p);
          }}
          esAdmin={esAdmin}
        />
      )}

      {productoParaDetalle && (
        <ModalDetalleProducto
          producto={productoParaDetalle}
          onClose={() => setProductoParaDetalle(null)}
          onAbrirEntrada={(p) => setProductoParaEntrada(p)}
          onAbrirAjuste={() => {}}
          onAbrirKardex={() => {}}
          onAbrirEditar={(p) => setProductoParaEditar(p)}
          esAdmin={esAdmin}
        />
      )}
    </div>
  );
}
