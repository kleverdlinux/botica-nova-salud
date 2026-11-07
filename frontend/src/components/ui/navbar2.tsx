"use client";

import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Languages, Menu, X, ShoppingBag, LogIn, Pill, Stethoscope, HeartPulse } from "lucide-react";
import {
  FaXTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaThreads,
  FaWhatsapp,
} from "react-icons/fa6";
import { useCart, CartState } from "@/hooks/useCart";
import { RandomLetterSwap } from "@/components/ui/random-letter-swap";

export type MegaColumn = {
  eyebrow: string;
  links: { label: string; href: string; active?: boolean; badge?: string; desc?: string }[];
};

export type MegaMenu = {
  columns: MegaColumn[];
  footerLinks?: { label: string; href: string }[];
  showSocials?: boolean;
  image: { src: string; alt: string };
  imageCaption?: string;
};

const CATALOGO_MENU: MegaMenu = {
  columns: [
    {
      eyebrow: "Medicamentos & Salud",
      links: [
        { label: "Medicamentos & Farmacia Ética", href: "/products?collection=medicamentos", active: true, badge: "DIGEMID" },
        { label: "Salud Cardiovascular & Crónicos", href: "/products?collection=cardiovascular" },
        { label: "Bienestar, Vitaminas & Suplementos", href: "/products?collection=bienestar-suplementos", badge: "Vitalidad" },
      ],
    },
    {
      eyebrow: "Cuidado Personal & Especializado",
      links: [
        { label: "Dermocosmética & Cuidado Personal", href: "/products?collection=dermocosmetica", badge: "Líderes" },
        { label: "Cuidado Pediátrico & Infantil", href: "/products?collection=pediatria" },
        { label: "Botiquín & Primeros Auxilios", href: "/products?collection=botiquin", badge: "Emergencias" },
      ],
    },
  ],
  footerLinks: [
    { label: "Ver todo el catálogo (120+ medicamentos en stock)", href: "/products" },
    { label: "Consultar medicamentos por WhatsApp", href: "https://wa.me/51955545561" },
    { label: "Recepción de Receta Médica DIGEMID", href: "/about" },
  ],
  showSocials: true,
  image: {
    src: "/media/botica-hero-clean.jpg",
    alt: "Farmacia Nova Salud",
  },
  imageCaption: "Garantía de calidad y procedencia DIGEMID",
};

const SERVICIOS_MENU: MegaMenu = {
  columns: [
    {
      eyebrow: "Atención Farmacéutica",
      links: [
        { label: "Orientación en Medicación", href: "/#services", active: true, badge: "Gratis" },
        { label: "Toma de Presión Arterial", href: "/#services" },
        { label: "Control de Glucosa Capilar", href: "/#services" },
        { label: "Inyectables & Curaciones", href: "/#services" },
      ],
    },
    {
      eyebrow: "Servicios Digitales",
      links: [
        { label: "Envío a Domicilio Express", href: "/#services", badge: "30-45 min" },
        { label: "Recepción de Receta Digital", href: "/#services" },
        { label: "Convenios Corporativos y Seguros", href: "/#services" },
      ],
    },
  ],
  footerLinks: [
    { label: "Conoce nuestro equipo de Químicos Farmacéuticos", href: "/about" },
    { label: "Horarios de atención continuada", href: "/#about" },
  ],
  showSocials: true,
  image: {
    src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
    alt: "Atención Farmacéutica Profesional",
  },
  imageCaption: "Atención por Químicos Farmacéuticos colegiados",
};

