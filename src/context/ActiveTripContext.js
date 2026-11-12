import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import useAlmacenamiento from '../hooks/useAlmacenamiento';
import { useDriverSession } from './DriverSessionContext';
import { createTripRecord, updateTripRecord } from '../services/tripService';

const ActiveTripContext = createContext(null);

export function ActiveTripProvider({ children }) {
  const { driverProfile } = useDriverSession();
  const [storedActiveTrip, saveStoredTrip, , removeStoredTrip] =
    useAlmacenamiento('@uberclone_active_trip', null);

  const [activeTrip, setActiveTrip] = useState(null);
  const activeTripRef = useRef(null);
  activeTripRef.current = activeTrip;

  React.useEffect(() => {
    if (storedActiveTrip && !activeTrip) {
      setActiveTrip(storedActiveTrip);
    }
  }, [storedActiveTrip]);

  const startTripFromRequest = useCallback(
    (request) => {
      const tripId = `trip_${Date.now()}`;
      const startedAt = new Date().toISOString();
      const newTrip = {
        ...request,
        id: tripId,
        requestId: request.id || null,
        driverId: driverProfile?.id || null,
        driverName: driverProfile?.personal?.fullName || null,
        status: 'accepted',
        startedAt,
        timeline: [
          { status: 'accepted', timestamp: startedAt, label: 'Viaje aceptado' },
        ],
      };
      activeTripRef.current = newTrip;
      setActiveTrip(newTrip);
      saveStoredTrip(newTrip);

      createTripRecord(newTrip).catch((error) => {
        console.warn('Error creando viaje en Firestore:', error.message);
      });

      return newTrip;
    },
    [driverProfile?.id, driverProfile?.personal?.fullName, saveStoredTrip]
  );

  const updateTripStatus = useCallback(
    async (newStatus, metadata = {}) => {
      const prev = activeTripRef.current;
      if (!prev) return null;

      const updated = {
        ...prev,
        status: newStatus,
        ...metadata,
        timeline: [
          ...(prev.timeline || []),
          { status: newStatus, timestamp: new Date().toISOString(), ...metadata },
        ],
      };

      activeTripRef.current = updated;
      setActiveTrip(updated);
      saveStoredTrip(updated);

      try {
        await updateTripRecord(updated.id, {
          status: newStatus,
          ...metadata,
          timeline: updated.timeline,
        });
      } catch (error) {
        console.warn('Error actualizando estado del viaje en Firestore:', error.message);
      }

      return updated;
    },
    [saveStoredTrip]
  );

  const cancelActiveTrip = useCallback(
    (reason = 'conductor') => {
      const prev = activeTripRef.current;
      if (!prev || prev.status === 'in_progress' || prev.status === 'completed') {
        return null;
      }

      const cancelledAt = new Date().toISOString();
      const cancelled = {
        ...prev,
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt,
      };

      activeTripRef.current = cancelled;
      setActiveTrip(cancelled);
      saveStoredTrip(cancelled);

      updateTripRecord(cancelled.id, {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt,
      }).catch((error) => {
        console.warn('Error registrando cancelación en Firestore:', error.message);
      });

      return cancelled;
    },
    [saveStoredTrip]
  );

  const clearActiveTrip = useCallback(() => {
    setActiveTrip(null);
    removeStoredTrip();
  }, [removeStoredTrip]);

  const value = useMemo(
    () => ({
      activeTrip,
      hasActiveTrip: !!activeTrip && activeTrip.status !== 'completed' && activeTrip.status !== 'cancelled' && activeTrip.status !== 'paid',
      startTripFromRequest,
      updateTripStatus,
      cancelActiveTrip,
      clearActiveTrip,
    }),
    [activeTrip, startTripFromRequest, updateTripStatus, cancelActiveTrip, clearActiveTrip]
  );

  return <ActiveTripContext.Provider value={value}>{children}</ActiveTripContext.Provider>;
}

export function useActiveTrip() {
  const context = useContext(ActiveTripContext);
  if (!context) {
    throw new Error('useActiveTrip debe usarse dentro de un ActiveTripProvider');
  }
  return context;
}
