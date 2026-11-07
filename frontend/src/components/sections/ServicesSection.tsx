import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

interface Service {
  letter: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
}

interface ServiceItemProps {
  letter: string;
  title: string;
  shortDescription: string;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ letter, title, shortDescription, index, isActive, onClick }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
    className="flex items-start gap-6 mb-10 last:mb-0 cursor-pointer"
    onClick={onClick}
  >
  <div className={`text-body-sm md:text-body-md lg:text-body font-semibold transition-colors duration-300 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
      ({letter})
    </div>
    <div>
      <h3 className={`text-body-sm md:text-body-md lg:text-body font-semibold transition-colors duration-300 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
        {title}
      </h3>
      <p className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-muted-foreground' : 'text-muted'}`}>
        {shortDescription}
      </p>
    </div>
  </motion.div>
);

interface ServicesSectionProps {
  onOpenCommandMenu?: () => void;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenCommandMenu }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const services: Service[] = [
    { 
      letter: "A", 
      title: "Atención & Dispensación Farmacéutica", 
      shortDescription: "Revisión de recetas, posología y educación farmacológica.",
      fullDescription: "No nos limitamos a entregar una caja. Nuestro equipo farmacéutico colegiado verifica minuciosamente las dosis, contraindicaciones e interacciones de cada prescripción médica para asegurar que tu tratamiento sea 100% seguro y efectivo.",
      image: "/media/srv-dispensacion.jpg"
    },
    { 
      letter: "B", 
      title: "Monitoreo Clínico de Signos Vitales", 
      shortDescription: "Presión arterial, glucosa capilar, saturación y peso corporal.",
      fullDescription: "Contamos con un área de tópico y despistaje equipada con instrumental médico calibrado. Brindamos seguimiento continuo para pacientes hipertensos, diabéticos y adultos mayores con registro de historial clínico.",
      image: "/media/srv-signos-vitales.jpg"
    },
    { 
      letter: "C", 
      title: "Botiquines Normativos & Fórmulas", 
      shortDescription: "Insumos para hogares, vehículos, colegios y empresas.",
      fullDescription: "Abastecemos botiquines de primeros auxilios certificados bajo directivas del Ministerio de Salud (MINSA). Incluimos insumos descartables, material de curación estéril y medicamentos esenciales con control riguroso de lote y fecha.",
      image: "/media/srv-botiquines-formulas.jpg"
    },
    { 
      letter: "D", 
      title: "Delivery Exprés con Cadena de Frío", 
      shortDescription: "Despacho rápido y seguro en Lima Metropolitana y alrededores.",
      fullDescription: "Si no puedes salir de casa, llevamos tus medicamentos a la puerta. Empleamos contenedores térmicos con monitoreo de temperatura para insulinas, colirios y vacunas, garantizando su estabilidad biológica intacta.",
      image: "/media/srv-delivery-expres.png"
    }
  ];

  const activeService = services[activeIndex];

  return (
    <section id="services" className="relative w-full py-24">
      {/* Background text */}
      <div className="absolute inset-x-0 top-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative text-center text-display-sm md:text-display-md lg:text-display font-semibold leading-none bg-gradient-to-b from-foreground/10 to-transparent bg-clip-text text-transparent"
        >
          SERVICIOS
        </motion.div>
      </div>
      
      <div className="relative z-10">
        {/* Title - top left */}
        <AnimatedSection className="max-w-[460px] mb-12">
          <h2 className="text-subheading-sm md:text-subheading-md lg:text-subheading font-medium text-foreground">
            Desde la orientación clínica preventiva hasta la entrega de tu tratamiento en casa. Cuidado farmacéutico con rigor científico y calidez humana.
          </h2>
        </AnimatedSection>

        {/* Content row: Image left, Services right */}
        <div className="flex gap-16 items-start max-md:flex-col">
          {/* Image and description - left side */}
          <div className="flex-shrink-0 w-[380px] max-md:w-full">
            {/* Stacked images - all layered with transitions */}
            <div className="relative aspect-[4/5] overflow-hidden">
              {services.map((service, index) => (
                <div
                  key={service.letter}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    className={`w-full h-full object-cover grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300 ease-out ${
                      index === activeIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
              ))}
              {/* Film grain overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.15] z-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                  {activeService.fullDescription}
                </p>
                
                {/* Small CMD+K button */}
                <button
                  onClick={onOpenCommandMenu}
                  className="flex items-center gap-1 mt-4 px-2 py-1.5 bg-foreground text-background text-xs font-medium rounded-[3px] hover:opacity-80 transition-opacity"
                >
                  {/* Mobile/Tablet: Show "Consultar servicio" text */}
                  <span className="lg:hidden">Consultar servicio</span>
                  {/* Desktop: Show CMD+K */}
                  <Command size={12} className="hidden lg:block" />
                  <span className="hidden lg:inline">+ K</span>
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex-1 pt-4 flex justify-end">
            <div>
            {services.map((service, index) => (
              <ServiceItem 
                key={service.letter} 
                letter={service.letter}
                title={service.title}
                shortDescription={service.shortDescription}
                index={index}
                isActive={activeIndex === index}
                onClick={() => setActiveIndex(index)}
              />
            ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;