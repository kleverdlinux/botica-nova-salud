import React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-200/80 dark:bg-neutral-800/80",
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton para tarjetas de productos farmacéuticos (Catálogo Web)
 */
export function SkeletonProductCard() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3 shadow-xs">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <div className="space-y-2 pt-1">
        <Skeleton className="h-3 w-1/3 rounded-full" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
        <Skeleton className="h-3 w-2/3 rounded-md" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Grilla de skeletons de productos para la tienda
 */
export function SkeletonProductGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonProductCard key={`skel-prod-${idx}`} />
      ))}
    </div>
  );
}

/**
 * Skeleton para filas de tablas administrativas (Inventario, Ventas, Kardex, Usuarios)
 */
export function SkeletonTableRow({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="border-b border-neutral-100 dark:border-neutral-800 animate-pulse">
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={`skel-col-${idx}`} className="py-3.5 px-4">
          <Skeleton className={cn("h-4 rounded-md", idx === 0 ? "w-16" : idx === 1 ? "w-44" : "w-24")} />
        </td>
      ))}
    </tr>
  );
}

/**
 * Skeleton para tablas completas
 */
export function SkeletonTable({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-64 rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={`skel-row-${idx}`} className="flex items-center justify-between gap-4 py-2 border-b border-neutral-100/60 dark:border-neutral-800/60">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton para tarjetas estadísticas del Dashboard
 */
export function SkeletonDashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={`skel-stat-${idx}`}
          className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
          <Skeleton className="h-7 w-32 rounded-lg" />
          <Skeleton className="h-3 w-28 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para el Portal del Paciente (Perfil y pedidos)
 */
export function SkeletonPortal() {
  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-5 w-48 rounded-lg" />
            <Skeleton className="h-3 w-32 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-2xl" />
          <Skeleton className="h-10 w-28 rounded-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={`skel-card-${idx}`} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-4 space-y-3">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-6 w-16 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 space-y-4">
        <Skeleton className="h-4 w-40 rounded" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={`skel-order-${idx}`} className="p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { Skeleton };
export default Skeleton;
