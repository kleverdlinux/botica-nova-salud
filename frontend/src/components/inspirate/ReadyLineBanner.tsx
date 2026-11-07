import React, { useState } from 'react';
import { ASSETS, CATEGORIES } from '../../data/inspirateData';

interface ReadyLineBannerProps {
  onSelectCategory: (catId: string) => void;
}

export const ReadyLineBanner: React.FC<ReadyLineBannerProps> = ({
  onSelectCategory,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <section className="px-[10px] sm:px-[20px] pt-[20px] bg-white">
      <div className="relative w-full h-[760px] lg:h-[980px] overflow-hidden select-none flex flex-col justify-between items-center text-center py-[75px] lg:py-[90px] px-4">
        {/* Default Background Image */}
        <div className="absolute inset-0 z-0">
          <img loading="lazy" decoding="async"
            src={ASSETS.readyLineBg}
            alt="Categorías de Salud Botica Nova Salud"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        {/* Interactive Category Hover Background Layers */}
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ease-out ${
              hoveredCategory === cat.id ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img loading="lazy" decoding="async"
              src={cat.image}
              alt={cat.name}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/45" />
          </div>
        ))}

        {/* Top Headline Block */}
        <div className="relative z-20 flex flex-col items-center max-w-[960px]">
          <p className="text-[12px] sm:text-[14px] text-white/90 font-medium tracking-[0.05em] uppercase">
            Dispensación Ética & Respaldo DIGEMID
          </p>

          <h2 className="mt-6 lg:mt-8 text-[32px] sm:text-[48px] lg:text-[60px] font-extrabold uppercase text-white tracking-[-0.03em] leading-[0.95]">
            CATEGORÍAS DE SALUD & BIENESTAR
          </h2>

          <p className="mt-5 text-[12px] sm:text-[14px] text-white/90 leading-[1.4] max-w-[520px] font-normal">
            Medicamentos de prescripción, tratamientos continuos y dermocosmética.
            <br />
            Procedencia 100% de laboratorios certificados al alcance de tu familia.
          </p>
        </div>

        {/* Middle Interactive Category Triggers */}
        <div className="relative z-20 flex flex-wrap items-center justify-center gap-6 sm:gap-12 lg:gap-[64px] my-auto">
          {CATEGORIES.map((cat) => {
            const isHovered = hoveredCategory === cat.id;
            return (
              <button
                key={cat.id}
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onFocus={() => setHoveredCategory(cat.id)}
                onBlur={() => setHoveredCategory(null)}
                onClick={() => onSelectCategory(cat.id)}
                className={`opacity_btn text-[13px] lg:text-[14px] font-extrabold uppercase tracking-[0.04em] text-white cursor-pointer py-2 px-3 transition-all ${
                  isHovered ? 'opacity-100 scale-105 text-[#2dd4bf]' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Bottom CTA Button (.btn_anim_2) */}
        <div className="relative z-20">
          <button
            onClick={() => onSelectCategory('ALL')}
            className="btn_anim_2 w-[275px] h-[62px] bg-transparent text-white text-[11px] font-extrabold uppercase tracking-[0.04em] flex items-center justify-center cursor-pointer border border-white/40 hover:border-white transition-colors"
          >
            VER CATÁLOGO COMPLETO
          </button>
        </div>
      </div>
    </section>
  );
};
