import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Cross,
  Search,
  CheckCircle2,
  AlertCircle,
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
  ChevronDown,
  ChevronRight,
  Filter,
  RefreshCw,
  Loader2,
  ArrowDownRight,
  ArrowUpRight,
  X,
  FileText,
  BadgeAlert,
  ThermometerSnowflake,
  Award
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
  const [productoModal, setProductoModal] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [servicioActivo, setServicioActivo] = useState(null);
  const [libroReclamacionesAbierto, setLibroReclamacionesAbierto] = useState(false);

  // Reloj oficial en vivo de Lima (GMT-5)
  const [horaLima, setHoraLima] = useState('');
  const [estaAbierto, setEstaAbierto] = useState(true);

  // Canvas interactivo de resplandor esmeralda estilo Mara Voss
  const heroRef = useRef(null);
  const [mouseGlow, setMouseGlow] = useState({ x: -500, y: -500, opacity: 0 });

  // Manejador del reloj oficial de Lima
  useEffect(() => {
    const actualizarHora = () => {
      try {
        const ahora = new Date();
        const horaStr = ahora.toLocaleTimeString('es-PE', {
          timeZone: 'America/Lima',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        setHoraLima(horaStr);

        const horaNum = parseInt(
          ahora.toLocaleTimeString('en-US', {
            timeZone: 'America/Lima',
            hour12: false,
            hour: 'numeric'
          }),
          10
        );
        // Horario comercial regular: 07:00 a 23:00. Fuera de ese rango: Turno de Guardia.
        setEstaAbierto(horaNum >= 7 && horaNum < 23);
      } catch {
        setHoraLima('08:00:00');
        setEstaAbierto(true);
      }
    };

    actualizarHora();
    const interval = setInterval(actualizarHora, 1000);
    return () => clearInterval(interval);
  }, []);

  // Carga del catálogo desde la API pública
  const cargarCatalogo = async () => {
    setCargando(true);
    try {
      const data = await obtenerCatalogoPublicoApi();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar catálogo público:', err);
      toast.error('No se pudo sincronizar el catálogo de medicamentos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCatalogo();
  }, []);

  // Categorías únicas
  const categorias = useMemo(() => {
    const mapa = new Map();
    productos.forEach((p) => {
      if (p.categoria?.nombre) {
        mapa.set(p.categoria.nombre, p.categoria.id);
      }
    });
    return Array.from(mapa.keys());
  }, [productos]);

  // Filtrado reactivo en tiempo real
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

  // Generador de enlace oficial de WhatsApp para consultas farmacéuticas
  const generarLinkWhatsApp = (producto, accion = 'consulta') => {
    const telefono = '51999888777';
    let mensaje = '';
    if (producto) {
      mensaje = encodeURIComponent(
        `¡Hola Botica Nova Salud! Deseo consultar la disponibilidad y precio del medicamento: "${producto.nombre} (${producto.presentacion})" (Precio ref: ${formatearMoneda(producto.precio)}).`
      );
    } else if (accion === 'receta') {
      mensaje = encodeURIComponent(
        '¡Hola Botica Nova Salud! Tengo una receta médica y deseo saber si tienen disponibles todos los medicamentos y el costo total.'
      );
    } else {
      mensaje = encodeURIComponent(
        '¡Hola Botica Nova Salud! Deseo hacer una consulta con el Químico Farmacéutico de turno.'
      );
    }
    return `https://wa.me/${telefono}?text=${mensaje}`;
  };

  // Efecto de aura esmeralda que sigue el puntero en el Hero
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMouseGlow({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setMouseGlow((prev) => ({ ...prev, opacity: 0 }));
  };

  // Servicios clínicos farmacéuticos (Estilo Capabilities)
  const servicios = [
    {
      id: '01',
      titulo: 'Atención Farmacéutica & Orientación Especializada',
      ambito: 'Posología / Interacciones farmacológicas / Asesoría profesional',
      descripcion:
        'Cada medicamento dispensado cuenta con la supervisión de un profesional Químico Farmacéutico Colegiado, asegurando que conozcas la dosis correcta, horarios de administración y posibles interacciones con tus comidas o tratamientos.',
      beneficios: [
        'Explicación clara de dosis y modo de empleo.',
        'Prevención de contraindicaciones y alergias.',
        'Revisión de recetas complejas de clínicas y hospitales.'
      ]
    },
    {
      id: '02',
      titulo: 'Validación Inmediata de Recetas Médicas',
      ambito: 'Recetas físicas / Recetas digitales / Control de psicotrópicos',
      descripcion:
        'Procesamos recetas emitidas por EsSalud, MINSA y clínicas privadas. Puedes enviarnos la fotografía de tu receta por WhatsApp para verificar stock, preparar el pedido y tenerlo listo para recojo o envío a domicilio.',
      beneficios: [
        'Cero filas: cotización en menos de 5 minutos.',
        'Sustitutos genéricos bioequivalentes de menor costo.',
        'Reserva inmediata de medicamentos de alta demanda.'
      ]
    },
    {
      id: '03',
      titulo: 'Cadena de Frío & Almacenamiento Clínico Termocontrolado',
      ambito: 'Insulinas / Vacunas / Colirios / Antibióticos pediátricos',
      descripcion:
        'Contamos con equipos de refrigeración médica calibrados con registro diario de temperatura (2°C a 8°C) según normativas de DIGEMID, garantizando la estabilidad y potencia de tus fármacos más sensibles.',
      beneficios: [
        'Monitoreo térmico continuo con termohigrómetros digitales.',
        'Embalaje con geles refrigerantes para traslados seguros.',
        'Garantía total de preservación biológica.'
      ]
    },
    {
      id: '04',
      titulo: 'Toma de Presión Arterial & Control de Parámetros',
      ambito: 'Servicio asistencial gratuito en botica / Prevención cardiovascular',
      descripcion:
        'Acércate a nuestro establecimiento para el monitoreo gratuito de presión arterial con tensiómetros clínicos certificados y registro preventivo de tus valores.',
      beneficios: [
        'Medición rápida y sin costo.',
        'Detección temprana de alteraciones de presión.',
        'Consejería en hábitos saludables y adherencia al tratamiento.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#060A08] text-[#F4F6F4] font-sans selection:bg-[#10B981] selection:text-black overflow-x-hidden">
      {/* 1. TOP UTILITY BAR (Estilo Mara Voss: Reloj GMT/Local en vivo + Menú + Acceso) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#060A08]/90 backdrop-blur-xl border-b border-[#14221A] transition-all">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between">
          {/* Lado Izquierdo: Reloj en vivo de Lima y Badge de Guardia */}
          <div className="flex items-center space-x-4">
            <div className="leading-tight select-none">
              <span className="text-[10px] font-mono tracking-widest text-[#10B981] uppercase block">
                GMT-05:00 // LIMA, PERÚ
              </span>
              <span className="text-xs font-mono font-bold tracking-wider text-[#F4F6F4]">
                {horaLima || '08:00:00'}
              </span>
            </div>

            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/25 text-[11px] font-medium text-[#34D399]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              <span>{estaAbierto ? 'BOTICA ABIERTA' : 'TURNO DE GUARDIA'}</span>
            </div>
          </div>

          {/* Centro: Logo Monumental y Navegación */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#10B981] to-[#34D399] flex items-center justify-center text-black font-black shadow-lg shadow-[#10B981]/20 group-hover:scale-105 transition-transform duration-300">
                <Cross className="w-5 h-5 rotate-45 stroke-[2.5]" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-base tracking-tight text-white block leading-none font-display">
                  NOVA SALUD
                </span>
                <span className="text-[10px] tracking-widest text-[#9CA3AF] uppercase block font-mono">
                  DISPENSACIÓN & SALUD
                </span>
              </div>
            </Link>
          </div>

          {/* Lado Derecho: Píldoras de Contacto y Acceso al Sistema */}
          <div className="flex items-center space-x-3">
            <a
              href="https://wa.me/51999888777?text=Hola%20Botica%20Nova%20Salud,%20deseo%20hacer%20una%20consulta."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-[#1E3326] bg-[#0B1510] hover:bg-[#10B981] hover:text-black hover:border-[#10B981] text-xs font-semibold text-[#D1D5DB] transition-all duration-200 active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#10B981] group-hover:text-black" />
              <span>WhatsApp de Guardia</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            {usuario ? (
              <Link
                to="/app/pos"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#10B981] text-black hover:bg-[#34D399] text-xs font-bold shadow-lg shadow-[#10B981]/25 transition-all duration-200 active:scale-95"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Panel ({usuario.rol})</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white text-black hover:bg-[#10B981] text-xs font-bold transition-all duration-200 active:scale-95 shadow-md"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Acceso Personal</span>
              </Link>
            )}

            {/* Botón Menú Móvil */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="md:hidden p-2 rounded-xl text-[#9CA3AF] hover:text-white bg-[#0B1510] border border-[#14221A]"
              aria-label="Abrir menú"
            >
              {menuAbierto ? <X className="w-5 h-5" /> : <div className="space-y-1">
                <span className="block w-5 h-0.5 bg-white"></span>
                <span className="block w-3.5 h-0.5 bg-[#10B981]"></span>
                <span className="block w-5 h-0.5 bg-white"></span>
              </div>}
            </button>
          </div>
        </div>

        {/* Drawer móvil desplegable */}
        {menuAbierto && (
          <div className="md:hidden bg-[#0B1510] border-b border-[#14221A] px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <nav className="flex flex-col space-y-3 text-sm font-semibold text-[#D1D5DB]">
              <a
                href="#inicio"
                onClick={() => setMenuAbierto(false)}
                className="hover:text-[#10B981] transition py-1"
              >
                Inicio
              </a>
              <a
                href="#enfoque"
                onClick={() => setMenuAbierto(false)}
                className="hover:text-[#10B981] transition py-1"
              >
                Compromiso Clínico
              </a>
              <a
                href="#catalogo"
                onClick={() => setMenuAbierto(false)}
                className="hover:text-[#10B981] transition py-1"
              >
                Catálogo de Medicamentos
              </a>
              <a
                href="#servicios"
                onClick={() => setMenuAbierto(false)}
                className="hover:text-[#10B981] transition py-1"
              >
                Servicios Farmacéuticos
              </a>
              <a
                href="#contacto"
                onClick={() => setMenuAbierto(false)}
                className="hover:text-[#10B981] transition py-1"
              >
                Horarios & Contacto
              </a>
            </nav>
            <div className="pt-2 border-t border-[#14221A]">
              <a
                href="https://wa.me/51999888777?text=Hola%20Botica%20Nova%20Salud,%20deseo%20hacer%20una%20consulta."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 py-3 bg-[#10B981] text-black font-bold rounded-full text-xs shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp de Guardia</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO MONUMENTAL ESTILO MARA VOSS */}
      <section
        id="inicio"
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative pt-36 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto min-h-[90vh] flex flex-col justify-between overflow-hidden"
      >
        {/* Efecto de Luz Esmeralda Fluida que sigue el puntero */}
        <div
          className="pointer-events-none absolute w-[650px] h-[650px] rounded-full blur-[140px] bg-gradient-to-tr from-[#10B981]/15 to-[#34D399]/10 transition-opacity duration-500 ease-out -translate-x-1/2 -translate-y-1/2 z-0"
          style={{
            left: `${mouseGlow.x}px`,
            top: `${mouseGlow.y}px`,
            opacity: mouseGlow.opacity
          }}
        />

        {/* Textura sutil geométrica de fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.06] pointer-events-none" />

        {/* CONTENIDO DEL HERO */}
        <div className="relative z-10 space-y-10">
          {/* Subtítulo Superior con formato editorial */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#14221A] pb-5">
            <span className="text-xs sm:text-sm font-mono tracking-widest text-[#9CA3AF] uppercase">
              // BOTICA & DISPENSACIÓN ESPECIALIZADA
            </span>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#34D399]">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>DIGEMID CERTIFICADO · QUÍMICO REGENTE TITULADO</span>
            </div>
          </div>

          {/* TÍTULO MONUMENTAL MARA VOSS */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
              <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black tracking-tight leading-[0.88] text-white select-none">
                <span className="text-[#10B981] inline-block hover:scale-[1.02] transition-transform">NOVA</span>
                <span className="text-white inline-block ml-3 font-light hover:scale-[1.02] transition-transform">SALUD</span>
                <sup className="text-xl sm:text-3xl text-[#34D399] font-mono ml-2 font-normal">[01]</sup>
              </h1>
              <span className="text-xs sm:text-sm font-mono text-[#6B7280] tracking-widest uppercase md:text-right">
                CATÁLOGO PÚBLICO // CONSULTA EN TIEMPO REAL
              </span>
            </div>

            <p className="text-base sm:text-xl md:text-2xl text-[#9CA3AF] font-light max-w-3xl leading-relaxed pt-3">
              Medicamentos 100% garantizados, orientación farmacéutica cercana y precios justos en Soles. Verifica stock al instante o envíanos tu receta médica.
            </p>
          </div>

          {/* PÍLDORAS DE ACCIÓN HERO */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="#catalogo"
              className="px-8 py-4 rounded-full bg-white text-black hover:bg-[#10B981] hover:text-black font-bold text-sm sm:text-base flex items-center space-x-3 transition-all duration-200 hover:scale-[1.04] active:scale-[0.98] shadow-xl shadow-white/5"
            >
              <span>Explorar Catálogo en Vivo</span>
              <ArrowDownRight className="w-4 h-4" />
            </a>

            <a
              href={generarLinkWhatsApp(null, 'receta')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-4 rounded-full bg-[#0E1A13] hover:bg-[#15271D] border border-[#1E3827] text-[#E5E7EB] hover:text-white font-semibold text-sm sm:text-base flex items-center space-x-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 text-[#10B981]" />
              <span>Enviar Receta Médica</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <div className="hidden lg:flex items-center space-x-3 pl-4 border-l border-[#14221A] text-xs font-mono text-[#9CA3AF]">
              <span>UBICACIÓN: LIMA, PERÚ</span>
              <span>•</span>
              <span>ATENCIÓN DIARIA</span>
            </div>
          </div>
        </div>

        {/* PIE DEL HERO: Indicador de Scroll hacia el Enfoque */}
        <div className="pt-16 flex items-center justify-between border-t border-[#14221A] text-xs text-[#6B7280] relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>DISPENSACIÓN RESPONSABLE CON REGISTRO SANITARIO VIGENTE</span>
          </div>

          <a
            href="#enfoque"
            className="flex items-center space-x-2 text-[#9CA3AF] hover:text-[#10B981] transition group"
            aria-label="Bajar al enfoque clínico"
          >
            <span className="font-mono text-[11px] tracking-wider uppercase hidden sm:inline">
              Nuestro Enfoque
            </span>
            <div className="w-8 h-8 rounded-full border border-[#1E3326] flex items-center justify-center group-hover:border-[#10B981] group-hover:bg-[#10B981]/10 transition">
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </div>
          </a>
        </div>
      </section>

      {/* 3. ENFOQUE CLÍNICO / DESIGN APPROACH (Estilo Mara Voss: Tipografía Editorial Masiva) */}
      <section id="enfoque" className="py-24 md:py-36 border-t border-[#14221A] bg-[#070D0A] px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1440px] mx-auto space-y-16">
          <div className="flex items-center justify-between border-b border-[#14221A] pb-4">
            <span className="text-xs font-mono tracking-widest text-[#10B981] uppercase">
              // 02 · DECLARACIÓN DE SERVICIO
            </span>
            <span className="text-xs font-mono text-[#6B7280]">
              COMPROMISO ÉTICO CON TU SALUD
            </span>
          </div>

          {/* Gran Declaración Editorial */}
          <div className="max-w-5xl space-y-8">
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#F4F6F4]">
              Arraigados en el rigor científico, guiados por el cuidado humano:{' '}
              <span className="text-[#10B981] font-light">
                Botica Nova Salud transforma la compra de medicamentos en una experiencia de confianza, seguridad y acompañamiento permanente.
              </span>
            </h2>
          </div>

          {/* 4 Pilares de Calidad y Confianza (Estilo Bento Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            <div className="p-8 rounded-3xl bg-[#0B1510] border border-[#14261B] hover:border-[#10B981]/40 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Certificación DIGEMID</h3>
              <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
                Trazabilidad completa de lote y fecha de vencimiento. Cero medicamentos adulterados o de dudosa procedencia.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0B1510] border border-[#14261B] hover:border-[#10B981]/40 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] group-hover:scale-110 transition-transform">
                <ThermometerSnowflake className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Cadena de Frío Garantizada</h3>
              <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
                Refrigeración médica regulada entre 2°C y 8°C para insulinas, vacunas y colirios con registro diario.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0B1510] border border-[#14261B] hover:border-[#10B981]/40 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Químicos Colegiados</h3>
              <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
                Profesionales universitarios colegiados a tu disposición permanente para resolver cualquier duda médica.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0B1510] border border-[#14261B] hover:border-[#10B981]/40 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Precios Justos en Soles</h3>
              <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
                Precios accesibles y transparentes. Aceptamos Efectivo, Yape, Plin y todas las tarjetas sin comisión extra.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CATÁLOGO INTERACTIVO EN TIEMPO REAL (Estilo Selected Work / Products) */}
      <section id="catalogo" className="py-24 md:py-32 border-t border-[#14221A] px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto space-y-12">
        {/* Cabecera del Catálogo */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#14221A] pb-6">
          <div className="space-y-2">
            <span className="text-xs font-mono tracking-widest text-[#10B981] uppercase">
              // 03 · DISPENSARIO & CATÁLOGO
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Medicamentos & Productos Disponibles
            </h2>
            <p className="text-xs sm:text-sm text-[#9CA3AF]">
              Sincronizado en tiempo real con nuestro inventario en Lima. Consulta stock y precios al instante.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={cargarCatalogo}
              disabled={cargando}
              className="p-3 rounded-full bg-[#0B1510] border border-[#1E3326] text-[#D1D5DB] hover:text-[#10B981] hover:border-[#10B981] transition active:scale-95 disabled:opacity-50"
              title="Actualizar catálogo"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </button>
            <div className="px-4 py-2 rounded-full bg-[#0B1510] border border-[#1E3326] text-xs font-mono text-[#34D399]">
              {productosFiltrados.length} ÍTEMS DISPONIBLES
            </div>
          </div>
        </div>

        {/* Buscador Reactivo y Filtro de Categorías */}
        <div className="space-y-6">
          <div className="relative">
            <Search className="w-5 h-5 text-[#9CA3AF] absolute left-5 top-4.5" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Escribe el nombre comercial, principio activo (ej. Paracetamol, Amoxicilina) o presentación..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#0B1510] border border-[#1E3326] text-sm sm:text-base text-white placeholder-[#6B7280] focus:outline-hidden focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition shadow-inner"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-5 top-4.5 text-[#6B7280] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Píldoras de Categorías */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setCategoriaSeleccionada('TODAS')}
              className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 shrink-0 ${
                categoriaSeleccionada === 'TODAS'
                  ? 'bg-[#10B981] text-black font-bold shadow-md shadow-[#10B981]/20'
                  : 'bg-[#0B1510] text-[#9CA3AF] border border-[#1E3326] hover:text-white hover:border-[#10B981]'
              }`}
            >
              TODAS LAS CATEGORÍAS
            </button>

            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 shrink-0 ${
                  categoriaSeleccionada === cat
                    ? 'bg-[#10B981] text-black font-bold shadow-md shadow-[#10B981]/20'
                    : 'bg-[#0B1510] text-[#9CA3AF] border border-[#1E3326] hover:text-white hover:border-[#10B981]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* LISTADO DE MEDICAMENTOS (Estilo Selected Work Row con efecto Wipe) */}
        {cargando ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 text-[#10B981] animate-spin" />
            <p className="text-xs font-mono text-[#9CA3AF]">CONECTANDO CON INVENTARIO EN VIVO...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-[#0B1510] border border-[#14261B] p-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mx-auto">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No encontramos ese medicamento en el catálogo público</h3>
            <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
              Es posible que contemos con alternativas bioequivalentes o medicamentos similares en almacén. Escríbenos por WhatsApp para verificar de inmediato.
            </p>
            <a
              href={`https://wa.me/51999888777?text=Hola%20Botica%20Nova%20Salud,%20estoy%20buscando:%20${encodeURIComponent(
                busqueda
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[#10B981] text-black font-bold text-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Consultar por WhatsApp</span>
            </a>
          </div>
        ) : (
          <div className="border-t border-[#14221A] divide-y divide-[#14221A]">
            {/* Cabecera de Columnas en Desktop */}
            <div className="hidden md:grid grid-cols-12 py-3 px-4 text-[11px] font-mono tracking-widest text-[#6B7280] uppercase">
              <span className="col-span-1">#</span>
              <span className="col-span-4">PRODUCTO & PRESENTACIÓN</span>
              <span className="col-span-3">CATEGORÍA / FÓRMULA</span>
              <span className="col-span-2 text-right">PRECIO UNITARIO</span>
              <span className="col-span-2 text-right">ACCIONES</span>
            </div>

            {/* Filas interactivas de medicamentos */}
            {productosFiltrados.map((p, idx) => (
              <div
                key={p.id || idx}
                onClick={() => setProductoModal(p)}
                className="group relative py-5 px-4 md:px-4 rounded-xl transition-all duration-300 hover:bg-[#0E1A13] cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
              >
                {/* Índice */}
                <span className="hidden md:block col-span-1 text-xs font-mono text-[#6B7280] group-hover:text-[#10B981]">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Nombre y Presentación */}
                <div className="col-span-4 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-base sm:text-lg text-white group-hover:text-[#10B981] transition">
                      {p.nombre}
                    </span>
                    {p.requiereReceta && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#F87171]" title="Requiere receta médica para su dispensación">
                        RECETA
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9CA3AF]">
                    {p.presentacion || 'Presentación estándar'}
                    {p.principioActivo ? ` • ${p.principioActivo}` : ''}
                  </p>
                </div>

                {/* Categoría */}
                <div className="col-span-3">
                  <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#14261B] text-[#34D399] border border-[#1E3827]">
                    {p.categoria?.nombre || 'General'}
                  </span>
                </div>

                {/* Precio en Soles */}
                <div className="col-span-2 md:text-right">
                  <span className="font-mono font-bold text-lg text-white group-hover:text-[#10B981]">
                    {formatearMoneda(p.precio)}
                  </span>
                  <span className="block text-[10px] font-mono text-[#6B7280]">INC. IGV</span>
                </div>

                {/* Botón Acción Rápida */}
                <div className="col-span-2 flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setProductoModal(p)}
                    className="p-2 rounded-full border border-[#1E3326] bg-[#0B1510] hover:border-[#10B981] hover:text-[#10B981] text-[#D1D5DB] transition"
                    title="Ver ficha técnica"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <a
                    href={generarLinkWhatsApp(p)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-[#10B981] text-black hover:bg-[#34D399] text-xs font-bold flex items-center space-x-1.5 transition active:scale-95"
                    title="Consultar por WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Pedir</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. SERVICIOS FARMACÉUTICOS (Estilo Capabilities Mara Voss: Acordeones con botón Explorar +) */}
      <section id="servicios" className="py-24 md:py-36 border-t border-[#14221A] bg-[#070D0A] px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1440px] mx-auto space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#14221A] pb-4">
            <div>
              <span className="text-xs font-mono tracking-widest text-[#10B981] uppercase block">
                // 04 · CAPACIDADES & SERVICIOS
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight pt-2">
                Atención Médica y Farmacéutica Integral
              </h2>
            </div>
            <p className="text-xs font-mono text-[#9CA3AF] max-w-sm">
              Más que una botica tradicional: un punto de salud cercano para tu comunidad.
            </p>
          </div>

          {/* Lista de Acordeones */}
          <div className="border-t border-[#14221A] divide-y divide-[#14221A]">
            {servicios.map((s) => {
              const abierto = servicioActivo === s.id;
              return (
                <div key={s.id} className="py-6 sm:py-8 space-y-4">
                  <div
                    onClick={() => setServicioActivo(abierto ? null : s.id)}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center space-x-6 sm:space-x-10">
                      <span className="text-xs sm:text-sm font-mono text-[#6B7280] group-hover:text-[#10B981] transition">
                        {s.id}
                      </span>
                      <div>
                        <h3 className="text-lg sm:text-2xl font-bold text-white group-hover:text-[#10B981] transition">
                          {s.titulo}
                        </h3>
                        <p className="text-xs sm:text-sm font-mono text-[#6B7280] pt-1">
                          {s.ambito}
                        </p>
                      </div>
                    </div>

                    <button
                      className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition-all duration-200 border ${
                        abierto
                          ? 'bg-[#10B981] text-black border-[#10B981] font-bold'
                          : 'border-[#1E3326] text-[#9CA3AF] hover:text-white hover:border-[#10B981] bg-[#0B1510]'
                      }`}
                    >
                      {abierto ? 'CERRAR −' : 'EXPLORAR +'}
                    </button>
                  </div>

                  {/* Panel expandible */}
                  {abierto && (
                    <div className="pl-12 sm:pl-16 pr-4 pt-4 space-y-4 max-w-3xl animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-sm sm:text-base text-[#D1D5DB] leading-relaxed">
                        {s.descripcion}
                      </p>
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-mono font-bold text-[#10B981] uppercase tracking-wider block">
                          Beneficios para el paciente:
                        </span>
                        <ul className="space-y-1.5">
                          {s.beneficios.map((b, i) => (
                            <li key={i} className="flex items-center space-x-2 text-xs sm:text-sm text-[#9CA3AF]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. SECCIÓN CTA DE RECETA MÉDICA Y URGENCIAS */}
      <section className="py-24 md:py-32 border-t border-[#14221A] bg-gradient-to-b from-[#070D0A] to-[#040805] px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1440px] mx-auto rounded-3xl p-8 sm:p-14 md:p-20 bg-[#0B1510] border border-[#14261B] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-2xl relative z-10">
            <span className="text-xs font-mono tracking-widest text-[#10B981] uppercase block">
              // ATENCIÓN INMEDIATA POR WHATSAPP
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              ¿Tienes una receta médica? <br />
              <span className="text-[#10B981]">Cotizamos y preparamos tu pedido en minutos.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#9CA3AF] leading-relaxed">
              Toma una fotografía legible de tu receta médica física o digital y compártela directamente con nuestro químico farmacéutico regente para verificar existencias y programar tu recojo o envío.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
            <a
              href={generarLinkWhatsApp(null, 'receta')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4.5 rounded-full bg-[#10B981] text-black hover:bg-[#34D399] font-bold text-sm sm:text-base flex items-center justify-center space-x-3 transition hover:scale-[1.04] active:scale-[0.98] shadow-xl shadow-[#10B981]/25"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Enviar Receta por WhatsApp</span>
            </a>

            <a
              href="tel:51999888777"
              className="w-full sm:w-auto px-6 py-4.5 rounded-full border border-[#1E3827] bg-[#0E1A13] hover:bg-[#15271D] text-white font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 transition"
            >
              <Phone className="w-4 h-4 text-[#10B981]" />
              <span>Llamar a Botica</span>
            </a>
          </div>
        </div>
      </section>

      {/* 7. FOOTER EDITORIAL (Estilo Mara Voss: Minimalista, Factual y Conforme a Normativa) */}
      <footer id="contacto" className="border-t border-[#14221A] bg-[#050806] pt-16 pb-12 px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1440px] mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#14221A]">
            {/* Columna 1: Marca */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#10B981] flex items-center justify-center text-black font-black">
                  <Cross className="w-4 h-4 rotate-45 stroke-[2.5]" />
                </div>
                <span className="font-bold text-white tracking-tight text-lg">NOVA SALUD</span>
              </div>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Establecimiento farmacéutico autorizado por la Dirección General de Medicamentos, Insumos y Drogas (DIGEMID).
              </p>
              <div className="text-[11px] font-mono text-[#10B981]">
                RUC: 20601234567 · BOTICA NOVA SALUD S.A.C.
              </div>
            </div>

            {/* Columna 2: Ubicación & Horario */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-white uppercase tracking-wider block font-bold">
                Sede Central & Horarios
              </span>
              <p className="text-xs text-[#9CA3AF] flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                <span>Av. Los Próceres 1248, San Juan de Lurigancho, Lima, Perú.</span>
              </p>
              <p className="text-xs text-[#9CA3AF] flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span>Lunes a Sábado: 7:00 am – 11:00 pm</span>
              </p>
              <p className="text-xs text-[#9CA3AF] flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span>Domingos y Feriados: 8:00 am – 10:00 pm</span>
              </p>
            </div>

            {/* Columna 3: Enlaces Rápidos */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-white uppercase tracking-wider block font-bold">
                Navegación
              </span>
              <ul className="space-y-2 text-xs text-[#9CA3AF]">
                <li>
                  <a href="#inicio" className="hover:text-[#10B981] transition">
                    Inicio
                  </a>
                </li>
                <li>
                  <a href="#catalogo" className="hover:text-[#10B981] transition">
                    Catálogo de Medicamentos
                  </a>
                </li>
                <li>
                  <a href="#servicios" className="hover:text-[#10B981] transition">
                    Servicios Asistenciales
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setLibroReclamacionesAbierto(true)}
                    className="hover:text-[#10B981] transition text-left"
                  >
                    Libro de Reclamaciones Virtual
                  </button>
                </li>
              </ul>
            </div>

            {/* Columna 4: Cumplimiento Sanitario */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-white uppercase tracking-wider block font-bold">
                Transparencia & Regulación
              </span>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Dispensación conforme a la Ley General de Salud N° 26842 y normativa DIGEMID. Los precios están sujetos a existencias de lote.
              </p>
              <Link
                to="/admin/login"
                className="inline-flex items-center space-x-2 text-xs font-mono text-[#6B7280] hover:text-[#10B981] transition"
              >
                <span>Acceso Intranet Farmacéutica →</span>
              </Link>
            </div>
          </div>

          {/* Copyright y Volver Arriba */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#6B7280]">
            <div>© {new Date().getFullYear()} BOTICA NOVA SALUD · TODOS LOS DERECHOS RESERVADOS</div>
            <a
              href="#inicio"
              className="text-[#9CA3AF] hover:text-[#10B981] transition flex items-center space-x-1"
            >
              <span>VOLVER ARRIBA ↑</span>
            </a>
          </div>
        </div>
      </footer>

      {/* 8. MODAL NATIVO TIPO <DIALOG> PARA FICHA DEL MEDICAMENTO */}
      {productoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setProductoModal(null)}
        >
          <div
            className="bg-[#0B1510] border border-[#1E3827] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-white shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Cerrar */}
            <button
              onClick={() => setProductoModal(null)}
              className="absolute right-5 top-5 p-2 rounded-full bg-[#14261B] text-[#9CA3AF] hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Encabezado Ficha */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30">
                  {productoModal.categoria?.nombre || 'Medicamento'}
                </span>
                {productoModal.requiereReceta && (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30">
                    REQUIERE RECETA MÉDICA
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">{productoModal.nombre}</h3>
              <p className="text-xs text-[#9CA3AF]">{productoModal.presentacion}</p>
            </div>

            {/* Datos Técnicos Farmacéuticos */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#14221A] text-xs">
              <div>
                <span className="text-[#6B7280] font-mono uppercase block text-[10px]">Principio Activo</span>
                <span className="font-semibold text-white">{productoModal.principioActivo || 'No especificado'}</span>
              </div>
              <div>
                <span className="text-[#6B7280] font-mono uppercase block text-[10px]">Laboratorio</span>
                <span className="font-semibold text-white">{productoModal.laboratorio || 'Certificado'}</span>
              </div>
              <div>
                <span className="text-[#6B7280] font-mono uppercase block text-[10px]">Precio Unitario</span>
                <span className="font-bold text-base text-[#10B981] font-mono">
                  {formatearMoneda(productoModal.precio)}
                </span>
              </div>
              <div>
                <span className="text-[#6B7280] font-mono uppercase block text-[10px]">Disponibilidad</span>
                <span className="font-semibold text-[#34D399] flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>En Stock para despacho</span>
                </span>
              </div>
            </div>

            {/* Advertencia DIGEMID */}
            <div className="p-3.5 rounded-xl bg-[#14261B]/60 border border-[#1E3827] text-xs text-[#9CA3AF] space-y-1">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Advertencia Sanitaria:</span>
              </span>
              <p className="text-[11px] leading-relaxed">
                No se automedique. Consulte siempre con un profesional de la salud antes de consumir cualquier fármaco. Mantener fuera del alcance de los niños.
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href={generarLinkWhatsApp(productoModal)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-full bg-[#10B981] text-black hover:bg-[#34D399] font-bold text-xs flex items-center justify-center space-x-2 transition active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consultar o Pedir por WhatsApp</span>
              </a>
              <button
                onClick={() => setProductoModal(null)}
                className="py-3 px-5 rounded-full border border-[#1E3326] text-xs font-semibold text-[#9CA3AF] hover:text-white hover:border-[#10B981] transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL DEL LIBRO DE RECLAMACIONES VIRTUAL (NORMATIVA PERÚ) */}
      {libroReclamacionesAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLibroReclamacionesAbierto(false)}
        >
          <div
            className="bg-[#0B1510] border border-[#1E3827] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 text-white shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLibroReclamacionesAbierto(false)}
              className="absolute right-5 top-5 p-2 rounded-full bg-[#14261B] text-[#9CA3AF] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white pt-2">Libro de Reclamaciones Virtual</h3>
              <p className="text-xs text-[#9CA3AF]">
                Conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571).
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6B7280] font-mono text-[10px] uppercase mb-1">Razón Social</label>
                <span className="font-semibold text-white block">BOTICA NOVA SALUD S.A.C.</span>
              </div>
              <div>
                <label className="block text-[#6B7280] font-mono text-[10px] uppercase mb-1">RUC</label>
                <span className="font-semibold text-white block">20601234567</span>
              </div>
              <div>
                <label className="block text-[#6B7280] font-mono text-[10px] uppercase mb-1">Dirección de la Sede</label>
                <span className="font-semibold text-[#D1D5DB] block">Av. Los Próceres 1248, San Juan de Lurigancho, Lima</span>
              </div>
              <div className="p-3 bg-[#14261B]/40 rounded-xl border border-[#1E3827] text-[#9CA3AF] text-[11px]">
                Para presentar un reclamo o queja formal de manera presencial o digital, también puedes escribirnos al correo: <strong className="text-white">reclamos@novasalud.pe</strong> o contactar a nuestra jefatura farmacéutica.
              </div>
            </div>

            <button
              onClick={() => setLibroReclamacionesAbierto(false)}
              className="w-full py-3 rounded-full bg-[#10B981] text-black font-bold text-xs hover:bg-[#34D399] transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
