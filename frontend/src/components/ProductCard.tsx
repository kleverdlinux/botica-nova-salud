import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Product, collections } from "@/data/products";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "large";
}

export const ProductCard = ({ product, index = 0, variant = "default" }: ProductCardProps) => {
  const { addItem, removeItem, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const collection = collections.find((c) => c.id === product.collection);
  const hasSecondImage = product.images.length > 1;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image Container */}
        <div
          className={cn(
            "relative overflow-hidden bg-white dark:bg-card/60 border border-border/40 mb-5 flex items-center justify-center p-6",
            variant === "large" ? "aspect-[3/4]" : "aspect-[4/5]"
          )}
        >
          {/* Primary Image */}
          <img
            src={product.images[0]}
            alt={product.name}
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = collection?.image || "/media/botica-hero-clean.jpg";
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
            className={cn(
              "w-full h-full object-contain transition-all duration-700 ease-out",
              hasSecondImage
                ? "group-hover:opacity-0 group-hover:scale-105"
                : "group-hover:scale-105"
            )}
          />

          {/* Secondary Image (hover) */}
          {hasSecondImage && (
            <img
              src={product.images[1]}
              alt={`${product.name} - alternate view`}
              className="absolute inset-0 w-full h-full object-contain p-6 opacity-0 scale-105 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-100"
            />
          )}

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            className={cn(
              "absolute top-5 right-5 p-2.5 rounded-full transition-all duration-500",
              "bg-background/90 backdrop-blur-md hover:bg-background shadow-sm",
              "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0",
              inWishlist && "opacity-100 translate-y-0"
            )}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-all duration-300",
                inWishlist ? "fill-primary text-primary scale-110" : "text-foreground"
              )}
            />
          </button>

          {/* Badges */}
          <div className="absolute top-5 left-5 flex flex-col gap-2">
            {product.new && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase bg-foreground text-background shadow-sm"
              >
                Nuevo
              </motion.span>
            )}
            {product.featured && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase bg-emerald-600 text-white shadow-sm"
              >
                Destacado
              </motion.span>
            )}
          </div>

          {/* Quick View Indicator */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
            <span className="px-6 py-2.5 text-xs font-semibold tracking-[0.15em] uppercase bg-background/95 backdrop-blur-md text-foreground shadow-lg border border-border/40">
              Ver Detalle
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-1.5">
          {/* Collection label */}
          {collection && (
            <p className="text-[10px] font-extrabold tracking-[0.15em] uppercase text-[#0d9488] transition-colors duration-200">
              {collection.name}
            </p>
          )}

          <h3 className="font-extrabold uppercase text-[15px] sm:text-[16px] text-[#18181b] group-hover:text-[#0d9488] transition-colors duration-200 leading-snug tracking-[-0.01em]">
            {product.name}
          </h3>

          <p className="text-xs text-zinc-500 line-clamp-1 leading-relaxed">
            {product.description}
          </p>

          {/* Precios: Unidad y Caja */}
          <div className="pt-2.5 border-t border-zinc-200 mt-3 flex items-end justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                {product.unitLabel ? `Unidad (${product.unitLabel})` : "Por unidad"}
              </span>
              <span className="text-base font-black text-[#18181b] tracking-tight">
                S/ {(Number(product.unitPrice || product.price) || 0).toFixed(2)}
              </span>
            </div>
            {product.boxPrice && (
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#0d9488] uppercase tracking-wider block">
                  {product.boxLabel ? `Caja (${product.boxLabel})` : "Por caja"}
                </span>
                <span className="text-sm font-black text-[#0d9488]">
                  S/ {(Number(product.boxPrice) || 0).toFixed(2)}
                </span>
              </div>
            )}
          </div>
          {product.materials && (
            <p className="text-[11px] text-muted-foreground/70 font-normal truncate pt-0.5">
              {product.materials.split(",")[0]}
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  );
};

