import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ASSETS, PRODUCTS, Product } from '../../data/inspirateData';

interface HitsShowcaseProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectProduct?: (product: Product) => void;
  onQuickOrder?: (product: Product) => void;
  onOpenCatalog?: () => void;
  onOpenProductModal?: (slug: string) => void;
}

export const HitsShowcase: React.FC<HitsShowcaseProps> = ({
  favorites,
  onToggleFavorite,
  onOpenProductModal,
}) => {
  const navigate = useNavigate();
  const [leftSpotHovered, setLeftSpotHovered] = useState(false);
  const [rightTopHovered, setRightTopHovered] = useState(false);
  const [rightBottomHovered, setRightBottomHovered] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  const getProductSlug = (p: Product) => {
    if (p.id === 'apronax-550mg') return 'apronax-550-mg';
    if (p.id === 'neurobion-5000-jeringa') return 'neurobion-5000-oral-60tabs';
    return p.id;
  };

  const displayedProducts = PRODUCTS.slice(0, visibleCount);

  return (
    <section
      id="hits"
      className="bg-[#EDF1F4] pt-[100px] lg:pt-[140px] pb-[90px] lg:pb-[110px] px-[10px] sm:px-[20px] select-none"
    >
      {/* Section Heading */}
      <div className="mb-[40px] lg:mb-[55px]">
        <h2 className="font-extrabold uppercase tracking-[-0.03em] leading-[0.94] text-[32px] sm:text-[44px] lg:text-[54px]">
          <span className="block text-[#222222]">PRODUCTOS DE SALUD</span>
          <span className="block text-[#0d9488] mt-1">MÁS PEDIDOS & RECOMENDADOS</span>
        </h2>
      </div>

      {/* Interactive Dual Model Editorial Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
        {/* Left Model Photo */}
        <div className="relative w-full h-[620px] sm:h-[760px] lg:h-[920px] overflow-hidden bg-[#c8c9cb]">
          <img loading="lazy" decoding="async"
            src="/media/home/about-farmaceutica-historia-flipped.jpg"
            alt="Atención farmacéutica profesional Botica Nova Salud"
            className="w-full h-full object-cover object-center"
          />

          {/* Dimming Overlay */}
          <div
            className={`absolute inset-0 bg-[#222222] pointer-events-none transition-opacity duration-200 ${
              leftSpotHovered ? 'opacity-40' : 'opacity-0'
            }`}
          />

          {/* Hotspot 1: Panadol Antigripal NF */}
          <div
            onMouseEnter={() => setLeftSpotHovered(true)}
            onMouseLeave={() => setLeftSpotHovered(false)}
            onClick={() => onOpenProductModal ? onOpenProductModal('panadol-antigripal-nf') : navigate('/product/panadol-antigripal-nf')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { if (onOpenProductModal) { onOpenProductModal('panadol-antigripal-nf'); } else { navigate('/product/panadol-antigripal-nf'); } }
            }}
            style={{ left: '17.2%', top: '31.5%' }}
            className="group absolute w-[210px] sm:w-[240px] h-[295px] sm:h-[335px] border border-white/60 bg-black/25 backdrop-blur-[2px] cursor-pointer z-20 flex flex-col justify-end p-[16px] transition-all hover:border-[#2dd4bf]"
          >
            {/* Default Transparent State Text */}
            <div className="relative z-10">
              <div className="text-[12px] sm:text-[13px] font-extrabold uppercase text-white tracking-[0.02em] leading-tight">
                PANADOL ANTIGRIPAL NF
              </div>
              <div className="text-[11px] sm:text-[12px] text-[#2dd4bf] mt-0.5 font-bold leading-tight">
                S/ 2.40 • Alivio Rápido
              </div>
            </div>

            {/* White Product Card Reveal on Hover */}
            <div
              className={`absolute inset-0 bg-white p-[16px] flex flex-col justify-between transition-opacity duration-200 z-20 shadow-xl ${
                leftSpotHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="flex-1 flex items-center justify-center overflow-hidden p-2">
                <img loading="lazy" decoding="async"
                  src={ASSETS.hitWhite1}
                  alt="Panadol Antigripal NF"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="text-[12px] sm:text-[13px] font-extrabold uppercase text-[#222222] tracking-[0.02em] leading-tight">
                  PANADOL ANTIGRIPAL NF
                </div>
                <div className="text-[11px] sm:text-[12px] text-[#0d9488] font-bold mt-0.5 leading-tight">
                  S/ 2.40 • Sobre x 2 tabletas
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Model Photo */}
        <div className="relative w-full h-[680px] sm:h-[820px] lg:h-[920px] overflow-hidden bg-[#b5b7ba]">
          <img loading="lazy" decoding="async"
            src={ASSETS.hitModelRight}
            alt="Cuidado preventivo y tópico clínico"
            className="w-full h-full object-cover object-center"
          />

          {/* Dimming Overlay */}
          <div
            className={`absolute inset-0 bg-[#222222] pointer-events-none transition-opacity duration-200 ${
              rightTopHovered || rightBottomHovered ? 'opacity-40' : 'opacity-0'
            }`}
          />

          {/* Hotspot 2 (Top Right): Apronax 550 mg */}
          <div
            onMouseEnter={() => setRightTopHovered(true)}
            onMouseLeave={() => setRightTopHovered(false)}
            onClick={() => onOpenProductModal ? onOpenProductModal('apronax-550-mg') : navigate('/product/apronax-550-mg')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { if (onOpenProductModal) { onOpenProductModal('apronax-550-mg'); } else { navigate('/product/apronax-550-mg'); } }
            }}
            style={{ left: '42.8%', top: '7.5%' }}
            className="group absolute w-[200px] sm:w-[240px] h-[280px] sm:h-[335px] border border-white/60 bg-black/25 backdrop-blur-[2px] cursor-pointer z-20 flex flex-col justify-end p-[16px] transition-all hover:border-[#2dd4bf]"
          >
            {/* Default Transparent State Text */}
            <div className="relative z-10">
              <div className="text-[12px] sm:text-[13px] font-extrabold uppercase text-white tracking-[0.02em] leading-tight">
                APRONAX 550 MG
              </div>
              <div className="text-[11px] sm:text-[12px] text-[#2dd4bf] mt-0.5 font-bold leading-tight">
                S/ 7.20 • Alivio 12 horas
              </div>
            </div>

            {/* White Product Card Reveal on Hover */}
            <div
              className={`absolute inset-0 bg-white p-[16px] flex flex-col justify-between transition-opacity duration-200 z-20 shadow-xl ${
                rightTopHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="flex-1 flex items-center justify-center overflow-hidden p-2">
                <img loading="lazy" decoding="async"
                  src={ASSETS.hitWhite2}
                  alt="Apronax 550 mg Naproxeno Sódico"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="text-[12px] sm:text-[13px] font-extrabold uppercase text-[#222222] tracking-[0.02em] leading-tight">
                  APRONAX 550 MG
                </div>
                <div className="text-[11px] sm:text-[12px] text-[#0d9488] font-bold mt-0.5 leading-tight">
                  S/ 7.20 • Blíster x 4 tabletas
                </div>
              </div>
            </div>
          </div>

          {/* Hotspot 3 (Bottom Right): ISDIN Fotoprotector */}
          <div
            onMouseEnter={() => setRightBottomHovered(true)}
            onMouseLeave={() => setRightBottomHovered(false)}
            onClick={() => onOpenProductModal ? onOpenProductModal('fotoprotector-isdin-fusion-water-magic-spf50') : navigate('/product/fotoprotector-isdin-fusion-water-magic-spf50')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { if (onOpenProductModal) { onOpenProductModal('fotoprotector-isdin-fusion-water-magic-spf50'); } else { navigate('/product/fotoprotector-isdin-fusion-water-magic-spf50'); } }
            }}
            style={{ left: '42.8%', top: '52.5%' }}
            className="group absolute w-[200px] sm:w-[240px] h-[280px] sm:h-[335px] border border-white/60 bg-black/25 backdrop-blur-[2px] cursor-pointer z-20 flex flex-col justify-end p-[16px] transition-all hover:border-[#2dd4bf]"
          >
            {/* Default Transparent State Text */}
            <div className="relative z-10">
              <div className="text-[12px] sm:text-[13px] font-extrabold uppercase text-white tracking-[0.02em] leading-tight">
                ISDIN FUSION WATER
              </div>
              <div className="text-[11px] sm:text-[12px] text-[#2dd4bf] mt-0.5 font-bold leading-tight">
                S/ 104.90 • SPF 50 Facial
              </div>
            </div>

            {/* White Product Card Reveal on Hover */}
            <div
              className={`absolute inset-0 bg-white p-[16px] flex flex-col justify-between transition-opacity duration-200 z-20 shadow-xl ${
                rightBottomHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="flex-1 flex items-center justify-center overflow-hidden p-2">
                <img loading="lazy" decoding="async"
                  src={ASSETS.hitWhite3}
                  alt="Fotoprotector ISDIN Fusion Water Magic SPF 50"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="text-[12px] sm:text-[13px] font-extrabold uppercase text-[#222222] tracking-[0.02em] leading-tight">
                  ISDIN FUSION WATER
                </div>
                <div className="text-[11px] sm:text-[12px] text-[#0d9488] font-bold mt-0.5 leading-tight">
                  S/ 104.90 • Frasco x 50 ml
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Catalog Grid (rec1156991051) */}
      <div className="mt-[20px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
        {displayedProducts.map((product) => {
          const isFav = favorites.includes(product.id);
          return (
            <div
              key={product.id}
              onClick={() => onOpenProductModal ? onOpenProductModal(getProductSlug(product)) : navigate(`/product/${getProductSlug(product)}`)}
              className="group bg-white flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-md"
            >
              {/* Image Area with Secondary Hover Image */}
              <div className="relative w-full aspect-square bg-white overflow-hidden p-4">
                <img loading="lazy" decoding="async"
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain object-center transition-opacity duration-500 group-hover:opacity-0"
                />
                <img loading="lazy" decoding="async"
                  src={product.hoverImage || product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-contain object-center p-4 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
                />

                {/* Favorite Heart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(getProductSlug(product));
                  }}
                  aria-label="Añadir a favoritos"
                  className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white rounded-full transition-colors cursor-pointer shadow-xs"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={isFav ? '#0d9488' : 'none'}
                    stroke={isFav ? '#0d9488' : '#222222'}
                    strokeWidth="1.8"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              {/* Product Details */}
              <div className="p-5 flex flex-col flex-1 justify-between bg-white border-t border-[#EDF1F4]">
                <div>
                  <div className="text-[13px] font-extrabold uppercase text-[#222222] group-hover:text-[#0d9488] transition-colors tracking-[0.01em] leading-snug">
                    {product.name}
                  </div>
                  <div className="text-[12px] text-[#A6A9AD] mt-1 line-clamp-1">
                    {product.subtitle}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#EDF1F4] flex items-center justify-between">
                  <span className="text-[13px] font-extrabold text-[#0d9488]">
                    {product.priceFormatted}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenProductModal) { onOpenProductModal(getProductSlug(product)); } else { navigate(`/product/${getProductSlug(product)}`); }
                    }}
                    className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#18181b] hover:text-[#0d9488] transition-colors cursor-pointer"
                  >
                    VER DETALLE →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button (matches #rec1156991051 .t-store__load-more-btn in custom.css) */}
      {visibleCount < PRODUCTS.length && (
        <div className="mt-[40px] flex justify-center">
          <button
            onClick={() => setVisibleCount(PRODUCTS.length)}
            className="btn_anim_1 h-[62px] px-[40px] bg-white text-[#222222] text-[11px] font-extrabold uppercase tracking-[0.04em] flex items-center justify-center cursor-pointer"
          >
            CARGAR MÁS
          </button>
        </div>
      )}
    </section>
  );
};
