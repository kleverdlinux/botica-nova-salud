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
  RefreshCw
} from 'lucide-react';
import { listarUsuariosApi, crearUsuarioApi, cambiarEstadoUsuarioApi } from '../api/usuariosApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatearFechaLima } from '../utils/formateadores.js';
import toast from 'react-hot-toast';

export default function Usuarios() {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

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

  // Filtrado de usuarios por término de búsqueda
  const usuariosFiltrados = usuarios.filter((u) => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.rol.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Encabezado y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-7 h-7 text-brand-600" />
            <span>Gestión de Usuarios y Accesos</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administración de cuentas autorizadas, perfiles de cajero y directores del sistema
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={cargarUsuarios}
            disabled={cargando}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-xs transition cursor-pointer"
            title="Recargar usuarios"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          <button
            onClick={handleAbrirModal}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center space-x-2 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtro y Métricas Rápidas */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, correo o rol..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-slate-800"
          />
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold text-slate-600">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Activos: {usuarios.filter((u) => u.activo).length}</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
            <span>Inactivos: {usuarios.filter((u) => !u.activo).length}</span>
          </span>
          <span className="text-slate-400">|</span>
          <span>Total: {usuarios.length} cuentas</span>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {cargando ? (
          <div className="py-20 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-2" />
            <p className="text-xs font-semibold">Cargando directorio de usuarios...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">No se encontraron usuarios</p>
            <p className="text-xs text-slate-400 mt-1">Pruebe modificando el término de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Correo Electrónico</th>
                  <th className="py-3 px-4 text-center">Rol en Sistema</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4">Fecha de Registro</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuariosFiltrados.map((u) => {
                  const esUsuarioLogueado = usuarioActual?.id === u.id;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/60 transition ${
                        !u.activo ? 'bg-slate-50/40 text-slate-400' : ''
                      }`}
                    >
                      {/* Avatar e Identificación */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                              u.rol === 'ADMIN'
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {u.nombre.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-900">{u.nombre}</span>
                              {esUsuarioLogueado && (
                                <span className="text-[9px] bg-brand-100 text-brand-800 font-extrabold px-1.5 py-0.2 rounded border border-brand-200">
                                  TÚ
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">ID #{u.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {u.email}
                      </td>

                      {/* Rol */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            u.rol === 'ADMIN'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {u.rol === 'ADMIN' ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          <span>{u.rol}</span>
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            u.activo
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
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
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatearFechaLima(u.createdAt)}
                      </td>

                      {/* Botón de Acción */}
                      <td className="py-3.5 px-4 text-center">
                        {esUsuarioLogueado ? (
                          <span
                            className="text-[11px] text-slate-400 italic bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 cursor-not-allowed select-none"
                            title="No puedes desactivar tu propia cuenta activa"
                          >
                            Sesión actual
                          </span>
                        ) : (
                          <button
                            onClick={() => setUsuarioAfectado(u)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              u.activo
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    Nuevo Usuario del Sistema
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Registre un nuevo cajero o administrador
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="space-y-4">
              {/* Nombre Completo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Completo <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. María Elena Paredes"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico (Login) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="cajero.maria@novasalud.pe"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Contraseña Inicial */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña de Acceso <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-slate-800 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Debe tener al menos 8 caracteres. Será encriptada con bcrypt al guardar.
                </p>
              </div>

              {/* Rol */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rol y Nivel de Privilegios <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <label
                    className={`flex flex-col p-3 rounded-xl border cursor-pointer transition ${
                      formData.rol === 'CAJERO'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="rol"
                        value="CAJERO"
                        checked={formData.rol === 'CAJERO'}
                        onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold">CAJERO</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 pl-5">
                      Ventas en POS, consulta de alertas e inventario sin costos.
                    </span>
                  </label>

                  <label
                    className={`flex flex-col p-3 rounded-xl border cursor-pointer transition ${
                      formData.rol === 'ADMIN'
                        ? 'border-purple-500 bg-purple-50/50 text-purple-950 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="rol"
                        value="ADMIN"
                        checked={formData.rol === 'ADMIN'}
                        onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold">ADMINISTRADOR</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 pl-5">
                      Acceso total: dashboard, métricas, kardex, gestión de usuarios.
                    </span>
                  </label>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center space-x-1.5 transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                {usuarioAfectado.activo ? '¿Desactivar este usuario?' : '¿Reactivar este usuario?'}
              </h3>
              <p className="text-xs text-slate-500">
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
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition cursor-pointer"
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
