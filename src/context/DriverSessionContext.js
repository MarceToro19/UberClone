import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import useAlmacenamiento from '../hooks/useAlmacenamiento';
import { DRIVER_STATUS } from '../config/pricing';
import { uploadDriverPhotos } from '../services/cloudinaryService';
import {
  saveDriverRegistration,
  updateDriverFields,
  subscribeToDriverProfile,
} from '../services/driverService';

export const DriverSessionContext = createContext(null);

export const INITIAL_REGISTER_FORM = {
  personal: {
    photoUri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    fullName: '',
    documentId: '',
    phone: '',
    birthDate: '1995-05-15',
    gender: 'M',
    email: '',
    language: 'es',
  },
  vehicle: {
    category: 'economy',
    plate: '',
    brandModel: '',
    year: '2022',
    color: 'Blanco',
    capacity: '4',
    vehiclePhotoUri: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400',
  },
  documents: {
    licenseNumber: '',
    licensePhotoUri: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=300',
    licenseExpiry: '2028-12-31',
    soatPhotoUri: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300',
    soatExpiry: '2027-11-20',
    tecnoPhotoUri: '',
    tecnoExpiry: '',
    mercadoPagoEmail: '',
    termsAccepted: false,
  },
};

export function DriverSessionProvider({ children }) {
  const [driverProfile, setDriverProfile] = useAlmacenamiento('@driver_profile', null);
  const [approvalStatus, setApprovalStatus] = useAlmacenamiento('@driver_approval_status', DRIVER_STATUS.PENDING_APPROVAL);
  const [isAvailable, setIsAvailableLocal] = useAlmacenamiento('@driver_is_available', false);
  const [balance, setBalanceLocal] = useAlmacenamiento('@driver_balance', 0);

  const [registerForm, setRegisterForm] = useState(INITIAL_REGISTER_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const latestRef = useRef({ approvalStatus, isAvailable, balance });
  latestRef.current = { approvalStatus, isAvailable, balance };

  useEffect(() => {
    const driverId = driverProfile?.id;
    if (!driverId) return;

    const unsubscribe = subscribeToDriverProfile(
      driverId,
      (remoteDriver) => {
        const current = latestRef.current;

        if (remoteDriver.approvalStatus && remoteDriver.approvalStatus !== current.approvalStatus) {
          setApprovalStatus(remoteDriver.approvalStatus);
        }

        if (remoteDriver.approvalStatus && remoteDriver.approvalStatus !== DRIVER_STATUS.APPROVED) {
          if (current.isAvailable) {
            setIsAvailableLocal(false);
          }
        } else if (typeof remoteDriver.isAvailable === 'boolean' && remoteDriver.isAvailable !== current.isAvailable) {
          setIsAvailableLocal(remoteDriver.isAvailable);
        }

        if (typeof remoteDriver.balance === 'number' && remoteDriver.balance !== current.balance) {
          setBalanceLocal(remoteDriver.balance);
        }
      },
      (error) => {
        console.warn('Error escuchando perfil del conductor en Firestore:', error.message);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [driverProfile?.id, setApprovalStatus, setIsAvailableLocal, setBalanceLocal]);

  const updateFormTab = useCallback((tab, data) => {
    setRegisterForm((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        ...data,
      },
    }));
  }, []);

  const setIsAvailable = useCallback(
    async (nextValue) => {
      setIsAvailableLocal(nextValue);
      if (driverProfile?.id) {
        try {
          await updateDriverFields(driverProfile.id, { isAvailable: nextValue });
        } catch (error) {
          console.warn('Error actualizando disponibilidad en Firestore:', error.message);
        }
      }
    },
    [driverProfile?.id, setIsAvailableLocal]
  );

  const setBalance = useCallback(
    async (nextBalance) => {
      setBalanceLocal(nextBalance);
      if (driverProfile?.id) {
        try {
          await updateDriverFields(driverProfile.id, { balance: nextBalance });
        } catch (error) {
          console.warn('Error actualizando saldo en Firestore:', error.message);
        }
      }
    },
    [driverProfile?.id, setBalanceLocal]
  );

  const submitRegistration = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const formWithUrls = await uploadDriverPhotos(registerForm);
      const newProfile = {
        ...formWithUrls,
        id: 'driver_' + Date.now(),
        registeredAt: new Date().toISOString(),
      };

      await setDriverProfile(newProfile);
      await setApprovalStatus(DRIVER_STATUS.PENDING_APPROVAL);
      await setIsAvailableLocal(false);
      await setBalanceLocal(0);

      try {
        await saveDriverRegistration(newProfile.id, newProfile);
      } catch (error) {
        console.warn('Error guardando conductor en Firestore:', error.message);
      }

      return newProfile;
    } finally {
      setIsSubmitting(false);
    }
  }, [registerForm, setDriverProfile, setApprovalStatus, setIsAvailableLocal, setBalanceLocal]);

  const simulateToggleApproval = useCallback(async () => {
    const nextStatus =
      approvalStatus === DRIVER_STATUS.APPROVED
        ? DRIVER_STATUS.PENDING_APPROVAL
        : DRIVER_STATUS.APPROVED;

    setApprovalStatus(nextStatus);
    const updates = { approvalStatus: nextStatus };

    if (nextStatus !== DRIVER_STATUS.APPROVED) {
      setIsAvailableLocal(false);
      updates.isAvailable = false;
    }

    if (driverProfile?.id) {
      try {
        await updateDriverFields(driverProfile.id, updates);
      } catch (error) {
        console.warn('Error simulando aprobación en Firestore:', error.message);
      }
    }
  }, [approvalStatus, driverProfile?.id, setApprovalStatus, setIsAvailableLocal]);

  const value = useMemo(
    () => ({
      driverProfile,
      approvalStatus,
      isAvailable,
      setIsAvailable,
      balance,
      setBalance,
      registerForm,
      updateFormTab,
      submitRegistration,
      simulateToggleApproval,
      isSubmitting,
      isRegistered: !!driverProfile,
      isApproved: approvalStatus === DRIVER_STATUS.APPROVED,
    }),
    [
      driverProfile,
      approvalStatus,
      isAvailable,
      setIsAvailable,
      balance,
      setBalance,
      registerForm,
      updateFormTab,
      submitRegistration,
      simulateToggleApproval,
      isSubmitting,
    ]
  );

  return (
    <DriverSessionContext.Provider value={value}>
      {children}
    </DriverSessionContext.Provider>
  );
}

export function useDriverSession() {
  const context = useContext(DriverSessionContext);
  if (!context) {
    throw new Error('useDriverSession debe usarse dentro de un DriverSessionProvider');
  }
  return context;
}
