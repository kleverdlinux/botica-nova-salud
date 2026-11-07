import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CarritoProvider } from './context/CarritoContext.jsx';
import { ThemeProvider } from './hooks/useTheme.tsx';
import RutaProtegida from './components/RutaProtegida.jsx';
import LayoutPrivado from './components/LayoutPrivado.jsx';
import { TooltipProvider } from './components/ui/tooltip';
import { PageLoader } from './components/ui/page-loader';
import { ScrollToTop } from './components/ScrollToTop';
import { useAuth } from './context/AuthContext.jsx';
import GestorInactividadSeguridad from './components/GestorInactividadSeguridad.jsx';

// Carga diferida inteligente (Code Splitting con React.lazy)
const Login = React.lazy(() => import('./pages/Login.jsx'));
const Pos = React.lazy(() => import('./pages/Pos.jsx'));
const Inventario = React.lazy(() => import('./pages/Inventario.jsx'));
const Alertas = React.lazy(() => import('./pages/Alertas.jsx'));
const Ventas = React.lazy(() => import('./pages/Ventas.jsx'));
const Dashboard = React.lazy(() => import('./pages/Dashboard.jsx'));
const Usuarios = React.lazy(() => import('./pages/Usuarios.jsx'));
const Reportes = React.lazy(() => import('./pages/Reportes.jsx'));
const Inicio = React.lazy(() => import('./pages/Inicio.jsx'));
const ProjectDetail = React.lazy(() => import('./pages/ProjectDetail'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const About = React.lazy(() => import('./pages/About'));
const StoreIndex = React.lazy(() => import('./pages/StoreIndex'));
const ClientPortal = React.lazy(() => import('./pages/ClientPortal'));
const VisorCliente = React.lazy(() => import('./pages/VisorCliente.jsx'));
const PagoMovilQR = React.lazy(() => import('./pages/PagoMovilQR.jsx'));
const EscanerMovil = React.lazy(() => import('./pages/EscanerMovil.jsx'));
const TerminalMovil = React.lazy(() => import('./pages/TerminalMovil.jsx'));
const RibbonFoldLoaderDemo = React.lazy(() => import('./components/ui/demo'));

function LazyFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

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

              <Suspense fallback={<LazyFallback />}>
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
              </Suspense>
            </TooltipProvider>
          </CarritoProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
  );
}

