// AI-assisted: see docs/AI_LOG.md #5
/**
 * Configuración centralizada de endpoints y URLs base de APIs
 * Siguiendo la directriz de la docente en clase (requisitosExgra.txt):
 * "cuando uno está con lo de las APIs, por lo general vamos a crear una constante
 * que se llama BASE_URL o la pueden llamar también como URL_API... son entre 6 a 8 APIs"
 */

// 1. Nominatim OpenStreetMap (Pública, gratuita, sin API key requerida)
export const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// 2. OSRM Routing & Distance Engine (Pública, gratuita, sin API key requerida)
export const OSRM_ROUTING_BASE_URL = 'https://router.project-osrm.org';

// 3. Google Maps APIs (Para producción o entornos con llave)
export const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

// Headers requeridos por políticas de uso de APIs públicas gratuitas (ej. Nominatim)
export const DEFAULT_HEADERS = {
  'Accept': 'application/json',
  'User-Agent': 'UberClone-Conductor-App/1.0',
};
