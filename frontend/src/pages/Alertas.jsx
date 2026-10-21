import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
  PackageX,
  CheckCircle2
} from 'lucide-react';
import { obtenerAlertasApi } from '../api/alertasApi.js';
import { formatearMoneda, formatearFechaLima } from '../utils/formateadores.js';
import toast from 'react-hot-toast';

export default function Alertas() {
  const [tabActiva, setTabActiva] = useState('bajoStock'); // 'bajoStock' | 'porVencer' | 'vencidos'
  const [alertas, setAlertas] = useState(null);
  const [cargando, setCargando] = useState(true);

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
  const listaActiva = alertas ? alertas[tabActiva] || [] : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Bell className="w-7 h-7 text-amber-500" />
            <span>Alertas de Stock y Vencimiento</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoreo preventivo de existencias críticas y fechas de expiración en horario America/Lima
          </p>
        </div>

        <button
          onClick={cargarAlertas}
          disabled={cargando}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center space-x-2 transition shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin text-brand-600' : ''}`} />
          <span>Actualizar Alertas</span>
        </button>
      </div>

      {/* Pestañas de Navegación con Conteo en Insignia */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setTabActiva('bajoStock')}
          className={`pb-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            tabActiva === 'bajoStock'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Bajo Stock</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              tabActiva === 'bajoStock'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {conteos.bajoStock}
          </span>
        </button>

        <button
          onClick={() => setTabActiva('porVencer')}
          className={`pb-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            tabActiva === 'porVencer'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Por Vencer (≤ 60 días)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              tabActiva === 'porVencer'
                ? 'bg-amber-100 text-amber-900'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {conteos.porVencer}
          </span>
        </button>

        <button
          onClick={() => setTabActiva('vencidos')}
          className={`pb-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            tabActiva === 'vencidos'
              ? 'border-red-700 text-red-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Vencidos</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              tabActiva === 'vencidos'
                ? 'bg-red-100 text-red-800'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {conteos.vencidos}
          </span>
        </button>
      </div>

      {/* Tabla de Productos de la Pestaña Activa */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {cargando ? (
          <div className="py-20 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-2" />
            <p className="text-sm font-medium">Consultando alertas de almacén...</p>
          </div>
        ) : listaActiva.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto stroke-1 text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-slate-700">Sin alertas pendientes en esta sección</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Todos los productos cumplen con los parámetros óptimos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Medicamento</th>
                  <th className="px-5 py-3.5">Categoría</th>
                  <th className="px-5 py-3.5 text-center">Stock Actual</th>
                  <th className="px-5 py-3.5 text-center">Stock Mínimo</th>
                  <th className="px-5 py-3.5">Fecha Vencimiento</th>
                  <th className="px-5 py-3.5 text-right">Precio Venta</th>
                  <th className="px-5 py-3.5 text-center">Diagnóstico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {listaActiva.map((p) => {
                  const stock = Number(p.stock);
                  const min = Number(p.stockMinimo);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      {/* Medicamento */}
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900 text-sm leading-tight">{p.nombre}</p>
                        <p className="text-[11px] text-slate-500">{p.presentacion}</p>
                        {p.principioActivo && (
                          <p className="text-[10px] text-brand-700 font-medium">P.A: {p.principioActivo}</p>
                        )}
                        {p.codigoBarras && (
                          <p className="text-[10px] text-slate-400 font-mono">Cod: {p.codigoBarras}</p>
                        )}
                      </td>

                      {/* Categoría */}
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {p.categoria?.nombre || 'General'}
                        </span>
                      </td>

                      {/* Stock Actual */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`font-black text-sm ${
                            stock === 0 ? 'text-red-600' : stock <= min ? 'text-amber-600' : 'text-slate-900'
                          }`}
                        >
                          {stock} u.
                        </span>
                      </td>

                      {/* Stock Mínimo */}
                      <td className="px-5 py-3.5 text-center text-slate-500 font-semibold whitespace-nowrap">
                        {min} u.
                      </td>

                      {/* Fecha Vencimiento */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-slate-800 font-medium">{formatearFechaLima(p.fechaVencimiento)}</p>
                        {p.lote && <p className="text-[10px] text-slate-400">Lote: {p.lote}</p>}
                      </td>

                      {/* Precio */}
                      <td className="px-5 py-3.5 text-right font-extrabold text-slate-900 whitespace-nowrap">
                        {formatearMoneda(p.precio)}
                      </td>

                      {/* Diagnóstico */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        {tabActiva === 'bajoStock' && (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              stock === 0
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {stock === 0 ? 'AGOTADO (0 u.)' : `DÉFICIT (-${min - stock} u.)`}
                          </span>
                        )}

                        {tabActiva === 'porVencer' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            PRÓXIMO A VENCER
                          </span>
                        )}

                        {tabActiva === 'vencidos' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            CADUCADO / NO VENDER
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
