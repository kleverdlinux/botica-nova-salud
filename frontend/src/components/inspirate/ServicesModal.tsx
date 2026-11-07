import React, { useState } from 'react';
import { X, Check, Activity, HeartPulse, Syringe, Stethoscope, ShieldCheck, Clock, Calendar, MessageCircle, AlertCircle } from 'lucide-react';

export interface ClinicalServiceItem {
  id: string;
  name: string;
  shortTitle: string;
  subtitle: string;
  price: number;
  priceFormatted: string;
  icon: any;
  requiresPrescription?: boolean;
  description: string;
  duration: string;
  materials: string[];
}

export const CLINICAL_SERVICES: ClinicalServiceItem[] = [
  {
    id: 'presion',
    name: 'TOMA DE PRESIÓN ARTERIAL',
    shortTitle: 'Presión Arterial',
    subtitle: 'Tensiómetro digital Omron con detección de arritmias',
    price: 2.00,
    priceFormatted: 'S/ 2.00',
    icon: HeartPulse,
    duration: '5 - 10 min',
    description: 'Medición de presión sistólica y diastólica con registro en cartilla de control cardiovascular. Orientación inmediata por el químico farmacéutico.',
    materials: ['Tensiómetro digital calibrado', 'Cartilla de seguimiento cardiovascular', 'Desinfección de brazalete'],
  },
  {
    id: 'glucosa',
    name: 'MEDICIÓN DE GLUCOSA CAPILAR',
    shortTitle: 'Control de Glucosa',
    subtitle: 'Glucómetro Accu-Chek Guide, tira y lanceta descartable',
    price: 5.00,
    priceFormatted: 'S/ 5.00',
    icon: Activity,
    duration: '5 min',
    description: 'Descarte y control rápido de glucosa en sangre capilar para pacientes diabéticos o en ayunas. Resultados cuantitativos en 4 segundos.',
    materials: ['Lanceta retráctil estéril de un solo uso', 'Tira reactiva sellada', 'Alcohol en almohadilla', 'Contenedor punzocortante biológico'],
  },
  {
    id: 'inyectable',
    name: 'APLICACIÓN DE INYECTABLES',
    shortTitle: 'Inyectables',
    subtitle: 'Intramuscular o subcutánea con jeringa y aguja estéril',
    price: 8.00,
    priceFormatted: 'S/ 8.00',
    icon: Syringe,
    requiresPrescription: true,
    duration: '10 - 15 min',
    description: 'Administración aséptica de medicamentos prescritos por médico tratante (antibióticos, analgésicos, antiinflamatorios, complejos vitamínicos).',
    materials: ['Jeringa y aguja descartable estéril', 'Algodón hidrófilo y antiséptico', 'Curita post-punción', 'Supervisión de posreacción'],
  },
  {
    id: 'curacion',
    name: 'CURACIÓN MENOR & DESINFECCIÓN',
    shortTitle: 'Curación Menor',
    subtitle: 'Antisepsia de heridas leves, gasas estériles y vendaje',
    price: 12.00,
    priceFormatted: 'S/ 12.00',
    icon: Stethoscope,
    duration: '15 - 20 min',
    description: 'Limpieza con cloruro de sodio, remoción de impurezas y vendaje protector en raspones, cortes superficiales y quemaduras de primer grado.',
    materials: ['Solución salina estéril 0.9%', 'Gasas estériles no tejidas', 'Antiséptico de amplio espectro', 'Esparadrapo microporoso hipoalergénico'],
  },
  {
    id: 'asesoria',
    name: 'ATENCIÓN FARMACÉUTICA & ASESORÍA CQFP',
    shortTitle: 'Asesoría CQFP',
    subtitle: 'Revisión de dosis, interacciones y farmacovigilancia responsable',
    price: 0.00,
    priceFormatted: 'Gratuito',
    icon: ShieldCheck,
    duration: '15 min',
    description: 'Consulta directa con el Químico Farmacéutico regente sobre cómo tomar tus medicamentos, horarios, efectos adversos y conservación en el hogar.',
    materials: ['Atención directa por Químico Farmacéutico titulado', 'Revisión de receta médica oficial', 'Ficha farmacoterapéutica'],
  },
];

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultServiceId?: string;
}

