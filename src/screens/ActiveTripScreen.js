import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveTrip } from '../context/ActiveTripContext';
import DriverMapView from '../components/DriverMapView';
import { colors, spacing, radius, typography } from '../theme';

export default function ActiveTripScreen({ onTripFinished, onCancelToHome }) {
  const insets = useSafeAreaInsets();
  const { activeTrip, updateTripStatus, cancelActiveTrip } = useActiveTrip();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const timerRef = useRef(null);

  const statusSteps = useMemo(
    () => [
      { key: 'accepted', label: 'En camino a recogida', icon: 'navigate' },
      { key: 'driver_arriving', label: 'Llegada al punto', icon: 'location' },
      { key: 'in_progress', label: 'En viaje a destino', icon: 'car-sport' },
      { key: 'completed', label: 'Viaje finalizado', icon: 'checkmark-done' },
    ],
    []
  );

  const currentStatus = activeTrip?.status || 'accepted';

  useEffect(() => {
    const idx = statusSteps.findIndex((s) => s.key === currentStatus);
    if (idx !== -1) {
      setCurrentStepIndex(idx);
    }
  }, [currentStatus, statusSteps]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextStatus = useCallback(() => {
    if (currentStatus === 'accepted') {
      updateTripStatus('driver_arriving');
    } else if (currentStatus === 'driver_arriving') {
      updateTripStatus('in_progress');
    } else if (currentStatus === 'in_progress') {
      updateTripStatus('completed', { completedAt: new Date().toISOString(), durationSeconds: elapsedSeconds });
      if (onTripFinished) {
        onTripFinished(activeTrip);
      }
    }
  }, [currentStatus, updateTripStatus, elapsedSeconds, activeTrip, onTripFinished]);

  const handleCancelTrip = useCallback(() => {
    if (currentStatus === 'in_progress' || currentStatus === 'completed') {
      return;
    }
    cancelActiveTrip('Conductor canceló antes del abordaje');
    if (onCancelToHome) {
      onCancelToHome();
    }
  }, [currentStatus, cancelActiveTrip, onCancelToHome]);

  if (!activeTrip) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top + spacing.xl }]}>
        <Ionicons name="car-outline" size={60} color={colors.textoSuave} />
        <Text style={styles.emptyTitle}>No hay un viaje activo</Text>
        <TouchableOpacity style={styles.backButton} onPress={onCancelToHome}>
          <Text style={styles.backButtonText}>Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { passenger, pickup, destination, pricing, category, distanceKm } = activeTrip;

  let actionButtonLabel = 'Notificar Llegada';
  let actionButtonColor = colors.primario;
  let actionIcon = 'location-outline';

  if (currentStatus === 'driver_arriving') {
    actionButtonLabel = 'Iniciar Viaje (Pasajero a Bordo)';
    actionButtonColor = colors.exito;
    actionIcon = 'play-outline';
  } else if (currentStatus === 'in_progress') {
    actionButtonLabel = 'Completar Viaje';
    actionButtonColor = colors.primario;
    actionIcon = 'flag-outline';
  }

  const canCancel = currentStatus === 'accepted' || currentStatus === 'driver_arriving';

  return (
    <View style={styles.container}>
      <DriverMapView
        location={{
          coords: {
            latitude: currentStatus === 'in_progress' ? destination?.latitude : pickup?.latitude,
            longitude: currentStatus === 'in_progress' ? destination?.longitude : pickup?.longitude,
            heading: 90,
            speed: 35,
          },
        }}
        isTracking={true}
        isAvailable={true}
      />

      <View style={[styles.floatingHeader, { top: Math.max(insets.top, 24) + spacing.xs }]}>
        <View style={styles.timerBadge}>
          <Ionicons name="time-outline" size={16} color={colors.primario} />
          <Text style={styles.timerText}>{formatTimer(elapsedSeconds)}</Text>
        </View>

        <View style={styles.categoryBadge}>
          <Ionicons name="car-sport" size={14} color={colors.texto} />
          <Text style={styles.categoryBadgeText}>{category || 'Económico'}</Text>
        </View>

        <View style={styles.fareMiniBadge}>
          <Text style={styles.fareMiniText}>
            ${(pricing?.gananciaNeta || 0).toLocaleString('es-CO')} COP
          </Text>
        </View>
      </View>

      <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <View style={styles.stepsBar}>
          {statusSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <View key={step.key} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                    isCurrent && styles.stepCircleCurrent,
                  ]}
                >
                  <Ionicons
                    name={isCompleted ? 'checkmark' : step.icon}
                    size={12}
                    color={isCompleted || isCurrent ? colors.fondo : colors.textoSuave}
                  />
                </View>
                {idx < statusSteps.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      isCompleted && styles.stepConnectorActive,
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.passengerCard}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color={colors.texto} />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.passengerName}>{passenger?.name || 'Pasajero'}</Text>
            <View style={styles.passengerRatingRow}>
              <Ionicons name="star" size={14} color={colors.alerta} />
              <Text style={styles.ratingNumber}>{passenger?.rating || '5.0'}</Text>
              <Text style={styles.paymentMethodText}>
                • Pago: {activeTrip?.paymentMethod === 'cash' ? 'Efectivo' : 'Mercado Pago'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionCircleButton}
            onPress={() => Alert.alert('Llamada', `Llamando a ${passenger?.name}...`)}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={18} color={colors.primario} />
          </TouchableOpacity>
        </View>

        <View style={styles.destinationCard}>
          <View style={styles.targetIconBox}>
            <Ionicons
              name={currentStatus === 'in_progress' ? 'flag' : 'navigate'}
              size={18}
              color={colors.blanco}
            />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.targetLabel}>
              {currentStatus === 'in_progress' ? 'DESTINO FINAL' : 'PUNTO DE RECOGIDA'}
            </Text>
            <Text style={styles.targetAddress} numberOfLines={2}>
              {currentStatus === 'in_progress' ? destination?.address : pickup?.address}
            </Text>
            <Text style={styles.targetSub}>
              Distancia total: {distanceKm} km • Tiempo aprox: {activeTrip?.estimatedMinutes} min
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.mainActionButton, { backgroundColor: actionButtonColor }]}
          onPress={handleNextStatus}
          activeOpacity={0.85}
        >
          <Ionicons name={actionIcon} size={22} color={colors.fondo} style={{ marginRight: spacing.xs }} />
          <Text style={styles.mainActionButtonText}>{actionButtonLabel}</Text>
        </TouchableOpacity>

        {canCancel && (
          <TouchableOpacity
            style={styles.cancelTripButton}
            onPress={handleCancelTrip}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={18} color={colors.peligro} />
            <Text style={styles.cancelTripText}>Cancelar este viaje</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.fondo,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primario,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  backButtonText: {
    color: colors.fondo,
    fontWeight: '700',
  },
  floatingHeader: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borde,
    gap: 6,
  },
  timerText: {
    color: colors.texto,
    fontSize: typography.tamanios.sm,
    fontWeight: '800',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borde,
    gap: 6,
  },
  categoryBadgeText: {
    color: colors.texto,
    fontSize: typography.tamanios.xs,
    fontWeight: '700',
  },
  fareMiniBadge: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primario,
  },
  fareMiniText: {
    color: colors.primario,
    fontSize: typography.tamanios.xs,
    fontWeight: '800',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.superficie,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borde,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 12,
  },
  stepsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.superficieClara,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borde,
  },
  stepCircleCompleted: {
    backgroundColor: colors.exito,
    borderColor: colors.exito,
  },
  stepCircleCurrent: {
    backgroundColor: colors.primario,
    borderColor: colors.primario,
  },
  stepConnector: {
    width: 50,
    height: 2,
    backgroundColor: colors.borde,
    marginHorizontal: 4,
  },
  stepConnectorActive: {
    backgroundColor: colors.exito,
  },
  passengerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.superficieClara,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.superficie,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerName: {
    color: colors.texto,
    fontSize: typography.tamanios.md,
    fontWeight: '700',
  },
  passengerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  ratingNumber: {
    color: colors.texto,
    fontSize: typography.tamanios.xs,
    fontWeight: '600',
  },
  paymentMethodText: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
  },
  actionCircleButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.superficie,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borde,
  },
  destinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.superficieClara,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  targetIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primarioOscuro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetLabel: {
    color: colors.primario,
    fontSize: typography.tamanios.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  targetAddress: {
    color: colors.texto,
    fontSize: typography.tamanios.sm,
    fontWeight: '600',
    marginTop: 2,
  },
  targetSub: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
    marginTop: 2,
  },
  mainActionButton: {
    height: 52,
    borderRadius: radius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainActionButtonText: {
    color: colors.fondo,
    fontSize: typography.tamanios.md,
    fontWeight: '800',
  },
  cancelTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    gap: 4,
  },
  cancelTripText: {
    color: colors.peligro,
    fontSize: typography.tamanios.sm,
    fontWeight: '600',
  },
});
