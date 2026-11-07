import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../../data/inspirateData';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Product[];
  onRemoveFavorite: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 sm:p-8 animate-slide-left text-[#222222]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-current" />
            <h2 className="text-xl font-black uppercase tracking-tight text-[#222222]">
              Tus Favoritos ({favorites.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-[#222222] transition-colors cursor-pointer"
            aria-label="Cerrar favoritos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-6">
          {favorites.length === 0 ? (
            <div className="text-center py-16 text-[#888888]">
              <Heart className="w-12 h-12 stroke-[1.2] mx-auto mb-4 text-[#cccccc]" />
              <p className="text-sm font-bold uppercase tracking-wider mb-2">No tienes favoritos aún</p>
              <p className="text-xs text-[#999999] max-w-xs mx-auto">
                Guarda tus medicamentos y productos preferidos pulsando el icono del corazón en cualquier ficha del catálogo.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-3 bg-[#fafafa] border border-gray-100 items-center justify-between"
                >
                  <div className="w-16 h-16 bg-white overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black uppercase text-[#222222] truncate">
                      {product.title}
                    </h4>
                    <p className="text-[10px] text-[#0d9488] font-bold truncate">
                      {product.metal}
                    </p>
                    <span className="text-xs font-bold text-[#222222]">
                      {product.priceFormatted}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAddToCart(product)}
                      className="p-2 bg-[#222222] text-white hover:bg-[#0d9488] rounded text-xs transition-colors cursor-pointer"
                      aria-label="Añadir al pedido"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveFavorite(product.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      aria-label="Eliminar de favoritos"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 text-xs font-extrabold uppercase tracking-wider text-[#666666] hover:text-[#222222] border border-gray-200 text-center cursor-pointer"
          >
            Seguir Explorando el Catálogo
          </button>
        </div>
      </div>
    </div>
  );
};
