import { OSRM_ROUTING_BASE_URL, DEFAULT_HEADERS } from './apiConfig';

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
