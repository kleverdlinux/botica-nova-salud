import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { getProjectBySlug } from '@/lib/projects';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CTASection from '@/components/sections/CTASection';
import CommandMenu from '@/components/ui/CommandMenu';
import StickyCommandButton from '@/components/ui/StickyCommandButton';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import { Toaster } from '@/components/ui/toaster';

const ProjectDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = getProjectBySlug(slug || '');
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">Especialidad no encontrada</h1>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background relative z-[1] mb-[280px] md:mb-[120px]">
        <ThemeSwitcher />
        <Toaster />
        <StickyCommandButton onClick={() => setCommandOpen(true)} />
        <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
        
        <div className="max-w-[1380px] mx-auto px-6">
          <Header />
          
          <main className="py-12">
            {/* Back link */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link 
                to="/#projects" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
              >
                <ArrowLeft size={16} />
                Volver a especialidades
              </Link>
            </motion.div>

            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-16"
            >
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{project.category}</p>
                  <h1 className="text-5xl md:text-6xl font-semibold text-foreground">{project.title}</h1>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{project.location} • {project.year}</p>
                </div>
              </div>
              
              <div className="overflow-hidden group">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full aspect-[21/9] object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
                />
              </div>
            </motion.div>

            {/* Project Info Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-muted mb-16"
            >
              <div>
                <p className="text-xs text-muted-foreground mb-1">Área de Atención</p>
                <p className="text-sm font-semibold text-foreground">{project.area}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Seguimiento</p>
                <p className="text-sm font-semibold text-foreground">{project.duration}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sede / Cobertura</p>
                <p className="text-sm font-semibold text-foreground">{project.location}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Registro Sanitario</p>
                <p className="text-sm font-semibold text-foreground">{project.year}</p>
              </div>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mb-16"
            >
              <p className="text-xs text-muted-foreground mb-3">Servicios y Procedimientos Clínicos</p>
              <div className="flex flex-wrap gap-2">
                {(project.services || []).map((service) => (
                  <span 
                    key={service}
                    className="px-3 py-1.5 text-xs font-medium text-foreground bg-secondary rounded-full"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Case Study Content */}
            <div className="grid md:grid-cols-2 gap-16 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <h2 className="text-2xl font-semibold text-foreground mb-4">El Desafío Clínico</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{project.challenge}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <h2 className="text-2xl font-semibold text-foreground mb-4">Nuestro Enfoque Farmacéutico</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{project.approach}</p>
              </motion.div>
            </div>

            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mb-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(project.gallery || []).map((image, index) => (
                  <div key={index} className="overflow-hidden group">
                    <img
                      src={image}
                      alt={`${project.title} galería ${index + 1}`}
                      className="w-full aspect-[4/3] object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Outcome */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="max-w-3xl mb-16"
            >
              <h2 className="text-2xl font-semibold text-foreground mb-4">El Resultado en Salud</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{project.outcome}</p>
            </motion.div>

            <CTASection onOpenCommandMenu={() => setCommandOpen(true)} />
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProjectDetail;
