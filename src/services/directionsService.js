// AI-assisted: see docs/AI_LOG.md #5
import { OSRM_ROUTING_BASE_URL, DEFAULT_HEADERS } from './apiConfig';

/**
 * Servicio de Generación de Rutas y Waypoints para el Mapa
 * Sección 3.3 del PDF:
 * - "Ruta hacia el punto de recogida; al tocar Pasajero a bordo, la ruta cambia hacia el destino"
 */

/**
 * Obtiene la geometría y coordenadas de navegación paso a paso entre dos puntos.
 * @param {{ latitude: number, longitude: number }} origin
 * @param {{ latitude: number, longitude: number }} destination
 * @returns {Promise<{ waypoints: Array<{ latitude: number, longitude: number }>, summary: string }>}
 */
export async function getDirectionsRoute(origin, destination) {
  if (!origin || !destination) {
    return { waypoints: [], summary: 'Ruta directa' };
  }

  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const url = `${OSRM_ROUTING_BASE_URL}/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url, { headers: DEFAULT_HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const geojsonCoords = data.routes[0].geometry.coordinates;
      // Convertir [lng, lat] a [{ latitude, longitude }]
      const waypoints = geojsonCoords.map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      }));

      return {
        waypoints,
        summary: data.routes[0].legs?.[0]?.summary || 'Vía principal',
      };
    }
    throw new Error('Respuesta OSRM sin waypoints');
  } catch (error) {
    // Generación de waypoints intermedios interpolados
    const points = [];
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
      const fraction = i / steps;
      points.push({
        latitude: origin.latitude + (destination.latitude - origin.latitude) * fraction,
        longitude: origin.longitude + (destination.longitude - origin.longitude) * fraction,
      });
    }
    return {
      waypoints: points,
      summary: 'Ruta calculada',
    };
  }
}
