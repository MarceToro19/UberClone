import { OSRM_ROUTING_BASE_URL, DEFAULT_HEADERS } from './apiConfig';

export async function calculateDistanceAndDuration(origin, destination) {
  if (!origin || !destination) {
    return { distanceKm: 5.0, durationMin: 15 };
  }

  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const url = `${OSRM_ROUTING_BASE_URL}/route/v1/driving/${coordinates}?overview=false`;

  try {
    const response = await fetch(url, { headers: DEFAULT_HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
      const durationMin = Math.round(route.duration / 60);
      return {
        distanceKm: Math.max(1, distanceKm),
        durationMin: Math.max(2, durationMin),
      };
    }
    throw new Error('Respuesta OSRM sin rutas');
  } catch (error) {
    console.log('Fallback en Distance Matrix:', error.message);
    const dLat = (destination.latitude - origin.latitude) * 111;
    const dLng = (destination.longitude - origin.longitude) * 111;
    const straightDist = Math.sqrt(dLat * dLat + dLng * dLng);
    const distanceKm = Math.max(1.5, Math.round(straightDist * 1.35 * 10) / 10);
    const durationMin = Math.max(5, Math.round(distanceKm * 2.8));

    return { distanceKm, durationMin };
  }
}
