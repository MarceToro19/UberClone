import { PRICING_CONFIG, CATEGORY_MULTIPLIERS } from '../config/pricing.js';

export function calculateFare({ distanceKm = 0, durationMin = 0, category = 'economy', tip = 0 }) {
  const { tarifaBase, valorPorKm, valorPorMinuto, tarifaMinima, comisionPorcentaje } = PRICING_CONFIG;
  const normalizedCategory = (category || 'economy').toLowerCase();
  const categoryInfo =
    CATEGORY_MULTIPLIERS[normalizedCategory] ||
    CATEGORY_MULTIPLIERS[normalizedCategory === 'económico' ? 'economy' : normalizedCategory] ||
    CATEGORY_MULTIPLIERS.economy;
  const multiplier = categoryInfo.multiplier;

  const subtotal = tarifaBase + (distanceKm * valorPorKm) + (durationMin * valorPorMinuto);
  const tarifaCalculada = Math.max(tarifaMinima, subtotal * multiplier);
  
  const fare = Math.round(tarifaCalculada / 100) * 100;
  
  const commission = Math.round(fare * comisionPorcentaje);
  
  const driverEarnings = (fare - commission) + Math.round(tip || 0);

  return {
    fare,
    tarifaBruta: fare,
    commission,
    comision: commission,
    driverEarnings,
    gananciaNeta: driverEarnings,
    commissionRate: comisionPorcentaje,
  };
}

export function calculateTripFare(distanceKm, durationMin, category = 'economy', tip = 0) {
  if (typeof distanceKm === 'object' && distanceKm !== null) {
    return calculateFare(distanceKm);
  }
  return calculateFare({ distanceKm, durationMin, category, tip });
}
