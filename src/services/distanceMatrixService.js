// AI-assisted: see docs/AI_LOG.md #5
import { OSRM_ROUTING_BASE_URL, DEFAULT_HEADERS } from './apiConfig';

/**
 * Servicio de Cálculo de Matriz de Distancia y Duración
 * Cumple con lo solicitado por la docente:
 * - "Hay otra API que trabaja con esa que se llama Matrix que es la que hace como la matriz y los puntos cardinales..."
 * - Provee distancia en kilómetros y duración en minutos para el motor de cálculo calculateFare
 */

/**
 * Calcula la distancia en km y la duración estimada en minutos entre dos puntos geográficos.
 * @param {{ latitude: number, longitude: number }} origin
 * @param {{ latitude: number, longitude: number }} destination
 * @returns {Promise<{ distanceKm: number, durationMin: number }>}
 */
export async function calculateDistanceAndDuration(origin, destination) {
  if (!origin || !destination) {
    return { distanceKm: 5.0, durationMin: 15 };
  }

  // OSRM espera: {lon},{lat};{lon},{lat}
  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const url = `${OSRM_ROUTING_BASE_URL}/route/v1/driving/${coordinates}?overview=false`;

  try {
    const response = await fetch(url, { headers: DEFAULT_HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceKm = Math.round((route.distance / 1000) * 10) / 10; // metros a km (1 decimal)
      const durationMin = Math.round(route.duration / 60);              // segundos a minutos
      return {
        distanceKm: Math.max(1, distanceKm),
        durationMin: Math.max(2, durationMin),
      };
    }
    throw new Error('Respuesta OSRM sin rutas');
  } catch (error) {
    console.log('Fallback en Distance Matrix:', error.message);
    // Fallback matemático basado en fórmula de Haversine
    const dLat = (destination.latitude - origin.latitude) * 111;
    const dLng = (destination.longitude - origin.longitude) * 111;
    const straightDist = Math.sqrt(dLat * dLat + dLng * dLng);
    // Factor de ruta urbana (x1.35)
    const distanceKm = Math.max(1.5, Math.round(straightDist * 1.35 * 10) / 10);
    const durationMin = Math.max(5, Math.round(distanceKm * 2.8)); // Promedio 2.8 min/km en tráfico

    return { distanceKm, durationMin };
  }
}
