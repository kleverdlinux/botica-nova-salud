import React from 'react';
import { ASSETS } from '../../data/inspirateData';

interface FooterProps {
  onOpenQuotation: () => void;
  onOpenCatalog: (category?: string) => void;
  onOpenBuilder: () => void;
  onOpenBrand: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenQuotation,
  onOpenCatalog,
  onOpenBrand,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white pt-10 lg:pt-0 pb-6 px-[10px] sm:px-[20px] select-none relative z-30">
      {/* Upper Footer Row */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
        {/* Left Column: 2x2 Square Editorial Photo Grid Overlapping Consultation Section + Socials */}
        <div className="w-full lg:w-[360px] lg:-mt-[185px]">
          <div className="grid grid-cols-2 gap-[12px] w-full max-w-[360px]">
            {ASSETS.footerGrid.map((src, idx) => (
              <div
                key={src}
                onClick={() => onOpenCatalog('ALL')}
                className="w-full aspect-square overflow_class bg-[#EDF1F4] cursor-pointer group"
              >
                <img loading="lazy" decoding="async"
                  src={src}
                  alt={`18GEMS Colección ${idx + 1}`}
                  className="w-full h-full object-cover object-center transition-transform duration-[450ms] ease-out group-hover:scale-110"
                />
              </div>
            ))}
          </div>

          {/* Social Links List */}
          <div className="mt-10 flex flex-col items-start gap-2.5">
            <a
              href="https://t.me/+79678612729"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-extrabold uppercase tracking-[0.02em] text-[#222222] hover:opacity-50 transition-opacity duration-300"
            >
              TELEGRAM
            </a>
            <a
              href="https://wa.me/79678612729"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-extrabold uppercase tracking-[0.02em] text-[#222222] hover:opacity-50 transition-opacity duration-300"
            >
              WHATSAPP
            </a>
            <a
              href="https://ru.pinterest.com/18gems/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-extrabold uppercase tracking-[0.02em] text-[#222222] hover:opacity-50 transition-opacity duration-300"
            >
              PINTEREST
            </a>
            <a
              href="https://www.youtube.com/@18gems"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-extrabold uppercase tracking-[0.02em] text-[#222222] hover:opacity-50 transition-opacity duration-300"
            >
              YOUTUBE
            </a>
            <a
              href="https://www.instagram.com/18.gems"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-extrabold uppercase tracking-[0.02em] text-[#222222] hover:opacity-50 transition-opacity duration-300"
            >
              INSTAGRAM *
            </a>
          </div>

          <p className="mt-3 text-[10px] leading-[1.2] text-[#A6A9AD] max-w-[260px]">
            * La red social Instagram pertenece a la empresa Meta.
          </p>
        </div>

        {/* Right Column: Navigation & Direct Contact (matches s10-form.png & s11-footer.png) */}
        <div className="w-full lg:w-[355px] lg:pt-[150px] flex flex-col items-start">
          <nav className="flex flex-col items-start gap-2.5">
            <button
              onClick={onOpenQuotation}
              className="text-[11px] font-extrabold uppercase tracking-[0.02em] text-[#222222] hover:opacity-50 transition-opacity duration-300 cursor-pointer"
            >
              JOYAS A MEDIDA
            </button>
            <button
              onClick={() => onOpenCatalog('ALL')}
              className="text-[11px] font-extrabold uppercase tracking-[0.02em] text-[#222222] hover:opacity-50 transition-opacity duration-300 cursor-pointer"
            >
              CATÁLOGO
            </button>
            <button
              onClick={() => onOpenCatalog('NATURE')}
              className="text-[11px] font-extrabold uppercase tracking-[0.02em] text-[#222222] hover:opacity-50 transition-opacity duration-300 cursor-pointer"
            >
              COLECCIONES
            </button>
            <button
              onClick={onOpenBrand}
              className="text-[11px] font-extrabold uppercase tracking-[0.02em] text-[#222222] hover:opacity-50 transition-opacity duration-300 cursor-pointer"
            >
              SOBRE LA MARCA
            </button>
            <a
              href="#reviews"
              className="text-[11px] font-extrabold uppercase tracking-[0.02em] text-[#222222] hover:opacity-50 transition-opacity duration-300"
            >
              CLIENTES
            </a>
            <a
              href="#journal"
              className="text-[11px] font-extrabold uppercase tracking-[0.02em] text-[#222222] hover:opacity-50 transition-opacity duration-300"
            >
              BLOG
            </a>
            <a
              href="#consultation"
              className="text-[11px] font-extrabold uppercase tracking-[0.02em] text-[#222222] hover:opacity-50 transition-opacity duration-300"
            >
              CONTACTOS
            </a>
          </nav>

          {/* Phone, Address & Oversized Email */}
          <div className="mt-16">
            <a
              href="tel:+79678612729"
              className="block text-[11px] font-extrabold uppercase tracking-[0.02em] text-[#222222] hover:opacity-50 transition-opacity duration-300"
            >
              +7 967 861 27 29
            </a>
            <div className="mt-1.5 text-[11px] font-extrabold uppercase tracking-[0.02em] text-[#A6A9AD]">
              MOSCÚ, SADOVNICHESKAYA 29
            </div>
            <a
              href="mailto:info@18gems.ru"
              className="mt-3 block text-[24px] sm:text-[28px] font-extrabold uppercase tracking-[-0.03em] text-[#222222] hover:opacity-50 transition-opacity duration-300"
            >
              INFO@18GEMS.RU
            </a>
          </div>
        </div>
      </div>

      {/* Giant Full-Width Wordmark SVG (matches rec1124827931 elemId 1750853118830) */}
      <div className="mt-14 lg:mt-20 w-full">
        <img loading="lazy" decoding="async"
          src={ASSETS.footerLogoSvg}
          alt="18GEMS"
          className="w-full h-auto block select-none"
        />
      </div>

      {/* Bottom Legal & Credits Bar */}
      <div className="mt-6 pt-4 border-t border-[#d3d7db]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-[10px] leading-[1.25] text-[#A6A9AD]">
          <p>
            © 2025 IE Grachev Danila Evgenievich. Todos los derechos reservados.
            La copia y cualquier otro uso de los materiales del sitio sin el
            permiso del titular de los derechos está prohibido y conlleva
            responsabilidad según la legislación vigente.
          </p>
          <p>
            Este sitio de Internet y sus materiales tienen carácter meramente
            informativo y en ningún caso constituyen una oferta pública.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-[10px] font-extrabold uppercase tracking-[0.02em]">
          <span className="text-[#222222] hover:opacity-50 transition-opacity cursor-pointer">
            POLÍTICA DE PRIVACIDAD
          </span>
          <span className="text-[#222222] hover:opacity-50 transition-opacity cursor-pointer">
            ACUERDO DE USUARIO
          </span>
          <span className="text-[#222222]">
            DISEÑO WEB:{' '}
            <a
              href="https://t.me/KristinaKhudova"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A6A9AD] hover:text-[#222222] transition-colors"
            >
              KHUDOVA.DESIGN
            </a>
          </span>
          <button
            onClick={scrollToTop}
            className="text-[#A6A9AD] hover:text-[#222222] transition-colors cursor-pointer uppercase font-extrabold"
          >
            ARRIBA ↑
          </button>
        </div>
      </div>
    </footer>
  );
};
