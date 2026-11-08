export interface Project {
  slug: string;
  image: string;
  title: string;
  location: string;
  year: string;
  description: string;
  category: string;
  area: string;
  duration: string;
  services: string[];
  challenge: string;
  approach: string;
  outcome: string;
  gallery: string[];
}

export const projects: Project[] = [
  {
    slug: "control-cardiovascular",
    image: "/media/esp-cardiovascular.jpg",
    title: "Control Cardiovascular & Hipertensión",
    location: "Juliaca",
    year: "2026",
    description: "Monitoreo continuo de presión y adherencia terapéutica.",
    category: "Salud Crónica / Cardiovascular",
    area: "Tópico y Consulta",
    duration: "Programa Mensual",
    services: ["Toma de Presión Arterial", "Pastillero Semanal", "Perfil Farmacoterapéutico"],
    challenge: "Muchos pacientes con hipertensión arterial en el distrito enfrentan dificultades para cumplir sus horarios de medicación o sufren fluctuaciones por falta de seguimiento y control regular.",
    approach: "Implementamos un registro individualizado de presión arterial, revisión de interacciones medicamentosas entre fármacos prescritos y recordatorios programados de reposición de receta médica.",
    outcome: "Más del 95% de los pacientes inscritos mantienen sus valores de presión en rango seguro y reportan mayor tranquilidad en su tratamiento cotidiano sin olvidos de tomas.",
    gallery: [
      "/media/esp-cardiovascular.jpg",
      "/media/hero-farmaceutica.png",
      "/media/laboratorio-hero.png"
    ]
  },
  {
    slug: "manejo-diabetico",
    image: "/media/esp-diabetico.jpg",
    title: "Manejo Integral del Paciente Diabético",
    location: "San Román",
    year: "2026",
    description: "Glucometría de precisión y asesoría en insulinas y tiras reactivas.",
    category: "Salud Crónica / Endocrinología",
    area: "Tópico & Delivery",
    duration: "Seguimiento Continuo",
    services: ["Medición de Glucosa Capilar", "Cadena de Frío para Insulinas", "Guía de Autocuidado"],
    challenge: "La conservación estricta de la cadena de frío en insulinas y la correcta calibración y uso del glucómetro son puntos críticos donde los pacientes cometen errores frecuentes en casa.",
    approach: "Dispensamos insulinas en empaques térmicos con monitoreo de temperatura certificado y capacitamos al paciente de forma práctica en la lectura correcta de tiras y aplicación de dosis.",
    outcome: "Cero reportes de degradación en insulinas despachadas y notable mejoría en los registros de hemoglobina glicosilada de nuestros pacientes crónicos frecuentes.",
    gallery: [
      "/media/esp-diabetico.jpg",
      "/media/slide-insulina.png",
      "/media/hero-farmaceutica.png"
    ]
  },
  {
    slug: "pediatria-maternidad",
    image: "/media/esp-pediatrico.jpg",
    title: "Cuidado Pediátrico & Bienestar Materno",
    location: "Juliaca",
    year: "2026",
    description: "Dosificación pediátrica segura, nutrición infantil y puericultura.",
    category: "Materno Infantil / Pediatría",
    area: "Módulo Familiar",
    duration: "Atención Inmediata",
    services: ["Cálculo de Dosis por Peso", "Higiene y Piel Atópica", "Fórmulas Infantiles Certificadas"],
    challenge: "Las dudas sobre dosificaciones exactas en mililitros o gotas según el peso corporal del bebé generan temor en padres de familia al administrar antibióticos y analgésicos pediátricos.",
    approach: "Verificamos minuciosamente la concentración y el peso del niño en cada receta médica, explicando a los padres la administración con jeringas orales dosificadoras exactas.",
    outcome: "Confianza total de cientos de familias de Juliaca y Puno que eligen a Nova Salud como su botica de cabecera para el cuidado de sus hijos.",
    gallery: [
      "/media/esp-pediatrico.jpg",
      "/media/slide-panadol.png",
      "/media/hero-farmaceutica.png"
    ]
  },
  {
    slug: "botiquines-corporativos",
    image: "/media/esp-botiquines.jpg",
    title: "Botiquines Normativos & Seguridad Laboral",
    location: "Juliaca / Puno",
    year: "2026",
    description: "Equipamiento reglamentario para empresas, talleres e instituciones.",
    category: "Corporativo / Emergencias",
    area: "Empresas e Instituciones",
    duration: "Renovación Periódica",
    services: ["Auditoría de Vencimientos", "Insumos Médicos Certificados", "Primeros Auxilios Normados"],
    challenge: "Empresas y centros educativos necesitan cumplir con las exigencias del Ministerio de Trabajo y MINSA en seguridad y salud, garantizando que sus insumos nunca estén vencidos.",
    approach: "Armamos botiquines reglamentarios adaptados al aforo y nivel de riesgo de cada institución, con un cronograma automático de reemplazo antes de que expire cualquier fármaco o insumo.",
    outcome: "100% de conformidad en fiscalizaciones e inspecciones de seguridad laboral para nuestros clientes corporativos en la región Puno.",
    gallery: [
      "/media/esp-botiquines.jpg",
      "/media/botica-hero-clean.jpg",
      "/media/hero-farmaceutica.png"
    ]
  }
];

export const getProjectBySlug = (slug: string): Project | undefined => {
  return projects.find(p => p.slug === slug);
};
