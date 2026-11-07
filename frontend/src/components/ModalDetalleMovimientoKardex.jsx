import React from 'react';
import {
  X,
  History,
  Package,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Calendar,
  UserCheck,
  FileText,
  Boxes,
  Barcode,
  Building2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { formatearFechaHoraLima } from '../utils/formateadores.js';

export default function ModalDetalleMovimientoKardex({
  movimiento,
  onClose,
  onVerProducto
}) {
  if (!movimiento) return null;

  const esEntrada = movimiento.tipo === 'ENTRADA';
  const esSalida = movimiento.tipo === 'SALIDA';
  const esAjuste = movimiento.tipo === 'AJUSTE';

  const colorTipo = esEntrada
    ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
    : esSalida
      ? 'text-blue-800 bg-blue-50 border-blue-200'
      : 'text-amber-800 bg-amber-50 border-amber-200';

  const iconTipo = esEntrada ? (
    <ArrowDownRight className="w-4 h-4 text-emerald-700" />
  ) : esSalida ? (
    <ArrowUpRight className="w-4 h-4 text-blue-700" />
  ) : (
    <RefreshCw className="w-4 h-4 text-amber-700" />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between bg-slate-50/70 dark:bg-neutral-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center">
              <History className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                Detalle de Movimiento Kardex
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium">
                Auditoría oficial de trazabilidad • Registro #{movimiento.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-neutral-800 transition cursor-pointer"
            title="Cerrar detalle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Desglosado */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* 1. Tarjeta del Medicamento */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-950 border border-slate-200/80 dark:border-neutral-800 flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              {movimiento.producto?.imagen ? (
                <img
                  src={movimiento.producto.imagen}
                  alt={movimiento.producto.nombre}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Package className="w-6 h-6 text-slate-300 dark:text-neutral-600 stroke-1" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800 uppercase tracking-wider">
                Fármaco Afectado
              </span>
              <h3 className="text-xs font-black text-slate-900 dark:text-white mt-1 truncate">
                {movimiento.producto?.nombre || 'Medicamento'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono flex items-center gap-1.5 mt-0.5">
                <Barcode className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
                <span>GS1: {movimiento.producto?.codigoBarras || 'S/C'}</span>
                <span>•</span>
                <span>{movimiento.producto?.laboratorio || 'Genérico'}</span>
              </p>
            </div>
          </div>

          {/* 2. Grid de Métricas de la Transacción */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Tipo de Movimiento */}
            <div className="p-3 bg-white dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800">
              <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                Tipo de Transacción
              </span>
              <div className="flex items-center space-x-1.5">
                {iconTipo}
                <span className={`px-2 py-0.5 rounded-full text-xs font-black border ${colorTipo}`}>
                  {movimiento.tipo}
                </span>
              </div>
            </div>

            {/* Cantidad Afectada */}
            <div className="p-3 bg-white dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800">
              <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                Cantidad Afectada
              </span>
              <span
                className={`text-base font-black font-mono ${esEntrada ? 'text-emerald-700 dark:text-emerald-400' : esSalida ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'
                  }`}
              >
                {esEntrada ? `+${movimiento.cantidad}` : esSalida ? `-${movimiento.cantidad}` : movimiento.cantidad} unidades
              </span>
            </div>

            {/* Stock Anterior */}
            <div className="p-3 bg-white dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800">
              <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-0.5">
                Stock Anterior
              </span>
              <span className="text-sm font-black font-mono text-slate-600 dark:text-neutral-300">
                {movimiento.stockAnterior} u.
              </span>
            </div>

            {/* Stock Resultante */}
            <div className="p-3 bg-teal-50/50 dark:bg-teal-950/40 rounded-2xl border border-teal-200/80 dark:border-teal-800">
              <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider block mb-0.5">
                Stock Resultante
              </span>
              <span className="text-base font-black font-mono text-teal-900 dark:text-teal-200">
                {movimiento.stockNuevo} u.
              </span>
            </div>
          </div>

          {/* 3. Datos de Auditoría y Documento */}
          <div className="p-4 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 space-y-3 text-xs">
            <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-neutral-400 font-bold">
                <FileText className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                <span>Motivo / Referencia:</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-right">
                {movimiento.motivo || 'Operación regular'}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-neutral-400 font-bold">
                <Calendar className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                <span>Fecha y Hora (Lima):</span>
              </div>
              <span className="font-mono font-bold text-slate-800 dark:text-neutral-200 text-right text-[11px]">
                {formatearFechaHoraLima(movimiento.createdAt)}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-neutral-400 font-bold">
                <UserCheck className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                <span>Responsable:</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900 dark:text-white block leading-tight">
                  {movimiento.usuario?.nombre || 'Usuario del Sistema'}
                </span>
                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-1.5 py-0.2 rounded">
                  {movimiento.usuario?.rol || 'SISTEMA'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie de Acciones */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between bg-slate-50/50 dark:bg-neutral-950">
          {onVerProducto && movimiento.producto && (
            <button
              type="button"
              onClick={() => onVerProducto(movimiento.producto)}
              className="px-3.5 py-2 text-xs font-bold text-teal-800 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-teal-50 dark:hover:bg-teal-950/60 rounded-xl transition cursor-pointer flex items-center space-x-1.5 border border-teal-200 dark:border-teal-800"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Ficha Técnica</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs border border-neutral-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

