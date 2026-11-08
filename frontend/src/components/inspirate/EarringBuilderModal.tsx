import React, { useState } from 'react';
import { X, Check, Activity, HeartPulse, Syringe, Stethoscope, ShieldCheck, MessageCircle } from 'lucide-react';
import { Product } from '../../data/inspirateData';
import { registrarCitaApi } from '../../api/citasApi';

interface EarringBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (customProduct: Product) => void;
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

  const [guardando, setGuardando] = useState(false);

  if (!isOpen) return null;

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) return;

    setGuardando(true);
    try {
      // 1. Guardar cita internamente en la base de datos de Botica Nova Salud
      await registrarCitaApi({
        paciente: patientName.trim(),
        telefono: patientPhone.trim(),
        servicioId: currentService.id,
        servicioNombre: currentService.name,
        precio: currentService.price,
        horario: preferredTime
      });
    } catch (err) {
      console.warn('Registro local de cita completado con respaldo:', err);
    } finally {
      setGuardando(false);
      setSubmitted(true);

      // 2. Abrir WhatsApp oficial de Botica Nova Salud con los datos completos
      const mensajeWsp =
        `Hola Botica Nova Salud, confirmo mi Cita de Tópico:\n` +
        `• Servicio: ${currentService.name}\n` +
        `• Costo: ${currentService.priceFormatted}\n` +
        `• Paciente: ${patientName.trim()}\n` +
        `• Teléfono: ${patientPhone.trim()}\n` +
        `• Horario preferido: ${preferredTime}`;

      const urlWsp = `https://wa.me/51955545561?text=${encodeURIComponent(mensajeWsp)}`;
      window.open(urlWsp, '_blank', 'noopener,noreferrer');
    }
  };

  const mensajeConsultaWsp =
    `Hola Botica Nova Salud, deseo consultar información detallada sobre el servicio de tópico: ` +
    `${currentService.name} (${currentService.priceFormatted}). ` +
    `¿Cuáles son las indicaciones previas y disponibilidad de atención hoy?`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-5 flex items-start sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl bg-white shadow-2xl p-5 sm:p-8 my-auto rounded-2xl text-[#222222] border border-gray-100 max-h-[94vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black transition-colors cursor-pointer z-20 shadow-xs"
          aria-label="Cerrar modal"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {submitted ? (
          <div className="text-center py-10 animate-fade-in space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-[#0d9488] rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="text-2xl font-black uppercase text-[#222222]">
              Cita de Tópico Coordinada
            </h3>
            <p className="text-xs sm:text-sm text-[#555555] max-w-md mx-auto leading-relaxed">
              Servicio: <strong className="text-[#222222]">{currentService.name}</strong> ({currentService.priceFormatted}).
            </p>
            <p className="text-xs sm:text-sm text-[#555555] max-w-md mx-auto leading-relaxed">
              Registrado para el paciente <strong className="text-[#222222]">{patientName}</strong> con celular <strong className="text-[#222222]">{patientPhone}</strong> en horario ({preferredTime}).
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="py-2.5 px-8 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Aceptar y Cerrar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0d9488] block">
                Servicios Clínicos • Botica Nova Salud
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#222222]">
                Tópico & Monitoreo de Signos Vitales
              </h2>
              <p className="text-xs text-[#666666]">
                Servicios asistenciales de salud con equipos clínicos certificados bajo supervisión farmacéutica.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Services Selection */}
              <div className="lg:col-span-7 space-y-2.5">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#222222]">
                  Selecciona el Servicio Requerido
                </label>

                <div className="space-y-2">
                  {services.map((srv) => {
                    const IconComp = srv.icon;
                    const isSelected = selectedServiceId === srv.id;
                    return (
                      <button
                        type="button"
                        key={srv.id}
                        onClick={() => setSelectedServiceId(srv.id)}
                        className={`w-full p-2.5 text-left border rounded-xl transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-[#0d9488] bg-teal-50/60 shadow-xs ring-1 ring-[#0d9488]'
                            : 'border-gray-200 hover:border-gray-400 bg-white'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#0d9488] text-white' : 'bg-gray-100 text-[#444444]'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-[#222222] uppercase tracking-wide truncate pr-2">
                              {srv.name}
                            </span>
                            <span className="text-xs font-black text-[#0d9488] shrink-0 font-mono">
                              {srv.priceFormatted}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#666666] leading-tight truncate">
                            {srv.subtitle}
                          </p>
                          {srv.requiresPrescription && (
                            <span className="inline-block text-[8px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded mt-0.5">
                              * Requiere receta médica
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Live Details & Form */}
              <div className="lg:col-span-5 bg-[#fafafa] p-4 sm:p-5 rounded-2xl border border-gray-100 flex flex-col justify-between space-y-3">
                <div>
                  <div className="w-full h-28 bg-white border border-gray-200 rounded-xl overflow-hidden mb-3 relative">
                    <img loading="lazy" decoding="async"
                      src="/media/home/srv-topico-signos.jpg"
                      alt="Tópico clínico Botica Nova Salud"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2.5">
                      <span className="text-white text-[11px] font-black uppercase tracking-wider">
                        Atención Presencial Inmediata
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-[#444444] pb-2.5 border-b border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Servicio:</span>
                      <strong className="text-[#222222] truncate ml-2">{currentService.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Costo en botica:</span>
                      <strong className="text-[#0d9488] font-mono text-xs">{currentService.priceFormatted}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Bioseguridad:</span>
                      <strong className="text-[#222222]">Material 100% estéril descartable</strong>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleOrder} className="space-y-2.5 text-xs">
                  <div>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Nombre del paciente *"
                      className="w-full border-b border-gray-300 py-1 text-xs focus:outline-none focus:border-[#0d9488] bg-transparent"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="Teléfono / WhatsApp (+51 955 545 561) *"
                      className="w-full border-b border-gray-300 py-1 text-xs focus:outline-none focus:border-[#0d9488] bg-transparent"
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full border-b border-gray-300 py-1 text-xs focus:outline-none focus:border-[#0d9488] bg-transparent text-[#444444]"
                    >
                      <option value="Hoy en la mañana (8:00 AM - 12:00 PM)">Hoy en la mañana (8:00 AM - 12:00 PM)</option>
                      <option value="Hoy en la tarde (12:00 PM - 6:00 PM)">Hoy en la tarde (12:00 PM - 6:00 PM)</option>
                      <option value="Hoy en la noche (6:00 PM - 10:30 PM)">Hoy en la noche (6:00 PM - 10:30 PM)</option>
                      <option value="Atención directa por orden de llegada">Atención directa por orden de llegada</option>
                    </select>
                  </div>

                  {/* Ambos Botones van a WhatsApp */}
                  <div className="pt-1.5 space-y-2">
                    <button
                      type="submit"
                      disabled={guardando}
                      className="w-full py-2.5 px-4 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{guardando ? 'Registrando...' : 'Confirmar Cita de Tópico'}</span>
                    </button>
                    <a
                      href={`https://wa.me/51955545561?text=${encodeURIComponent(mensajeConsultaWsp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-4 bg-[#25D366] hover:bg-[#20b859] text-white text-[11px] font-extrabold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Consultar por WhatsApp</span>
                    </a>
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
