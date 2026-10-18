// AI-assisted: see docs/AI_LOG.md #1
import { PRICING_CONFIG, CATEGORY_MULTIPLIERS } from '../config/pricing.js';

/**
 * Función pura para cálculo de tarifa, comisión y ganancia neta.
 * Sección 5 del documento UberClone Conductor:
 * - Subtotal = Base + (km * Vkm) + (min * Vmin)
 * - Tarifa Bruta = max(Minima, Subtotal * Multiplicador)
 * - Tarifa Redondeada = Múltiplo de 100 COP más cercano
 * - Comisión = Tarifa Redondeada * 0.20
 * - Ganancia Neta = Tarifa Redondeada - Comisión + Propina
 *
 * @param {Object} params
 * @param {number} params.distanceKm - Distancia en kilómetros
 * @param {number} params.durationMin - Duración en minutos
 * @param {string} params.category - 'economy' | 'xl' | 'premium'
 * @param {number} [params.tip=0] - Propina voluntaria
 * @returns {{ fare: number, commission: number, driverEarnings: number, commissionRate: number }}
 */
export function calculateFare({ distanceKm = 0, durationMin = 0, category = 'economy', tip = 0 }) {
  const { tarifaBase, valorPorKm, valorPorMinuto, tarifaMinima, comisionPorcentaje } = PRICING_CONFIG;
  const categoryInfo = CATEGORY_MULTIPLIERS[category] || CATEGORY_MULTIPLIERS.economy;
  const multiplier = categoryInfo.multiplier;

  const subtotal = tarifaBase + (distanceKm * valorPorKm) + (durationMin * valorPorMinuto);
  const tarifaBruta = Math.max(tarifaMinima, subtotal * multiplier);
  
  // Redondeo al múltiplo de 100 COP más cercano
  const fare = Math.round(tarifaBruta / 100) * 100;
  
  // Comisión del 20%
  const commission = Math.round(fare * comisionPorcentaje);
  
  // Ganancia neta para el conductor + propina íntegra
  const driverEarnings = (fare - commission) + Math.round(tip || 0);

  return {
    fare,
    commission,
    driverEarnings,
    commissionRate: comisionPorcentaje,
  };
}
