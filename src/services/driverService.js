import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebaseConfig';
import { DRIVER_STATUS } from '../config/pricing';

const DRIVERS_COLLECTION = 'drivers';

export async function saveDriverRegistration(driverId, profileData) {
  if (!isFirebaseConfigured || !db || !driverId) return false;

  await setDoc(doc(db, DRIVERS_COLLECTION, driverId), {
    id: driverId,
    personal: profileData.personal,
    vehicle: profileData.vehicle,
    documents: profileData.documents,
    approvalStatus: DRIVER_STATUS.PENDING_APPROVAL,
    isAvailable: false,
    balance: 0,
    registeredAt: profileData.registeredAt || new Date().toISOString(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return true;
}

export async function updateDriverFields(driverId, fields) {
  if (!isFirebaseConfigured || !db || !driverId) return false;

  await updateDoc(doc(db, DRIVERS_COLLECTION, driverId), {
    ...fields,
    updatedAt: serverTimestamp(),
  });

  return true;
}

export function subscribeToDriverProfile(driverId, onUpdate, onError) {
  if (!isFirebaseConfigured || !db || !driverId) {
    return () => {};
  }

  return onSnapshot(
    doc(db, DRIVERS_COLLECTION, driverId),
    (snapshot) => {
      if (snapshot.exists() && onUpdate) {
        onUpdate({ id: snapshot.id, ...snapshot.data() });
      }
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
}

