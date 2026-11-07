import React, { useState, useMemo } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import AnimatedSection, { AnimatedItem } from '@/components/ui/AnimatedSection';
import { projects } from '@/lib/projects';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Custom Grid Icon matching reference style
const GridIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="8" height="8" rx="2" className={active ? 'stroke-foreground' : 'stroke-muted-foreground'} strokeWidth="2" fill="none" />
    <rect x="13" y="3" width="8" height="8" rx="2" className={active ? 'stroke-foreground' : 'stroke-muted-foreground'} strokeWidth="2" fill="none" />
    <rect x="3" y="13" width="8" height="8" rx="2" className={active ? 'stroke-foreground' : 'stroke-muted-foreground'} strokeWidth="2" fill="none" />
    <rect x="13" y="13" width="8" height="8" rx="2" className={active ? 'stroke-foreground' : 'stroke-muted-foreground'} strokeWidth="2" fill="none" />
  </svg>
);

// Custom List Icon - three horizontal lines
const ListIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <line x1="3" y1="6" x2="21" y2="6" className={active ? 'stroke-foreground' : 'stroke-muted-foreground'} strokeWidth="2" strokeLinecap="round" />
    <line x1="3" y1="12" x2="21" y2="12" className={active ? 'stroke-foreground' : 'stroke-muted-foreground'} strokeWidth="2" strokeLinecap="round" />
    <line x1="3" y1="18" x2="21" y2="18" className={active ? 'stroke-foreground' : 'stroke-muted-foreground'} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

type FilterType = 'all' | 'cronica' | 'familiar';
type LocationFilter = 'all' | string;

// Extract unique locations from projects
const locations = ['all', ...Array.from(new Set(projects.map(p => p.location)))];

const typeOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todas las áreas' },
  { value: 'cronica', label: 'Salud Crónica' },
  { value: 'familiar', label: 'Familiar & Corporativo' },
];

interface FilterDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, value, onChange }) => {
  const selectedLabel = options.find(o => o.value === value)?.label || label;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors duration-200 group outline-none focus:outline-none focus-visible:outline-none"
        >
          <span>{selectedLabel}</span>
          <ChevronDown className="w-4 h-4 text-foreground/60 group-hover:text-foreground transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="min-w-[160px] rounded-lg bg-background border border-foreground/20 p-1 shadow-lg"
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`cursor-pointer rounded-md px-3 py-2 text-sm outline-none transition-colors ${
              value === option.value 
                ? 'bg-foreground/10 text-foreground font-medium pointer-events-none' 
                : 'text-foreground/60 hover:bg-foreground/10 hover:text-foreground focus:bg-foreground/10 focus:text-foreground'
            }`}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface ProjectCardProps {
  slug: string;
  image: string;
  title: string;
  location: string;
  year: string;
  description: string;
  index: number;
  isListView: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ slug, image, title, location, year, description, index, isListView }) => (
  <Link to={`/project/${slug}`}>
    <motion.article 
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05, 
        ease: [0.25, 0.1, 0.25, 1],
        layout: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
      }}
      className={`w-full cursor-pointer ${isListView ? 'flex gap-4 items-start' : ''}`}
    >
      <motion.div
        layout
        className={`overflow-hidden group ${isListView ? 'flex-shrink-0 w-[132px] h-[83px]' : 'w-full aspect-[1.59]'}`}
      >
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300 ease-out"
        />
      </motion.div>
      <motion.div layout className={`${isListView ? 'flex-1 flex justify-between items-start' : 'flex justify-between mt-4'}`}>
        <div className="text-sm">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="font-medium text-muted-foreground">{location} • {year}</p>
        </div>
        <p className="text-xs font-medium text-muted-foreground text-right max-w-[200px]">{description}</p>
      </motion.div>
    </motion.article>
  </Link>
);

const ProjectSection: React.FC = () => {
  const [isListView, setIsListView] = useState(false);
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesType = typeFilter === 'all' || 
        (typeFilter === 'cronica' && project.category.toLowerCase().includes('crónica')) ||
        (typeFilter === 'familiar' && !project.category.toLowerCase().includes('crónica'));
      
      const matchesLocation = locationFilter === 'all' || project.location === locationFilter;
      
      return matchesType && matchesLocation;
    });
  }, [typeFilter, locationFilter]);

  return (
    <section id="projects" className="relative w-full py-16">
      {/* Background text */}
      <div className="absolute inset-x-0 top-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative text-center text-display-sm md:text-display-md lg:text-display font-semibold leading-none bg-gradient-to-b from-foreground/10 to-transparent bg-clip-text text-transparent"
        >
          SALUD
        </motion.div>
      </div>
      
      <div className="relative z-10">
        <AnimatedSection>
          <h2 className="text-heading-sm md:text-heading-md lg:text-heading font-semibold text-foreground">
            Especialidades y programas de atención diseñados para la máxima seguridad farmacológica y bienestar de tu familia.
          </h2>
        </AnimatedSection>

        {/* Filters row */}
        <AnimatedItem delay={0.15} className="flex flex-wrap items-center gap-4 mt-11 mb-6">
          {/* Filter dropdowns - left aligned */}
          <div className="flex items-center gap-6">
            <FilterDropdown
              label="Área"
              options={typeOptions}
              value={typeFilter}
              onChange={(v) => setTypeFilter(v as FilterType)}
            />
            <FilterDropdown
              label="Cobertura"
              options={locations.map(loc => ({
                value: loc,
                label: loc === 'all' ? 'Todas las sedes' : loc,
              }))}
              value={locationFilter}
              onChange={setLocationFilter}
            />
          </div>

          {/* View toggle - right aligned */}
          <div className="flex items-center gap-1 ml-auto">
            <button 
              type="button" 
              aria-label="Grid view" 
              onClick={() => setIsListView(false)}
              className="p-1 transition-opacity hover:opacity-70"
            >
              <GridIcon active={!isListView} />
            </button>
            <div className="w-px h-[20px] bg-muted" />
            <button 
              type="button" 
              aria-label="List view" 
              onClick={() => setIsListView(true)}
              className="p-1 transition-opacity hover:opacity-70"
            >
              <ListIcon active={isListView} />
            </button>
          </div>
        </AnimatedItem>

        <LayoutGroup>
          <motion.div 
            layout
            className={`${isListView ? 'flex flex-col gap-6' : 'grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6'}`}
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <ProjectCard 
                  key={project.slug} 
                  slug={project.slug}
                  image={project.image}
                  title={project.title}
                  location={project.location}
                  year={project.year}
                  description={project.description}
                  index={index} 
                  isListView={isListView} 
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground py-12"
          >
            No se encontraron especialidades con los filtros seleccionados.
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default ProjectSection;