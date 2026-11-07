"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Receipt,
  Boxes,
  ArrowLeft
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { notificarExito, notificarError, notificarAdvertencia } from "../../utils/alertaSweet.js";

const images = [
  "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
];

const prompts = [
  "dispensacion: Consulta y validación de 120 fármacos en catálogo, stock físico en tiempo real y emisión de comprobantes autorizados con kardex automático.",
  "vigilancia-digemid: Trazabilidad sanitaria por lote y fecha de vencimiento. Semáforo inteligente de rotación FIFO/FEFO sin mermas ni medicamentos caducados.",
  "inventario-valorizado: Control de 5,005 unidades físicas valorizadas a costo y venta en anaqueles, auditoría física continua y registro de kardex multiproducto.",
  "seguridad-farmaceutica: Control de acceso por roles criptográficos (Administrador Q.F., Cajero POS y Almacenero) con auditoría y trazabilidad en tiempo real.",
];

export interface AuthSectionTwoProps {
  onSuccess?: (user: any) => void;
}

export default function AuthSectionTwo({ onSuccess }: AuthSectionTwoProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 2800);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="h-screen max-h-screen w-full bg-white dark:bg-[#050505] p-2.5 sm:p-3.5 lg:p-4 text-black dark:text-white antialiased font-sans overflow-hidden">
      <div className="grid h-full max-h-full w-full gap-4 lg:gap-6 lg:grid-cols-[0.9fr_1.1fr] overflow-hidden items-stretch">
        {/* Lado Izquierdo: Showcase Gráfico con Focos Interactivos y Prompts Operativos */}
        <div className="hidden lg:flex h-full max-h-full rounded-2xl bg-black px-6 py-5 xl:px-8 xl:py-6 text-white flex-col justify-between items-center overflow-hidden border border-neutral-900 shadow-2xl relative">
          {/* Cabecera con Logotipo Oficial Nova Salud */}
          <div className="flex items-center gap-2.5 text-base font-black tracking-tight text-white shrink-0">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-white/10 p-1 border border-white/20 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src="/logo-ns-white.png"
                alt="Nova Salud"
                className="w-full h-full object-contain"
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = "/logo-ns.png";
                }}
              />
            </div>
            <span>NOVA SALUD</span>
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/15 text-white/90 border border-white/20">
              SISTEMA OPERATIVO
            </span>
          </div>

          {/* Mosaico de Imágenes con Animación de Enfoque */}
          <div className="relative my-auto grid w-full max-w-[420px] grid-cols-[1.55fr_1fr] gap-2 rounded-md shrink-0">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-black to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-black to-transparent" />
            <ImageTile
              src={images[0]}
              active={activeIndex === 0}
              className="row-span-2 h-[200px] xl:h-[220px]"
              alt="Dispensario farmacéutico Nova Salud"
            />
            <ImageTile
              src={images[1]}
              active={activeIndex === 1}
              className="h-[96px] xl:h-[106px]"
              alt="Atención y consulta farmacéutica"
            />
            <ImageTile
              src={images[3]}
              active={activeIndex === 3}
              className="h-[96px] xl:h-[106px]"
              alt="Fármacos y cápsulas éticas"
            />
            <ImageTile
              src={images[2]}
              active={activeIndex === 2}
              className="col-span-2 h-[96px] xl:h-[106px]"
              alt="Control de calidad de laboratorio"
            />
          </div>

          {/* Cuadro de Prompt Operativo */}
          <div className="w-full max-w-[420px] rounded-xl border border-dashed border-white/20 bg-white/[0.04] px-4 py-2.5 backdrop-blur-xs shrink-0">
            <div className="flex items-end gap-3">
              <p className="line-clamp-3 flex-1 text-[11px] leading-relaxed text-white/70">
                <span className="font-bold text-white uppercase tracking-wider">/operacion</span>{" "}
                {prompts[activeIndex]}
              </p>
              <button
                type="button"
                onClick={() => setActiveIndex((current) => (current + 1) % images.length)}
                className="grid size-7 shrink-0 place-items-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 cursor-pointer"
                title="Siguiente módulo"
              >
                <ArrowRight className="size-3.5 stroke-[1.75]" />
              </button>
            </div>
          </div>

          <p className="text-center text-xs xl:text-sm font-semibold text-white/80 max-w-[320px] shrink-0 mt-2">
            Plataforma integral para gestión farmacéutica y dispensación ética
          </p>

          {/* Puntos del Carousel */}
          <div className="flex gap-1.5 pt-2 shrink-0">
            {prompts.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`transition-all duration-300 cursor-pointer ${
                  activeIndex === index
                    ? "h-1 w-8 rounded-full bg-white"
                    : "h-1 w-3 rounded-full bg-white/35 hover:bg-white/60"
                }`}
                aria-label={`Ver módulo ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Lado Derecho: Formulario de Autenticación sin necesidad de scroll */}
        <div className="h-full max-h-full flex flex-col justify-center items-center px-4 sm:px-8 lg:px-10 xl:px-14 overflow-hidden">
          <AuthForm onSuccess={onSuccess} />
        </div>
      </div>
    </section>
  );
}

function ImageTile({
  src,
  active,
  className,
  alt = "Fotografía de operaciones farmacéuticas"
}: {
  src: string;
  active: boolean;
  className: string;
  alt?: string;
}) {
  return (
    <div
      className={`${className} relative overflow-visible rounded-md ${active ? "z-10" : "z-0"}`}
    >
      <img
        src={src}
        alt={alt}
        className={`h-full w-full rounded-md object-cover transition-opacity duration-700 ${active ? "opacity-100" : "opacity-35"}`}
      />
      <FocusCorners active={active} />
    </div>
  );
}

function FocusCorners({ active }: { active: boolean }) {
  const baseClass = `pointer-events-none absolute h-3.5 w-3.5 border-white/80 transition-all duration-500 ease-out ${active ? "translate-x-0 translate-y-0 opacity-100" : "opacity-0"}`;

  return (
    <>
      <div
        className={`${baseClass} -left-1.5 -top-1.5 border-l-2 border-t-2 ${active ? "" : "-translate-x-1.5 -translate-y-1.5"}`}
      />
      <div
        className={`${baseClass} -right-1.5 -top-1.5 border-r-2 border-t-2 ${active ? "" : "translate-x-1.5 -translate-y-1.5"}`}
      />
      <div
        className={`${baseClass} -bottom-1.5 -left-1.5 border-b-2 border-l-2 ${active ? "" : "-translate-x-1.5 translate-y-1.5"}`}
      />
      <div
        className={`${baseClass} -bottom-1.5 -right-1.5 border-b-2 border-r-2 ${active ? "" : "translate-x-1.5 translate-y-1.5"}`}
      />
    </>
  );
}

function AuthForm({ onSuccess }: { onSuccess?: (user: any) => void }) {
  const [email, setEmail] = useState("admin@novasalud.com");
  const [password, setPassword] = useState("Admin123!");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  const { login, usuario, cargando: cargandoAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const obtenerDestinoPorRol = (rol: string, requestedPath?: string) => {
    const defaultPath = "/app/dashboard";

    if (!requestedPath || typeof requestedPath !== "string" || !requestedPath.startsWith("/app/")) {
      return defaultPath;
    }

    if (rol === "ADMIN") return requestedPath;

    if (rol === "CAJERO") {
      if (
        requestedPath.startsWith("/app/dashboard") ||
        requestedPath.startsWith("/app/pos") ||
        requestedPath.startsWith("/app/ventas") ||
        requestedPath.startsWith("/app/inventario")
      ) {
        return requestedPath;
      }
      return "/app/dashboard";
    }

    if (rol === "ALMACEN") {
      if (
        requestedPath.startsWith("/app/dashboard") ||
        requestedPath.startsWith("/app/inventario") ||
        requestedPath.startsWith("/app/alertas")
      ) {
        return requestedPath;
      }
      return "/app/dashboard";
    }

    return defaultPath;
  };

  useEffect(() => {
    if (!cargandoAuth && usuario) {
      const destino = obtenerDestinoPorRol(usuario.rol, (location.state as any)?.from?.pathname);
      navigate(destino, { replace: true });
    }
  }, [usuario, cargandoAuth, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      notificarAdvertencia("Campos Requeridos", "Por favor complete su correo y contraseña.");
      return;
    }

    setCargando(true);
    try {
      const data = await login({ email: email.trim(), password });
      await notificarExito("¡Acceso Concedido!", `Bienvenido(a), ${data.usuario.nombre}`);
      if (onSuccess) onSuccess(data.usuario);
      const destino = obtenerDestinoPorRol(data.usuario.rol, (location.state as any)?.from?.pathname);
      navigate(destino, { replace: true });
    } catch (err: any) {
      const mensaje = err.response?.data?.error || "Error al iniciar sesión. Verifique sus credenciales.";
      notificarError("Error de Autenticación", mensaje);
    } finally {
      setCargando(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string, rolNombre: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    if ((location.state as any)?.from) {
      try {
        delete (location.state as any).from;
      } catch {
        // noop
      }
    }
    notificarExito("Credenciales Demo", `Acceso preparado para ${rolNombre}`);
  };

  return (
    <div className="w-full max-w-[430px] my-auto">
      {/* Botón de Retorno a Tienda Pública */}
      <div className="mb-3.5 flex items-center justify-start">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>Volver a la Tienda Pública</span>
        </Link>
      </div>

      <div className="text-left mb-4">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
          Iniciar Sesión
        </h1>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Ingrese sus credenciales para acceder a la gestión de Botica Nova Salud.
        </p>
      </div>

      {/* Selector Rápido de Roles con Iconos de Solo Bordes (Stroke Puro, Sin Relleno) */}
      <div className="space-y-1.5 mb-3.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
          <ShieldCheck className="w-3.5 h-3.5 stroke-[1.75] text-black dark:text-white" />
          <span>Acceso Rápido por Rol:</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleFillDemo("admin@novasalud.com", "Admin123!", "Administrador")}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-black dark:hover:border-white text-left transition cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[1.75] text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white shrink-0" />
              <span className="block text-[11px] font-bold text-neutral-900 dark:text-white truncate">
                Admin Q.F.
              </span>
            </div>
            <span className="block text-[9px] text-neutral-500 font-mono truncate mt-0.5">admin@</span>
          </button>

          <button
            type="button"
            onClick={() => handleFillDemo("cajero@novasalud.com", "Cajero123!", "Cajero POS")}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-black dark:hover:border-white text-left transition cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 stroke-[1.75] text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white shrink-0" />
              <span className="block text-[11px] font-bold text-neutral-900 dark:text-white truncate">
                Cajero POS
              </span>
            </div>
            <span className="block text-[9px] text-neutral-500 font-mono truncate mt-0.5">cajero@</span>
          </button>

          <button
            type="button"
            onClick={() => handleFillDemo("almacen@novasalud.com", "Almacen123!", "Almacén & Kardex")}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-black dark:hover:border-white text-left transition cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 stroke-[1.75] text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white shrink-0" />
              <span className="block text-[11px] font-bold text-neutral-900 dark:text-white truncate">
                Almacén
              </span>
            </div>
            <span className="block text-[9px] text-neutral-500 font-mono truncate mt-0.5">almacen@</span>
          </button>
        </div>
      </div>

      <div className="my-3 flex items-center gap-3 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">
        <div className="h-px flex-1 bg-neutral-200 dark:border-neutral-800" />
        o ingresa manualmente
        <div className="h-px flex-1 bg-neutral-200 dark:border-neutral-800" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-left">
        {/* Campo Correo */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Correo Institucional
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 stroke-[1.75] absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@novasalud.com"
              disabled={cargando}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition text-xs font-medium"
            />
          </div>
        </div>

        {/* Campo Contraseña */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 stroke-[1.75] absolute left-3 top-2.5 text-neutral-400" />
            <input
              type={mostrarPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={cargando}
              className="w-full pl-9 pr-9 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition text-xs font-mono"
            />
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="absolute right-3 top-2.5 text-neutral-400 hover:text-black dark:hover:text-white transition cursor-pointer"
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {mostrarPassword ? (
                <EyeOff className="w-4 h-4 stroke-[1.75]" />
              ) : (
                <Eye className="w-4 h-4 stroke-[1.75]" />
              )}
            </button>
          </div>
        </div>

        <div className="pt-1 text-[11px] leading-snug text-neutral-500 dark:text-neutral-400">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-neutral-300 dark:border-neutral-700 text-black focus:ring-black dark:focus:ring-white"
            />
            <span>Recordar sesión activa en este equipo</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
        >
          {cargando ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-3.5 stroke-[1.75] animate-spin" />
              <span>Verificando credenciales...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>Ingresar al Sistema Operativo</span>
              <ArrowRight className="size-3.5 stroke-[1.75]" />
            </span>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-[10px] text-neutral-400">
        © 2026 Botica Nova Salud E.I.R.L. · Sistema protegido con encriptación JWT
      </p>
    </div>
  );
}
