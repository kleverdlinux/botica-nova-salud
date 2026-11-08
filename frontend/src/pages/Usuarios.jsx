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
  Package
} from 'lucide-react';
import { listarUsuariosApi, crearUsuarioApi, cambiarEstadoUsuarioApi } from '../api/usuariosApi.js';
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

  // Estados del modal de creación
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

  useEffect(() => {
    cargarUsuarios();
  }, []);

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
    return (
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.rol.toLowerCase().includes(q)
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
            Administración de cuentas autorizadas, perfiles de cajero y directores del sistema
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={cargarUsuarios}
            disabled={cargando}
            className="p-2.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200 rounded-xl shadow-xs transition cursor-pointer"
            title="Recargar usuarios"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-[#0d9488] dark:text-teal-400' : ''}`} />
          </button>

          <button
            onClick={handleAbrirModal}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center space-x-2 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

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
    </div>
  );
}

