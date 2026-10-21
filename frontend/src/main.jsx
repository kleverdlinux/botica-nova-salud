import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  limpiarYRecargar = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/admin/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠
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
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Recargar Página
              </button>
              <button
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
