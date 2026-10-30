// AI-assisted: see docs/AI_LOG.md #5
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import useAlmacenamiento from '../hooks/useAlmacenamiento';

const ActiveTripContext = createContext(null);

/**
 * Estados del viaje según Sección 3.2 del PDF:
 * 1. 'idle': Sin viaje
 * 2. 'requested': Solicitud emitida
 * 3. 'accepted': Conductor aceptó la solicitud
 * 4. 'driver_arriving': Conductor en camino a recoger al pasajero
 * 5. 'in_progress': Pasajero a bordo hacia el destino
 * 6. 'completed': Finalizado; listo para resumen y cobro
 * 7. 'paid': Pago confirmado
 * 8. 'cancelled': Cancelado antes de in_progress
 */

export function ActiveTripProvider({ children }) {
  const { valor: storedActiveTrip, guardar: saveStoredTrip, remover: removeStoredTrip } =
    useAlmacenamiento('@uberclone_active_trip', null);

  const [activeTrip, setActiveTrip] = useState(null);

  // Sincronizar viaje persistido al iniciar
  React.useEffect(() => {
    if (storedActiveTrip && !activeTrip) {
      setActiveTrip(storedActiveTrip);
    }
  }, [storedActiveTrip]);

  // Iniciar viaje aceptado
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

  // Avanzar al siguiente estado del viaje
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

  // Cancelar viaje (solo permitido antes de in_progress)
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

  // Limpiar/Cerrar viaje activo
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
