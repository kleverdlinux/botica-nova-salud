import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Lock,
  Phone,
  Mail,
  ShieldCheck,
  Check,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Boxes,
  UserCheck,
  Upload,
  Camera,
  Trash2,
  Globe
} from 'lucide-react';
import { actualizarPerfilApi } from '../api/authApi.js';
import { notificarExito, notificarError } from '../utils/alertaSweet.js';

// Catálogo oficial de 4 avatares temáticos locales por rol (Admin, Cajero, Almacén)
const AVATARES_POR_ROL = {
  ADMIN: [
    { url: '/avatars/admin/admin-1.svg', titulo: 'Insignia Institucional' },
    { url: '/avatars/admin/admin-2.jpg', titulo: 'Gerente en Terno' },
    { url: '/avatars/admin/admin-3.jpg', titulo: 'Director Técnico en Bata' },
    { url: '/avatars/admin/admin-4.jpg', titulo: 'Química Farmacéutica' }
  ],
  CAJERO: [
    { url: '/avatars/cajero/cajero-1.svg', titulo: 'Logo Caja & POS' },
    { url: '/avatars/cajero/cajero-2.jpg', titulo: 'Chica en Mostrador (Carla)' },
    { url: '/avatars/cajero/cajero-3.jpg', titulo: 'Chico Dispensador de Caja' },
    { url: '/avatars/cajero/cajero-4.jpg', titulo: 'Atención Farmacéutica' }
  ],
  ALMACEN: [
    { url: '/avatars/almacen/almacen-1.svg', titulo: 'Insignia Kardex BPA' },
    { url: '/avatars/almacen/almacen-2.jpg', titulo: 'Supervisor de Logística' },
    { url: '/avatars/almacen/almacen-3.jpg', titulo: 'Especialista en FEFO' },
    { url: '/avatars/almacen/almacen-4.jpg', titulo: 'Operador de Almacén' }
  ]
};

