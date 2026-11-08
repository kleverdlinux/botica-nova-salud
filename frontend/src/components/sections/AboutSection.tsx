import React from 'react';
import { motion } from 'framer-motion';
const AboutSection: React.FC = () => {
  return <section id="about" className="relative w-full pt-24 pb-16">
      {/* Background text */}
      <div className="absolute inset-x-0 top-0 overflow-hidden pointer-events-none">
      <motion.div initial={{
        opacity: 0,
        x: -100
      }} whileInView={{
        opacity: 1,
        x: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 1,
        ease: [0.25, 0.1, 0.25, 1]
      }} className="relative text-center text-display-sm md:text-display-md lg:text-display font-semibold leading-none whitespace-nowrap" style={{
        background: 'linear-gradient(to bottom, hsl(var(--foreground) / 0.1), transparent)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
          NOSOTROS
        </motion.div>
      </div>
      
      <div className="relative z-10">
        <motion.div initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true,
        margin: "-100px"
      }} transition={{
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }} className="flex flex-col">
          {/* Image wrapper - responsive height */}
          <div className="h-[412px] md:h-[515px] lg:h-[618px]">
            <img 
              src="/media/about-nosotros.jpg" 
              alt="Atención farmacéutica y orientación profesional en Botica Nova Salud" 
              className="absolute left-0 top-[40px] w-full md:w-[343px] lg:w-[412px] h-[412px] md:h-[515px] lg:h-[618px] object-cover object-[center_top] max-md:relative max-md:top-0 grayscale hover:grayscale-0 transition-all duration-500 ease-out" 
            />
          </div>
          
          {/* Mobile text - visible only on mobile */}
          <p className="block md:hidden pt-6 text-heading-sm font-semibold text-foreground">
            Botica Nova Salud nació en Juliaca con la misión de brindar atención farmacéutica profesional, medicamentos originales certificados por DIGEMID y orientación clínica con calidez y rigor sanitario para cada familia.
          </p>
          
          {/* Tablet text - visible only on tablet */}
          <p className="hidden md:block lg:hidden pt-6 text-heading-md font-semibold text-foreground py-0">                                            Botica Nova Salud nació en Juliaca con la misión de brindar atención farmacéutica profesional, medicamentos originales certificados por DIGEMID y orientación clínica con calidez y rigor sanitario para cada familia.</p>
          
          {/* Desktop text with CSS float spacer */}
          <p className="hidden lg:block pt-0 text-heading font-semibold text-foreground">                                        Botica Nova Salud nació en Juliaca con la misión de brindar atención farmacéutica profesional, medicamentos originales certificados por DIGEMID y orientación clínica con calidez y rigor sanitario para cada familia.</p>
        </motion.div>
      </div>
    </section>;
};
export default AboutSection;