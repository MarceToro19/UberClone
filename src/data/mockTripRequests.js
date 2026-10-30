// AI-assisted: see docs/AI_LOG.md #5
import { calculateTripFare } from '../utils/calculateFare';

/**
 * Solicitudes de viaje simuladas para pruebas en Medellín / Colombia.
 * Cada una con tiempos, distancias, categoría y pasajero.
 */
export const MOCK_TRIP_REQUESTS = [
  {
    id: 'req-001',
    passenger: {
      name: 'Laura Gómez',
      rating: 4.9,
      tripsCount: 124,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120',
    },
    pickup: {
      address: 'Centro Comercial El Tesoro, Poblado',
      latitude: 6.1983,
      longitude: -75.5586,
    },
    destination: {
      address: 'Parque Lleras, El Poblado',
      latitude: 6.2089,
      longitude: -75.5678,
    },
    distanceKm: 3.8,
    estimatedMinutes: 12,
    category: 'Económico',
    paymentMethod: 'cash', // 'cash' | 'card' / Mercado Pago
  },
  {
    id: 'req-002',
    passenger: {
      name: 'Carlos Restrepo',
      rating: 4.8,
      tripsCount: 58,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
    },
    pickup: {
      address: 'Estación Metro Poblado',
      latitude: 6.2123,
      longitude: -75.5781,
    },
    destination: {
      address: 'Aeropuerto Olaya Herrera',
      latitude: 6.2185,
      longitude: -75.5902,
    },
    distanceKm: 5.2,
    estimatedMinutes: 16,
    category: 'Económico',
    paymentMethod: 'gateway',
  },
  {
    id: 'req-003',
    passenger: {
      name: 'Valeria Martínez',
      rating: 5.0,
      tripsCount: 210,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120',
    },
    pickup: {
      address: 'Hotel Dann Carlton, El Poblado',
      latitude: 6.2094,
      longitude: -75.5712,
    },
    destination: {
      address: 'Plaza Mayor Medellín, La Candelaria',
      latitude: 6.2415,
      longitude: -75.5746,
    },
    distanceKm: 8.5,
    estimatedMinutes: 22,
    category: 'XL',
    paymentMethod: 'gateway',
  },
  {
    id: 'req-004',
    passenger: {
      name: 'Andrés Felipe Mejía',
      rating: 4.7,
      tripsCount: 35,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120',
    },
    pickup: {
      address: 'Primer Parque Laureles',
      latitude: 6.2443,
      longitude: -75.5925,
    },
    destination: {
      address: 'Centro Comercial Viva Envigado',
      latitude: 6.1772,
      longitude: -75.5901,
    },
    distanceKm: 11.4,
    estimatedMinutes: 28,
    category: 'Premium',
    paymentMethod: 'cash',
  },
];

/**
 * Enriquecer un request con los cálculos oficiales de tarifa del PDF
 */
export function buildTripRequestWithPricing(rawRequest, driverCategory = null) {
  const categoryToUse = driverCategory || rawRequest.category || 'Económico';
  const fareResult = calculateTripFare(
    rawRequest.distanceKm,
    rawRequest.estimatedMinutes,
    categoryToUse
  );

  return {
    ...rawRequest,
    category: categoryToUse,
    pricing: fareResult,
  };
}
