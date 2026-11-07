import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, ArrowRight, Plus, Minus, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenCheckout?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onOpenCheckout: propOnOpenCheckout,
}) => {
  const navigate = useNavigate();
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    openCheckout,
    updateQuantity,
    removeItem,
    getSubtotal,
    getItemCount,
  } = useCart();

  // Permite controlar la visibilidad tanto por props como por Zustand store
  const isOpen = propIsOpen !== undefined ? propIsOpen : isDrawerOpen;

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      closeDrawer();
    }
  };

  const handleGoToCheckout = () => {
    handleClose();
    if (propOnOpenCheckout) {
      propOnOpenCheckout();
    } else {
      openCheckout();
    }
  };

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between text-[#18181b] animate-slide-left border-l border-zinc-200">
        {/* Header - Idéntico en proporciones al drawer de Mis Favoritos */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-[#0d9488]">
              <ShoppingBag className="w-4 h-4 text-[#0d9488] stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-[#18181b]">
                Carrito de Compras
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium">
                {itemCount} {itemCount === 1 ? 'producto añadido' : 'productos añadidos'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black transition-colors cursor-pointer"
            aria-label="Cerrar carrito"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Lista de Productos del Carrito */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {items.length === 0 ? (
            <div className="text-center py-16 px-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-extrabold uppercase text-[#18181b] mb-1">
                Tu carrito está vacío
              </h3>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed mb-6">
                Añade medicamentos, productos éticos o fórmulas de salud para recibirlos con despacho express en Lima.
              </p>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  navigate('/catalogo');
                }}
                className="px-6 py-3 bg-[#18181b] hover:bg-[#0d9488] text-white text-xs font-black uppercase tracking-wider transition-colors rounded-sm cursor-pointer inline-flex items-center gap-2 shadow-sm"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="group relative flex gap-3.5 p-3.5 rounded-lg border border-zinc-200 hover:border-[#0d9488]/40 bg-white hover:shadow-xs transition-all"
              >
                {/* Imagen del Producto */}
                <div
                  onClick={() => {
                    handleClose();
                    navigate(`/product/${item.product.slug}`);
                  }}
                  className="w-20 h-20 bg-zinc-50 rounded border border-zinc-100 overflow-hidden shrink-0 flex items-center justify-center p-2 cursor-pointer"
                >
                  <img
                    src={item.product.images?.[0] || '/media/botica-hero-clean.jpg'}
                    alt={item.product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info & Controles */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1.5">
                      <h4
                        onClick={() => {
                          handleClose();
                          navigate(`/product/${item.product.slug}`);
                        }}
                        className="text-xs font-black uppercase text-[#18181b] group-hover:text-[#0d9488] transition-colors line-clamp-2 leading-snug cursor-pointer"
                      >
                        {item.product.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id)}
                        title="Eliminar del carrito"
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5 font-medium">
                      {item.product.materials || item.product.description || 'Medicamento ético'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-medium block">
                        S/ {(Number(item.product.price) || 0).toFixed(2)} c/u
                      </span>
                      <span className="text-sm font-black text-[#0d9488]">
                        S/ {((Number(item.product.price) || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Selector de cantidad compacto */}
                    <div className="flex items-center border border-zinc-200 rounded-md overflow-hidden bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer text-xs font-bold"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-black text-zinc-900 select-none">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer text-xs font-bold"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer fijo con Subtotal, Envío y Botón Continuar */}
        {items.length > 0 && (
          <div className="p-5 border-t border-zinc-200 bg-zinc-50/90 shrink-0 space-y-3">
            <div className="space-y-1.5 text-xs text-zinc-600">
              <div className="flex justify-between items-center">
                <span>Subtotal medicamentos:</span>
                <span className="font-bold text-zinc-900">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Envío a domicilio (Lima):</span>
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] uppercase tracking-wide">
                  GRATIS
                </span>
              </div>
            </div>

            <div className="border-t border-zinc-200 pt-2.5 flex justify-between items-baseline">
              <span className="text-sm font-black text-[#18181b] uppercase">Total a Pagar:</span>
              <span className="text-xl font-black text-[#0d9488]">
                S/ {subtotal.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoToCheckout}
              className="w-full py-3.5 px-4 bg-[#18181b] hover:bg-[#0d9488] text-white text-xs font-black uppercase tracking-wider rounded-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md group"
            >
              <span>CONTINUAR CON EL PEDIDO</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Garantía DIGEMID
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-teal-600" />
                Delivery Exprés Lima
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;

