import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Check, ShieldCheck } from 'lucide-react';
import { Product } from '../../data/inspirateData';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  isFavorite: boolean;
  onOpenQuotation: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  onOpenQuotation,
}) => {
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white shadow-2xl p-6 sm:p-10 my-6 text-[#222222] border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-[#222222] transition-colors cursor-pointer"
          aria-label="Cerrar detalle"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Product Image */}
          <div className="w-full h-80 sm:h-96 bg-[#f7f7f7] flex items-center justify-center overflow-hidden border border-gray-100 p-6 relative">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
            />
            {product.isHit && (
              <span className="absolute top-4 left-4 bg-[#222222] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1">
                Bestseller
              </span>
            )}
          </div>

          {/* Right Product Info */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#0d9488] block mb-1">
                Botica Nova Salud • {product.category.toUpperCase()}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#222222] leading-tight mb-2">
                {product.title}
              </h2>
              <p className="text-xs text-[#0d9488] font-bold mb-4 uppercase tracking-wider">
                {product.subtitle}
              </p>

              <p className="text-sm text-[#444444] leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Specs Box */}
              <div className="bg-[#fafafa] p-4 border border-gray-100 space-y-2 text-xs mb-6">
                <div className="flex items-center gap-2 text-[#222222]">
                  <ShieldCheck className="w-4 h-4 text-[#0d9488]" />
                  <span><strong>Laboratorio / Registro:</strong> {product.metal}</span>
                </div>
                <div className="flex items-center gap-2 text-[#222222]">
                  <Check className="w-4 h-4 text-[#0d9488]" />
                  <span><strong>Presentación:</strong> {product.stone}</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 flex items-baseline gap-3">
                <span className="text-3xl font-black text-[#222222]">
                  {product.priceFormatted}
                </span>
                <span className="text-xs text-[#0d9488] font-bold bg-teal-50 px-2 py-0.5 rounded">
                  ● EN STOCK DISPONIBLE
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAdd}
                  className="btn-corner-accent btn-corner-dark flex-1 py-3.5 text-xs font-black uppercase tracking-widest cursor-pointer"
                >
                  {added ? (
                    <span className="flex items-center justify-center gap-1.5 text-emerald-600">
                      <Check className="w-4 h-4" /> Añadido a la Bolsa
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <ShoppingBag className="w-4 h-4" /> Añadir a la Bolsa
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onToggleFavorite(product)}
                  className={`p-3.5 border transition-all cursor-pointer ${
                    isFavorite
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300'
                  }`}
                  aria-label="Añadir a favoritos"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Custom variation request */}
              <button
                onClick={() => {
                  onClose();
                  onOpenQuotation();
                }}
                className="w-full text-center text-[11px] font-extrabold uppercase tracking-wider text-[#0d9488] hover:text-[#0b766c] py-2 cursor-pointer border-t border-gray-100"
              >
                ¿Deseas consultar por tu receta o dosis adecuada? Consultar aquí →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
