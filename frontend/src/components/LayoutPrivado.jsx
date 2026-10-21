import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ShoppingCart,
  Package,
  Bell,
  LayoutDashboard,
  Users,
  LogOut,
  Cross,
  Menu,
  X,
  Clock,
  ShieldCheck,
  UserCheck,
  ReceiptText
} from 'lucide-react';
import { formatearFechaLima } from '../utils/formateadores.js';

export default function LayoutPrivado() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const handleCerrarSesion = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    {
      to: '/app/pos',
      label: 'Punto de Venta (POS)',
      icon: ShoppingCart,
      disponible: true
    },
    {
      to: '/app/inventario',
      label: 'Inventario de Productos',
      icon: Package,
      disponible: true
    },
    {
      to: '/app/alertas',
      label: 'Alertas de Stock y Vencimiento',
      icon: Bell,
      disponible: true
    },
    {
      to: '/app/ventas',
      label: 'Historial de Ventas',
      icon: ReceiptText,
      disponible: true
    },
    {
      to: '/app/dashboard',
      label: 'Panel & Métricas (Admin)',
      icon: LayoutDashboard,
      disponible: false,
      fase: 'Fase 5c',
      soloAdmin: true
    },
    {
      to: '/app/usuarios',
      label: 'Gestión de Usuarios',
      icon: Users,
      disponible: false,
      fase: 'Fase 5c',
      soloAdmin: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar para Escritorio y Móvil */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Cabecera Sidebar con Branding Farmacéutico */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Cross className="w-6 h-6 rotate-45" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight leading-none">NOVA SALUD</h1>
              <p className="text-[10px] text-brand-400 font-semibold tracking-wider uppercase mt-0.5">Botica & Salud</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarAbierto(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info del Usuario Logueado */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold text-sm">
            {usuario?.rol === 'ADMIN' ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate">{usuario?.nombre}</p>
            <span
              className={`inline-block px-1.5 py-0.2 text-[10px] font-bold rounded mt-0.5 ${
                usuario?.rol === 'ADMIN'
                  ? 'bg-purple-900/60 text-purple-200 border border-purple-700/50'
                  : 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/50'
              }`}
            >
              ROL: {usuario?.rol}
            </span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (item.soloAdmin && usuario?.rol !== 'ADMIN') return null;

            if (!item.disponible) {
              return (
                <div
                  key={item.label}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-500 cursor-not-allowed select-none text-xs font-medium"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-4 h-4 text-slate-600" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                    {item.fase}
                  </span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarAbierto(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer del Sidebar: Botón de Cerrar Sesión */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={handleCerrarSesion}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 border border-rose-900/40 text-xs font-bold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Topbar Superior */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarAbierto(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Hora oficial Lima: <strong className="text-slate-800">{formatearFechaLima(new Date())}</strong></span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-block text-xs text-slate-500">
              Sesión activa: <strong className="text-slate-700 font-semibold">{usuario?.email}</strong>
            </span>
          </div>
        </header>

        {/* Área de Trabajo */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Overlay para móvil */}
      {sidebarAbierto && (
        <div
          onClick={() => setSidebarAbierto(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden"
        />
      )}
    </div>
  );
}
