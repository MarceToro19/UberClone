import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebaseConfig';

const DRIVER_LOCATIONS_COLLECTION = 'driver_locations';

export async function syncDriverLocation(driverId, locationData, options = {}) {
  if (!isFirebaseConfigured || !db || !driverId || !locationData) {
    return false;
  }

  const latitude = Number(locationData.latitude);
  const longitude = Number(locationData.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return false;
  }

  await setDoc(
    doc(db, DRIVER_LOCATIONS_COLLECTION, driverId),
    {
      driverId,
      latitude,
      longitude,
      heading: Number(locationData.heading) || 0,
      speed: Number(locationData.speed) || 0,
      isAvailable: Boolean(options.isAvailable),
      category: options.category || null,
      activeTripId: options.activeTripId || null,
      clientTimestamp: locationData.timestamp || Date.now(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return true;
}

export async function markDriverLocationOffline(driverId) {
  if (!isFirebaseConfigured || !db || !driverId) {
    return false;
  }

  await setDoc(
    doc(db, DRIVER_LOCATIONS_COLLECTION, driverId),
    {
      driverId,
      isAvailable: false,
      activeTripId: null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return true;
}

