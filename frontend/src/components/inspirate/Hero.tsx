import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ASSETS } from '../../data/inspirateData';

interface HeroProps {
  onOpenQuotation: () => void;
  onOpenCatalog: () => void;
  onOpenBrand: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenQuotation,
  onOpenCatalog,
  onOpenBrand,
}) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ASSETS.heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="top"
      className="relative w-full min-h-[840px] lg:h-[920px] bg-[#959492] overflow-hidden select-none"
    >
      {/* Background Slideshow */}
      {ASSETS.heroSlides.map((src, idx) => (
        <div
          key={src}
          className={`absolute inset-0 ${
            idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          } ${currentSlide === 0 && idx === 0 ? '' : 'transition-opacity duration-700 ease-out'}`}
        >
          {idx === 0 ? (
            <picture className="w-full h-full block">
              <source media="(max-width: 640px)" srcSet="/media/home/hero-slide-1-mobile.webp" type="image/webp" />
              <source srcSet="/media/home/hero-slide-1.webp" type="image/webp" />
              <img
                src={src}
                alt="Botica Nova Salud - Salud & Confianza Cerca de tu Familia"
                loading="eager"
                decoding="sync"
                fetchPriority="high"
                className="w-full h-full object-cover object-center"
              />
            </picture>
          ) : (
            <img
              src={src}
              alt={`Botica Nova Salud ${idx + 1}`}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="w-full h-full object-cover object-center"
            />
          )}
        </div>
      ))}

      {/* Degradado suave y sutil solo en el lado izquierdo para lectura limpia */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent z-[15] pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-20 w-full h-full min-h-[840px] lg:h-[920px] flex flex-col lg:block px-5 pt-[110px] pb-10">
        {/* Left Centered Headline Block (matches elemIds 1750800326340 & 1750800326351) */}
        <div className="lg:absolute lg:left-[40px] xl:left-[50px] lg:top-[185px] w-full lg:w-[490px] flex flex-col items-center text-center">
          {/* Clean and subtle brand link matching Captura 3 */}
          <button
            type="button"
            onClick={onOpenBrand}
            className="inline-block mb-6 text-[13px] sm:text-[14px] font-medium text-white/95 hover:text-[#2dd4bf] transition-colors cursor-pointer tracking-wide underline underline-offset-4 decoration-white/60 hover:decoration-[#2dd4bf]"
          >
            Farmacia Ética & Certificación DIGEMID →
          </button>

          {/* Dual-Color Layered Title */}
          <h1 className="font-extrabold uppercase tracking-[-0.03em] leading-[0.94] text-[36px] sm:text-[46px] lg:text-[54px]">
            <span className="block text-white">SALUD & CONFIANZA</span>
            <span className="block text-[#2dd4bf] mt-1 drop-shadow-sm">CERCA DE TU FAMILIA</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-[13px] lg:text-[14px] text-white/90 leading-[1.45] max-w-[360px] font-normal">
            Atención farmacéutica personalizada, medicamentos originales certificados y seguimiento clínico profesional.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <a
              href="https://wa.me/51955545561?text=Hola%20Botica%20Nova%20Salud,%20deseo%20consultar%20sobre%20medicamentos%20y%20delivery"
              target="_blank"
              rel="noopener noreferrer"
              className="btn_anim_2 w-[240px] h-[54px] bg-[#25D366] text-white text-[11px] font-extrabold uppercase tracking-[0.05em] flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:bg-[#20ba5a] transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg>
              <span>PEDIR POR WHATSAPP</span>
            </a>
            <button
              onClick={onOpenCatalog}
              className="btn_anim_2 w-[200px] h-[54px] bg-black/40 border border-white/40 text-white text-[11px] font-extrabold uppercase tracking-[0.05em] flex items-center justify-center cursor-pointer hover:bg-white hover:text-black transition-all"
            >
              VER CATÁLOGO
            </button>
          </div>

          {/* Prescription Quote link */}
          {onOpenQuotation && (
            <button
              type="button"
              onClick={onOpenQuotation}
              className="mt-4 text-[12px] font-semibold text-white/80 hover:text-[#2dd4bf] underline underline-offset-4 cursor-pointer transition-colors"
            >
              ¿Tienes receta médica? Cotízala al instante aquí →
            </button>
          )}
        </div>

        {/* Bottom-Right Floating Card: Link directly to product in catalog */}
        <div
          onClick={() => navigate('/product/fotoprotector-isdin-fusion-water-magic-spf50')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') navigate('/product/fotoprotector-isdin-fusion-water-magic-spf50');
          }}
          className="group mt-12 lg:mt-0 self-center lg:self-auto lg:absolute lg:right-[24px] lg:bottom-[24px] w-full max-w-[340px] bg-white p-[12px] pb-[20px] cursor-pointer shadow-2xl rounded-sm hover:ring-2 hover:ring-[#0d9488]/40 transition-all"
        >
          {/* Badge */}
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[9px] font-extrabold tracking-[0.08em] uppercase bg-zinc-950 text-white px-2 py-0.5">
              RECOMENDADO DEL DÍA
            </span>
            <span className="text-[10px] font-bold text-[#0d9488]">
              ● EN STOCK
            </span>
          </div>

          {/* Product Studio Image */}
          <div className="w-full h-[240px] bg-[#f8fafc] overflow-hidden relative flex items-center justify-center p-4 rounded-sm">
            <img
              src={ASSETS.heroCardRing}
              alt="Fotoprotector ISDIN Fusion Water Magic SPF 50"
              loading="eager"
              decoding="async"
              width={240}
              height={240}
              className="w-full h-full object-contain transition-transform duration-[450ms] ease-out group-hover:scale-[1.12]"
            />
          </div>

          {/* Info */}
          <div className="mt-3 px-2 text-center">
            <h4 className="text-[13px] font-extrabold text-[#18181b] uppercase tracking-tight">
              ISDIN Fusion Water Magic SPF 50
            </h4>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="text-[15px] font-black text-[#0f766e]">S/ 104.90</span>
              <span className="text-[11px] text-zinc-500 font-medium">Frasco 50 ml</span>
            </div>
            <p className="mt-2 text-[11px] text-zinc-600 leading-[1.35] line-clamp-2">
              Fotoprotección facial ultraligera de fase acuosa. Control de oleosidad y absorción inmediata.
            </p>
          </div>

          {/* Bottom Link */}
          <div className="mt-4 text-center border-t border-zinc-100 pt-3">
            <span className="inline-block text-[11px] font-black uppercase tracking-[0.08em] text-[#0d9488] transition-colors group-hover:underline">
              VER PRODUCTO COMPLETO →
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
