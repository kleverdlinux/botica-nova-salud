import React, { useState } from 'react';
import { ARTICLES, Article } from '../../data/inspirateData';

interface JournalSectionProps {
  onSelectArticle: (article: Article) => void;
}

export const JournalSection: React.FC<JournalSectionProps> = ({
  onSelectArticle,
}) => {
  const [showAll, setShowAll] = useState(false);

  const featuredArticle = ARTICLES[0];
  const secondaryArticles = ARTICLES.slice(1, 3);
  const extraArticles = ARTICLES.slice(3);

  return (
    <section
      id="journal"
      className="bg-[#EDF1F4] py-[110px] lg:py-[140px] px-[10px] sm:px-[20px] select-none"
    >
      {/* Staggered Asymmetric Editorial Layout (matches rec1146708296 + rec1154873091 in s08-reviews.png & s09-journal.png) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[20px] items-start">
        {/* Left Column (50% / 6 cols): Featured Large Post */}
        <div className="lg:col-span-6">
          <article
            onClick={() => onSelectArticle(featuredArticle)}
            className="group bg-white cursor-pointer flex flex-col"
          >
            {/* Image Container with 0.45s ease-out scale(1.1) */}
            <div className="relative w-full h-[360px] sm:h-[460px] overflow-hidden bg-[#d3d7db]">
              <span className="absolute top-[10px] left-[10px] z-10 bg-white px-[10px] py-[6px] text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#A6A9AD]">
                {featuredArticle.tag}
              </span>
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                className="w-full h-full object-cover object-center transition-transform duration-[450ms] ease-out group-hover:scale-110"
              />
            </div>

            {/* White Content Box */}
            <div className="p-[20px] sm:p-[25px] min-h-[160px] flex flex-col justify-between bg-white">
              <h3 className="text-[20px] sm:text-[24px] font-bold text-[#222222] leading-[1.15] tracking-[-0.02em]">
                {featuredArticle.title}
              </h3>

              <div className="mt-8 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.02em]">
                <span className="text-[#A6A9AD]">{featuredArticle.date}</span>
                <span className="text-[#A6A9AD] transition-colors duration-300 group-hover:text-[#222222]">
                  LEER MÁS
                </span>
              </div>
            </div>
          </article>
        </div>

        {/* Right Column (50% / 6 cols): Section Heading + 2 Offset Smaller Posts + CTA */}
        <div className="lg:col-span-6 flex flex-col">
          {/* Heading Block Positioned Above Columns 2 & 3 */}
          <div className="pt-[30px] lg:pt-[75px] pb-[45px] lg:pb-[75px] flex flex-col items-center text-center px-4">
            <h2 className="text-[28px] sm:text-[34px] lg:text-[38px] font-extrabold uppercase tracking-[-0.03em] leading-[0.96] text-[#222222]">
              CONSEJOS DE SALUD
              <br />
              <span className="text-[#0d9488]">& BIENESTAR</span>
            </h2>
            <p className="mt-4 text-[12px] sm:text-[13px] text-[#555555] leading-[1.4] max-w-[340px] font-normal">
              Guías educativas elaboradas por profesionales farmacéuticos para
              ayudarte a tomar decisiones informadas sobre prevención y cuidado
              familiar.
            </p>
          </div>

          {/* 2 Smaller Posts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px] lg:pl-[20px]">
            {secondaryArticles.map((article) => (
              <article
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className="group bg-white cursor-pointer flex flex-col"
              >
                {/* Image Container with 0.45s ease-out scale(1.1) */}
                <div className="relative w-full h-[210px] overflow-hidden bg-[#d3d7db]">
                  <span className="absolute top-[10px] left-[10px] z-10 bg-white px-[10px] py-[6px] text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#A6A9AD]">
                    {article.tag}
                  </span>
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover object-center transition-transform duration-[450ms] ease-out group-hover:scale-110"
                  />
                </div>

                {/* White Content Box */}
                <div className="p-[16px] min-h-[135px] flex flex-col justify-between bg-white">
                  <h3 className="text-[13px] sm:text-[14px] font-semibold text-[#222222] leading-[1.2]">
                    {article.title}
                  </h3>

                  <div className="mt-6 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.02em]">
                    <span className="text-[#A6A9AD]">{article.date}</span>
                    <span className="text-[#A6A9AD] transition-colors duration-300 group-hover:text-[#222222]">
                      LEER MÁS
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Read All Articles Button (.btn_anim_1) */}
          <div className="mt-[35px] flex justify-center lg:pl-[20px]">
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="btn_anim_1 w-[225px] h-[62px] bg-transparent text-[#222222] text-[11px] font-extrabold uppercase tracking-[0.03em] flex items-center justify-center cursor-pointer"
            >
              {showAll ? 'OCULTAR ARTÍCULOS' : 'LEER TODOS LOS ARTÍCULOS'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Articles Row */}
      {showAll && extraArticles.length > 0 && (
        <div className="mt-[30px] grid grid-cols-1 md:grid-cols-3 gap-[20px]">
          {extraArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="group bg-white cursor-pointer flex flex-col"
            >
              <div className="relative w-full h-[240px] overflow-hidden bg-[#d3d7db]">
                <span className="absolute top-[10px] left-[10px] z-10 bg-white px-[10px] py-[6px] text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#A6A9AD]">
                  {article.tag}
                </span>
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover object-center transition-transform duration-[450ms] ease-out group-hover:scale-110"
                />
              </div>

              <div className="p-[20px] min-h-[140px] flex flex-col justify-between bg-white">
                <h3 className="text-[15px] font-bold text-[#222222] leading-[1.2]">
                  {article.title}
                </h3>

                <div className="mt-6 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.02em]">
                  <span className="text-[#A6A9AD]">{article.date}</span>
                  <span className="text-[#A6A9AD] transition-colors duration-300 group-hover:text-[#222222]">
                    LEER MÁS
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
