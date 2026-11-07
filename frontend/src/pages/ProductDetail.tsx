import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  ThermometerSnowflake,
  MessageCircle,
  Truck,
  Check,
  Info,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { QuantitySelector } from "@/components/QuantitySelector";
import { getProductBySlug, getRelatedProducts, collections, Product } from "@/data/products";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || "");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedPresentation, setSelectedPresentation] = useState<"unit" | "box">("unit");

  // Siempre que cargue o cambie el producto, subir la pantalla inmediatamente arriba
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [slug]);

  // Zoom interactivo al pasar el cursor
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { toast } = useToast();

  if (!product) {
    return (
      <Layout>
        <div className="container-wide pt-36 pb-28 text-center">
          <h1 className="font-sans font-bold text-3xl md:text-4xl text-foreground tracking-tight mb-4">Producto no encontrado</h1>
          <p className="text-muted-foreground mb-8">
            El medicamento o producto que buscas no se encuentra en el catálogo actual.
          </p>
          <Button asChild className="rounded-lg px-8 py-5 text-xs font-semibold tracking-wider uppercase">
            <Link to="/products">Ver Catálogo Completo</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const relatedProducts = getRelatedProducts(product.id);
  const collection = collections.find((c) => c.id === product.collection);

  const hasBoxOption = Boolean(product.boxPrice && product.boxPrice > 0);

  const currentPrice =
    selectedPresentation === "box" && product.boxPrice
      ? product.boxPrice
      : (product.unitPrice || product.price);

  const currentLabel =
    selectedPresentation === "box" && product.boxLabel
      ? product.boxLabel
      : (product.unitLabel || "Unidad");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast({
        title: "Eliminado de favoritos",
        description: `${product.name} fue retirado de tu lista.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Guardado en favoritos",
        description: `${product.name} se agregó a tus favoritos.`,
      });
    }
  };

  const handleAddToCart = () => {
    const itemToAdd: Product = {
      ...product,
      id: selectedPresentation === "box" ? `${product.id}-caja` : product.id,
      name:
        selectedPresentation === "box" && product.boxLabel
          ? `${product.name} (${product.boxLabel})`
          : product.name,
      price: currentPrice,
    };

    addToCart(itemToAdd, quantity);
    toast({
      title: "Agregado al carrito",
      description: `${quantity} × ${itemToAdd.name} (S/ ${(Number(currentPrice) || 0).toFixed(2)}) añadido a tu pedido.`,
    });
    setQuantity(1);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const whatsappMessage = encodeURIComponent(
    `Hola Botica Nova Salud, deseo consultar disponibilidad y precio del producto: ${product.name} - Presentación: ${currentLabel} (S/ ${(Number(currentPrice) || 0).toFixed(2)}).`
  );

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="container-full pt-3 pb-3 sm:pt-4 sm:pb-3.5 border-b border-border/70 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Inicio
          </Link>
          <span className="text-border">/</span>
          <Link to="/products" className="hover:text-foreground transition-colors">
            Catálogo
          </Link>
          {collection && (
            <>
              <span className="text-border">/</span>
              <Link
                to={`/products?collection=${collection.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {collection.name}
              </Link>
            </>
          )}
          <span className="text-border">/</span>
          <span className="text-foreground font-medium truncate max-w-[280px] sm:max-w-none">
            {product.name}
          </span>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="pt-4 pb-12 sm:pt-6 sm:pb-16 md:pb-20">
        <div className="container-full">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Image Container with Zoom & Thumbnails (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Main Image Box */}
              <div
                className="relative aspect-square max-h-[440px] md:max-h-[480px] w-full bg-white dark:bg-card/50 border border-border/80 rounded-xl overflow-hidden p-6 flex items-center justify-center cursor-crosshair group shadow-sm select-none"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => {
                  setIsZoomed(false);
                  setZoomPos({ x: 50, y: 50 });
                }}
                onMouseMove={handleMouseMove}
              >
                <img
                  key={currentImageIndex}
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = collection?.image || "/media/botica-hero-clean.jpg";
                    if (target.src !== fallback) {
                      target.src = fallback;
                    }
                  }}
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: isZoomed ? "scale(2.2)" : "scale(1)",
                  }}
                  className="w-full h-full object-contain pointer-events-none transition-transform duration-100 ease-out"
                />


                {/* Flechas de navegación si hay más de 1 imagen */}
                {product.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/90 backdrop-blur-md border border-border/60 hover:bg-background transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/90 backdrop-blur-md border border-border/60 hover:bg-background transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm"
                      aria-label="Siguiente imagen"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Badges superiores */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                  {product.new && (
                    <span className="px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase bg-foreground text-background rounded">
                      Nuevo
                    </span>
                  )}
                  {product.featured && (
                    <span className="px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase bg-primary text-primary-foreground rounded">
                      Destacado
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails si tiene múltiples imágenes */}
              {product.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "w-16 h-16 rounded-lg bg-white dark:bg-card/50 border overflow-hidden p-1.5 flex items-center justify-center transition-all",
                        index === currentImageIndex
                          ? "border-foreground ring-1 ring-foreground"
                          : "border-border/60 opacity-60 hover:opacity-100"
                      )}
                    >
                      <img
                        src={image}
                        alt={`${product.name} vista ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Sellos de Confianza y Cadena Farmacéutica */}
              <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">
                    DIGEMID
                  </span>
                  <span className="text-[9px] text-muted-foreground">Certificación Oficial</span>
                </div>
                <div className="flex flex-col items-center border-x border-border/50">
                  <ThermometerSnowflake className="w-4 h-4 text-sky-600 mb-1" />
                  <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">
                    Cadena de Frío
                  </span>
                  <span className="text-[9px] text-muted-foreground">T° Controlada 15-25°C</span>
                </div>
                <div className="flex flex-col items-center">
                  <Truck className="w-4 h-4 text-primary mb-1" />
                  <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">
                    Delivery Lima
                  </span>
                  <span className="text-[9px] text-muted-foreground">Envío Rápido y Seguro</span>
                </div>
              </div>
            </div>

            {/* Right Column: Clinical Details, Presentations, Pricing & Actions (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Category & Badge */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {collection && (
                  <Link
                    to={`/catalogo?collection=${collection.slug}`}
                    className="text-xs font-extrabold tracking-[0.15em] uppercase text-[#0d9488] hover:underline"
                  >
                    {collection.name}
                  </Link>
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center gap-1.5 shadow-xs">
                  <Check className="w-3 h-3 stroke-[2.5]" /> Fármaco con Certificación
                </span>
              </div>

              {/* Title */}
              <h1 className="font-extrabold uppercase text-2xl sm:text-3xl lg:text-4xl text-[#18181b] tracking-[-0.02em] leading-tight">
                {product.name}
              </h1>

              {/* Price Block */}
              <div className="flex items-baseline gap-3 pb-3 border-b border-border/60">
                <p className="text-3xl sm:text-4xl font-black text-[#18181b] tracking-tight">
                  S/ {(Number(currentPrice) || 0).toFixed(2)}
                </p>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  por {currentLabel}
                </span>
              </div>

              {/* Presentation Selector (Unit vs Box) */}
              {hasBoxOption && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground block">
                    Selecciona tu Presentación:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Opción Unidad / Blíster */}
                    <button
                      type="button"
                      onClick={() => setSelectedPresentation("unit")}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all duration-200",
                        selectedPresentation === "unit"
                          ? "border-foreground bg-foreground/5 shadow-sm ring-1 ring-foreground"
                          : "border-border hover:border-foreground/40 bg-background"
                      )}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-semibold uppercase text-foreground">
                          Por Unidad / Blíster
                        </span>
                        {selectedPresentation === "unit" && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-base font-semibold text-foreground">
                        S/ {(Number(product.unitPrice || product.price) || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.unitLabel || "1 unidad"}
                      </p>
                    </button>

                    {/* Opción Caja Completa / Pack */}
                    <button
                      type="button"
                      onClick={() => setSelectedPresentation("box")}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all duration-200",
                        selectedPresentation === "box"
                          ? "border-foreground bg-foreground/5 shadow-sm ring-1 ring-foreground"
                          : "border-border hover:border-foreground/40 bg-background"
                      )}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-semibold uppercase text-foreground">
                          Caja Completa / Pack
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-2 py-0.5 rounded shadow-xs">
                          Ahorro
                        </span>
                      </div>
                      <p className="text-base font-semibold text-foreground">
                        S/ {(Number(product.boxPrice) || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.boxLabel || "Empaque dispensador"}
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Ficha Técnica Compacta */}
              <div className="bg-muted/30 p-3.5 rounded-lg border border-border/60 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                  <span className="font-semibold text-foreground min-w-[140px]">
                    Principio Activo & Lab:
                  </span>
                  <span className="text-muted-foreground">{product.materials}</span>
                </div>
                {product.dimensions && (
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                    <span className="font-semibold text-foreground min-w-[140px]">
                      Contenido / Empaque:
                    </span>
                    <span className="text-muted-foreground">{product.dimensions}</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                  <span className="font-semibold text-foreground min-w-[140px]">
                    Indicación Rápida:
                  </span>
                  <span className="text-muted-foreground">{product.description}</span>
                </div>
              </div>

              {/* Actions Block: Quantity, Add to Cart, WhatsApp, Wishlist */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-32">
                    <QuantitySelector
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                    />
                  </div>
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    className="flex-1 rounded-sm py-5 text-xs sm:text-sm font-extrabold tracking-wider uppercase bg-[#18181b] text-white hover:bg-[#0d9488] transition-all shadow-sm cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Agregar al Carrito • S/ {((Number(currentPrice) || 0) * quantity).toFixed(2)}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleWishlistToggle}
                    className="h-11 w-11 rounded-lg border-border hover:bg-accent shrink-0"
                    title={inWishlist ? "Quitar de favoritos" : "Guardar en favoritos"}
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5 transition-all",
                        inWishlist ? "fill-primary text-primary" : "text-muted-foreground"
                      )}
                    />
                  </Button>
                </div>

                {/* Botón WhatsApp Oficial de Consulta Farmacéutica */}
                <a
                  href={`https://wa.me/51955545561?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <FaWhatsapp className="w-5 h-5 text-white shrink-0" />
                  <span>Consultar disponibilidad y receta con Químico Farmacéutico (WhatsApp)</span>
                </a>
              </div>

              {/* Detailed Therapeutic Info (Expandable/Editorial) */}
              <div className="pt-3 border-t border-border/60 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  Información Terapéutica y de Uso
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {product.longDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/20 border-t border-border/60">
          <div className="container-full">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-1">
                  Recomendados para ti
                </p>
                <h2 className="font-sans font-bold text-2xl md:text-3xl text-foreground tracking-tight">
                  Más productos de {collection?.name}
                </h2>
              </div>
              <Link
                to={`/products?collection=${collection?.slug}`}
                className="hidden md:flex items-center gap-2 text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Ver todos
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map((p, index) => (
                <ProductCard key={p.id} product={p} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ProductDetail;

