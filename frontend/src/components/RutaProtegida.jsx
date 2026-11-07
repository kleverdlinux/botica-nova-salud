import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader2, ShieldAlert, ArrowRight } from 'lucide-react';

export default function RutaProtegida({ children, rolesPermitidos }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="w-8 h-8 text-[#0d9488] animate-spin" />
        </div>
        <p className="text-slate-600 font-medium text-sm">Verificando sesión en Nova Salud...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    const defaultHome =
      usuario.rol === 'CAJERO'
        ? '/app/pos'
        : usuario.rol === 'ALMACEN'
        ? '/app/inventario'
        : '/app/dashboard';

    const homeLabel =
      usuario.rol === 'CAJERO'
        ? 'Ir al Punto de Venta (POS)'
        : usuario.rol === 'ALMACEN'
        ? 'Ir a Inventario & Kardex'
        : 'Ir al Panel Principal';

    return (
      <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 mb-2">
          Código 403 • Restricción de Seguridad
        </span>
        <h2 className="text-xl font-black text-slate-900 mb-1.5">Módulo No Autorizado para este Rol</h2>
        <p className="text-slate-600 text-xs max-w-md mb-6 leading-relaxed">
          Tu rol activo es <strong className="text-slate-900">[{usuario.rol}]</strong>. Este módulo está reservado para personal autorizado ({rolesPermitidos.join(', ')}).
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to={defaultHome}
            replace
            className="px-5 py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-2 transition cursor-pointer"
          >
            <span>{homeLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Regresar
          </button>
        </div>
      </div>
    );
  }

  return children;
}