const NOSOTROS_MENU: MegaMenu = {
  columns: [
    {
      eyebrow: "Nuestra Botica",
      links: [
        { label: "Sobre Botica Nova Salud", href: "/about", active: true },
        { label: "Certificaciones y Registro Sanitario", href: "/about", badge: "DIGEMID" },
        { label: "Compromiso con la Comunidad", href: "/about" },
      ],
    },
    {
      eyebrow: "Ayuda & Contacto",
      links: [
        { label: "Preguntas Frecuentes (FAQ)", href: "/#about" },
        { label: "Sedes y Horarios de Atención", href: "/#about" },
        { label: "Libro de Reclamaciones", href: "/about" },
        { label: "Atención al Cliente WhatsApp", href: "https://wa.me/51955545561" },
      ],
    },
  ],
  footerLinks: [
    { label: "Términos y condiciones de compra", href: "/about" },
    { label: "Política de privacidad de datos", href: "/about" },
  ],
  showSocials: true,
  image: {
    src: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80",
    alt: "Sede Nova Salud",
  },
  imageCaption: "Cuidando la salud de tu familia con vocación",
};

export const MEGA_MENUS: Record<string, MegaMenu> = {
  "Catálogo": CATALOGO_MENU,
  "Servicios": SERVICIOS_MENU,
  "Nosotros": NOSOTROS_MENU,
};

export interface NavItem {
  label: string;
  hasMenu: boolean;
  href?: string;
  icon?: any;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Inicio", hasMenu: false, href: "/" },
  { label: "Catálogo", hasMenu: true, icon: Pill, href: "/products" },
  { label: "Servicios", hasMenu: true, icon: Stethoscope, href: "/#services" },
  { label: "Nosotros", hasMenu: true, icon: HeartPulse, href: "/about" },
] as const;

export const LANGUAGES = [
  { code: "ES", label: "Español" },
  { code: "EN", label: "English" },
  { code: "QUE", label: "Quechua" },
] as const;

export const SOCIALS = [
  { href: "https://wa.me/51955545561", label: "WhatsApp", icon: FaWhatsapp },
  { href: "#", label: "Instagram", icon: FaInstagram },
  { href: "#", label: "LinkedIn", icon: FaLinkedin },
  { href: "#", label: "YouTube", icon: FaYoutube },
  { href: "#", label: "X", icon: FaXTwitter },
];

