import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Check, Search, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { SkeletonProductGrid } from "@/components/ui/skeleton";
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
  const urlSearch = searchParams.get("q") || searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [cargando, setCargando] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visibleCount, setVisibleCount] = useState(24);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sincronizar búsqueda cuando cambia el URL
  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  // Breve delay de carga para transición suave de Skeleton
  useEffect(() => {
    const timer = setTimeout(() => setCargando(false), 180);
    return () => clearTimeout(timer);
  }, [activeCollection, activeSort, searchTerm]);

  // Cerrar menú desplegable al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Al cambiar de categoría o filtro, resetear visibleCount a 24
  useEffect(() => {
    setVisibleCount(24);
  }, [activeCollection, activeSort, searchTerm]);

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

    // Filter by search term (Multi-token, insensible a mayúsculas y acentos)
    if (searchTerm && searchTerm.trim()) {
      const norm = searchTerm
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
      const tokens = norm.split(/\s+/).filter(Boolean);

      result = result.filter((product) => {
        const fullText = (
          `${product.name} ${product.description || ''} ${product.longDescription || ''} ${product.materials || ''} ${product.collection || ''}`
        )
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        return tokens.every((token) => fullText.includes(token));
      });
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
  }, [activeCollection, activeSort, searchTerm]);

  const visibleProducts = useMemo(() => {
    return filteredAndSortedProducts.slice(0, visibleCount);
  }, [filteredAndSortedProducts, visibleCount]);

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
              loading={idx === 0 ? "eager" : "lazy"}
              decoding={idx === 0 ? "sync" : "async"}
              fetchPriority={idx === 0 ? "high" : "low"}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out",
                currentSlide === idx ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            />
          ))}
          {/* Overlay oscuro para máximo contraste y legibilidad impecable de los títulos blancos */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30 pointer-events-none" />
          <div className="absolute inset-0 bg-black/25 pointer-events-none" />
        </div>

        <div className="relative container-full h-full flex flex-col justify-end pb-12 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          >
            <p className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-teal-300 mb-2 drop-shadow-sm">
              {currentCollection ? "Colección" : "Catálogo Oficial"}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 font-black uppercase tracking-[-0.03em] leading-[0.95] drop-shadow-lg">
              {currentCollection ? currentCollection.name : "Medicamentos & Salud"}
            </h1>
            {currentCollection && (
              <p className="text-sm md:text-base text-white/95 max-w-xl font-medium leading-relaxed drop-shadow-sm">
                {currentCollection.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Filters & Sorting */}
      <section className="py-3.5 border-b border-zinc-200 bg-white shadow-2xs">
        <div className="container-full space-y-3">
          {/* Navegación por Categorías */}

          {/* 1. VISTA MÓVIL: Botón 'TODOS' + Contenedor Desplegable Compacto de Categorías */}
          <div className="flex md:hidden items-center gap-2 w-full">
            {/* Botón TODOS */}
            <button
              type="button"
              onClick={() => {
                handleFilterChange("all");
                setIsCategoryDropdownOpen(false);
              }}
              className={cn(
                "px-3.5 py-2 text-[11px] font-extrabold tracking-wider uppercase transition-all duration-200 border rounded-xl shrink-0 cursor-pointer shadow-2xs",
                activeCollection === "all"
                  ? "bg-[#0d9488] text-white border-[#0d9488]"
                  : "bg-white text-zinc-700 border-zinc-200 hover:border-[#0d9488] hover:text-[#0d9488]"
              )}
            >
              Todos
            </button>

            {/* Contenedor de Desglose de Categorías */}
            <div className="relative flex-1 min-w-0" ref={dropdownRef}>
              <button
                type="button"
                data-category-toggle="true"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className={cn(
                  "w-full px-3 py-2 text-xs font-bold transition-all duration-200 border rounded-xl flex items-center justify-between gap-1.5 cursor-pointer shadow-2xs",
                  activeCollection !== "all"
                    ? "bg-teal-50/90 text-[#0d9488] border-teal-300"
                    : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300"
                )}
              >
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <span className="text-[10px] uppercase font-black text-neutral-400 shrink-0">
                    Categoría:
                  </span>
                  <span className="font-extrabold text-neutral-900 truncate">
                    {currentCollection ? currentCollection.name : "Seleccionar..."}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform duration-200 text-neutral-400",
                    isCategoryDropdownOpen && "rotate-180 text-[#0d9488]"
                  )}
                />
              </button>

              {/* Menú Desplegable con las 6 Categorías */}
              {isCategoryDropdownOpen && (
                <>
                  {/* Backdrop para cerrar al tocar afuera en móvil */}
                  <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-2xs"
                    onClick={() => setIsCategoryDropdownOpen(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-neutral-200 py-1.5 animate-in fade-in zoom-in-95 duration-150 max-h-[60vh] overflow-y-auto">
                    <div className="px-3 py-1.5 border-b border-neutral-100 flex items-center justify-between text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                      <span>Categorías de Farmacia</span>
                      <span>{collections.length} disponibles</span>
                    </div>
                    <div className="p-1 space-y-0.5">
                      {collections.map((collection) => {
                        const isSelected = activeCollection === collection.slug;
                        return (
                          <button
                            key={collection.id}
                            type="button"
                            data-category-item={collection.slug}
                            onClick={() => {
                              handleFilterChange(collection.slug);
                              setIsCategoryDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full px-3 py-2 text-left text-xs font-bold rounded-xl transition flex items-center justify-between gap-2 cursor-pointer",
                              isSelected
                                ? "bg-[#0d9488] text-white shadow-2xs"
                                : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                            )}
                          >
                            <span className="truncate">{collection.name}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2. VISTA DESKTOP / PC: Píldoras horizontales directas (Intacto como estaba) */}
          <div className="hidden md:flex flex-wrap items-center gap-2">
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

          {/* Sub-barra: Buscador de productos + Contador + Selector de orden */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2.5 border-t border-border/40 text-xs">
            {/* Buscador de productos integrado con búsqueda instantánea y botón limpiar */}
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTerm(val);
                  const newParams = new URLSearchParams(searchParams);
                  if (val.trim()) {
                    newParams.set("q", val);
                  } else {
                    newParams.delete("q");
                    newParams.delete("search");
                  }
                  setSearchParams(newParams, { replace: true });
                }}
                placeholder="Buscar medicamento o principio activo..."
                className="w-full pl-8 pr-7 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete("q");
                    newParams.delete("search");
                    setSearchParams(newParams, { replace: true });
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 flex-1">
              <p className="text-muted-foreground">
                Mostrando <span className="font-semibold text-foreground">{filteredAndSortedProducts.length}</span>{" "}
                {filteredAndSortedProducts.length === 1 ? "producto" : "productos"}
                {searchTerm ? (
                  <> para "<span className="font-semibold text-teal-600 dark:text-teal-400">{searchTerm}</span>"</>
                ) : currentCollection ? (
                  <> en <span className="font-medium text-foreground">{currentCollection.name}</span></>
                ) : (
                  " en el catálogo general"
                )}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground tracking-[0.05em] uppercase font-medium">
                  Ordenar por:
                </span>
                <Select value={activeSort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[170px] rounded-xl text-xs tracking-[0.02em] h-8 bg-background border-border">
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
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-10 md:py-16">
        <div className="container-full">
          {cargando ? (
            <SkeletonProductGrid count={8} />
          ) : filteredAndSortedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                {visibleProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>

              {filteredAndSortedProducts.length > visibleCount && (
                <div className="mt-12 text-center">
                  <p className="text-xs text-muted-foreground mb-3 font-medium">
                    Mostrando {visibleProducts.length} de {filteredAndSortedProducts.length} medicamentos y productos
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setVisibleCount((prev) => prev + 24)}
                    className="w-full sm:w-auto max-w-full whitespace-normal h-auto rounded-full px-6 py-3 text-xs font-semibold tracking-wider uppercase border-border/80 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/30 transition-all shadow-sm"
                  >
                    Cargar más medicamentos ({filteredAndSortedProducts.length - visibleCount} restantes)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 max-w-md mx-auto space-y-3">
              <Search className="w-10 h-10 mx-auto text-neutral-400 stroke-1" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                No encontramos productos para "{searchTerm}"
              </h3>
              <p className="text-xs text-neutral-500">
                Prueba buscando por principio activo o limpia el término para ver todo el catálogo.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete("q");
                  newParams.delete("search");
                  setSearchParams(newParams, { replace: true });
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Ver Todos los Medicamentos
              </button>
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
