import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { products, collections, getCollectionBySlug } from "@/data/products";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SortOption = "featured" | "newest" | "price-asc" | "price-desc" | "name-asc";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Destacados" },
  { value: "newest", label: "Más recientes" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name-asc", label: "Alfabético A-Z" },
];

const HERO_IMAGES = [
  "/media/catalog-hero/pexels-polina-tankilevitch-3735715.jpg",
  "/media/catalog-hero/pexels-zeoxs-11811087.jpg",
  "/media/catalog-hero/pexels-gustavo-fring-6285381.jpg",
  "/media/catalog-hero/fs-cut-color-PL1WRIJOQuQ-unsplash.jpg",
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCollection =
    searchParams.get("collection") ||
    searchParams.get("categoria") ||
    searchParams.get("category") ||
    "all";
  const activeSort = (searchParams.get("sort") as SortOption) || "featured";

  const [currentSlide, setCurrentSlide] = useState(0);

  const currentCollection = activeCollection !== "all"
    ? getCollectionBySlug(activeCollection)
    : null;

  // Si hay colección seleccionada con heroImage, la coloca primero y continúa con las fotos de botica
  const heroSlides = useMemo(() => {
    if (currentCollection?.heroImage) {
      const others = HERO_IMAGES.filter((img) => img !== currentCollection.heroImage);
      return [currentCollection.heroImage, ...others];
    }
    return HERO_IMAGES;
  }, [currentCollection]);

  // Al cambiar de categoría, reinicia de inmediato al primer slide para que se muestre su foto
  useEffect(() => {
    setCurrentSlide(0);
  }, [activeCollection]);

  // Rotación continua y suave cada 3 segundos sin interrupción
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by collection
    if (activeCollection !== "all") {
      const collection = collections.find((c) => c.slug === activeCollection);
      if (collection) {
        result = result.filter((product) => product.collection === collection.id);
      }
    }

    // Sort
    switch (activeSort) {
      case "newest":
        result = result.filter((p) => p.new).concat(result.filter((p) => !p.new));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "featured":
      default:
        result = result.filter((p) => p.featured).concat(result.filter((p) => !p.featured));
        break;
    }

    return result;
  }, [activeCollection, activeSort]);

  const handleFilterChange = (slug: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug === "all") {
      newParams.delete("collection");
      newParams.delete("categoria");
      newParams.delete("category");
    } else {
      newParams.set("collection", slug);
      newParams.delete("categoria");
      newParams.delete("category");
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "featured") {
      newParams.delete("sort");
    } else {
      newParams.set("sort", value);
    }
    setSearchParams(newParams);
  };

  return (
    <Layout>
      {/* Hero Banner - Rotación continua cada 3s entre imágenes sin cortes oscuros */}
      <section className="relative h-[40vh] md:h-[55vh] overflow-hidden">
        <div className="absolute inset-0">
          {heroSlides.map((imgSrc, idx) => (
            <img
              key={`${imgSrc}-${idx}`}
              src={imgSrc}
              alt={currentCollection?.name || "Catálogo Nova Salud"}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out",
                currentSlide === idx ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-charcoal/15" />
        </div>

        <div className="relative container-full h-full flex flex-col justify-end pb-12 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          >
            <p className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-teal-300 mb-2">
              {currentCollection ? "Colección" : "Catálogo Oficial"}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 font-black uppercase tracking-[-0.03em] leading-[0.95]">
              {currentCollection ? currentCollection.name : "Medicamentos & Salud"}
            </h1>
            {currentCollection && (
              <p className="text-sm md:text-base text-white/90 max-w-xl font-normal leading-relaxed">
                {currentCollection.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Filters & Sorting */}
      <section className="py-3.5 border-b border-zinc-200 sticky top-[58px] bg-white/95 backdrop-blur-md z-40 shadow-xs">
        <div className="container-full space-y-3">
          {/* Navegación por Categorías */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleFilterChange("all")}
              className={cn(
                "px-3.5 py-1.5 text-[11px] font-extrabold tracking-wider uppercase transition-all duration-200 border rounded-sm cursor-pointer",
                activeCollection === "all"
                  ? "bg-[#0d9488] text-white border-[#0d9488] shadow-sm"
                  : "bg-white text-zinc-700 border-zinc-200 hover:border-[#0d9488] hover:text-[#0d9488]"
              )}
            >
              Todos
            </button>
            {collections.map((collection) => {
              const isActive = activeCollection === collection.slug;
              return (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => handleFilterChange(collection.slug)}
                  className={cn(
                    "px-3.5 py-1.5 text-[11px] font-extrabold tracking-wider uppercase transition-all duration-200 border rounded-sm cursor-pointer",
                    isActive
                      ? "bg-[#0d9488] text-white border-[#0d9488] shadow-sm"
                      : "bg-white text-zinc-700 border-zinc-200 hover:border-[#0d9488] hover:text-[#0d9488]"
                  )}
                >
                  {collection.name}
                </button>
              );
            })}
          </div>

          {/* Sub-barra: Contador de productos y Selector de orden */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2 border-t border-border/40 text-xs">
            <p className="text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{filteredAndSortedProducts.length}</span>{" "}
              {filteredAndSortedProducts.length === 1 ? "producto" : "productos"}
              {currentCollection ? (
                <> en <span className="font-medium text-foreground">{currentCollection.name}</span></>
              ) : (
                " en el catálogo general"
              )}
            </p>

            <div className="flex items-center gap-2.5">
              <span className="text-muted-foreground tracking-[0.05em] uppercase font-medium">
                Ordenar por:
              </span>
              <Select value={activeSort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] rounded-sm text-xs tracking-[0.02em] h-8 bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-xs"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-10 md:py-16">
        <div className="container-full">
          {filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
              {filteredAndSortedProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-28">
              <p className="font-sans font-semibold text-2xl text-muted-foreground mb-4">
                No se encontraron productos
              </p>
              <p className="text-muted-foreground mb-8">
                Esta categoría se encuentra en reposición de stock.
              </p>
              <Button
                asChild
                variant="outline"
                className="rounded-lg px-8 text-xs font-semibold tracking-wider uppercase"
              >
                <Link to="/products">Ver todos los productos</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative h-[44vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/media/catalog-hero/pexels-gustavo-fring-6285381.jpg"
            alt="Atención Farmacéutica Botica Nova Salud"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/65 backdrop-blur-[2px]" />
        </div>
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/70 mb-3">
              ¿Tienes una Receta Médica o Consulta?
            </p>
            <h2 className="font-sans font-bold text-3xl md:text-5xl text-white mb-6 tracking-tight">
              Orientación Farmacéutica Inmediata
            </h2>
            <Button
              asChild
              size="lg"
              className="rounded-lg px-8 py-5 text-xs font-semibold tracking-wider uppercase bg-white text-charcoal hover:bg-white/90 shadow-lg"
            >
              <a
                href="https://wa.me/51955545561?text=Hola%20Botica%20Nova%20Salud%2C%20deseo%20consultar%20por%20un%20medicamento%20o%20receta%20m%C3%A9dica."
                target="_blank"
                rel="noopener noreferrer"
              >
                Consultar por WhatsApp
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
