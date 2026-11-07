import React from 'react';
import { ASSETS } from '../../data/inspirateData';

interface NatureCollectionProps {
  onExploreNature: () => void;
}

export const NatureCollection: React.FC<NatureCollectionProps> = ({
  onExploreNature,
}) => {
  return (
    <section className="px-[10px] sm:px-[20px] py-[20px] bg-white select-none">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] min-h-[680px] lg:h-[760px]">
        {/* Left White Editorial Column */}
        <div className="bg-white flex flex-col items-center justify-between text-center py-[45px] lg:py-[55px] px-6">
          {/* Top Title & Season */}
          <div className="flex flex-col items-center">
            <h2 className="text-[44px] sm:text-[56px] lg:text-[66px] font-extrabold uppercase tracking-[-0.04em] leading-[0.9] text-[#222222]">
              BIENESTAR
            </h2>
            <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.05em] leading-[1.3] text-[#0d9488]">
              LÍNEA NATURAL & PREVENTIVA
              <br />
              SUPLEMENTACIÓN CON RESPALDO CIENTÍFICO
            </p>
          </div>

          {/* Center Star & Description */}
          <div className="my-10 flex flex-col items-center max-w-[340px]">
            <img loading="lazy" decoding="async"
              src={ASSETS.starDark}
              alt="Nova Salud Bienestar"
              className="w-[28px] h-[28px] mb-8"
            />
            <p className="text-[13px] text-[#222222] leading-[1.4] font-normal">
              Suplementos de colágeno hidrolizado, citrato de magnesio,
              multivitamínicos y fitofármacos seleccionados para fortalecer el
              sistema inmune y preservar tu vitalidad.
            </p>
            <p className="mt-4 text-[13px] text-[#555555] leading-[1.4] font-normal">
              Formulaciones de alta biodisponibilidad procedentes de laboratorios
              certificados con registro sanitario vigente.
            </p>
          </div>

          {/* Bottom Button (.btn_anim_1) */}
          <div>
            <button
              onClick={onExploreNature}
              className="btn_anim_1 w-[260px] h-[62px] bg-white text-[#222222] text-[11px] font-extrabold uppercase tracking-[0.03em] flex items-center justify-center cursor-pointer border border-[#222222] hover:bg-[#222222] hover:text-white transition-colors"
            >
              EXPLORAR LÍNEA NATURAL
            </button>
          </div>
        </div>

        {/* Right Full-Height Image */}
        <div
          onClick={onExploreNature}
          className="group w-full h-[500px] lg:h-full overflow_class relative cursor-pointer"
        >
          <img loading="lazy" decoding="async"
            src={ASSETS.natureImg}
            alt="Línea de bienestar y suplementación Botica Nova Salud"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
      </div>
    </section>
  );
};
