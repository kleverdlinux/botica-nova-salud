import { Link } from "react-router-dom";
import { ArrowRight, Trash2, ShoppingBag, ShieldCheck, Truck, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { QuantitySelector } from "@/components/QuantitySelector";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

const Cart = () => {
  const { items, updateQuantity, removeItem, getSubtotal, openCheckout } = useCart();
  const subtotal = getSubtotal();
  const shipping = 0; // Despacho gratis en Juliaca
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-wide pt-36 pb-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/40">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h1 className="font-sans font-bold text-3xl md:text-4xl text-foreground tracking-tight mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Explora nuestro catálogo certificado de medicamentos, salud cardiovascular, vitaminas y cuidado integral.
            </p>
            <Button
              asChild
              size="lg"
              className="rounded-lg px-8 py-5 text-xs font-semibold tracking-wider uppercase bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md"
            >
              <Link to="/products">
                Explorar Catálogo
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="container-full pt-3 pb-3 sm:pt-4 sm:pb-3.5 border-b border-border/70 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Inicio
          </Link>
          <span className="text-border">/</span>
          <Link to="/products" className="hover:text-foreground transition-colors">
            Catálogo
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">Carrito de Compras</span>
        </div>
      </div>

      <section className="py-8 md:py-14">
        <div className="container-full">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-baseline justify-between mb-8 pb-4 border-b border-border/60"
          >
            <h1 className="font-sans font-bold text-2xl md:text-4xl text-foreground tracking-tight">
              Tu Carrito de Salud
            </h1>
            <span className="text-xs font-medium text-muted-foreground">
              {items.length} {items.length === 1 ? "ítem agregado" : "ítems agregados"}
            </span>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Cart Items */}
            <div className="lg:col-span-7 space-y-4">
              <div className="divide-y divide-border/60 border border-border/70 rounded-xl bg-card overflow-hidden">
                {items.map((item, index) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center"
                  >
                    {/* Product Image */}
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-card/50 rounded-lg border border-border/60 p-2 flex items-center justify-center shrink-0 group overflow-hidden"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="font-sans font-bold text-base text-foreground hover:text-primary transition-colors leading-snug line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {item.product.materials || item.product.description}
                      </p>
                      <p className="font-sans font-bold text-base text-foreground mt-2">
                        S/ {(Number(item.product?.price) || 0).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0">
                      <QuantitySelector
                        quantity={item.quantity}
                        onQuantityChange={(qty) => updateQuantity(item.product.id, qty)}
                        className="rounded-lg overflow-hidden scale-90 sm:scale-100 origin-left sm:origin-right"
                      />
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors p-1"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sm:hidden">Eliminar</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Continuar buscando medicamentos
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="bg-muted/40 border border-border/80 rounded-xl p-6 lg:p-8 lg:sticky lg:top-24 space-y-6">
                <h2 className="font-sans font-bold text-lg text-foreground tracking-tight pb-3 border-b border-border/60">
                  Resumen de tu Pedido
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal medicamentos:</span>
                    <span className="font-semibold text-foreground">S/ {(Number(subtotal) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">Envío a domicilio (Juliaca):</span>
                    <span className="font-semibold text-foreground">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-xs">Gratis</span>
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4 flex justify-between items-baseline">
                  <span className="font-sans font-bold text-base text-foreground">Total a Pagar:</span>
                  <span className="font-sans font-bold text-2xl text-foreground tracking-tight">
                    S/ {(Number(total) || 0).toFixed(2)}
                  </span>
                </div>

                <Button
                  size="lg"
                  onClick={() => openCheckout()}
                  className="w-full rounded-lg py-5 text-xs font-semibold tracking-wider uppercase bg-[#18181b] hover:bg-[#0d9488] text-white transition-all shadow-md cursor-pointer"
                >
                  <span>Continuar con el Pedido</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>

                {/* Sellos de Confianza Farmacéutica */}
                <div className="pt-4 border-t border-border/60 grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-[11px]">Garantía DIGEMID</p>
                      <p className="text-[10px] text-muted-foreground">Lotes y vencimiento 100% verificados</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-[11px]">Delivery Exprés</p>
                      <p className="text-[10px] text-muted-foreground">Entrega segura con cadena de frío</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
