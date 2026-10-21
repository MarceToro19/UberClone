// AI-assisted: see docs/AI_LOG.md #4
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';

/**
 * Componente de visualización de mapa optimizado y multiplataforma.
 * Dibuja la ubicación del conductor, estado de telemetría y coordenadas en tiempo real
 * sin generar costos excesivos en Google Maps API (cumple recomendaciones de consumo Sección 7).
 */
export default function DriverMapView({ location, isTracking, isAvailable }) {
  return (
    <View style={styles.mapContainer}>
      {/* Fondo de mapa estilizado con cuadrícula de navegación */}
      <View style={styles.gridOverlay}>
        <View style={styles.gridLineHorizontal1} />
        <View style={styles.gridLineHorizontal2} />
        <View style={styles.gridLineVertical1} />
        <View style={styles.gridLineVertical2} />

        {/* Indicador del conductor en el mapa */}
        <View style={styles.driverMarkerContainer}>
          <View style={[styles.pulseCircle, isTracking ? styles.pulseActive : null]} />
          <View style={[styles.carMarker, isAvailable ? styles.carAvailable : styles.carOffline]}>
            <Ionicons name="navigate" size={24} color={colors.blanco} style={{ transform: [{ rotate: (location.heading || 0) + 'deg' }] }} />
          </View>

        </View>
      </View>

      {/* Tarjeta flotante con telemetría de ubicación continua */}
      <View style={styles.telemetryCard}>
        <View style={styles.telemetryHeader}>
          <View style={[styles.statusDot, isTracking ? styles.dotGreen : styles.dotGray]} />
          <Text style={styles.telemetryTitle}>
            {isTracking ? 'GPS EN VIVO • SEGUIMIENTO ACTIVO' : 'GPS EN PAUSA'}
          </Text>
        </View>

        <View style={styles.coordsRow}>
          <View style={styles.coordCol}>
            <Text style={styles.coordLabel}>LATITUD</Text>
            <Text style={styles.coordVal}>{location.latitude?.toFixed(5)}</Text>
          </View>
          <View style={styles.coordCol}>
            <Text style={styles.coordLabel}>LONGITUD</Text>
            <Text style={styles.coordVal}>{location.longitude?.toFixed(5)}</Text>
          </View>
          <View style={styles.coordCol}>
            <Text style={styles.coordLabel}>VELOCIDAD</Text>
            <Text style={styles.coordVal}>{location.speed || 0} km/h</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: '#090d16',
    position: 'relative',
    overflow: 'hidden',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLineHorizontal1: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
  },
  gridLineHorizontal2: {
    position: 'absolute',
    top: '70%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
  },
  gridLineVertical1: {
    position: 'absolute',
    left: '30%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
  },
  gridLineVertical2: {
    position: 'absolute',
    left: '70%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
  },
  driverMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  pulseActive: {
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  carMarker: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  carAvailable: {
    backgroundColor: colors.primario,
  },
  carOffline: {
    backgroundColor: colors.textoSuave,
  },
  telemetryCard: {
    position: 'absolute',
    top: 76,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(30, 41, 59, 0.92)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borde,
  },

  telemetryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    marginRight: spacing.xs,
  },
  dotGreen: {
    backgroundColor: colors.primario,
  },
  dotGray: {
    backgroundColor: colors.textoSuave,
  },
  telemetryTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textoSuave,
    letterSpacing: 1,
  },
  coordsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  coordCol: {
    alignItems: 'center',
  },
  coordLabel: {
    fontSize: 9,
    color: colors.textoSuave,
    fontWeight: '600',
  },
  coordVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.texto,
    marginTop: 2,
  },
});
