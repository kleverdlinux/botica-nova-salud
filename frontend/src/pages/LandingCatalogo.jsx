import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowDownRight,
  MessageCircle,
  Copy,
  LogIn,
  X
} from 'lucide-react';

/* =========================================================================
   CONFIGURACIÓN EDITABLE (SECCIÓN 12 DEL BRIEF MARA VOSS ADAPTADO A NOVA SALUD)
   ========================================================================= */
const PERSONA = {
  firstName: 'Nova',
  lastName: 'Salud',
  monogram: 'NS',
  role: 'Botica Especializada & Farmacia Clínica',
  practice: 'Brand identities, clinical systems, pharmaceutical care.',
  email: 'farmacia@boticanovasalud.pe',
  phone: '+51 999 888 777',
  location: 'Jr. Mariano Núñez 485, Cercado de Juliaca, San Román, Puno, Perú',
  regente: 'Q.F. Regente Colegiada · Matrícula CQFP Activa'
};

const ASSETS = {
  hero: '/images/hero/pharmacist-hero-hd.jpg',
  statement: null,
  gridline: null,
  forma: null,
  still: null,
  fieldnotes: null,
  orbit: null,
  signal: null,
  featuredPhoto: '/media/laboratorio-hero.png',
  video: '/media/hero-video.mp4'
};

const PROJECTS = [
  {
    id: '01',
    slug: 'amoxicilina-acido-clavulanico',
    title: 'Amoxicilina + Ác. Clavulánico 875/125mg',
    year: '2026',
    discipline: 'Antibacteriano Sistémico',
    role: 'Dispensación bajo receta médica obligatoria.',
    summary: 'Antibiótico de amplio espectro para infecciones respiratorias y bacterianas complejas.',
    challenge: 'Garantizar el cumplimiento estricto de la prescripción médica y evitar la resistencia antimicrobiana.',
    approach: 'Un protocolo riguroso de validación por Químico Farmacéutico colegiado, verificación de posología e ingreso al sistema de farmacovigilancia DIGEMID.',
    deliverables: ['Blíster sellado x 14 tabletas', 'Asesoría posológica personalizada', 'Trazabilidad de lote DIGEMID'],
    coverKey: 'gridline',
    projectType: 'Medicamento Ético Regulado',
    featuredLines: ['GRIDLINE', 'LABORATORIO'],
    caption: 'Control Sanitario DIGEMID // S/ 38.50',
    precio: 38.50,
    laboratorio: 'Medifarma S.A.',
    requiereReceta: true,
    stock: 24
  },
  {
    id: '02',
    slug: 'insulina-glargina-solostar',
    title: 'Insulina Glargina 100 UI/ml Inyectable',
    year: '2026',
    discipline: 'Cadena de Frío & Endocrinología',
    role: 'Conservación garantizada entre 2°C y 8°C.',
    summary: 'Insulina análoga humana de acción prolongada para el control glucémico diario en diabetes mellitus.',
    challenge: 'Preservar la cadena de frío sin interrupciones desde la recepción hasta la entrega al paciente.',
    approach: 'Monitoreo termométrico digital en refrigerador farmacéutico certificado y entrega en estuche térmico con gel refrigerante para traslado seguro.',
    deliverables: ['Pluma prellenada descartable Solostar 3ml', 'Empaque térmico de traslado seguro', 'Hoja de control glucémico'],
    coverKey: 'forma',
    projectType: 'Cadena de Frío Estricta',
    caption: 'Refrigeración 2°C - 8°C // S/ 89.00',
    precio: 89.00,
    laboratorio: 'Sanofi Aventis',
    requiereReceta: true,
    stock: 8
  },
  {
    id: '03',
    slug: 'paracetamol-pediatrico-gotas',
    title: 'Paracetamol Pediátrico 100mg/ml Gotas',
    year: '2025',
    discipline: 'Pediatría & Alivio Térmico',
    role: 'Dosificación exacta por peso corporal.',
    summary: 'Analgésico y antipirético infantil de primera línea para cuadros febriles y dolor post-vacunación.',
    challenge: 'Evitar errores de sobredosificación en lactantes y niños pequeños.',
    approach: 'Cálculo de dosis exacta según peso y edad por el farmacéutico en mostrador, entregando gotero calibrado milimétrico.',
    deliverables: ['Frasco gotero x 30ml', 'Gotero milimetrado certificado', 'Guía de dosificación pediátrica'],
    coverKey: 'still',
    projectType: 'Venta Libre Supervisada',
    caption: 'Alivio Febril Infantil // S/ 14.50',
    precio: 14.50,
    laboratorio: 'Laboratorios Farmindustria',
    requiereReceta: false,
    stock: 35
  },
  {
    id: '04',
    slug: 'losartan-potasico-50mg',
    title: 'Losartán Potásico 50mg Tabletas',
    year: '2025',
    discipline: 'Cardiología & Hipertensión',
    role: 'Tratamiento crónico y prevención cardiovascular.',
    summary: 'Antagonista de receptores de angiotensina II para el control óptimo de la presión arterial sistémica.',
    challenge: 'Asegurar la continuidad del tratamiento crónico a precios accesibles para adultos mayores.',
    approach: 'Programa de paciente crónico con descuentos por caja cerrada y servicio de toma de presión arterial sin costo.',
    deliverables: ['Caja x 30 tabletas recubiertas', 'Monitoreo de presión arterial en botica', 'Carné de control cardiovascular'],
    coverKey: 'fieldnotes',
    projectType: 'Tratamiento Crónico Continuo',
    caption: 'Salud Cardiovascular // S/ 22.00',
    precio: 22.00,
    laboratorio: 'Laboratorios AC Farma',
    requiereReceta: true,
    stock: 50
  },
  {
    id: '05',
    slug: 'solucion-rehidratante-oral',
    title: 'Electrolitos Orales Balanceados Zinc',
    year: '2024',
    discipline: 'Gastroenterología & Hidratación',
    role: 'Restablecimiento de balance hidroelectrolítico.',
    summary: 'Fórmula recomendada por la OMS con zinc para reposición rápida de líquidos en cuadros deshidratantes.',
    challenge: 'Proporcionar una opción de absorción acelerada apta para niños y adultos mayores.',
    approach: 'Disponibilidad permanente de formulaciones balanceadas que favorecen la tolerancia oral y la pronta recuperación celular.',
    deliverables: ['Botella x 500ml fórmula balanceada', 'Formulación OMS + Zinc', 'Guía de hidratación rápida'],
    coverKey: 'orbit',
    projectType: 'Rehidratación Rápida',
    caption: 'Balance Electrolítico // S/ 9.80',
    precio: 9.80,
    laboratorio: 'Laboratorios B. Braun',
    requiereReceta: false,
    stock: 42
  },
  {
    id: '06',
    slug: 'neurobion-doble-accion',
    title: 'Neurobión Doble Acción B12 + Vitamina C',
    year: '2024',
    discipline: 'Neurobiología & Suplementación',
    role: 'Regeneración nerviosa y vitalidad metabólica.',
    summary: 'Combinación sinérgica de vitaminas del complejo B con antioxidante para fatiga muscular y neuritis.',
    challenge: 'Ofrecer bioequivalencia comprobada para alivio neuromuscular rápido.',
    approach: 'Asesoría en horarios de ingesta para máxima absorción biológica y bienestar general.',
    deliverables: ['Caja x 20 tabletas bicapa', 'Recomendación nutricional complementaria', 'Garantía de procedencia alemana'],
    coverKey: 'signal',
    projectType: 'Bienestar & Neuroprotección',
    caption: 'Vitalidad Celular // S/ 34.00',
    precio: 34.00,
    laboratorio: 'P&G Health / Merck',
    requiereReceta: false,
    stock: 28
  }
];

