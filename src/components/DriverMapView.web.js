import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GOOGLE_MAPS_API_KEY, MAP_CONFIG } from '../config/mapsConfig';
import { colors, spacing, radius } from '../theme';

export default function DriverMapView({ location, isTracking, isAvailable }) {
  const mapDivRef = useRef(null);
  const googleMapInstance = useRef(null);
  const driverMarkerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const latitude = location?.latitude || MAP_CONFIG.defaultCenter.lat;
  const longitude = location?.longitude || MAP_CONFIG.defaultCenter.lng;
  const heading = location?.heading || 0;

  useEffect(() => {
    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId);

    const initializeMap = () => {
      if (!window.google || !window.google.maps || !mapDivRef.current) return;

      try {
        const center = { lat: latitude, lng: longitude };

        const map = new window.google.maps.Map(mapDivRef.current, {
          center,
          zoom: MAP_CONFIG.defaultZoom,
          styles: MAP_CONFIG.darkMapStyle,
          disableDefaultUI: true,
          zoomControl: false,
          gestureHandling: 'greedy',
        });

        const marker = new window.google.maps.Marker({
          position: center,
          map,
          title: 'Conductor UberClone',
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: isAvailable ? '#10b981' : '#ef4444',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
            rotation: heading,
          },
        });

        googleMapInstance.current = map;
        driverMarkerRef.current = marker;
        setMapLoaded(true);
      } catch (err) {
        console.warn('Error inicializando Google Maps Web:', err);
      }
    };

    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', initializeMap);
    }

    return () => {
      if (script) {
        script.removeEventListener('load', initializeMap);
      }
    };
  }, []);

  useEffect(() => {
    if (!googleMapInstance.current || !driverMarkerRef.current || !location) return;

    const newPos = { lat: latitude, lng: longitude };
    driverMarkerRef.current.setPosition(newPos);
    driverMarkerRef.current.setIcon({
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 6,
      fillColor: isAvailable ? '#10b981' : '#ef4444',
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#ffffff',
      rotation: heading,
    });

    if (isTracking) {
      googleMapInstance.current.panTo(newPos);
    }
  }, [latitude, longitude, heading, isTracking, isAvailable]);

  return (
    <View style={styles.mapContainer}>
      <div
        ref={mapDivRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <View style={styles.googleBadge}>
        <Ionicons name="map" size={12} color={colors.primario} />
        <Text style={styles.googleBadgeText}>Google Maps Web • Conectado</Text>
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
