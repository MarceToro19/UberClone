// AI-assisted: see docs/AI_LOG.md #1
export const colors = {
  fondo: '#0f172a',          // Fondo oscuro elegante para conductores
  superficie: '#1e293b',     // Tarjetas y modales
  superficieClara: '#334155',
  texto: '#f8fafc',          // Texto principal de alto contraste
  textoSuave: '#94a3b8',     // Subtítulos y etiquetas secundarias
  borde: '#334155',
  primario: '#10b981',       // Verde de acción / disponible (estilo movilidad)
  primarioSuave: '#064e3b',
  peligro: '#ef4444',        // Rojo desconectado / rechazar
  peligroSuave: '#450a0a',
  advertencia: '#f59e0b',    // Alerta o pendiente
  dorado: '#eab308',         // Ganancias
  blanco: '#ffffff',
  negro: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 999,
};

export const typography = {
  tituloGrande: { fontSize: 26, fontWeight: '800', color: colors.texto },
  titulo: { fontSize: 20, fontWeight: '700', color: colors.texto },
  subtitulo: { fontSize: 16, fontWeight: '600', color: colors.texto },
  cuerpo: { fontSize: 14, fontWeight: '400', color: colors.texto },
  etiqueta: { fontSize: 12, fontWeight: '500', color: colors.textoSuave },
};

export default { colors, spacing, radius, typography };
