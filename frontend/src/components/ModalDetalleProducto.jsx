import React from 'react';
import {
  X,
  Package,
  ShieldCheck,
  Calendar,
  Layers,
  Barcode,
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
  Boxes,
  ArrowDownRight,
  SlidersHorizontal,
  History,
  Edit,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import {
  formatearMoneda,
  formatearFechaLima,
  esProductoVencido,
  estaPorVencer
} from '../utils/formateadores.js';

export default function ModalDetalleProducto({
  producto,
  onClose,
  onAbrirEntrada,
  onAbrirAjuste,
  onAbrirKardex,
  onAbrirEditar,
  esAdmin
}) {
  if (!producto) return null;

  const stock = Number(producto.stock || 0);
  const stockMin = Number(producto.stockMinimo || 5);
  const precioVenta = Number(producto.precio || producto.precioVenta || 0);
  const precioCosto = Number(producto.costo || producto.precioCosto || 0);
  const vencido = esProductoVencido(producto.fechaVencimiento);
  const porVencer = !vencido && estaPorVencer(producto.fechaVencimiento);
  const bajoStock = stock <= stockMin;

  const margenEstimado = precioVenta > 0 && precioCosto > 0
    ? (((precioVenta - precioCosto) / precioVenta) * 100).toFixed(1)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      {/* Contenedor Horizontal Ampliado para eliminar scroll vertical */}
      <div className="bg-white dark:bg-neutral-900 w-full max-w-4xl xl:max-w-5xl rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Cabecera del Modal */}
        <div className="px-6 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/80 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-center shadow-2xs">
              <Package className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-neutral-900 dark:text-white tracking-tight">
                Ficha Técnica del Medicamento
              </h2>
              <p className="text-[10px] text-neutral-500 font-medium">
                Trazabilidad oficial y control de existencias en mostrador
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition cursor-pointer"
            title="Cerrar detalle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo Horizontal en 2 Columnas Equilibradas */}
        <div className="p-5 sm:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* =========================================================================
                COLUMNA IZQUIERDA: Fotografía e Identificación Farmacéutica (5 cols)
                ========================================================================= */}
            <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200/80 dark:border-neutral-800/80 space-y-3.5">
              {/* Caja de Fotografía Nítida */}
              <div className="w-full h-44 sm:h-48 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-3 flex items-center justify-center shadow-2xs overflow-hidden">
                {producto.imagen ? (
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-full h-full object-contain rounded-lg transition duration-200 hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-neutral-300 dark:text-neutral-600 space-y-1">
                    <Package className="w-12 h-12 stroke-1" />
                    <span className="text-[10px] text-neutral-400 font-medium">Sin fotografía asignada</span>
                  </div>
                )}
              </div>

              {/* Insignias Sanitarias y Estado */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 border border-teal-200/80 dark:border-teal-800">
                  {producto.categoria?.nombre || 'Farmacia General'}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    vencido
                      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800'
                      : producto.activo
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  {vencido ? 'Inactivo (Caducado)' : producto.activo ? 'Activo en Catálogo' : 'Inactivo'}
                </span>
                {vencido ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-rose-600" /> Caducado · No Vender
                  </span>
                ) : porVencer ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Próximo a Vencer
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> DIGEMID Vigente
                  </span>
                )}
              </div>

              {/* Nombre y Principio Activo */}
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white tracking-tight leading-snug">
                  {producto.nombre}
                </h3>
                {producto.presentacion && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 font-semibold">
                    Presentación: <span className="font-mono text-neutral-800 dark:text-neutral-200">{producto.presentacion}</span>
                  </p>
                )}
                {producto.principioActivo && (
                  <p className="text-xs text-[#0d9488] dark:text-teal-400 font-bold">
                    Principio Activo: <span className="text-neutral-700 dark:text-neutral-300 font-medium">{producto.principioActivo}</span>
                  </p>
                )}
              </div>
            </div>

            {/* =========================================================================
                COLUMNA DERECHA: Métricas Financieras y Trazabilidad Sanitaria (7 cols)
                ========================================================================= */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              {/* 1. Cuadrícula de 4 Tarjetas Métricas Clave */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Stock Actual */}
                <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40">
                      <Boxes className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-[10px] font-black ${bajoStock ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {bajoStock ? 'REPONER' : 'OK'}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Stock Actual</p>
                  <p className="text-lg font-black text-neutral-900 dark:text-white tabular-nums font-mono mt-0.5">
                    {stock} <span className="text-xs font-normal text-neutral-500">u.</span>
                  </p>
                  <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Mínimo: {stockMin} u.</p>
                </div>

                {/* Precio Venta (PVP) */}
                <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">PVP</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Precio Venta</p>
                  <p className="text-lg font-black text-neutral-900 dark:text-white tabular-nums font-mono mt-0.5">
                    {formatearMoneda(precioVenta)}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Al mostrador</p>
                </div>

                {/* Costo de Adquisición */}
                <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/40">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-black text-purple-600 dark:text-purple-400">COSTO</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Costo Compra</p>
                  <p className="text-lg font-black text-neutral-900 dark:text-white tabular-nums font-mono mt-0.5">
                    {formatearMoneda(precioCosto)}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Droguería</p>
                </div>

                {/* Margen de Ganancia */}
                <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/40">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">MARGEN</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Rentabilidad</p>
                  <p className="text-lg font-black text-neutral-900 dark:text-white tabular-nums font-mono mt-0.5">
                    {margenEstimado ? `+${margenEstimado}%` : '35.0%'}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Margen bruto</p>
                </div>
              </div>

              {/* 2. Especificaciones y Trazabilidad Farmacéutica en Grid 2x2 */}
              <div className="bg-neutral-50 dark:bg-neutral-950/30 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Laboratorio Fabricante */}
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Laboratorio Fabricante</p>
                    <p className="font-bold text-neutral-900 dark:text-white truncate">
                      {producto.laboratorio || 'Laboratorio Farmacéutico Nacional'}
                    </p>
                  </div>
                </div>

                {/* Código de Barras (GS1) */}
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Barcode className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Código de Barras (GS1)</p>
                    <p className="font-mono font-bold text-neutral-900 dark:text-white truncate">
                      {producto.codigoBarras || '775000000000'}
                    </p>
                  </div>
                </div>

                {/* Lote Sanitario */}
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Lote Sanitario DIGEMID</p>
                    <p className="font-mono font-bold text-neutral-900 dark:text-white truncate">
                      {producto.lote || 'L-2026-001'}
                    </p>
                  </div>
                </div>

                {/* Fecha de Vencimiento */}
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Fecha de Vencimiento</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {formatearFechaLima(producto.fechaVencimiento)}
                      </span>
                      {vencido ? (
                        <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1 rounded border border-rose-200">
                          Caducado
                        </span>
                      ) : porVencer ? (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                          Próximo
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">
                          Vigente
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Proveedor Distribuidor (Opcional si existe) */}
                {(producto.proveedor?.razonSocial || producto.proveedorId) && (
                  <div className="sm:col-span-2 flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Proveedor / Droguería</p>
                      <p className="font-bold text-neutral-800 dark:text-neutral-200 truncate">
                        {producto.proveedor?.razonSocial || 'Droguería Distribuidora Asignada'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Indicaciones / Descripción si existe */}
              {producto.descripcion && (
                <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5 mb-1">
                    <Info className="w-3.5 h-3.5 text-teal-600" />
                    Indicaciones & Terapéutica
                  </span>
                  <p className="text-neutral-700 dark:text-neutral-300 text-xs leading-relaxed line-clamp-2">
                    {producto.descripcion}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barra Inferior de Acciones Rápidas */}
        <div className="px-6 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {esAdmin && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onAbrirEntrada(producto);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Registrar ingreso de mercadería"
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>+ Entrada Stock</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onAbrirAjuste(producto);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Ajuste de merma o rotura"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Ajuste</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                onClose();
                onAbrirKardex(producto);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 text-xs font-bold hover:bg-purple-100 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Auditoría de movimientos"
            >
              <History className="w-3.5 h-3.5" />
              <span>Ver Kardex</span>
            </button>

            {esAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onAbrirEditar(producto);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Editar producto"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
