import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowDownRight,
  MessageCircle,
  ShieldCheck,
  ThermometerSnowflake,
  Award,
  CreditCard,
  ChevronDown,
  RefreshCw,
  Search,
  X,
  Check,
  Copy,
  Phone,
  MapPin,
  Clock,
  LogIn,
  LayoutDashboard
} from 'lucide-react';

/* =========================================================================
   CONFIGURACIÓN EDITABLE DEL SITIO (BASADO EN EL SISTEMA MARA VOSS)
   ========================================================================= */
const PERSONA = {
  companyName: 'Nova Salud',
  firstName: 'Nova',
  lastName: 'Salud',
  monogram: 'NS',
  role: 'Botica Especializada & Farmacia Clínica',
  practice: 'Medicamentos certificados DIGEMID, cadena de frío y atención personalizada.',
  email: 'farmacia@boticanovasalud.pe',
  phone: '+51 999 888 777',
  location: 'Av. Gran Chimú 1248, San Juan de Lurigancho, Lima, Perú',
  regente: 'Q.F. Regente Colegiada · Matrícula CQFP Activa'
};

const ASSETS = {
  hero: '/media/directora-farmaceutica.png',
  featured: '/media/laboratorio-hero.png',
  video: '/media/hero-video.mp4'
};

const PROJECTS = [
  {
    id: '01',
    slug: 'amoxicilina-clavulanico',
    title: 'Amoxicilina + Ácido Clavulánico 875/125mg',
    year: '2026',
    discipline: 'Antibacteriano Sistémico',
    role: 'Dispensación bajo receta médica obligatoria.',
    summary: 'Antibiótico de amplio espectro para infecciones respiratorias y bacterianas complejas.',
    challenge: 'Garantizar el cumplimiento estricto de la prescripción médica y evitar la resistencia antimicrobiana.',
    approach: 'Verificación de receta médica por Químico Farmacéutico regente, asesoría de posología y registro en sistema de farmacovigilancia.',
    deliverables: ['Blíster sellado x 14 tabletas', 'Asesoría posológica personalizada', 'Trazabilidad de lote DIGEMID'],
    coverKey: 'gridline',
    projectType: 'Medicamento Ético Regulado',
    featuredLines: ['ANTIBIÓTICOS', 'ESPECIALIZADOS'],
    caption: 'Control Sanitario DIGEMID // S/ 38.50',
    precio: 38.50,
    laboratorio: 'Medifarma S.A.',
    requiereReceta: true,
    stock: 24
  },
  {
    id: '02',
    slug: 'insulina-glargina',
    title: 'Insulina Glargina 100 UI/ml Solución Inyectable',
    year: '2026',
    discipline: 'Endocrinología & Cadena de Frío',
    role: 'Conservación garantizada entre 2°C y 8°C.',
    summary: 'Insulina análoga humana de acción prolongada para el control glucémico diario en diabetes mellitus.',
    challenge: 'Preservar la cadena de frío sin interrupciones desde la recepción hasta la entrega al paciente.',
    approach: 'Monitoreo termométrico digital en refrigerador farmacéutico certificado y entrega en estuche térmico con gel refrigerante.',
    deliverables: ['Pluma prellenada descartable Solostar 3ml', 'Empaque térmico de traslado seguro', 'Hoja de control de glicemia'],
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
    slug: 'paracetamol-gotas-jarabe',
    title: 'Paracetamol Pediátrico 100mg/ml Gotas Orales',
    year: '2025',
    discipline: 'Pediatría & Alivio Térmico',
    role: 'Dosificación exacta por peso corporal.',
    summary: 'Analgésico y antipirético infantil de primera línea para cuadros febriles y dolor post-vacunación.',
    challenge: 'Evitar errores de sobredosificación en lactantes y niños pequeños.',
    approach: 'Cálculo de dosis exacta según peso y edad por el farmacéutico en mostrador, entregando gotero calibrado.',
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
    slug: 'losartan-potasico',
    title: 'Losartán Potásico 50mg Tabletas Recubiertas',
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
    slug: 'suero-fisiologico-electrolitos',
    title: 'Solución Rehidratante Oral Electrolitos Zinc',
    year: '2024',
    discipline: 'Gastroenterología & Hidratación',
    role: 'Restablecimiento de balance hidroelectrolítico.',
    summary: 'Fórmula recomendada por la OMS con zinc para reposición rápida de líquidos en cuadros deshidratantes.',
    challenge: 'Proporcionar una opción de absorción acelerada apta para niños y adultos mayores.',
    approach: 'Disponibilidad permanente de sabores agradables que favorecen la tolerancia oral y la pronta recuperación.',
    deliverables: ['Botella x 500ml sabor manzana/fresa', 'Formulación balanceada OMS + Zinc', 'Guía de signos de alarma'],
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
    slug: 'complejo-b-vitamina-c',
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
    text: 'Servicio asistencial directo en nuestro establecimiento en San Juan de Lurigancho para la medición de parámetros vitales y orientación en adherencia al tratamiento.',
    deliverables: 'Medición de presión arterial con tensiómetros clínicos calibrados, orientación en horarios de ingesta y carné preventivo para pacientes crónicos.'
  }
];

