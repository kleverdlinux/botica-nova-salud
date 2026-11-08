import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarClock,
  Search,
  RefreshCw,
  Phone,
  MessageCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Activity,
  HeartPulse,
  User,
  Filter,
  X
} from 'lucide-react';
import { listarCitasApi, cambiarEstadoCitaApi } from '../api/citasApi';
import { notificarExito, notificarError } from '../utils/alertaSweet';

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [actualizandoId, setActualizandoId] = useState(null);

  const cargarCitas = useCallback(async () => {
    setCargando(true);
    try {
      const res = await listarCitasApi({ estado: filtroEstado, busqueda });
      if (res?.ok && Array.isArray(res.citas)) {
        setCitas(res.citas);
      }
    } catch (err) {
      console.warn('Error al cargar citas:', err);
      notificarError('Error al Cargar', 'No se pudieron obtener las citas de tópico.');
    } finally {
      setCargando(false);
    }
  }, [filtroEstado, busqueda]);

  useEffect(() => {
    cargarCitas();
  }, [cargarCitas]);

  const handleCambiarEstado = async (id, nuevoEstado) => {
    setActualizandoId(id);
    try {
      const res = await cambiarEstadoCitaApi(id, nuevoEstado);
      if (res?.ok) {
        setCitas((prev) =>
          prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
        );
        notificarExito('Estado Actualizado', `La cita ${id} ahora está en ${nuevoEstado}.`);
      }
    } catch (err) {
      console.error('Error al actualizar estado de cita:', err);
      notificarError('Error', 'No se pudo actualizar el estado de la cita.');
    } finally {
      setActualizandoId(null);
    }
  };

  const totalCitas = citas.length;
  const pendientes = citas.filter((c) => c.estado === 'PENDIENTE').length;
  const atendidos = citas.filter((c) => c.estado === 'ATENDIDO').length;
  const cancelados = citas.filter((c) => c.estado === 'CANCELADO').length;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0d9488] block">
            Servicios Asistenciales • Botica Nova Salud
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Citas de Tópico Clínico
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Registro, respaldo y seguimiento de pacientes agendados desde la tienda web.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarCitas}
          disabled={cargando}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs font-bold text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition cursor-pointer shadow-xs shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 block">
            Total Citas
          </span>
          <span className="text-xl font-black font-mono text-slate-900 dark:text-white block mt-0.5">
            {totalCitas}
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
            Pendientes
          </span>
          <span className="text-xl font-black font-mono text-amber-700 dark:text-amber-400 block mt-0.5">
            {pendientes}
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Atendidos
          </span>
          <span className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400 block mt-0.5">
            {atendidos}
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/40 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
            Cancelados
          </span>
          <span className="text-xl font-black font-mono text-rose-700 dark:text-rose-400 block mt-0.5">
            {cancelados}
          </span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por paciente, teléfono o código (ej: CIT-2026-0001)..."
            className="w-full pl-8 pr-8 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-950 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Solo Pendientes</option>
            <option value="ATENDIDO">Solo Atendidos</option>
            <option value="CANCELADO">Solo Cancelados</option>
          </select>
        </div>
      </div>

      {/* Listado de Citas */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-neutral-800">
            <thead className="bg-slate-50 dark:bg-neutral-950 text-slate-700 dark:text-neutral-300 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Código Cita</th>
                <th className="px-5 py-3.5">Fecha / Horario</th>
                <th className="px-5 py-3.5">Paciente</th>
                <th className="px-5 py-3.5">Servicio de Tópico</th>
                <th className="px-5 py-3.5">Tarifa</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5 text-right">Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60 bg-white dark:bg-neutral-900">
              {cargando ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-5 py-4 bg-slate-50/50 dark:bg-neutral-950/20" />
                  </tr>
                ))
              ) : citas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400 dark:text-neutral-500">
                    <CalendarClock className="w-10 h-10 mx-auto stroke-1 text-slate-300 dark:text-neutral-600 mb-2" />
                    <p className="text-sm font-medium text-slate-600 dark:text-neutral-300">
                      No hay citas de tópico registradas
                    </p>
                    <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">
                      Las citas confirmadas desde la web se guardarán y respaldarán aquí automáticamente.
                    </p>
                  </td>
                </tr>
              ) : (
                citas.map((cita) => {
                  const esActualizando = actualizandoId === cita.id;
                  const celLimpio = cita.telefono ? cita.telefono.replace(/\D/g, '') : '';
                  const mensajeWsp = `Hola ${cita.paciente}, te saludamos de Botica Nova Salud respecto a tu cita agendada para ${cita.servicioNombre}.`;

                  return (
                    <tr
                      key={cita.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition"
                    >
                      {/* Código */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-neutral-800 px-2 py-1 rounded-md text-xs border border-slate-200 dark:border-neutral-700">
                          {cita.id}
                        </span>
                      </td>

                      {/* Fecha / Horario */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {new Date(cita.createdAt || cita.fecha).toLocaleDateString('es-PE')}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{cita.horario}</span>
                        </div>
                      </td>

                      {/* Paciente */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cita.paciente}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono mt-0.5">
                          {cita.telefono}
                        </div>
                      </td>

                      {/* Servicio */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 dark:text-neutral-200">
                          {cita.servicioNombre}
                        </span>
                      </td>

                      {/* Tarifa */}
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-[#0d9488]">
                        {cita.precio > 0 ? `S/ ${cita.precio.toFixed(2)}` : 'Gratuito'}
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <select
                          value={cita.estado}
                          disabled={esActualizando}
                          onChange={(e) => handleCambiarEstado(cita.id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition cursor-pointer outline-none ${
                            cita.estado === 'ATENDIDO'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : cita.estado === 'CANCELADO'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="ATENDIDO">Atendido</option>
                          <option value="CANCELADO">Cancelado</option>
                        </select>
                      </td>

                      {/* Contacto WhatsApp */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        {celLimpio ? (
                          <a
                            href={`https://wa.me/51${celLimpio}?text=${encodeURIComponent(mensajeWsp)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366]/10 text-emerald-700 hover:bg-[#25D366]/20 font-bold text-xs transition border border-emerald-200"
                            title="Chatear con el paciente por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                            <span>WhatsApp</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">Sin teléfono</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