export const ServicesModal: React.FC<ServicesModalProps> = ({
  isOpen,
  onClose,
  defaultServiceId = 'presion',
}) => {
  const [selectedId, setSelectedId] = useState<string>(defaultServiceId);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState('Hoy en la mañana (8:00am - 1:00pm)');
  const [submitted, setSubmitted] = useState(false);

  // Sync defaultServiceId when modal opens with a different service
  React.useEffect(() => {
    if (defaultServiceId) {
      setSelectedId(defaultServiceId);
    }
  }, [defaultServiceId, isOpen]);

  if (!isOpen) return null;

  const currentService = CLINICAL_SERVICES.find((s) => s.id === selectedId) || CLINICAL_SERVICES[0];

  const handleWhatsAppBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hola Botica Nova Salud, deseo solicitar atención para el servicio de: *${currentService.name}* (${currentService.priceFormatted}).%0A%0A*Paciente:* ${encodeURIComponent(patientName || 'Cliente')}%0A*Teléfono:* ${encodeURIComponent(patientPhone || 'No especificado')}%0A*Horario preferido:* ${encodeURIComponent(preferredTime)}`;
    window.open(`https://wa.me/51955545561?text=${text}`, '_blank');
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-start sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-white shadow-2xl rounded-xl border border-zinc-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera Fija */}
        <div className="sticky top-0 z-20 bg-white border-b border-zinc-200 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0d9488] shrink-0">
              <HeartPulse className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#0d9488] truncate">
                Tópico Clínico & Asesoría Profesional • Sede Lima
              </div>
              <h2 className="text-base sm:text-xl font-black text-zinc-900 leading-tight truncate">
                Servicios Farmacéuticos Nova Salud
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Cerrar ventana de servicios"
          >
            <X className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Contenido en dos columnas */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 text-zinc-800">
          {/* Columna Izquierda: Los 5 Servicios */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              Selecciona el Servicio Requerido:
            </span>
            <div className="space-y-2">
              {CLINICAL_SERVICES.map((s) => {
                const Icon = s.icon;
                const isSelected = s.id === selectedId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(s.id);
                      setSubmitted(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'border-[#0d9488] bg-teal-50/60 shadow-xs ring-1 ring-[#0d9488]'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/70'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-[#0d9488] text-white' : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-black text-zinc-900 tracking-tight truncate">
                          {s.name}
                        </h4>
                        <span
                          className={`text-xs font-extrabold flex-shrink-0 ${
                            s.price === 0 ? 'text-emerald-700 font-black' : 'text-[#0d9488]'
                          }`}
                        >
                          {s.priceFormatted}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1 leading-snug">
                        {s.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-600 space-y-1 mt-4">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                <Clock className="w-3.5 h-3.5 text-[#0d9488]" />
                <span>Horario de Tópico Presencial:</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Lunes a Sábado de 7:00 am a 11:00 pm • Domingos de 8:00 am a 9:00 pm.
              </p>
            </div>
          </div>

          {/* Columna Derecha: Detalle del Servicio Seleccionado & Formulario de Cita */}
          <div className="lg:col-span-7 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-200 pt-6 lg:pt-0 lg:pl-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0d9488] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    Servicio Seleccionado
                  </span>
                  <h3 className="text-xl font-black text-zinc-950 mt-1.5">
                    {currentService.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {currentService.subtitle}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-black text-[#0d9488]">
                    {currentService.priceFormatted}
                  </div>
                  <span className="text-[10px] text-zinc-400 block">
                    Tiempo est: {currentService.duration}
                  </span>
                </div>
              </div>

              {currentService.requiresPrescription && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Requisito DIGEMID:</strong> La aplicación de inyectables requiere receta médica vigente emitida por médico colegiado.
                  </span>
                </div>
              )}

              <p className="text-xs text-zinc-600 leading-relaxed">
                {currentService.description}
              </p>

              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 mb-2">
                  Materiales y Protocolo Incluido:
                </h5>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-600">
                  {currentService.materials.map((m, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#0d9488] flex-shrink-0" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Formulario de Solicitud de Cita por WhatsApp */}
            <form onSubmit={handleWhatsAppBooking} className="bg-zinc-50 border border-zinc-200 p-4 sm:p-5 rounded-xl space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0d9488]" />
                <span>Solicitar Atención o Turno en Sede</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    Nombre del Paciente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Carmen Gómez"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md bg-white focus:outline-none focus:border-[#0d9488]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    WhatsApp de Contacto *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 955545561"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md bg-white focus:outline-none focus:border-[#0d9488]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    Horario Preferido
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md bg-white focus:outline-none focus:border-[#0d9488]"
                  >
                    <option value="Hoy en la mañana (8:00am - 1:00pm)">Hoy en la mañana (8:00am - 1:00pm)</option>
                    <option value="Hoy en la tarde (1:00pm - 6:00pm)">Hoy en la tarde (1:00pm - 6:00pm)</option>
                    <option value="Hoy en la noche (6:00pm - 10:30pm)">Hoy en la noche (6:00pm - 10:30pm)</option>
                    <option value="Mañana a primera hora (8:00am)">Mañana a primera hora (8:00am)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  Agendar por WhatsApp
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
