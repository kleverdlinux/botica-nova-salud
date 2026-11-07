import React from 'react';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  return (
    <section id="hero" className="w-full pt-20 pb-16">
      <div className="flex flex-wrap items-start justify-between gap-10">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-hero-sm md:text-hero-md lg:text-hero font-semibold text-foreground"
        >
          Nova Salud <br />
          Botica & Cuidado
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-subheading-sm md:text-subheading-md lg:text-subheading font-medium text-foreground max-w-[468px]"
        >
          Atención farmacéutica personalizada, medicamentos certificados y seguimiento clínico en Lima.
        </motion.p>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="flex flex-wrap justify-between gap-10 mt-28 text-sm max-md:mt-10"
      >
        {[
          { city: "Lima", greeting: "Atención Presencial · Tópico" },
          { city: "Delivery Exprés Lima Este", greeting: "Cadena de Frío Garantizada" },
          { city: "Químico Farmacéutico", greeting: "Orientación Médica Colegiada" }
        ].map((location, i) => (
          <motion.div 
            key={location.city}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
          >
            <div className="font-bold text-foreground">{location.city}</div>
            <div className="font-medium text-muted-foreground">{location.greeting}</div>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-6 w-full"
      >
        <img
          src="/media/hero-farmaceutica.png"
          alt="Botica Nova Salud - Atención y Orientación Farmacéutica Profesional"
          className="w-full h-auto object-cover max-h-[720px] object-center"
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;