export default function ModalPerfil({ abierto, alCerrar, usuario, alActualizar }) {
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [avatar, setAvatar] = useState(usuario?.avatar || '');
  const [telefono, setTelefono] = useState(usuario?.telefono || '');
  const [tabRolAvatar, setTabRolAvatar] = useState(usuario?.rol || 'ADMIN');
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const fileInputRef = useRef(null);

  // Sincronizar campos cuando se abre el modal o cambia el usuario
  useEffect(() => {
    if (abierto && usuario) {
      setNombre(usuario.nombre || '');
      setAvatar(usuario.avatar || '');
      setTelefono(usuario.telefono || '');
      setTabRolAvatar(usuario.rol || 'ADMIN');
      setPasswordActual('');
      setNuevoPassword('');
      setConfirmarPassword('');
    }
  }, [abierto, usuario]);

  if (!abierto) return null;

  // Manejador para subir foto desde el escritorio / PC local
  const handleSubirArchivo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notificarError('Archivo Inválido', 'Por favor selecciona un archivo de imagen (.png, .jpg, .webp).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      notificarError('Archivo Muy Pesado', 'La imagen seleccionada supera el límite de 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar y optimizar en canvas para guardado veloz y liviano
        const canvas = document.createElement('canvas');
        const MAX_DIM = 320;
        let w = img.width;
        let h = img.height;

        if (w > h) {
          if (w > MAX_DIM) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          }
        } else {
          if (h > MAX_DIM) {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatar(dataUrl);
        notificarExito('Foto Cargada', 'Se previsualiza la imagen de tu equipo.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Helper de rol oficial para los 3 perfiles (ADMIN, ALMACEN, CAJERO)
  const getRolBadge = () => {
    if (usuario?.rol === 'ADMIN') {
      return {
        label: 'ADMINISTRADOR GENERAL',
        desc: 'Acceso Total al Sistema',
        icon: <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white" />,
        badgeClass: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700'
      };
    }
    if (usuario?.rol === 'ALMACEN') {
      return {
        label: 'GESTOR DE ALMACÉN',
        desc: 'Inventario, Lotes y Kardex',
        icon: <Boxes className="w-3.5 h-3.5 text-black dark:text-white" />,
        badgeClass: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700'
      };
    }
    return {
      label: 'CAJERO DE MOSTRADOR',
      desc: 'Punto de Venta y Cobranza',
      icon: <UserCheck className="w-3.5 h-3.5 text-black dark:text-white" />,
      badgeClass: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700'
    };
  };

  const rolBadge = getRolBadge();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      notificarError('Campo Requerido', 'El nombre no puede estar vacío.');
      return;
    }

    if (nuevoPassword) {
      if (nuevoPassword.length < 6) {
        notificarError('Contraseña Insegura', 'La nueva contraseña debe tener mínimo 6 caracteres.');
        return;
      }
      if (nuevoPassword !== confirmarPassword) {
        notificarError('Contraseñas No Coinciden', 'La confirmación no coincide con la nueva contraseña.');
        return;
      }
    }

    setGuardando(true);
    try {
      const payload = {
        nombre: nombre.trim(),
        avatar: avatar.trim(),
        telefono: telefono.trim()
      };
      if (nuevoPassword) {
        payload.nuevoPassword = nuevoPassword;
        payload.passwordActual = passwordActual;
      }

      const actualizado = await actualizarPerfilApi(payload);
      alActualizar(actualizado);
      notificarExito('Perfil Actualizado', 'Tus datos han sido guardados con éxito.');
      alCerrar();
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      notificarError('Error al Guardar', err.response?.data?.error || 'No se pudo actualizar tu perfil.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      {/* Modal Horizontal Ancho (max-w-3xl) sin necesidad de scroll vertical */}
      <div className="bg-white dark:bg-black w-full max-w-3xl rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden transition-all">
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white flex items-center justify-center border border-neutral-200 dark:border-neutral-800 shadow-2xs">
              <User className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-neutral-900 dark:text-white tracking-tight">
                Mi Perfil de Usuario
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Personaliza tu foto, credenciales y datos de acceso operativo
              </p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario en Layout Horizontal de 2 Columnas */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-[230px_1fr] gap-6">
            {/* Columna Izquierda: Foto, Avatar y Rol Oficial */}
            <div className="flex flex-col items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 space-y-3">
              {/* Input oculto para subir archivos locales */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleSubirArchivo}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />

              <div className="text-center w-full">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  title="Haz clic para subir una foto desde tu equipo"
                  className="w-24 h-24 rounded-2xl border-2 border-neutral-300 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-900 shadow-sm mx-auto flex items-center justify-center mb-2.5 relative group cursor-pointer"
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={nombre}
                      className="w-full h-full object-cover transition group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/media/hero-farmaceutica.png';
                      }}
                    />
                  ) : (
                    <User className="w-10 h-10 text-neutral-400" />
                  )}
                  {/* Overlay cámara al pasar el cursor */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold transition-opacity">
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Cambiar</span>
                  </div>
                </div>

                {/* Badge de Rol según el usuario activo */}
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider mb-1 shadow-2xs">
                  {rolBadge.icon}
                  <span className="text-neutral-900 dark:text-neutral-100">{rolBadge.label}</span>
                </div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                  {rolBadge.desc}
                </p>
              </div>

              {/* Botón Principal: Subir Foto de Escritorio / PC */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:border-black dark:hover:border-white shadow-2xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 stroke-[2]" />
                <span>Subir de mi equipo</span>
              </button>

              {/* Selector de avatares predeterminados por rol (4 opciones exactas por rol) */}
              <div className="w-full pt-2.5 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
                    Avatares de mi Rol (4)
                  </span>
                  <div className="flex space-x-1">
                    {['ADMIN', 'CAJERO', 'ALMACEN'].map((rolKey) => (
                      <button
                        key={rolKey}
                        type="button"
                        onClick={() => setTabRolAvatar(rolKey)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-tight transition cursor-pointer ${
                          tabRolAvatar === rolKey
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-2xs'
                            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800'
                        }`}
                      >
                        {rolKey === 'ADMIN' ? 'Admin' : rolKey === 'CAJERO' ? 'Caja' : 'Almacén'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  {(AVATARES_POR_ROL[tabRolAvatar] || AVATARES_POR_ROL.ADMIN).map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => setAvatar(item.url)}
                      title={item.titulo}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition cursor-pointer group/avatar ${
                        avatar === item.url
                          ? 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/30 scale-105 shadow-sm'
                          : 'border-neutral-200 dark:border-neutral-800 opacity-80 hover:opacity-100 hover:border-neutral-400 dark:hover:border-neutral-600'
                      }`}
                    >
                      <img src={item.url} alt={item.titulo} className="w-full h-full object-cover" />
                      {avatar === item.url && (
                        <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input de URL Web Opcional */}
              <div className="w-full">
                <label className="block text-[10px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 flex items-center justify-between">
                  <span>O pega URL de imagen:</span>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="text-[9px] text-neutral-400 hover:text-rose-500 cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </label>
                <div className="relative">
                  <Globe className="w-3 h-3 absolute left-2.5 top-2 text-neutral-400" />
                  <input
                    type="url"
                    value={avatar.startsWith('data:') ? '' : avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder={avatar.startsWith('data:') ? 'Imagen local cargada' : 'https://.../mi-foto.jpg'}
                    className="w-full pl-7 pr-2.5 py-1 text-[10px] rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Columna Derecha: Datos de Acceso y Contraseña */}
            <div className="space-y-4 flex flex-col justify-between">
              {/* Bloque 1: Datos Personales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Teléfono de Contacto
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+51 955 545 561"
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 2: Email y Rol (Lectura Informativa) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="email"
                      disabled
                      value={usuario?.email || ''}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-500 cursor-not-allowed font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Rol Asignado
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-3.5 h-3.5 absolute left-3 top-2.5 text-black dark:text-white" />
                    <input
                      type="text"
                      disabled
                      value={rolBadge.label}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold cursor-not-allowed uppercase text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 3: Cambio de Contraseña Opcional */}
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-900 dark:text-white flex items-center space-x-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-black dark:text-white" />
                    <span>Seguridad / Cambiar Contraseña (Opcional)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="text-[10px] text-neutral-500 hover:text-black dark:hover:text-white font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    {mostrarPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{mostrarPassword ? 'Ocultar' : 'Mostrar'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                      <input
                        type={mostrarPassword ? 'text' : 'password'}
                        value={nuevoPassword}
                        onChange={(e) => setNuevoPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                      <input
                        type={mostrarPassword ? 'text' : 'password'}
                        value={confirmarPassword}
                        onChange={(e) => setConfirmarPassword(e.target.value)}
                        placeholder="Repite la contraseña"
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción (Visibles siempre sin scroll) */}
          <div className="pt-4 mt-5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={alCerrar}
              className="px-4 py-2 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
