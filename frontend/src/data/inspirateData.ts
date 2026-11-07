export interface Product {
  id: string;
  title: string;
  name: string;
  category: 'medicamentos' | 'cardiovascular' | 'dermocosmetica' | 'pediatria';
  subtitle: string;
  description: string;
  metal: string;
  stone: string;
  priceUSD: number;
  priceEUR: number;
  priceFormatted: string;
  image: string;
  hoverImage?: string;
  isHit?: boolean;
}

export interface Review {
  id: string;
  author: string;
  name: string;
  itemType: string;
  piece: string;
  text: string;
  image: string;
}

export interface Article {
  id: string;
  tag: string;
  date: string;
  title: string;
  summary: string;
  content: string[];
  image: string;
}

export const SITE_IMAGES = {
  logo: 'https://static.tildacdn.com/tild6538-3361-4531-b536-626231353562/logo_1.svg',
  logoDark: 'https://static.tildacdn.com/tild6634-6535-4031-b263-386361366434/logo_1.svg',
  logoLarge: 'https://static.tildacdn.com/tild6539-3061-4638-a634-663637336666/logo_1.svg',
  star1: 'https://static.tildacdn.com/tild3735-6632-4564-b166-643361623938/Star_1.svg',
  star2: 'https://static.tildacdn.com/tild6439-3131-4466-b332-356462396336/Star_2.svg',

  heroSlides: [
    '/media/home/hero-slide-1.jpg',
    '/media/home/hero-slide-2.jpg',
    '/media/home/hero-slide-3.jpg',
  ],

  heroCardRing: '/media/home/hero-card-destacado.jpg',
  categoriesBg: '/media/home/cat-bg-medicamentos.jpg',

  categories: {
    anillos: '/media/home/cat-bg-medicamentos.jpg',
    pendientes: '/media/home/cat-bg-cardiovascular.jpg',
    collares: '/media/home/cat-bg-dermocosmetica.jpg',
    pulseras: '/media/home/cat-bg-pediatria.jpg',
    todo: '/media/home/cat-bg-medicamentos.jpg',
  },

  hits: {
    studs: '/media/home/about-farmaceutica-historia.jpg',
    earrings: '/media/home/srv-topico-signos.jpg',
    ring1: '/media/products/panadol-antigripal-nf.jpg',
    ring2: '/media/products/apronax-1.png',
    ring3: '/media/products/fotoprotector-isdin-fusion-water-magic-spf50.jpg',
  },

  builderModel: '/media/home/srv-topico-signos.jpg',
  natureRing: '/media/home/banner-bienestar-natural.jpg',
  brandModel: '/media/home/about-farmaceutica-historia.jpg',

  reviews: [
    '/media/home/avatar-paciente-1.jpg',
    '/media/home/avatar-paciente-2.jpg',
    '/media/home/avatar-paciente-3.jpg',
    '/media/home/avatar-paciente-4.jpg',
    '/media/home/avatar-paciente-1.jpg',
  ],

  articles: [
    '/media/home/blog-articulo-1.jpg',
    '/media/home/blog-articulo-2.jpg',
    '/media/home/blog-articulo-3.jpg',
  ],

  consultationBg: '/media/home/about-botica-fachada.jpg',

  instagram: [
    '/media/home/cat-bg-medicamentos.jpg',
    '/media/home/cat-bg-cardiovascular.jpg',
    '/media/home/cat-bg-dermocosmetica.jpg',
    '/media/home/cat-bg-pediatria.jpg',
  ],
};

export const ASSETS = {
  logoSvg: SITE_IMAGES.logo,
  logoDarkSvg: SITE_IMAGES.logoDark,
  footerLogoSvg: SITE_IMAGES.logoLarge,
  starWhite: SITE_IMAGES.star1,
  starDark: SITE_IMAGES.star2,
  heroSlides: SITE_IMAGES.heroSlides,
  heroCardRing: SITE_IMAGES.heroCardRing,
  readyLineBg: SITE_IMAGES.categoriesBg,
  hitModelLeft: SITE_IMAGES.hits.studs,
  hitModelRight: SITE_IMAGES.hits.earrings,
  hitWhite1: SITE_IMAGES.hits.ring1,
  hitWhite2: SITE_IMAGES.hits.ring2,
  hitWhite3: SITE_IMAGES.hits.ring3,
  builderBg: SITE_IMAGES.builderModel,
  natureImg: SITE_IMAGES.natureRing,
  brandBg: SITE_IMAGES.brandModel,
  consultBg: SITE_IMAGES.consultationBg,
  footerGrid: SITE_IMAGES.instagram,
};

