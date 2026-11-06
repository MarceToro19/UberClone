import { useState, useEffect, useRef, useCallback } from 'react';
import { MOCK_TRIP_REQUESTS, buildTripRequestWithPricing } from '../data/mockTripRequests';

const REQUEST_TIMEOUT_SECONDS = 15;

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

  const clearCountdown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearSimulationTimer = useCallback(() => {
    if (simulationTimerRef.current) {
      clearTimeout(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
  }, []);

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

  const triggerNewRequest = useCallback(() => {
    if (!isAvailable || hasActiveTrip || currentRequest) return;

    const raw = MOCK_TRIP_REQUESTS[requestIndexRef.current % MOCK_TRIP_REQUESTS.length];
    requestIndexRef.current += 1;

    const enriched = buildTripRequestWithPricing(raw, driverCategory);
    setCurrentRequest(enriched);
    setSecondsLeft(REQUEST_TIMEOUT_SECONDS);
  }, [isAvailable, hasActiveTrip, currentRequest, driverCategory]);

  useEffect(() => {
    if (!currentRequest) return;

    clearCountdown();
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
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

  useEffect(() => {
    if (!isAvailable || hasActiveTrip) {
      clearCountdown();
      clearSimulationTimer();
      setCurrentRequest(null);
      return;
    }

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
