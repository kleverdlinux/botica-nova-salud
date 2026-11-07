import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [contactMethod, setContactMethod] = useState<'phone' | 'telegram' | 'whatsapp'>('whatsapp');
  const [contactValue, setContactValue] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor indica tu nombre.');
      return;
    }
    if (!contactValue.trim()) {
      setError('Por favor indica tu número de contacto o usuario.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white shadow-2xl p-6 sm:p-10 my-6 text-[#222222] border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-[#222222] transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-10 animate-fade-in">
            <div className="w-14 h-14 bg-emerald-100 text-[#0d9488] rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black uppercase text-[#222222] mb-2">
              ¡Pedido Registrado!
            </h3>
            <p className="text-xs text-[#555555] leading-relaxed mb-6">
              Gracias, <span className="font-bold text-[#222222]">{name}</span>. Nos pondremos en contacto contigo vía {contactMethod.toUpperCase()} ({contactValue}) a la brevedad para confirmar la entrega y disponibilidad.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="btn-corner-accent btn-corner-dark py-2.5 px-6 text-xs uppercase font-extrabold cursor-pointer"
            >
              Aceptar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0d9488] block mb-1">
                Atención Inmediata • Botica Nova Salud
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#222222]">
                Pedido Rápido
              </h2>
              <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
                Rellena tus datos y nuestro personal se comunicará contigo para confirmar el pedido, stock y coordinar la entrega o retiro en botica.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#222222] mb-1">
                Tu Nombre Completo *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Carmen Ortiz"
                className="w-full border-b border-gray-300 py-2 text-xs focus:outline-none focus:border-[#0d9488]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#222222] mb-1.5">
                Canal de Contacto
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {(['whatsapp', 'phone'] as const).map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setContactMethod(method)}
                    className={`py-1.5 text-[11px] font-bold uppercase border transition-all cursor-pointer ${
                      contactMethod === method
                        ? 'border-[#0d9488] bg-[#0d9488] text-white'
                        : 'border-gray-200 text-[#555555]'
                    }`}
                  >
                    {method === 'whatsapp' ? 'WhatsApp' : 'Llamada telefónica'}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder="+51 955 545 561"
                className="w-full border-b border-gray-300 py-2 text-xs focus:outline-none focus:border-[#0d9488]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#222222] mb-1">
                Medicamentos Requeridos / Comentarios
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Indica el producto, presentación, cantidad o dirección para delivery..."
                className="w-full border-b border-gray-300 py-1.5 text-xs focus:outline-none focus:border-[#0d9488] resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-corner-accent btn-corner-dark w-full py-3.5 text-xs font-black uppercase tracking-widest cursor-pointer"
              >
                Enviar Solicitud
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