/* =========================================================================
   COMPONENTES SVG VECTORIALES EXACTOS (DEL SISTEMA MARA VOSS)
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
      <text x="65" y="141" fontSize="74" fontWeight="700" letterSpacing="-5">LABORATORIO</text>
      <text x="232" y="324" fontSize="85" fontWeight="400" letterSpacing="-6">CLÍNICO</text>
      <text x="65" y="705" fontSize="13" letterSpacing="1">CIENCIA PURA</text>
      <text x="65" y="726" fontSize="13" letterSpacing="1">CALIDAD DIGEMID.</text>
      <text x="587" y="708" fontSize="11">SISTEMA SANITARIO</text>
      <text x="587" y="727" fontSize="11">NOVA SALUD / 2026</text>
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
      <text x="45" y="100" fontSize="57" letterSpacing="-4">dosificación segura</text>
      <text x="48" y="132" fontSize="11" letterSpacing="2">PEDIATRÍA &amp; ALIVIO TÉRMICO</text>
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
      <text x="55" y="253" fontSize="58" letterSpacing="-3">Control de</text>
      <text x="55" y="322" fontSize="58" letterSpacing="-3">presión arterial.</text>
      <text x="60" y="638" fontSize="9">014 / MONITOREO GRATUITO</text>
      <text x="694" y="638" fontSize="9">04</text>
    </g>
    <path d="M60 350h310M428 594h310" stroke="#151515" />
    <path d="M428 550 603 455" stroke="#ff630f" strokeWidth="2" />
    <g fontFamily="MonaSemi, Arial, sans-serif" fill="#e8e2d7">
      <text x="35" y="82" fontSize="31" letterSpacing="-1">losartán 50mg</text>
      <text x="35" y="732" fontSize="10" letterSpacing="2">ATENCIÓN PERMANENTE EN SAN JUAN DE LURIGANCHO</text>
    </g>
    <path d="M672 76h93" stroke="#ff630f" strokeWidth="5" />
  </svg>
);

const ArtOrbit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" className="w-full h-full">
    <rect width="800" height="800" fill="#e4e0d5" />
    <g fontFamily="MonaSemi, Arial, sans-serif">
      <text x="45" y="92" fill="#141414" fontSize="54" letterSpacing="-3">electrolitos</text>
      <text x="510" y="78" fill="#444" fontSize="10" letterSpacing="2">REHIDRATACIÓN ORAL OMS</text>
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
      <text x="18" y="220" textLength="756" lengthAdjust="spacingAndGlyphs">VITALIDAD</text>
      <text x="18" y="435" textLength="756" lengthAdjust="spacingAndGlyphs">COMPLEJO B</text>
      <text x="18" y="648" textLength="756" lengthAdjust="spacingAndGlyphs">BIENESTAR</text>
    </g>
    <path d="M0 274h800M0 489h800" stroke="#181818" />
    <g fontFamily="MonaSemi, Arial, sans-serif" fill="#171717" fontSize="11" letterSpacing="1">
      <text x="24" y="36">NEUROPROTECCIÓN &amp; METABOLISMO</text>
      <text x="657" y="36">FORMULACIÓN</text>
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
   COMPONENTE PRINCIPAL: LANDING CATÁLOGO (ARQUITECTURA MARA VOSS)
   ========================================================================= */
