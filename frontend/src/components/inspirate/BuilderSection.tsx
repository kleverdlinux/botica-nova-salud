import React from 'react';
import { ASSETS } from '../../data/inspirateData';

interface BuilderSectionProps {
  onOpenBuilder: () => void;
}

export const BuilderSection: React.FC<BuilderSectionProps> = ({
  onOpenBuilder,
}) => {
  return (
    <section
      id="topico"
      className="px-[10px] sm:px-[20px] pt-[20px] bg-white select-none"
    >
      <div className="relative w-full min-h-[760px] lg:h-[820px] overflow-hidden bg-[#1f3a34] flex flex-col lg:block p-5">
        {/* Background Image */}
        <img loading="lazy" decoding="async"
          src={ASSETS.builderBg}
          alt="Servicios de tópico y control de signos vitales Botica Nova Salud"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40 lg:bg-black/25" />

        {/* Right Top Oversized Dual-Color Heading */}
        <div className="relative z-10 lg:absolute lg:right-[20px] lg:top-[20px] text-right mb-6 lg:mb-0 pointer-events-none">
          <h2 className="font-extrabold uppercase tracking-[-0.03em] leading-[0.94] text-[30px] sm:text-[42px] lg:text-[54px]">
            <span className="block text-white">ATENCIÓN EN TÓPICO,</span>
            <span className="block text-teal-200/80">CUIDADO CLÍNICO</span>
            <span className="block text-white/70">PARA TU BIENESTAR</span>
          </h2>
        </div>

        {/* Left Floating White Card */}
        <div className="relative z-20 lg:absolute lg:left-[20px] lg:top-[20px] lg:bottom-[20px] w-full lg:w-[355px] bg-white p-[25px] lg:p-[30px] flex flex-col justify-between min-h-[540px] shadow-2xl">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#0d9488]">
              TÓPICO & ATENCIÓN PRIMARIA
            </div>

            <h3 className="mt-2 text-[24px] lg:text-[28px] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-[#222222]">
              SERVICIOS CLÍNICOS
              <br />
              & MONITOREO
              <br />
              EN BOTICA
            </h3>

            <div className="mt-8 space-y-4 text-[12px] text-[#222222] leading-[1.4] font-normal">
              <p>
                Control de presión arterial con tensiómetros clínicos calibrados,
                medición de glucosa capilar instantánea y aplicación de
                inyectables bajo estricta prescripción médica y normas de
                bioseguridad.
              </p>
              <p>
                Nuestros Químicos Farmacéuticos realizan seguimiento
                farmacoterapéutico continuo: te orientamos en horarios,
                dosificaciones e interacciones para que tu tratamiento sea
                seguro y efectivo.
              </p>
            </div>

            {/* Clinical highlights list */}
            <div className="mt-6 pt-5 border-t border-[#EDF1F4] space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#222222]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />
                Toma de Presión Arterial
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#222222]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />
                Glucemia Capilar Rápida
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#222222]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />
                Inyectables & Curaciones Menores
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={onOpenBuilder}
              className="btn_anim_1 w-full lg:w-[275px] h-[62px] bg-white text-[#222222] text-[11px] font-extrabold uppercase tracking-[0.03em] flex items-center justify-center cursor-pointer border border-[#222222] hover:bg-[#222222] hover:text-white transition-colors"
            >
              CONSULTAR SERVICIOS DE TÓPICO
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
