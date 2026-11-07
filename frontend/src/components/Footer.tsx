import HalftoneWordmarkFooter from "@/components/ui/halftone-wordmark-footer";

export const Footer = () => {
  return (
    <HalftoneWordmarkFooter
      wordmark="nova salud"
      label="BOTICA NOVA SALUD"
      meta="©2026 · Av. Principal 1248, Lima · Q.F. Regente Colegiada CQFP"
      preset="mono"
      height="100vh"
      className="min-h-screen"
    />
  );
};

export default Footer;
