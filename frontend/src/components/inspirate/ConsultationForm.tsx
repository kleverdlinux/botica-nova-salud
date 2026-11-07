import React, { useState } from 'react';
import { ASSETS } from '../../data/inspirateData';

export const ConsultationForm: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Por favor, completa tu nombre y teléfono.');
      return;
    }
    if (!accepted) {
      setError('Debes aceptar la política de privacidad para continuar.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <section
      id="consultation"
      className="relative w-full min-h-[760px] lg:h-[780px] overflow-hidden bg-[#1f3a34] flex flex-col lg:block p-5 select-none"
    >
      {/* Full-Bleed Background Image */}
      <img loading="lazy" decoding="async"
        src={ASSETS.consultBg}
        alt="Fachada y atención en Botica Nova Salud"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/45 lg:bg-black/30" />

      {/* Top-Left Oversized Dual-Color Heading */}
      <div className="relative z-10 lg:absolute lg:left-[20px] lg:top-[25px] mb-6 lg:mb-0 pointer-events-none">
        <h2 className="font-extrabold uppercase tracking-[-0.03em] leading-[0.94] text-[34px] sm:text-[46px] lg:text-[56px]">
          <span className="block text-white">CONSULTA</span>
          <span className="block text-teal-200/80">FARMACÉUTICA</span>
        </h2>
      </div>

      {/* Right Floating White Form Card */}
      <div className="relative z-20 lg:absolute lg:right-[20px] lg:top-[20px] lg:bottom-[20px] w-full lg:w-[355px] bg-white p-[25px] flex flex-col justify-between min-h-[560px] shadow-2xl">
        <p className="text-[12px] text-[#222222] leading-[1.4] font-normal">
          Envíanos tu consulta, receta médica o requerimiento de medicamentos.
          Nuestro Químico Farmacéutico colegiado verificará stock, posología y
          te responderá con prontitud.
        </p>

        {submitted ? (
          <div className="my-auto py-10 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-[#0d9488] text-white flex items-center justify-center text-lg font-bold">
              ✓
            </div>
            <h3 className="text-[16px] font-extrabold uppercase text-[#222222]">
              ¡CONSULTA ENVIADA!
            </h3>
            <p className="text-[12px] text-[#555555] leading-[1.4]">
              Gracias, {name}. Nuestro Químico Farmacéutico colegiado se pondrá
              en contacto contigo al {phone} muy pronto.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setName('');
                setPhone('');
                setMessage('');
              }}
              className="btn_anim_1 px-6 h-[48px] text-[11px] font-extrabold uppercase text-[#222222] border border-[#222222] cursor-pointer"
            >
              NUEVA CONSULTA
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {/* Name Input */}
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="TU NOMBRE COMPLETO *"
                className="w-full h-[44px] border-b border-[#222222] bg-transparent text-[12px] font-bold text-[#222222] placeholder:text-[#A6A9AD] placeholder:font-bold focus:outline-none"
              />
            </div>

            {/* Phone Input with Country Prefix (Peru +51) */}
            <div className="flex items-center border-b border-[#222222] h-[44px] gap-2">
              <span className="text-[13px] select-none">🇵🇪</span>
              <span className="text-[12px] font-extrabold text-[#222222]">
                +51
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="955 545 561 *"
                className="flex-1 h-full bg-transparent text-[12px] font-bold text-[#222222] placeholder:text-[#A6A9AD] focus:outline-none"
              />
            </div>

            {/* Message / Prescription Input */}
            <div>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="MEDICAMENTO, RECETA O CONSULTA"
                className="w-full py-2 border-b border-[#222222] bg-transparent text-[12px] font-bold text-[#222222] placeholder:text-[#A6A9AD] placeholder:font-bold focus:outline-none resize-none"
              />
            </div>

            {/* Privacy Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 w-[15px] h-[15px] accent-[#0d9488] shrink-0 cursor-pointer"
              />
              <span className="text-[10px] leading-[1.25] text-[#555555]">
                Acepto el tratamiento de mis datos personales para la atención de
                mi consulta farmacéutica según la Ley N° 29733.
              </span>
            </label>

            {error && (
              <p className="text-[11px] font-semibold text-red-600">{error}</p>
            )}

            {/* Submit Button (.btn_anim_1) */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                className="btn_anim_1 w-full h-[52px] bg-white text-[#222222] text-[11px] font-extrabold uppercase tracking-[0.03em] flex items-center justify-center cursor-pointer border border-[#222222] hover:bg-[#222222] hover:text-white transition-colors"
              >
                ENVIAR CONSULTA
              </button>

              {/* Direct WhatsApp CTA Button */}
              <a
                href="https://wa.me/51955545561?text=Hola%20Botica%20Nova%20Salud,%20deseo%20consultar%20por%20un%20medicamento%20y/o%20enviar%20mi%20receta"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-[46px] bg-[#25D366] hover:bg-[#20b859] text-white text-[11px] font-extrabold uppercase tracking-[0.03em] flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                CONSULTAR POR WHATSAPP
              </a>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
