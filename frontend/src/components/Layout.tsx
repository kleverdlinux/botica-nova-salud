import { ReactNode, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import { Footer } from "./Footer";
import { TooltipProvider } from "@/components/ui/tooltip";

interface LayoutProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export const Layout = ({ children }: LayoutProps) => {
  useEffect(() => {
    // La tienda y web pública de la botica es siempre modo claro
    document.documentElement.classList.remove('dark');
  }, []);
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground relative pt-[70px] lg:pt-[76px] overflow-x-clip max-w-full">
        <Header />
        <motion.main
          className="flex-1 w-full min-w-0 overflow-x-clip"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.main>
        <Footer />
      </div>
    </TooltipProvider>
  );
};
