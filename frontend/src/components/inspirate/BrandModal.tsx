import React, { useState } from 'react';
import { X, Award, ShieldCheck, MapPin, Clock, Phone, Navigation, CheckCircle2, MessageCircle } from 'lucide-react';
import { SITE_IMAGES } from '../../data/inspirateData';

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuotation: () => void;
  defaultTab?: 'historia' | 'mapa';
}

export const BrandModal: React.FC<BrandModalProps> = ({
  isOpen,
  onClose,
  onOpenQuotation,
  defaultTab = 'historia',
}) => {
  const [activeTab, setActiveTab] = useState<'historia' | 'mapa'>(defaultTab);

  React.useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-start sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-white shadow-2xl rounded-xl border border-zinc-200 my-auto max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera Fija Responsiva */}
        <div className="sticky top-0 z-20 bg-white border-b border-zinc-200 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0d9488] shrink-0">
                <MapPin className="w-4 sm:w-5 h-4 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#0d9488] truncate">
                  Botica Nova Salud • Sede Lima
                </div>
                <h2 className="text-base sm:text-xl font-black text-zinc-900 leading-tight truncate">
                  Nosotros & Dónde Ubicarnos
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="sm:hidden w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Selector de Pestaña */}
            <div className="flex flex-1 sm:flex-none bg-zinc-100 p-1 rounded-lg border border-zinc-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('historia')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-all cursor-pointer text-center ${
                  activeTab === 'historia'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                Nuestra Historia
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('mapa')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'mapa'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#0d9488]" />
                <span>Dónde Ubicarnos</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="hidden sm:flex w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 items-center justify-center transition-colors cursor-pointer ml-1 shrink-0"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-zinc-800 text-sm">
          {activeTab === 'historia' ? (
            <div className="space-y-6">
              <div className="w-full h-56 sm:h-72 rounded-xl bg-zinc-100 overflow-hidden border border-zinc-200">
                <img loading="lazy" decoding="async"
                  src={SITE_IMAGES.brandModel}
                  alt="Química Farmacéutica en Botica Nova Salud"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0d9488] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Ética Farmacéutica & Compromiso Sanitario
                </span>
                <h3 className="text-2xl font-black text-zinc-950 tracking-tight">
                  Una botica orientada a cuidar la salud de tu familia
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  <strong>Botica Nova Salud</strong> nació con la misión de ser un espacio de confianza, orientación y salud accesible en Lima. Frente a la proliferación de medicamentos de dudosa procedencia y la automedicación indiscriminada, nos consolidamos como una botica ética que adquiere sus existencias exclusivamente de laboratorios autorizados y distribuidores formales con registro sanitario DIGEMID.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-zinc-200">
                  <div className="flex gap-3 items-start bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <ShieldCheck className="w-6 h-6 text-[#0d9488] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black uppercase text-zinc-900 mb-1">
                        Certificación Sanitaria DIGEMID
                      </h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Cada fármaco y producto dermocosmético cuenta con registro sanitario oficial, lote certificado y amplia fecha de caducidad.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <Award className="w-6 h-6 text-[#0d9488] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black uppercase text-zinc-900 mb-1">
                        Químicos Farmacéuticos Colegiados
                      </h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Personal titulado y colegiado en constante capacitación para orientarte en dosis, interacciones y farmacovigilancia responsable.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-zinc-600 leading-relaxed text-xs">
                  Cumplimos rigurosamente con las Buenas Prácticas de Almacenamiento (BPA) y control continuo de temperatura y humedad, garantizando que cada principio activo mantenga su eficacia y calidad intacta.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('mapa')}
                  className="py-3 px-5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  Ver Ubicación y Horarios de Sede
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenQuotation();
                  }}
                  className="py-3 px-5 border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Cotizar Receta Médica
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sección Dónde Ubicarnos */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Columna Mapa Embebido */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-zinc-300 shadow-sm relative bg-zinc-100">
                    <iframe
                      title="Mapa de Ubicación Botica Nova Salud"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src="https://maps.google.com/maps?q=-12.046374,-77.042793&hl=es&z=15&output=embed"
                      className="w-full h-full"
                    />
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-zinc-200 shadow-md flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-extrabold text-zinc-900">Sede Principal Abierta Hoy</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
                    <span>Av. Principal 1248, Lima • Fácil acceso peatonal y vehicular</span>
                    <a
                      href="https://maps.google.com/?q=Av.+Principal+1248,+Lima"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0d9488] font-bold hover:underline flex items-center gap-1"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Abrir en Google Maps
                    </a>
                  </div>
                </div>

                {/* Columna Detalles de Sede, Horarios y Contacto */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#0d9488] flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-zinc-900">Dirección Oficial</h4>
                        <p className="text-xs text-zinc-600 mt-0.5">Av. Principal 1248, Lima, Perú</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Frente a la Alameda Comercial, zona céntrica con estacionamiento.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-3 border-t border-zinc-200">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#0d9488] flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-zinc-900">Horarios de Atención</h4>
                        <p className="text-xs text-zinc-700 font-bold mt-0.5">Lunes a Sábado: 7:00 am - 11:00 pm</p>
                        <p className="text-xs text-zinc-600">Domingos y Feriados: 8:00 am - 9:00 pm</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-3 border-t border-zinc-200">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#0d9488] flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-zinc-900">Teléfono y WhatsApp</h4>
                        <p className="text-xs text-zinc-700 font-bold mt-0.5">+51 955 545 561</p>
                        <p className="text-[11px] text-zinc-400">Atención inmediata para consultas y pedidos.</p>
                      </div>
                    </div>
                  </div>

                  {/* Servicios disponibles en sede */}
                  <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2 text-xs">
                    <span className="font-extrabold text-[#0d9488] uppercase tracking-wider block">
                      Facilidades en Sede:
                    </span>
                    <ul className="space-y-1.5 text-zinc-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488] flex-shrink-0" />
                        <span>Tópico equipado para inyectables y signos vitales</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488] flex-shrink-0" />
                        <span>Estacionamiento gratuito para clientes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488] flex-shrink-0" />
                        <span>Delivery express para toda el área metropolitana</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488] flex-shrink-0" />
                        <span>Aceptamos Yape, Plin, tarjetas Visa, Mastercard y efectivo</span>
                      </li>
                    </ul>
                  </div>

                  <a
                    href="https://wa.me/51955545561?text=Hola%20Botica%20Nova%20Salud%2C%20quisiera%20consultar%20sobre%20la%20ubicaci%C3%B3n%20y%20atenci%C3%B3n%20en%20sede."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Consultar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
