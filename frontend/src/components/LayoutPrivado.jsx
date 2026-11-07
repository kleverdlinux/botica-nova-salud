import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ShoppingCart,
  Package,
  Bell,
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  Clock,
  ShieldCheck,
  UserCheck,
  ReceiptText,
  Boxes,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  History,
  Calendar,
  Layers,
  ExternalLink,
  Sun,
  Moon,
  User,
  AlertTriangle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { formatearFechaLima } from '../utils/formateadores.js';
import { obtenerAlertasApi } from '../api/alertasApi.js';
import ModalPerfil from './ModalPerfil.jsx';
import { confirmarAccion, notificarExito } from '../utils/alertaSweet.js';

export default function LayoutPrivado() {
  const { usuario, logout, actualizarUsuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarAbierto, setSidebarAbierto] = useState(() => {
    if (typeof window !== 'undefined') {
      const guardado = localStorage.getItem('novasalud_sidebar_abierto');
      if (guardado !== null) {
        return guardado === 'true';
      }
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const toggleSidebar = () => {
    setSidebarAbierto((prev) => {
      const nuevo = !prev;
      localStorage.setItem('novasalud_sidebar_abierto', String(nuevo));
      return nuevo;
    });
  };
  const [inventarioSubmenuAbierto, setInventarioSubmenuAbierto] = useState(true);
  const [modalPerfilAbierto, setModalPerfilAbierto] = useState(false);

  // Alertas Sanitarias & Notificaciones en Tiempo Real
  const [datosAlertas, setDatosAlertas] = useState(null);
  const [dropdownNotificaciones, setDropdownNotificaciones] = useState(false);
  const dropdownRef = useRef(null);

  const consultarAlertas = useCallback(async () => {
    try {
      const data = await obtenerAlertasApi();
      setDatosAlertas(data);
    } catch (e) {
      // Silencioso
    }
  }, []);

  useEffect(() => {
    consultarAlertas();
    const interval = setInterval(consultarAlertas, 20000);
    return () => clearInterval(interval);
  }, [consultarAlertas]);

  // Recargar alertas al navegar entre páginas para reflejar cambios inmediatos
  useEffect(() => {
    consultarAlertas();
  }, [location.pathname, location.search, consultarAlertas]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownNotificaciones(false);
      }
    }
    if (dropdownNotificaciones) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownNotificaciones]);

  const conteosAlertas = datosAlertas?.conteos || { bajoStock: 0, porVencer: 0, vencidos: 0 };
  const totalAlertas = (conteosAlertas.vencidos || 0) + (conteosAlertas.porVencer || 0) + (conteosAlertas.bajoStock || 0);
  const itemsNotificacion = [
    ...(datosAlertas?.vencidos || []).map((p) => ({ ...p, tipoAlerta: 'VENCIDO' })),
    ...(datosAlertas?.porVencer || []).map((p) => ({ ...p, tipoAlerta: 'POR_VENCER' })),
    ...(datosAlertas?.bajoStock || []).map((p) => ({ ...p, tipoAlerta: 'BAJO_STOCK' }))
  ].slice(0, 6);

  // Reloj digital en vivo estilo pantalla de celular (actualización cada 1s)
  const [horaActual, setHoraActual] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const horaFormateada = horaActual.toLocaleTimeString('es-PE', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  const [horaPrincipal, ampm = ''] = horaFormateada.split(' ');

  const diaSemana = horaActual.toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    weekday: 'long'
  });
  const fechaCompleta = horaActual.toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Modo Oscuro / Claro persistente exclusivo del panel administrativo
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('novasalud_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('novasalud_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('novasalud_theme', 'light');
    }
    window.dispatchEvent(new CustomEvent('novasalud-theme-change', { detail: { isDark } }));

    return () => {
      // Al desmontar LayoutPrivado (ej: navegar a la tienda web o portal público),
      // remover siempre la clase 'dark' para que la web pública sea 100% en modo claro
      document.documentElement.classList.remove('dark');
      window.dispatchEvent(new CustomEvent('novasalud-theme-change', { detail: { isDark: false } }));
    };
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleCerrarSesion = async () => {
    const confirmado = await confirmarAccion({
      titulo: '¿Cerrar Sesión?',
      texto: 'Se finalizará el turno actual en este dispositivo.',
      confirmText: 'Sí, cerrar sesión',
      cancelText: 'Permanecer'
    });
    if (confirmado) {
      logout();
      navigate('/admin/login');
      notificarExito('Sesión Finalizada', 'Hasta pronto');
    }
  };

  // Helper de badge y estilo por rol (Monocromático Blanco & Negro)
  const getRolInfo = () => {
    if (usuario?.rol === 'ADMIN') {
      return {
        label: 'ADMINISTRADOR GENERAL',
        badgeClass: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700',
        icon: <ShieldCheck className="w-4 h-4 text-black dark:text-white" />
      };
    }
    if (usuario?.rol === 'ALMACEN') {
      return {
        label: 'GESTOR DE ALMACÉN',
        badgeClass: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700',
        icon: <Boxes className="w-4 h-4 text-black dark:text-white" />
      };
    }
    return {
      label: 'CAJERO DE MOSTRADOR',
      badgeClass: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700',
      icon: <UserCheck className="w-4 h-4 text-black dark:text-white" />
    };
  };

  const rolInfo = getRolInfo();
  const esAdmin = usuario?.rol === 'ADMIN';
  const esAlmacen = usuario?.rol === 'ALMACEN';
  const esCajero = usuario?.rol === 'CAJERO';

  const enInventario = location.pathname.startsWith('/app/inventario');

  return (
    <div className="fixed inset-0 h-full w-full overflow-hidden overscroll-none bg-[#fcfcfc] dark:bg-black text-neutral-900 dark:text-neutral-100 font-sans antialiased flex transition-colors duration-200">
      {/* Sidebar para Escritorio y Móvil (100% Estático y Anclado) */}
      <aside
        className={`fixed md:relative top-0 left-0 z-40 h-full bg-white dark:bg-black text-neutral-700 dark:text-neutral-300 border-r border-neutral-200 dark:border-neutral-800 flex flex-col shadow-xs transition-all duration-300 ease-in-out shrink-0 ${
          sidebarAbierto
            ? 'translate-x-0 w-64'
            : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-r-0'
        }`}
      >
        {/* Cabecera del Sidebar con Logotipo Geométrico NS Oficial */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0 shadow-2xs">
              <img
                src="/logo-ns.png"
                alt="Nova Salud"
                className="w-full h-full object-contain p-1 dark:invert"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo-ns-white.png';
                }}
              />
            </div>
            <div>
              <h1 className="font-black text-neutral-900 dark:text-white text-base tracking-tight leading-none">
                NOVA SALUD
              </h1>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold tracking-wider uppercase mt-1">
                Sistema Operativo
              </p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación (Sin perfil duplicado en el sidebar) */}
        <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
          {/* MÓDULO 1: Dashboard Adaptativo por Rol (ADMIN, ALMACEN, CAJERO) */}
          <NavLink
            to="/app/dashboard"
            className={({ isActive }) =>
              `relative flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-teal-50/90 dark:bg-teal-950/40 text-[#0d9488] dark:text-teal-300 shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#0d9488] dark:bg-teal-400 rounded-r-full" />
                )}
                <LayoutDashboard className={`w-4 h-4 stroke-[2.2] shrink-0 ${isActive ? 'text-[#0d9488] dark:text-teal-400' : ''}`} />
                <span>
                  {esAdmin && 'Panel & Métricas'}
                  {esAlmacen && 'Panel de Almacén'}
                  {esCajero && 'Mi Turno de Caja'}
                </span>
              </>
            )}
          </NavLink>

          {/* MÓDULO 2: POS Terminal (ADMIN y CAJERO) */}
          {(esAdmin || esCajero) && (
            <NavLink
              to="/app/pos"
              className={({ isActive }) =>
                `relative flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-50/90 dark:bg-teal-950/40 text-[#0d9488] dark:text-teal-300 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#0d9488] dark:bg-teal-400 rounded-r-full" />
                  )}
                  <ShoppingCart className={`w-4 h-4 stroke-[2.2] shrink-0 ${isActive ? 'text-[#0d9488] dark:text-teal-400' : ''}`} />
                  <span>Punto de Venta (POS)</span>
                </>
              )}
            </NavLink>
          )}

          {/* MÓDULO 3: Inventario & Kardex con Submenús Desplegables */}
          <div className="space-y-1 pt-1">
            <div
              onClick={() => setInventarioSubmenuAbierto(!inventarioSubmenuAbierto)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer select-none transition ${
                enInventario
                  ? 'bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border border-neutral-300 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Package className="w-4 h-4 stroke-[2] text-black dark:text-white" />
                <span>Inventario & Fármacos</span>
              </div>
              {inventarioSubmenuAbierto ? (
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              )}
            </div>

            {/* Submenús de Inventario */}
            {inventarioSubmenuAbierto && (
              <div className="pl-6 pr-1 space-y-1 py-1 border-l-2 border-neutral-300 dark:border-neutral-700 ml-5">
                <NavLink
                  to="/app/inventario?tab=catalogo"
                  className={`relative flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    enInventario && (!location.search || location.search.includes('tab=catalogo'))
                      ? 'bg-teal-50/90 dark:bg-teal-950/40 text-[#0d9488] dark:text-teal-300 font-bold'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-neutral-900/60'
                  }`}
                >
                  {enInventario && (!location.search || location.search.includes('tab=catalogo')) && (
                    <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#0d9488] dark:bg-teal-400 rounded-r-full" />
                  )}
                  <Package className="w-3.5 h-3.5 shrink-0" />
                  <span>Catálogo con Fotos</span>
                </NavLink>

                {(esAdmin || esAlmacen) && (
                  <NavLink
                    to="/app/inventario?tab=kardex"
                    className={`relative flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                      enInventario && location.search.includes('tab=kardex')
                        ? 'bg-teal-50/90 dark:bg-teal-950/40 text-[#0d9488] dark:text-teal-300 font-bold'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-neutral-900/60'
                    }`}
                  >
                    {enInventario && location.search.includes('tab=kardex') && (
                      <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#0d9488] dark:bg-teal-400 rounded-r-full" />
                    )}
                    <History className="w-3.5 h-3.5 shrink-0" />
                    <span>Kardex Multiproducto</span>
                  </NavLink>
                )}

                <NavLink
                  to="/app/inventario?tab=lotes"
                  className={`relative flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    enInventario && location.search.includes('tab=lotes')
                      ? 'bg-teal-50/90 dark:bg-teal-950/40 text-[#0d9488] dark:text-teal-300 font-bold'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-neutral-900/60'
                  }`}
                >
                  {enInventario && location.search.includes('tab=lotes') && (
                    <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#0d9488] dark:bg-teal-400 rounded-r-full" />
                  )}
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Lotes & Vencimientos</span>
                </NavLink>

                <NavLink
                  to="/app/inventario?tab=categorias"
                  className={`relative flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    enInventario && location.search.includes('tab=categorias')
                      ? 'bg-teal-50/90 dark:bg-teal-950/40 text-[#0d9488] dark:text-teal-300 font-bold'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-neutral-900/60'
                  }`}
                >
                  {enInventario && location.search.includes('tab=categorias') && (
                    <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#0d9488] dark:bg-teal-400 rounded-r-full" />
                  )}
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span>Familias & Categorías</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* MÓDULO 4: Alertas de Stock & Vencimiento (ADMIN y ALMACEN) */}
          {(esAdmin || esAlmacen) && (
            <NavLink
              to="/app/alertas"
              className={({ isActive }) =>
                `relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-50/90 dark:bg-teal-950/40 text-[#0d9488] dark:text-teal-300 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-3">
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#0d9488] dark:bg-teal-400 rounded-r-full" />
                    )}
                    <Bell className={`w-4 h-4 stroke-[2.2] shrink-0 ${isActive ? 'text-[#0d9488] dark:text-teal-400' : ''}`} />
                    <span>Alertas Sanitarias</span>
                  </div>

                  {totalAlertas > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-black font-mono shadow-2xs ${
                        conteosAlertas.vencidos > 0
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}
                    >
                      {totalAlertas}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )}

          {/* MÓDULO 5: Historial de Ventas (ADMIN y CAJERO) */}
          {(esAdmin || esCajero) && (
            <NavLink
              to="/app/ventas"
              className={({ isActive }) =>
                `relative flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-50/90 dark:bg-teal-950/40 text-[#0d9488] dark:text-teal-300 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#0d9488] dark:bg-teal-400 rounded-r-full" />
                  )}
                  <ReceiptText className={`w-4 h-4 stroke-[2.2] shrink-0 ${isActive ? 'text-[#0d9488] dark:text-teal-400' : ''}`} />
                  <span>{esCajero ? 'Mis Ventas del Turno' : 'Historial de Comprobantes'}</span>
                </>
              )}
            </NavLink>
          )}

          {/* MÓDULO 6: Centro de Reportes & Trazabilidad Oficial */}
          <NavLink
            to="/app/reportes"
            className={({ isActive }) =>
              `relative flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-teal-50/90 dark:bg-teal-950/40 text-[#0d9488] dark:text-teal-300 shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#0d9488] dark:bg-teal-400 rounded-r-full" />
                )}
                <FileSpreadsheet className={`w-4 h-4 stroke-[2.2] shrink-0 ${isActive ? 'text-[#0d9488] dark:text-teal-400' : ''}`} />
                <span>Reportes & Descargas</span>
              </>
            )}
          </NavLink>

          {/* MÓDULO 7: Gestión de Personal (Solo ADMIN) */}
          {esAdmin && (
            <NavLink
              to="/app/usuarios"
              className={({ isActive }) =>
                `relative flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-50/90 dark:bg-teal-950/40 text-[#0d9488] dark:text-teal-300 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#0d9488] dark:bg-teal-400 rounded-r-full" />
                  )}
                  <Users className={`w-4 h-4 stroke-[2.2] shrink-0 ${isActive ? 'text-[#0d9488] dark:text-teal-400' : ''}`} />
                  <span>Gestión de Personal</span>
                </>
              )}
            </NavLink>
          )}
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
          <NavLink
            to="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-bold transition shadow-2xs"
          >
            <span>Ver Tienda Pública</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
          </NavLink>
          <button
            onClick={handleCerrarSesion}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-rose-300 text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal con Scroll Independiente */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Topbar Superior */}
        <header className="h-16 shrink-0 bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between z-30 shadow-xs transition-colors">
          <div className="flex items-center space-x-3">
            {/* Botón Menú Hamburguesa (visible tanto en Desktop como Móvil) */}
            <button
              onClick={toggleSidebar}
              className="p-2 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-800 transition cursor-pointer shadow-2xs flex items-center justify-center"
              title={sidebarAbierto ? 'Colapsar menú lateral' : 'Expandir menú lateral'}
              aria-label="Alternar menú lateral"
            >
              <Menu className="w-4 h-4 stroke-[2]" />
            </button>

            {/* Reloj Digital en Vivo Estilo Pantalla de Celular */}
            <div className="flex items-center space-x-3 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
              <div className="font-mono text-xs sm:text-sm font-black tracking-tight text-neutral-900 dark:text-white tabular-nums flex items-baseline space-x-1">
                <span>{horaPrincipal}</span>
                <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase">{ampm}</span>
              </div>
              <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                  {diaSemana}
                </span>
                <span className="text-[9px] font-medium text-neutral-500 dark:text-neutral-400 capitalize">
                  {fechaCompleta}
                </span>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Campana Alertas + Toggle Dark/Light + Pastilla Única de Perfil */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Campana de Notificaciones Sanitarias & Stock */}
            {(esAdmin || esAlmacen) && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownNotificaciones((prev) => !prev)}
                  title="Centro de Alertas Sanitarias y Notificaciones"
                  className={`relative w-9 h-9 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                    dropdownNotificaciones
                      ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-400 dark:border-neutral-600'
                      : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Bell
                    className={`w-4 h-4 transition ${
                      totalAlertas > 0
                        ? conteosAlertas.vencidos > 0
                          ? 'text-rose-600 animate-pulse'
                          : 'text-amber-500'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  />
                  {totalAlertas > 0 && (
                    <span
                      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-black rounded-full flex items-center justify-center text-white shadow-2xs font-mono ${
                        conteosAlertas.vencidos > 0 ? 'bg-rose-600 animate-pulse' : 'bg-amber-500'
                      }`}
                    >
                      {totalAlertas}
                    </span>
                  )}
                </button>

                {/* Dropdown Flotante Anti-Slop de Notificaciones */}
                {dropdownNotificaciones && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-950/60 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-teal-600" />
                        <h4 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-wider">
                          Alertas Sanitarias ({totalAlertas})
                        </h4>
                      </div>
                      <button
                        onClick={consultarAlertas}
                        className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg transition cursor-pointer"
                        title="Actualizar notificaciones"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
                      {itemsNotificacion.length === 0 ? (
                        <div className="p-6 text-center text-neutral-400 space-y-1">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto stroke-1 mb-1" />
                          <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Todo en orden</p>
                          <p className="text-[11px]">No hay alertas sanitarias ni quiebres de existencias pendientes.</p>
                        </div>
                      ) : (
                        itemsNotificacion.map((item, idx) => (
                          <div
                            key={`${item.id}-${idx}`}
                            onClick={() => {
                              setDropdownNotificaciones(false);
                              navigate('/app/alertas');
                            }}
                            className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition cursor-pointer flex items-start space-x-3 text-left"
                          >
                            <div className="mt-0.5 shrink-0">
                              {item.tipoAlerta === 'VENCIDO' ? (
                                <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200/80 flex items-center justify-center">
                                  <XCircle className="w-4 h-4" />
                                </div>
                              ) : item.tipoAlerta === 'POR_VENCER' ? (
                                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200/80 flex items-center justify-center">
                                  <Clock className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 border border-orange-200/80 flex items-center justify-center">
                                  <AlertTriangle className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                    item.tipoAlerta === 'VENCIDO'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      : item.tipoAlerta === 'POR_VENCER'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      : 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                                  }`}
                                >
                                  {item.tipoAlerta === 'VENCIDO'
                                    ? 'CADUCADO'
                                    : item.tipoAlerta === 'POR_VENCER'
                                    ? 'POR VENCER'
                                    : 'BAJO STOCK'}
                                </span>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  {item.stock} u.
                                </span>
                              </div>

                              <p className="text-xs font-bold text-neutral-900 dark:text-white truncate mt-0.5">
                                {item.nombre}
                              </p>

                              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                                {item.tipoAlerta === 'VENCIDO'
                                  ? `Lote: ${item.lote || 'S/L'} expiró (${formatearFechaLima(item.fechaVencimiento)})`
                                  : item.tipoAlerta === 'POR_VENCER'
                                  ? `Lote: ${item.lote || 'S/L'} vence ${formatearFechaLima(item.fechaVencimiento)}`
                                  : `Quedan ${item.stock} u. (Mínimo: ${item.stockMinimo || 5})`}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2.5 bg-neutral-50 dark:bg-neutral-950/60 border-t border-neutral-200 dark:border-neutral-800 text-center">
                      <button
                        onClick={() => {
                          setDropdownNotificaciones(false);
                          navigate('/app/alertas');
                        }}
                        className="w-full py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <span>Abrir Centro de Alertas Sanitarias</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botón Switch Modo Claro / Oscuro */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              className="w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
            </button>

            {/* Pastilla de Perfil Oficial (ÚNICA en toda la web) */}
            <div
              onClick={() => setModalPerfilAbierto(true)}
              className="flex items-center space-x-3 p-1.5 pl-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-black dark:hover:border-white transition cursor-pointer group shadow-2xs"
              title="Haz clic para ver y editar tu perfil (foto, nombre, teléfono, contraseña)"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-neutral-900 dark:text-white leading-tight group-hover:text-black dark:group-hover:text-neutral-200 transition">
                  {usuario?.nombre || 'Administrador Nova Salud'}
                </p>
                <span className={`inline-block px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border mt-0.5 ${rolInfo.badgeClass}`}>
                  {rolInfo.label}
                </span>
              </div>

              {/* Foto de Perfil / Avatar */}
              <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition">
                {usuario?.avatar ? (
                  <img
                    src={usuario.avatar}
                    alt={usuario?.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = esAdmin
                        ? '/avatars/admin/admin-1.svg'
                        : esCajero
                        ? '/avatars/cajero/cajero-1.svg'
                        : '/avatars/almacen/almacen-1.svg';
                    }}
                  />
                ) : (
                  <img
                    src={
                      esAdmin
                        ? '/avatars/admin/admin-1.svg'
                        : esCajero
                        ? '/avatars/cajero/cajero-1.svg'
                        : '/avatars/almacen/almacen-1.svg'
                    }
                    alt={usuario?.nombre}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Área de Trabajo con Scroll Independiente y Ancho Flexible */}
        <main className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 lg:px-6 lg:py-5 scroll-smooth">
          <Outlet />
        </main>
      </div>

      {/* Overlay para móvil */}
      {sidebarAbierto && (
        <div
          onClick={() => setSidebarAbierto(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-30 md:hidden"
        />
      )}

      {/* Modal de Edición de Perfil */}
      <ModalPerfil
        abierto={modalPerfilAbierto}
        alCerrar={() => setModalPerfilAbierto(false)}
        usuario={usuario}
        alActualizar={(datosActualizados) => {
          actualizarUsuario(datosActualizados);
        }}
      />

    </div>
  );
}
