import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  MessageCircle,
  Pill,
  HeartPulse,
  MapPin,
  FileText,
  Clock,
  Phone,
  ShieldCheck,
  ChevronRight,
  Stethoscope,
  User,
  LogIn,
} from 'lucide-react';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuotation: () => void;
  onOpenCatalog: (category?: string) => void;
  onOpenBuilder?: () => void;
  onOpenServices?: (serviceId?: string) => void;
  onOpenBrand: (tab?: 'historia' | 'mapa') => void;
  onOpenQuickOrder?: () => void;
  onOpenAllArticles?: () => void;
  onOpenReclamaciones?: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onOpenQuotation,
  onOpenCatalog,
  onOpenBuilder,
  onOpenServices,
  onOpenBrand,
  onOpenReclamaciones,
}) => {
  if (!isOpen) return null;

  const handleSelectService = (id: string) => {
    onClose();
    if (onOpenServices) onOpenServices(id);
    else if (onOpenBuilder) onOpenBuilder();
    else window.dispatchEvent(new CustomEvent('open-services', { detail: { serviceId: id } }));
  };

  const handleSelectLocation = () => {
    onClose();
    onOpenBrand('mapa');
  };

  const handleSelectReclamaciones = () => {
    onClose();
    if (onOpenReclamaciones) onOpenReclamaciones();
    else window.dispatchEvent(new CustomEvent('open-reclamaciones'));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white p-4 sm:p-8 md:p-12 animate-in fade-in duration-200">
      <div className="min-h-full max-w-7xl mx-auto flex flex-col justify-between">
        {/* Top Bar with Close */}
        <div className="w-full flex items-center justify-between border-b border-zinc-200 pb-4 sm:pb-6">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950">
            NOVA<span className="text-[#0d9488] ml-1">SALUD</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-extrabold tracking-widest text-[#0d9488] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            Farmacia Ética
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xs font-black uppercase tracking-wider text-zinc-800 transition-colors cursor-pointer"
          aria-label="Cerrar menú"
        >
          <span>Cerrar</span>
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto w-full py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Columna 1: Accesos Principales */}
        <div className="lg:col-span-4 space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#0d9488] block mb-2">
            Navegación Principal
          </span>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCatalog('ALL');
              }}
              className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 hover:text-[#0d9488] transition-colors cursor-pointer text-left block w-full py-1"
            >
              Catálogo de Salud
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenQuotation();
              }}
              className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 hover:text-[#0d9488] transition-colors cursor-pointer text-left block w-full py-1"
            >
              Enviar Receta Médica
            </button>
            <button
              type="button"
              onClick={() => handleSelectService('presion')}
              className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 hover:text-[#0d9488] transition-colors cursor-pointer text-left block w-full py-1"
            >
              Servicios de Tópico
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBrand('historia');
              }}
              className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 hover:text-[#0d9488] transition-colors cursor-pointer text-left block w-full py-1"
            >
              Sobre Nuestra Botica
            </button>
            <button
              type="button"
              onClick={handleSelectLocation}
              className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 hover:text-[#0d9488] transition-colors cursor-pointer text-left block w-full py-1"
            >
              Dónde Ubicarnos (Mapa)
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-200 space-y-2.5">
            <Link
              to="/mi-cuenta"
              onClick={onClose}
              className="flex items-center gap-2 text-xs font-bold text-zinc-700 hover:text-[#0d9488] transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-[#0d9488]" />
              <span>Portal de Clientes (Mi Cuenta & Boletas)</span>
            </Link>

            <Link
              to="/admin/login"
              onClick={onClose}
              className="flex items-center gap-2 text-xs font-bold text-zinc-700 hover:text-[#0d9488] transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#0d9488]" />
              <span>Ingreso Personal (Inventario & POS)</span>
            </Link>

            <button
              type="button"
              onClick={handleSelectReclamaciones}
              className="flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-[#0d9488] transition-colors cursor-pointer pt-1"
            >
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>Libro de Reclamaciones Virtual (INDECOPI)</span>
            </button>
          </div>
        </div>

        {/* Columna 2: Las 6 Categorías del Catálogo */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
            <Pill className="w-4 h-4 text-[#0d9488]" />
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-950">
              6 Categorías de Catálogo
            </span>
          </div>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            {[
              { id: 'medicamentos', label: 'Medicamentos & Éticos', badge: 'DIGEMID' },
              { id: 'cardiovascular', label: 'Salud Cardiovascular & Crónicos', badge: 'Crónicos' },
              { id: 'dermocosmetica', label: 'Dermocosmética Especializada', badge: 'ISDIN' },
              { id: 'pediatria', label: 'Cuidado Pediátrico & Infantil', badge: 'Infantil' },
              { id: 'bienestar-suplementos', label: 'Bienestar & Suplementos', badge: 'Vitalidad' },
              { id: 'botiquin', label: 'Botiquín & Primeros Auxilios', badge: 'Esencial' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCatalog(cat.id);
                }}
                className="p-2 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-200 text-left flex items-center justify-between text-zinc-800 transition-colors cursor-pointer group"
              >
                <span className="font-semibold text-zinc-900 group-hover:text-[#0d9488]">
                  {cat.label}
                </span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  {cat.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Columna 3: Los 5 Servicios & Contacto */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
            <HeartPulse className="w-4 h-4 text-[#0d9488]" />
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-950">
              5 Servicios Clínicos en Sede
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            {[
              { id: 'presion', name: 'Toma de Presión Arterial', price: 'S/ 2.00' },
              { id: 'glucosa', name: 'Medición de Glucosa Capilar', price: 'S/ 5.00' },
              { id: 'inyectable', name: 'Aplicación de Inyectables', price: 'S/ 8.00' },
              { id: 'curacion', name: 'Curación Menor & Tópico', price: 'S/ 12.00' },
              { id: 'asesoria', name: 'Asesoría Profesional CQFP', price: 'Gratuito' },
            ].map((srv) => (
              <button
                key={srv.id}
                type="button"
                onClick={() => handleSelectService(srv.id)}
                className="w-full p-2 rounded-lg hover:bg-teal-50/50 border border-transparent hover:border-teal-200 flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <span className="font-semibold text-zinc-900 group-hover:text-[#0d9488]">
                  {srv.name}
                </span>
                <span
                  className={`text-xs font-black ${
                    srv.price === 'Gratuito' ? 'text-emerald-700' : 'text-[#0d9488]'
                  }`}
                >
                  {srv.price}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3 mt-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0d9488]" />
              <span className="text-xs font-bold text-zinc-900">Av. Principal 1248, Lima</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <Clock className="w-4 h-4 text-[#0d9488]" />
              <span>Lun - Sáb: 7:00am - 11:00pm</span>
            </div>
            <a
              href="https://wa.me/51955545561?text=Hola%20Botica%20Nova%20Salud%2C%20deseo%20hacer%20un%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp: +51 955 545 561</span>
            </a>
          </div>
        </div>
      </div>

        {/* Bottom Bar */}
        <div className="w-full pt-4 sm:pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
          <span>© 2026 Botica Nova Salud • Farmacia Ética & Dispensación Profesional</span>
          <span>Atención Presencial en Lima & Delivery Express</span>
        </div>
      </div>
    </div>
  );
};
