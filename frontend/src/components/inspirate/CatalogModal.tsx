import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Check, Filter } from 'lucide-react';
import { Product, PRODUCTS_CATALOG } from '../../data/inspirateData';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  favorites: string[];
  onSelectProduct: (product: Product) => void;
}

export const CatalogModal: React.FC<CatalogModalProps> = ({
  isOpen,
  onClose,
  initialCategory,
  onAddToCart,
  onToggleFavorite,
  favorites,
  onSelectProduct,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'todos');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const categories = [
    { id: 'todos', label: 'Todo el Catálogo' },
    { id: 'medicamentos', label: 'Farmacia Ética' },
    { id: 'cardiovascular', label: 'Cardio & Crónicos' },
    { id: 'dermocosmetica', label: 'Dermocosmética' },
    { id: 'pediatria', label: 'Cuidado Pediátrico' },
  ];

  const filteredProducts =
    activeCategory === 'todos'
      ? PRODUCTS_CATALOG
      : PRODUCTS_CATALOG.filter((p) => p.category === activeCategory);

  const handleAdd = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(p);
    setAddedIds((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [p.id]: false }));
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white shadow-2xl p-6 sm:p-10 my-6 text-[#222222] border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0d9488] block mb-1">
              Botica Nova Salud • Registro DIGEMID
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#222222]">
              Catálogo de Medicamentos & Salud
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-[#222222] transition-colors cursor-pointer"
            aria-label="Cerrar catálogo"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Categories Filter Tabs */}
        <div className="py-4 flex flex-wrap items-center gap-2 border-b border-gray-100">
          <Filter className="w-4 h-4 text-gray-400 mr-2" />
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === c.id
                  ? 'bg-[#0d9488] text-white'
                  : 'bg-gray-100 text-[#555555] hover:bg-gray-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Products Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-6 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="group bg-white border border-gray-100 flex flex-col justify-between p-4 cursor-pointer hover:shadow-md transition-shadow relative"
              >
                <div>
                  <div className="w-full h-52 bg-[#f8f8f8] mb-4 flex items-center justify-center overflow-hidden">
                    <img loading="lazy" decoding="async"
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-contain p-2 group-hover:scale-108 transition-transform duration-500"
                    />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0d9488] block mb-1">
                    {p.metal}
                  </span>
                  <h3 className="text-sm font-black uppercase text-[#222222] leading-snug mb-2 line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed mb-3">
                    {p.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-black text-[#222222]">
                    {p.priceFormatted}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(p);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Añadir a favoritos"
                    >
                      <Heart
                        className={`w-4 h-4 ${favorites.includes(p.id) ? 'fill-red-500 text-red-500' : ''}`}
                      />
                    </button>
                    <button
                      onClick={(e) => handleAdd(p, e)}
                      className={`p-2 rounded text-xs font-bold uppercase transition-all ${
                        addedIds[p.id]
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#222222] text-white hover:bg-[#444444]'
                      }`}
                      aria-label="Añadir a la bolsa"
                    >
                      {addedIds[p.id] ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
