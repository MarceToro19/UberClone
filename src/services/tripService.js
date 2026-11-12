import {
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  collection,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebaseConfig';

const TRIPS_COLLECTION = 'trips';

function getTripTimestampMs(trip) {
  const raw = trip?.paidAt || trip?.completedAt || trip?.cancelledAt || trip?.startedAt;
  if (!raw) return 0;
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function createTripRecord(tripData) {
  if (!isFirebaseConfigured || !db || !tripData?.id) {
    return false;
  }

  await setDoc(doc(db, TRIPS_COLLECTION, tripData.id), {
    ...tripData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return true;
}

export async function updateTripRecord(tripId, patchData) {
  if (!isFirebaseConfigured || !db || !tripId) {
    return false;
  }

  await setDoc(
    doc(db, TRIPS_COLLECTION, tripId),
    {
      ...patchData,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return true;
}

export async function fetchDriverTrips(driverId) {
  if (!isFirebaseConfigured || !db || !driverId) {
    return [];
  }

  const q = query(collection(db, TRIPS_COLLECTION), where('driverId', '==', driverId));
  const snapshot = await getDocs(q);
  const items = [];
  snapshot.forEach((docSnap) => {
    items.push({ id: docSnap.id, ...docSnap.data() });
  });

  return items.sort((a, b) => getTripTimestampMs(b) - getTripTimestampMs(a));
}

export function subscribeToDriverTrips(driverId, onUpdate, onError) {
  if (!isFirebaseConfigured || !db || !driverId) {
    return () => {};
  }

  const q = query(collection(db, TRIPS_COLLECTION), where('driverId', '==', driverId));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      items.sort((a, b) => getTripTimestampMs(b) - getTripTimestampMs(a));
      if (onUpdate) {
        onUpdate(items);
      }
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
}

