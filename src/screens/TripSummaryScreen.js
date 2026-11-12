import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDriverSession } from '../context/DriverSessionContext';
import { useActiveTrip } from '../context/ActiveTripContext';
import { colors, spacing, radius, typography } from '../theme';

export default function TripSummaryScreen({ onFinishSummary }) {
  const insets = useSafeAreaInsets();
  const { balance, setBalance } = useDriverSession();
  const { activeTrip, updateTripStatus, clearActiveTrip } = useActiveTrip();

  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const finishTimeoutRef = useRef(null);
  const confirmHandlerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (finishTimeoutRef.current) {
        clearTimeout(finishTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!activeTrip?.autoSimulate || paymentConfirmed) {
      return undefined;
    }

    const autoTimer = setTimeout(() => {
      if (confirmHandlerRef.current) {
        confirmHandlerRef.current();
      }
    }, 1500);

    return () => clearTimeout(autoTimer);
  }, [activeTrip?.id, activeTrip?.autoSimulate, paymentConfirmed]);

  if (!activeTrip) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top + spacing.xl }]}>
        <Ionicons name="receipt-outline" size={60} color={colors.textoSuave} />
        <Text style={styles.emptyTitle}>No hay resumen disponible</Text>
        <TouchableOpacity style={styles.doneButton} onPress={onFinishSummary}>
          <Text style={styles.doneButtonText}>Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { passenger, pickup, destination, pricing, paymentMethod, category, distanceKm } = activeTrip;
  const isCash = paymentMethod === 'cash';

  const baseNet = pricing?.gananciaNeta || 0;
  const finalDriverEarnings = baseNet + tipAmount;
  const totalCustomerFare = (pricing?.tarifaBruta || 0) + tipAmount;
  const commission = pricing?.comision || 0;

  const handleConfirmAndClose = async () => {
    if (paymentConfirmed) return;
    setPaymentConfirmed(true);

    const balanceDelta = isCash ? -commission : finalDriverEarnings;
    const nextBalance = (balance || 0) + balanceDelta;
    await setBalance(nextBalance);

    await updateTripStatus('paid', {
      paidAt: new Date().toISOString(),
      balanceDelta,
      finalEarnings: finalDriverEarnings,
      tipAmount,
      commissionAmount: commission,
    });

    finishTimeoutRef.current = setTimeout(() => {
      clearActiveTrip();
      if (onFinishSummary) {
        onFinishSummary();
      }
    }, 600);
  };

  confirmHandlerRef.current = handleConfirmAndClose;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 24) + spacing.md }]}
    >
      <View style={styles.successHeader}>
        <View style={styles.checkIconBox}>
          <Ionicons name="checkmark-done" size={32} color={colors.fondo} />
        </View>
        <Text style={styles.title}>Viaje Finalizado</Text>
        <Text style={styles.subtitle}>Resumen financiero y estado de pago</Text>
      </View>

      <View style={styles.earningsCard}>
        <Text style={styles.earningsLabel}>TU GANANCIA NETA</Text>
        <Text style={styles.earningsAmount}>
          ${finalDriverEarnings.toLocaleString('es-CO')} COP
        </Text>
        <View style={styles.earningsStatusPill}>
          <Ionicons
            name={isCash ? 'cash-outline' : 'card-outline'}
            size={14}
            color={colors.primario}
          />
          <Text style={styles.earningsStatusText}>
            {isCash ? 'Cobro en Efectivo directo' : 'Pago por Mercado Pago'}
          </Text>
        </View>
      </View>

      <View style={styles.breakdownCard}>
        <Text style={styles.cardSectionTitle}>Desglose de Tarifa</Text>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Tarifa Bruta del Pasajero</Text>
          <Text style={styles.breakdownValue}>${(pricing?.tarifaBruta || 0).toLocaleString('es-CO')} COP</Text>
        </View>

        {tipAmount > 0 && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Propina voluntaria</Text>
            <Text style={[styles.breakdownValue, { color: colors.primario }]}>
              +${tipAmount.toLocaleString('es-CO')} COP
            </Text>
          </View>
        )}

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Comisión Plataforma (20%)</Text>
          <Text style={[styles.breakdownValue, { color: colors.peligro }]}>
            -${commission.toLocaleString('es-CO')} COP
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownTotalLabel}>Total a Recibir (Ganancia)</Text>
          <Text style={styles.breakdownTotalValue}>${finalDriverEarnings.toLocaleString('es-CO')} COP</Text>
        </View>
      </View>

      <View style={styles.balanceImpactCard}>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={isCash ? colors.advertencia : colors.primario}
        />
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={styles.impactTitle}>
            {isCash ? 'Efectivo recibido en mano' : 'Acreditado a tu saldo'}
          </Text>
          <Text style={styles.impactDesc}>
            {isCash
              ? `Debes cobrar $${totalCustomerFare.toLocaleString('es-CO')} COP al pasajero. La comisión de $${commission.toLocaleString('es-CO')} COP se descontará de tu saldo interno en la app.`
              : `El pasajero pagó con tarjeta/Mercado Pago. Tus ganancias netas de $${finalDriverEarnings.toLocaleString('es-CO')} COP se sumarán a tu saldo en la app.`}
          </Text>
        </View>
      </View>

      <View style={styles.tripDetailsCard}>
        <Text style={styles.cardSectionTitle}>Datos del Viaje</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Pasajero:</Text>
          <Text style={styles.infoVal}>{passenger?.name || 'Pasajero'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Categoría:</Text>
          <Text style={styles.infoVal}>{category}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Distancia:</Text>
          <Text style={styles.infoVal}>{distanceKm} km</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Recogida:</Text>
          <Text style={styles.infoVal} numberOfLines={1}>{pickup?.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Destino:</Text>
          <Text style={styles.infoVal} numberOfLines={1}>{destination?.address}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={handleConfirmAndClose}
        disabled={paymentConfirmed}
        activeOpacity={0.85}
      >
        <Ionicons name="checkmark-circle-outline" size={22} color={colors.fondo} style={{ marginRight: spacing.xs }} />
        <Text style={styles.doneButtonText}>
          {paymentConfirmed ? 'Registrando Cobro...' : isCash ? 'Confirmar Dinero Recibido' : 'Finalizar y Continuar'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
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
  successHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  checkIconBox: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primario,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.texto,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.sm,
    marginTop: 2,
  },
  earningsCard: {
    backgroundColor: colors.superficie,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  earningsLabel: {
    color: colors.primario,
    fontSize: typography.tamanios.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  earningsAmount: {
    color: colors.texto,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: spacing.xs,
  },
  earningsStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.superficieClara,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    gap: 6,
    marginTop: spacing.xs,
  },
  earningsStatusText: {
    color: colors.texto,
    fontSize: typography.tamanios.xs,
    fontWeight: '600',
  },
  breakdownCard: {
    backgroundColor: colors.superficie,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  cardSectionTitle: {
    color: colors.texto,
    fontSize: typography.tamanios.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  breakdownLabel: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.sm,
  },
  breakdownValue: {
    color: colors.texto,
    fontSize: typography.tamanios.sm,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borde,
    marginVertical: spacing.xs,
  },
  breakdownTotalLabel: {
    color: colors.texto,
    fontSize: typography.tamanios.sm,
    fontWeight: '800',
  },
  breakdownTotalValue: {
    color: colors.primario,
    fontSize: typography.tamanios.md,
    fontWeight: '800',
  },
  balanceImpactCard: {
    flexDirection: 'row',
    backgroundColor: colors.superficieClara,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primario,
  },
  impactTitle: {
    color: colors.texto,
    fontSize: typography.tamanios.sm,
    fontWeight: '700',
  },
  impactDesc: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
    lineHeight: 18,
    marginTop: 2,
  },
  tripDetailsCard: {
    backgroundColor: colors.superficie,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoKey: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
  },
  infoVal: {
    color: colors.texto,
    fontSize: typography.tamanios.xs,
    fontWeight: '600',
    maxWidth: '70%',
    textAlign: 'right',
  },
  doneButton: {
    backgroundColor: colors.primario,
    height: 52,
    borderRadius: radius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  doneButtonText: {
    color: colors.fondo,
    fontSize: typography.tamanios.md,
    fontWeight: '800',
  },
});
