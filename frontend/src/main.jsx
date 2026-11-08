import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Autocorrección ante despliegues en producción (Render/Vercel)
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('Nueva versión detectada o error de carga de chunk. Recargando aplicación...');
    window.location.reload();
  });
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, esActualizacion: false };
  }

  static getDerivedStateFromError(error) {
    const msg = String(error?.message || error || '').toLowerCase();
    const esFalloModulo =
      msg.includes('dynamically imported module') ||
      msg.includes('loading chunk') ||
      msg.includes('chunkloaderror') ||
      msg.includes('importing a module script failed') ||
      msg.includes('failed to fetch');

    return { hasError: true, error, esActualizacion: esFalloModulo };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('ErrorBoundary capturó una excepción:', error?.message);

    const msg = String(error?.message || error || '').toLowerCase();
    const esFalloModulo =
      msg.includes('dynamically imported module') ||
      msg.includes('loading chunk') ||
      msg.includes('chunkloaderror') ||
      msg.includes('importing a module script failed') ||
      msg.includes('failed to fetch');

    // Autorecuperación instantánea ante nuevos despliegues en producción
    if (esFalloModulo && typeof window !== 'undefined') {
      const lastReload = sessionStorage.getItem('chunk_reload_time');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('chunk_reload_time', String(now));
        window.location.reload();
      }
    }
  }

  limpiarYRecargar = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/admin/login';
  };

  render() {
    if (this.state.hasError) {
      if (this.state.esActualizacion) {
        return (
          <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
            <div className="max-w-md w-full bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto text-xl font-bold">
                ↻
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                Actualización de Sistema Disponible
              </h1>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Se ha publicado una nueva versión de Botica Nova Salud. Presiona el botón para actualizar y cargar los componentes más recientes.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  Actualizar Ahora
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h1 className="text-lg font-bold text-white">Se produjo un error inesperado</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              El sistema detectó una excepción en la interfaz. Puede reiniciar la sesión o recargar para restaurar la vista normal.
            </p>
            {this.state.error?.message && (
              <pre className="text-[11px] bg-slate-950 p-3 rounded-lg text-rose-300 overflow-x-auto text-left font-mono">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Recargar Página
              </button>
              <button
                type="button"
                onClick={this.limpiarYRecargar}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Restablecer & Ir a Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
