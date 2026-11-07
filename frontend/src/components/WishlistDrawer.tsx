import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import toast from '../utils/alertaSweet.js';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { items, removeItem, clearWishlist } = useWishlist();
  const addItemToCart = useCart((state) => state.addItem);

  if (!isOpen) return null;

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    addItemToCart(product);
    toast.success(`${product.name} añadido al carrito`);
  };

  const handleProductClick = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between text-[#18181b] animate-slide-left border-l border-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-[#0d9488]">
              <Heart className="w-4 h-4 fill-[#0d9488]" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-[#18181b]">
                Mis Favoritos
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium">
                {items.length} {items.length === 1 ? 'producto guardado' : 'productos guardados'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black transition-colors cursor-pointer"
            aria-label="Cerrar favoritos"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* List of Wishlist Products */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 px-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4">
                <Heart className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-extrabold uppercase text-[#18181b] mb-1">
                Tu lista está vacía
              </h3>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed mb-6">
                Guarda los medicamentos y productos de salud que necesitas para comprarlos o cotizarlos más tarde.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/catalogo');
                }}
                className="px-6 py-3 bg-[#18181b] hover:bg-[#0d9488] text-white text-xs font-black uppercase tracking-wider transition-colors rounded-sm cursor-pointer inline-flex items-center gap-2 shadow-sm"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            items.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.slug)}
                className="group relative flex gap-4 p-3.5 rounded-lg border border-zinc-200 hover:border-[#0d9488]/50 bg-white hover:shadow-sm transition-all cursor-pointer"
              >
                {/* Product Image */}
                <div className="w-20 h-20 bg-zinc-50 rounded border border-zinc-100 overflow-hidden shrink-0 flex items-center justify-center p-2">
                  <img
                    src={product.images?.[0] || '/media/botica-hero-clean.jpg'}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#18181b] group-hover:text-[#0d9488] transition-colors line-clamp-2 leading-snug">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5 font-medium">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                    <span className="text-sm font-black text-[#0d9488]">
                      S/ {(product.unitPrice || product.price).toFixed(2)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(product, e)}
                        title="Añadir a la bolsa"
                        className="px-2.5 py-1 bg-[#18181b] hover:bg-[#0d9488] text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Añadir</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(product.id);
                        }}
                        title="Quitar de favoritos"
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 space-y-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/catalogo');
              }}
              className="w-full py-3 bg-[#18181b] hover:bg-[#0d9488] text-white text-xs font-black uppercase tracking-wider transition-colors rounded-sm cursor-pointer shadow-sm text-center"
            >
              Seguir Comprando en el Catálogo
            </button>
            <button
              type="button"
              onClick={clearWishlist}
              className="w-full text-center text-[11px] font-bold text-zinc-400 hover:text-red-500 transition-colors uppercase tracking-wider py-1 cursor-pointer"
            >
              Vaciar Lista de Favoritos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
