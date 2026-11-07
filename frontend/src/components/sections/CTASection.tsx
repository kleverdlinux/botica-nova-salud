import React from 'react';
import { motion } from 'framer-motion';
import { Command } from 'lucide-react';

interface CTASectionProps {
  onOpenCommandMenu?: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onOpenCommandMenu }) => {
  return (
    <section id="cta" className="w-full py-16 border-t border-b border-muted">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col items-center text-center"
      >
        <h2 className="text-[32px] font-semibold text-foreground">
          ¿Listo para cuidar tu salud con expertos?
        </h2>
        <p className="text-sm text-muted-foreground leading-[21px] max-w-[320px] mt-2">
          Consulta tu receta médica, solicita asesoría profesional o cotiza tu tratamiento con entrega rápida.
        </p>
        
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={onOpenCommandMenu}
          className="flex items-center gap-1 mt-8 px-3 py-2 bg-foreground text-background text-sm font-medium rounded-[4px] hover:opacity-80 transition-opacity"
        >
          {/* Mobile/Tablet: Show "Consultar receta" text */}
          <span className="lg:hidden">Consultar receta</span>
          {/* Desktop: Show CMD+K */}
          <Command size={14} className="hidden lg:block" />
          <span className="hidden lg:inline">+ K</span>
        </motion.button>
      </motion.div>
    </section>
  );
};

export default CTASection;