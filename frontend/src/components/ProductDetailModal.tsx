import React, { useState, useEffect } from "react";
import {
  X,
  Heart,
  ShoppingBag,
  Check,
  ShieldCheck,
  ThermometerSnowflake,
  Truck,
  Plus,
  Minus,
  MessageCircle,
  Info,
  Pill,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Product, collections } from "@/data/products";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addItem, openDrawer } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedPresentation, setSelectedPresentation] = useState<"unit" | "box">("unit");
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Cerrar con Escape y bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    // Resetear valores al abrir nuevo producto
    setSelectedImageIndex(0);
    setSelectedPresentation("unit");
    setQuantity(1);
    setAddedSuccess(false);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const inWishlist = isInWishlist(product.id);
  const collection = collections.find((c) => c.id === product.collection);

  const hasBoxOption = Boolean(product.boxPrice && product.boxPrice > 0);
  const currentPrice =
    selectedPresentation === "box" && hasBoxOption
      ? product.boxPrice!
      : product.unitPrice || product.price;

  const currentLabel =
    selectedPresentation === "box" && hasBoxOption
      ? product.boxLabel || "Caja"
      : product.unitLabel || "Unidad";

  const images = product.images && product.images.length > 0 ? product.images : ["/media/botica-hero-clean.jpg"];

  const handleAddToCart = () => {
    const itemToAdd: Product = {
      ...product,
      price: currentPrice,
      name: `${product.name} (${currentLabel})`,
    };

    addItem(itemToAdd, quantity);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
      openDrawer();
    }, 600);
  };

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const waMessage = encodeURIComponent(
    `Hola Botica Nova Salud, deseo consultar disponibilidad y posología de: ${product.name} (${currentLabel})`
  );
  const waUrl = `https://wa.me/51955545561?text=${waMessage}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl lg:max-w-5xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de Cierre Superior */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer shadow-sm"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Contenido scrolleable completo sin enlaces externos */}
        <div className="overflow-y-auto p-5 sm:p-7 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
            
            {/* Columna Izquierda: Galería de Imágenes y Sellos (5 columnas) */}
            <div className="md:col-span-5 flex flex-col gap-3">
              {/* Caja de Imagen Principal */}
              <div className="relative aspect-square w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl overflow-hidden p-6 flex items-center justify-center">
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-300 hover:scale-105 select-none"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = "/media/botica-hero-clean.jpg";
                  }}
                />

                {/* Badges superiores */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                  {product.new && (
                    <span className="px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase bg-zinc-900 text-white rounded shadow-xs">
                      NUEVO
                    </span>
                  )}
                  {product.featured && (
                    <span className="px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase bg-emerald-600 text-white rounded shadow-xs">
                      DESTACADO
                    </span>
                  )}
                </div>
              </div>

              {/* Tiras de Miniaturas si hay múltiples imágenes */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={cn(
                        "w-14 h-14 rounded-lg bg-zinc-50 dark:bg-zinc-800 border p-1 flex items-center justify-center transition-all cursor-pointer",
                        idx === selectedImageIndex
                          ? "border-emerald-600 ring-2 ring-emerald-600/30"
                          : "border-zinc-200 dark:border-zinc-700 opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Sellos de Seguridad Farmacéutica */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 grid grid-cols-3 gap-1.5 text-center mt-1">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mb-0.5" />
                  <span className="text-[9px] font-bold text-zinc-900 dark:text-zinc-100 uppercase">DIGEMID</span>
                  <span className="text-[8px] text-zinc-500">Certificado Oficial</span>
                </div>
                <div className="flex flex-col items-center border-x border-zinc-200 dark:border-zinc-700">
                  <ThermometerSnowflake className="w-4 h-4 text-sky-600 mb-0.5" />
                  <span className="text-[9px] font-bold text-zinc-900 dark:text-zinc-100 uppercase">15-25°C</span>
                  <span className="text-[8px] text-zinc-500">Cadena de Frío</span>
                </div>
                <div className="flex flex-col items-center">
                  <Truck className="w-4 h-4 text-teal-600 mb-0.5" />
                  <span className="text-[9px] font-bold text-zinc-900 dark:text-zinc-100 uppercase">Delivery</span>
                  <span className="text-[8px] text-zinc-500">Envío Exprés</span>
                </div>
              </div>

              {/* Ficha Resumen de Identificación */}
              <div className="p-3.5 bg-zinc-50/70 dark:bg-zinc-800/30 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200 font-bold uppercase tracking-wide text-[10px]">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Identificación Farmacéutica</span>
                </div>
                <div className="text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1">
                  <div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-100">Fórmula & Lab: </span>
                    <span>{product.materials || "Fórmula certificada"}</span>
                  </div>
                  {product.dimensions && (
                    <div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-100">Presentación: </span>
                      <span>{product.dimensions}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-100">Categoría: </span>
                    <span>{collection?.name || "Medicamentos & Farmacia Ética"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Información Completa, Precios, Posología y Acciones (7 columnas) */}
            <div className="md:col-span-7 flex flex-col gap-4">
              {/* Categoría / Colección */}
              <div>
                {collection && (
                  <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#0d9488] block mb-1">
                    {collection.name}
                  </span>
                )}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-tight">
                  {product.name}
                </h2>
                {product.materials && (
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
                    {product.materials}
                  </p>
                )}
              </div>

              {/* Selector de Presentación (Unidad vs Caja) */}
              {hasBoxOption && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Selecciona presentación:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPresentation("unit")}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                        selectedPresentation === "unit"
                          ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-600"
                          : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                      )}
                    >
                      <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 block">
                        Por Unidad
                      </span>
                      <span className="text-sm font-black text-zinc-900 dark:text-white">
                        S/ {(Number(product.unitPrice || product.price) || 0).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-zinc-400 block truncate">
                        {product.unitLabel || "1 unidad"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPresentation("box")}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                        selectedPresentation === "box"
                          ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-600"
                          : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block">
                          Por Caja Completa
                        </span>
                        <span className="text-[8px] font-extrabold uppercase bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                          Ahorro
                        </span>
                      </div>
                      <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                        S/ {(Number(product.boxPrice) || 0).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-zinc-400 block truncate">
                        {product.boxLabel || "Caja pack"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bloque de Precio y Disponibilidad */}
              <div className="flex items-baseline justify-between gap-3 pt-2 pb-3 border-y border-zinc-100 dark:border-zinc-800">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                    S/ {(Number(currentPrice) || 0).toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400 uppercase">
                    / {currentLabel}
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  ● En Stock Inmediato
                </span>
              </div>

              {/* Selector de Cantidad, Botón de Añadir a la Bolsa y Favoritos */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  {/* Contador */}
                  <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl p-1 bg-zinc-50 dark:bg-zinc-800/60">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 transition-all cursor-pointer"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center font-bold text-xs text-zinc-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-all cursor-pointer"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Botón Añadir a la Bolsa */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 h-11 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 stroke-[3]" />
                        <span>¡Añadido a la Bolsa!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Añadir a la Bolsa</span>
                      </>
                    )}
                  </button>

                  {/* Favorito */}
                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={cn(
                      "w-11 h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer",
                      inWishlist
                        ? "border-rose-500 bg-rose-50 text-rose-500 dark:bg-rose-950/20"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-rose-500 hover:border-rose-300"
                    )}
                    aria-label="Guardar en favoritos"
                  >
                    <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
                  </button>
                </div>

                {/* Consultar por WhatsApp */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-10 border border-[#25D366]/40 hover:bg-[#25D366]/10 text-emerald-700 dark:text-emerald-400 rounded-xl text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Consultar por WhatsApp con Farmacéutico</span>
                </a>
              </div>

              {/* SECCIÓN COMPLETA DE FICHA TÉCNICA, POSOLOGÍA E INDICACIONES */}
              <div className="mt-2 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/70 space-y-3">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-extrabold text-xs uppercase tracking-wider border-b border-zinc-200/60 dark:border-zinc-700/60 pb-2">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>Ficha Técnica, Posología e Indicaciones</span>
                </div>

                {/* Descripción e Indicación Rápida */}
                {product.description && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                      Indicación Terapéutica:
                    </span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Posología Detallada e Información Farmacológica */}
                {product.longDescription && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                      Modo de Uso & Posología:
                    </span>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {product.longDescription}
                    </p>
                  </div>
                )}

                {/* Advertencia Sanitaria */}
                <div className="flex items-start gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="leading-tight">
                    Medicamento sujeto a supervisión médica según normativa DIGEMID. No se automedique. Ante cualquier duda, consulte a nuestro Químico Farmacéutico en tienda o por WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
