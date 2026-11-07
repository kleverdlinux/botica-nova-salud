export type DiamondShape = 'round' | 'cushion' | 'princess' | 'oval' | 'emerald' | 'pear';
export type MetalType = 'white_gold' | 'yellow_gold' | 'rose_gold' | 'platinum';
export type ColorGrade = 'D' | 'E' | 'F' | 'G' | 'H' | 'fancy_yellow' | 'fancy_pink';
export type ClarityGrade = 'FL_IF' | 'VVS1' | 'VS1' | 'SI1';

export interface EarringConfig {
  shape: DiamondShape;
  caratsPerEar: number; // e.g. 0.5, 0.75, 1.0, 1.5, 2.0, 3.0
  color: ColorGrade;
  clarity: ClarityGrade;
  metal: MetalType;
}

export interface EarringCalculationResult {
  totalCarats: number;
  basePriceUSD: number;
  finalPriceUSD: number;
  finalPriceEUR: number;
  formattedUSD: string;
  formattedEUR: string;
  leadTimeWeeks: number;
  specsSummary: string;
}

const SHAPE_PREMIUMS: Record<DiamondShape, number> = {
  round: 1.15, // standard round brilliant has highest demand
  cushion: 1.0,
  princess: 1.02,
  oval: 1.08,
  emerald: 1.05,
  pear: 1.04,
};

const COLOR_MULTIPLIERS: Record<ColorGrade, number> = {
  D: 1.35,
  E: 1.25,
  F: 1.18,
  G: 1.08,
  H: 1.0,
  fancy_yellow: 1.45,
  fancy_pink: 2.1,
};

const CLARITY_MULTIPLIERS: Record<ClarityGrade, number> = {
  FL_IF: 1.4,
  VVS1: 1.25,
  VS1: 1.1,
  SI1: 1.0,
};

const METAL_COSTS: Record<MetalType, number> = {
  white_gold: 550,
  yellow_gold: 550,
  rose_gold: 580,
  platinum: 850,
};

const SHAPE_NAMES_ES: Record<DiamondShape, string> = {
  round: 'Brillante redondo',
  cushion: 'Cojín (Cushion)',
  princess: 'Princesa',
  oval: 'Oval',
  emerald: 'Esmeralda',
  pear: 'Pera (Gota)',
};

const METAL_NAMES_ES: Record<MetalType, string> = {
  white_gold: 'Oro Blanco 18K (750°)',
  yellow_gold: 'Oro Amarillo 18K (750°)',
  rose_gold: 'Oro Rosa 18K (750°)',
  platinum: 'Platino 950°',
};

export function calculateEarringPrice(config: EarringConfig): EarringCalculationResult {
  const totalCarats = Number((config.caratsPerEar * 2).toFixed(2));
  
  // Base cost per carat scales non-linearly with carat weight (Rappaport principle)
  // 0.5ct ~ $2,200/ct base; 1.0ct ~ $4,500/ct; 2.0ct ~ $8,500/ct; 3.0ct ~ $14,000/ct
  const perCaratBase = 2000 * Math.pow(config.caratsPerEar, 1.35);
  const rawStoneCost = perCaratBase * totalCarats;

  const shapeMultiplier = SHAPE_PREMIUMS[config.shape] || 1.0;
  const colorMultiplier = COLOR_MULTIPLIERS[config.color] || 1.0;
  const clarityMultiplier = CLARITY_MULTIPLIERS[config.clarity] || 1.0;
  const metalCost = METAL_COSTS[config.metal] || 550;

  const stonesTotal = rawStoneCost * shapeMultiplier * colorMultiplier * clarityMultiplier;
  const totalUSD = Math.round(stonesTotal + metalCost);
  const totalEUR = Math.round(totalUSD * 0.92);

  const formatterUSD = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const formatterEUR = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });

  const specsSummary = `${SHAPE_NAMES_ES[config.shape]} 2 × ${config.caratsPerEar} ct (${totalCarats} ct total), Color ${config.color}, Pureza ${config.clarity}, en ${METAL_NAMES_ES[config.metal]}`;

  return {
    totalCarats,
    basePriceUSD: Math.round(stonesTotal),
    finalPriceUSD: totalUSD,
    finalPriceEUR: totalEUR,
    formattedUSD: formatterUSD.format(totalUSD),
    formattedEUR: formatterEUR.format(totalEUR),
    leadTimeWeeks: config.caratsPerEar >= 2.0 ? 3 : 2,
    specsSummary,
  };
}
