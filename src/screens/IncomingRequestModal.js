import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';

export default function IncomingRequestModal({
  visible = false,
  request = null,
  secondsLeft = 15,
  progressPercent = 100,
  onAccept,
  onReject,
}) {
  if (!visible || !request) return null;

  const { passenger, pickup, destination, distanceKm, estimatedMinutes, pricing, category } = request;
  const isUrgent = secondsLeft <= 5;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onReject}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${Math.max(0, Math.min(100, progressPercent))}%` },
                isUrgent && styles.progressBarUrgent,
              ]}
            />
          </View>

          <View style={styles.headerRow}>
            <View style={styles.categoryBadge}>
              <Ionicons name="car-sport" size={14} color={colors.primario} />
              <Text style={styles.categoryText}>
                {category?.toUpperCase() || 'ECONÓMICO'}
              </Text>
            </View>

            <View style={[styles.timerBadge, isUrgent && styles.timerBadgeUrgent]}>
              <Ionicons
                name="timer-outline"
                size={16}
                color={isUrgent ? colors.peligro : colors.texto}
              />
              <Text style={[styles.timerText, isUrgent && styles.timerTextUrgent]}>
                {secondsLeft}s
              </Text>
            </View>
          </View>

          <View style={styles.earningsBox}>
            <Text style={styles.earningsSub}>GANANCIA ESTIMADA (NETA)</Text>
            <Text style={styles.earningsMain}>
              ${(pricing?.gananciaNeta || 0).toLocaleString('es-CO')} COP
            </Text>
            <View style={styles.earningsDetailsRow}>
              <Text style={styles.earningsDetailText}>
                Tarifa total: ${(pricing?.tarifaBruta || 0).toLocaleString('es-CO')}
              </Text>
              <Text style={styles.earningsDivider}>•</Text>
              <Text style={styles.earningsDetailText}>
                Comisión app: -${(pricing?.comision || 0).toLocaleString('es-CO')}
              </Text>
            </View>
          </View>

          <View style={styles.passengerRow}>
            {passenger?.avatar ? (
              <Image source={{ uri: passenger.avatar }} style={styles.passengerAvatar} />
            ) : (
              <View style={[styles.passengerAvatar, styles.passengerAvatarPlaceholder]}>
                <Ionicons name="person" size={24} color={colors.texto} />
              </View>
            )}
            <View style={styles.passengerInfo}>
              <Text style={styles.passengerName}>{passenger?.name || 'Pasajero'}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={colors.alerta} />
                <Text style={styles.ratingText}>{passenger?.rating || '5.0'}</Text>
                <Text style={styles.tripsCountText}>({passenger?.tripsCount || 0} viajes)</Text>
              </View>
            </View>
            <View style={styles.tripMetrics}>
              <Text style={styles.metricValue}>{distanceKm} km</Text>
              <Text style={styles.metricLabel}>{estimatedMinutes} min</Text>
            </View>
          </View>

          <View style={styles.routeContainer}>
            <View style={styles.routeTimeline}>
              <View style={styles.dotOrigin} />
              <View style={styles.routeLine} />
              <View style={styles.dotDestination} />
            </View>

            <View style={styles.routeAddresses}>
              <View style={styles.addressBlock}>
                <Text style={styles.addressLabel}>PUNTO DE RECOGIDA</Text>
                <Text style={styles.addressText} numberOfLines={2}>
                  {pickup?.address}
                </Text>
              </View>

              <View style={[styles.addressBlock, { marginTop: spacing.md }]}>
                <Text style={styles.addressLabel}>DESTINO FINAL</Text>
                <Text style={styles.addressText} numberOfLines={2}>
                  {destination?.address}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={onReject}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={22} color={colors.peligro} />
              <Text style={styles.rejectButtonText}>Rechazar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptButton}
              onPress={onAccept}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={24} color={colors.fondo} />
              <Text style={styles.acceptButtonText}>Aceptar Viaje</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.superficie,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borde,
  },
  progressTrack: {
    height: 5,
    backgroundColor: colors.superficieClara,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primario,
    borderRadius: radius.full,
  },
  progressBarUrgent: {
    backgroundColor: colors.peligro,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 179, 0, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    gap: 6,
  },
  categoryText: {
    color: colors.primario,
    fontSize: typography.tamanios.sm,
    fontWeight: '700',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.superficieClara,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 4,
  },
  timerBadgeUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: colors.peligro,
  },
  timerText: {
    color: colors.texto,
    fontSize: typography.tamanios.sm,
    fontWeight: '700',
  },
  timerTextUrgent: {
    color: colors.peligro,
  },
  earningsBox: {
    backgroundColor: colors.superficieClara,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  earningsSub: {
    color: colors.primario,
    fontSize: typography.tamanios.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  earningsMain: {
    color: colors.texto,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  earningsDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  earningsDetailText: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
  },
  earningsDivider: {
    color: colors.textoSuave,
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
  },
  passengerAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
  },
  passengerAvatarPlaceholder: {
    backgroundColor: colors.superficieClara,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  passengerName: {
    color: colors.texto,
    fontSize: typography.tamanios.lg,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  ratingText: {
    color: colors.texto,
    fontSize: typography.tamanios.sm,
    fontWeight: '600',
  },
  tripsCountText: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
  },
  tripMetrics: {
    alignItems: 'flex-end',
  },
  metricValue: {
    color: colors.primario,
    fontSize: typography.tamanios.md,
    fontWeight: '700',
  },
  metricLabel: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
  },
  routeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.superficieClara,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  routeTimeline: {
    width: 16,
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 4,
  },
  dotOrigin: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.exito,
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.borde,
    marginVertical: 4,
  },
  dotDestination: {
    width: 10,
    height: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.peligro,
  },
  routeAddresses: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  addressBlock: {},
  addressLabel: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
    fontWeight: '600',
    marginBottom: 2,
  },
  addressText: {
    color: colors.texto,
    fontSize: typography.tamanios.sm,
    fontWeight: '500',
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 6,
  },
  rejectButtonText: {
    color: colors.peligro,
    fontSize: typography.tamanios.md,
    fontWeight: '700',
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primario,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: 8,
  },
  acceptButtonText: {
    color: colors.fondo,
    fontSize: typography.tamanios.md,
    fontWeight: '800',
  },
});
