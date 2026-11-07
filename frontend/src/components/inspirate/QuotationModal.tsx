import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({ isOpen, onClose }) => {
  const [reqType, setReqType] = useState('Tratamiento Crónico');
  const [preference, setPreference] = useState('Mejor opción calidad/precio');
  const [deliveryType, setDeliveryType] = useState('Delivery a domicilio');
  const [contactValue, setContactValue] = useState('');
  const [fullName, setFullName] = useState('');
  const [medicines, setMedicines] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const requestTypes = [
    'Tratamiento Crónico',
    'Receta Médica / Antibiótico',
    'Botiquín Familiar',
    'Dermocosmética',
    'Cuidado Infantil',
    'Tópico / Inyectables',
  ];

  const preferences = [
    'Mejor opción calidad/precio',
    'Medicamento de Marca / Innovador',
    'Genérico Certificado DIGEMID',
  ];

  const deliveryOptions = ['Delivery a domicilio', 'Retiro presencial en Botica'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactValue.trim()) {
      setError('Por favor indica tu número de WhatsApp o teléfono.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-start sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-lg my-auto text-[#222222] border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden animate-fade-in">
        {/* Sticky / Fixed Header with Prominent Close Button */}
        <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-start justify-between bg-white shrink-0">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0d9488] block mb-1">
              Atención Farmacéutica • Botica Nova Salud
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#222222] leading-tight">
              Cotizar Receta Médica
            </h2>
            <p className="mt-1 text-xs text-[#666666] leading-relaxed max-w-lg">
              Indica los medicamentos prescritos o tu tratamiento regular. Te responderemos rápidamente con precios oficiales, fechas de vencimiento y opciones de entrega.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 -mt-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black transition-colors cursor-pointer shrink-0 ml-4 shadow-xs"
            aria-label="Cerrar ventana"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {submitted ? (
            <div className="text-center py-10 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-[#0d9488] rounded-full flex items-center justify-center mx-auto mb-5">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black uppercase text-[#222222] mb-3">
                ¡Receta y Solicitud Recibida!
              </h3>
              <p className="text-sm text-[#555555] max-w-md mx-auto leading-relaxed mb-6">
                Gracias, <span className="font-bold text-[#222222]">{fullName || 'estimado paciente'}</span>. Nuestro Químico Farmacéutico verificará la disponibilidad en stock de los medicamentos solicitados y te enviará la cotización detallada vía WhatsApp ({contactValue}).
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="btn-corner-accent btn-corner-dark py-3 px-8 text-xs font-black uppercase cursor-pointer"
              >
                Cerrar y Continuar
              </button>
            </div>
          ) : (
            <div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Request Type */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#222222] mb-2">
                    Tipo de Requerimiento
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {requestTypes.map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setReqType(type)}
                        className={`py-2 px-3 text-xs font-bold uppercase tracking-wider border transition-all text-left cursor-pointer ${
                          reqType === type
                            ? 'border-[#0d9488] bg-[#0d9488] text-white shadow-sm'
                            : 'border-gray-200 hover:border-gray-400 text-[#444444]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand vs Generic Preference */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#222222] mb-2">
                    Preferencia de Medicamentos
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {preferences.map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setPreference(p)}
                        className={`py-2 px-3 text-xs font-bold uppercase tracking-wider border transition-all text-center cursor-pointer ${
                          preference === p
                            ? 'border-[#0d9488] bg-[#0d9488] text-white shadow-sm'
                            : 'border-gray-200 hover:border-gray-400 text-[#444444]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Options */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#222222] mb-2">
                    Modalidad de Entrega
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {deliveryOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setDeliveryType(opt)}
                        className={`py-2.5 px-3 text-xs font-extrabold uppercase tracking-wider border transition-all text-center cursor-pointer ${
                          deliveryType === opt
                            ? 'border-[#18181b] bg-[#18181b] text-white shadow-sm'
                            : 'border-gray-200 hover:border-gray-400 text-[#444444]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medicine list / text input */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#222222] mb-1">
                    Detalle de Medicamentos o Diagnóstico *
                  </label>
                  <textarea
                    rows={3}
                    value={medicines}
                    onChange={(e) => setMedicines(e.target.value)}
                    placeholder="Ej: Losartán 50mg (caja x 30), Glimepirida 2mg, o texto de la receta médica..."
                    className="w-full border border-gray-300 p-2.5 text-xs focus:outline-none focus:border-[#0d9488] rounded"
                    required
                  />
                </div>

                {/* Contact Data */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#222222] mb-2">
                    Tus Datos de Contacto
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Tu nombre completo"
                      className="border-b border-gray-300 py-2 text-xs focus:outline-none focus:border-[#0d9488]"
                    />
                    <input
                      type="tel"
                      value={contactValue}
                      onChange={(e) => setContactValue(e.target.value)}
                      placeholder="Número de WhatsApp (+51 955 545 561)"
                      className="border-b border-gray-300 py-2 text-xs focus:outline-none focus:border-[#0d9488]"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="btn-corner-accent btn-corner-dark flex-1 py-4 text-xs font-black uppercase tracking-widest cursor-pointer"
                  >
                    Enviar y Recibir Cotización
                  </button>
                  <a
                    href={`https://wa.me/51955545561?text=Hola%20Botica%20Nova%20Salud,%20deseo%20cotizar%20la%20siguiente%20receta%20o%20tratamiento:%20${encodeURIComponent(medicines || 'Consulta médica')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] hover:bg-[#20b859] text-white py-4 px-6 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    Pedir por WhatsApp
                  </a>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
