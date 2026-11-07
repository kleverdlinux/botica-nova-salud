import React from 'react';
import { TrendingUp, Clock, Zap } from 'lucide-react';
import {
  ComposedChart,
  Line,
  ReferenceLine,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from './line-charts-9';
import { formatearMoneda } from '../../utils/formateadores';

export interface VentaHoraItem {
  hora: string;
  total: number | string;
  cantidad?: number;
}

interface VelocidadHorasChartProps {
  ventasPorHora?: VentaHoraItem[];
  totalCobrado?: number;
  totalTickets?: number;
  className?: string;
}

const chartConfig = {
  total: {
    label: 'Ventas en Mostrador',
    color: '#0d9488'
  }
} satisfies ChartConfig;

interface TooltipPayloadItem {
  payload: {
    hora: string;
    total: number;
    cantidad?: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 shadow-xl animate-fadeIn">
        <div className="flex items-center space-x-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-1 font-mono">
          <Clock className="w-3 h-3 text-[#0d9488]" />
          <span>Hora: {data.hora}</span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-base font-black text-neutral-900 dark:text-white font-mono tabular-nums">
            {formatearMoneda(data.total)}
          </span>
          {data.total > 0 && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Venta Activa
            </span>
          )}
        </div>
        {data.cantidad !== undefined && data.cantidad > 0 && (
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 font-medium">
            {data.cantidad} {data.cantidad === 1 ? 'comprobante emitido' : 'comprobantes emitidos'}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function VelocidadHorasChart({
  ventasPorHora = [],
  totalCobrado = 0,
  totalTickets = 0,
  className = ''
}: VelocidadHorasChartProps) {
  // Asegurar formato numérico consistente
  const chartData = ventasPorHora.length > 0
    ? ventasPorHora.map((h) => ({
        hora: h.hora,
        total: parseFloat(String(h.total)) || 0,
        cantidad: h.cantidad || 0
      }))
    : [
        { hora: '08:00', total: 0, cantidad: 0 },
        { hora: '10:00', total: 0, cantidad: 0 },
        { hora: '12:00', total: 0, cantidad: 0 },
        { hora: '14:00', total: 0, cantidad: 0 },
        { hora: '16:00', total: 0, cantidad: 0 },
        { hora: '18:00', total: 0, cantidad: 0 },
        { hora: '20:00', total: 0, cantidad: 0 },
        { hora: '22:00', total: 0, cantidad: 0 }
      ];

  const valores = chartData.map((d) => d.total);
  const picoMaximo = Math.max(...valores, 0);
  const horaPicoItem = chartData.find((d) => d.total === picoMaximo && picoMaximo > 0);
  const horaPico = horaPicoItem?.hora || null;

  return (
    <div className={`flex flex-col justify-between h-full ${className}`}>
      {/* Cabecera del gráfico */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center space-x-1.5">
              <span>Velocidad por Horas Hoy</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Curva de ventas en mostrador (08:00 - 22:00)
            </p>
          </div>
          <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2%</span>
          </div>
        </div>

        {/* Fila de métricas en vivo (Stats Row del diseño line-charts-9) */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs mb-2 pt-1 border-t border-neutral-100 dark:border-neutral-800 font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="text-neutral-500 dark:text-neutral-300 font-medium">Recaudado:</span>
            <span className="font-black text-neutral-900 dark:text-white">{formatearMoneda(totalCobrado)}</span>
          </div>

          <div className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-300">
            {horaPico && (
              <span>
                Pico: <span className="text-teal-600 dark:text-teal-400 font-bold">{formatearMoneda(picoMaximo)}</span> ({horaPico})
              </span>
            )}
            <span>
              Tickets: <span className="text-neutral-900 dark:text-neutral-100 font-bold">{totalTickets}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Contenedor del Gráfico Recharts con Trama de Puntos y Neón Glow */}
      <div className="relative w-full h-[185px] sm:h-[195px] overflow-visible">
        <ChartContainer
          config={chartConfig}
          className="h-full w-full aspect-auto [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
        >
          <ComposedChart
            data={chartData}
            margin={{
              top: 15,
              right: 15,
              left: -18,
              bottom: 4
            }}
          >
            <defs>
              {/* Trama de micropuntos de fondo */}
              <pattern id="velocidadDotGrid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="0.9" fill="currentColor" className="text-neutral-300 dark:text-neutral-600" fillOpacity="0.6" />
              </pattern>

              {/* Sombra proyectada suave para puntos destacados */}
              <filter id="velocidadDotShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="rgba(0,0,0,0.35)" />
              </filter>

              {/* Resplandor Neón en la línea */}
              <filter id="velocidadLineShadow" x="-100%" y="-100%" width="300%" height="300%">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="rgba(13, 148, 136, 0.4)" />
              </filter>
            </defs>

            {/* Fondo con textura de matriz de puntos */}
            <rect x="0" y="0" width="100%" height="100%" fill="url(#velocidadDotGrid)" style={{ pointerEvents: 'none' }} />

            {/* Cuadrícula Cartesiana discontinua */}
            <CartesianGrid
              strokeDasharray="4 6"
              stroke="currentColor"
              className="text-neutral-200 dark:text-neutral-800"
              horizontal={true}
              vertical={false}
            />

            {/* Línea de referencia vertical en el pico de venta */}
            {horaPico && (
              <ReferenceLine
                x={horaPico}
                stroke="#0d9488"
                strokeDasharray="3 3"
                strokeWidth={1.2}
                strokeOpacity={0.7}
              />
            )}

            {/* Eje X de horas */}
            <XAxis
              dataKey="hora"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'currentColor' }}
              className="text-neutral-500 dark:text-neutral-200 font-mono font-medium"
              tickMargin={6}
              interval="preserveStartEnd"
            />

            {/* Eje Y monetario */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'currentColor' }}
              className="text-neutral-500 dark:text-neutral-200 font-mono font-medium"
              tickFormatter={(v) => `S/ ${v}`}
              tickMargin={6}
            />

            {/* Tooltip personalizado */}
            <ChartTooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: '3 3', stroke: '#0d9488', strokeOpacity: 0.6 }}
            />

            {/* Curva principal con efecto neón y puntos iluminados */}
            <Line
              type="monotone"
              dataKey="total"
              stroke="#0d9488"
              strokeWidth={2.4}
              filter="url(#velocidadLineShadow)"
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.total > 0 && payload.total === picoMaximo) {
                  return (
                    <circle
                      key={`dot-${payload.hora}`}
                      cx={cx}
                      cy={cy}
                      r={5.5}
                      fill="#0d9488"
                      stroke="#ffffff"
                      strokeWidth={2}
                      filter="url(#velocidadDotShadow)"
                    />
                  );
                }
                return <g key={`dot-${payload.hora}`} />;
              }}
              activeDot={{
                r: 6,
                fill: '#0d9488',
                stroke: '#ffffff',
                strokeWidth: 2,
                filter: 'url(#velocidadDotShadow)'
              }}
            />
          </ComposedChart>
        </ChartContainer>
      </div>
    </div>
  );
}

