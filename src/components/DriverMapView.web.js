import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GOOGLE_MAPS_API_KEY, MAP_CONFIG } from '../config/mapsConfig';
import { colors, spacing, radius } from '../theme';

function getRedCarMarkerIcon(maps) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="44" height="44"><circle cx="32" cy="32" r="28" fill="#ffffff" stroke="#ef4444" stroke-width="4"/><path d="M18 34 L21 22 C22 19 24 18 27 18 L37 18 C40 18 42 19 43 22 L46 34 C47 35 48 37 48 39 L48 43 C48 44.5 47 45.5 45.5 45.5 L43.5 45.5 C42 45.5 41 44.5 41 43 L41 41 L23 41 L23 43 C23 44.5 22 45.5 20.5 45.5 L18.5 45.5 C17 45.5 16 44.5 16 43 L16 39 C16 37 17 35 18 34 Z" fill="#ef4444" stroke="#991b1b" stroke-width="1.5"/><path d="M23.5 21 L40.5 21 L42.5 29 L21.5 29 Z" fill="#1e293b"/><circle cx="22.5" cy="35" r="2.3" fill="#fef08a"/><circle cx="41.5" cy="35" r="2.3" fill="#fef08a"/></svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new maps.Size(44, 44),
    anchor: new maps.Point(22, 22),
  };
}

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
          icon: getRedCarMarkerIcon(window.google.maps),
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
    driverMarkerRef.current.setIcon(getRedCarMarkerIcon(window.google.maps));

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
