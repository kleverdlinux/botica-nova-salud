import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CarritoProvider } from './context/CarritoContext.jsx';
import { ThemeProvider } from './hooks/useTheme.tsx';
import RutaProtegida from './components/RutaProtegida.jsx';
import LayoutPrivado from './components/LayoutPrivado.jsx';
import Login from './pages/Login.jsx';
import Pos from './pages/Pos.jsx';
import Inventario from './pages/Inventario.jsx';
import Alertas from './pages/Alertas.jsx';
import Ventas from './pages/Ventas.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Usuarios from './pages/Usuarios.jsx';
import Reportes from './pages/Reportes.jsx';
import LandingCatalogo from './pages/LandingCatalogo.jsx';
import Inicio from './pages/Inicio.jsx';
import ProjectDetail from './pages/ProjectDetail';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import StoreIndex from './pages/StoreIndex';
import ClientPortal from './pages/ClientPortal';
import { TooltipProvider } from './components/ui/tooltip';
import { PageLoader } from './components/ui/page-loader';
import RibbonFoldLoaderDemo from './components/ui/demo';
import { ScrollToTop } from './components/ScrollToTop';
import { useAuth } from './context/AuthContext.jsx';
import VisorCliente from './pages/VisorCliente.jsx';
import PagoMovilQR from './pages/PagoMovilQR.jsx';
import EscanerMovil from './pages/EscanerMovil.jsx';
import TerminalMovil from './pages/TerminalMovil.jsx';
import GestorInactividadSeguridad from './components/GestorInactividadSeguridad.jsx';

function GestorModoWeb() {
  const location = useLocation();

  React.useEffect(() => {
    const esPanelPrivado = location.pathname.startsWith('/app');

    if (!esPanelPrivado) {
      document.documentElement.classList.remove('dark');
    }
    // Asegurar que ninguna clase de zoom distorsione los eventos de mouse del canvas
    document.body.classList.remove('app-zoom-compacto');
  }, [location.pathname]);

  return null;
}

function IndexRedirect() {
  const { usuario } = useAuth();
  if (usuario?.rol === 'ADMIN' || usuario?.rol === 'ALMACEN' || usuario?.rol === 'CAJERO') {
    return <Navigate to="/app/dashboard" replace />;
  }
  return <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <GestorModoWeb />
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <GestorInactividadSeguridad />
          <CarritoProvider>
            <TooltipProvider>
              <PageLoader />

                <Routes>
                  {/* Ruta de Demo de Ribbon Fold Loader */}
                  <Route path="/demo/loading" element={<RibbonFoldLoaderDemo />} />

                  {/* Pantalla de Cliente / Visor Externo y Pago Móvil QR */}
                  <Route path="/visor-cliente" element={<VisorCliente />} />
                  <Route path="/pago-movil" element={<PagoMovilQR />} />
                  <Route path="/escanear-movil" element={<EscanerMovil />} />
                  <Route path="/terminal-movil" element={<TerminalMovil />} />

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
                    <Route index element={<IndexRedirect />} />
                    <Route
                      path="dashboard"
                      element={
                        <RutaProtegida rolesPermitidos={['ADMIN', 'ALMACEN', 'CAJERO']}>
                          <Dashboard />
                        </RutaProtegida>
                      }
                    />
                    <Route
                      path="pos"
                      element={
                        <RutaProtegida rolesPermitidos={['ADMIN', 'CAJERO']}>
                          <Pos />
                        </RutaProtegida>
                      }
                    />
                    <Route
                      path="inventario"
                      element={
                        <RutaProtegida rolesPermitidos={['ADMIN', 'ALMACEN', 'CAJERO']}>
                          <Inventario />
                        </RutaProtegida>
                      }
                    />
                    <Route
                      path="alertas"
                      element={
                        <RutaProtegida rolesPermitidos={['ADMIN', 'ALMACEN']}>
                          <Alertas />
                        </RutaProtegida>
                      }
                    />
                    <Route
                      path="ventas"
                      element={
                        <RutaProtegida rolesPermitidos={['ADMIN', 'CAJERO']}>
                          <Ventas />
                        </RutaProtegida>
                      }
                    />
                    <Route
                      path="reportes"
                      element={
                        <RutaProtegida rolesPermitidos={['ADMIN', 'ALMACEN', 'CAJERO']}>
                          <Reportes />
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

                  {/* Ruta pública principal para clientes: Inicio (RAUM Style) y Catálogo */}
                  <Route path="/" element={<Inicio />} />
                  <Route path="/project/:slug" element={<ProjectDetail />} />
                  {/* Rutas del E-commerce de Productos (Maison / Homeware Template) */}
                  <Route path="/tienda" element={<StoreIndex />} />
                  <Route path="/productos" element={<StoreIndex />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/carrito" element={<Cart />} />
                  <Route path="/cliente" element={<ClientPortal />} />
                  <Route path="/cliente/login" element={<ClientPortal />} />
                  <Route path="/login-cliente" element={<ClientPortal />} />
                  <Route path="/mi-cuenta" element={<ClientPortal />} />
                  <Route path="/pedidos" element={<ClientPortal />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/nosotros" element={<About />} />
                  <Route path="/servicios" element={<Navigate to="/#servicios" replace state={{ openServices: true }} />} />
                  <Route path="/reclamaciones" element={<Navigate to="/#reclamaciones" replace state={{ openReclamaciones: true }} />} />
                  <Route path="/libro-de-reclamaciones" element={<Navigate to="/#reclamaciones" replace state={{ openReclamaciones: true }} />} />
                  <Route path="/catalogo" element={<Products />} />

                  {/* Redirecciones de compatibilidad administrativa */}
                  <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                  <Route path="/admin/pos" element={<Navigate to="/app/pos" replace />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </TooltipProvider>
          </CarritoProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
  );
}