export default function LandingCatalogo() {
  // Reloj local en vivo con zona horaria de Lima
  const [localTime, setLocalTime] = useState('');
  const [timeOffset, setTimeOffset] = useState('GMT-05:00 // LOCAL');
  
  // Estado del menú desplegable con animación de 7 barras
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Modal nativo dialog para ficha técnica del proyecto / medicamento
  const [activeProject, setActiveProject] = useState(null);
  const dialogRef = useRef(null);

  // Acordeones de capacidades / servicios (0, 1, 2)
  const [expandedServices, setExpandedServices] = useState({});

  // Efecto de cursor y tilt 3D
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isOverFeaturedCard, setIsOverFeaturedCard] = useState(false);
  const [featuredTilt, setFeaturedTilt] = useState({ rx: 0, ry: 0 });
  const [hoveredStatement, setHoveredStatement] = useState(false);
  const [statementPos, setStatementPos] = useState({ x: 0, y: 0 });

  // WebGL Canvas Ref y State
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const webglStateRef = useRef(null);

  // Copiado al portapapeles
  const [copiedText, setCopiedText] = useState('');

  // 1. Reloj en tiempo real
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Formato HH:MM:SS
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setLocalTime(`${hours}:${minutes}:${seconds}`);

      // Offset del usuario
      const offsetMinutes = -now.getTimezoneOffset();
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const absOffset = Math.abs(offsetMinutes);
      const offH = String(Math.floor(absOffset / 60)).padStart(2, '0');
      const offM = String(absOffset % 60).padStart(2, '0');
      setTimeOffset(`GMT${sign}${offH}:${offM} // LIMA, PERÚ`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Cursor personalizado
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // 3. WebGL Canvas Shader del Hero (Exact Shader del Prompt)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
    if (!gl) return;

    // Vertex Shader
    const vsSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main(){
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader (Exacto del brief Sección 14)
    const fsSource = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D image;
      uniform vec2 resolution, imageSize, mouse, trail[9];
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
        console.warn(gl.getShaderInfoLog(shader));
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
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(program));
      return;
    }

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

    // Uniforms
    const uRes = gl.getUniformLocation(program, 'resolution');
    const uImgSize = gl.getUniformLocation(program, 'imageSize');
    const uMouse = gl.getUniformLocation(program, 'mouse');
    const uStrength = gl.getUniformLocation(program, 'strength');
    const uTime = gl.getUniformLocation(program, 'time');
    const uTrail = [];
    for (let i = 0; i < 9; i++) {
      uTrail.push(gl.getUniformLocation(program, `trail[${i}]`));
    }

    // Cargar textura de la imagen de fondo
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

    // Tracking de mouse y trail
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

    // Bucle de animación
    const render = () => {
      state.animId = requestAnimationFrame(render);
      if (!textureReady) return;

      // Suavizado
      state.currentMouse.x += (state.targetMouse.x - state.currentMouse.x) * 0.075;
      state.currentMouse.y += (state.targetMouse.y - state.currentMouse.y) * 0.075;
      state.currentStrength += (state.targetStrength - state.currentStrength) * 0.07;

      // Actualizar trail chain
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

  // Manejo del mouse en el Hero para WebGL
  const handleHeroMouseMove = (e) => {
    if (!heroRef.current || !webglStateRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height; // Y invertido para WebGL
    webglStateRef.current.targetMouse = { x, y };
    webglStateRef.current.targetStrength = 1.0;
  };

  const handleHeroMouseLeave = () => {
    if (webglStateRef.current) {
      webglStateRef.current.targetStrength = 0.0;
    }
  };

  // 4. Tilt 3D de la tarjeta destacada
  const handleFeaturedCardMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rx = (y - 0.5) * -24.2;
    const ry = (x - 0.5) * 30.8;
    setFeaturedTilt({ rx, ry });
  };

  const handleFeaturedCardLeave = () => {
    setFeaturedTilt({ rx: 0, ry: 0 });
    setIsOverFeaturedCard(false);
  };

  // 5. Apertura y cierre de modal
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

  // 6. Copiar teléfono/correo con feedback
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(label);
      setTimeout(() => setCopiedText(''), 2500);
    });
  };

  // Toggle servicio
  const toggleService = (id) => {
    setExpandedServices((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff] font-sans selection:bg-[#ff630f] selection:text-black overflow-x-hidden relative">
      {/* ===================================================================
          CURSOR PERSONALIZADO (PUNTERO FINO 20PX)
          =================================================================== */}
      <div
        className="fixed pointer-events-none z-[100] w-5 h-5 rounded-full border border-white/60 bg-white/20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out hidden md:block"
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          opacity: isOverFeaturedCard ? 0 : 1,
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* CURSOR EXPANDIDO 100PX SOBRE FEATURED CARD */}
      {isOverFeaturedCard && (
        <div
          className="fixed pointer-events-none z-[101] w-24 h-24 rounded-full bg-[#ff630f] text-black font-display font-medium text-xs flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 shadow-2xl transition-transform duration-100 ease-out hidden md:flex uppercase tracking-wider"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`
          }}
        >
          <span>Ver</span>
          <span>Ficha</span>
        </div>
      )}

      {/* ===================================================================
          1. NAVEGACIÓN SUPERIOR (TOP 28PX, INSET 3%)
          =================================================================== */}
      <nav
        id="top"
        className="fixed top-0 left-0 right-0 z-40 px-[3vw] pt-7 pb-4 flex items-center justify-between pointer-events-none"
      >
        {/* Izquierda: Reloj local en vivo */}
        <div className="pointer-events-auto leading-tight select-none">
          <div className="text-[11px] font-mono tracking-widest text-[#949494] uppercase">
            {timeOffset}
          </div>
          <div className="text-sm font-mono font-bold tracking-wider text-white">
            {localTime || '08:00:00'}
          </div>
        </div>

        {/* Centro: Botón de Menú con las 7 barras de Mara Voss */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          className="pointer-events-auto group flex flex-col items-center justify-center px-4 py-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[#ff630f] rounded-lg transition"
          aria-label="Abrir menú de navegación"
        >
          {/* Marca de 7 barras: [3, 7, 12, 4, 8, 6, 3]px */}
          <div className="flex items-end space-x-[3px] h-[14px] mb-1">
            <span
              className="w-[3px] bg-white group-hover:bg-[#ff630f] transition-all"
              style={{ height: menuOpen ? '4px' : '3px' }}
            />
            <span
              className="w-[3px] bg-white group-hover:bg-[#ff630f] transition-all"
              style={{ height: menuOpen ? '4px' : '7px' }}
            />
            <span
              className="w-[3px] bg-white group-hover:bg-[#ff630f] transition-all"
              style={{ height: menuOpen ? '4px' : '12px' }}
            />
            <span
              className="w-[3px] bg-white group-hover:bg-[#ff630f] transition-all"
              style={{ height: menuOpen ? '4px' : '4px' }}
            />
            <span
              className="w-[3px] bg-white group-hover:bg-[#ff630f] transition-all"
              style={{ height: menuOpen ? '4px' : '8px' }}
            />
            <span
              className="w-[3px] bg-white group-hover:bg-[#ff630f] transition-all"
              style={{ height: menuOpen ? '4px' : '6px' }}
            />
            <span
              className="w-[3px] bg-white group-hover:bg-[#ff630f] transition-all"
              style={{ height: menuOpen ? '4px' : '3px' }}
            />
          </div>
          <span className="text-[13px] font-display font-medium tracking-widest text-[#ffffff] group-hover:text-[#ff630f] uppercase">
            {menuOpen ? 'CERRAR' : 'MENU'}
          </span>
        </button>

        {/* Derecha: Píldora de Acción Rápida "Consultar ↗" y Panel POS */}
        <div className="pointer-events-auto flex items-center space-x-3">
          <Link
            to="/admin/login"
            className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 rounded-full border border-[#333333] hover:border-[#ff630f] text-xs font-display text-[#aaaaaa] hover:text-white transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Acceso Personal</span>
          </Link>

          <a
            href="https://wa.me/51999888777?text=Hola%20Botica%20Nova%20Salud,%20deseo%20consultar%20por%20un%20medicamento."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-white text-black hover:bg-[#ff630f] hover:text-black rounded-full min-h-[44px] px-6 py-2.5 text-sm font-display font-medium tracking-tight transition-all duration-200 hover:scale-[1.04] active:scale-[0.98] shadow-lg"
          >
            <span>Consultar ↗</span>
          </a>
        </div>
      </nav>

      {/* ===================================================================
          OVERLAY DE NAVEGACIÓN EXPANDIBLE (ESTILO MARA VOSS)
          =================================================================== */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-2xl px-[4vw] pt-28 pb-16 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-[#222222] pb-6">
            <span className="text-xs font-mono text-[#ff630f] tracking-widest uppercase">
              // BOTICA NOVA SALUD · NAVEGACIÓN
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-xs font-display font-medium uppercase text-white hover:text-[#ff630f] tracking-widest"
            >
              CERRAR [✕]
            </button>
          </div>

          <div className="flex flex-col space-y-6 my-auto text-center md:text-left">
            <a
              href="#about"
              onClick={() => setMenuOpen(false)}
              className="text-5xl sm:text-7xl md:text-8xl font-display font-medium text-white hover:text-[#ff630f] transition duration-200 hover:translate-x-4 inline-block"
            >
              01 · Nosotros
            </a>
            <a
              href="#featured"
              onClick={() => setMenuOpen(false)}
              className="text-5xl sm:text-7xl md:text-8xl font-display font-medium text-white hover:text-[#ff630f] transition duration-200 hover:translate-x-4 inline-block"
            >
              02 · Laboratorio
            </a>
            <a
              href="#work"
              onClick={() => setMenuOpen(false)}
              className="text-5xl sm:text-7xl md:text-8xl font-display font-medium text-white hover:text-[#ff630f] transition duration-200 hover:translate-x-4 inline-block"
            >
              03 · Catálogo
            </a>
            <a
              href="#services"
              onClick={() => setMenuOpen(false)}
              className="text-5xl sm:text-7xl md:text-8xl font-display font-medium text-white hover:text-[#ff630f] transition duration-200 hover:translate-x-4 inline-block"
            >
              04 · Servicios
            </a>
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="text-5xl sm:text-7xl md:text-8xl font-display font-medium text-white hover:text-[#ff630f] transition duration-200 hover:translate-x-4 inline-block"
            >
              05 · Contacto
            </a>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-[#949494] border-t border-[#222222] pt-6">
            <span>SEDE LIMA · SAN JUAN DE LURIGANCHO</span>
            <span>WHATSAPP DE GUARDIA: +51 999 888 777</span>
          </div>
        </div>
      )}

      {/* ===================================================================
          2. HERO MONUMENTAL: RETRATO EDITORIAL + WEBGL + TIPOGRAFÍA MONUMENTAL
          =================================================================== */}
      <header
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative min-h-[920px] h-screen w-full overflow-hidden flex flex-col justify-between px-[3vw] pt-36 pb-12 select-none"
      >
        {/* RETRATO DE FONDO (COVER EDGE-TO-EDGE) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 ease-out z-0"
          style={{
            backgroundImage: `url(${ASSETS.hero})`,
            filter: 'contrast(1.08) brightness(0.92)'
          }}
        />

        {/* WEBGL SHADER CANVAS (RIPPLE + AURA DORADA/NARANJA) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-[1] transition-opacity duration-500 opacity-0"
        />

        {/* VELO DE GRADIENTE MARA VOSS (50% ARRIBA, TRANSPARENTE AL CENTRO, 50% ABAJO) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/75 pointer-events-none z-[2]" />
        {/* Gradiente izquierdo para asegurar contraste puro detrás de las letras iniciales */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none z-[2]" />

        {/* ETIQUETA VERTICAL LATERAL DERECHA (A PARTIR DE 52% DE ALTURA) */}
        <div className="hidden lg:block absolute right-4 top-[52%] -translate-y-1/2 z-[3] -rotate-90 origin-right text-[10px] font-mono tracking-[0.25em] text-[#949494] uppercase select-none">
          FARMACIA CLÍNICA / RIGOR &amp; CUIDADO — 001
        </div>

        {/* CONTENIDO SUPERIOR: TÍTULO MONUMENTAL NS + NOVASALUD */}
        <div className="relative z-10 space-y-4">
          {/* TÍTULO MONUMENTAL EN UNA SOLA LÍNEA HORIZONTAL */}
          <div className="flex items-baseline justify-between w-full border-b border-white/10 pb-4">
            {/* Monograma Izquierdo: NS */}
            <div className="flex">
              <span className="font-display font-medium text-white tracking-[-0.06em] leading-[0.73] text-[clamp(42px,16cqw,230px)] inline-block animate-in fade-in slide-in-from-bottom-8 duration-700">
                N
              </span>
              <span className="font-display font-medium text-white tracking-[-0.06em] leading-[0.73] text-[clamp(42px,16cqw,230px)] inline-block animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                S
              </span>
            </div>

            {/* Nombre Derecho Unido: NovaSalud [01] */}
            <div className="flex items-baseline">
              <span className="font-display font-medium text-white tracking-[-0.06em] leading-[0.73] text-[clamp(42px,16cqw,230px)] inline-block animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                Nova
              </span>
              <span className="font-display font-light text-white tracking-[-0.06em] leading-[0.73] text-[clamp(42px,16cqw,230px)] inline-block animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                Salud
              </span>
              <sup className="text-xl sm:text-3xl md:text-5xl font-mono text-[#ff630f] ml-2 font-normal">
                [01]
              </sup>
            </div>
          </div>

          {/* SUBTÍTULO CON ALINEACIÓN OPUESTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-[13px] font-mono tracking-widest text-[#b8b8b8] uppercase pt-2 gap-2">
            <div>BOTICA &amp; DISPENSACIÓN ESPECIALIZADA</div>
            <div className="text-[#ff630f]">[ CATÁLOGO // FARMACIA CLÍNICA ]</div>
          </div>

          {/* FLECHA CIRCULAR REBOTANTE (BOUNCING ARROW HACIA #about) */}
          <div className="flex justify-start sm:justify-center md:pl-[65%] pt-3">
            <a
              href="#about"
              className="group w-[52px] h-[52px] rounded-full border border-white/60 bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-[#ff630f] hover:border-[#ff630f] transition-all duration-300 active:scale-95"
              aria-label="Desplazarse al Enfoque Clínico"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white group-hover:text-black group-hover:translate-y-1 transition-transform animate-bounce"
              >
                <path d="M12 4v15M5 12l7 7 7-7" />
              </svg>
            </a>
          </div>
        </div>

        {/* CONTENIDO INFERIOR: NOTAS EDITORIALES Y BOTÓN EXPLORAR */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 pt-12">
          {/* Notas a la izquierda (420px de ancho) */}
          <div className="max-w-[420px] space-y-1.5 text-sm sm:text-base font-display text-white leading-relaxed">
            <p className="text-white">
              • Medicamentos certificados DIGEMID, cadena de frío y atención farmacéutica.
            </p>
            <p className="text-[#949494]">
              • Farmacia clínica independiente. Rigor farmacéutico. Precios justos en Soles.
            </p>
          </div>

          {/* Botón a la derecha: Píldora Blanca de Mara Voss */}
          <div>
            <a
              href="#work"
              className="inline-flex items-center space-x-3 bg-white text-black hover:bg-[#ff630f] hover:text-black rounded-full min-h-[50px] px-8 py-4 text-base sm:text-lg font-display font-medium tracking-tight transition-all duration-250 hover:scale-[1.04] active:scale-[0.98] shadow-2xl"
            >
              <span>Explorar catálogo</span>
              <span className="text-lg">↘</span>
            </a>
          </div>
        </div>
      </header>

      {/* ===================================================================
          3. ENFOQUE CLÍNICO / DESIGN APPROACH (#about)
          =================================================================== */}
      <section
        id="about"
        className="relative py-28 md:py-36 px-[3vw] border-t border-[#222222] bg-[#000000] flex flex-col justify-between"
      >
        <div className="space-y-16 max-w-[1440px] mx-auto w-full">
          {/* Encabezado de Sección */}
          <div className="flex items-center justify-between border-b border-[#222222] pb-4">
            <span className="text-xs font-mono tracking-widest text-[#ff630f] uppercase">
              // ENFOQUE FARMACÉUTICO
            </span>
            <span className="text-xs font-mono text-[#949494]">
              COMPROMISO ÉTICO CON TU SALUD
            </span>
          </div>

          {/* Gran Declaración Tipográfica en 5 Líneas (Mara Voss Exact Format) */}
          <div
            className="relative cursor-default"
            onMouseEnter={() => setHoveredStatement(true)}
            onMouseLeave={() => setHoveredStatement(false)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setStatementPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
          >
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-[76px] font-display font-medium tracking-[-0.04em] leading-[0.98] text-white">
              Arraigados en la ciencia, guiados por el cuidado humano,{' '}
              <span className="text-[#ff630f]">
                Nova Salud transforma la dispensación en una experiencia
              </span>{' '}
              que brinda tranquilidad a través del rigor farmacéutico y un
              acompañamiento clínico permanente.
            </h2>

            {/* Ilustración Vectorial flotante que sigue al cursor con blend mode difference */}
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

          {/* Metadatos y Píldoras de Disciplinas (Separación de 80px) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-12 border-t border-[#222222] items-end">
            <div className="md:col-span-7 space-y-2">
              <p className="text-sm sm:text-lg font-display text-[#b8b8b8] leading-relaxed max-w-xl">
                Garantizamos la autenticidad y conservación óptima de cada fármaco mediante trazabilidad estricta, control de temperatura y atención profesional colegiada.
              </p>
            </div>

            <div className="md:col-span-5 space-y-3 md:text-right">
              <span className="text-[11px] font-mono tracking-widest text-[#949494] uppercase block">
                ESPECIALIDADES
              </span>
              <div className="flex flex-wrap md:justify-end gap-2">
                <span className="px-4 py-2 rounded-full border border-[#777777] text-xs font-display text-[#b8b8b8]">
                  Farmacia Clínica
                </span>
                <span className="px-4 py-2 rounded-full border border-[#777777] text-xs font-display text-[#b8b8b8]">
                  Cadena de Frío
                </span>
                <span className="px-4 py-2 rounded-full border border-[#777777] text-xs font-display text-[#b8b8b8]">
                  Dispensación DIGEMID
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          4. PROYECTO DESTACADO / FEATURED PROJECT (#featured)
          =================================================================== */}
      <section
        id="featured"
        className="py-28 md:py-36 px-[3vw] border-t border-[#222222] bg-[#000000] relative overflow-hidden"
        style={{ perspective: '850px' }}
      >
        <div className="max-w-[1440px] mx-auto space-y-14">
          {/* Encabezado */}
          <div className="flex items-center justify-between border-b border-[#222222] pb-4">
            <span className="text-xs font-mono tracking-widest text-[#ff630f] uppercase">
              // ÁREA DESTACADA
            </span>
            <span className="text-xs font-mono text-[#949494] uppercase">
              INFRAESTRUCTURA ASÉPTICA // 2026
            </span>
          </div>

          {/* Gran Título de 2 Líneas */}
          <div className="text-center space-y-1">
            <h2 className="text-5xl sm:text-7xl lg:text-[140px] font-display font-medium tracking-[-0.04em] leading-[0.84] text-white">
              LABORATORIO <sup className="text-2xl sm:text-4xl text-[#ff630f] font-mono font-normal">[01]</sup>
            </h2>
            <div className="text-5xl sm:text-7xl lg:text-[140px] font-display font-light tracking-[-0.04em] leading-[0.84] text-[#b8b8b8]">
              BOTÁNICO &amp; CLÍNICO
            </div>
          </div>

          {/* TARJETA 3D INTERACTIVA CON TILT Y PERSPECTIVA */}
          <div className="flex justify-center py-6 relative">
            <div
              onMouseMove={handleFeaturedCardMove}
              onMouseEnter={() => setIsOverFeaturedCard(true)}
              onMouseLeave={handleFeaturedCardLeave}
              onClick={() => openModal(PROJECTS[0])}
              className="relative w-[347px] h-[347px] sm:w-[420px] sm:h-[420px] rounded-2xl overflow-hidden border border-[#333333] bg-[#111111] cursor-pointer shadow-2xl transition-transform duration-100 ease-out"
              style={{
                transform: `rotateX(${featuredTilt.rx}deg) rotateY(${featuredTilt.ry}deg) scale(1.025)`
              }}
            >
              {/* Imagen del Laboratorio generado */}
              <img
                src={ASSETS.featured}
                alt="Laboratorio Botánico Botica Nova Salud"
                className="w-full h-full object-cover filter contrast-110 brightness-95 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

              {/* Icono central de flecha */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black/60 border border-white/40 flex items-center justify-center text-white backdrop-blur-md">
                  <ArrowUpRight className="w-5 h-5 text-[#ff630f]" />
                </div>
              </div>

              {/* Badge inferior */}
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <span className="text-[10px] font-mono text-[#ff630f] tracking-widest uppercase block">
                  ÁREA ASÉPTICA
                </span>
                <span className="text-sm font-display font-medium text-white">
                  Buenas Prácticas de Almacenamiento (BPA)
                </span>
              </div>
            </div>
          </div>

          {/* Banda de Cuadrícula con texto de manifiesto */}
          <div className="py-6 border-y border-[#222222] flex items-center justify-between text-xs font-mono text-[#949494] tracking-widest uppercase">
            <span>01 / RIGOR CIENTÍFICO AL SERVICIO DE TU SALUD.</span>
            <span className="hidden sm:inline">TRAZABILIDAD DE LOTE &amp; FECHA DE CADUCIDAD</span>
          </div>

          {/* Texto descriptivo y botón de ver caso de estudio */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-display font-medium text-white">
                Laboratorio Botánico &amp; Control Farmacológico
              </h3>
              <p className="text-xs sm:text-sm text-[#949494] font-mono">
                Preservación de principios activos / Farmacovigilancia DIGEMID
              </p>
            </div>

            <button
              onClick={() => openModal(PROJECTS[0])}
              className="bg-white text-black hover:bg-[#ff630f] hover:text-black rounded-full min-h-[50px] px-8 py-3 text-sm font-display font-medium tracking-tight transition-all duration-200 hover:scale-[1.04] active:scale-[0.98]"
            >
              <span>Ver especialidad ↗</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================================
          5. CATÁLOGO SELECCIONADO / SELECTED WORK (#work)
          =================================================================== */}
      <section
        id="work"
        className="py-28 md:py-36 px-[4vw] border-t border-[#222222] relative"
        style={{
          background: 'linear-gradient(180deg, #000000 0%, #000000 48%, #ea4f16 78%, #f6af60 100%)'
        }}
      >
        <div className="max-w-[1440px] mx-auto space-y-12">
          {/* Encabezado */}
          <div className="flex items-center justify-between border-b border-[#222222] pb-4">
            <span className="text-xs font-mono tracking-widest text-[#ffffff] uppercase">
              // CATÁLOGO SELECCIONADO
            </span>
            <span className="text-xs font-mono text-[#ffffff]/80 uppercase">
              SEIS LÍNEAS PRINCIPALES / 2024–2026
            </span>
          </div>

          {/* Tabla de 6 Filas (Estilo Mara Voss Project Index) */}
          <div className="space-y-2">
            {PROJECTS.map((project) => {
              const ArtComponent = artMap[project.coverKey] || ArtGridline;
              return (
                <div
                  key={project.id}
                  onClick={() => openModal(project)}
                  className="group relative cursor-pointer rounded-xl bg-black/75 hover:bg-white transition-colors duration-300 p-5 sm:p-6 border border-white/10 flex items-center justify-between text-white hover:text-black"
                >
                  <div className="flex items-center space-x-6 sm:space-x-12 w-full md:w-auto">
                    <span className="text-xs font-mono text-[#ff630f] group-hover:text-black font-bold">
                      {project.id}
                    </span>
                    <div>
                      <h4 className="text-lg sm:text-2xl font-display font-medium tracking-tight">
                        {project.title}
                      </h4>
                      <p className="text-xs font-mono text-[#949494] group-hover:text-black/70 sm:hidden">
                        {project.discipline}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center space-x-8 text-xs font-mono">
                    <span className="text-[#b8b8b8] group-hover:text-black">
                      {project.discipline}
                    </span>
                    <span className="text-[#ff630f] group-hover:text-black font-bold">
                      S/ {project.precio.toFixed(2)}
                    </span>
                    <span className="text-sm font-display font-medium">↗</span>
                  </div>

                  {/* Previsualización flotante al hover */}
                  <div className="pointer-events-none absolute right-[18%] top-1/2 -translate-y-1/2 w-44 h-44 rounded-xl overflow-hidden shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 hidden lg:block z-20 border border-black/20">
                    <ArtComponent />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Llamado a la acción sobre el fondo degradado cálido */}
          <div className="pt-16 pb-8 text-center space-y-6">
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-display font-medium tracking-tight text-black">
              ¿TIENES UNA RECETA MÉDICA O CONSULTA?
            </h3>
            <div>
              <a
                href="https://wa.me/51999888777?text=Hola%20Botica%20Nova%20Salud,%20adjunto%20mi%20receta%20para%20cotizaci%C3%B3n."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 bg-black text-white hover:bg-white hover:text-black rounded-full min-h-[50px] px-8 py-4 text-base font-display font-medium tracking-tight transition-all duration-200 hover:scale-[1.04] active:scale-[0.98] shadow-2xl"
              >
                <span>Enviar Receta por WhatsApp ↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          6. CAPACIDADES / DISCLOSURES (#services)
          =================================================================== */}
      <section
        id="services"
        className="py-28 md:py-36 px-[3vw] border-t border-[#222222] bg-[#000000]"
      >
        <div className="max-w-[1440px] mx-auto space-y-16">
          {/* Título en 2 líneas: Primer renglón blanco, segundo naranja */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#222222] pb-8">
            <div>
              <h2 className="text-4xl sm:text-6xl md:text-[80px] font-display font-medium tracking-[-0.045em] leading-[0.95] text-white">
                RIGOR FARMACÉUTICO.
              </h2>
              <h2 className="text-4xl sm:text-6xl md:text-[80px] font-display font-medium tracking-[-0.045em] leading-[0.95] text-[#ff630f]">
                SALUD GARANTIZADA.
              </h2>
            </div>
            <span className="text-xs font-mono tracking-widest text-[#949494] uppercase pt-3">
              // SERVICIOS CLÍNICOS
            </span>
          </div>

          {/* 3 Filas de Despliegue con Botón Naranja */}
          <div className="divide-y divide-[#222222]">
            {SERVICES.map((srv) => {
              const isExpanded = !!expandedServices[srv.id];
              return (
                <div key={srv.id} className="py-8 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-baseline space-x-6">
                      <span className="text-xs font-mono text-[#ff630f] font-bold">
                        {srv.id}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-display font-medium text-white">
                        {srv.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between md:space-x-8">
                      <span className="text-xs sm:text-sm font-mono text-[#949494] max-w-md hidden sm:block">
                        {srv.scope}
                      </span>

                      <button
                        onClick={() => toggleService(srv.id)}
                        className="px-5 py-2 rounded-full bg-[#ff630f] text-black font-display font-medium text-xs tracking-wider uppercase transition hover:scale-105 active:scale-95"
                      >
                        {isExpanded ? 'Cerrar −' : 'Explorar +'}
                      </button>
                    </div>
                  </div>

                  {/* Panel expandible */}
                  {isExpanded && (
                    <div className="pt-4 pl-12 text-sm sm:text-base font-display text-[#b8b8b8] space-y-2 animate-in fade-in duration-200">
                      <p className="leading-relaxed">{srv.text}</p>
                      <p className="text-xs font-mono text-[#ff630f]">
                        <span className="font-bold text-white uppercase">Prestaciones: </span>
                        {srv.deliverables}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row justify-between text-xs font-mono text-[#949494] pt-8 border-t border-[#222222]">
            <span>Desde un medicamento esencial hasta tratamientos de alta complejidad.</span>
            <span>Atención Farmacéutica / Práctica Ética Colegiada</span>
          </div>
        </div>
      </section>

      {/* ===================================================================
          7. CONTACTO & FOOTER (#contact)
          =================================================================== */}
      <section
        id="contact"
        className="py-28 md:py-36 px-[3vw] border-t border-[#222222] bg-[#000000]"
      >
        <div className="max-w-[1440px] mx-auto space-y-16">
          <div className="border-b border-[#222222] pb-4">
            <span className="text-xs font-mono tracking-widest text-[#ff630f] uppercase">
              // CONTACTO &amp; ATENCIÓN
            </span>
          </div>

          {/* Gran Título de Contacto: Segunda Línea Naranja */}
          <div>
            <h2 className="text-4xl sm:text-6xl md:text-[96px] font-display font-medium tracking-[-0.04em] leading-[0.9] text-white">
              HAGAMOS QUE LA
            </h2>
            <h2 className="text-4xl sm:text-6xl md:text-[96px] font-display font-medium tracking-[-0.04em] leading-[0.9] text-[#ff630f]">
              SALUD IMPORTE.
            </h2>
          </div>

          {/* Dos Columnas de Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pt-6">
            <div className="md:col-span-6 space-y-4">
              <p className="text-lg sm:text-xl font-display text-[#b8b8b8] leading-relaxed max-w-md">
                ¿Necesitas consultar stock, cotizar una receta médica o recibir orientación farmacéutica? Escríbenos directamente a nuestro canal de guardia.
              </p>
              <div className="text-xs font-mono text-[#949494] space-y-1">
                <p>📍 {PERSONA.location}</p>
                <p>⏰ Lunes a Domingo: 07:00 a 23:00 hrs · Turno de Guardia</p>
                <p>🛡️ {PERSONA.regente}</p>
              </div>
            </div>

            <div className="md:col-span-6 space-y-4 flex flex-col justify-end">
              <div className="p-6 rounded-2xl border border-[#222222] bg-[#0d0d0d] space-y-3">
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
                <div className="text-2xl sm:text-3xl font-display font-medium text-white">
                  {PERSONA.phone}
                </div>
                <a
                  href={`https://wa.me/51999888777?text=Hola%20Botica%20Nova%20Salud,%20deseo%20hacer%20una%20consulta.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 bg-[#ff630f] text-black font-display font-medium rounded-full text-sm hover:scale-[1.02] transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chatear por WhatsApp Ahora</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Final */}
          <div className="pt-16 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#949494] gap-4">
            <div>© {new Date().getFullYear()} Botica Nova Salud — Todos los derechos reservados.</div>
            <a
              href="#top"
              className="text-white hover:text-[#ff630f] transition flex items-center space-x-1"
            >
              <span>Volver arriba</span>
              <span>↑</span>
            </a>
          </div>
        </div>
      </section>

      {/* ===================================================================
          MODAL NATIVO <dialog> PARA FICHA TÉCNICA DEL MEDICAMENTO / PROYECTO
          =================================================================== */}
      <dialog
        ref={dialogRef}
        onCancel={closeModal}
        className="backdrop:bg-black/85 bg-[#101010] text-[#f2f0e9] border border-[#444444] rounded-2xl w-[min(1040px,calc(100vw-32px))] max-h-[calc(100svh-32px)] p-0 shadow-2xl overflow-y-auto m-auto"
      >
        {activeProject && (
          <div className="p-6 sm:p-10 space-y-8 relative">
            {/* Barra superior de cierre */}
            <div className="flex items-center justify-between border-b border-[#333333] pb-4 sticky top-0 bg-[#101010] z-10">
              <span className="text-xs font-mono text-[#ff630f] tracking-widest uppercase">
                {activeProject.projectType} // {activeProject.year}
              </span>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-white/10 text-white transition text-xs font-mono uppercase"
                aria-label="Cerrar modal"
              >
                Cerrar [✕]
              </button>
            </div>

            {/* Título de la Ficha */}
            <div className="space-y-2">
              <h3 className="text-3xl sm:text-5xl font-display font-medium text-white tracking-tight">
                {activeProject.title}
              </h3>
              <p className="text-lg text-[#b8b8b8] font-display leading-relaxed">
                {activeProject.summary}
              </p>
            </div>

            {/* Previsualización del Arte Vectorial */}
            <div className="w-full max-h-[460px] rounded-xl overflow-hidden bg-black flex items-center justify-center p-4 border border-[#222222]">
              {React.createElement(artMap[activeProject.coverKey] || ArtGridline)}
            </div>

            {/* Metadatos en 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm font-display border-t border-[#333333] pt-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-mono text-[#949494] uppercase block">
                    Laboratorio Fabricante
                  </span>
                  <span className="text-base text-white">{activeProject.laboratorio || 'DIGEMID Titular'}</span>
                </div>
                <div>
                  <span className="text-xs font-mono text-[#949494] uppercase block">
                    Precio Oficial en Soles
                  </span>
                  <span className="text-2xl font-display font-medium text-[#ff630f]">
                    S/ {activeProject.precio.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-mono text-[#949494] uppercase block">
                    Condición Sanitaria de Venta
                  </span>
                  <span className="text-base text-white">
                    {activeProject.requiereReceta ? 'Requiere Receta Médica Obligatoria' : 'Venta Libre con Asesoría'}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-mono text-[#949494] uppercase block">
                    Stock Disponible en Sede Lima
                  </span>
                  <span className="text-base text-emerald-400 font-mono">
                    {activeProject.stock} unidades en almacén
                  </span>
                </div>
              </div>
            </div>

            {/* Prestaciones y Entregables */}
            <div className="space-y-3 border-t border-[#333333] pt-6">
              <span className="text-xs font-mono text-[#ff630f] uppercase tracking-wider block">
                Componentes de la Dispensación
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

            {/* Botón de Pedido por WhatsApp */}
            <div className="pt-4 border-t border-[#333333] flex justify-end">
              <a
                href={`https://wa.me/51999888777?text=Hola%20Botica%20Nova%20Salud,%20deseo%20adquirir%20el%20medicamento:%20${encodeURIComponent(activeProject.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 rounded-full bg-[#ff630f] text-black font-display font-medium text-sm hover:scale-105 transition shadow-xl"
              >
                Pedir este medicamento por WhatsApp ↗
              </a>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
