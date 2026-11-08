import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  Package,
  KeyRound,
  Send,
  Sparkles,
  Phone,
  MapPin,
  ShoppingBag,
  X
} from 'lucide-react';
import { listarUsuariosApi, crearUsuarioApi, cambiarEstadoUsuarioApi } from '../api/usuariosApi.js';
import { listarClientesWebAdminApi, reasignarPasswordClienteApi } from '../api/clientesAdminApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { SkeletonTable } from '../components/ui/skeleton.tsx';
import { formatearFechaLima } from '../utils/formateadores.js';
import toast, { notificarExito, notificarError, notificarAdvertencia, confirmarAccion } from '../utils/alertaSweet.js';

export default function Usuarios() {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('TODOS'); // 'TODOS' | 'ADMIN' | 'CAJERO' | 'ALMACEN'
  const [filtroEstado, setFiltroEstado] = useState('TODOS'); // 'TODOS' | 'ACTIVOS' | 'INACTIVOS'

  // Pestañas: 'PERSONAL' (Personal de botica) o 'CLIENTES' (Clientes web & Recuperaciones)
  const [tabActiva, setTabActiva] = useState('PERSONAL');

  // Estados de Clientes Web y Recuperación
  const [clientes, setClientes] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [busquedaClientes, setBusquedaClientes] = useState('');
  const [filtroClientesEstado, setFiltroClientesEstado] = useState('TODOS'); // 'TODOS' | 'SOLICITUD'
  const [clienteParaClave, setClienteParaClave] = useState(null);
  const [nuevaClaveCliente, setNuevaClaveCliente] = useState('');
  const [enviandoClave, setEnviandoClave] = useState(false);

  // Estados del modal de creación de usuario personal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'CAJERO'
  });

  // Estado para confirmación de cambio de estado
  const [usuarioAfectado, setUsuarioAfectado] = useState(null);
  const [procesandoEstado, setProcesandoEstado] = useState(false);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const data = await listarUsuariosApi();
      setUsuarios(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      toast.error('No se pudo cargar la lista de usuarios del sistema.');
    } finally {
      setCargando(false);
    }
  };

  const cargarClientes = async () => {
    setCargandoClientes(true);
    try {
      const data = await listarClientesWebAdminApi();
      setClientes(data);
    } catch (err) {
      console.error('Error al cargar clientes web:', err);
      toast.error('No se pudo cargar la lista de clientes web.');
    } finally {
      setCargandoClientes(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
    cargarClientes();
  }, []);

  const generarClaveAleatoria = () => {
    const sufijo = Math.floor(100 + Math.random() * 900);
    setNuevaClaveCliente(`Nova${sufijo}!`);
  };

  const handleAbrirModalReasignar = (cliente) => {
    setClienteParaClave(cliente);
    const sufijo = Math.floor(100 + Math.random() * 900);
    setNuevaClaveCliente(`Nova${sufijo}!`);
  };

  const handleReasignarClaveCliente = async (e) => {
    e.preventDefault();
    if (!clienteParaClave) return;
    if (!nuevaClaveCliente || nuevaClaveCliente.trim().length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setEnviandoClave(true);
    try {
      const res = await reasignarPasswordClienteApi({
        dni: clienteParaClave.dni,
        nuevaPassword: nuevaClaveCliente.trim()
      });
      toast.success(res.mensaje || 'Contraseña reasignada y enviada al cliente.');
      setClienteParaClave(null);
      setNuevaClaveCliente('');
      cargarClientes();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error al reasignar contraseña.';
      toast.error(msg);
    } finally {
      setEnviandoClave(false);
    }
  };

  const handleAbrirModal = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'CAJERO'
    });
    setMostrarPassword(false);
    setModalAbierto(true);
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim() || formData.nombre.trim().length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Ingrese un correo electrónico válido.');
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      toast.error('La contraseña debe contener al menos 8 caracteres.');
      return;
    }

    setGuardando(true);
    try {
      await crearUsuarioApi(formData);
      toast.success('Usuario registrado exitosamente');
      setModalAbierto(false);
      cargarUsuarios();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al crear el usuario';
      toast.error(msg);
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmarCambioEstado = async () => {
    if (!usuarioAfectado) return;

    if (usuarioActual?.id === usuarioAfectado.id && usuarioAfectado.activo) {
      toast.error('No puedes desactivar tu propia cuenta activa.');
      setUsuarioAfectado(null);
      return;
    }

    setProcesandoEstado(true);
    const nuevoEstado = !usuarioAfectado.activo;

    try {
      await cambiarEstadoUsuarioApi(usuarioAfectado.id, nuevoEstado);
      toast.success(
        nuevoEstado
          ? `Usuario "${usuarioAfectado.nombre}" reactivado correctamente.`
          : `Usuario "${usuarioAfectado.nombre}" desactivado.`
      );
      setUsuarioAfectado(null);
      cargarUsuarios();
    } catch (err) {
      const msg = err.response?.data?.error || 'No se pudo actualizar el estado del usuario.';
      toast.error(msg);
    } finally {
      setProcesandoEstado(false);
    }
  };

  // Filtrado de usuarios por término de búsqueda, rol y estado
  const usuariosFiltrados = usuarios.filter((u) => {
    if (filtroRol !== 'TODOS' && u.rol !== filtroRol) return false;
    if (filtroEstado === 'ACTIVOS' && !u.activo) return false;
    if (filtroEstado === 'INACTIVOS' && u.activo) return false;
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    if (q.length <= 2) {
      const matchPrefix = (str) => {
        if (!str) return false;
        return str.toLowerCase().split(/\s+/).some((w) => w.startsWith(q));
      };
      return matchPrefix(u.nombre) || u.email.toLowerCase().startsWith(q) || u.rol.toLowerCase().startsWith(q);
    }
    return (
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.rol.toLowerCase().includes(q)
    );
  });

  const solicitudesPendientesCount = clientes.filter((c) => c.solicitudPendiente).length;

  const clientesFiltrados = clientes.filter((c) => {
    if (filtroClientesEstado === 'SOLICITUD' && !c.solicitudPendiente) return false;
    const q = busquedaClientes.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.nombre && c.nombre.toLowerCase().includes(q)) ||
      (c.dni && c.dni.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.telefono && c.telefono.includes(q)) ||
      (c.distrito && c.distrito.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Encabezado y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Users className="w-7 h-7 text-[#0d9488] dark:text-teal-400" />
            <span>Gestión de Usuarios y Accesos</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Administración de cuentas autorizadas, clientes web y solicitudes de restablecimiento de contraseña
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={tabActiva === 'PERSONAL' ? cargarUsuarios : cargarClientes}
            disabled={tabActiva === 'PERSONAL' ? cargando : cargandoClientes}
            className="p-2.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200 rounded-xl shadow-xs transition cursor-pointer"
            title="Recargar datos"
          >
            <RefreshCw className={`w-4 h-4 ${(tabActiva === 'PERSONAL' ? cargando : cargandoClientes) ? 'animate-spin text-[#0d9488] dark:text-teal-400' : ''}`} />
          </button>

          {tabActiva === 'PERSONAL' && (
            <button
              onClick={handleAbrirModal}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center space-x-2 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          )}
        </div>
      </div>

      {/* Selector de Pestañas: Personal vs Clientes Web */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-neutral-800 pb-2">
        <button
          type="button"
          onClick={() => setTabActiva('PERSONAL')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            tabActiva === 'PERSONAL'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Personal del Sistema ({usuarios.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('CLIENTES')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            tabActiva === 'CLIENTES'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Clientes Web & Recuperaciones ({clientes.length})</span>
          {solicitudesPendientesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-900 animate-pulse">
              {solicitudesPendientesCount} pendiente{solicitudesPendientesCount > 1 ? 's' : ''}
            </span>
          )}
        </button>
      </div>

      {/* VISTA 1: PERSONAL DEL SISTEMA */}
      {tabActiva === 'PERSONAL' && (
        <>
          {/* Barra de Filtro y Métricas Rápidas */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, correo..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:bg-white dark:focus:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-neutral-500"
            />
          </div>

          {/* Selector de Rol */}
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
          >
            <option value="TODOS">Todos los roles</option>
            <option value="ADMIN">Administradores</option>
            <option value="CAJERO">Cajeros</option>
            <option value="ALMACEN">Almacén</option>
          </select>

          {/* Selector de Estado */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVOS">Solo Activos</option>
            <option value="INACTIVOS">Solo Inactivos</option>
          </select>
        </div>

        <div className="flex items-center space-x-3 text-xs font-semibold text-slate-600 dark:text-neutral-400 shrink-0">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Activos: {usuarios.filter((u) => u.activo).length}</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-neutral-600 inline-block" />
            <span>Inactivos: {usuarios.filter((u) => !u.activo).length}</span>
          </span>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        {cargando ? (
          <div className="p-4">
            <SkeletonTable rows={4} cols={6} />
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-neutral-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-neutral-600" />
            <p className="text-sm font-bold text-slate-600 dark:text-neutral-300">No se encontraron usuarios</p>
            <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">Pruebe modificando el término de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Correo Electrónico</th>
                  <th className="py-3 px-4 text-center">Rol en Sistema</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4">Fecha de Registro</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {usuariosFiltrados.map((u) => {
                  const esUsuarioLogueado = usuarioActual?.id === u.id;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-neutral-800/40 transition ${
                        !u.activo ? 'bg-slate-50/40 dark:bg-neutral-950/40 text-slate-400 dark:text-neutral-500' : ''
                      }`}
                    >
                      {/* Avatar e Identificación */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs uppercase shrink-0 border ${
                              u.rol === 'ADMIN'
                                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.nombre}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              u.nombre.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">{u.nombre}</span>
                              {esUsuarioLogueado && (
                                <span className="text-[9px] bg-teal-100 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-300 font-extrabold px-1.5 py-0.2 rounded border border-teal-200 dark:border-teal-800">
                                  TÚ
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-neutral-500">ID #{u.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-neutral-300">
                        {u.email}
                      </td>

                      {/* Rol */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            u.rol === 'ADMIN'
                              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : u.rol === 'ALMACEN'
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {u.rol === 'ADMIN' ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : u.rol === 'ALMACEN' ? (
                            <Package className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {u.rol === 'ALMACEN' ? 'ALMACÉN' : u.rol}
                          </span>
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            u.activo
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {u.activo ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          )}
                          <span>{u.activo ? 'ACTIVO' : 'INACTIVO'}</span>
                        </span>
                      </td>

                      {/* Fecha de Registro */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-neutral-400">
                        {formatearFechaLima(u.createdAt)}
                      </td>

                      {/* Botón de Acción */}
                      <td className="py-3.5 px-4 text-center">
                        {esUsuarioLogueado ? (
                          <span
                            className="text-[11px] text-slate-400 dark:text-neutral-500 italic bg-slate-100 dark:bg-neutral-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-neutral-700 cursor-not-allowed select-none"
                            title="No puedes desactivar tu propia cuenta activa"
                          >
                            Sesión actual
                          </span>
                        ) : (
                          <button
                            onClick={() => setUsuarioAfectado(u)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                              u.activo
                                ? 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {u.activo ? 'Desactivar' : 'Reactivar'}
                          </button>
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
      </>
      )}

      {/* VISTA 2: CLIENTES WEB & RECUPERACIÓN DE CONTRASEÑA */}
      {tabActiva === 'CLIENTES' && (
        <>
          {/* Barra de Filtro y Métricas de Clientes */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={busquedaClientes}
                  onChange={(e) => setBusquedaClientes(e.target.value)}
                  placeholder="Buscar por DNI, nombre, correo..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:bg-white dark:focus:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-neutral-500"
                />
              </div>

              <select
                value={filtroClientesEstado}
                onChange={(e) => setFiltroClientesEstado(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
              >
                <option value="TODOS">Todos los clientes web</option>
                <option value="SOLICITUD">Solo con Solicitud de Contraseña Pendiente</option>
              </select>
            </div>

            <div className="flex items-center space-x-3 text-xs font-semibold text-slate-600 dark:text-neutral-400 shrink-0">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Registrados: {clientes.length}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className={`w-2.5 h-2.5 rounded-full inline-block ${solicitudesPendientesCount > 0 ? 'bg-amber-500' : 'bg-slate-300'}`} />
                <span>Solicitudes Pendientes: {solicitudesPendientesCount}</span>
              </span>
            </div>
          </div>

          {/* Tabla de Clientes Web */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs overflow-hidden">
            {cargandoClientes ? (
              <div className="p-4">
                <SkeletonTable rows={4} cols={5} />
              </div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-neutral-800 text-slate-400 flex items-center justify-center mx-auto">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">
                  No se encontraron clientes web
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
                  No hay registros que coincidan con el término de búsqueda o filtro seleccionado.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-50/75 dark:bg-neutral-950/50 text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Cliente / Identidad</th>
                      <th className="py-3.5 px-4">Contacto & Ubicación</th>
                      <th className="py-3.5 px-4">Compras Web</th>
                      <th className="py-3.5 px-4">Solicitud de Contraseña</th>
                      <th className="py-3.5 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                    {clientesFiltrados.map((c) => {
                      const tieneSolicitud = !!c.solicitudPendiente;
                      return (
                        <tr
                          key={c.id || c.dni}
                          className={`transition ${
                            tieneSolicitud
                              ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70'
                              : 'hover:bg-slate-50/60 dark:hover:bg-neutral-800/40'
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                tieneSolicitud
                                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                  : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800'
                              }`}>
                                {c.nombre ? c.nombre.charAt(0).toUpperCase() : 'C'}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                                  {c.nombre}
                                </span>
                                <span className="font-mono text-[11px] text-slate-500 dark:text-neutral-400">
                                  DNI: {c.dni}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="flex items-center space-x-1.5 text-slate-700 dark:text-neutral-300">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span>{c.email}</span>
                              </span>
                              {c.telefono && (
                                <span className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-neutral-400">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{c.telefono}</span>
                                </span>
                              )}
                              <span className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-neutral-400">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{c.distrito || 'Juliaca'} - {c.direccion || 'Cercado'}</span>
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300">
                              <ShoppingBag className="w-3 h-3 text-teal-600" />
                              <span>{c.totalCompras || 0} compras</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {tieneSolicitud ? (
                              <div className="space-y-1.5 max-w-xs">
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  <span>Solicita Restablecer Clave</span>
                                </span>
                                <div className="p-2 bg-white dark:bg-neutral-900 rounded-lg border border-amber-200 dark:border-amber-800/60 text-[11px] text-slate-700 dark:text-neutral-300 leading-snug">
                                  "{c.solicitudPendiente.mensaje}"
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-neutral-500 block">
                                  Fecha: {formatearFechaLima(c.solicitudPendiente.fecha)}
                                </span>
                              </div>
                            ) : c.historialSolicitud?.estado === 'ATENDIDO' ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Atendido por Admin</span>
                                </span>
                                {c.historialSolicitud.fechaAtencion && (
                                  <span className="text-[10px] text-slate-400 block">
                                    {formatearFechaLima(c.historialSolicitud.fechaAtencion)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 dark:text-neutral-500 text-[11px]">
                                Sin solicitudes
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleAbrirModalReasignar(c)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ml-auto cursor-pointer shadow-xs ${
                                tieneSolicitud
                                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20 animate-pulse'
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200'
                              }`}
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>{tieneSolicitud ? 'Atender y Reasignar' : 'Reasignar Clave'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL: REGISTRAR NUEVO USUARIO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-neutral-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#0d9488] dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    Nuevo Usuario del Sistema
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Registre un nuevo cajero o administrador
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="space-y-4">
              {/* Nombre Completo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Nombre Completo <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. María Elena Paredes"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:bg-white dark:focus:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-neutral-100 font-medium"
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Correo Electrónico (Login) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="cajero.maria@novasalud.pe"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:bg-white dark:focus:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-neutral-100 font-medium"
                  />
                </div>
              </div>

              {/* Contraseña Inicial */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Contraseña de Acceso <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:bg-white dark:focus:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-neutral-100 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 cursor-pointer"
                  >
                    {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1">
                  Debe tener al menos 8 caracteres. Será encriptada con bcrypt al guardar.
                </p>
              </div>

              {/* Rol */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Rol y Nivel de Privilegios <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5">
                  <label className={`flex flex-col p-2.5 rounded-xl border cursor-pointer transition ${formData.rol === "CAJERO" ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 shadow-xs" : "border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-400"}`}>
                    <div className="flex items-center space-x-1.5">
                      <input type="radio" name="rol" value="CAJERO" checked={formData.rol === "CAJERO"} onChange={(e) => setFormData({ ...formData, rol: e.target.value })} className="text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-[11px] font-bold">CAJERO</span>
                    </div>
                    <span className="text-[9px] text-slate-500 dark:text-neutral-400 mt-1 pl-4">Ventas en mostrador, emision de boletas y consulta de stock.</span>
                  </label>
                  <label className={`flex flex-col p-2.5 rounded-xl border cursor-pointer transition ${formData.rol === "ALMACEN" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 shadow-xs" : "border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-400"}`}>
                    <div className="flex items-center space-x-1.5">
                      <input type="radio" name="rol" value="ALMACEN" checked={formData.rol === "ALMACEN"} onChange={(e) => setFormData({ ...formData, rol: e.target.value })} className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-[11px] font-bold">ALMACEN</span>
                    </div>
                    <span className="text-[9px] text-slate-500 dark:text-neutral-400 mt-1 pl-4">Recepcion de compras, inventario, lotes y Kardex.</span>
                  </label>
                  <label className={`flex flex-col p-2.5 rounded-xl border cursor-pointer transition ${formData.rol === "ADMIN" ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200 shadow-xs" : "border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-400"}`}>
                    <div className="flex items-center space-x-1.5">
                      <input type="radio" name="rol" value="ADMIN" checked={formData.rol === "ADMIN"} onChange={(e) => setFormData({ ...formData, rol: e.target.value })} className="text-purple-600 focus:ring-purple-500" />
                      <span className="text-[11px] font-bold">ADMIN</span>
                    </div>
                    <span className="text-[9px] text-slate-500 dark:text-neutral-400 mt-1 pl-4">Acceso total: metricas, personal, finanzas y reportes.</span>
                  </label>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-xl text-xs font-bold text-slate-600 dark:text-neutral-300 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 dark:disabled:bg-neutral-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center space-x-1.5 transition cursor-pointer"
                >
                  {guardando ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Crear Usuario</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN: CAMBIAR ESTADO */}
      {usuarioAfectado && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-neutral-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {usuarioAfectado.activo ? '¿Desactivar este usuario?' : '¿Reactivar este usuario?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                {usuarioAfectado.activo ? (
                  <>
                    El usuario <strong>{usuarioAfectado.nombre}</strong> no podrá iniciar sesión en el sistema ni operar el POS.
                  </>
                ) : (
                  <>
                    El usuario <strong>{usuarioAfectado.nombre}</strong> recuperará su acceso inmediato al sistema.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setUsuarioAfectado(null)}
                className="px-4 py-2 border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-xl text-xs font-bold text-slate-600 dark:text-neutral-300 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarCambioEstado}
                disabled={procesandoEstado}
                className={`px-4 py-2 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5 cursor-pointer ${
                  usuarioAfectado.activo
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                }`}
              >
                {procesandoEstado ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>{usuarioAfectado.activo ? 'Sí, Desactivar' : 'Sí, Reactivar'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REASIGNAR CONTRASEÑA DE CLIENTE Y ENVIAR POR GMAIL */}
      {clienteParaClave && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-neutral-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    Reasignar Contraseña de Cliente
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                    Se enviará la nueva clave al correo del cliente
                  </p>
                </div>
              </div>
              <button
                onClick={() => setClienteParaClave(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ficha Resumen del Cliente */}
            <div className="bg-slate-50 dark:bg-neutral-950 p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-neutral-400 font-semibold">Cliente:</span>
                <span className="font-bold text-slate-800 dark:text-white">{clienteParaClave.nombre}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-neutral-400 font-semibold">DNI:</span>
                <span className="font-mono text-slate-800 dark:text-white">{clienteParaClave.dni}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-neutral-400 font-semibold">Correo de Destino:</span>
                <span className="font-semibold text-teal-700 dark:text-teal-400">{clienteParaClave.email}</span>
              </div>

              {clienteParaClave.solicitudPendiente && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-neutral-800">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                    Mensaje enviado por el cliente:
                  </span>
                  <p className="text-xs italic text-slate-600 dark:text-neutral-300 bg-amber-50/60 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-900/50">
                    "{clienteParaClave.solicitudPendiente.mensaje}"
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleReasignarClaveCliente} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300">
                    Nueva Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={generarClaveAleatoria}
                    className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generar Automática</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={nuevaClaveCliente}
                    onChange={(e) => setNuevaClaveCliente(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-3.5 pr-4 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">
                  Esta clave será hasheada con bcrypt en la base de datos y se notificará por correo.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setClienteParaClave(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-xl text-xs font-bold text-slate-600 dark:text-neutral-300 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviandoClave}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center space-x-1.5 transition cursor-pointer"
                >
                  {enviandoClave ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enviando por Correo...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Guardar y Enviar al Gmail</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

