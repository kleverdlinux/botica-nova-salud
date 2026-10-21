import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Cross,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MapPin,
  ShieldCheck,
  CreditCard,
  HeartHandshake,
  Pill,
  MessageCircle,
  LogIn,
  LayoutDashboard,
  Sparkles,
  ChevronRight,
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { obtenerCatalogoPublicoApi } from '../api/catalogoApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatearMoneda } from '../utils/formateadores.js';
import toast from 'react-hot-toast';

export default function LandingCatalogo() {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('TODAS');

  const cargarCatalogo = async () => {
    setCargando(true);
    try {
      const data = await obtenerCatalogoPublicoApi();
      setProductos(data);
    } catch (err) {
      console.error('Error al cargar catálogo público:', err);
      toast.error('No se pudo cargar el catálogo de productos en este momento.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCatalogo();
  }, []);

  // Extraer lista única de categorías disponibles
  const categorias = useMemo(() => {
    const mapa = new Map();
    productos.forEach((p) => {
      if (p.categoria?.nombre) {
        mapa.set(p.categoria.nombre, p.categoria.id);
      }
    });
    return Array.from(mapa.keys());
  }, [productos]);

  // Filtrado reactivo en cliente (búsqueda y categoría)
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideCat =
        categoriaSeleccionada === 'TODAS' || p.categoria?.nombre === categoriaSeleccionada;

      const q = busqueda.toLowerCase().trim();
      const coincideTexto =
        !q ||
        p.nombre?.toLowerCase().includes(q) ||
        p.principioActivo?.toLowerCase().includes(q) ||
        p.presentacion?.toLowerCase().includes(q);

      return coincideCat && coincideTexto;
    });
  }, [productos, busqueda, categoriaSeleccionada]);

  // Determinar si la botica está abierta según la hora oficial de Lima (07:00 a 23:00)
  const estaAbiertoAhora = useMemo(() => {
    try {
      const horaLimaStr = new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/Lima',
        hour12: false,
        hour: 'numeric'
      });
      const horaActual = parseInt(horaLimaStr, 10);
      return horaActual >= 7 && horaActual < 23;
    } catch {
      return true;
    }
  }, []);

  // Generador de enlace oficial de WhatsApp para consultas de clientes
  const generarLinkWhatsApp = (producto) => {
    const telefono = '51999888777'; // Teléfono oficial de atención de Botica Nova Salud
    const mensaje = encodeURIComponent(
      `¡Hola Botica Nova Salud! Deseo consultar por la disponibilidad del producto: "${producto.nombre} (${producto.presentacion})", precio ref: ${formatearMoneda(
        producto.precio
      )}.`
    );
    return `https://wa.me/${telefono}?text=${mensaje}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* 1. NAVBAR SUPERIOR FIJO */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Corporativo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
              <Cross className="w-6 h-6 rotate-45" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight block leading-none">
                NOVA SALUD
              </span>
              <span className="text-[11px] text-brand-600 font-bold tracking-wider uppercase">
                Botica & Farmacia
              </span>
            </div>
          </Link>

          {/* Enlaces de Navegación */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold text-slate-600">
            <a href="#inicio" className="hover:text-brand-600 transition">
              Inicio
            </a>
            <a href="#catalogo" className="hover:text-brand-600 transition">
              Catálogo de Medicamentos
            </a>
            <a href="#servicios" className="hover:text-brand-600 transition">
              Servicios & Beneficios
            </a>
            <a href="#contacto" className="hover:text-brand-600 transition">
              Horarios & Ubicación
            </a>
          </nav>

          {/* Acceso Personal / Panel */}
          <div className="flex items-center space-x-3">
            {usuario ? (
              <Link
                to="/app/pos"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 transition"
              >
                <LayoutDashboard className="w-4 h-4 text-brand-400" />
                <span>Panel ({usuario.rol})</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center space-x-2 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Acceso Personal</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section id="inicio" className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 text-white py-20 lg:py-28 overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Texto del Hero */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>Atención farmacéutica profesional para tu bienestar</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Tu salud en las <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">mejores manos</span>, siempre cerca de ti.
              </h1>

              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Medicamentos garantizados por DIGEMID, asesoría por químicos farmacéuticos certificados y los precios más justos en Soles. Consulta nuestro catálogo público en vivo y visítanos hoy mismo.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#catalogo"
                  className="w-full sm:w-auto px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/30 flex items-center justify-center space-x-2 transition"
                >
                  <Search className="w-4 h-4" />
                  <span>Explorar Catálogo en Línea</span>
                </a>

                <a
                  href="https://wa.me/51999888777?text=Hola%20Botica%20Nova%20Salud,%20deseo%20hacer%20una%20consulta."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Consultas por WhatsApp</span>
                </a>
              </div>

              {/* Indicador de Estado en Vivo */}
              <div className="pt-4 flex items-center justify-center lg:justify-start space-x-3 text-xs text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full animate-ping inline-block ${
                      estaAbiertoAhora ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />
                  <span className="font-semibold text-slate-200">
                    {estaAbiertoAhora ? 'Atendiendo Ahora en Botica' : 'Cerrado por Horario Nocturno'}
                  </span>
                </span>
                <span>•</span>
                <span>Horario oficial Lima: 7:00 AM – 11:00 PM</span>
              </div>
            </div>

            {/* Tarjeta de Garantías del Establecimiento */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-5">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">Garantía Farmacéutica</h3>
                    <p className="text-xs text-slate-400">
                      Todos los productos cuentan con registro sanitario y control de lote.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">Todos los Medios de Pago</h3>
                    <p className="text-xs text-slate-400">
                      Aceptamos Efectivo, Yape, Plin y todas las tarjetas sin recargo.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">Atención Personalizada</h3>
                    <p className="text-xs text-slate-400">
                      Orientación experta y toma de presión arterial sin costo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN CATÁLOGO DE MEDICAMENTOS */}
      <section id="catalogo" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full">
        {/* Título de la Sección */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Catálogo Actualizado en Tiempo Real
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Consulta Nuestros Medicamentos y Precios
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Verifica la disponibilidad antes de visitarnos. Los precios están expresados en Soles peruanos (PEN).
          </p>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Input de Búsqueda */}
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, principio activo (ej. Paracetamol)..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-slate-800"
              />
            </div>

            {/* Contador de Productos */}
            <div className="flex items-center space-x-3 text-xs font-semibold text-slate-500">
              <button
                onClick={cargarCatalogo}
                disabled={cargando}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                title="Actualizar catálogo"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin text-brand-600' : ''}`} />
              </button>
              <span>
                Mostrando <strong className="text-slate-800">{productosFiltrados.length}</strong> de {productos.length} productos
              </span>
            </div>
          </div>

          {/* Botones de Categorías */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1">
            <button
              onClick={() => setCategoriaSeleccionada('TODAS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                categoriaSeleccionada === 'TODAS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Todas las Categorías
            </button>
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                  categoriaSeleccionada === cat
                    ? 'bg-brand-600 text-white shadow-xs shadow-brand-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Productos */}
        {cargando ? (
          <div className="py-24 text-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-600 mb-3" />
            <p className="text-sm font-semibold">Cargando catálogo oficial de Botica Nova Salud...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No encontramos medicamentos con ese criterio</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Intente buscar por otro nombre, principio activo o seleccione "Todas las Categorías".
            </p>
            <button
              onClick={() => {
                setBusqueda('');
                setCategoriaSeleccionada('TODAS');
              }}
              className="mt-4 px-4 py-2 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-brand-200 transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* Cabecera de la Tarjeta con Badges */}
                <div className="p-5 pb-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {prod.categoria?.nombre || 'General'}
                  </span>

                  {/* Estado de Disponibilidad */}
                  <span
                    className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      prod.disponible
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {prod.disponible ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Disponible</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-slate-400" />
                        <span>Agotado</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Cuerpo de la Tarjeta */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition">
                      {prod.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{prod.presentacion}</p>
                    {prod.principioActivo && (
                      <div className="pt-1">
                        <span className="inline-block text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                          PA: {prod.principioActivo}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Precio y Acción */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Precio de Venta</span>
                      <span className="text-xl font-black text-slate-900 tracking-tight">
                        {formatearMoneda(prod.precio)}
                      </span>
                    </div>

                    <a
                      href={generarLinkWhatsApp(prod)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl transition shadow-xs cursor-pointer group/btn"
                      title="Consultar por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. SECCIÓN SERVICIOS Y BENEFICIOS */}
      <section id="servicios" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Compromiso con tu Salud
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              ¿Por qué confiar en Botica Nova Salud?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Brindamos una experiencia farmacéutica profesional, ética y enfocada en el bienestar de cada paciente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Registro Sanitario DIGEMID</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cada lote y presentación cumple con los más rigurosos estándares farmacéuticos peruanos.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Pagos Rápidos y Seguros</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Paga en caja con Efectivo, billeteras digitales Yape / Plin o cualquier tarjeta bancaria.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Genéricos y de Marca</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Amplio surtido de medicamentos esenciales bioequivalentes para el cuidado de tu economía familiar.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Atención Farmacéutica Ética</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Asesoría cálida y responsable con entrega de boleta electrónica en cada compra.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECCIÓN HORARIOS, UBICACIÓN Y CONTACTO */}
      <section id="contacto" className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-widest bg-brand-950 px-3 py-1 rounded-full border border-brand-800">
                Punto de Atención al Cliente
              </span>
              <h2 className="text-3xl font-black tracking-tight text-white">
                Visítanos o Contáctanos en Lima
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Estamos ubicados en una zona accesible con atención continua los 7 días de la semana.
              </p>

              <div className="space-y-3 pt-2 text-xs text-slate-300">
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Av. Próceres de la Independencia 1420, San Juan de Lurigancho, Lima - Perú</span>
                </div>

                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Lunes a Domingo: 7:00 AM – 11:00 PM (Horario corrido)</span>
                </div>

                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Central Telefónica: (01) 489-3210 • WhatsApp: +51 999 888 777</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700 rounded-3xl p-6 text-center space-y-4">
              <h3 className="font-extrabold text-base text-white">¿Deseas consultar un medicamento?</h3>
              <p className="text-xs text-slate-300">
                Escríbenos directamente por WhatsApp y uno de nuestros farmacéuticos responderá a la brevedad.
              </p>
              <a
                href="https://wa.me/51999888777?text=Hola%20Botica%20Nova%20Salud,%20deseo%20hacer%20una%20consulta."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Escribir al WhatsApp Oficial</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER INSTITUCIONAL Y CRÉDITOS SENATI */}
      <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <Cross className="w-4 h-4 rotate-45" />
              </div>
              <span className="font-bold text-white text-sm">Botica Nova Salud</span>
            </div>

            <div className="flex items-center space-x-6 text-[11px]">
              <a href="#inicio" className="hover:text-white transition">Inicio</a>
              <a href="#catalogo" className="hover:text-white transition">Catálogo</a>
              <a href="#servicios" className="hover:text-white transition">Servicios</a>
              <Link to="/admin/login" className="text-brand-400 hover:text-brand-300 font-bold transition">
                Acceso Personal
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[11px] text-slate-500">
            <p>
              © 2026 Botica Nova Salud. Todos los derechos reservados.
            </p>
            <p className="text-slate-400">
              Proyecto de Titulación Profesional Técnica SENATI • <span className="font-semibold text-slate-300">PIAD-527</span> • Desarrollo de Software y Sistemas de Información
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
