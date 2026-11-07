import React, { useState, useEffect } from 'react';
import { Command } from 'lucide-react';

interface StickyCommandButtonProps {
  onClick: () => void;
}

const texts = ["Consultar receta", "Atención farmacéutica"];

const StickyCommandButton: React.FC<StickyCommandButtonProps> = ({ onClick }) => {
  const [textIndex, setTextIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % texts.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-1.5 pointer-events-auto">
      <span 
        className={`hidden sm:block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-200/80 dark:border-zinc-800 shadow-md transition-opacity duration-300 ${
          isAnimating ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {texts[textIndex]}
      </span>
      <button
        onClick={onClick}
        className="group flex items-center gap-2 bg-zinc-900 hover:bg-terracotta text-white px-3.5 py-2 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/20"
        aria-label="Abrir menú de atención (Ctrl+K)"
        title="Buscar o consultar (Ctrl+K)"
      >
        <Command className="w-4 h-4 text-white" />
        <span className="text-xs font-bold tracking-wider text-white">K</span>
      </button>
    </div>
  );
};

export default StickyCommandButton;