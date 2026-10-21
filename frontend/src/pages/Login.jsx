import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Cross, Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error('Por favor complete su correo y contraseña.');
      return;
    }

    setCargando(true);
    try {
      const data = await login({ email: email.trim(), password });
      toast.success(`Bienvenido(a), ${data.usuario.nombre}`);
      const destino = location.state?.from?.pathname || '/admin/pos';
      navigate(destino, { replace: true });
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al iniciar sesión. Intente nuevamente.';
      toast.error(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        {/* Logo y Encabezado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-xl shadow-brand-500/20 mb-4 ring-8 ring-brand-500/10">
            <Cross className="w-9 h-9 rotate-45" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Botica Nova Salud</h1>
          <p className="text-slate-400 text-sm mt-1">Sistema Web de Gestión de Inventario y Ventas</p>
        </div>

        {/* Tarjeta de Login */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Iniciar Sesión</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ingrese sus credenciales autorizadas del sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@novasalud.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  disabled={cargando}
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  disabled={cargando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <span>Ingresar al Sistema</span>
              )}
            </button>
          </form>

          {/* Nota de Demostración para Evaluación SENATI */}
          <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50/80 -mx-8 -mb-8 p-6 rounded-b-3xl">
            <div className="flex items-start space-x-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <p className="font-semibold text-slate-800">Credenciales de Evaluación Académica:</p>
                <p>• Admin: <code className="text-slate-900 font-mono">admin@novasalud.com</code> / <code className="text-slate-900 font-mono">Admin123!</code></p>
                <p>• Cajero: <code className="text-slate-900 font-mono">cajero@novasalud.com</code> / <code className="text-slate-900 font-mono">Cajero123!</code></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