export const CATEGORIES = [
  {
    id: 'medicamentos',
    name: 'FARMACIA ÉTICA',
    image: SITE_IMAGES.categories.anillos,
  },
  {
    id: 'cardiovascular',
    name: 'CARDIO & CRÓNICOS',
    image: SITE_IMAGES.categories.pendientes,
  },
  {
    id: 'dermocosmetica',
    name: 'DERMOCOSMÉTICA',
    image: SITE_IMAGES.categories.collares,
  },
  {
    id: 'pediatria',
    name: 'CUIDADO PEDIÁTRICO',
    image: SITE_IMAGES.categories.pulseras,
  },
];

export const PRODUCTS_CATALOG: Product[] = [
  {
    id: 'panadol-antigripal-nf',
    title: 'Panadol Antigripal NF Sobre x 2 tabletas',
    name: 'PANADOL ANTIGRIPAL NF',
    category: 'medicamentos',
    subtitle: 'Paracetamol 500mg, Fenilefrina 5mg, Clorfenamina 2mg',
    description:
      'Alivio rápido y eficaz de congestión nasal, dolor de cabeza, malestar de cuerpo y fiebre sin irritar el estómago.',
    metal: 'Laboratorio Haleon Perú',
    stone: 'Sobre x 2 tabletas recubiertas (Caja x 52 sobres)',
    priceUSD: 2.40,
    priceEUR: 2.40,
    priceFormatted: 'S/ 2.40',
    image: '/media/products/panadol-antigripal-nf.jpg',
    hoverImage: '/media/products/panadol-antigripal-nf.jpg',
    isHit: true,
  },
  {
    id: 'apronax-550mg',
    title: 'Apronax 550 mg Naproxeno Sódico',
    name: 'APRONAX 550 MG',
    category: 'medicamentos',
    subtitle: 'Naproxeno Sódico 550 mg analgésico antiinflamatorio',
    description:
      'Alivio prolongado de dolores musculares, articulares, dentales y contracturas agudas con hasta 12 horas de acción continua.',
    metal: 'Laboratorio Bayer / DIGEMID',
    stone: 'Blíster x 4 tabletas recubiertas',
    priceUSD: 7.20,
    priceEUR: 7.20,
    priceFormatted: 'S/ 7.20',
    image: '/media/products/apronax-1.png',
    hoverImage: '/media/products/apronax-1.png',
    isHit: true,
  },
  {
    id: 'fotoprotector-isdin-fusion-water-magic-spf50',
    title: 'Fotoprotector ISDIN Fusion Water Magic SPF 50',
    name: 'ISDIN FUSION WATER MAGIC',
    category: 'dermocosmetica',
    subtitle: 'Ácido Hialurónico + Protección UVA/UVB ultraligera',
    description:
      'Fotoprotector facial diario de fase acuosa de absorción inmediata, acabado mate no graso y tecnología Safe-Eye Tech.',
    metal: 'ISDIN España / Registro Sanitario',
    stone: 'Frasco dosificador x 50 ml',
    priceUSD: 104.90,
    priceEUR: 104.90,
    priceFormatted: 'S/ 104.90',
    image: '/media/products/fotoprotector-isdin-fusion-water-magic-spf50.jpg',
    hoverImage: '/media/products/fotoprotector-isdin-fusion-water-magic-spf50.jpg',
    isHit: true,
  },
  {
    id: 'nan-1-optipro-hmo-formula-lactea-infantil-de-inicio-en-polvo',
    title: 'NAN 1 Optipro HMO Fórmula Infantil 800 g',
    name: 'NAN 1 OPTIPRO HMO 800G',
    category: 'pediatria',
    subtitle: 'Oligosacárido 2-FL HMO + Proteína Optipro',
    description:
      'Fórmula infantil de inicio para lactantes desde el nacimiento con probióticos B. lactis, DHA y nutrientes esenciales.',
    metal: 'Nestlé Suiza / Grado Pediátrico',
    stone: 'Lata metálica hermética x 800 g',
    priceUSD: 84.90,
    priceEUR: 84.90,
    priceFormatted: 'S/ 84.90',
    image: '/media/products/nan-1-optipro-hmo-formula-lactea-infantil-de-inicio-en-polvo.jpg',
    hoverImage: '/media/products/nan-1-optipro-hmo-formula-lactea-infantil-de-inicio-en-polvo.jpg',
    isHit: true,
  },
  {
    id: 'glucometro-accu-chek-guide-kit-con-bluetooth',
    title: 'Glucómetro Digital Accu-Chek Guide Kit',
    name: 'GLUCÓMETRO ACCU-CHEK GUIDE',
    category: 'cardiovascular',
    subtitle: 'Lectura en 4 seg + Conectividad Bluetooth',
    description:
      'Sistema de monitoreo de glucemia con puerto iluminado, frasco antiquiebre y sincronización móvil con la app mySugr.',
    metal: 'Roche Diabetes Care / Certificación ISO',
    stone: 'Kit completo: Monitor + Punzador + Estuche',
    priceUSD: 155.50,
    priceEUR: 155.50,
    priceFormatted: 'S/ 155.50',
    image: '/media/products/glucometro-accu-chek-guide-kit-con-bluetooth.jpg',
    hoverImage: '/media/products/glucometro-accu-chek-guide-kit-con-bluetooth.jpg',
    isHit: true,
  },
  {
    id: 'bepanthen-baby-crema-protectora',
    title: 'Bepanthen Baby Pomada Protectora 100 g',
    name: 'BEPANTHEN BABY 100G',
    category: 'pediatria',
    subtitle: 'Dexpantenol (Pro-Vitamina B5) regenerador dérmico',
    description:
      'Forma una barrera transparente y transpirable que previene y repara rozaduras y escaldaduras en la piel del bebé.',
    metal: 'Bayer Consumer Health',
    stone: 'Tubo colapsible x 100 g',
    priceUSD: 38.50,
    priceEUR: 38.50,
    priceFormatted: 'S/ 38.50',
    image: '/media/products/bepanthen-baby-crema-protectora.jpg',
    hoverImage: '/media/products/bepanthen-baby-crema-protectora.jpg',
    isHit: true,
  },
  {
    id: 'tensiometro-digital-de-brazo-omron-m3-hem-7154e',
    title: 'Tensiómetro Digital de Brazo Omron M3 Comfort',
    name: 'TENSIÓMETRO OMRON M3',
    category: 'cardiovascular',
    subtitle: 'Manguito 360° Intelli Wrap (22-42 cm)',
    description:
      'Monitor de presión arterial de precisión clínica europea con detección de arritmias y memoria para 2 usuarios.',
    metal: 'Omron Healthcare Japón',
    stone: 'Monitor digital con manguito y estuche rígido',
    priceUSD: 506.00,
    priceEUR: 506.00,
    priceFormatted: 'S/ 506.00',
    image: '/media/products/tensiometro-digital-de-brazo-omron-m3-hem-7154e.jpg',
    hoverImage: '/media/products/tensiometro-digital-de-brazo-omron-m3-hem-7154e.jpg',
    isHit: true,
  },
  {
    id: 'neurobion-5000-jeringa',
    title: 'Neurobión 5000 Inyectable Doble Cámara',
    name: 'NEUROBIÓN 5000 INYECTABLE',
    category: 'medicamentos',
    subtitle: 'Vitaminas B1 + B6 + B12 Neurotrópicas',
    description:
      'Antineurítico y reconstituyente neurotrópico de alta concentración para lumbalgias, ciática y fatiga muscular intensa.',
    metal: 'Procter & Gamble / Merck',
    stone: 'Jeringa prellenada bicámara 3 ml',
    priceUSD: 24.50,
    priceEUR: 24.50,
    priceFormatted: 'S/ 24.50',
    image: '/media/products/neurobion-5000-inyectable-x3.jpg',
    hoverImage: '/media/products/neurobion-5000-inyectable-x3.jpg',
    isHit: true,
  },
];

