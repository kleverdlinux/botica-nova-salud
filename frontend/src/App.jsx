import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { CarritoProvider } from './context/CarritoContext.jsx';
import RutaProtegida from './components/RutaProtegida.jsx';
import LayoutPrivado from './components/LayoutPrivado.jsx';
import Login from './pages/Login.jsx';
import Pos from './pages/Pos.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CarritoProvider>
          {/* Notificaciones Toast elegantes y legibles */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                fontSize: '13px',
                fontWeight: '500',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff'
                }
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff'
                }
              }
            }}
          />

          <Routes>
            {/* Ruta pública de Autenticación */}
            <Route path="/admin/login" element={<Login />} />

            {/* Rutas Privadas del Panel del Sistema */}
            <Route
              path="/admin"
              element={
                <RutaProtegida>
                  <LayoutPrivado />
                </RutaProtegida>
              }
            >
              <Route index element={<Navigate to="/admin/pos" replace />} />
              <Route path="pos" element={<Pos />} />
            </Route>

            {/* Redirección por defecto */}
            <Route path="/" element={<Navigate to="/admin/pos" replace />} />
            <Route path="*" element={<Navigate to="/admin/pos" replace />} />
          </Routes>
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
