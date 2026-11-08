import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ShoppingBag, Plus, ArrowRight, Pill } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { products, Product } from '@/data/products';
import { useCart } from '@/hooks/useCart';
import { notificarExito } from '@/utils/alertaSweet';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Función auxiliar para normalizar texto (quitar tildes y diacríticos)
const normalizeText = (text: string = ''): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Filtrado instantáneo por prefijo y relevancia
  const filteredProducts = useMemo(() => {
    const raw = searchTerm.trim();
    if (!raw) return [];

    const norm = normalizeText(raw);
    const tokens = norm.split(/\s+/).filter(Boolean);
    const isShort = norm.length <= 2;

    return products
      .filter((p) => {
        const prodName = normalizeText(p.name);
        const prodMat = normalizeText(p.materials || '');

        if (isShort) {
          // Búsqueda corta (1 o 2 letras, ej: "A"): buscar SOLO medicamentos cuyo nombre o principio inicie con dicha letra
          const nameWords = prodName.split(/\s+/);
          const matWords = prodMat.split(/\s+/);
          return nameWords.some((w) => w.startsWith(norm)) || matWords.some((w) => w.startsWith(norm));
        }

        const fullText = normalizeText(
          `${p.name} ${p.materials || ''} ${p.description || ''} ${p.collection || ''}`
        );
        return tokens.every((token) => fullText.includes(token));
      })
      .sort((a, b) => {
        const nameA = normalizeText(a.name);
        const nameB = normalizeText(b.name);

        const aStarts = nameA.startsWith(norm);
        const bStarts = nameB.startsWith(norm);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        const aWord = nameA.split(/\s+/).some((w) => w.startsWith(norm));
        const bWord = nameB.split(/\s+/).some((w) => w.startsWith(norm));
        if (aWord && !bWord) return -1;
        if (!aWord && bWord) return 1;

        return a.name.localeCompare(b.name);
      })
      .slice(0, 8); // Top 8 resultados más relevantes
  }, [searchTerm]);

  const handleSelectProduct = (product: Product) => {
    onClose();
    navigate(`/producto/${product.slug || product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
    notificarExito('Agregado', `${product.name} se añadió a la bolsa.`);
  };

  const handleVerTodos = () => {
    onClose();
    navigate(`/catalogo?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      handleVerTodos();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl">
        <DialogTitle className="sr-only">Búsqueda rápida de medicamentos</DialogTitle>
        {/* Cabecera del Buscador */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por fármaco, principio activo o síntoma..."
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Contenido / Resultados en Vivo */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
          {!searchTerm.trim() ? (
            <div className="py-8 text-center text-neutral-400 space-y-2">
              <Pill className="w-8 h-8 mx-auto text-teal-500/50" />
              <p className="text-xs font-semibold text-neutral-500">
                Escribe el nombre de un medicamento, marca o principio activo
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {['Paracetamol', 'Amoxicilina', 'Ibuprofeno', 'Omeprazol', 'Vitamina C'].map((ej) => (
                  <button
                    key={ej}
                    type="button"
                    onClick={() => setSearchTerm(ej)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300 transition cursor-pointer"
                  >
                    {ej}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-8 text-center text-neutral-400 space-y-1.5">
              <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                No encontramos productos para "{searchTerm}"
              </p>
              <p className="text-[11px] text-neutral-500">
                Revisa la ortografía o intenta buscar por principio activo.
              </p>
            </div>
          ) : (
            <>
              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                <span>Resultados Encontrados</span>
                <span>{filteredProducts.length} productos</span>
              </div>
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.images?.[0] || '/media/botica-hero-clean.jpg'}
                      alt={p.name}
                      className="w-11 h-11 object-cover rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate group-hover:text-teal-600 transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500 truncate">
                        {p.materials || p.description || 'Medicamento Certificado'}
                      </p>
                      <span className="text-xs font-black text-teal-600 dark:text-teal-400 font-mono">
                        S/ {Number(p.price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, p)}
                    className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-teal-600 dark:hover:bg-teal-500 transition cursor-pointer shrink-0"
                    title="Añadir a la bolsa"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              ))}

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleVerTodos}
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Ver todos los resultados en el catálogo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

