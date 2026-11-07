import React, { useState } from 'react';
import { formatearMoneda } from '../../utils/formateadores';

export interface DonutSegment {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface SegmentedDonutChartProps {
  data: DonutSegment[];
  totalValue?: number;
  centerLabel?: string;
  currencyPrefix?: string;
  className?: string;
}

export function SegmentedDonutChart({
  data = [],
  totalValue,
  centerLabel = 'Total Cobrado',
  currencyPrefix = 'S/ ',
  className = ''
}: SegmentedDonutChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Calcular el total
  const calculatedTotal = data.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
  const finalTotal = totalValue !== undefined ? totalValue : calculatedTotal;

  // Filtrar segmentos con valor positivo
  const activeSegments = data.filter((d) => Number(d.value) > 0);
  const hasData = finalTotal > 0 && activeSegments.length > 0;

  // Geometría del SVG amplia y proporcionada
  const size = 230;
  const cx = size / 2;
  const cy = size / 2;
  const R = 78;
  const thickness = 18;
  const trackThickness = 26;

  // Ángulo de compensación para los extremos redondeados (strokeLinecap="round")
  const capAngle = Math.asin((thickness / 2) / R) * (180 / Math.PI); // ~6.6 grados

  // Función auxiliar para convertir grados a radianes (iniciando a las 12 en punto: -90°)
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  // Generar path de arco SVG canónico en sentido horario (sweep-flag = 1)
  const describeArc = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, startAngle);
    const end = polarToCartesian(centerX, centerY, radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  };

  // Cálculo de los arcos según la cantidad de segmentos activos
  const computedArcs: Array<{
    id: string;
    label: string;
    value: number;
    color: string;
    path: string;
    percentage: number;
  }> = [];

  if (hasData) {
    const count = activeSegments.length;

    if (count === 1) {
      // 1 solo método activo (100%): Anillo elegante con pequeña separación en la cúspide
      const item = activeSegments[0];
      const startAngle = 10 + capAngle;
      const endAngle = 360 - 10 - capAngle;
      computedArcs.push({
        id: item.id,
        label: item.label,
        value: item.value,
        color: item.color,
        path: describeArc(cx, cy, R, startAngle, endAngle),
        percentage: 100
      });
    } else {
      // Múltiples métodos activos: Distribución proporcional con gaps
      const gapAngle = Math.min(12, 360 / (count * 4));
      const totalAvailableAngle = 360 - count * gapAngle;

      // Garantizar que cualquier segmento activo (ej: 1% POS) tenga un arco
      // claramente visible y curvado con precisión sobre el radio R (~30 grados).
      const maxMinSpan = Math.floor(totalAvailableAngle / count);
      const MIN_SPAN = Math.min(30, maxMinSpan);

      const rawSpans = activeSegments.map((item) => {
        const pct = (Number(item.value) || 0) / finalTotal;
        return {
          item,
          pct,
          percentage: Math.round(pct * 100),
          span: pct * totalAvailableAngle
        };
      });

      const smallSegments = rawSpans.filter((s) => s.span < MIN_SPAN);
      const largeSegments = rawSpans.filter((s) => s.span >= MIN_SPAN);

      let finalSpans: Array<{ item: DonutSegment; span: number; percentage: number }>;

      if (smallSegments.length > 0 && largeSegments.length > 0) {
        const angleTakenBySmall = smallSegments.length * MIN_SPAN;
        const remainingAngleForLarge = totalAvailableAngle - angleTakenBySmall;
        const totalLargeValue = largeSegments.reduce((acc, s) => acc + (Number(s.item.value) || 0), 0);

        finalSpans = rawSpans.map((s) => {
          if (s.span < MIN_SPAN) {
            return { item: s.item, span: MIN_SPAN, percentage: s.percentage };
          }
          const adjustedSpan = totalLargeValue > 0
            ? ((Number(s.item.value) || 0) / totalLargeValue) * remainingAngleForLarge
            : s.span;
          return { item: s.item, span: adjustedSpan, percentage: s.percentage };
        });
      } else {
        finalSpans = rawSpans;
      }

      let currentAngle = 0;
      finalSpans.forEach((s) => {
        const startA = currentAngle + gapAngle / 2 + capAngle;
        const endA = currentAngle + gapAngle / 2 + s.span - capAngle;

        computedArcs.push({
          id: s.item.id,
          label: s.item.label,
          value: s.item.value,
          color: s.item.color,
          path: describeArc(cx, cy, R, startA, endA),
          percentage: s.percentage
        });

        currentAngle += s.span + gapAngle;
      });
    }
  }

  // Segmentos skeleton para cuando no hay datos
  const skeletonArcs = [
    { start: 10, end: 85 },
    { start: 100, end: 175 },
    { start: 190, end: 265 },
    { start: 280, end: 355 }
  ].map((arc) => describeArc(cx, cy, R, arc.start + capAngle, arc.end - capAngle));

  // Elemento activo en hover
  const hoveredItem = data.find((d) => d.id === hoveredId);
  const displayAmount = hoveredItem
    ? formatearMoneda(hoveredItem.value)
    : formatearMoneda(finalTotal);

