import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Package,
  AlertTriangle,
  Clock,
  ArrowLeftRight,
  TrendingUp,
  ShieldAlert,
  Loader2,
  RefreshCw,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  History,
  Layers,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { obtenerDashboardAlmacenApi } from '../api/dashboardApi.js';
import { formatearMoneda, formatearFechaLima, formatearFechaHoraLima } from '../utils/formateadores.js';
import ChartJS from 'chart.js/auto';
import MiniChart from '../components/ui/mini-chart';
import { useDarkMode } from '../hooks/useDarkMode';

export default function DashboardAlmacen() {
  const navigate = useNavigate();
  const isDark = useDarkMode();
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [actualizandoSilencioso, setActualizandoSilencioso] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  // Referencias a los canvas de Chart.js
  const canvasSemaforoRef = useRef(null);
  const canvasKardexRef = useRef(null);

  const chartSemaforoInstance = useRef(null);
  const chartKardexInstance = useRef(null);

  const cargarDatos = async (silencioso = false, reintentos = 3) => {
    if (!silencioso && !data) {
      setCargando(true);
    } else {
      setActualizandoSilencioso(true);
    }
    try {
      const res = await obtenerDashboardAlmacenApi();
      setData(res);
      setUltimaActualizacion(new Date());
      setCargando(false);
    } catch (err) {
      console.warn('Telemetría de almacén: reintentando consulta...', err?.message || err);
      if (reintentos > 0) {
        setTimeout(() => {
          cargarDatos(true, reintentos - 1);
        }, 1200);
      } else {
        setCargando(false);
      }
    } finally {
      setActualizandoSilencioso(false);
    }
  };

  // Destruir instancias de Chart.js únicamente al desmontar el componente del DOM
  useEffect(() => {
    return () => {
      chartSemaforoInstance.current?.destroy();
      chartKardexInstance.current?.destroy();
      chartSemaforoInstance.current = null;
      chartKardexInstance.current = null;
    };
  }, []);

  useEffect(() => {
    cargarDatos(false);
    const interval = setInterval(() => {
      cargarDatos(true);
    }, 20000);
    const handleReload = () => cargarDatos(false);
    window.addEventListener('app-reload-data', handleReload);
    return () => {
      clearInterval(interval);
      window.removeEventListener('app-reload-data', handleReload);
    };
  }, []);

  // Renderizar y actualizar gráficos en caliente (sin parpadeos)
  useEffect(() => {
    if (!data || cargando) return;

    const colorTexto = isDark ? '#f8fafc' : '#334155';
    const colorGrid = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)';

    // 1. Gráfico Semáforo FEFO Sanitario (Barras Horizontales)
    if (canvasSemaforoRef.current && data.graficos?.semaforoFEFO) {
      const labels = data.graficos.semaforoFEFO.map((s) => s.etiqueta);
      const values = data.graficos.semaforoFEFO.map((s) => s.valor);
      const backgroundColors = data.graficos.semaforoFEFO.map((s) => s.color);

      if (chartSemaforoInstance.current) {
        chartSemaforoInstance.current.data.labels = labels;
        chartSemaforoInstance.current.data.datasets[0].data = values;
        chartSemaforoInstance.current.data.datasets[0].backgroundColor = backgroundColors;
        if (chartSemaforoInstance.current.options.scales?.x?.ticks) {
          chartSemaforoInstance.current.options.scales.x.ticks.color = colorTexto;
          chartSemaforoInstance.current.options.scales.x.ticks.font = { size: 11, weight: '600', family: 'Inter, system-ui, sans-serif' };
          chartSemaforoInstance.current.options.scales.x.grid.color = colorGrid;
        }
        if (chartSemaforoInstance.current.options.scales?.y?.ticks) {
          chartSemaforoInstance.current.options.scales.y.ticks.color = colorTexto;
          chartSemaforoInstance.current.options.scales.y.ticks.font = { size: 11, weight: '600', family: 'Inter, system-ui, sans-serif' };
        }
        if (chartSemaforoInstance.current.options.plugins?.tooltip) {
          chartSemaforoInstance.current.options.plugins.tooltip.backgroundColor = isDark ? '#0f172a' : '#ffffff';
          chartSemaforoInstance.current.options.plugins.tooltip.titleColor = isDark ? '#ffffff' : '#0f172a';
          chartSemaforoInstance.current.options.plugins.tooltip.bodyColor = isDark ? '#cbd5e1' : '#334155';
          chartSemaforoInstance.current.options.plugins.tooltip.borderColor = isDark ? '#334155' : '#e2e8f0';
          chartSemaforoInstance.current.options.plugins.tooltip.borderWidth = 1;
        }
        chartSemaforoInstance.current.update('none');
      } else {
        chartSemaforoInstance.current = new ChartJS(canvasSemaforoRef.current, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: backgroundColors,
                borderRadius: 6,
                barThickness: 18
              }
            ]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'nearest',
              axis: 'y',
              intersect: false
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                titleColor: isDark ? '#ffffff' : '#0f172a',
                bodyColor: isDark ? '#cbd5e1' : '#334155',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 10,
                boxPadding: 4,
                usePointStyle: true,
                titleFont: { size: 12, weight: 'bold', family: 'Inter, system-ui, sans-serif' },
                bodyFont: { size: 11, weight: '500', family: 'Inter, system-ui, sans-serif' },
                callbacks: {
                  label: (context) => ` ${context.parsed.x} lotes en este estado`
                }
              }
            },
            scales: {
              x: {
                grid: { color: colorGrid },
                ticks: { color: colorTexto, precision: 0, font: { size: 11, weight: '600', family: 'Inter, system-ui, sans-serif' } }
              },
              y: {
                grid: { display: false },
                ticks: { color: colorTexto, font: { size: 11, weight: '600', family: 'Inter, system-ui, sans-serif' } }
              }
            }
          }
        });
      }
    }

    // 3. Gráfico Flujo Semanal de Kardex (Barras Agrupadas 7 días)
    if (canvasKardexRef.current && data.graficos?.kardex7Dias) {
      const labels = data.graficos.kardex7Dias.map((d) => d.diaSemana);
      const entradas = data.graficos.kardex7Dias.map((d) => d.entradas);
      const salidas = data.graficos.kardex7Dias.map((d) => d.salidas);
      const ajustes = data.graficos.kardex7Dias.map((d) => d.ajustes);

      if (chartKardexInstance.current) {
        chartKardexInstance.current.data.labels = labels;
        chartKardexInstance.current.data.datasets[0].data = entradas;
        chartKardexInstance.current.data.datasets[1].data = salidas;
        chartKardexInstance.current.data.datasets[2].data = ajustes;
        if (chartKardexInstance.current.options.scales?.x?.ticks) {
          chartKardexInstance.current.options.scales.x.ticks.color = colorTexto;
          chartKardexInstance.current.options.scales.x.ticks.font = { size: 11, weight: '600', family: 'Inter, system-ui, sans-serif' };
        }
        if (chartKardexInstance.current.options.scales?.y?.ticks) {
          chartKardexInstance.current.options.scales.y.ticks.color = colorTexto;
          chartKardexInstance.current.options.scales.y.ticks.font = { size: 11, weight: '600', family: 'Inter, system-ui, sans-serif' };
          chartKardexInstance.current.options.scales.y.grid.color = colorGrid;
        }
        if (chartKardexInstance.current.options.plugins?.legend?.labels) {
          chartKardexInstance.current.options.plugins.legend.labels.color = colorTexto;
          chartKardexInstance.current.options.plugins.legend.labels.font = { size: 11, weight: '600', family: 'Inter, system-ui, sans-serif' };
        }
        if (chartKardexInstance.current.options.plugins?.tooltip) {
          chartKardexInstance.current.options.plugins.tooltip.backgroundColor = isDark ? '#0f172a' : '#ffffff';
          chartKardexInstance.current.options.plugins.tooltip.titleColor = isDark ? '#ffffff' : '#0f172a';
          chartKardexInstance.current.options.plugins.tooltip.bodyColor = isDark ? '#cbd5e1' : '#334155';
          chartKardexInstance.current.options.plugins.tooltip.borderColor = isDark ? '#334155' : '#e2e8f0';
          chartKardexInstance.current.options.plugins.tooltip.borderWidth = 1;
        }
        chartKardexInstance.current.update('none');
      } else {
        chartKardexInstance.current = new ChartJS(canvasKardexRef.current, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Entradas (Droguería)',
                data: entradas,
                backgroundColor: '#10b981',
                borderRadius: 4
              },
              {
                label: 'Salidas (Dispensación)',
                data: salidas,
                backgroundColor: '#3b82f6',
                borderRadius: 4
              },
              {
                label: 'Ajustes / Mermas',
                data: ajustes,
                backgroundColor: '#f59e0b',
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              axis: 'x',
              intersect: false
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: colorTexto,
                  font: { size: 11, weight: '600', family: 'Inter, system-ui, sans-serif' },
                  boxWidth: 12
                }
              },
              tooltip: {
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                titleColor: isDark ? '#ffffff' : '#0f172a',
                bodyColor: isDark ? '#cbd5e1' : '#334155',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 10,
                boxPadding: 4,
                usePointStyle: true,
                titleFont: { size: 12, weight: 'bold', family: 'Inter, system-ui, sans-serif' },
                bodyFont: { size: 11, weight: '500', family: 'Inter, system-ui, sans-serif' },
                callbacks: {
                  label: (context) => ` ${context.dataset.label}: ${context.parsed.y} uds`
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: colorTexto, font: { size: 11, weight: '600', family: 'Inter, system-ui, sans-serif' } }
              },
              y: {
                grid: { color: colorGrid },
                ticks: { color: colorTexto, precision: 0, font: { size: 11, weight: '600', family: 'Inter, system-ui, sans-serif' } }
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartSemaforoInstance.current) {
        chartSemaforoInstance.current.destroy();
        chartSemaforoInstance.current = null;
      }
      if (chartKardexInstance.current) {
        chartKardexInstance.current.destroy();
        chartKardexInstance.current = null;
      }
    };
  }, [data, cargando, isDark]);

  if (cargando && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#0d9488]" />
        <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
          Cargando métricas y existencias de almacén...
        </p>
      </div>
    );
  }

  const { metricas, tablas, graficos } = data || {};

  const totalUnidadesFisicas = metricas?.totalUnidadesFisicas || 0;
  const totalProductosActivos = metricas?.totalProductosActivos || 0;
  const valorizadoCostoTotal = Number(metricas?.valorizadoCostoTotal || 0);
  const totalRiesgoFEFO = metricas?.semaforoFEFO?.totalRiesgo || 0;
  const totalKardexOps =
    (metricas?.kardexHoy?.entradas?.conteo || 0) +
    (metricas?.kardexHoy?.salidas?.conteo || 0) +
    (metricas?.kardexHoy?.ajustes?.conteo || 0);

  // Mapeo interactivo para el MiniChart de Distribución por Familias Farmacéuticas
  const categoriasRaw = graficos?.distribucionCategorias?.slice(0, 6) || [];
  const totalUnidadesCategorias = categoriasRaw.reduce((sum, c) => sum + (c.unidades || 0), 0);
  const paletaColoresCategorias = [
    '#0d9488', // Dermocosmética & Cuidado Personal
    '#2563eb', // Salud Cardiovascular & Crónicos
    '#8b5cf6', // Cuidado Pediátrico & Infantil
    '#f59e0b', // Bienestar, Vitaminas & Suplementos
    '#ec4899', // Botiquín & Primeros Auxilios
    '#64748b'  // Antibióticos
  ];
  const abreviaturas = {
    'Dermocosmética & Cuidado Personal': 'DER',
    'Salud Cardiovascular & Crónicos': 'CAR',
    'Cuidado Pediátrico & Infantil': 'PED',
    'Bienestar, Vitaminas & Suplementos': 'VIT',
    'Botiquín & Primeros Auxilios': 'BOT',
    'Antibióticos': 'ANT'
  };
  const datosGraficoPildoras = categoriasRaw.map((cat, idx) => {
    const unidades = cat.unidades || 0;
    const porcentaje = totalUnidadesCategorias > 0 ? (unidades / totalUnidadesCategorias) * 100 : 0;
    return {
      label: cat.nombre,
      shortLabel: abreviaturas[cat.nombre] || cat.nombre.slice(0, 3).toUpperCase(),
      value: porcentaje,
      unidades,
      color: paletaColoresCategorias[idx % paletaColoresCategorias.length]
    };
  });

  const STATS_CARDS = [
    {
      label: 'Unidades en Custodia',
      value: `${totalUnidadesFisicas.toLocaleString('es-PE')} u.`,
      trendText: `+${totalProductosActivos} fármacos activos`,
      icon: Boxes,
      iconBoxStyle: 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900/50',
      badgeText: `${totalProductosActivos} ítems`,
      badgeStyle: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      clickable: true,
      onClick: () => navigate('/app/inventario?tab=catalogo')
    },
    {
      label: 'Patrimonio en Custodia',
      value: formatearMoneda(valorizadoCostoTotal),
      trendText: 'Costo valorizado real',
      icon: Package,
      iconBoxStyle: 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/50',
      badgeText: 'En Almacén',
      badgeStyle: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    },
    {
      label: 'Vigilancia Sanitaria (FEFO)',
      value: `${metricas?.semaforoFEFO?.vigentes || 0} Lotes`,
      trendText: totalRiesgoFEFO > 0 ? `${totalRiesgoFEFO} lotes en riesgo` : '100% Vigentes en anaquel',
      icon: Clock,
      iconBoxStyle: 'bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-900/50',
      badgeText: metricas?.semaforoFEFO?.caducados > 0 ? 'Revisión DIGEMID' : 'DIGEMID OK',
      badgeStyle: metricas?.semaforoFEFO?.caducados > 0
        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
        : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      clickable: true,
      onClick: () => navigate('/app/inventario?tab=lotes')
    },
    {
      label: 'Kardex Operativo Hoy',
      value: `${totalKardexOps} ops.`,
      trendText: `+${metricas?.kardexHoy?.entradas?.unidades || 0} u. ingresadas`,
      icon: ArrowLeftRight,
      iconBoxStyle: 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900/50',
      badgeText: 'Auditoría',
      badgeStyle: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      clickable: true,
      onClick: () => navigate('/app/inventario?tab=kardex')
    }
  ];

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      {/* 1. Fila Principal Ejecutiva: 4 Stat Cards (2x2 a la Izquierda) + MiniChart de Distribución (Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Bloque Izquierdo: 4 Stat Cards en cuadrícula 2x2 (7 columnas) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STATS_CARDS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                onClick={stat.onClick}
                className={`bg-white dark:bg-black p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs transition flex flex-col justify-between ${
                  stat.clickable
                    ? 'cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-sm group'
                    : 'hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {/* Fila superior: Icono temático redondeado + Flecha de tendencia */}
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBoxStyle}`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="flex items-center text-emerald-500 dark:text-emerald-400" title="Monitoreo operativo">
                    <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>

                {/* Centro: Título sutil y Valor en números grandes */}
                <div className="mt-4">
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 tracking-tight">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight tabular-nums font-mono mt-1">
                    {stat.value}
                  </p>
                </div>

                {/* Pie de tarjeta: Subtexto de resumen + badge de estado */}
                <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
                    {stat.trendText}
                  </span>
                  {stat.badgeText && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${stat.badgeStyle}`}>
                      {stat.badgeText}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bloque Derecho: MiniChart Píldora Interactivo de Distribución por Familias (5 columnas) */}
        <div className="lg:col-span-5 flex">
          <MiniChart
            data={datosGraficoPildoras}
            titulo="DISTRIBUCIÓN POR FAMILIAS"
            subtitulo="Unidades físicas por categoría"
            totalGeneral={totalUnidadesCategorias}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* 2. Sección de Gráficos Analíticos Secundarios (Semáforo FEFO y Kardex en 2 Columnas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 2: Semáforo Sanitario FEFO */}
        <div className="bg-white dark:bg-black p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Semáforo FEFO Sanitario
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Vigilancia DIGEMID por rango de vencimiento
              </p>
            </div>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="relative flex-1 min-h-[240px] mt-2">
            <canvas ref={canvasSemaforoRef} />
          </div>
        </div>

        {/* Gráfico 3: Flujo Semanal de Kardex */}
        <div className="bg-white dark:bg-black p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Flujo Kardex (Últimos 7 Días)
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Entradas de droguería vs Salidas de mostrador
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="relative flex-1 min-h-[240px] mt-2">
            <canvas ref={canvasKardexRef} />
          </div>
        </div>
      </div>

      {/* Tablas Operativas para Almacén */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabla 1: Fármacos en Quiebre & Stock Crítico */}
        <div className="bg-white dark:bg-black rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Fármacos para Reabastecimiento Inmediato
              </h2>
            </div>
            <button
              onClick={() => navigate('/app/inventario')}
              className="text-xs font-semibold text-[#0d9488] dark:text-teal-400 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Ver Catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-2.5 px-4">Medicamento</th>
                  <th className="py-2.5 px-3">Lote</th>
                  <th className="py-2.5 px-3 text-center">Stock</th>
                  <th className="py-2.5 px-3 text-center">Mínimo</th>
                  <th className="py-2.5 px-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {tablas?.productosPorReponer?.length > 0 ? (
                  tablas.productosPorReponer.map((prod) => (
                    <tr
                      key={prod.id}
                      className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition"
                    >
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-neutral-900 dark:text-neutral-100">
                          {prod.nombre}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          {prod.presentacion} · {prod.laboratorio}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-600 dark:text-neutral-300">
                        {prod.lote}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-neutral-900 dark:text-white">
                        {prod.stock}
                      </td>
                      <td className="py-2.5 px-3 text-center text-neutral-500">
                        {prod.stockMinimo}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {prod.estadoStock === 'QUIEBRE' ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                            QUIEBRE (0)
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            CRÍTICO
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-neutral-400">
                      No hay fármacos en nivel crítico de inventario.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla 2: Próximos Vencimientos FEFO */}
        <div className="bg-white dark:bg-black rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Vigilancia FEFO - Próximos Lotes
              </h2>
            </div>
            <button
              onClick={() => navigate('/app/alertas')}
              className="text-xs font-semibold text-[#0d9488] dark:text-teal-400 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Ver Todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-2.5 px-4">Fármaco & Lote</th>
                  <th className="py-2.5 px-3">Vencimiento</th>
                  <th className="py-2.5 px-3 text-center">Días</th>
                  <th className="py-2.5 px-3 text-center">Stock</th>
                  <th className="py-2.5 px-3 text-right">Semáforo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {tablas?.proximosVencimientos?.length > 0 ? (
                  tablas.proximosVencimientos.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition"
                    >
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-neutral-900 dark:text-neutral-100">
                          {item.nombre}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          Lote: {item.lote}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-700 dark:text-neutral-300">
                        {formatearFechaLima(item.fechaVencimiento)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        {item.diasRestantes < 0 ? (
                          <span className="text-red-600">Vencido</span>
                        ) : (
                          <span>{item.diasRestantes}d</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-neutral-900 dark:text-white">
                        {item.stock}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.estadoSemaforo === 'CADUCADO' && (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                            CADUCADO
                          </span>
                        )}
                        {item.estadoSemaforo === 'CRITICO' && (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                            ≤ 30 DÍAS
                          </span>
                        )}
                        {item.estadoSemaforo === 'ALERTA' && (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            30-60 DÍAS
                          </span>
                        )}
                        {item.estadoSemaforo === 'VIGENTE' && (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            VIGENTE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-neutral-400">
                      No se registran medicamentos con alertas de vencimiento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabla 3: Últimos Movimientos de Kardex en Vivo */}
      <div className="bg-white dark:bg-black rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              Libro de Kardex en Vivo (Últimos Movimientos)
            </h2>
          </div>
          <button
            onClick={() => navigate('/app/inventario')}
            className="text-xs font-semibold text-[#0d9488] dark:text-teal-400 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>Auditoría de Kardex</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="py-2.5 px-4">Fecha & Hora</th>
                <th className="py-2.5 px-3">Tipo Operación</th>
                <th className="py-2.5 px-3">Fármaco & Lote</th>
                <th className="py-2.5 px-3 text-center">Cantidad</th>
                <th className="py-2.5 px-3 text-center">Balance Físico</th>
                <th className="py-2.5 px-4">Motivo / Documento</th>
                <th className="py-2.5 px-4 text-right">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {tablas?.ultimosMovimientos?.length > 0 ? (
                tablas.ultimosMovimientos.map((mov) => (
                  <tr
                    key={mov.id}
                    className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition"
                  >
                    <td className="py-2.5 px-4 text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                      {formatearFechaHoraLima(mov.createdAt)}
                    </td>
                    <td className="py-2.5 px-3">
                      {mov.tipo === 'ENTRADA' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <ArrowUpRight className="w-3 h-3" />
                          <span>ENTRADA</span>
                        </span>
                      )}
                      {mov.tipo === 'SALIDA' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                          <ArrowDownRight className="w-3 h-3" />
                          <span>SALIDA</span>
                        </span>
                      )}
                      {mov.tipo === 'AJUSTE' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          <AlertTriangle className="w-3 h-3" />
                          <span>AJUSTE</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-neutral-900 dark:text-neutral-100">
                        {mov.productoNombre}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {mov.productoPresentacion} · Lote: {mov.productoLote}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-neutral-900 dark:text-white">
                      {mov.cantidad} uds
                    </td>
                    <td className="py-2.5 px-3 text-center text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                      {mov.stockAnterior} →{' '}
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {mov.stockNuevo}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-neutral-700 dark:text-neutral-300">
                      {mov.motivo}
                    </td>
                    <td className="py-2.5 px-4 text-right text-neutral-600 dark:text-neutral-400 font-medium">
                      {mov.usuarioNombre}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-neutral-400">
                    No se registran movimientos en el libro de Kardex aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

