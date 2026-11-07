"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

export interface MiniChartItem {
  label: string
  shortLabel?: string
  value: number // Porcentaje (0 a 100) o valor relativo
  unidades?: number // Cantidad física de existencias
  color?: string // Color temático de la categoría
}

interface MiniChartProps {
  data?: MiniChartItem[]
  titulo?: string
  subtitulo?: string
  totalGeneral?: number
  className?: string
}

// Datos de fallback en caso de no suministrar props externas
const defaultData: MiniChartItem[] = [
  { label: "Mon", shortLabel: "M", value: 65, color: "#10b981" },
  { label: "Tue", shortLabel: "T", value: 85, color: "#0d9488" },
  { label: "Wed", shortLabel: "W", value: 45, color: "#2563eb" },
  { label: "Thu", shortLabel: "T", value: 95, color: "#8b5cf6" },
  { label: "Fri", shortLabel: "F", value: 70, color: "#f59e0b" },
  { label: "Sat", shortLabel: "S", value: 55, color: "#ec4899" },
  { label: "Sun", shortLabel: "S", value: 80, color: "#64748b" },
]

export function MiniChart({
  data = defaultData,
  titulo = "DISTRIBUCIÓN",
  subtitulo = "Unidades físicas por categoría",
  totalGeneral,
  className,
}: MiniChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [displayValue, setDisplayValue] = useState<number | null>(null)
  const [displayUnits, setDisplayUnits] = useState<number | null>(null)
  const [displayLabel, setDisplayLabel] = useState<string | null>(null)
  const [displayColor, setDisplayColor] = useState<string | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const items = data && data.length > 0 ? data : defaultData
  const maxValue = Math.max(...items.map((d) => d.value), 1)

  useEffect(() => {
    if (hoveredIndex !== null && items[hoveredIndex]) {
      const item = items[hoveredIndex]
      setDisplayValue(Math.round(item.value))
      setDisplayUnits(item.unidades !== undefined ? item.unidades : null)
      setDisplayLabel(item.label)
      setDisplayColor(item.color || null)
    }
  }, [hoveredIndex, items])

  const handleContainerEnter = () => setIsHovering(true)
  const handleContainerLeave = () => {
    setIsHovering(false)
    setHoveredIndex(null)
    setTimeout(() => {
      setDisplayValue(null)
      setDisplayUnits(null)
      setDisplayLabel(null)
      setDisplayColor(null)
    }, 150)
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleContainerEnter}
      onMouseLeave={handleContainerLeave}
      className={cn(
        "group relative w-full p-5 rounded-2xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 shadow-xs transition-all duration-300 flex flex-col justify-between select-none",
        className
      )}
    >
      {/* 1. Header con Indicador Activo y Porcentaje / Unidades Dinámico */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full transition-colors duration-300 shrink-0"
              style={{
                backgroundColor: displayColor || "#10b981",
                boxShadow: displayColor ? `0 0 8px ${displayColor}` : "0 0 8px #10b981",
              }}
            />
            <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-200 tracking-wider uppercase truncate">
              {displayLabel ? displayLabel : titulo}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-300 mt-0.5 truncate pl-4">
            {subtitulo}
          </p>
        </div>

        {/* Display del Valor Seleccionado al hacer Hover */}
        <div className="text-right shrink-0">
          <div className="relative h-7 flex items-center justify-end">
            <span
              className={cn(
                "text-xl font-black font-mono tabular-nums tracking-tight transition-all duration-300 ease-out",
                isHovering && displayValue !== null
                  ? "opacity-100 text-neutral-900 dark:text-white"
                  : "opacity-40 text-neutral-400 dark:text-neutral-600"
              )}
            >
              {displayValue !== null ? displayValue : "100"}
              <span className="text-xs font-bold text-neutral-500 ml-0.5">%</span>
            </span>
          </div>
          {displayUnits !== null ? (
            <p className="text-[10px] font-mono font-semibold text-neutral-600 dark:text-neutral-300 -mt-1">
              {displayUnits.toLocaleString("es-PE")} unidades
            </p>
          ) : totalGeneral ? (
            <p className="text-[10px] font-mono font-semibold text-neutral-500 dark:text-neutral-300 -mt-1">
              Total: {totalGeneral.toLocaleString("es-PE")} uds
            </p>
          ) : null}
        </div>
      </div>

      {/* 2. Barras Píldora Interactivas Estilo Fancy Minimalista (Alargadas, Robustas y Vivas) */}
      <div className="flex items-end justify-center gap-3 sm:gap-4 h-52 sm:h-56 pt-8 pb-3 px-1 sm:px-2">
        {items.map((item, index) => {
          // Altura elongada estilo cápsula farmacéutica de alta fidelidad
          const baseMinHeight = 46
          const availableHeight = 142
          const heightPx = Math.round(baseMinHeight + ((item.value / maxValue) * availableHeight))
          const isHovered = hoveredIndex === index
          const isAnyHovered = hoveredIndex !== null
          const isNeighbor =
            hoveredIndex !== null && (index === hoveredIndex - 1 || index === hoveredIndex + 1)
          const barColor = item.color || "#0d9488"

          return (
            <div
              key={`${item.label}-${index}`}
              className="relative flex-1 flex flex-col items-center justify-end h-full max-w-[46px] sm:max-w-[50px]"
              onMouseEnter={() => setHoveredIndex(index)}
            >
              {/* Tooltip Flotante */}
              <div
                className={cn(
                  "absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-xl bg-white text-neutral-900 border border-neutral-200/90 shadow-xl dark:bg-neutral-900 dark:text-white dark:border-neutral-700 text-[11px] font-bold font-mono transition-all duration-200 whitespace-nowrap z-20 flex items-center gap-1.5 pointer-events-none",
                  isHovered
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-1.5 scale-95 pointer-events-none"
                )}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: barColor }}
                />
                <span>{Math.round(item.value)}%</span>
                {item.unidades !== undefined && (
                  <span className="text-[10px] opacity-75">
                    ({item.unidades.toLocaleString("es-PE")} u)
                  </span>
                )}
              </div>

              {/* Barra Píldora con Transición Elástica, Mayor Grosor y Colores Vivos */}
              <div
                className="w-full rounded-full cursor-pointer transition-all duration-300 ease-out origin-bottom"
                style={{
                  height: `${heightPx}px`,
                  backgroundColor: barColor,
                  opacity: isHovered
                    ? 1
                    : isNeighbor
                    ? 0.55
                    : isAnyHovered
                    ? 0.22
                    : 0.88,
                  transform: isHovered
                    ? "scaleX(1.15) scaleY(1.03)"
                    : isNeighbor
                    ? "scaleX(1.04)"
                    : "scaleX(1)",
                  boxShadow: isHovered
                    ? `0 8px 24px ${barColor}77`
                    : `0 2px 8px ${barColor}25`,
                }}
              />

              {/* Etiqueta Inferior (Abreviatura o Inicial con Indicador Cromático) */}
              <div className="flex flex-col items-center mt-2.5 transition-all duration-300">
                <span
                  className={cn(
                    "text-[10px] font-bold tracking-tight transition-colors duration-200",
                    isHovered
                      ? "text-neutral-900 dark:text-white"
                      : "text-neutral-600 dark:text-neutral-400"
                  )}
                  title={item.label}
                >
                  {item.shortLabel || item.label.slice(0, 3)}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1 transition-transform duration-200"
                  style={{
                    backgroundColor: barColor,
                    transform: isHovered ? "scale(1.5)" : "scale(1)",
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. Leyenda Detallada de Categorías con Conteo y Porcentajes */}
      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {items.map((item, index) => {
          const isHovered = hoveredIndex === index
          const barColor = item.color || "#0d9488"

          return (
            <div
              key={`legend-${item.label}-${index}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn(
                "flex items-center justify-between text-[11px] p-1 rounded-lg transition-colors cursor-pointer",
                isHovered
                  ? "bg-neutral-100 dark:bg-neutral-900"
                  : "hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
              )}
            >
              <div className="flex items-center space-x-1.5 min-w-0 pr-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: barColor, boxShadow: `0 0 6px ${barColor}55` }}
                />
                <span
                  className={cn(
                    "truncate font-medium transition-colors",
                    isHovered
                      ? "text-neutral-900 dark:text-white font-bold"
                      : "text-neutral-700 dark:text-neutral-300 font-semibold"
                  )}
                  title={item.label}
                >
                  {item.label}
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-neutral-600 dark:text-neutral-400 shrink-0">
                {Math.round(item.value)}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Resplandor Sutil en los Bordes al pasar el Mouse */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-neutral-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  )
}

export default MiniChart