const SERVICES = [
  {
    id: '01',
    title: 'Dispensación de Recetas Médicas',
    scope: 'Revisión por Químico Farmacéutico / Posología / Farmacovigilancia',
    text: 'Validación profesional minuciosa de recetas médicas emitidas por clínicas, hospitales o consultorios privados, previniendo interacciones medicamentosas adversas.',
    deliverables: 'Revisión técnica de prescripción, verificación de dosis y contraindicaciones, fraccionamiento autorizado y seguimiento farmacoterapéutico.'
  },
  {
    id: '02',
    title: 'Cadena de Frío & Medicamentos Especiales',
    scope: 'Conservación 2°C - 8°C / Termorregistro Digital / Embalaje Térmico',
    text: 'Infraestructura especializada para insulinas, vacunas, colirios y productos biológicos, garantizando que el principio activo llegue con 100% de potencia terapéutica.',
    deliverables: 'Refrigerador médico regulado, data-logger con registro continuo de temperatura, y empaques térmicos con gel refrigerante para traslado seguro.'
  },
  {
    id: '03',
    title: 'Atención Farmacéutica & Monitoreo de Parámetros',
    scope: 'Toma de Presión Gratuita / Control de Glucosa / Asesoría en Tratamiento',
    text: 'Servicio asistencial directo en nuestro establecimiento comercial para la medición de parámetros vitales y orientación en adherencia al tratamiento.',
    deliverables: 'Medición de presión arterial con tensiómetros clínicos calibrados, orientación en horarios de ingesta y carné preventivo para pacientes crónicos.'
  }
];

/* =========================================================================
   ILUSTRACIONES VECTORIALES EXACTAS (SECCIÓN 13 DEL BRIEF MARA VOSS)
   ========================================================================= */
const ArtStatement = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="720" viewBox="0 0 600 720" className="w-full h-full">
    <rect width="600" height="720" fill="#e5e0d5" />
    <g fontFamily="MonaSemi, Arial, sans-serif" fill="#111">
      <text x="32" y="48" fontSize="22" letterSpacing="-1">A STUDY OF BOTANICAL SCIENCE</text>
      <text x="32" y="75" fontSize="10" letterSpacing="2">RIGOR / MOLECULE / PURITY — 01–06</text>
    </g>
    <g stroke="#a5a096" fill="none">
      <path d="M32 96h536M32 110v530M298 110v530M568 110v530M32 280h536M32 460h536M32 640h536" />
    </g>
    <g transform="translate(60 128)">
      <rect width="205" height="122" fill="#141414" />
      <circle cx="103" cy="61" r="45" fill="#e5e0d5" />
      <rect x="83" y="-2" width="40" height="126" fill="#ff630f" />
    </g>
    <g transform="translate(326 128)" fill="#171717">
      <path d="M0 122 105 0 205 122Z" />
      <path d="M40 122 105 50 170 122Z" fill="#e5e0d5" />
    </g>
    <g transform="translate(60 305)">
      <rect width="205" height="125" fill="#ff630f" />
      <path d="M0 0 205 125M0 25 165 125M0 50 125 125M40 0 205 100M80 0 205 75" stroke="#131313" strokeWidth="12" />
    </g>
    <g transform="translate(328 302)" fill="none" stroke="#171717" strokeWidth="2">
      <ellipse cx="102" cy="64" rx="100" ry="61" />
      <ellipse cx="102" cy="64" rx="75" ry="61" />
      <ellipse cx="102" cy="64" rx="50" ry="61" />
      <ellipse cx="102" cy="64" rx="25" ry="61" />
      <path d="M2 64h200" />
    </g>
    <g transform="translate(60 483)">
      <rect x="0" y="0" width="76" height="124" fill="#111" />
      <rect x="92" y="0" width="34" height="124" fill="#ff630f" />
      <rect x="144" y="0" width="60" height="124" fill="#111" />
    </g>
    <g transform="translate(333 483)" fill="#131313">
      <circle cx="55" cy="45" r="45" />
      <circle cx="130" cy="78" r="45" />
      <circle cx="90" cy="61" r="22" fill="#e5e0d5" />
    </g>
    <g fontFamily="MonaSemi, Arial, sans-serif" fontSize="9" letterSpacing="1" fill="#333">
      <text x="36" y="273">01 / TRAZABILIDAD</text>
      <text x="302" y="273">02 / CADENA DE FRÍO</text>
      <text x="36" y="453">03 / QUÍMICOS REGENTES</text>
      <text x="302" y="453">04 / DISPENSACIÓN</text>
      <text x="36" y="633">05 / FARMACOVIGILANCIA</text>
      <text x="302" y="633">06 / CONTROL SANITARIO</text>
      <text x="32" y="689">INVESTIGACIÓN CLÍNICA / BOTICA NOVA SALUD</text>
    </g>
  </svg>
);

const ArtGridline = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" className="w-full h-full">
    <rect width="800" height="800" fill="#e6e2d8" />
    <g stroke="#aeaaa0" strokeWidth="1">
      <path d="M50 0v800M225 0v800M400 0v800M575 0v800M750 0v800M0 50h800M0 225h800M0 400h800M0 575h800M0 750h800" />
    </g>
    <path d="M400 50h175v175H400zM50 225h175v175H50zM575 400h175v175H575zM225 575h175v175H225z" fill="#171717" />
    <path d="M400 400h175v175H400z" fill="#ff630f" />
    <path d="M418 418h139v139H418z" fill="none" stroke="#171717" strokeWidth="2" />
    <g fontFamily="MonaSemi, Arial, sans-serif" fill="#111">
      <text x="65" y="141" fontSize="74" fontWeight="700" letterSpacing="-5">GRIDLINE</text>
      <text x="232" y="324" fontSize="85" fontWeight="400" letterSpacing="-6">STUDIO</text>
      <text x="65" y="705" fontSize="13" letterSpacing="1">SPACES FOR</text>
      <text x="65" y="726" fontSize="13" letterSpacing="1">NEW PERSPECTIVES.</text>
      <text x="587" y="708" fontSize="11">IDENTITY SYSTEM</text>
      <text x="587" y="727" fontSize="11">CONCEPT / 2026</text>
    </g>
    <path d="M602 260h95v95m0-95-95 95" stroke="#ff630f" strokeWidth="10" fill="none" />
  </svg>
);

const ArtForma = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" className="w-full h-full">
    <rect width="800" height="800" fill="#eae5da" />
    <rect x="35" y="35" width="730" height="730" fill="#111" />
    <g fontFamily="MonaSemi, Arial, sans-serif">
      <text x="63" y="78" fill="#eee9dd" fontSize="11" letterSpacing="2">CADENA DE FRÍO MÉDICA</text>
      <text x="63" y="254" fill="#eee9dd" fontSize="140" fontWeight="700" letterSpacing="-10">2°C–8°C</text>
    </g>
    <path d="M35 284h730v365H35z" fill="#ff630f" />
    <ellipse cx="388" cy="467" rx="226" ry="150" fill="#151515" transform="rotate(-24 388 467)" />
    <ellipse cx="405" cy="461" rx="100" ry="145" fill="#eae5da" transform="rotate(-24 405 461)" />
    <path d="M35 565 765 347M35 590 765 372" stroke="#eae5da" strokeWidth="1" />
    <g fontFamily="MonaSemi, Arial, sans-serif" fill="#eee9dd">
      <text x="62" y="691" fontSize="12" letterSpacing="2">INSULINAS / VACUNAS / BIOLÓGICOS</text>
      <text x="62" y="726" fontSize="26" letterSpacing="-1">Preservación certificada.</text>
      <text x="684" y="726" fontSize="36" letterSpacing="-3">02</text>
    </g>
  </svg>
);

