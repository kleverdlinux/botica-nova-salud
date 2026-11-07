import React from 'react';

interface BrandStoryProps {
  onOpenBrand: () => void;
}

export const BrandStory: React.FC<BrandStoryProps> = ({ onOpenBrand }) => {
  return (
    <section
      id="brand"
      className="px-[10px] sm:px-[20px] pb-[20px] bg-white select-none"
    >
      <div className="relative w-full min-h-[760px] lg:h-[820px] overflow-hidden bg-[#1f3a34] flex flex-col lg:block p-5">
        {/* Background Image */}
        <img
          src="/media/home/about-farmaceutica-historia-flipped.jpg"
          alt="Profesional farmacéutica Botica Nova Salud"
          className="absolute inset-0 w-full h-full object-cover object-[30%_center]"
        />
        <div className="absolute inset-0 bg-black/40 lg:bg-black/25" />

        {/* Top-Left Oversized Dual-Color Heading */}
        <div className="relative z-10 lg:absolute lg:left-[20px] lg:top-[20px] mb-6 lg:mb-0 pointer-events-none">
          <h2 className="font-extrabold uppercase tracking-[-0.03em] leading-[0.94] text-[30px] sm:text-[42px] lg:text-[54px]">
            <span className="block text-white">COMPROMISO ÉTICO,</span>
            <span className="block text-teal-200/80">RESPALDO DIGEMID</span>
            <span className="block text-white/70">& ATENCIÓN HUMANA</span>
          </h2>
        </div>

        {/* Right Floating White Card */}
        <div className="relative z-20 lg:absolute lg:right-[20px] lg:top-[20px] lg:bottom-[20px] w-full lg:w-[355px] bg-white p-[25px] lg:p-[30px] flex flex-col justify-between min-h-[540px] shadow-2xl">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#0d9488]">
              NUESTRO COMPROMISO PROFESIONAL
            </div>

            <h3 className="mt-2 text-[24px] lg:text-[28px] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-[#222222]">
              BOTICA
              <br />
              NOVA SALUD
            </h3>

            <div className="mt-8 space-y-4 text-[12px] text-[#222222] leading-[1.4] font-normal">
              <p>
                Botica Nova Salud opera bajo estrictos estándares de Buenas
                Prácticas de Almacenamiento (BPA) y Buenas Prácticas de
                Dispensación (BPD) supervisadas por la autoridad sanitaria
                DIGEMID.
              </p>
              <p>
                Garantizamos la procedencia 100% auténtica de cada medicamento,
                adquiriendo únicamente de laboratorios formales certificados.
                Nuestros profesionales Químicos Farmacéuticos velan por la salud
                y economía de tu hogar con una atención cercana, respetuosa y
                ética.
              </p>
            </div>

            {/* Quality badges */}
            <div className="mt-6 pt-5 border-t border-[#EDF1F4] space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#222222]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />
                Químicos Farmacéuticos Colegiados
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#222222]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />
                Lotes y Vencimientos Claros
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#222222]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />
                Atención Presencial y Delivery Confiable
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={onOpenBrand}
              className="btn_anim_1 w-[215px] h-[62px] bg-white text-[#222222] text-[11px] font-extrabold uppercase tracking-[0.03em] flex items-center justify-center cursor-pointer border border-[#222222] hover:bg-[#222222] hover:text-white transition-colors"
            >
              CONOCER MÁS
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
