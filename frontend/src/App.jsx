import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CarritoProvider } from './context/CarritoContext.jsx';
import { ThemeProvider } from './hooks/useTheme.tsx';
import RutaProtegida from './components/RutaProtegida.jsx';
import { TooltipProvider } from './components/ui/tooltip';
import { ScrollToTop } from './components/ScrollToTop';
import { useAuth } from './context/AuthContext.jsx';
import GestorInactividadSeguridad from './components/GestorInactividadSeguridad.jsx';
import Inicio from './pages/Inicio.jsx';

// Carga diferida inteligente con autorecuperación ante nuevos despliegues en producción
const lazyConReintento = (importFn) =>
  React.lazy(async () => {
    try {
      return await importFn();
    } catch (err) {
      const msg = err?.message || '';
      const esFalloModulo =
        msg.includes('dynamically imported module') ||
        msg.includes('Loading chunk') ||
        msg.includes('ChunkLoadError') ||
        msg.includes('Importing a module script failed') ||
        msg.includes('Failed to fetch');

      if (esFalloModulo && typeof window !== 'undefined') {
        const lastReload = window.sessionStorage.getItem('chunk_reload_time');
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          window.sessionStorage.setItem('chunk_reload_time', String(now));
          window.location.reload();
          return new Promise(() => {});
        }
      }
      throw err;
    }
  });

const LayoutPrivado = lazyConReintento(() => import('./components/LayoutPrivado.jsx'));
const Login = lazyConReintento(() => import('./pages/Login.jsx'));
const Pos = lazyConReintento(() => import('./pages/Pos.jsx'));
const Inventario = lazyConReintento(() => import('./pages/Inventario.jsx'));
const Alertas = lazyConReintento(() => import('./pages/Alertas.jsx'));
const Ventas = lazyConReintento(() => import('./pages/Ventas.jsx'));
const Dashboard = lazyConReintento(() => import('./pages/Dashboard.jsx'));
const Usuarios = lazyConReintento(() => import('./pages/Usuarios.jsx'));
const Reportes = lazyConReintento(() => import('./pages/Reportes.jsx'));
const ProjectDetail = lazyConReintento(() => import('./pages/ProjectDetail'));
const Products = lazyConReintento(() => import('./pages/Products'));
const ProductDetail = lazyConReintento(() => import('./pages/ProductDetail'));
const Cart = lazyConReintento(() => import('./pages/Cart'));
const Checkout = lazyConReintento(() => import('./pages/Checkout'));
const About = lazyConReintento(() => import('./pages/About'));
const StoreIndex = lazyConReintento(() => import('./pages/StoreIndex'));
const ClientPortal = lazyConReintento(() => import('./pages/ClientPortal'));
const VisorCliente = lazyConReintento(() => import('./pages/VisorCliente.jsx'));
const PagoMovilQR = lazyConReintento(() => import('./pages/PagoMovilQR.jsx'));
const EscanerMovil = lazyConReintento(() => import('./pages/EscanerMovil.jsx'));
const TerminalMovil = lazyConReintento(() => import('./pages/TerminalMovil.jsx'));
const RibbonFoldLoaderDemo = lazyConReintento(() => import('./components/ui/demo'));

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