const ArtStill = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" className="w-full h-full">
    <rect width="800" height="800" fill="#d5cec0" />
    <path d="M0 565 800 502v298H0Z" fill="#b9b2a4" />
    <g fontFamily="MonaSemi, Arial, sans-serif" fill="#35352e">
      <text x="45" y="100" fontSize="57" letterSpacing="-4">still objects</text>
      <text x="48" y="132" fontSize="11" letterSpacing="2">LESS, WITH INTENTION.</text>
    </g>
    <rect x="245" y="359" width="162" height="302" rx="24" fill="#eee9db" />
    <rect x="275" y="305" width="102" height="60" rx="5" fill="#292a25" />
    <rect x="268" y="437" width="118" height="150" fill="#e9e4d7" />
    <g fontFamily="MonaSemi, Arial, sans-serif" fill="#30312b">
      <text x="281" y="473" fontSize="26" letterSpacing="-2">paracetamol.</text>
      <text x="281" y="511" fontSize="8" letterSpacing="1">GOTAS ORALES</text>
      <text x="281" y="548" fontSize="8">100 MG / ML</text>
      <text x="281" y="568" fontSize="8">30 ML</text>
    </g>
    <rect x="281" y="487" width="15" height="3" fill="#ff630f" />
    <g fontFamily="MonaSemi, Arial, sans-serif" fill="#35352e" fontSize="10" letterSpacing="1">
      <text x="45" y="751">FARMACOVIGILANCIA PEDIÁTRICA</text>
      <text x="623" y="751">NOVA SALUD</text>
    </g>
  </svg>
);

const ArtFieldnotes = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" className="w-full h-full">
    <rect width="800" height="800" fill="#181818" />
    <rect x="35" y="135" width="730" height="530" fill="#dfdcd2" />
    <path d="M400 135v530" stroke="#aca89c" strokeWidth="3" />
    <g fontFamily="MonaSemi, Arial, sans-serif" fill="#171717">
      <text x="59" y="171" fontSize="10" letterSpacing="2">SALUD CARDIOVASCULAR</text>
      <text x="428" y="171" fontSize="10" letterSpacing="1">PROGRAMA DE PACIENTE CRÓNICO</text>
      <text x="55" y="253" fontSize="58" letterSpacing="-3">Between</text>
      <text x="55" y="322" fontSize="58" letterSpacing="-3">the walls.</text>
      <text x="60" y="638" fontSize="9">014 / MONITOREO GRATUITO</text>
      <text x="694" y="638" fontSize="9">04</text>
    </g>
    <path d="M60 350h310M428 594h310" stroke="#151515" />
    <path d="M428 550 603 455" stroke="#ff630f" strokeWidth="2" />
    <g fontFamily="MonaSemi, Arial, sans-serif" fill="#e8e2d7">
      <text x="35" y="82" fontSize="31" letterSpacing="-1">losartán 50mg</text>
      <text x="35" y="732" fontSize="10" letterSpacing="2">ATENCIÓN Y DISPENSACIÓN PERMANENTE</text>
    </g>
    <path d="M672 76h93" stroke="#ff630f" strokeWidth="5" />
  </svg>
);

const ArtOrbit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" className="w-full h-full">
    <rect width="800" height="800" fill="#e4e0d5" />
    <g fontFamily="MonaSemi, Arial, sans-serif">
      <text x="45" y="92" fill="#141414" fontSize="54" letterSpacing="-3">orbit</text>
      <text x="510" y="78" fill="#444" fontSize="10" letterSpacing="2">A SPACE FOR HEALTH</text>
    </g>
    <rect x="40" y="151" width="720" height="550" rx="16" fill="#171717" />
    <path d="M195 151v550M195 219h565" stroke="#444" />
    <g fill="none" stroke="#aaa69d">
      <circle cx="380" cy="377" r="95" />
      <circle cx="380" cy="377" r="68" />
      <circle cx="380" cy="377" r="40" />
    </g>
    <circle cx="441" cy="305" r="22" fill="#ff630f" />
    <rect x="559" y="244" width="180" height="130" rx="8" fill="#ff630f" />
    <g fontFamily="MonaSemi, Arial, sans-serif" fill="#dedbd1">
      <text x="576" y="415" fontSize="10" letterSpacing="1">BALANCE HIDROELECTROLÍTICO</text>
      <text x="576" y="454" fontSize="22">Absorción</text>
      <text x="576" y="480" fontSize="22">acelerada.</text>
    </g>
  </svg>
);

const ArtSignal = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" className="w-full h-full">
    <rect width="800" height="800" fill="#e6e0d3" />
    <path d="M0 69h800v129H0zM0 320h800v95H0zM0 621h800v96H0z" fill="#ff630f" />
    <g fontFamily="MonaSemi, Arial, sans-serif" fontWeight="900" fontSize="160" letterSpacing="-10" fill="#151515">
      <text x="18" y="220" textLength="756" lengthAdjust="spacingAndGlyphs">SIGNAL</text>
      <text x="18" y="435" textLength="756" lengthAdjust="spacingAndGlyphs">SIGNAL</text>
      <text x="18" y="648" textLength="756" lengthAdjust="spacingAndGlyphs">SIGNAL</text>
    </g>
    <path d="M0 274h800M0 489h800" stroke="#181818" />
    <g fontFamily="MonaSemi, Arial, sans-serif" fill="#171717" fontSize="11" letterSpacing="1">
      <text x="24" y="36">NEUROPROTECCIÓN &amp; METABOLISMO</text>
      <text x="657" y="36">STUDY 06</text>
      <text x="24" y="763">DISPENSACIÓN FARMACÉUTICA.</text>
      <text x="577" y="763">NOVA SALUD / 2026</text>
    </g>
  </svg>
);

const artMap = {
  gridline: ArtGridline,
  forma: ArtForma,
  still: ArtStill,
  fieldnotes: ArtFieldnotes,
  orbit: ArtOrbit,
  signal: ArtSignal
};

/* =========================================================================
   COMPONENTE AUXILIAR: ENLACE CON TEXTO RODANTE (ROLLING TEXT 96PX)
   ========================================================================= */
function RollingLink({ href, label, onClick }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="group block h-[70px] sm:h-[88px] overflow-hidden text-5xl sm:text-7xl md:text-8xl lg:text-[96px] font-display font-medium tracking-[-3.84px] leading-[70px] sm:leading-[88px] text-white select-none"
    >
      <span className="inline-flex">
        {label.split('').map((char, i) => (
          <span key={i} className="inline-block h-[70px] sm:h-[88px] overflow-hidden">
            <span
              className="flex flex-col transition-transform duration-500 ease-out group-hover:-translate-y-[70px] sm:group-hover:-translate-y-[88px]"
              style={{ transitionDelay: `${i * 34}ms` }}
            >
              <span className="h-[70px] sm:h-[88px] flex items-center justify-center text-white">
                {char === ' ' ? '\u00A0' : char}
              </span>
              <span className="h-[70px] sm:h-[88px] flex items-center justify-center text-[#ff630f]">
                {char === ' ' ? '\u00A0' : char}
              </span>
            </span>
          </span>
        ))}
      </span>
    </a>
  );
}

/* =========================================================================
   COMPONENTE PRINCIPAL: LANDING CATÁLOGO EXACTO AL BRIEF
   ========================================================================= */
