import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDriverSession } from '../context/DriverSessionContext';
import { fetchDriverTrips, subscribeToDriverTrips } from '../services/tripService';

function resolveTripDate(trip) {
  const raw = trip?.paidAt || trip?.completedAt || trip?.cancelledAt || trip?.startedAt;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getTripNetAmount(trip) {
  if (typeof trip?.finalEarnings === 'number') return trip.finalEarnings;
  return trip?.pricing?.gananciaNeta || 0;
}

export default function useEarnings() {
  const { driverProfile } = useDriverSession();
  const driverId = driverProfile?.id || null;

  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(driverId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!driverId) {
      setTrips([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToDriverTrips(
      driverId,
      (remoteTrips) => {
        setTrips(remoteTrips);
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [driverId]);

  const refreshTrips = useCallback(async () => {
    if (!driverId) return;
    setIsLoading(true);
    try {
      const remoteTrips = await fetchDriverTrips(driverId);
      setTrips(remoteTrips);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [driverId]);

  const completedTrips = useMemo(
    () => trips.filter((t) => t.status === 'paid' || t.status === 'completed'),
    [trips]
  );

  const summary = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfToday - 6 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const acc = {
      day: { amount: 0, count: 0 },
      week: { amount: 0, count: 0 },
      month: { amount: 0, count: 0 },
      totalGross: 0,
      totalNet: 0,
      totalCommission: 0,
      totalTips: 0,
      cashCount: 0,
      gatewayCount: 0,
      cancelledCount: trips.filter((t) => t.status === 'cancelled').length,
    };

    completedTrips.forEach((trip) => {
      const net = getTripNetAmount(trip);
      const gross = trip?.pricing?.tarifaBruta || 0;
      const commission = trip?.commissionAmount ?? trip?.pricing?.comision ?? 0;
      const tip = trip?.tipAmount || 0;

      acc.totalNet += net;
      acc.totalGross += gross;
      acc.totalCommission += commission;
      acc.totalTips += tip;

      if (trip.paymentMethod === 'cash') {
        acc.cashCount += 1;
      } else {
        acc.gatewayCount += 1;
      }

      const tripDate = resolveTripDate(trip);
      if (tripDate) {
        const ms = tripDate.getTime();
        if (ms >= startOfToday) {
          acc.day.amount += net;
          acc.day.count += 1;
        }
        if (ms >= startOfWeek) {
          acc.week.amount += net;
          acc.week.count += 1;
        }
        if (ms >= startOfMonth) {
          acc.month.amount += net;
          acc.month.count += 1;
        }
      }
    });

    return acc;
  }, [trips, completedTrips]);

  return {
    trips,
    completedTrips,
    summary,
    isLoading,
    error,
    refreshTrips,
  };
}

