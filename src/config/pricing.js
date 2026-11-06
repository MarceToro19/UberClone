export const PRICING_CONFIG = {
  tarifaBase: 3500,
  valorPorKm: 1200,
  valorPorMinuto: 250,
  tarifaMinima: 6000,
  comisionPorcentaje: 0.20
};

export const CATEGORY_MULTIPLIERS = {
  economy: { id: 'economy', label: 'Económico', multiplier: 1.0, minPassengers: 1 },
  xl: { id: 'xl', label: 'XL', multiplier: 1.4, minPassengers: 6 },
  premium: { id: 'premium', label: 'Premium', multiplier: 1.8, minPassengers: 1 },
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  MERCADOPAGO: 'mercadopago',
  STRIPE: 'stripe',
};

export const TRIP_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  DRIVER_ARRIVING: 'driver_arriving',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PAID: 'paid',
  CANCELLED: 'cancelled',
};

export const DRIVER_STATUS = {
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};