export default function LandingCatalogo() {
  const [localTime, setLocalTime] = useState('');
  const [timeOffset, setTimeOffset] = useState('GMT-05:00 // LOCAL');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const dialogRef = useRef(null);

  const [expandedServices, setExpandedServices] = useState({});
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isOverFeaturedCard, setIsOverFeaturedCard] = useState(false);
  const [featuredTilt, setFeaturedTilt] = useState({ rx: 0, ry: 0 });
  const [hoveredStatement, setHoveredStatement] = useState(false);
  const [statementPos, setStatementPos] = useState({ x: 0, y: 0 });
  const [isOverFace, setIsOverFace] = useState(false);

  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const webglStateRef = useRef(null);
  const [copiedText, setCopiedText] = useState('');

  // 1. Reloj en tiempo real
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setLocalTime(`${hours}:${minutes}:${seconds}`);

      const offsetMinutes = -now.getTimezoneOffset();
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const absOffset = Math.abs(offsetMinutes);
      const offH = String(Math.floor(absOffset / 60)).padStart(2, '0');
      const offM = String(absOffset % 60).padStart(2, '0');
      setTimeOffset(`GMT${sign}${offH}:${offM} // LOCAL`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Cursor personalizado fino
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // 3. WebGL Canvas Shader del Hero (Exacto Sección 14)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
    if (!gl) return;

    const vsSource = `
      attribute vec2 position; varying vec2 vUv;
      void main(){ vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D image; uniform vec2 resolution, imageSize, mouse, trail[9];
      uniform float strength, time;
      vec2 coverUv(vec2 uv){
        float rs = resolution.x / resolution.y;
        float ims = imageSize.x / imageSize.y;
        vec2 scale = rs < ims ? vec2(rs / ims, 1.0) : vec2(1.0, ims / rs);
        return (uv - 0.5) * scale + 0.5;
      }
      void main(){
        vec2 uv = vUv;
        vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
        vec2 delta = (uv - mouse) * aspect;
        float dist = length(delta);
        float radius = 0.47;
        float falloff = (1.0 - smoothstep(0.0, radius, dist)) * strength;
        vec2 dir = delta / (dist + 0.0001);
        vec2 tangent = vec2(-dir.y, dir.x);
        float wave = sin(dist * 38.0 - time * 2.15) * falloff;
        float secondary = sin(dist * 19.0 + time * 0.7) * falloff;
        vec2 displacement = dir * (wave * 0.00525 + falloff * 0.004);
        displacement += tangent * secondary * 0.001875;
        vec2 sampleUv = coverUv(uv + displacement);
        float aberration = (falloff * 0.0016 + abs(wave) * 0.0012);
        vec2 rgbShift = dir * aberration;
        float r = texture2D(image, sampleUv + rgbShift).r;
        float g = texture2D(image, sampleUv).g;
        float b = texture2D(image, sampleUv - rgbShift).b;
        vec3 color = vec3(r, g, b);
        vec3 orange = vec3(1.0, 0.22, 0.025);
        float glow = falloff * (0.10 + 0.08 * (sin(dist * 28.0 - time * 1.5) * 0.5 + 0.5));
        float trailGlow = 0.0;
        for(int i = 0; i < 9; i++){
          vec2 trailDelta = (uv - trail[i]) * aspect;
          float trailDistance = length(trailDelta);
          float age = 1.0 - float(i) / 9.0;
          float halo = exp(-trailDistance * trailDistance * 145.0);
          float core = exp(-trailDistance * trailDistance * 420.0);
          float shimmer = 0.82 + 0.18 * sin(time * 2.0 - float(i) * 0.72);
          trailGlow += (halo * 0.48 + core * 0.28) * age * age * shimmer;
        }
        float headProtection = smoothstep(0.035, 0.105, dist);
        trailGlow = min(trailGlow, 1.35) * strength * headProtection;
        vec3 trailOrange = vec3(1.0, 0.31, 0.045);
        vec3 trailGold = vec3(1.0, 0.58, 0.20);
        color += orange * glow;
        color += trailOrange * trailGlow * 0.46;
        color += trailGold * pow(trailGlow, 1.65) * 0.11;
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'resolution');
    const uImgSize = gl.getUniformLocation(program, 'imageSize');
    const uMouse = gl.getUniformLocation(program, 'mouse');
    const uStrength = gl.getUniformLocation(program, 'strength');
    const uTime = gl.getUniformLocation(program, 'time');
    const uTrail = [];
    for (let i = 0; i < 9; i++) {
      uTrail.push(gl.getUniformLocation(program, `trail[${i}]`));
    }

    const texture = gl.createTexture();
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = ASSETS.hero;

    let imgNaturalWidth = 2048;
    let imgNaturalHeight = 1152;
    let textureReady = false;

    image.onload = () => {
      imgNaturalWidth = image.naturalWidth || 2048;
      imgNaturalHeight = image.naturalHeight || 1152;
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      textureReady = true;
      canvas.style.opacity = '1';
    };

    const state = {
      targetMouse: { x: 0.6, y: 0.5 },
      currentMouse: { x: 0.6, y: 0.5 },
      targetStrength: 0,
      currentStrength: 0,
      trail: Array.from({ length: 9 }, () => ({ x: 0.6, y: 0.5 })),
      startTime: performance.now(),
      animId: null
    };
    webglStateRef.current = state;

    const resize = () => {
      const rect = heroRef.current ? heroRef.current.getBoundingClientRect() : { width: window.innerWidth, height: 900 };
      const dpr = Math.min(window.devicePixelRatio || 1, 2.25);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      state.animId = requestAnimationFrame(render);
      if (!textureReady) return;

      state.currentMouse.x += (state.targetMouse.x - state.currentMouse.x) * 0.075;
      state.currentMouse.y += (state.targetMouse.y - state.currentMouse.y) * 0.075;
      state.currentStrength += (state.targetStrength - state.currentStrength) * 0.07;

      state.trail[0].x += (state.currentMouse.x - state.trail[0].x) * 0.19;
      state.trail[0].y += (state.currentMouse.y - state.trail[0].y) * 0.19;
      for (let i = 1; i < 9; i++) {
        const factor = 0.19 - i * 0.009;
        state.trail[i].x += (state.trail[i - 1].x - state.trail[i].x) * factor;
        state.trail[i].y += (state.trail[i - 1].y - state.trail[i].y) * factor;
      }

      gl.useProgram(program);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uImgSize, imgNaturalWidth, imgNaturalHeight);
      gl.uniform2f(uMouse, state.currentMouse.x, state.currentMouse.y);
      gl.uniform1f(uStrength, state.currentStrength);
      gl.uniform1f(uTime, (performance.now() - state.startTime) / 1000);

      for (let i = 0; i < 9; i++) {
        gl.uniform2f(uTrail[i], state.trail[i].x, state.trail[i].y);
      }

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    render();

    return () => {
      cancelAnimationFrame(state.animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Manejo de eventos del Hero
  const handleHeroMouseMove = (e) => {
    if (!heroRef.current || !webglStateRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;

    // Face hover zoom (normX: 0.40 - 0.79, normY: 0.075 - 0.86)
    if (normX >= 0.40 && normX <= 0.79 && normY >= 0.075 && normY <= 0.86) {
      setIsOverFace(true);
    } else {
      setIsOverFace(false);
    }

    webglStateRef.current.targetMouse = { x: normX, y: 1.0 - normY };
    webglStateRef.current.targetStrength = 1.0;
  };

  const handleHeroMouseLeave = () => {
    setIsOverFace(false);
    if (webglStateRef.current) {
      webglStateRef.current.targetStrength = 0.0;
    }
  };

  // Tilt 3D en Featured Card
  const handleFeaturedCardMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setFeaturedTilt({ rx: (y - 0.5) * -24.2, ry: (x - 0.5) * 30.8 });
  };

  const handleFeaturedCardLeave = () => {
    setFeaturedTilt({ rx: 0, ry: 0 });
    setIsOverFeaturedCard(false);
  };

  const openModal = (project) => {
    setActiveProject(project);
    if (dialogRef.current) {
      dialogRef.current.showModal();
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
      document.body.style.overflow = '';
    }
    setActiveProject(null);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(label);
      setTimeout(() => setCopiedText(''), 2500);
    });
  };

  const toggleService = (id) => {
    setExpandedServices((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff] font-sans selection:bg-[#ff630f] selection:text-black overflow-x-hidden relative">
      {/* ===================================================================
          SKIP LINK DE ACCESIBILIDAD (SECCIÓN 11)
          =================================================================== */}
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[150] focus:px-6 focus:py-3 focus:bg-[#ff630f] focus:text-black focus:font-mono focus:rounded-full"
      >
        Skip to selected work
      </a>

      {/* ===================================================================
          CURSOR PERSONALIZADO (PUNTERO FINO 20PX - SECCIÓN 11)
          =================================================================== */}
      <div
        className="fixed pointer-events-none z-[100] w-5 h-5 rounded-full border border-white/60 bg-white/20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out hidden md:block"
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          opacity: isOverFeaturedCard ? 0 : 1
        }}
      />

      {/* CURSOR EXPANDIDO 100PX SOBRE FEATURED CARD (SECCIÓN 6) */}
      {isOverFeaturedCard && (
        <div
          className="fixed pointer-events-none z-[101] w-24 h-24 rounded-full bg-[#ff630f] text-black font-display font-medium text-xs flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 shadow-2xl transition-transform duration-100 ease-out hidden md:flex uppercase tracking-wider select-none leading-tight"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`
          }}
        >
          <span>View</span>
          <span>case study</span>
        </div>
      )}

      {/* ===================================================================
          1. NAVEGACIÓN SUPERIOR (TOP 28PX, INSET 3% - SECCIÓN 3)
          =================================================================== */}
      <nav
        id="top"
        className="fixed top-0 left-0 right-0 z-40 px-[3vw] pt-7 pb-4 flex items-center justify-between pointer-events-none animate-nav-down"
      >
        {/* Izquierda: Reloj local con números tabulares */}
        <div className="pointer-events-auto leading-tight select-none">
          <div className="text-[11px] font-mono tracking-widest text-[#949494] uppercase">
            {timeOffset}
          </div>
          <div className="text-sm font-mono font-bold tracking-wider text-white">
            {localTime || '08:00:00'}
          </div>
        </div>

        {/* Centro: Botón de Menú con las 7 barras de Mara Voss ([3,7,12,4,8,6,3]px) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          className="pointer-events-auto group min-w-[60px] min-h-[48px] flex flex-col items-center justify-center px-4 py-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[#ff630f] focus:ring-offset-2 focus:ring-offset-black rounded-lg transition"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <div className="flex items-end space-x-[3px] h-[14px] mb-1">
            {[3, 7, 12, 4, 8, 6, 3].map((height, idx) => (
              <span
                key={idx}
                className="w-[3px] bg-white group-hover:bg-[#ff630f] transition-all"
                style={{ height: menuOpen ? '4px' : `${height}px` }}
              />
            ))}
          </div>
          <span className="text-[14px] font-display font-medium tracking-widest text-[#ffffff] group-hover:text-[#ff630f] uppercase">
            {menuOpen ? 'CLOSE' : 'MENU'}
          </span>
        </button>

        {/* Derecha: Píldora blanca "Let’s talk ↗" + Acceso Personal */}
        <div className="pointer-events-auto flex items-center space-x-3">
          <Link
            to="/admin/login"
            className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 rounded-full border border-[#333333] hover:border-[#ff630f] text-xs font-display text-[#aaaaaa] hover:text-white transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Acceso Personal</span>
          </Link>

          <a
            href="#contact"
            className="inline-flex items-center justify-center bg-white text-black hover:bg-[#ff630f] hover:text-black rounded-full min-h-[50px] px-6 py-3 text-[18px] font-display font-medium tracking-tight transition-all duration-250 hover:scale-[1.04] active:scale-[0.98] shadow-lg"
          >
            <span>Let’s talk ↗</span>
          </a>
        </div>
      </nav>

      {/* ===================================================================
          OVERLAY DE NAVEGACIÓN EXPANDIBLE CON ROLLING TEXT (SECCIÓN 4)
          =================================================================== */}
      {menuOpen && (
        <>
          {/* Scrim fijo al 65% de negro */}
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/65 z-40 backdrop-blur-sm"
          />

          {/* Panel negro que desciende desde -24px hasta 0 over 0.42s */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-[#000000] border-b border-[#222222] px-[4vw] pt-[105px] pb-[80px] shadow-2xl animate-in fade-in slide-in-from-top-6 duration-400">
            <div className="max-w-[1440px] mx-auto flex flex-col justify-between h-full space-y-12">
              <div className="flex justify-between items-center border-b border-[#222222] pb-4">
                <span className="text-xs font-mono text-[#ff630f] tracking-widest uppercase">
                  // NAVIGATION OVERLAY
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-xs font-display font-medium uppercase text-white hover:text-[#ff630f] tracking-widest"
                >
                  CLOSE [✕]
                </button>
              </div>

              {/* 3 Enlaces con texto rodante de 96px */}
              <div className="flex flex-col items-center justify-center space-y-8 my-auto">
                <RollingLink
                  href="#about"
                  label="About"
                  onClick={() => setMenuOpen(false)}
                />
                <RollingLink
                  href="#work"
                  label="Work"
                  onClick={() => setMenuOpen(false)}
                />
                <RollingLink
                  href="#contact"
                  label="Contact"
                  onClick={() => setMenuOpen(false)}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-[#949494] border-t border-[#222222] pt-6">
                <span>BOTICA NOVA SALUD · SEDE JULIACA</span>
                <span>WHATSAPP DIRECTO: {PERSONA.phone}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===================================================================
          2. HERO MONUMENTAL: RETRATO EDITORIAL + WEBGL + TIPOGRAFÍA MONUMENTAL
          =================================================================== */}
      <header
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative min-h-[900px] h-screen w-full overflow-hidden flex flex-col justify-between px-[3vw] pt-[147px] pb-10 select-none"
      >
        {/* H1 Accesible oculto para lectores de pantalla */}
        <h1 className="sr-only">Nova Salud — Botica Especializada &amp; Farmacia Clínica</h1>

        {/* RETRATO DE FONDO (COVER EDGE-TO-EDGE - SECCIÓN 3) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 ease-out z-0"
          style={{
            backgroundImage: `url(${ASSETS.hero})`,
            filter: 'contrast(1.08) brightness(0.92)',
            transform: isOverFace ? 'scale(1.035)' : 'scale(1)'
          }}
        />

        {/* WEBGL SHADER CANVAS (RIPPLE + AURA DORADA/NARANJA - SECCIÓN 14) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-[1] transition-all duration-700 ease-out opacity-0"
          style={{
            transform: isOverFace ? 'scale(1.035)' : 'scale(1)'
          }}
        />

        {/* VELO DE GRADIENTE MARA VOSS (50% ARRIBA, TRANSPARENTE AL CENTRO, 50% ABAJO) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none z-[2]" />
        {/* Velo izquierdo para mantener el 30% izquierdo casi negro puro detrás de AD / NS */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-transparent pointer-events-none z-[2]" />

        {/* ETIQUETA VERTICAL LATERAL DERECHA (A PARTIR DE 52% DE ALTURA - SECCIÓN 3) */}
        <div className="hidden lg:block absolute right-4 top-[52%] -translate-y-1/2 z-[3] -rotate-90 origin-right text-[10px] font-mono tracking-[0.25em] text-[#949494] uppercase select-none">
          A FICTIONAL PORTRAIT / STRUCTURE &amp; EXPRESSION — 001
        </div>

        {/* CONTENIDO SUPERIOR: TÍTULO MONUMENTAL NS + NOVASALUD */}
        <div className="relative z-10 space-y-6">
          {/* TÍTULO MONUMENTAL EN UNA SOLA LÍNEA HORIZONTAL CON RETARDOS EXACTOS */}
          <div className="flex items-baseline justify-between w-full border-b border-white/10 pb-4">
            {/* Monograma Izquierdo: NS (Weight 500) */}
            <div className="flex select-none">
              <span
                className="animate-letter font-display font-medium text-white tracking-[-0.06em] leading-[0.727] text-[clamp(42px,16cqw,231px)]"
                style={{ animationDelay: '0.38s' }}
              >
                N
              </span>
              <span
                className="animate-letter font-display font-medium text-white tracking-[-0.06em] leading-[0.727] text-[clamp(42px,16cqw,231px)]"
                style={{ animationDelay: '0.48s' }}
              >
                S
              </span>
            </div>

            {/* Nombre Derecho Unido: NovaSalud (Nova 500, Salud 250) + [01] */}
            <div className="flex items-baseline select-none pr-7">
              {/* Nova */}
              <span
                className="animate-letter font-display font-medium text-white tracking-[-0.06em] leading-[0.727] text-[clamp(42px,16cqw,231px)]"
                style={{ animationDelay: '0.58s' }}
              >
                N
              </span>
              <span
                className="animate-letter font-display font-medium text-white tracking-[-0.06em] leading-[0.727] text-[clamp(42px,16cqw,231px)]"
                style={{ animationDelay: '0.68s' }}
              >
                o
              </span>
              <span
                className="animate-letter font-display font-medium text-white tracking-[-0.06em] leading-[0.727] text-[clamp(42px,16cqw,231px)]"
                style={{ animationDelay: '0.78s' }}
              >
                v
              </span>
              <span
                className="animate-letter font-display font-medium text-white tracking-[-0.06em] leading-[0.727] text-[clamp(42px,16cqw,231px)]"
                style={{ animationDelay: '0.88s' }}
              >
                a
              </span>

              {/* Salud (Weight 250 extra-light) */}
              <span
                className="animate-letter font-display font-extralight text-white tracking-[-0.06em] leading-[0.727] text-[clamp(42px,16cqw,231px)]"
                style={{ animationDelay: '0.98s' }}
              >
                S
              </span>
              <span
                className="animate-letter font-display font-extralight text-white tracking-[-0.06em] leading-[0.727] text-[clamp(42px,16cqw,231px)]"
                style={{ animationDelay: '1.08s' }}
              >
                a
              </span>
              <span
                className="animate-letter font-display font-extralight text-white tracking-[-0.06em] leading-[0.727] text-[clamp(42px,16cqw,231px)]"
                style={{ animationDelay: '1.18s' }}
              >
                l
              </span>
              <span
                className="animate-letter font-display font-extralight text-white tracking-[-0.06em] leading-[0.727] text-[clamp(42px,16cqw,231px)]"
                style={{ animationDelay: '1.28s' }}
              >
                u
              </span>
              <span
                className="animate-letter font-display font-extralight text-white tracking-[-0.06em] leading-[0.727] text-[clamp(42px,16cqw,231px)]"
                style={{ animationDelay: '1.38s' }}
              >
                d
              </span>

              {/* Superíndice [01] con delay de 1.48s */}
              <sup
                className="animate-letter text-2xl sm:text-4xl md:text-5xl font-mono text-[#ff630f] ml-3 font-normal"
                style={{ animationDelay: '1.48s' }}
              >
                [01]
              </sup>
            </div>
          </div>

          {/* SUBTÍTULO CON 35PX TOP MARGIN Y ALINEACIÓN OPUESTA (SECCIÓN 3) */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-[13px] font-mono tracking-widest text-[#b8b8b8] uppercase pt-2 gap-2 animate-in fade-in duration-500"
            style={{ animationDelay: '1.18s' }}
          >
            <div>INDEPENDENT ART DIRECTOR &amp; PHARMACEUTICAL CARE</div>
            <div>[ PORTFOLIO // SELECTED WORK ]</div>
          </div>

          {/* FLECHA CIRCULAR REBOTANTE AL 70% DEL ANCHO (SECCIÓN 3) */}
          <div className="flex justify-start sm:justify-center md:pl-[68%] pt-3">
            <a
              href="#about"
              className="group w-[52px] h-[52px] rounded-full border border-white/60 bg-black/32 backdrop-blur-md flex items-center justify-center hover:bg-[#ff630f] hover:border-[#ff630f] transition-all duration-300 active:scale-95"
              aria-label="Scroll down to Design Approach"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white group-hover:text-black transition-colors animate-arrow-bounce"
              >
                <path d="M12 4v15M5 12l7 7 7-7" />
              </svg>
            </a>
          </div>
        </div>

        {/* CONTENIDO INFERIOR: NOTAS EDITORIALES Y BOTÓN EXPLORE WORK (SECCIÓN 3) */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 pt-10">
          {/* Bloque de 420px de ancho a la izquierda */}
          <div
            className="max-w-[420px] space-y-1.5 text-sm sm:text-[18px] font-display text-white leading-relaxed animate-fade-rise"
            style={{ animationDelay: '1.55s' }}
          >
            <p className="text-white">
              • Brand identities, editorial systems, digital experiences.
            </p>
            <p className="text-[#949494]">
              • Independent practice. Thoughtful systems. Distinctive outcomes.
            </p>
          </div>

          {/* Botón Explore Work ↘ a la derecha */}
          <div className="animate-fade-rise" style={{ animationDelay: '2.075s' }}>
            <a
              href="#work"
              className="inline-flex items-center space-x-3 bg-white text-black hover:bg-[#ff630f] hover:text-black rounded-full min-h-[50px] px-8 py-4 text-[18px] font-display font-medium tracking-tight transition-all duration-250 hover:scale-[1.04] active:scale-[0.98] shadow-2xl"
            >
              <span>Explore work ↘</span>
            </a>
          </div>
        </div>
      </header>

      {/* ===================================================================
          3. DESIGN APPROACH (#about - SECCIÓN 5)
          =================================================================== */}
      <section
        id="about"
        className="relative py-28 md:py-36 px-[3vw] border-t border-[#222222] bg-[#000000] flex flex-col justify-between min-h-[900px]"
      >
        <div className="space-y-16 max-w-[1440px] mx-auto w-full">
          {/* Encabezado: // Design Approach */}
          <div className="flex items-center justify-between border-b border-[#222222] pb-4">
            <span className="text-[18px] font-mono tracking-widest text-[#ffffff] uppercase">
              // Design Approach
            </span>
            <span className="text-xs font-mono text-[#949494]">
              THOUGHTFUL SYSTEMS // DISTINCTIVE OUTCOMES
            </span>
          </div>

          {/* Declaración de 5 Líneas en Display 500 con hover visual difference */}
          <div
            className="relative cursor-default"
            onMouseEnter={() => setHoveredStatement(true)}
            onMouseLeave={() => setHoveredStatement(false)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setStatementPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
          >
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-[78px] font-display font-medium tracking-[-0.04em] leading-[0.98] text-white">
              Rooted in clarity, driven by curiosity,{' '}
              <span className="text-[#ff630f]">
                Nova Salud builds identities and clinical experiences
              </span>{' '}
              that bring structure to complex ideas through bold typography and
              thoughtful visual systems.
            </h2>

            {/* Ilustración de 280px con mix-blend-mode: difference siguiendo al cursor */}
            {hoveredStatement && (
              <div
                className="pointer-events-none absolute w-[280px] h-[336px] -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block transition-transform duration-75 mix-blend-difference opacity-90 shadow-2xl"
                style={{
                  left: `${statementPos.x}px`,
                  top: `${statementPos.y}px`
                }}
              >
                <ArtStatement />
              </div>
            )}
          </div>

          {/* Metadatos inferiores con 80px de separación */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-12 border-t border-[#222222] items-end">
            <div className="md:col-span-7 space-y-2">
              <p className="text-sm sm:text-[18px] font-display text-[#b8b8b8] leading-relaxed max-w-xl">
                I connect strategy and expression through brand identities, editorial systems, and digital experiences designed to work as a whole.
              </p>
            </div>

            <div className="md:col-span-5 space-y-3 md:text-right">
              <span className="text-[14px] font-mono tracking-widest text-[#949494] uppercase block">
                DISCIPLINES
              </span>
              <div className="flex flex-wrap md:justify-end gap-2">
                <span className="px-4 py-2 rounded-full border border-[#777777] text-[14px] font-display text-[#b8b8b8]">
                  Art Direction
                </span>
                <span className="px-4 py-2 rounded-full border border-[#777777] text-[14px] font-display text-[#b8b8b8]">
                  Brand Identity
                </span>
                <span className="px-4 py-2 rounded-full border border-[#777777] text-[14px] font-display text-[#b8b8b8]">
                  Digital Design
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          4. FEATURED PROJECT: GRIDLINE [01] STUDIO (#featured - SECCIÓN 6)
          =================================================================== */}
      <section
        id="featured"
        className="py-28 md:py-36 px-[3vw] border-t border-[#222222] bg-[#000000] relative overflow-hidden min-h-[960px]"
        style={{ perspective: '850px' }}
      >
        <div className="max-w-[1440px] mx-auto space-y-14">
          {/* Header: // Featured Project */}
          <div className="flex items-center justify-between border-b border-[#222222] pb-4">
            <span className="text-[18px] font-mono tracking-widest text-[#ffffff] uppercase">
              // Featured Project
            </span>
            <span className="text-xs font-mono text-[#949494] uppercase">
              SELF-INITIATED CONCEPT // 2026
            </span>
          </div>

          {/* Título de 2 Líneas: GRIDLINE [01] STUDIO */}
          <div className="text-center space-y-1">
            <h2 className="text-5xl sm:text-7xl lg:text-[140px] font-display font-medium tracking-[-0.04em] leading-[0.84] text-white">
              GRIDLINE <sup className="text-2xl sm:text-4xl text-[#ff630f] font-mono font-normal">[01]</sup>
            </h2>
            <div className="text-5xl sm:text-7xl lg:text-[140px] font-display font-medium tracking-[-0.04em] leading-[0.84] text-[#ffffff]">
              STUDIO
            </div>
          </div>

          {/* TARJETA 347PX CUADRADA CON PERSPECTIVA TILT */}
          <div className="flex justify-center py-6 relative">
            <div
              onMouseMove={handleFeaturedCardMove}
              onMouseEnter={() => setIsOverFeaturedCard(true)}
              onMouseLeave={handleFeaturedCardLeave}
              onClick={() => openModal(PROJECTS[0])}
              className="relative w-[347px] h-[347px] rounded-none overflow-hidden border border-[#333333] bg-[#111111] cursor-pointer shadow-2xl transition-transform duration-100 ease-out"
              style={{
                transform: `rotateX(${featuredTilt.rx}deg) rotateY(${featuredTilt.ry}deg) scale(1.025)`
              }}
            >
              {/* Imagen del Laboratorio con mix-blend-mode difference */}
              <img
                src={ASSETS.featuredPhoto}
                alt="Gridline Studio Artwork"
                className="w-full h-full object-cover filter contrast-110 brightness-95 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Icono central de flecha circular */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black/60 border border-white/40 flex items-center justify-center text-white backdrop-blur-md">
                  <ArrowUpRight className="w-5 h-5 text-[#ff630f]" />
                </div>
              </div>
            </div>
          </div>

          {/* Banda de Cuadrícula Fina de 90px de alto con reglas verticales al 6.25% */}
          <div
            className="h-[90px] border-y border-[#222222] flex items-center justify-between px-6 text-xs font-mono text-[#949494] tracking-widest uppercase relative"
            style={{
              background:
                'repeating-linear-gradient(90deg, transparent, transparent calc(6.25% - 1px), #222222 calc(6.25% - 1px), #222222 6.25%)'
            }}
          >
            <span className="bg-black/90 px-3 py-1">01 / FORM FOLLOWS A POINT OF VIEW.</span>
            <span className="hidden sm:inline bg-black/90 px-3 py-1">AUTONOMOUS ART DIRECTION SYSTEM</span>
          </div>

          {/* Subtítulo centrado y píldora View case study ↗ */}
          <div className="flex flex-col items-center justify-center space-y-6 pt-4 text-center">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-display font-medium text-white">
                Gridline Studio — Brand &amp; Digital System
              </h3>
              <p className="text-xs sm:text-sm text-[#949494] font-mono">
                Art direction / Visual identity / Web direction
              </p>
            </div>

            <button
              onClick={() => openModal(PROJECTS[0])}
              className="bg-white text-black hover:bg-[#ff630f] hover:text-black rounded-full min-h-[50px] px-8 py-3 text-[18px] font-display font-medium tracking-tight transition-all duration-200 hover:scale-[1.04] active:scale-[0.98]"
            >
              <span>View case study ↗</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================================
          5. SELECTED WORK: SIX SELF-INITIATED PROJECTS (#work - SECCIÓN 7)
          =================================================================== */}
      <section
        id="work"
        className="py-28 md:py-36 px-[4vw] border-t border-[#222222] relative min-h-[760px]"
        style={{
          background:
            'linear-gradient(180deg, #000000 0%, #000000 48%, #ea4f16 78%, #f6af60 100%)'
        }}
      >
        <div className="max-w-[1440px] mx-auto space-y-12">
          {/* Header de la sección */}
          <div className="flex items-center justify-between border-b border-[#222222] pb-4">
            <span className="text-[18px] font-mono tracking-widest text-[#ffffff] uppercase">
              // Selected Work
            </span>
            <span className="text-xs font-mono text-[#ffffff]/80 uppercase">
              SIX SELF-INITIATED PROJECTS / 2024–2026
            </span>
          </div>

          {/* Tabla de 6 Filas (Columnas de Desktop: 42px minmax(0,1fr) 210px 70px 40px) */}
          <div className="space-y-2">
            {PROJECTS.map((project) => {
              const ArtComponent = artMap[project.coverKey] || ArtGridline;
              return (
                <button
                  key={project.id}
                  onClick={() => openModal(project)}
                  className="row-wipe w-full text-left rounded-none min-h-[72px] p-4 sm:p-5 border-b border-[#333333] transition-colors duration-300 flex items-center justify-between relative group select-none"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.73)'
                  }}
                >
                  <div className="grid grid-cols-12 items-center w-full gap-4 relative z-20">
                    {/* #01 */}
                    <div className="col-span-1 text-[14px] font-mono text-[#ff630f] font-bold">
                      {project.id}
                    </div>

                    {/* Nombre del Proyecto */}
                    <div className="col-span-11 sm:col-span-6">
                      <h4 className="text-lg sm:text-[24px] font-display font-medium tracking-tight text-white">
                        {project.title}
                      </h4>
                      <p className="text-xs font-mono text-[#949494] sm:hidden">
                        {project.discipline}
                      </p>
                    </div>

                    {/* Disciplina */}
                    <div className="hidden sm:block sm:col-span-3 text-[14px] font-display text-[#b8b8b8]">
                      {project.discipline}
                    </div>

                    {/* Año */}
                    <div className="hidden sm:block sm:col-span-1 text-[14px] font-mono text-[#b8b8b8]">
                      {project.year}
                    </div>

                    {/* Flecha ↗ */}
                    <div className="hidden sm:flex sm:col-span-1 justify-end text-[18px] font-display text-white">
                      ↗
                    </div>
                  </div>

                  {/* Previsualización del Arte Vectorial de 180px al 62% del ancho */}
                  <div className="pointer-events-none absolute right-[18%] top-1/2 -translate-y-1/2 w-[180px] h-[180px] overflow-hidden shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-400 hidden lg:block z-30 border border-black/20">
                    <ArtComponent />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Llamado a la acción sobre fondo naranja: HAVE A PROJECT IN MIND? */}
          <div className="pt-20 pb-10 text-center space-y-6">
            <h3 className="text-3xl sm:text-5xl font-display font-medium tracking-tight text-black">
              HAVE A PROJECT IN MIND?
            </h3>
            <div>
              <a
                href="#contact"
                className="inline-flex items-center space-x-3 bg-white text-black hover:bg-black hover:text-white rounded-full min-h-[50px] px-8 py-4 text-[18px] font-display font-medium tracking-tight transition-all duration-200 hover:scale-[1.04] active:scale-[0.98] shadow-2xl"
              >
                <span>Start a conversation ↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          6. CAPABILITIES (#services - SECCIÓN 8)
          =================================================================== */}
      <section
        id="services"
        className="py-28 md:py-36 px-[3vw] border-t border-[#222222] bg-[#000000] min-h-[680px]"
      >
        <div className="max-w-[1440px] mx-auto space-y-16">
          {/* Título en 2 líneas: THOUGHTFUL SYSTEMS. DISTINCTIVE OUTCOMES. */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#222222] pb-8">
            <div>
              <h2 className="text-4xl sm:text-6xl md:text-[86px] font-display font-medium tracking-[-0.045em] leading-[1] text-white">
                THOUGHTFUL SYSTEMS.
              </h2>
              <h2 className="text-4xl sm:text-6xl md:text-[86px] font-display font-medium tracking-[-0.045em] leading-[1] text-[#ff630f]">
                DISTINCTIVE OUTCOMES.
              </h2>
            </div>
            <span className="text-[18px] font-mono tracking-widest text-[#949494] uppercase pt-3">
              // CAPABILITIES.
            </span>
          </div>

          {/* 3 Filas con Columnas: 42px minmax(0,1.1fr) minmax(0,1.7fr) 140px */}
          <div className="divide-y divide-[#222222]">
            {SERVICES.map((srv) => {
              const isExpanded = !!expandedServices[srv.id];
              return (
                <div key={srv.id} className="py-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                    {/* Index */}
                    <div className="md:col-span-1 text-[14px] font-mono text-[#ff630f] font-bold">
                      {srv.id}
                    </div>

                    {/* Título */}
                    <div className="md:col-span-4 text-xl sm:text-[24px] font-display font-medium text-white">
                      {srv.title}
                    </div>

                    {/* Scope */}
                    <div className="md:col-span-5 text-sm sm:text-[18px] font-display text-[#949494]">
                      {srv.scope}
                    </div>

                    {/* Botón Explore + / Close − */}
                    <div className="md:col-span-2 flex md:justify-end">
                      <button
                        onClick={() => toggleService(srv.id)}
                        className="px-6 py-2.5 rounded-full bg-[#ff630f] text-black font-display font-medium text-xs tracking-wider uppercase transition hover:scale-105 active:scale-95 shadow-md"
                      >
                        {isExpanded ? 'Close −' : 'Explore +'}
                      </button>
                    </div>
                  </div>

                  {/* Panel Desplegable con Entregables */}
                  {isExpanded && (
                    <div className="pt-4 pl-12 text-sm sm:text-base font-display text-[#b8b8b8] space-y-3 animate-in fade-in duration-200">
                      <p className="leading-relaxed">{srv.text}</p>
                      <p className="text-xs font-mono text-[#ff630f]">
                        <span className="font-bold text-white uppercase">Example deliverables: </span>
                        {srv.deliverables}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row justify-between text-xs font-mono text-[#949494] pt-8 border-t border-[#222222]">
            <span>From a focused identity to a complete digital direction.</span>
            <span>Independent practice / Collaborative approach</span>
          </div>
        </div>
      </section>

      {/* ===================================================================
          7. CONTACTO & FOOTER (#contact - SECCIÓN 9)
          =================================================================== */}
      <section
        id="contact"
        className="py-28 md:py-36 px-[3vw] border-t border-[#222222] bg-[#000000]"
      >
        <div className="max-w-[1440px] mx-auto space-y-16">
          <div className="border-b border-[#222222] pb-4">
            <span className="text-[18px] font-mono tracking-widest text-[#ffffff] uppercase">
              // Contact.
            </span>
          </div>

          {/* Gran Título en 2 Líneas: LET’S MAKE SOMETHING MATTER. */}
          <div>
            <h2 className="text-4xl sm:text-6xl md:text-[116px] font-display font-medium tracking-[-0.04em] leading-[0.9] text-white">
              LET’S MAKE
            </h2>
            <h2 className="text-4xl sm:text-6xl md:text-[116px] font-display font-medium tracking-[-0.04em] leading-[0.9] text-[#ff630f]">
              SOMETHING MATTER.
            </h2>
          </div>

          {/* Dos Columnas */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pt-6">
            <div className="md:col-span-6 space-y-4 max-w-[480px]">
              <p className="text-lg sm:text-[20px] font-display text-[#b8b8b8] leading-relaxed">
                Have a brand, publication, or digital experience in mind? Tell me what you’re building and where you want to take it.
              </p>
              <div className="text-xs font-mono text-[#949494] space-y-1">
                <p>Brand identities / Editorial systems / Digital experiences</p>
                <p>📍 {PERSONA.location}</p>
                <p>🛡️ {PERSONA.regente}</p>
              </div>
            </div>

            <div className="md:col-span-6 space-y-4 flex flex-col justify-end">
              <div className="p-8 rounded-2xl border border-[#222222] bg-[#0d0d0d] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#ff630f] uppercase tracking-wider">
                    WHATSAPP DE ATENCIÓN DIRECTA
                  </span>
                  <button
                    onClick={() => copyToClipboard(PERSONA.phone, 'tel')}
                    className="text-xs font-mono text-[#949494] hover:text-white flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedText === 'tel' ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="text-2xl sm:text-4xl font-display font-medium text-white">
                  {PERSONA.phone}
                </div>
                <a
                  href={`https://wa.me/51955545561?text=Hola%20Botica%20Nova%20Salud,%20deseo%20hacer%20una%20consulta.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-2 py-4 bg-[#ff630f] text-black font-display font-medium rounded-full text-base hover:scale-[1.02] transition shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Start a conversation ↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Final a 100px */}
          <div className="pt-20 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#949494] gap-4">
            <div>© {new Date().getFullYear()} Mara Voss · Nova Salud</div>
            <a
              href="#top"
              className="text-white hover:text-[#ff630f] transition flex items-center space-x-1"
            >
              <span>Back to top</span>
              <span>↑</span>
            </a>
          </div>

          <div className="text-[11px] font-mono text-[#666666] text-center pt-2">
            Concept portfolio — fictional persona and self-initiated projects.
          </div>
        </div>
      </section>

      {/* ===================================================================
          MODAL NATIVO <dialog> PARA CASE STUDIES (SECCIÓN 7 & 12)
          =================================================================== */}
      <dialog
        ref={dialogRef}
        onCancel={closeModal}
        className="backdrop:bg-black/85 bg-[#101010] text-[#f2f0e9] border border-[#444444] rounded-2xl w-[min(1040px,calc(100vw-32px))] max-h-[calc(100svh-32px)] p-0 shadow-2xl overflow-y-auto m-auto"
      >
        {activeProject && (
          <div className="p-6 sm:p-10 space-y-8 relative">
            {/* Toolbar sticky de cierre */}
            <div className="flex items-center justify-between border-b border-[#333333] pb-4 sticky top-0 bg-[#101010] z-10">
              <span className="text-xs font-mono text-[#ff630f] tracking-widest uppercase">
                {activeProject.projectType} // {activeProject.year}
              </span>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-white/10 text-white transition text-xs font-mono uppercase"
                aria-label="Close dialog"
              >
                Close [✕]
              </button>
            </div>

            {/* Título del Case Study */}
            <div className="space-y-2">
              <h3 className="text-4xl sm:text-6xl font-display font-medium text-white tracking-tight">
                {activeProject.title}
              </h3>
              <p className="text-[20px] text-[#b8b8b8] font-display leading-relaxed">
                {activeProject.summary}
              </p>
            </div>

            {/* Artwork contenido en máximo 540px */}
            <div className="w-full max-h-[540px] rounded-xl overflow-hidden bg-black flex items-center justify-center p-4 border border-[#222222]">
              {React.createElement(artMap[activeProject.coverKey] || ArtGridline)}
            </div>

            {/* Metadatos en 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm font-display border-t border-[#333333] pt-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-mono text-[#949494] uppercase block">Role</span>
                  <span className="text-base text-white">{activeProject.role}</span>
                </div>
                <div>
                  <span className="text-xs font-mono text-[#949494] uppercase block">Discipline</span>
                  <span className="text-base text-white">{activeProject.discipline}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-mono text-[#949494] uppercase block">Challenge</span>
                  <span className="text-sm text-[#b8b8b8]">{activeProject.challenge}</span>
                </div>
                <div>
                  <span className="text-xs font-mono text-[#949494] uppercase block">Approach</span>
                  <span className="text-sm text-[#b8b8b8]">{activeProject.approach}</span>
                </div>
              </div>
            </div>

            {/* Entregables */}
            <div className="space-y-3 border-t border-[#333333] pt-6">
              <span className="text-xs font-mono text-[#ff630f] uppercase tracking-wider block">
                Deliverables
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeProject.deliverables.map((item, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-lg bg-black/50 border border-white/10 text-xs font-mono text-[#b8b8b8]"
                  >
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Botón de Pedido / Contacto por WhatsApp */}
            <div className="pt-4 border-t border-[#333333] flex justify-end">
              <a
                href={`https://wa.me/51955545561?text=Hola%20Botica%20Nova%20Salud,%20deseo%20consultar%20por:%20${encodeURIComponent(activeProject.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 rounded-full bg-[#ff630f] text-black font-display font-medium text-sm hover:scale-105 transition shadow-xl"
              >
                Pedir / Consultar por WhatsApp ↗
              </a>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
