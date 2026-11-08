import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getActiveClient, ClientProfile } from '@/utils/orderStorage';
import {
  User,
  LogIn,
  Search,
  ChevronDown,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Pill,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  Activity,
  Syringe,
  FileText,
  Baby,
  Navigation,
  Phone,
} from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  favoritesCount: number;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  onOpenSearch?: () => void;
  onOpenMenu: () => void;
  onOpenQuotation: () => void;
  onOpenBuilder?: () => void;
  onOpenServices?: (serviceId?: string) => void;
  onOpenCatalog: (category?: string) => void;
  onOpenBrand: (tab?: 'historia' | 'mapa') => void;
  onOpenReclamaciones?: () => void;
}

type DropdownKey = 'catalogo' | 'servicios' | 'nosotros' | null;

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  favoritesCount,
  onOpenCart,
  onOpenFavorites,
  onOpenSearch,
  onOpenMenu,
  onOpenQuotation,
  onOpenBuilder,
  onOpenServices,
  onOpenCatalog,
  onOpenBrand,
  onOpenReclamaciones,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey>(null);
  const [activeClient, setActiveClient] = useState<ClientProfile | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActiveClient(getActiveClient());
    const handleAuthChange = (e: any) => {
      setActiveClient(e.detail);
    };
    window.addEventListener('client-auth-changed', handleAuthChange);
    return () => window.removeEventListener('client-auth-changed', handleAuthChange);
  }, []);

  const handleMouseEnter = (menuKey: DropdownKey) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveDropdown(menuKey);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const closeDropdown = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveDropdown(null);
  };

  const handleSelectService = (serviceId: string) => {
    closeDropdown();
    if (onOpenServices) {
      onOpenServices(serviceId);
    } else if (onOpenBuilder) {
      onOpenBuilder();
    } else {
      window.dispatchEvent(new CustomEvent('open-services', { detail: { serviceId } }));
    }
  };

  const handleSelectLocation = () => {
    closeDropdown();
    onOpenBrand('mapa');
  };

  const handleSelectReclamaciones = () => {
    closeDropdown();
    if (onOpenReclamaciones) {
      onOpenReclamaciones();
    } else {
      window.dispatchEvent(new CustomEvent('open-reclamaciones'));
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 w-full lg:top-[10px] lg:left-[10px] lg:right-[10px] lg:w-[calc(100%-20px)] z-50 h-[58px] lg:h-[60px] bg-white px-4 lg:px-5 flex items-center justify-between transition-all duration-300 shadow-sm border-b lg:border border-zinc-200/80 lg:rounded-sm"
      onMouseLeave={handleMouseLeave}
    >
      {/* Left Navigation (Desktop) with Hover Mega Dropdowns */}
      <nav className="hidden xl:flex items-center gap-[22px] h-full">
        {/* 1. CATÁLOGO Dropdown Trigger */}
        <div
          className="relative h-full flex items-center"
          onMouseEnter={() => handleMouseEnter('catalogo')}
        >
          <button
            type="button"
            onClick={() => {
              closeDropdown();
              onOpenCatalog('ALL');
            }}
            className={`flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.04em] transition-colors duration-200 cursor-pointer ${
              activeDropdown === 'catalogo' ? 'text-[#0d9488]' : 'text-[#18181b] hover:text-[#0d9488]'
            }`}
          >
            <span>CATÁLOGO</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${
                activeDropdown === 'catalogo' ? 'rotate-180 text-[#0d9488]' : 'text-zinc-400'
              }`}
            />
          </button>
        </div>

        {/* 2. SERVICIOS & TÓPICO Dropdown Trigger */}
        <div
          className="relative h-full flex items-center"
          onMouseEnter={() => handleMouseEnter('servicios')}
        >
          <button
            type="button"
            onClick={() => handleSelectService('presion')}
            className={`flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.04em] transition-colors duration-200 cursor-pointer ${
              activeDropdown === 'servicios' ? 'text-[#0d9488]' : 'text-[#18181b] hover:text-[#0d9488]'
            }`}
          >
            <span>SERVICIOS & TÓPICO</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${
                activeDropdown === 'servicios' ? 'rotate-180 text-[#0d9488]' : 'text-zinc-400'
              }`}
            />
          </button>
        </div>

        {/* 3. NOSOTROS Dropdown Trigger */}
        <div
          className="relative h-full flex items-center"
          onMouseEnter={() => handleMouseEnter('nosotros')}
        >
          <button
            type="button"
            onClick={() => {
              closeDropdown();
              onOpenBrand('historia');
            }}
            className={`flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.04em] transition-colors duration-200 cursor-pointer ${
              activeDropdown === 'nosotros' ? 'text-[#0d9488]' : 'text-[#18181b] hover:text-[#0d9488]'
            }`}
          >
            <span>NOSOTROS</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${
                activeDropdown === 'nosotros' ? 'rotate-180 text-[#0d9488]' : 'text-zinc-400'
              }`}
            />
          </button>
        </div>

        {/* 4. ENVIAR RECETA Direct Action */}
        <button
          type="button"
          onClick={() => {
            closeDropdown();
            onOpenQuotation();
          }}
          className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#18181b] hover:text-[#0d9488] transition-colors duration-200 cursor-pointer"
        >
          ENVIAR RECETA
        </button>
      </nav>

      {/* Center Logo - Navigates directly to / (Inicio) from anywhere */}
      <Link
        to="/"
        onClick={() => {
          closeDropdown();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="xl:absolute xl:left-1/2 xl:-translate-x-1/2 flex items-center justify-center font-black text-[19px] lg:text-[22px] text-[#09090b] tracking-tight transition-opacity hover:opacity-85 select-none cursor-pointer"
        aria-label="Botica Nova Salud Inicio"
      >
        <span className="font-black text-[#111827]">NOVA</span>
        <span className="text-[#0d9488] ml-1 font-black">SALUD</span>
      </Link>

      {/* Right Navigation & Action Icons */}
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
        {/* ICONO 1: Acceso Cliente / Mi Cuenta & Pedidos */}
        <Link
          to="/mi-cuenta"
          onClick={closeDropdown}
          title={
            activeClient
              ? `Hola, ${activeClient.name.split(' ')[0]} - Mi Cuenta & Pedidos`
              : 'Iniciar Sesión / Crear Cuenta de Cliente'
          }
          aria-label="Área de Cliente"
          className="relative w-[32px] sm:w-[36px] h-[32px] sm:h-[36px] flex items-center justify-center text-[#18181b] hover:text-[#0d9488] hover:bg-zinc-100/70 rounded-full transition-all duration-200 cursor-pointer overflow-hidden border border-transparent hover:border-teal-200"
        >
          {activeClient?.avatar ? (
            <img
              src={activeClient.avatar}
              alt={activeClient.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-[17px] sm:w-[18px] h-[17px] sm:h-[18px]" strokeWidth={1.8} />
          )}
          {activeClient && (
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#0d9488] ring-2 ring-white"
              title={`Sesión activa: ${activeClient.name}`}
            />
          )}
        </Link>

        {/* ICONO 2: Ingreso al Sistema de Inventario & POS */}
        <Link
          to="/admin/login"
          onClick={closeDropdown}
          title="Ingreso al Sistema de Inventario & POS"
          aria-label="Sistema de Inventario"
          className="w-[32px] sm:w-[36px] h-[32px] sm:h-[36px] flex items-center justify-center text-[#18181b] hover:text-[#0d9488] hover:bg-zinc-100/70 rounded-full transition-all duration-200 cursor-pointer"
        >
          <LogIn className="w-[17px] sm:w-[18px] h-[17px] sm:h-[18px]" strokeWidth={1.8} />
        </Link>

        {/* ICONO 3: Búsqueda Rápida de Productos */}
        <button
          type="button"
          onClick={() => {
            closeDropdown();
            if (onOpenSearch) {
              onOpenSearch();
            } else {
              window.dispatchEvent(new CustomEvent('open-quick-search'));
            }
          }}
          aria-label="Buscar Productos"
          title="Buscar medicamentos y productos"
          className="w-[32px] sm:w-[36px] h-[32px] sm:h-[36px] flex items-center justify-center text-[#18181b] hover:text-[#0d9488] hover:bg-zinc-100/70 rounded-full transition-all duration-200 cursor-pointer"
        >
          <Search className="w-[17px] sm:w-[18px] h-[17px] sm:h-[18px]" strokeWidth={1.8} />
        </button>

        <span className="h-[18px] w-[1px] bg-zinc-200 hidden sm:block" />

        {/* Favorites Heart Icon */}
        <button
          type="button"
          onClick={() => {
            closeDropdown();
            onOpenFavorites();
          }}
          aria-label="Favoritos"
          title="Mis Favoritos"
          className="relative w-[32px] sm:w-[36px] h-[32px] sm:h-[36px] flex items-center justify-center text-[#18181b] hover:text-[#0d9488] hover:bg-zinc-100/70 rounded-full transition-all duration-200 cursor-pointer"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {favoritesCount > 0 && (
            <span
              className="absolute top-[3px] right-[3px] w-[15px] h-[15px] rounded-full bg-[#0d9488] text-white text-[9px] font-bold flex items-center justify-center border border-white"
              title={`${favoritesCount} en favoritos`}
            >
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Cart Icon */}
        <button
          type="button"
          onClick={() => {
            closeDropdown();
            onOpenCart();
          }}
          aria-label="Bolsa de Compras"
          title="Bolsa de Compras"
          className="relative w-[32px] sm:w-[36px] h-[32px] sm:h-[36px] flex items-center justify-center text-[#18181b] hover:text-[#0d9488] hover:bg-zinc-100/70 rounded-full transition-all duration-200 cursor-pointer"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1.5" />
            <circle cx="20" cy="21" r="1.5" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartCount > 0 && (
            <span
              className="absolute top-[3px] right-[3px] w-[15px] h-[15px] rounded-full bg-zinc-950 text-white text-[9px] font-bold flex items-center justify-center border border-white"
              title={`${cartCount} en el carrito`}
            >
              {cartCount}
            </span>
          )}
        </button>

        <span className="hidden lg:block h-[18px] w-[1px] bg-zinc-200" />

        {/* WhatsApp Official CTA Button */}
        <a
          href="https://wa.me/51955545561?text=Hola%20Botica%20Nova%20Salud,%20deseo%20hacer%20un%20pedido%20directo"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-[10px] font-extrabold uppercase tracking-wider rounded-sm hover:bg-[#20ba5a] transition-all shadow-sm"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
          </svg>
          <span>WHATSAPP</span>
        </a>

        <span className="h-[18px] w-[1px] bg-zinc-200 xl:hidden" />

        {/* Menu Drawer Trigger - Only on mobile/tablet (xl:hidden) */}
        <button
          type="button"
          onClick={() => {
            closeDropdown();
            onOpenMenu();
          }}
          className="xl:hidden text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#18181b] hover:text-[#0d9488] transition-colors duration-200 cursor-pointer pl-1"
        >
          MENÚ
        </button>
      </div>

      {/* ======================================================== */}
      {/* DESKTOP HOVER MEGA DROPDOWN PANELS                        */}
      {/* ======================================================== */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
            className="hidden xl:block absolute top-[58px] left-0 right-0 bg-white border border-zinc-200 shadow-2xl rounded-b-md z-40 overflow-hidden"
          >
            {/* 1. Mega Dropdown: CATÁLOGO (Las 6 Categorías Oficiales) */}
            {activeDropdown === 'catalogo' && (
              <div className="max-w-7xl mx-auto px-8 py-7 grid grid-cols-12 gap-8 text-[#18181b]">
                {/* Columna 1: 3 Categorías */}
                <div className="col-span-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
                    <Pill className="w-4 h-4 text-[#0d9488]" />
                    <span className="text-[12px] font-black tracking-wider uppercase text-zinc-950">
                      Salud & Farmacia Ética
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs">
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          closeDropdown();
                          onOpenCatalog('medicamentos');
                        }}
                        className="group flex items-center justify-between w-full text-left py-1 text-zinc-900 hover:text-[#0d9488] transition-colors cursor-pointer"
                      >
                        <div>
                          <span className="font-semibold block group-hover:translate-x-1 transition-transform">
                            Medicamentos & Éticos
                          </span>
                          <span className="text-[11px] text-zinc-400 font-normal">
                            Analgésicos, antibióticos y antigripales
                          </span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-[#0d9488] border border-teal-200 shrink-0">
                          DIGEMID
                        </span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          closeDropdown();
                          onOpenCatalog('cardiovascular');
                        }}
                        className="group flex items-center justify-between w-full text-left py-1 text-zinc-900 hover:text-[#0d9488] transition-colors cursor-pointer"
                      >
                        <div>
                          <span className="font-semibold block group-hover:translate-x-1 transition-transform">
                            Salud Cardiovascular & Crónicos
                          </span>
                          <span className="text-[11px] text-zinc-400 font-normal">
                            Antihipertensivos, diabetes y control
                          </span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 shrink-0">
                          Crónicos
                        </span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          closeDropdown();
                          onOpenCatalog('bienestar-suplementos');
                        }}
                        className="group flex items-center justify-between w-full text-left py-1 text-zinc-900 hover:text-[#0d9488] transition-colors cursor-pointer"
                      >
                        <div>
                          <span className="font-semibold block group-hover:translate-x-1 transition-transform">
                            Bienestar & Suplementos
                          </span>
                          <span className="text-[11px] text-zinc-400 font-normal">
                            Vitaminas, colágeno y defensas
                          </span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                          Vitalidad
                        </span>
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Columna 2: Otras 3 Categorías */}
                <div className="col-span-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
                    <Sparkles className="w-4 h-4 text-[#0d9488]" />
                    <span className="text-[12px] font-black tracking-wider uppercase text-zinc-950">
                      Cuidado & Prevención
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs">
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          closeDropdown();
                          onOpenCatalog('dermocosmetica');
                        }}
                        className="group flex items-center justify-between w-full text-left py-1 text-zinc-900 hover:text-[#0d9488] transition-colors cursor-pointer"
                      >
                        <div>
                          <span className="font-semibold block group-hover:translate-x-1 transition-transform">
                            Dermocosmética Especializada
                          </span>
                          <span className="text-[11px] text-zinc-400 font-normal">
                            Fotoprotección, sérums y cuidado facial
                          </span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200 shrink-0">
                          ISDIN / Eucerin
                        </span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          closeDropdown();
                          onOpenCatalog('pediatria');
                        }}
                        className="group flex items-center justify-between w-full text-left py-1 text-zinc-900 hover:text-[#0d9488] transition-colors cursor-pointer"
                      >
                        <div>
                          <span className="font-semibold block group-hover:translate-x-1 transition-transform">
                            Cuidado Pediátrico & Infantil
                          </span>
                          <span className="text-[11px] text-zinc-400 font-normal">
                            Fórmulas, antipañalitis e higiene infantil
                          </span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                          Infantil
                        </span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          closeDropdown();
                          onOpenCatalog('botiquin');
                        }}
                        className="group flex items-center justify-between w-full text-left py-1 text-zinc-900 hover:text-[#0d9488] transition-colors cursor-pointer"
                      >
                        <div>
                          <span className="font-semibold block group-hover:translate-x-1 transition-transform">
                            Botiquín & Primeros Auxilios
                          </span>
                          <span className="text-[11px] text-zinc-400 font-normal">
                            Gasas, alcohol, apósitos y curaciones
                          </span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Esencial
                        </span>
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Columna 3: Card Ilustrada */}
                <div className="col-span-4 bg-zinc-50 border border-zinc-200/80 p-5 rounded-lg flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d9488] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Garantía Farmacéutica
                    </span>
                    <h4 className="text-sm font-extrabold text-zinc-950 uppercase tracking-tight">
                      Catálogo Integral Nova Salud
                    </h4>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Más de 120 medicamentos y productos certificados con lote verificado y fecha de caducidad visible.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-zinc-200/70 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        closeDropdown();
                        onOpenCatalog('ALL');
                      }}
                      className="w-full py-2 bg-zinc-950 hover:bg-[#0d9488] text-white text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer rounded-sm"
                    >
                      <span>Explorar Todo el Catálogo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        closeDropdown();
                        onOpenQuotation();
                      }}
                      className="w-full py-2 border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-sm text-center"
                    >
                      Cotizar Receta por Foto
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Mega Dropdown: SERVICIOS & TÓPICO (Los 5 Servicios Oficiales) */}
            {activeDropdown === 'servicios' && (
              <div className="max-w-7xl mx-auto px-8 py-7 grid grid-cols-12 gap-8 text-[#18181b]">
                {/* Columna 1: 3 Servicios */}
                <div className="col-span-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
                    <HeartPulse className="w-4 h-4 text-[#0d9488]" />
                    <span className="text-[12px] font-black tracking-wider uppercase text-zinc-950">
                      Monitoreo & Aplicaciones
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs">
                    <li>
                      <button
                        type="button"
                        onClick={() => handleSelectService('presion')}
                        className="group w-full p-2.5 rounded-lg border border-transparent hover:border-zinc-200 hover:bg-zinc-50 transition-all text-left flex items-start justify-between gap-2 cursor-pointer"
                      >
                        <div>
                          <strong className="block text-zinc-900 group-hover:text-[#0d9488] font-bold">
                            Toma de Presión Arterial
                          </strong>
                          <span className="text-[11px] text-zinc-500 line-clamp-1">
                            Tensiómetro Omron y cartilla de control
                          </span>
                        </div>
                        <span className="text-xs font-black text-[#0d9488] bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shrink-0">
                          S/ 2.00
                        </span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => handleSelectService('glucosa')}
                        className="group w-full p-2.5 rounded-lg border border-transparent hover:border-zinc-200 hover:bg-zinc-50 transition-all text-left flex items-start justify-between gap-2 cursor-pointer"
                      >
                        <div>
                          <strong className="block text-zinc-900 group-hover:text-[#0d9488] font-bold">
                            Medición de Glucosa Capilar
                          </strong>
                          <span className="text-[11px] text-zinc-500 line-clamp-1">
                            Accu-Chek Guide, descartable estéril
                          </span>
                        </div>
                        <span className="text-xs font-black text-[#0d9488] bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shrink-0">
                          S/ 5.00
                        </span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => handleSelectService('inyectable')}
                        className="group w-full p-2.5 rounded-lg border border-transparent hover:border-zinc-200 hover:bg-zinc-50 transition-all text-left flex items-start justify-between gap-2 cursor-pointer"
                      >
                        <div>
                          <strong className="block text-zinc-900 group-hover:text-[#0d9488] font-bold">
                            Aplicación de Inyectables
                          </strong>
                          <span className="text-[11px] text-zinc-500 line-clamp-1">
                            Intramuscular/subcutánea (con receta)
                          </span>
                        </div>
                        <span className="text-xs font-black text-[#0d9488] bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shrink-0">
                          S/ 8.00
                        </span>
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Columna 2: Otros 2 Servicios + Protocolo */}
                <div className="col-span-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
                    <Stethoscope className="w-4 h-4 text-[#0d9488]" />
                    <span className="text-[12px] font-black tracking-wider uppercase text-zinc-950">
                      Curaciones & Asesoría CQFP
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs">
                    <li>
                      <button
                        type="button"
                        onClick={() => handleSelectService('curacion')}
                        className="group w-full p-2.5 rounded-lg border border-transparent hover:border-zinc-200 hover:bg-zinc-50 transition-all text-left flex items-start justify-between gap-2 cursor-pointer"
                      >
                        <div>
                          <strong className="block text-zinc-900 group-hover:text-[#0d9488] font-bold">
                            Curación Menor & Tópico
                          </strong>
                          <span className="text-[11px] text-zinc-500 line-clamp-1">
                            Limpieza antiséptica, apósito y gasas
                          </span>
                        </div>
                        <span className="text-xs font-black text-[#0d9488] bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shrink-0">
                          S/ 12.00
                        </span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => handleSelectService('asesoria')}
                        className="group w-full p-2.5 rounded-lg border border-transparent hover:border-zinc-200 hover:bg-zinc-50 transition-all text-left flex items-start justify-between gap-2 cursor-pointer"
                      >
                        <div>
                          <strong className="block text-zinc-900 group-hover:text-[#0d9488] font-bold">
                            Atención Farmacéutica & Asesoría CQFP
                          </strong>
                          <span className="text-[11px] text-zinc-500 line-clamp-1">
                            Revisión de posología e interacciones
                          </span>
                        </div>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                          Gratuito
                        </span>
                      </button>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-600 flex items-start gap-2">
                      <Clock className="w-4 h-4 text-[#0d9488] shrink-0 mt-0.5" />
                      <span>
                        <strong>Horario de Tópico:</strong> Lunes a Sábado de 7:00 am a 11:00 pm • Domingos de 8:00 am a 9:00 pm.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Columna 3: Card Ilustrada */}
                <div className="col-span-4 bg-zinc-50 border border-zinc-200/80 p-5 rounded-lg flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d9488] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Tópico In Situ
                    </span>
                    <h4 className="text-sm font-extrabold text-zinc-950 uppercase tracking-tight">
                      Atención con Rigor Sanitario y Calidez
                    </h4>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Ambiente higiénico con esterilización permanente y personal farmacéutico titulado.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-zinc-200/70">
                    <button
                      type="button"
                      onClick={() => handleSelectService('presion')}
                      className="w-full py-2.5 bg-zinc-950 hover:bg-[#0d9488] text-white text-[11px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer rounded-sm"
                    >
                      Agendar Cita en Tópico →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Mega Dropdown: NOSOTROS (Historia, Mapa de Sede & Libro de Reclamaciones) */}
            {activeDropdown === 'nosotros' && (
              <div className="max-w-7xl mx-auto px-8 py-7 grid grid-cols-12 gap-8 text-[#18181b]">
                {/* Columna 1: Historia & Ética */}
                <div className="col-span-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
                    <ShieldCheck className="w-4 h-4 text-[#0d9488]" />
                    <span className="text-[12px] font-black tracking-wider uppercase text-zinc-950">
                      Nuestra Identidad
                    </span>
                  </div>
                  <div className="space-y-3 text-xs text-zinc-700">
                    <p className="leading-relaxed">
                      <strong>Botica Nova Salud</strong> nació en Juliaca con la vocación de brindar dispensación ética y orientación farmacéutica responsable.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488] shrink-0" />
                        <span>Medicamentos 100% certificados por DIGEMID</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488] shrink-0" />
                        <span>Químicos Farmacéuticos Colegiados en turno</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488] shrink-0" />
                        <span>Cadena de frío y control de humedad (BPA/BPD)</span>
                      </li>
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        closeDropdown();
                        onOpenBrand('historia');
                      }}
                      className="text-xs font-bold text-[#0d9488] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      <span>Leer Historia Completa</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Columna 2: Dónde Ubicarnos & Horarios */}
                <div className="col-span-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
                    <MapPin className="w-4 h-4 text-[#0d9488]" />
                    <span className="text-[12px] font-black tracking-wider uppercase text-zinc-950">
                      Dónde Ubicarnos (Sede Juliaca)
                    </span>
                  </div>
                  <div className="space-y-3 text-xs text-zinc-700">
                    <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                        <Navigation className="w-3.5 h-3.5 text-[#0d9488]" />
                        <span>Jr. Mariano Núñez 485, Juliaca</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-snug">
                        A 2 cuadras de la Plaza de Armas. Con rampa de acceso y fácil estacionamiento.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#0d9488] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-zinc-900 block">Horario de Atención:</strong>
                        <span className="text-zinc-500">Lun - Sáb: 7:00 am - 11:00 pm • Dom: 8:00 am - 9:00 pm</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectLocation}
                      className="w-full py-2 bg-teal-50 hover:bg-teal-100 text-[#0d9488] border border-teal-200 text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Ver Sede y Mapa Interactivo</span>
                    </button>
                  </div>
                </div>

                {/* Columna 3: Atención, Delivery & Libro de Reclamaciones */}
                <div className="col-span-4 bg-zinc-50 border border-zinc-200/80 p-5 rounded-lg flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d9488] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Atención al Paciente
                    </span>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-black text-zinc-950">
                        <Phone className="w-4 h-4 text-[#0d9488]" />
                        <span>+51 955 545 561</span>
                      </div>
                      <span className="text-[11px] text-zinc-500 block mt-0.5">
                        WhatsApp y central de pedidos inmediatos
                      </span>
                    </div>
                    <div className="text-xs text-zinc-600 space-y-1">
                      <p>• Delivery Express a todo Juliaca y San Román</p>
                      <p>• Retiro presencial sin costo en botica</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-200/70">
                    <button
                      type="button"
                      onClick={handleSelectReclamaciones}
                      className="w-full py-2 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 text-[11px] font-extrabold uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#0d9488]" />
                      <span>Libro de Reclamaciones Virtual</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
