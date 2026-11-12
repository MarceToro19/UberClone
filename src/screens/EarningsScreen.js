import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDriverSession } from '../context/DriverSessionContext';
import useEarnings from '../hooks/useEarnings';
import { colors, spacing, radius, typography } from '../theme';

function formatCop(value) {
  const num = Number(value) || 0;
  const prefix = num < 0 ? '-' : '';
  return `${prefix}$${Math.abs(num).toLocaleString('es-CO')} COP`;
}

export default function EarningsScreen({ onOpenDrawer }) {
  const insets = useSafeAreaInsets();
  const { balance } = useDriverSession();
  const { completedTrips, summary, isLoading, refreshTrips } = useEarnings();

  const isNegativeBalance = (balance || 0) < 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 20) + spacing.md },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refreshTrips}
          tintColor={colors.primario}
        />
      }
    >
      <View style={styles.headerRow}>
        {onOpenDrawer && (
          <TouchableOpacity style={styles.menuButton} onPress={onOpenDrawer} activeOpacity={0.8}>
            <Ionicons name="menu" size={22} color={colors.texto} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Ganancias y Saldo</Text>
          <Text style={styles.subtitle}>Resumen en tiempo real desde Firestore</Text>
        </View>
      </View>

      <View
        style={[
          styles.balanceCard,
          isNegativeBalance ? styles.balanceCardNegative : null,
        ]}
      >
        <Text style={styles.balanceLabel}>SALDO ACTUAL EN LA APP</Text>
        <Text
          style={[
            styles.balanceAmount,
            isNegativeBalance ? styles.balanceAmountNegative : null,
          ]}
        >
          {formatCop(balance)}
        </Text>
        <Text style={styles.balanceHint}>
          {isNegativeBalance
            ? 'Tienes saldo negativo por comisiones del 20% de viajes en efectivo. Se compensará con futuros viajes con pasarela.'
            : 'Saldo neto acumulado (ingresos de pasarela menos comisiones de viajes en efectivo).'}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Ganancias por Periodo</Text>
      <View style={styles.periodGrid}>
        <View style={styles.periodCard}>
          <Ionicons name="today-outline" size={20} color={colors.primario} />
          <Text style={styles.periodLabel}>Hoy</Text>
          <Text style={styles.periodValue}>{formatCop(summary.day.amount)}</Text>
          <Text style={styles.periodCount}>{summary.day.count} viajes</Text>
        </View>

        <View style={styles.periodCard}>
          <Ionicons name="calendar-outline" size={20} color={colors.dorado} />
          <Text style={styles.periodLabel}>Últimos 7 días</Text>
          <Text style={styles.periodValue}>{formatCop(summary.week.amount)}</Text>
          <Text style={styles.periodCount}>{summary.week.count} viajes</Text>
        </View>

        <View style={styles.periodCard}>
          <Ionicons name="stats-chart-outline" size={20} color={colors.advertencia} />
          <Text style={styles.periodLabel}>Este mes</Text>
          <Text style={styles.periodValue}>{formatCop(summary.month.amount)}</Text>
          <Text style={styles.periodCount}>{summary.month.count} viajes</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Balance Financiero Acumulado</Text>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Total Tarifas Brutas</Text>
          <Text style={styles.metricValue}>{formatCop(summary.totalGross)}</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Comisiones Plataforma (20%)</Text>
          <Text style={[styles.metricValue, { color: colors.peligro }]}>
            -{formatCop(summary.totalCommission)}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Propinas Recibidas</Text>
          <Text style={[styles.metricValue, { color: colors.primario }]}>
            +{formatCop(summary.totalTips)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricRow}>
          <Text style={styles.metricTotalLabel}>Ganancia Neta Total</Text>
          <Text style={styles.metricTotalValue}>{formatCop(summary.totalNet)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Distribución de Viajes</Text>
        <View style={styles.pillsRow}>
          <View style={styles.statPill}>
            <Ionicons name="cash-outline" size={18} color={colors.primario} />
            <Text style={styles.statPillNum}>{summary.cashCount}</Text>
            <Text style={styles.statPillLabel}>Efectivo</Text>
          </View>
          <View style={styles.statPill}>
            <Ionicons name="card-outline" size={18} color={colors.dorado} />
            <Text style={styles.statPillNum}>{summary.gatewayCount}</Text>
            <Text style={styles.statPillLabel}>Pasarela</Text>
          </View>
          <View style={styles.statPill}>
            <Ionicons name="close-circle-outline" size={18} color={colors.peligro} />
            <Text style={styles.statPillNum}>{summary.cancelledCount}</Text>
            <Text style={styles.statPillLabel}>Cancelados</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Últimos Viajes Liquidados</Text>
        {completedTrips.length === 0 ? (
          <Text style={styles.emptyText}>
            Aún no tienes viajes completados registrados en Firestore.
          </Text>
        ) : (
          completedTrips.slice(0, 5).map((trip) => {
            const net = trip.finalEarnings ?? trip.pricing?.gananciaNeta ?? 0;
            const isCash = trip.paymentMethod === 'cash';
            return (
              <View key={trip.id} style={styles.recentRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentPassenger}>
                    {trip.passenger?.name || 'Pasajero'}
                  </Text>
                  <Text style={styles.recentRoute} numberOfLines={1}>
                    {trip.destination?.address || trip.pickup?.address || 'Viaje completado'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.recentAmount}>{formatCop(net)}</Text>
                  <Text style={styles.recentMethod}>
                    {isCash ? 'Efectivo' : 'Mercado Pago'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.superficie,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  title: {
    color: colors.texto,
    fontSize: typography.tamanios.xl,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
    marginTop: 2,
  },
  balanceCard: {
    backgroundColor: colors.superficie,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primario,
    marginBottom: spacing.lg,
  },
  balanceCardNegative: {
    borderColor: colors.peligro,
  },
  balanceLabel: {
    color: colors.primario,
    fontSize: typography.tamanios.xs,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  balanceAmount: {
    color: colors.texto,
    fontSize: 30,
    fontWeight: '900',
    marginVertical: spacing.xs,
  },
  balanceAmountNegative: {
    color: colors.peligro,
  },
  balanceHint: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
    lineHeight: 18,
  },
  sectionTitle: {
    color: colors.texto,
    fontSize: typography.tamanios.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  periodGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  periodCard: {
    flex: 1,
    backgroundColor: colors.superficie,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  periodLabel: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
    marginTop: spacing.xs,
  },
  periodValue: {
    color: colors.texto,
    fontSize: typography.tamanios.sm,
    fontWeight: '800',
    marginTop: 4,
  },
  periodCount: {
    color: colors.primario,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.superficie,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borde,
    marginBottom: spacing.md,
  },
  cardTitle: {
    color: colors.texto,
    fontSize: typography.tamanios.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  metricLabel: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.sm,
  },
  metricValue: {
    color: colors.texto,
    fontSize: typography.tamanios.sm,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borde,
    marginVertical: spacing.sm,
  },
  metricTotalLabel: {
    color: colors.texto,
    fontSize: typography.tamanios.md,
    fontWeight: '700',
  },
  metricTotalValue: {
    color: colors.primario,
    fontSize: typography.tamanios.md,
    fontWeight: '800',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statPill: {
    flex: 1,
    backgroundColor: colors.fondo,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borde,
  },
  statPillNum: {
    color: colors.texto,
    fontSize: typography.tamanios.lg,
    fontWeight: '800',
    marginTop: 4,
  },
  statPillLabel: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
    marginTop: 2,
  },
  emptyText: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.sm,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
  },
  recentPassenger: {
    color: colors.texto,
    fontSize: typography.tamanios.sm,
    fontWeight: '700',
  },
  recentRoute: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
    marginTop: 2,
    paddingRight: spacing.sm,
  },
  recentAmount: {
    color: colors.primario,
    fontSize: typography.tamanios.sm,
    fontWeight: '700',
  },
  recentMethod: {
    color: colors.textoSuave,
    fontSize: 11,
    marginTop: 2,
  },
});

