import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import useAlmacenamiento from '../hooks/useAlmacenamiento';

const ActiveTripContext = createContext(null);

export function ActiveTripProvider({ children }) {
  const [storedActiveTrip, saveStoredTrip, , removeStoredTrip] =
    useAlmacenamiento('@uberclone_active_trip', null);

  const [activeTrip, setActiveTrip] = useState(null);

  React.useEffect(() => {
    if (storedActiveTrip && !activeTrip) {
      setActiveTrip(storedActiveTrip);
    }
  }, [storedActiveTrip]);

  const startTripFromRequest = useCallback(
    (request) => {
      const newTrip = {
        ...request,
        id: request.id || `trip-${Date.now()}`,
        status: 'accepted',
        startedAt: new Date().toISOString(),
        timeline: [
          { status: 'accepted', timestamp: new Date().toISOString(), label: 'Viaje aceptado' },
        ],
      };
      setActiveTrip(newTrip);
      saveStoredTrip(newTrip);
      return newTrip;
    },
    [saveStoredTrip]
  );

  const updateTripStatus = useCallback(
    (newStatus, metadata = {}) => {
      setActiveTrip((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          status: newStatus,
          ...metadata,
          timeline: [
            ...prev.timeline,
            { status: newStatus, timestamp: new Date().toISOString(), ...metadata },
          ],
        };
        saveStoredTrip(updated);
        return updated;
      });
    },
    [saveStoredTrip]
  );

  const cancelActiveTrip = useCallback(
    (reason = 'conductor') => {
      setActiveTrip((prev) => {
        if (!prev || prev.status === 'in_progress' || prev.status === 'completed') {
          return prev;
        }
        const cancelled = {
          ...prev,
          status: 'cancelled',
          cancellationReason: reason,
          cancelledAt: new Date().toISOString(),
        };
        saveStoredTrip(cancelled);
        return cancelled;
      });
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
