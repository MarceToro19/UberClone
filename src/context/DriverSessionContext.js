import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import useAlmacenamiento from '../hooks/useAlmacenamiento';
import { DRIVER_STATUS } from '../config/pricing';

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
  const [isAvailable, setIsAvailable] = useAlmacenamiento('@driver_is_available', false);
  const [balance, setBalance] = useAlmacenamiento('@driver_balance', 0);

  const [registerForm, setRegisterForm] = useState(INITIAL_REGISTER_FORM);

  const updateFormTab = (tab, data) => {
    setRegisterForm((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        ...data,
      },
    }));
  };

  const submitRegistration = () => {
    const newProfile = {
      ...registerForm,
      id: 'driver_' + Date.now(),
      registeredAt: new Date().toISOString(),
    };
    setDriverProfile(newProfile);
    setApprovalStatus(DRIVER_STATUS.PENDING_APPROVAL);
    setIsAvailable(false);
  };

  const simulateToggleApproval = () => {
    const nextStatus =
      approvalStatus === DRIVER_STATUS.APPROVED
        ? DRIVER_STATUS.PENDING_APPROVAL
        : DRIVER_STATUS.APPROVED;
    setApprovalStatus(nextStatus);
    if (nextStatus !== DRIVER_STATUS.APPROVED) {
      setIsAvailable(false);
    }
  };

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
      isRegistered: !!driverProfile,
      isApproved: approvalStatus === DRIVER_STATUS.APPROVED,
    }),
    [driverProfile, approvalStatus, isAvailable, balance, registerForm]
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