export const PRODUCTS = PRODUCTS_CATALOG;

export const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'ROSA MENDOZA',
    name: 'ROSA MENDOZA',
    itemType: 'CUIDADO PEDIÁTRICO & ATENCIÓN',
    piece: 'FÓRMULAS & PEDIATRÍA',
    text: '«Excelente atención de la químico farmacéutica. Me orientó con claridad sobre la dosis correcta para la fiebre de mi pequeño y el delivery llegó súper rápido y sellado. Totalmente confiable».',
    image: SITE_IMAGES.reviews[0],
  },
  {
    id: 'rev-2',
    author: 'CARLOS VALDIVIA',
    name: 'CARLOS VALDIVIA',
    itemType: 'SALUD CARDIOVASCULAR',
    piece: 'CONTROL DE PRESIÓN & GLUCEMIA',
    text: '«Compro mis medicamentos mensuales para la hipertensión y el tensiómetro digital aquí. Precios justos, productos 100% originales de laboratorio y una atención con paciencia y respeto».',
    image: SITE_IMAGES.reviews[1],
  },
  {
    id: 'rev-3',
    author: 'VALERIA QUIROZ',
    name: 'VALERIA QUIROZ',
    itemType: 'TRATAMIENTO DERMOCOSMÉTICO',
    piece: 'FOTOPROTECCIÓN & SKINCARE',
    text: '«Encontré mi protector solar ISDIN y limpiadores faciales originales con fecha de vencimiento amplia. La asesoría dérmica que brindan te da seguridad de no gastar por gusto».',
    image: SITE_IMAGES.reviews[2],
  },
  {
    id: 'rev-4',
    author: 'JORGE ALARCÓN',
    name: 'JORGE ALARCÓN',
    itemType: 'BOTIQUÍN FAMILIAR',
    piece: 'TÓPICO & PRIMEROS AUXILIOS',
    text: '«El servicio de tópico para la toma de signos vitales e inyectables es impecable, muy higiénico y con profesionales colegiados. Nova Salud se convirtió en nuestra botica de cabecera».',
    image: SITE_IMAGES.reviews[3],
  },
  {
    id: 'rev-5',
    author: 'ELENA GUTIÉRREZ',
    name: 'ELENA GUTIÉRREZ',
    itemType: 'DISPENSACIÓN ÉTICA',
    piece: 'FARMACIA CON CERTIFICACIÓN',
    text: '«Siempre tienen stock de los medicamentos que me recetan y la opción de pedir por WhatsApp ahorra muchísimo tiempo. Muy agradecida por la calidez y el profesionalismo».',
    image: SITE_IMAGES.reviews[4],
  },
];

