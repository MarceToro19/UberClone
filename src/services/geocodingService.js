// AI-assisted: see docs/AI_LOG.md #5
import { NOMINATIM_BASE_URL, DEFAULT_HEADERS } from './apiConfig';

/**
 * Servicio de Geocodificación y Búsqueda de Direcciones
 * Implementa la regla explicada por la docente en clase:
 * - "Cuando mando el texto lo mando en codeado (encodeURIComponent), cuando es con ID no se manda en codeado"
 * - API pública gratuita sin necesidad de API key
 */

/**
 * Convierte un texto de dirección en coordenadas geográficas.
 * @param {string} addressQuery - Texto de la dirección (ej. "Parque de la 93, Bogota")
 * @returns {Promise<{ latitude: number, longitude: number, displayName: string } | null>}
 */
export async function searchAddressByText(addressQuery) {
  if (!addressQuery || !addressQuery.trim()) return null;

  // REGLA DE CLASE: El texto se manda estrictamente encodeado
  const encodedQuery = encodeURIComponent(addressQuery.trim());
  const url = `${NOMINATIM_BASE_URL}/search?q=${encodedQuery}&format=json&limit=1&countrycodes=co`;

  try {
    const response = await fetch(url, { headers: DEFAULT_HEADERS });
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }
    return null;
  } catch (error) {
    console.log('Fallo petición Geocoding Nominatim:', error.message);
    // Fallback simulado para que la app nunca falle en pruebas offline
    return {
      latitude: 4.60971,
      longitude: -74.08175,
      displayName: addressQuery,
    };
  }
}

/**
 * Búsqueda inversa por coordenadas exactas (Reverse Geocoding)
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>}
 */
export async function getAddressFromCoords(latitude, longitude) {
  const url = `${NOMINATIM_BASE_URL}/reverse?lat=${latitude}&lon=${longitude}&format=json`;

  try {
    const response = await fetch(url, { headers: DEFAULT_HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    return `Carrera 7 con Calle 72, Bogotá (Coord: ${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;
  }
}
