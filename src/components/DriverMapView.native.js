import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { MAP_CONFIG } from '../config/mapsConfig';
import { colors, spacing, radius } from '../theme';

export default function DriverMapView({ location, isTracking, isAvailable }) {
  const nativeMapRef = useRef(null);

  const latitude = location?.latitude || MAP_CONFIG.defaultCenter.lat;
  const longitude = location?.longitude || MAP_CONFIG.defaultCenter.lng;
  const heading = location?.heading || 0;

  useEffect(() => {
    if (nativeMapRef.current && isTracking) {
      nativeMapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        },
        1000
      );
    }
  }, [latitude, longitude, isTracking]);

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={nativeMapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        customMapStyle={MAP_CONFIG.darkMapStyle}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.carMarker}>
            <Ionicons name="car-sport" size={24} color={colors.peligro} />
          </View>
        </Marker>
      </MapView>

      <View style={styles.googleBadge}>
        <Ionicons name="map" size={12} color={colors.primario} />
        <Text style={styles.googleBadgeText}>Google Maps Móvil • Conectado</Text>
      </View>

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
            <Text style={styles.coordVal}>{latitude.toFixed(5)}</Text>
          </View>
          <View style={styles.coordCol}>
            <Text style={styles.coordLabel}>LONGITUD</Text>
            <Text style={styles.coordVal}>{longitude.toFixed(5)}</Text>
          </View>
          <View style={styles.coordCol}>
            <Text style={styles.coordLabel}>VELOCIDAD</Text>
            <Text style={styles.coordVal}>{location?.speed || 0} km/h</Text>
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
  carMarker: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.blanco,
    borderWidth: 2.5,
    borderColor: colors.peligro,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  googleBadge: {
    position: 'absolute',
    bottom: 12,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.borde,
    zIndex: 5,
  },
  googleBadgeText: {
    color: colors.textoSuave,
    fontSize: 10,
    fontWeight: '600',
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
    zIndex: 5,
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
