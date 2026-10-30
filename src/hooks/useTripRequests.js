// AI-assisted: see docs/AI_LOG.md #5
import { useState, useEffect, useRef, useCallback } from 'react';
import { MOCK_TRIP_REQUESTS, buildTripRequestWithPricing } from '../data/mockTripRequests';

const REQUEST_TIMEOUT_SECONDS = 15; // Requerimiento estricto del PDF: 15 segundos

/**
 * Hook obligatorio useTripRequests
 * Maneja el ciclo de vida de las solicitudes entrantes:
 * - Se activa únicamente cuando isAvailable === true y no hay un viaje activo.
 * - Temporizador estricto de 15 segundos con cuenta regresiva por segundo.
 * - Si el temporizador expira sin respuesta, la solicitud se rechaza automáticamente.
 * - Limpieza obligatoria del temporizador al desmontar, cancelar o cambiar estado.
 */
export default function useTripRequests({
  isAvailable = false,
  hasActiveTrip = false,
  driverCategory = 'Económico',
  onTripAccepted,
} = {}) {
  const [currentRequest, setCurrentRequest] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(REQUEST_TIMEOUT_SECONDS);
  const [requestHistory, setRequestHistory] = useState([]);

  const timerRef = useRef(null);
  const simulationTimerRef = useRef(null);
  const requestIndexRef = useRef(0);

  // Limpiar temporizador de cuenta regresiva
  const clearCountdown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Limpiar temporizador de simulación de despacho
  const clearSimulationTimer = useCallback(() => {
    if (simulationTimerRef.current) {
      clearTimeout(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
  }, []);

  // Función para rechazar viaje actual
  const rejectRequest = useCallback((reason = 'manual') => {
    clearCountdown();
    if (currentRequest) {
      setRequestHistory((prev) => [
        { ...currentRequest, outcome: 'rejected', rejectReason: reason, timestamp: new Date().toISOString() },
        ...prev,
      ]);
    }
    setCurrentRequest(null);
    setSecondsLeft(REQUEST_TIMEOUT_SECONDS);
  }, [clearCountdown, currentRequest]);

  // Función para aceptar viaje actual
  const acceptRequest = useCallback(() => {
    clearCountdown();
    if (!currentRequest) return null;

    const acceptedTrip = {
      ...currentRequest,
      outcome: 'accepted',
      acceptedAt: new Date().toISOString(),
      status: 'accepted',
    };

    setRequestHistory((prev) => [acceptedTrip, ...prev]);
    setCurrentRequest(null);
    setSecondsLeft(REQUEST_TIMEOUT_SECONDS);

    if (onTripAccepted) {
      onTripAccepted(acceptedTrip);
    }
    return acceptedTrip;
  }, [clearCountdown, currentRequest, onTripAccepted]);

  // Función para despachar una nueva solicitud simulada
  const triggerNewRequest = useCallback(() => {
    if (!isAvailable || hasActiveTrip || currentRequest) return;

    const raw = MOCK_TRIP_REQUESTS[requestIndexRef.current % MOCK_TRIP_REQUESTS.length];
    requestIndexRef.current += 1;

    const enriched = buildTripRequestWithPricing(raw, driverCategory);
    setCurrentRequest(enriched);
    setSecondsLeft(REQUEST_TIMEOUT_SECONDS);
  }, [isAvailable, hasActiveTrip, currentRequest, driverCategory]);

  // Manejo del temporizador de 15 segundos cuando hay un request activo
  useEffect(() => {
    if (!currentRequest) return;

    clearCountdown();
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Expiró el tiempo -> Auto-rechazar según PDF
          clearInterval(timerRef.current);
          timerRef.current = null;
          rejectRequest('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearCountdown();
    };
  }, [currentRequest, clearCountdown, rejectRequest]);

  // Programar llegada de solicitudes simuladas mientras esté Disponible y sin viaje activo
  useEffect(() => {
    if (!isAvailable || hasActiveTrip) {
      clearCountdown();
      clearSimulationTimer();
      setCurrentRequest(null);
      return;
    }

    // Si está disponible y no hay solicitud, programar una tras 5 segundos de espera
    if (!currentRequest) {
      clearSimulationTimer();
      simulationTimerRef.current = setTimeout(() => {
        triggerNewRequest();
      }, 5000);
    }

    return () => {
      clearSimulationTimer();
    };
  }, [isAvailable, hasActiveTrip, currentRequest, clearCountdown, clearSimulationTimer, triggerNewRequest]);

  // Limpieza total en desmontaje del hook
  useEffect(() => {
    return () => {
      clearCountdown();
      clearSimulationTimer();
    };
  }, [clearCountdown, clearSimulationTimer]);

  const progressPercent = (secondsLeft / REQUEST_TIMEOUT_SECONDS) * 100;

  return {
    currentRequest,
    secondsLeft,
    progressPercent,
    acceptRequest,
    rejectRequest,
    triggerManualRequest: triggerNewRequest,
    requestHistory,
  };
}
