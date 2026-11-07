import React, { useState } from 'react';
import { X, Check, Activity, HeartPulse, Syringe, Stethoscope, ShieldCheck } from 'lucide-react';
import { Product } from '../../data/inspirateData';

interface EarringBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (customProduct: Product) => void;
}

interface ServiceOption {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  priceFormatted: string;
  icon: any;
  requiresPrescription?: boolean;
}

export const EarringBuilderModal: React.FC<EarringBuilderModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const services: ServiceOption[] = [
    {
      id: 'presion',
      name: 'TOMA DE PRESIÓN ARTERIAL',
      subtitle: 'Tensiómetro digital Omron con detección de arritmias',
      price: 2.00,
      priceFormatted: 'S/ 2.00',
      icon: HeartPulse,
    },
    {
      id: 'glucosa',
      name: 'MEDICIÓN DE GLUCOSA CAPILAR',
      subtitle: 'Glucómetro Accu-Chek Guide, tira y lanceta descartable',
      price: 5.00,
      priceFormatted: 'S/ 5.00',
      icon: Activity,
    },
    {
      id: 'inyectable',
      name: 'APLICACIÓN DE INYECTABLES',
      subtitle: 'Intramuscular o subcutánea con jeringa y aguja estéril',
      price: 8.00,
      priceFormatted: 'S/ 8.00',
      icon: Syringe,
      requiresPrescription: true,
    },
    {
      id: 'curacion',
      name: 'CURACIÓN MENOR & DESINFECCIÓN',
      subtitle: 'Antisepsia de heridas leves, gasas estériles y vendaje',
      price: 12.00,
      priceFormatted: 'S/ 12.00',
      icon: Stethoscope,
    },
    {
      id: 'asesoria',
      name: 'SEGUIMIENTO FARMACOTERAPÉUTICO',
      subtitle: 'Revisión de dosis, horarios e interacciones con el Químico Farmacéutico',
      price: 0.00,
      priceFormatted: 'Gratuito',
      icon: ShieldCheck,
    },
  ];

  const [selectedServiceId, setSelectedServiceId] = useState<string>('presion');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState('Hoy en la mañana');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleAddToCart = () => {
    const serviceItem: Product = {
      id: `servicio-${currentService.id}-${Date.now()}`,
      title: `Servicio de Tópico: ${currentService.name}`,
      name: currentService.name,
      category: 'medicamentos',
      subtitle: currentService.subtitle,
      description: `Atención en tópico clínico en Botica Nova Salud. Incluye materiales descartables y registro en cartilla de control.`,
      metal: 'Atención Profesional / Químico Farmacéutico',
      stone: 'Material estéril y descartable certificado',
      priceUSD: currentService.price,
      priceEUR: currentService.price,
      priceFormatted: currentService.priceFormatted,
      image: '/media/home/srv-topico-signos.jpg',
    };
    onAddToCart(serviceItem);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-start sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-white shadow-2xl p-6 sm:p-10 my-auto rounded-lg text-[#222222] border border-gray-100 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black transition-colors cursor-pointer z-20 shadow-xs"
          aria-label="Cerrar modal"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {submitted ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-[#0d9488] rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase text-[#222222] mb-3">
              ¡Cita de Tópico Coordinada!
            </h3>
            <p className="text-sm text-[#555555] max-w-md mx-auto leading-relaxed mb-4">
              Servicio: <strong className="text-[#222222]">{currentService.name}</strong> ({currentService.priceFormatted}).
            </p>
            <p className="text-sm text-[#555555] max-w-md mx-auto leading-relaxed mb-6">
              Te esperamos en botica o confirmaremos contigo al <strong className="text-[#222222]">{patientPhone}</strong> para el horario preferido ({preferredTime}).
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="btn-corner-accent btn-corner-dark py-3 px-8 text-xs font-black uppercase cursor-pointer"
            >
              Aceptar y Cerrar
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#0d9488] block mb-1">
                Servicios Clínicos • Botica Nova Salud
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#222222]">
                Tópico & Monitoreo de Signos Vitales
              </h2>
              <p className="text-xs sm:text-sm text-[#666666] mt-1">
                Servicios asistenciales de salud con equipos clínicos certificados y atención por personal capacitado bajo supervisión farmacéutica.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Services Selection */}
              <div className="lg:col-span-7 space-y-4">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#222222] mb-2">
                  Selecciona el Servicio de Salud Requerido
                </label>

                <div className="space-y-2.5">
                  {services.map((srv) => {
                    const IconComp = srv.icon;
                    const isSelected = selectedServiceId === srv.id;
                    return (
                      <button
                        type="button"
                        key={srv.id}
                        onClick={() => setSelectedServiceId(srv.id)}
                        className={`w-full p-3.5 text-left border transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'border-[#0d9488] bg-teal-50/50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-400 bg-white'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#0d9488] text-white' : 'bg-gray-100 text-[#444444]'
                          }`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-[#222222] uppercase tracking-wide">
                              {srv.name}
                            </span>
                            <span className="text-xs font-black text-[#0d9488]">
                              {srv.priceFormatted}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#666666] mt-0.5 leading-snug">
                            {srv.subtitle}
                          </p>
                          {srv.requiresPrescription && (
                            <span className="inline-block text-[9px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1">
                              * Requiere presentación de receta médica
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Live Details & Form */}
              <div className="lg:col-span-5 bg-[#fafafa] p-6 border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="w-full h-44 bg-white border border-gray-200 overflow-hidden mb-4 relative">
                    <img loading="lazy" decoding="async"
                      src="/media/home/srv-topico-signos.jpg"
                      alt="Tópico clínico Botica Nova Salud"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                      <span className="text-white text-xs font-black uppercase tracking-wider">
                        Atención Presencial Inmediata
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-[#444444] pb-4 border-b border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Servicio:</span>
                      <strong className="text-[#222222]">{currentService.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Costo en botica:</span>
                      <strong className="text-[#0d9488] text-sm">{currentService.priceFormatted}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Bioseguridad:</span>
                      <strong className="text-[#222222]">Material 100% estéril</strong>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleOrder} className="mt-4 space-y-3">
                  <div>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Nombre del paciente *"
                      className="w-full border-b border-gray-300 py-1.5 text-xs focus:outline-none focus:border-[#0d9488] bg-transparent"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="Teléfono / WhatsApp (+51 955 545 561) *"
                      className="w-full border-b border-gray-300 py-1.5 text-xs focus:outline-none focus:border-[#0d9488] bg-transparent"
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full border-b border-gray-300 py-1.5 text-xs focus:outline-none focus:border-[#0d9488] bg-transparent text-[#444444]"
                    >
                      <option value="Hoy en la mañana (8:00 AM - 12:00 PM)">Hoy en la mañana (8:00 AM - 12:00 PM)</option>
                      <option value="Hoy en la tarde (12:00 PM - 6:00 PM)">Hoy en la tarde (12:00 PM - 6:00 PM)</option>
                      <option value="Hoy en la noche (6:00 PM - 10:30 PM)">Hoy en la noche (6:00 PM - 10:30 PM)</option>
                      <option value="Atención directa por orden de llegada">Atención directa por orden de llegada</option>
                    </select>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      className="btn-corner-accent btn-corner-dark w-full py-3 text-xs font-black uppercase tracking-widest cursor-pointer"
                    >
                      Confirmar Cita de Tópico
                    </button>
                    <a
                      href={`https://wa.me/51955545561?text=Hola%20Botica%20Nova%20Salud,%20deseo%20atenderme%20en%20t%C3%B3pico%20para:%20${encodeURIComponent(currentService.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-[#25D366] hover:bg-[#20b859] text-white text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      Consultar por WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="w-full py-2 border border-gray-300 text-[#333333] hover:border-black text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      Añadir Ticket a la Bolsa ({currentService.priceFormatted})
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
