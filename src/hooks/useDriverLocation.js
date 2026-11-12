import { useState, useEffect, useRef } from 'react';
import {
  syncDriverLocation,
  markDriverLocationOffline,
} from '../services/locationService';

export default function useDriverLocation(isAvailable = false, syncOptions = {}) {
  const driverId = syncOptions?.driverId || null;
  const category = syncOptions?.category || null;
  const activeTripId = syncOptions?.activeTripId || null;

  const [location, setLocation] = useState({
    latitude: 4.60971,
    longitude: -74.08175,
    heading: 0,
    speed: 0,
    timestamp: Date.now(),
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isCloudSyncActive, setIsCloudSyncActive] = useState(false);

  const watchIdRef = useRef(null);
  const intervalIdRef = useRef(null);
  const lastSyncRef = useRef(0);
  const hasSyncedOnlineRef = useRef(false);

  useEffect(() => {
    if (!isAvailable) {
      setIsTracking(false);
      return;
    }

    setIsTracking(true);

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              heading: pos.coords.heading || 0,
              speed: pos.coords.speed || 0,
              timestamp: pos.timestamp,
            });
          },
          (err) => {
            console.log('Fallo GPS nativo, recurriendo a simulación continua de movilidad:', err.message);
            setErrorMsg(err.message);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
        );
      } catch (e) {
        console.log('Error inicializando watchPosition:', e);
      }
    }

    intervalIdRef.current = setInterval(() => {
      setLocation((prev) => {
        const latDelta = (Math.random() - 0.48) * 0.0003;
        const lngDelta = (Math.random() - 0.48) * 0.0003;
        return {
          ...prev,
          latitude: prev.latitude + latDelta,
          longitude: prev.longitude + lngDelta,
          heading: Math.floor(Math.random() * 360),
          speed: Math.floor(15 + Math.random() * 25),
          timestamp: Date.now(),
        };
      });
    }, 4000);

    return () => {
      setIsTracking(false);
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [isAvailable]);

  useEffect(() => {
    if (!isAvailable || !driverId) {
      lastSyncRef.current = 0;
      setIsCloudSyncActive(false);
      if (driverId && !isAvailable && hasSyncedOnlineRef.current) {
        hasSyncedOnlineRef.current = false;
        markDriverLocationOffline(driverId).catch((err) => {
          console.warn('Error marcando ubicación desconectada en Firestore:', err.message);
        });
      }
      return undefined;
    }

    return () => {
      lastSyncRef.current = 0;
      setIsCloudSyncActive(false);
      if (hasSyncedOnlineRef.current) {
        hasSyncedOnlineRef.current = false;
        markDriverLocationOffline(driverId).catch((err) => {
          console.warn('Error limpiando ubicación en Firestore:', err.message);
        });
      }
    };
  }, [isAvailable, driverId]);

  useEffect(() => {
    if (!isAvailable || !driverId) return;

    const now = Date.now();
    if (lastSyncRef.current !== 0 && now - lastSyncRef.current < 3500) {
      return;
    }

    lastSyncRef.current = now;
    syncDriverLocation(driverId, location, {
      isAvailable: true,
      category,
      activeTripId,
    })
      .then((synced) => {
        if (synced) {
          hasSyncedOnlineRef.current = true;
          setIsCloudSyncActive(true);
        }
      })
      .catch((err) => {
        console.warn('Error sincronizando ubicación en Firestore:', err.message);
      });
  }, [isAvailable, driverId, category, activeTripId, location]);

  return {
    location,
    isTracking,
    errorMsg,
    isCloudSyncActive,
  };
}
