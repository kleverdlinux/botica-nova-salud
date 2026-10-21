import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Bell,
  AlertTriangle,
  Clock,
  XCircle,
  Package,
  Award,
  Loader2,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { obtenerDashboardApi } from '../api/dashboardApi.js';
import { formatearMoneda, formatearFechaLima } from '../utils/formateadores.js';
import toast from 'react-hot-toast';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const cargarMetricas = async () => {
    setCargando(true);
    try {
      const res = await obtenerDashboardApi();
      setData(res);
    } catch (err) {
      console.error('Error al cargar dashboard:', err);
      toast.error('No se pudieron consultar las métricas del dashboard.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMetricas();
  }, []);

  // Inicializar o actualizar el gráfico de los últimos 7 días con Chart.js
  useEffect(() => {
    if (!data?.ventasUltimos7Dias || !chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    // Formatear etiquetas de fecha en hora local de Lima
    const labels = data.ventasUltimos7Dias.map((d, index) => {
      if (index === data.ventasUltimos7Dias.length - 1) {
        return 'Hoy';
      }
      const partes = d.fecha.split('-'); // YYYY-MM-DD
      return `${partes[2]}/${partes[1]}`;
    });

    const valores = data.ventasUltimos7Dias.map((d) => Number(d.total));
    const cantidades = data.ventasUltimos7Dias.map((d) => Number(d.cantidad));

    // Gradiente verde esmeralda para el área del gráfico
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    chartInstance.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Ventas (S/)',
            data: valores,
            borderColor: '#059669',
            backgroundColor: gradient,
            borderWidth: 3,
            tension: 0.35,
            fill: true,
            pointBackgroundColor: '#047857',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              label: (context) => {
                const idx = context.dataIndex;
                const totalFormateado = formatearMoneda(context.parsed.y);
                const cant = cantidades[idx];
                return [` Total: ${totalFormateado}`, ` Tickets: ${cant}`];
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: { size: 11, weight: '600' },
              color: '#64748b'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#f1f5f9'
            },
            ticks: {
              font: { size: 11 },
              color: '#64748b',
              callback: (value) => `S/ ${value}`
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (cargando && !data) {
    return (
      <div className="py-24 text-center text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-600 mb-3" />
        <p className="text-sm font-semibold">Cargando métricas del panel administrativo...</p>
      </div>
    );
  }

  const { ventasHoy, topProductos = [], alertas = {} } = data || {};
  const totalRecaudadoHoy = Number(ventasHoy?.total || 0);
  const totalTicketsHoy = Number(ventasHoy?.cantidad || 0);
  const promedioPorTicket = totalTicketsHoy > 0 ? totalRecaudadoHoy / totalTicketsHoy : 0;
  const maxVendido = topProductos.length > 0 ? Number(topProductos[0].totalUnidades || 1) : 1;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Encabezado y Actualizar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <LayoutDashboard className="w-7 h-7 text-brand-600" />
            <span>Panel de Control Administrativo</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas ejecutivas de ventas e inventario calculadas en tiempo real para <strong>America/Lima</strong>
          </p>
        </div>

        <button
          onClick={cargarMetricas}
          disabled={cargando}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center space-x-2 transition shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin text-brand-600' : ''}`} />
          <span>Actualizar Métricas</span>
        </button>
      </div>

      {/* FILA 1: Tarjetas de Resumen Ejecutivo (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ventas de Hoy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas de Hoy</p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {formatearMoneda(totalRecaudadoHoy)}
            </h2>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center">
              <Receipt className="w-3.5 h-3.5 mr-1 inline" />
              {totalTicketsHoy} ticket(s) emitidos
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Ticket Promedio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Promedio</p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {formatearMoneda(promedioPorTicket)}
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Promedio por comprobante hoy
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Total Alertas Activas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alertas de Almacén</p>
            <h2 className="text-2xl font-black text-amber-600 tracking-tight mt-1">
              {(alertas.bajoStock || 0) + (alertas.porVencer || 0) + (alertas.vencidos || 0)}
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              {alertas.bajoStock || 0} bajo stock • {alertas.porVencer || 0} por vencer
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Productos Vencidos Críticos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Caducados</p>
            <h2 className="text-2xl font-black text-rose-600 tracking-tight mt-1">
              {alertas.vencidos || 0}
            </h2>
            <p className="text-[11px] text-rose-700 font-semibold mt-1 flex items-center">
              <XCircle className="w-3.5 h-3.5 mr-1 inline" />
              Retirar de anaqueles
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FILA 2: Gráfico de Ventas de los Últimos 7 Días & Top 5 Productos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Gráfico 7 Días (7 Columnas) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Evolución de Ventas (Últimos 7 Días)</h2>
              <p className="text-xs text-slate-500">Monto total diario recaudado en Soles (PEN)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100">
              America/Lima
            </span>
          </div>

          <div className="h-64 relative">
            <canvas ref={chartRef} />
          </div>
        </div>

        {/* Ranking Top 5 Productos Más Vendidos (5 Columnas) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-1.5">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Top 5 Más Vendidos</span>
              </h2>
              <p className="text-xs text-slate-500">Medicamentos líderes por unidades comercializadas</p>
            </div>
          </div>

          <div className="space-y-3.5 pt-1">
            {topProductos.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                Aún no hay transacciones para generar el ranking.
              </p>
            ) : (
              topProductos.map((prod, index) => {
                const unidades = Number(prod.totalUnidades);
                const porcentaje = Math.round((unidades / maxVendido) * 100);

                return (
                  <div key={prod.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center space-x-1.5 truncate max-w-[200px]">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            index === 0
                              ? 'bg-amber-100 text-amber-800'
                              : index === 1
                              ? 'bg-slate-200 text-slate-800'
                              : index === 2
                              ? 'bg-amber-800/10 text-amber-900'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="truncate">{prod.nombre}</span>
                      </span>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-slate-900">{unidades} u.</span>
                        <span className="text-[11px] text-slate-400 ml-1.5">
                          ({formatearMoneda(prod.totalRecaudado)})
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progreso */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* FILA 3: Resumen Rápido de Alertas con Enlace Directo */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-bold flex items-center justify-center md:justify-start space-x-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <span>Atención Preventiva de Inventario</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Existen medicamentos que requieren reposición inmediata o retiro por fecha de caducidad. Revise los detalles completos en el módulo de alertas.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <div className="px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
            <span className="block text-sm font-black text-rose-400">{alertas.bajoStock || 0}</span>
            <span className="text-[10px] text-slate-400">Bajo Stock</span>
          </div>

          <div className="px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
            <span className="block text-sm font-black text-amber-400">{alertas.porVencer || 0}</span>
            <span className="text-[10px] text-slate-400">Por Vencer</span>
          </div>

          <div className="px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
            <span className="block text-sm font-black text-red-400">{alertas.vencidos || 0}</span>
            <span className="text-[10px] text-slate-400">Vencidos</span>
          </div>

          <button
            onClick={() => navigate('/app/alertas')}
            className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition ml-2 cursor-pointer"
          >
            <span>Ver Alertas Detalladas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
