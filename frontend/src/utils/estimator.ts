export interface QuotationRequest {
  itemType: string;
  metal: string;
  gemstone: string;
  budgetUSD: number;
  contactMethod: 'phone' | 'telegram' | 'whatsapp';
  contactValue: string;
  fullName?: string;
  notes?: string;
}

export interface QuotationEstimate {
  estimatedWeightGrams: number;
  recommendedDiamondAccentCt: number;
  gemstoneGradeText: string;
  productionTimeDays: number;
  estimatedPriceRange: string;
}

export function generateCustomEstimate(req: Partial<QuotationRequest>): QuotationEstimate {
  const budget = req.budgetUSD || 2500;
  const isPlatinum = req.metal?.toLowerCase().includes('platino');
  
  let baseWeight = 4.5;
  if (req.itemType?.toLowerCase().includes('pulsera')) {
    baseWeight = 14.0;
  } else if (req.itemType?.toLowerCase().includes('pendiente') || req.itemType?.toLowerCase().includes('dormilona')) {
    baseWeight = 3.8;
  } else if (req.itemType?.toLowerCase().includes('colgante') || req.itemType?.toLowerCase().includes('collar')) {
    baseWeight = 6.0;
  }

  const weight = isPlatinum ? Number((baseWeight * 1.45).toFixed(1)) : baseWeight;
  const accentCt = budget > 5000 ? 0.65 : budget > 3000 ? 0.40 : 0.20;

  let grade = 'Gemas naturales certificadas calidad Extra';
  if (req.gemstone?.toLowerCase().includes('paraíba') || req.gemstone?.toLowerCase().includes('diamante')) {
    grade = 'Piedras de grado inversión con certificación gemológica internacional';
  } else if (req.gemstone?.toLowerCase().includes('esmeralda')) {
    grade = 'Esmeraldas naturales colombianas con brillo vivo y saturación intensa';
  }

  const minPrice = Math.round(budget * 0.9);
  const maxPrice = Math.round(budget * 1.15);

  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return {
    estimatedWeightGrams: weight,
    recommendedDiamondAccentCt: accentCt,
    gemstoneGradeText: grade,
    productionTimeDays: budget > 7000 ? 21 : 14,
    estimatedPriceRange: `${formatter.format(minPrice)} – ${formatter.format(maxPrice)}`,
  };
}
