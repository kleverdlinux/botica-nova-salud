import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../data/inspirateData';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [contactChannel, setContactChannel] = useState<'whatsapp' | 'phone'>('whatsapp');
  const [orderDone, setOrderDone] = useState(false);

  if (!isOpen) return null;

  const totalPEN = items.reduce((sum, item) => {
    const prod = item.product || item;
    const price = Number(prod?.price || prod?.priceUSD || 0);
    return sum + price * (item.quantity || 1);
  }, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderDone(true);
    setTimeout(() => {
      onClearCart();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 sm:p-8 animate-slide-left text-[#222222]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#0d9488]" />
            <h2 className="text-xl font-black uppercase tracking-tight text-[#222222]">
              Tu Pedido ({totalCount})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-[#222222] transition-colors cursor-pointer"
            aria-label="Cerrar bolsa"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-6">
          {orderDone ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-emerald-100 text-[#0d9488] rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black uppercase text-[#222222] mb-2">
                ¡Pedido Realizado con Éxito!
              </h3>
              <p className="text-xs text-[#555555] leading-relaxed mb-6">
                Gracias, {customerName}. Nuestro personal se pondrá en contacto al {customerPhone} para coordinar la entrega o retiro en botica.
              </p>
              <button
                onClick={() => {
                  setOrderDone(false);
                  setIsCheckingOut(false);
                  onClose();
                }}
                className="btn-corner-accent btn-corner-dark py-2.5 px-6 text-xs uppercase font-extrabold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-[#888888]">
              <ShoppingBag className="w-12 h-12 stroke-[1.2] mx-auto mb-4 text-[#cccccc]" />
              <p className="text-sm font-bold uppercase tracking-wider mb-2">Tu pedido está vacío</p>
              <p className="text-xs text-[#999999] max-w-xs mx-auto">
                Explora nuestras categorías de farmacia ética, dermocosmética y cuidado pediátrico.
              </p>
            </div>
          ) : isCheckingOut ? (
            <form onSubmit={handleCompleteOrder} className="space-y-4">
              <span className="text-xs font-black uppercase text-[#222222] block mb-2">
                Datos de Contacto para el Pedido
              </span>
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-[#555555] mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full border-b border-gray-300 py-2 text-xs focus:outline-none focus:border-[#0d9488]"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-[#555555] mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+51 955 545 561"
                  className="w-full border-b border-gray-300 py-2 text-xs focus:outline-none focus:border-[#0d9488]"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-[#555555] mb-1">
                  Canal de Contacto Preferido
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['whatsapp', 'phone'] as const).map((ch) => (
                    <button
                      type="button"
                      key={ch}
                      onClick={() => setContactChannel(ch)}
                      className={`py-1.5 text-[11px] font-bold uppercase border transition-all cursor-pointer ${
                        contactChannel === ch
                          ? 'border-[#0d9488] bg-[#0d9488] text-white'
                          : 'border-gray-200 text-[#555555]'
                      }`}
                    >
                      {ch === 'whatsapp' ? 'WhatsApp' : 'Llamada telefónica'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="btn-corner-accent btn-corner-dark w-full py-3.5 text-xs font-black uppercase tracking-widest cursor-pointer"
                >
                  Confirmar y Enviar Pedido
                </button>
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="w-full text-center text-xs text-[#777777] hover:text-[#222222] font-bold uppercase tracking-wider py-2 mt-2 cursor-pointer"
                >
                  Volver al detalle
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-3 bg-[#fafafa] border border-gray-100 items-center justify-between"
                >
                  <div className="w-16 h-16 bg-white overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black uppercase text-[#222222] truncate">
                      {item.product.title}
                    </h4>
                    <p className="text-[10px] text-[#0d9488] font-bold truncate">
                      {item.product.metal}
                    </p>
                    <span className="text-xs font-bold text-[#222222]">
                      S/ {(item.product.priceUSD * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="p-1 text-gray-400 hover:text-[#222222] cursor-pointer"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="p-1 text-gray-400 hover:text-[#222222] cursor-pointer"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1 text-gray-400 hover:text-red-500 ml-1 cursor-pointer"
                      aria-label="Eliminar del pedido"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Total and Checkout Button */}
        {items.length > 0 && !isCheckingOut && !orderDone && (
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold uppercase tracking-widest text-[#777777]">
                Total Estimado
              </span>
              <span className="text-2xl font-black text-[#222222]">
                S/ {totalPEN.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => setIsCheckingOut(true)}
              className="btn-corner-accent btn-corner-dark w-full py-4 text-xs font-black uppercase tracking-widest cursor-pointer"
            >
              Tramitar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

