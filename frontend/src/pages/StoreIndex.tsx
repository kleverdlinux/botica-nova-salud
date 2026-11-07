import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import { useRef } from "react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { CollectionCard } from "@/components/CollectionCard";
import { collections, getNewProducts, products } from "@/data/products";
import { Button } from "@/components/ui/button";

const Instagram = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Index = () => {
  const newProducts = getNewProducts();
  const latestProducts = products.slice(0, 4);
  const displayedCollections = collections.slice(0, 6);
  const featuredCollection = collections[0]; // Lighting
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Redes Sociales / Galería de Bienestar y Farmacia Comunitaria (6 imágenes auténticas)
  const instagramPosts = [
    {
      image: "/media/social/social-1-farmaceutica.jpg",
      alt: "Atención y asesoría profesional con Químico Farmacéutico",
      label: "Asesoría Farmacéutica",
    },
    {
      image: "/media/social/social-2-dermocosmetica.jpg",
      alt: "Cuidado de la piel y dermocosmética especializada",
      label: "Dermocosmética",
    },
    {
      image: "/media/social/social-3-suplementos.jpg",
      alt: "Suplementación y medicina preventiva para tu bienestar",
      label: "Bienestar & Salud",
    },
    {
      image: "/media/social/social-4-pediatria.jpg",
      alt: "Cuidado pediátrico integral y atención al recién nacido",
      label: "Cuidado Pediátrico",
    },
    {
      image: "/media/social/social-5-cardiovascular.jpg",
      alt: "Control preventivo de presión arterial y salud cardiovascular",
      label: "Salud Cardiovascular",
    },
    {
      image: "/media/social/social-6-atencion-mostrador.jpg",
      alt: "Dispensación responsable y cálida atención a la comunidad",
      label: "Atención al Vecino",
    },
  ];

  return (
    <Layout>
      {/* Hero Section — Full Viewport with Ken Burns Movement & Floating Glass Navbar */}
      <section ref={heroRef} className="relative h-screen min-h-[640px] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <img
            src="/images/hero/pharmacist-hero-hd.jpg?v=clean"
            alt="Botica Nova Salud - Atención Farmacéutica y Bienestar"
            className="w-full h-[120%] object-cover object-[65%_center] animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
        </motion.div>

        <motion.div
          className="relative container-full h-full flex flex-col justify-end pb-20 md:pb-28 pt-28 md:pt-36"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            className="max-w-3xl"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-[11px] font-semibold tracking-[0.3em] uppercase text-white/80 mb-6"
            >
              BOTICA NOVA SALUD · CUIDADO INTEGRAL
            </motion.p>
            <h1 className="font-sans font-bold text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-[0.95] tracking-tight">
              Tu Salud en
              <br />
              <span className="font-semibold text-white/90">Buenas Manos</span>
            </h1>
            <p className="text-base md:text-lg text-white/85 mb-10 leading-relaxed max-w-lg">
              Medicamentos certificados con garantía DIGEMID, dermocosmética y atención farmacéutica personalizada con entrega rápida y segura.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase btn-premium bg-terracotta text-white hover:bg-terracotta/90 transition-all shadow-lg"
              >
                <Link to="/products">
                  Explorar Catálogo
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Collection */}
      <section className="py-20 md:py-28">
        <div className="container-full">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className="relative aspect-[4/5] overflow-hidden group"
            >
              <img
                src={featuredCollection.heroImage || featuredCollection.image}
                alt={featuredCollection.name}
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className="md:py-12"
            >
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-4">
                Colección Destacada
              </p>
              <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-[1] tracking-tight">
                {featuredCollection.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
                {featuredCollection.description}. Fórmulas y suplementos certificados para fortalecer tus defensas y revitalizar tu bienestar con la garantía farmacéutica de Nova Salud.
              </p>
              <Button
                asChild
                size="lg"
                className="rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase btn-premium"
              >
                <Link to={`/products?collection=${featuredCollection.slug}`}>
                  Explorar {featuredCollection.name}
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-20 md:py-28 bg-linen">
        <div className="container-full">
          <div className="flex items-end justify-between mb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-primary mb-3">
                Recién Llegados
              </p>
              <h2 className="font-sans font-bold text-3xl md:text-4xl lg:text-5xl text-foreground tracking-tight">
                Productos Destacados
              </h2>
            </motion.div>
            <Link
              to="/products"
              className="hidden md:flex items-center gap-3 text-sm font-semibold tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors group"
            >
              Ver Todo
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {latestProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          <div className="mt-14 text-center md:hidden">
            <Button
              asChild
              variant="outline"
              className="rounded-none px-8 py-5 text-sm tracking-[0.15em] uppercase"
            >
              <Link to="/products">Ver Todos los Productos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-24 md:py-32">
        <div className="container-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-primary mb-3">
              Especialidades y Categorías
            </p>
            <h2 className="font-sans font-bold text-3xl md:text-4xl lg:text-5xl text-foreground tracking-tight">
              Líneas de Cuidado & Bienestar
            </h2>
          </motion.div>

          {/* Asymmetric grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {/* First row: 2 items */}
            <div className="md:col-span-7">
              <CollectionCard
                collection={displayedCollections[0]}
                index={0}
                variant="wide"
              />
            </div>
            <div className="md:col-span-5">
              <CollectionCard
                collection={displayedCollections[1]}
                index={1}
              />
            </div>

            {/* Second row: 3 items */}
            <div className="md:col-span-4">
              <CollectionCard
                collection={displayedCollections[2]}
                index={2}
              />
            </div>
            <div className="md:col-span-4">
              <CollectionCard
                collection={displayedCollections[3]}
                index={3}
              />
            </div>
            <div className="md:col-span-4">
              <CollectionCard
                collection={displayedCollections[4]}
                index={4}
              />
            </div>

            {/* Third row: 1 wide item */}
            <div className="md:col-span-12">
              <CollectionCard
                collection={displayedCollections[5]}
                index={5}
                variant="wide"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-24 md:py-32 bg-linen">
        <div className="container-narrow text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          >
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-primary mb-6">
              Compromiso & Vocación
            </p>
            <h2 className="font-sans font-bold text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.2] mb-8 tracking-tight">
              Creemos que la salud de tu familia merece cercanía, calidez humana y medicamentos certificados con{" "}
              <span className="text-primary font-bold">garantía total</span>.
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10 text-base">
              En Botica Nova Salud combinamos la dispensación farmacéutica ética con atención personalizada de primer nivel. Cada medicamento y fórmula de nuestro catálogo cuenta con respaldo DIGEMID, asesoramiento profesional directo y precios justos pensados en tu bienestar.
            </p>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase font-semibold"
            >
              <Link to="/about">
                Conoce Nuestra Historia
                <ArrowRight className="ml-3 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Follow Us / Redes Sociales Section */}
      <section className="py-20 md:py-28">
        <div className="container-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-primary mb-3">
              Comunidad Nova Salud
            </p>
            <h2 className="font-sans font-bold text-3xl md:text-4xl text-foreground mb-4 tracking-tight">
              @novasalud.botica
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              Síguenos en nuestras redes sociales para recibir consejos de prevención, campañas de salud y promociones exclusivas para tu familia.
            </p>
          </motion.div>

          {/* Instagram Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {instagramPosts.map((post, index) => (
              <motion.a
                key={index}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative aspect-square overflow-hidden group cursor-pointer rounded-xl bg-muted/40 shadow-sm border border-border/40"
              >
                <img
                  src={post.image}
                  alt={post.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-3 text-center">
                  <Instagram className="w-5 h-5 text-white mb-1.5" />
                  <span className="text-[11px] font-semibold text-white tracking-wide leading-tight line-clamp-2">
                    {post.label}
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
