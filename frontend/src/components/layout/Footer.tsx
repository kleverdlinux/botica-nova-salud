import React from 'react';
import HalftoneWordmarkFooter from '@/components/ui/halftone-wordmark-footer';

const Footer: React.FC = () => {
  return (
    <HalftoneWordmarkFooter
      wordmark="nova salud"
      label="BOTICA NOVA SALUD"
      meta="©2026 · Jr. Mariano Núñez 485, Juliaca · San Román, Puno · Q.F. Regente Colegiada CQFP"
      preset="light"
      height="100vh"
      className="min-h-screen"
    />
  );
};

export default Footer;
