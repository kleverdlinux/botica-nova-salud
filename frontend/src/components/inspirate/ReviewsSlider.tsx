import React, { useState } from 'react';
import { REVIEWS } from '../../data/inspirateData';

export const ReviewsSlider: React.FC = () => {
  const [startIndex, setStartIndex] = useState(0);

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % REVIEWS.length);
  };

  const visibleReviews = [
    REVIEWS[startIndex % REVIEWS.length],
    REVIEWS[(startIndex + 1) % REVIEWS.length],
    REVIEWS[(startIndex + 2) % REVIEWS.length],
  ];

  return (
    <section
      id="reviews"
      className="bg-[#222222] py-[100px] lg:py-[130px] px-[10px] sm:px-[20px] select-none"
    >
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-[45px]">
        <h2 className="font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-[26px] sm:text-[34px] lg:text-[42px] max-w-[820px]">
          <span className="text-white">EXPERIENCIAS </span>
          <span className="text-[#2dd4bf]">DE NUESTROS PACIENTES</span>
          <span className="text-[#8e9396] text-[20px] sm:text-[24px] lg:text-[28px] font-semibold block mt-1">
            ATENDIDOS CON ÉTICA Y CALIDEZ EN BOTICA NOVA SALUD
          </span>
        </h2>

        {/* Slider Controls */}
        <div className="flex items-center gap-[8px] self-end">
          <button
            onClick={handlePrev}
            aria-label="Reseña anterior"
            className="w-[40px] h-[40px] border border-white/25 hover:border-[#2dd4bf] text-white hover:text-[#2dd4bf] flex items-center justify-center transition-colors duration-300 cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            aria-label="Siguiente reseña"
            className="w-[40px] h-[40px] border border-white/25 hover:border-[#2dd4bf] text-white hover:text-[#2dd4bf] flex items-center justify-center transition-colors duration-300 cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* 3-Column White Review Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
        {visibleReviews.map((review, idx) => (
          <div
            key={`${review.id}-${idx}`}
            className="bg-white p-[20px] pb-[28px] min-h-[540px] flex flex-col justify-between transition-all duration-300 shadow-md"
          >
            <div>
              {/* 140x200 Top-Left Portrait Thumbnail */}
              <div className="w-[140px] h-[190px] overflow-hidden bg-[#EDF1F4] border border-gray-100">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Patient Name & Service Type */}
              <div className="mt-[25px]">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-extrabold uppercase tracking-[0.01em] text-[#222222]">
                    {review.name}
                  </span>
                  <span className="text-[10px] bg-teal-50 text-[#0d9488] font-bold px-1.5 py-0.5 rounded">
                    ✓ Paciente Verificado
                  </span>
                </div>
                <div className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.03em] text-[#0d9488]">
                  {review.piece}
                </div>
              </div>
            </div>

            {/* Review Quote */}
            <p className="mt-[45px] text-[13px] text-[#222222] leading-[1.35] font-normal max-w-[380px]">
              {review.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