export default function Navbar2() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>(LANGUAGES[0]);
  const langRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close menus when route changes
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setLangOpen(false);
  }, [location.pathname]);

  // Cart item count
  const cartItemCount = useCart((state: CartState) => state.getItemCount());

  // Mouse hover timer debounce so menu doesn't close abruptly
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (label: string, hasMenu: boolean) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (hasMenu) {
      setLangOpen(false);
      setOpenMenu(label);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 180);
  };

  const toggleMenu = (label: string, hasMenu: boolean) => {
    if (!hasMenu) {
      setOpenMenu(null);
      return;
    }
    setLangOpen(false);
    setOpenMenu((current) => (current === label ? null : label));
  };

  // Close the language dropdown on outside click
  useEffect(() => {
    if (!langOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [langOpen]);

  const activeMenu = openMenu ? MEGA_MENUS[openMenu] : null;

  return (
    <header className="fixed top-3 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
      <div className="w-full max-w-7xl pointer-events-auto">
        <motion.div
          layout
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onMouseLeave={handleMouseLeave}
          className="overflow-hidden rounded-2xl md:rounded-3xl border border-white/80 dark:border-white/50 bg-white/75 dark:bg-white/85 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_12px_36px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.95)] ring-1 ring-white/70 transition-all"
        >
          {/* Top row */}
          <div className="flex items-center justify-between gap-2 md:gap-4 px-4 py-3 md:px-7 md:py-3.5">
            {/* Logo */}
            <Link
              to="/"
              className="flex shrink-0 items-center group transition-transform hover:scale-[1.02]"
            >
              <div className="flex flex-col leading-none">
                <span className="text-[1.15rem] md:text-[1.25rem] font-bold tracking-tight text-zinc-950">
                  NOVA SALUD
                </span>
                <span className="text-[9px] font-medium tracking-[0.22em] uppercase text-zinc-600 mt-0.5">
                  BOTICA & BIENESTAR
                </span>
              </div>
            </Link>

            {/* Desktop nav with automatic hover & click support */}
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_ITEMS.map((item) => {
                const isOpen = openMenu === item.label;
                const isCurrent = location.pathname === item.href;

                if (!item.hasMenu) {
                  return (
                    <Link
                      key={item.label}
                      to={item.href ?? "#"}
                      onMouseEnter={() => {
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                        setOpenMenu(null);
                      }}
                      onClick={() => toggleMenu(item.label, false)}
                      className={`rounded-full px-3.5 py-1.5 text-[14px] font-semibold transition-all ${
                        isCurrent
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                          : "text-zinc-900 dark:text-zinc-100 hover:bg-white/40 dark:hover:bg-white/10"
                      }`}
                    >
                      <RandomLetterSwap label={item.label} staggerDuration={0.02} transition={{ duration: 0.5, type: "spring" }} />
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.label}
                    type="button"
                    onMouseEnter={() => handleMouseEnter(item.label, item.hasMenu)}
                    onClick={() => toggleMenu(item.label, item.hasMenu)}
                    aria-expanded={isOpen}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[14px] font-semibold transition-all ${
                      isOpen
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                        : "text-zinc-900 dark:text-zinc-100 hover:bg-white/40 dark:hover:bg-white/10"
                    }`}
                  >
                    <RandomLetterSwap label={item.label} staggerDuration={0.02} transition={{ duration: 0.5, type: "spring" }} />
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
              {/* Language switcher */}
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    setLangOpen((v) => !v);
                  }}
                  aria-expanded={langOpen}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                    langOpen
                      ? "bg-white/60 text-zinc-900 dark:bg-zinc-800 dark:text-white shadow-sm"
                      : "text-zinc-800 dark:text-zinc-200 hover:bg-white/40 dark:hover:bg-white/10"
                  }`}
                >
                  <Languages className="h-3.5 w-3.5" />
                  {language.code}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-300 ${
                      langOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg p-1.5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)]"
                    >
                      {LANGUAGES.map((lng) => (
                        <button
                          key={lng.code}
                          type="button"
                          onClick={() => {
                            setLanguage(lng);
                            setLangOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <span>
                            {lng.label}{" "}
                            <span className="text-zinc-400">({lng.code})</span>
                          </span>
                          {lng.code === language.code && (
                            <Check className="h-3.5 w-3.5 text-zinc-900 dark:text-white" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart Button (Icon only with badge) */}
              <Link
                to="/cart"
                title="Ver carrito de compras"
                aria-label="Carrito"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/60 dark:border-white/20 bg-white/40 dark:bg-white/10 backdrop-blur-md text-zinc-900 dark:text-white transition-all hover:bg-white/70 dark:hover:bg-white/20 hover:scale-105 shadow-sm"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 dark:bg-white px-1 text-[10px] font-bold text-white dark:text-zinc-950 shadow-sm">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Sistema POS Access Button (Icon only) */}
              <Link
                to="/app/pos"
                title="Ingresar al Sistema POS"
                aria-label="Ingresar al Sistema POS"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 shadow-md transition-all hover:scale-105 border border-white/20"
              >
                <LogIn className="h-4 w-4" />
              </Link>
            </div>

            {/* Mobile Actions: Cart + POS + Trigger */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <Link
                to="/cart"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-800 dark:text-zinc-200 hover:bg-white/40 dark:hover:bg-white/10"
                aria-label="Carrito"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 dark:bg-white px-1 text-[9px] font-bold text-white dark:text-zinc-950">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              <Link
                to="/app/pos"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                aria-label="Ingresar al Sistema POS"
                title="Ingresar al Sistema POS"
              >
                <LogIn className="h-4 w-4" />
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-800 dark:text-zinc-100 hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
                aria-label="Abrir menú"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Desktop mega dropdown — with smooth auto-expand hover support */}
          <AnimatePresence initial={false}>
            {activeMenu && (
              <motion.div
                key={openMenu}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => {
                  if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                }}
                onMouseLeave={handleMouseLeave}
                className="hidden overflow-hidden border-t border-white/60 dark:border-white/30 bg-white/80 dark:bg-white/90 backdrop-blur-2xl lg:block"
              >
                <div className="grid grid-cols-[1fr_1fr_auto] gap-8 px-8 pb-7 pt-5">
                  {activeMenu.columns.map((col, colIdx) => (
                    <div key={col.eyebrow} className="flex flex-col gap-4">
                      <span className="w-fit rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1 text-[11px] font-semibold tracking-wide uppercase text-zinc-900 dark:text-zinc-100">
                        {col.eyebrow}
                      </span>
                      <ul className="flex flex-col gap-3">
                        {col.links.map((link) => (
                          <li key={link.label}>
                            <Link
                              to={link.href}
                              className={`group flex items-center gap-2 text-[15px] font-medium text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors ${
                                link.active ? "font-semibold text-zinc-950 dark:text-white" : ""
                              }`}
                            >
                              <span className="group-hover:translate-x-0.5 transition-transform">
                                {link.label}
                              </span>
                              {link.badge && (
                                <span className="rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors">
                                  {link.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>

                      {/* Footer links under column */}
                      {colIdx === activeMenu.columns.length - 1 && activeMenu.footerLinks && (
                        <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                          {activeMenu.footerLinks.map((item) => (
                            <Link
                              key={item.label}
                              to={item.href}
                              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
                            >
                              <span>→</span> {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Preview Image Card with Glass Accent */}
                  <div className="relative hidden h-64 w-80 flex-col justify-end overflow-hidden rounded-2xl md:flex shadow-md border border-white/20">
                    <img
                      src={activeMenu.image.src}
                      alt={activeMenu.image.alt}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="relative z-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-10">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                        Nova Salud Express
                      </p>
                      {activeMenu.imageCaption && (
                        <p className="text-sm font-medium text-white leading-snug">
                          {activeMenu.imageCaption}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Socials row */}
                {activeMenu.showSocials && (
                  <div className="flex items-center justify-between border-t border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/15 px-8 py-3">
                    <span className="text-xs text-zinc-500">
                      ¿Necesitas ayuda inmediata? Escríbenos a nuestro canal oficial:
                    </span>
                    <div className="flex items-center gap-4">
                      {SOCIALS.map(({ href, label, icon: Icon }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={label}
                          className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile panel */}
          <AnimatePresence initial={false}>
            {mobileOpen && (
              <motion.div
                key="mobile-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="overflow-hidden border-t border-white/60 dark:border-white/30 bg-white/85 dark:bg-white/90 backdrop-blur-2xl lg:hidden"
              >
                <div className="flex flex-col gap-1 px-5 pb-6 pt-3">
                  {NAV_ITEMS.map((item) =>
                    item.hasMenu ? (
                      <div key={item.label} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => toggleMenu(item.label, true)}
                          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80"
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              openMenu === item.label ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {openMenu === item.label && (
                          <div className="ml-3 my-1 flex flex-col gap-2 border-l-2 border-zinc-300 dark:border-zinc-700 pl-3 py-1">
                            {MEGA_MENUS[item.label]?.columns.flatMap((c) =>
                              c.links.map((link) => (
                                <Link
                                  key={link.label}
                                  to={link.href}
                                  className="flex items-center justify-between py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                                >
                                  <span>{link.label}</span>
                                  {link.badge && (
                                    <span className="rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 px-1.5 py-0.5 text-[9px] font-bold">
                                      {link.badge}
                                    </span>
                                  )}
                                </Link>
                              )),
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        key={item.label}
                        to={item.href ?? "#"}
                        className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80"
                      >
                        {item.label}
                      </Link>
                    ),
                  )}

                  <div className="mt-4 flex flex-col gap-2.5 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                    <Link
                      to="/app/pos"
                      className="flex items-center justify-center gap-2 rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-white dark:text-zinc-950 shadow-sm transition-all"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Ingresar a Sistema POS</span>
                    </Link>
                    <Link
                      to="/cart"
                      className="flex items-center justify-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/40 dark:bg-zinc-900 px-4 py-2 text-center text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all hover:bg-white/60 dark:hover:bg-zinc-800"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Ver Carrito ({cartItemCount})</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </header>
  );
}
