import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { CarritoProvider } from './context/CarritoContext.jsx';
import RutaProtegida from './components/RutaProtegida.jsx';
import LayoutPrivado from './components/LayoutPrivado.jsx';
import Login from './pages/Login.jsx';
import Pos from './pages/Pos.jsx';
import Inventario from './pages/Inventario.jsx';
import Alertas from './pages/Alertas.jsx';
import Ventas from './pages/Ventas.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Usuarios from './pages/Usuarios.jsx';
import LandingCatalogo from './pages/LandingCatalogo.jsx';

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

            {/* Rutas Privadas del Panel del Sistema bajo /app/* */}
            <Route
              path="/app"
              element={
                <RutaProtegida>
                  <LayoutPrivado />
                </RutaProtegida>
              }
            >
              <Route index element={<Navigate to="/app/pos" replace />} />
              <Route path="pos" element={<Pos />} />
              <Route path="inventario" element={<Inventario />} />
              <Route path="alertas" element={<Alertas />} />
              <Route path="ventas" element={<Ventas />} />
              <Route
                path="dashboard"
                element={
                  <RutaProtegida rolesPermitidos={['ADMIN']}>
                    <Dashboard />
                  </RutaProtegida>
                }
              />
              <Route
                path="usuarios"
                element={
                  <RutaProtegida rolesPermitidos={['ADMIN']}>
                    <Usuarios />
                  </RutaProtegida>
                }
              />
            </Route>

            {/* Ruta pública principal para clientes: Landing Page y Catálogo */}
            <Route path="/" element={<LandingCatalogo />} />
            <Route path="/catalogo" element={<LandingCatalogo />} />

            {/* Redirecciones de compatibilidad administrativa */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/pos" element={<Navigate to="/app/pos" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
