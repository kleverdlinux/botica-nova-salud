import React, { useState, useId } from 'react';

export interface DataPoint {
  label: string;
  value: number;
}

export interface DualSeriesData {
  labels: string[];
  series1: {
    name: string;
    color: string;
    values: number[];
  };
  series2: {
    name: string;
    color: string;
    values: number[];
  };
}

interface InteractiveCardChartProps {
  data?: DataPoint[];
  dualSeries?: DualSeriesData;
  color?: string;
  tag?: string;
  currencyPrefix?: string;
  className?: string;
}

// Genera un spline bezier cúbico continuo y suave
function buildSmoothBezier(pts: { x: number; y: number }[]): string {
  if (pts.length <= 1) return pts.length === 1 ? `M ${pts[0].x} ${pts[0].y}` : '';
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i > 0 ? pts[i - 1] : pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function formatScaleNumber(val: number): string {
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
  if (val >= 100) return `${Math.round(val)}`;
  if (val % 1 !== 0) return val.toFixed(1);
  return `${val}`;
}

export function InteractiveCardChart({
  data,
  dualSeries,
  color = '#10b981',
  tag = 'Hoy',
  currencyPrefix = 'S/ ',
  className = ''
}: InteractiveCardChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const gradId = useId();

  // Dimensiones compactas del canvas SVG
  const vbWidth = 260;
  const vbHeight = 54;

  const isDual = !!dualSeries;
  const padLeft = isDual ? 14 : 8;
  const padRight = 36; // Espacio a la derecha para marcas de escala Y
  const padTop = 6;
  const padBottom = isDual ? 8 : 6;

  const chartW = vbWidth - padLeft - padRight;
  const chartH = vbHeight - padTop - padBottom;
  const bottomY = padTop + chartH;

  // 1. Mapeo para modo Simple (1 serie)
  if (!isDual) {
    const chartData = data && data.length > 0 ? data : [
      { label: '08:00', value: 0 },
      { label: '10:00', value: 0 },
      { label: '12:00', value: 0 },
      { label: '14:00', value: 0 },
      { label: '16:00', value: 0 },
      { label: '18:00', value: 0 },
      { label: '20:00', value: 0 },
      { label: '22:00', value: 0 }
    ];

    const vals = chartData.map((d) => d.value);
    const rawMax = Math.max(...vals, 0);
    const maxVal = rawMax === 0 ? 10 : rawMax;
    const minVal = 0;
    const range = maxVal - minVal || 1;

    const points = chartData.map((d, i) => {
      const x = padLeft + (i / Math.max(chartData.length - 1, 1)) * chartW;
      const normalizedY = (d.value - minVal) / range;
      const y = bottomY - normalizedY * (chartH - 2);
      return { x, y, label: d.label, value: d.value };
    });

    const bezierD = buildSmoothBezier(points);
    const areaD = points.length > 0
      ? `${bezierD} L ${points[points.length - 1].x.toFixed(1)} ${bottomY} L ${points[0].x.toFixed(1)} ${bottomY} Z`
      : '';

    // Marcas de escala Y (3 niveles horizontales compactos)
    const yLevels = [
      { y: padTop + 2, val: formatScaleNumber(maxVal) },
      { y: padTop + chartH * 0.5, val: formatScaleNumber(maxVal * 0.5) },
      { y: bottomY, val: '0' }
    ];

    const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;
    const lastPoint = points[points.length - 1];

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clientX / rect.width));
      const svgX = ratio * vbWidth;

      let closest = 0;
      let minDist = Infinity;
      points.forEach((p, idx) => {
        const dist = Math.abs(p.x - svgX);
        if (dist < minDist) {
          minDist = dist;
          closest = idx;
        }
      });
      setHoverIndex(closest);
    };

    return (
      <div className={`relative w-full flex flex-col justify-center ${className}`}>
        {/* Cabecera del inset compacta y estable (sin parpadeos ni saltos de ancho) */}
        <div className="flex items-center justify-between text-[10px] font-mono mb-1 px-0.5 select-none">
          <span className="text-neutral-500 dark:text-neutral-300 font-semibold">{tag}</span>
          <div className="flex items-center space-x-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
              style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
            />
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">En tiempo real</span>
          </div>
        </div>

        {/* Canvas SVG interactivo compacto */}
        <div className="relative w-full h-[46px] sm:h-[48px] overflow-visible">
          {/* Tooltip flotante único, legible y adaptativo al tema */}
          {activePoint && (
            <div
              className="absolute pointer-events-none z-30 transition-all duration-75 ease-out -translate-x-1/2 -top-8 sm:-top-9 select-none"
              style={{
                left: `${Math.max(18, Math.min(82, (activePoint.x / vbWidth) * 100))}%`
              }}
            >
              <div className="bg-white/95 dark:bg-neutral-900/95 text-neutral-900 dark:text-white backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-neutral-200/90 dark:border-neutral-700/80 shadow-lg flex items-center gap-1.5 whitespace-nowrap text-xs font-mono">
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-semibold">{activePoint.label}</span>
                <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                <span className="font-mono font-black text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                  {currencyPrefix}{activePoint.value.toFixed(2)}
                </span>
              </div>
              <div className="w-2 h-2 bg-white dark:bg-neutral-900 border-r border-b border-neutral-200/90 dark:border-neutral-700/80 rotate-45 mx-auto -mt-1" />
            </div>
          )}

          <svg
            viewBox={`0 0 ${vbWidth} ${vbHeight}`}
            className="w-full h-full overflow-visible select-none cursor-crosshair"
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Capa invisible receptora continua para evitar parpadeos al cruzar trazados */}
            <rect x="0" y="0" width={vbWidth} height={vbHeight} fill="transparent" pointerEvents="all" />

            {/* Líneas Guía Horizontales y Marcas de Escala en Y */}
            {yLevels.map((lvl, idx) => (
              <g key={idx}>
                <line
                  x1={padLeft - 2}
                  y1={lvl.y}
                  x2={padLeft + chartW}
                  y2={lvl.y}
                  stroke="currentColor"
                  strokeDasharray="2 3"
                  className="text-neutral-200 dark:text-neutral-800"
                  strokeWidth="0.8"
                />
                <text
                  x={padLeft + chartW + 5}
                  y={lvl.y + 2.5}
                  fontSize="7.5"
                  fill="currentColor"
                  className="text-neutral-500 dark:text-neutral-200 font-mono font-semibold"
                >
                  {lvl.val}
                </text>
              </g>
            ))}

            {/* Relleno con gradiente */}
            {areaD && <path d={areaD} fill={`url(#${gradId})`} />}

            {/* Línea curva suave */}
            {bezierD && (
              <path
                d={bezierD}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Punto terminal estático */}
            {!activePoint && lastPoint && (
              <g>
                <circle cx={lastPoint.x} cy={lastPoint.y} r="3" fill={color} fillOpacity="0.3" />
                <circle cx={lastPoint.x} cy={lastPoint.y} r="1.8" fill={color} stroke="#ffffff" strokeWidth="1" />
              </g>
            )}

            {/* Guía vertical y punto resaltado en hover */}
            {activePoint && (
              <g>
                <line
                  x1={activePoint.x}
                  y1={padTop}
                  x2={activePoint.x}
                  y2={bottomY}
                  stroke={color}
                  strokeDasharray="2 2"
                  strokeWidth="1"
                  strokeOpacity="0.7"
                />
                <circle cx={activePoint.x} cy={activePoint.y} r="5" fill={color} fillOpacity="0.25" />
                <circle cx={activePoint.x} cy={activePoint.y} r="2.2" fill={color} stroke="#ffffff" strokeWidth="1.2" />
              </g>
            )}
          </svg>
        </div>
      </div>
    );
  }

  // 2. Mapeo para modo Dual Series (Card 3: Cobros Electrónicos - Yape vs POS)
  const { labels, series1, series2 } = dualSeries;
  const count = labels.length;
  const s1Vals = series1.values;
  const s2Vals = series2.values;

  const rawMax = Math.max(...s1Vals, ...s2Vals, 0);
  const maxVal = rawMax === 0 ? 5 : rawMax;
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const points1 = s1Vals.map((val, i) => {
    const x = padLeft + (i / Math.max(count - 1, 1)) * chartW;
    const normalizedY = (val - minVal) / range;
    const y = bottomY - normalizedY * (chartH - 2);
    return { x, y, label: labels[i] || '', value: val };
  });

  const points2 = s2Vals.map((val, i) => {
    const x = padLeft + (i / Math.max(count - 1, 1)) * chartW;
    const normalizedY = (val - minVal) / range;
    const y = bottomY - normalizedY * (chartH - 2);
    return { x, y, label: labels[i] || '', value: val };
  });

  const bezier1 = buildSmoothBezier(points1);
  const bezier2 = buildSmoothBezier(points2);

  const grad1Id = `${gradId}-s1`;
  const grad2Id = `${gradId}-s2`;

  const yLevels = [
    { y: padTop + 2, val: formatScaleNumber(maxVal) },
    { y: padTop + chartH * 0.5, val: formatScaleNumber(maxVal * 0.5) },
    { y: bottomY, val: '0' }
  ];

  const activeP1 = hoverIndex !== null && points1[hoverIndex] ? points1[hoverIndex] : null;
  const activeP2 = hoverIndex !== null && points2[hoverIndex] ? points2[hoverIndex] : null;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clientX / rect.width));
    const svgX = ratio * vbWidth;

    let closest = 0;
    let minDist = Infinity;
    points1.forEach((p, idx) => {
      const dist = Math.abs(p.x - svgX);
      if (dist < minDist) {
        minDist = dist;
        closest = idx;
      }
    });
    setHoverIndex(closest);
  };

  const sideTicks = [padTop + 2, padTop + chartH * 0.5, bottomY];

  return (
    <div className={`relative w-full flex flex-col justify-center ${className}`}>
      {/* Cabecera del inset compacta y estable (sin parpadeos ni saltos de ancho) */}
      <div className="flex items-center justify-between text-[10px] font-mono mb-1 px-0.5 select-none">
        <span className="text-neutral-500 dark:text-neutral-300 font-semibold">{tag}</span>
        <div className="flex items-center space-x-2 text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: series1.color }} />
            <span className="font-medium">{series1.name}</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: series2.color }} />
            <span className="font-medium">{series2.name}</span>
          </span>
        </div>
      </div>

      {/* Canvas SVG interactivo dual compacto */}
      <div className="relative w-full h-[46px] sm:h-[48px] overflow-visible">
        {/* Tooltip flotante dual adaptativo al tema */}
        {activeP1 && activeP2 && (
          <div
            className="absolute pointer-events-none z-30 transition-all duration-75 ease-out -translate-x-1/2 -top-11 sm:-top-12 select-none"
            style={{
              left: `${Math.max(22, Math.min(78, (activeP1.x / vbWidth) * 100))}%`
            }}
          >
            <div className="bg-white/95 dark:bg-neutral-900/95 text-neutral-900 dark:text-white backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-200/90 dark:border-neutral-700/80 shadow-lg flex flex-col items-center gap-0.5 whitespace-nowrap text-xs font-mono">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold border-b border-neutral-100 dark:border-neutral-800 pb-0.5 text-center w-full">
                {activeP1.label}
              </span>
              <div className="flex items-center gap-2 pt-0.5 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-purple-600 dark:text-purple-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  {currencyPrefix}{activeP1.value.toFixed(2)}
                </span>
                <span className="text-neutral-300 dark:text-neutral-600 font-normal">|</span>
                <span className="flex items-center gap-1 text-sky-600 dark:text-sky-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  {currencyPrefix}{activeP2.value.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="w-2 h-2 bg-white dark:bg-neutral-900 border-r border-b border-neutral-200/90 dark:border-neutral-700/80 rotate-45 mx-auto -mt-1" />
          </div>
        )}

        <svg
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          className="w-full h-full overflow-visible select-none cursor-crosshair"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={grad1Id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series1.color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={series1.color} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={grad2Id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series2.color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={series2.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Capa invisible receptora continua para evitar parpadeos */}
          <rect x="0" y="0" width={vbWidth} height={vbHeight} fill="transparent" pointerEvents="all" />

          {/* Muescas laterales de escala (Ticks modelo 'Sessions') */}
          {sideTicks.map((ty, i) => (
            <React.Fragment key={i}>
              <line
                x1={padLeft - 4}
                y1={ty}
                x2={padLeft - 1}
                y2={ty}
                stroke="currentColor"
                className="text-neutral-300 dark:text-neutral-600"
                strokeWidth="0.8"
              />
              <line
                x1={padLeft + chartW + 1}
                y1={ty}
                x2={padLeft + chartW + 4}
                y2={ty}
                stroke="currentColor"
                className="text-neutral-300 dark:text-neutral-600"
                strokeWidth="0.8"
              />
            </React.Fragment>
          ))}

          {/* Líneas Guía Horizontales y Marcas de Escala */}
          {yLevels.map((lvl, idx) => (
            <g key={idx}>
              <line
                x1={padLeft - 1}
                y1={lvl.y}
                x2={padLeft + chartW + 1}
                y2={lvl.y}
                stroke="currentColor"
                strokeDasharray="2 3"
                className="text-neutral-200 dark:text-neutral-800"
                strokeWidth="0.8"
              />
              <text
                x={padLeft + chartW + 6}
                y={lvl.y + 2.5}
                fontSize="7.5"
                fill="currentColor"
                className="text-neutral-500 dark:text-neutral-200 font-mono font-semibold"
              >
                {lvl.val}
              </text>
            </g>
          ))}

          {/* Curva 1: Yape / Plin */}
          {bezier1 && (
            <path
              d={bezier1}
              fill="none"
              stroke={series1.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Curva 2: POS / Tarjeta */}
          {bezier2 && (
            <path
              d={bezier2}
              fill="none"
              stroke={series2.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Guía vertical y puntos interactivos en hover */}
          {activeP1 && activeP2 && (
            <g>
              <line
                x1={activeP1.x}
                y1={padTop}
                x2={activeP1.x}
                y2={bottomY}
                stroke="currentColor"
                strokeDasharray="2 2"
                strokeWidth="1"
                className="text-neutral-400 dark:text-neutral-600"
                strokeOpacity="0.7"
              />
              <circle cx={activeP1.x} cy={activeP1.y} r="4" fill={series1.color} fillOpacity="0.3" />
              <circle cx={activeP1.x} cy={activeP1.y} r="1.8" fill={series1.color} stroke="#ffffff" strokeWidth="1" />
              <circle cx={activeP2.x} cy={activeP2.y} r="4" fill={series2.color} fillOpacity="0.3" />
              <circle cx={activeP2.x} cy={activeP2.y} r="1.8" fill={series2.color} stroke="#ffffff" strokeWidth="1" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