export const ARTICLES: Article[] = [
  {
    id: 'art-1',
    tag: 'GUÍA CLÍNICA',
    date: 'OCTUBRE 2026',
    title: 'Uso Responsable de Medicamentos y Peligros de la Automedicación',
    summary:
      'Criterios esenciales de dosificación, cumplimiento de horarios terapéuticos y por qué los antibióticos requieren receta médica.',
    content: [
      'El uso racional de medicamentos es fundamental para garantizar su eficacia y proteger la salud de toda la familia.',
      '1. Respeta siempre los horarios y la duración del tratamiento prescrito por tu médico, especialmente en antibióticos para prevenir resistencia bacteriana.',
      '2. Verifica siempre la fecha de vencimiento y el registro sanitario DIGEMID en el empaque.',
      '3. Consulta a tu Químico Farmacéutico de confianza ante cualquier duda sobre interacciones con otros fármacos o alimentos.',
    ],
    image: SITE_IMAGES.articles[0],
  },
  {
    id: 'art-2',
    tag: 'DERMATOLOGÍA',
    date: 'OCTUBRE 2026',
    title: 'Fotoprotección 365 días: Cómo Proteger tu Piel Todo el Año',
    summary:
      'La radiación ultravioleta atraviesa nubes y ventanas. Claves para elegir el protector solar adecuado según tu tipo de piel.',
    content: [
      'Proteger la piel de los rayos UVA y UVB previene quemaduras, manchas solares y el envejecimiento cutáneo prematuro.',
      '1. Aplica protector solar 20 minutos antes de exponerte al sol y reaplica cada 2 a 3 horas si estás al aire libre.',
      '2. Si tienes piel mixta o grasa, prefiere texturas fluidas acuosas toque seco como ISDIN Fusion Water o Eucerin Oil Control.',
      '3. No olvides proteger zonas sensibles como el cuello, las orejas y el dorso de las manos.',
    ],
    image: SITE_IMAGES.articles[1],
  },
  {
    id: 'art-3',
    tag: 'PREVENCIÓN',
    date: 'OCTUBRE 2026',
    title: 'Monitoreo Preventivo de Presión Arterial y Glucosa en Casa',
    summary:
      'Técnicas correctas para medir tus signos vitales y mantener un registro confiable para tus controles médicos periódicos.',
    content: [
      'El monitoreo regular de signos vitales en pacientes crónicos permite detectar variaciones a tiempo y ajustar tratamientos.',
      '1. Reposa 5 minutos antes de tomarte la presión arterial y mantén el brazo a la altura del corazón.',
      '2. Realiza mediciones de glucosa capilar en ayunas o 2 horas después de las comidas según la indicación de tu médico.',
      '3. Lleva un cuaderno de registro con fecha y hora para presentarlo a tu especialista en cada consulta.',
    ],
    image: SITE_IMAGES.articles[2],
  },
];