  const hoveredPct = hoveredItem && finalTotal > 0
    ? Math.round(((hoveredItem.value || 0) / finalTotal) * 100)
    : 0;

  return (
    <div className={`flex flex-col items-center justify-center h-full w-full ${className}`}>
      {/* Contenedor central del Donut Segmentado */}
      <div
        className="relative w-56 h-56 flex items-center justify-center my-auto select-none"
        onMouseLeave={() => setHoveredId(null)}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full select-none overflow-visible"
        >
          {/* Receptor invisible de fondo para limpiar hover cuando se sale de las curvas */}
          <rect
            width={size}
            height={size}
            fill="transparent"
            onMouseEnter={() => setHoveredId(null)}
          />

          {/* 1. Carril / Pista de fondo exterior (Recessed track) */}
          <circle
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke="currentColor"
            className="text-neutral-100 dark:text-neutral-800/80 transition-colors pointer-events-none"
            strokeWidth={trackThickness}
          />

          {/* 2. Pista de fondo interior de alto contraste */}
          <circle
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke="currentColor"
            className="text-neutral-200/60 dark:text-neutral-700/50 transition-colors pointer-events-none"
            strokeWidth={thickness}
            strokeDasharray="4 8"
          />

          {/* 3. Skeleton cuando no hay datos */}
          {!hasData &&
            skeletonArcs.map((path, idx) => (
              <path
                key={`skeleton-${idx}`}
                d={path}
                fill="none"
                stroke="currentColor"
                className="text-neutral-200/80 dark:text-neutral-800 animate-pulse pointer-events-none"
                strokeWidth={thickness}
                strokeLinecap="round"
                style={{
                  animationDelay: `${idx * 150}ms`
                }}
              />
            ))}

          {/* 4. Arcos visuales: Cuando uno se activa, los demás se opacan claramente */}
          {hasData &&
            computedArcs.map((arc) => {
              const isHovered = hoveredId === arc.id;
              const isAnyHovered = hoveredId !== null;
              // Si se pasa el cursor sobre un color, ese color brilla al 100% y los demás se opacan a 0.15
              const arcOpacity = isAnyHovered ? (isHovered ? 1 : 0.15) : 1;

              return (
                <path
                  key={`visual-${arc.id}`}
                  d={arc.path}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={isHovered ? thickness + 4 : thickness}
                  strokeLinecap="round"
                  opacity={arcOpacity}
                  className="transition-all duration-200 pointer-events-none"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.22))' : 'none'
                  }}
                />
              );
            })}

          {/* 5. Hit targets invisibles anchos para interacción precisa y cómoda */}
          {hasData &&
            computedArcs.map((arc) => (
              <path
                key={`hit-${arc.id}`}
                d={arc.path}
                fill="none"
                stroke="transparent"
                strokeWidth={thickness + 20}
                strokeLinecap="round"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredId(arc.id)}
              />
            ))}

          {/* 6. Agujero central invisible que restablece el estado al situar el ratón al centro */}
          <circle
            cx={cx}
            cy={cy}
            r={R - thickness / 2 - 4}
            fill="transparent"
            className="cursor-default"
            onMouseEnter={() => setHoveredId(null)}
          />
        </svg>

        {/* 7. Métricas centrales legibles (Muestra el dato completo en el medio sin duplicados) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center px-3">
          {!hasData ? (
            <>
              <p className="text-2xl font-black font-mono tracking-tight text-neutral-300 dark:text-neutral-700">
                S/ 0.00
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 font-medium mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 animate-pulse" />
                <span>Sin cobros aún</span>
              </div>
            </>
          ) : hoveredItem ? (
            <>
              <p
                className="text-2xl sm:text-[27px] font-black font-mono tracking-tight transition-all duration-150 leading-none"
                style={{ color: hoveredItem.color }}
              >
                {displayAmount}
              </p>
              <p className="text-xs sm:text-[13px] font-bold leading-tight text-center px-1 mt-1.5 max-w-[136px] text-neutral-800 dark:text-neutral-100">
                {hoveredItem.label}
              </p>
              <div
                className="inline-flex items-center gap-1 text-[11px] font-bold font-mono px-2 py-0.5 rounded-full mt-1 transition-all"
                style={{
                  color: hoveredItem.color,
                  backgroundColor: `${hoveredItem.color}20`
                }}
              >
                <span>{hoveredPct}%</span>
                <span className="text-[10px] opacity-75 font-sans font-medium">del total</span>
              </div>
            </>
          ) : (
            <>
              <p className="text-2xl sm:text-[27px] font-black text-neutral-900 dark:text-white font-mono tracking-tight transition-all duration-150 leading-none">
                {displayAmount}
              </p>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 max-w-[136px] text-center mt-1.5 transition-all duration-150 leading-tight">
                {centerLabel}
              </p>
              <span className="text-[10px] font-mono font-bold text-neutral-400 dark:text-neutral-500 mt-1">
                {activeSegments.length} {activeSegments.length === 1 ? 'método activo' : 'métodos activos'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


