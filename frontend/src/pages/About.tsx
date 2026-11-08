import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, HeartPulse, Award, MessageCircle, MapPin, Clock, Phone, Navigation } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <Layout>
      {/* Hero Banner */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-end overflow-hidden pb-16 md:pb-24">
        <div className="absolute inset-0">
          <img
            src="/media/hero-farmaceutica.png"
            alt="Botica Nova Salud - Profesionales Farmacéuticos en Juliaca - Puno"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-charcoal/20" />
        </div>

        <div className="relative container-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl"
          >
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-white/70 mb-4">
              Nuestra Identidad & Compromiso
            </p>
            <h1 className="font-sans font-bold text-4xl md:text-6xl lg:text-7xl text-white mb-6 leading-[1.05] tracking-tight">
              Cuidado Farmacéutico
              <br />
              <span className="text-white/80 font-semibold">con Calidez Humana</span>
            </h1>
            <p className="text-sm md:text-base text-white/80 leading-relaxed">
              En Juliaca y toda la región Puno, brindamos atención farmacéutica ética, medicamentos 100% certificados por DIGEMID y seguimiento personalizado para tu salud y la de tu familia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filosofía & Misión */}
      <section className="py-20 md:py-28">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-primary mb-4 block">
              Misión Sanitaria
            </span>
            <h2 className="font-sans font-bold text-2xl md:text-4xl lg:text-5xl text-foreground leading-[1.25] tracking-tight">
              Creemos que acceder a medicamentos de calidad debe ser un derecho con orientación experta, trazabilidad y precios justos.
            </h2>
          </motion.div>
        </div>
      </section>

      {/* Historia */}
      <section className="pb-16 md:pb-28">
        <div className="container-full">
          <div className="grid md:grid-cols-12 gap-8 lg:gap-16 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-6"
            >
              <div className="rounded-2xl overflow-hidden border border-border/60 aspect-[4/3] bg-muted/30">
                <img
                  src="/media/about-nosotros.jpg"
                  alt="Equipo farmacéutico de Botica Nova Salud"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-6 space-y-4"
            >
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-primary">
                Origen & Vocación
              </p>
              <h3 className="font-sans font-bold text-2xl md:text-3xl text-foreground tracking-tight">
                Creciendo junto a las familias de Juliaca y el altiplano puneño
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Botica Nova Salud nació con el propósito de transformar la experiencia de farmacia comunitaria: no solo entregamos medicamentos, sino que acompañamos a cada paciente explicando posología, interacciones y buenas prácticas de conservación.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Contamos con químicos farmacéuticos colegiados, monitoreo permanente de signos vitales (presión arterial, glucosa) y una rigurosa cadena de frío para vacunas e insulinas.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valores Clave */}
      <section className="py-20 md:py-28 bg-muted/30 border-y border-border/60">
        <div className="container-full">
          <div className="text-center mb-16">
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-primary mb-2">
              Nuestros Pilares
            </p>
            <h2 className="font-sans font-bold text-3xl md:text-4xl text-foreground tracking-tight">
              Principios que nos guían
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border/70 rounded-xl p-8 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-bold text-lg text-foreground">Certificación DIGEMID</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Todos nuestros medicamentos y productos sanitarios provienen de laboratorios autorizados, con número de registro sanitario y lote verificable.
              </p>
            </div>

            <div className="bg-card border border-border/70 rounded-xl p-8 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-bold text-lg text-foreground">Atención Farmacéutica Ética</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Asesoría personalizada por profesionales farmacéuticos para resolver dudas sobre medicamentos, dosis y contraindicaciones.
              </p>
            </div>

            <div className="bg-card border border-border/70 rounded-xl p-8 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-bold text-lg text-foreground">Precios Justos & Fraccionamiento</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Venta por unidad o blíster para adaptarnos a tu presupuesto y necesidad inmediata, sin sobrecostos innecesarios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sede Oficial & Dónde Ubicarnos (Mapa) */}
      <section className="py-20 md:py-28 bg-white border-b border-border/60">
        <div className="container-full">
          <div className="text-center mb-14">
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-primary mb-2 block">
              Sede Física & Atención Presencial
            </span>
            <h2 className="font-sans font-bold text-3xl md:text-4xl text-foreground tracking-tight">
              Dónde Ubicarnos en Juliaca
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mt-2">
              Visítanos para orientación farmacéutica directa, compra de medicamentos o atención en nuestro tópico clínico.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-3">
              <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-border/70 shadow-sm relative bg-muted/20">
                <iframe
                  title="Mapa de Ubicación Botica Nova Salud"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://maps.google.com/maps?q=-15.4981,-70.1333&hl=es&z=16&output=embed"
                  className="w-full h-full"
                />
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-border shadow-md flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-extrabold text-foreground">Sede Principal Abierta Hoy</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>Jr. Mariano Núñez 485, Cercado de Juliaca • Fácil acceso y estacionamiento</span>
                <a
                  href="https://maps.google.com/?q=Jr.+Mariano+Nu%C3%B1ez+485,+Juliaca,+Puno"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-bold hover:underline flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Abrir en Google Maps
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="bg-muted/30 border border-border/70 p-6 rounded-2xl space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-foreground">Dirección Oficial</h4>
                    <p className="text-sm text-foreground font-semibold mt-0.5">Jr. Mariano Núñez 485, Cercado de Juliaca · San Román, Puno</p>
                    <p className="text-xs text-muted-foreground mt-0.5">A 2 cuadras de la Plaza de Armas de Juliaca, en pleno corazón comercial con fácil acceso.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pt-4 border-t border-border/60">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-foreground">Horario de Atención</h4>
                    <p className="text-xs text-foreground font-bold mt-0.5">Lunes a Sábado: 7:00 am - 11:00 pm</p>
                    <p className="text-xs text-muted-foreground">Domingos y Feriados: 8:00 am - 9:00 pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pt-4 border-t border-border/60">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-foreground">Central Telefónica & WhatsApp</h4>
                    <p className="text-xs text-foreground font-bold mt-0.5">+51 955 545 561</p>
                    <p className="text-[11px] text-muted-foreground">Consultas farmacéuticas y pedidos con entrega inmediata.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-24 bg-charcoal text-white overflow-hidden text-center px-6">
        <div className="container-narrow space-y-6">
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/60">
            Estamos para ayudarte
          </p>
          <h2 className="font-sans font-bold text-3xl md:text-5xl text-white tracking-tight">
            ¿Tienes alguna consulta sobre tu medicación?
          </h2>
          <p className="text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
            Visítanos en nuestra sede central de Juliaca o contáctanos por WhatsApp para consultas sobre stock, precios y delivery exprés.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="rounded-lg px-8 py-5 text-xs font-semibold tracking-wider uppercase bg-white text-charcoal hover:bg-white/90 shadow-md"
            >
              <a
                href="https://wa.me/51955545561?text=Hola%20Botica%20Nova%20Salud%2C%20quisiera%20hacer%20una%20consulta."
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4 mr-2 text-emerald-600" />
                Escríbenos por WhatsApp
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-lg px-8 py-5 text-xs font-semibold tracking-wider uppercase border-white/30 text-white hover:bg-white/10"
            >
              <Link to="/products">
                Ver Catálogo de Productos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
