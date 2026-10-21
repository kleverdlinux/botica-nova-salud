import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

export default function RutaProtegida({ children, rolesPermitidos }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
        <p className="text-slate-600 font-medium text-sm">Verificando sesión en Nova Salud...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <span className="text-2xl font-bold">403</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso No Autorizado</h2>
        <p className="text-slate-600 text-sm max-w-md mb-6">
          Tu rol actual ({usuario.rol}) no tiene los permisos suficientes para ingresar a este módulo.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition"
        >
          Regresar
        </button>
      </div>
    );
  }

  return children;
}
