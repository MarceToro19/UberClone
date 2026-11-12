import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useEarnings from '../hooks/useEarnings';
import { colors, spacing, radius, typography } from '../theme';

const PAGE_SIZE = 20;

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'paid', label: 'Pagados' },
  { id: 'cancelled', label: 'Cancelados' },
  { id: 'cash', label: 'Efectivo' },
  { id: 'gateway', label: 'Pasarela' },
];

function formatDateLabel(trip) {
  const raw = trip?.paidAt || trip?.completedAt || trip?.cancelledAt || trip?.startedAt;
  if (!raw) return 'Sin fecha';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return date.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadge(status) {
  if (status === 'cancelled') {
    return { label: 'Cancelado', color: colors.peligro, bg: colors.peligroSuave };
  }
  if (status === 'paid') {
    return { label: 'Pagado', color: colors.primario, bg: colors.primarioSuave };
  }
  return { label: status || 'Completado', color: colors.advertencia, bg: colors.superficieClara };
}

export default function TripHistoryScreen({ onOpenDrawer }) {
  const insets = useSafeAreaInsets();
  const { trips, isLoading, refreshTrips } = useEarnings();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      if (selectedFilter === 'paid') {
        return trip.status === 'paid' || trip.status === 'completed';
      }
      if (selectedFilter === 'cancelled') {
        return trip.status === 'cancelled';
      }
      if (selectedFilter === 'cash') {
        return trip.paymentMethod === 'cash';
      }
      if (selectedFilter === 'gateway') {
        return trip.paymentMethod !== 'cash';
      }
      return true;
    });
  }, [trips, selectedFilter]);

  const paginatedTrips = useMemo(
    () => filteredTrips.slice(0, visibleLimit),
    [filteredTrips, visibleLimit]
  );

  const hasMore = paginatedTrips.length < filteredTrips.length;

  const handleSelectFilter = (filterId) => {
    setSelectedFilter(filterId);
    setVisibleLimit(PAGE_SIZE);
  };

  const renderTripCard = ({ item }) => {
    const badge = getStatusBadge(item.status);
    const netAmount = item.finalEarnings ?? item.pricing?.gananciaNeta ?? 0;
    const isCash = item.paymentMethod === 'cash';

    return (
      <TouchableOpacity
        style={styles.tripCard}
        onPress={() => setSelectedTrip(item)}
        activeOpacity={0.85}
      >
        <View style={styles.tripCardTop}>
          <Text style={styles.tripDate}>{formatDateLabel(item)}</Text>
          <View style={[styles.statusPill, { backgroundColor: badge.bg }]}>
            <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>

        <View style={styles.routeBlock}>
          <View style={styles.routeRow}>
            <Ionicons name="radio-button-on" size={13} color={colors.primario} />
            <Text style={styles.routeText} numberOfLines={1}>
              {item.pickup?.address || 'Origen'}
            </Text>
          </View>
          <View style={styles.routeRow}>
            <Ionicons name="location" size={13} color={colors.peligro} />
            <Text style={styles.routeText} numberOfLines={1}>
              {item.destination?.address || 'Destino'}
            </Text>
          </View>
        </View>

        <View style={styles.tripCardBottom}>
          <View style={styles.metaRow}>
            <Ionicons
              name={isCash ? 'cash-outline' : 'card-outline'}
              size={14}
              color={colors.textoSuave}
            />
            <Text style={styles.metaText}>
              {isCash ? 'Efectivo' : 'Pasarela'} • {item.category || 'Económico'} •{' '}
              {item.distanceKm || 0} km
            </Text>
          </View>
          <Text
            style={[
              styles.tripAmount,
              item.status === 'cancelled' && { color: colors.textoSuave },
            ]}
          >
            {item.status === 'cancelled'
              ? '$0 COP'
              : `$${(netAmount || 0).toLocaleString('es-CO')} COP`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + spacing.md }]}>
      <View style={styles.headerRow}>
        {onOpenDrawer && (
          <TouchableOpacity style={styles.menuButton} onPress={onOpenDrawer} activeOpacity={0.8}>
            <Ionicons name="menu" size={22} color={colors.texto} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Historial de Viajes</Text>
          <Text style={styles.subtitle}>
            {filteredTrips.length} registros encontrados
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTERS.map((filter) => {
          const active = selectedFilter === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => handleSelectFilter(filter.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={paginatedTrips}
        keyExtractor={(item) => item.id}
        renderItem={renderTripCard}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={refreshTrips}
        onEndReached={() => {
          if (hasMore) {
            setVisibleLimit((prev) => prev + PAGE_SIZE);
          }
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={48} color={colors.textoSuave} />
            <Text style={styles.emptyTitle}>Sin viajes para mostrar</Text>
            <Text style={styles.emptyDesc}>
              Completa o cancela un viaje para verlo sincronizado aquí desde Firestore.
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() => setVisibleLimit((prev) => prev + PAGE_SIZE)}
            >
              <Text style={styles.loadMoreText}>Cargar 20 viajes más</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <Modal
        visible={!!selectedTrip}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTrip(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle del Viaje</Text>
              <TouchableOpacity onPress={() => setSelectedTrip(null)}>
                <Ionicons name="close" size={24} color={colors.texto} />
              </TouchableOpacity>
            </View>

            {selectedTrip && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalDate}>{formatDateLabel(selectedTrip)}</Text>

                <View style={styles.detailBox}>
                  <Text style={styles.detailLine}>
                    Pasajero: <Text style={styles.detailVal}>{selectedTrip.passenger?.name || '---'}</Text>
                  </Text>
                  <Text style={styles.detailLine}>
                    Recogida: <Text style={styles.detailVal}>{selectedTrip.pickup?.address || '---'}</Text>
                  </Text>
                  <Text style={styles.detailLine}>
                    Destino: <Text style={styles.detailVal}>{selectedTrip.destination?.address || '---'}</Text>
                  </Text>
                  <Text style={styles.detailLine}>
                    Distancia: <Text style={styles.detailVal}>{selectedTrip.distanceKm || 0} km</Text>
                  </Text>
                  <Text style={styles.detailLine}>
                    Categoría: <Text style={styles.detailVal}>{selectedTrip.category || 'Económico'}</Text>
                  </Text>
                  <Text style={styles.detailLine}>
                    Método de pago:{' '}
                    <Text style={styles.detailVal}>
                      {selectedTrip.paymentMethod === 'cash' ? 'Efectivo' : 'Pasarela'}
                    </Text>
                  </Text>
                </View>

                <View style={styles.detailBox}>
                  <Text style={styles.sectionMiniTitle}>Desglose Financiero</Text>
                  <Text style={styles.detailLine}>
                    Tarifa bruta:{' '}
                    <Text style={styles.detailVal}>
                      ${(selectedTrip.pricing?.tarifaBruta || 0).toLocaleString('es-CO')} COP
                    </Text>
                  </Text>
                  <Text style={styles.detailLine}>
                    Comisión (20%):{' '}
                    <Text style={[styles.detailVal, { color: colors.peligro }]}>
                      -${(selectedTrip.commissionAmount ?? selectedTrip.pricing?.comision ?? 0).toLocaleString('es-CO')} COP
                    </Text>
                  </Text>
                  <Text style={styles.detailLine}>
                    Propina:{' '}
                    <Text style={styles.detailVal}>
                      +${(selectedTrip.tipAmount || 0).toLocaleString('es-CO')} COP
                    </Text>
                  </Text>
                  <Text style={styles.detailLine}>
                    Ganancia neta:{' '}
                    <Text style={[styles.detailVal, { color: colors.primario }]}>
                      ${(selectedTrip.finalEarnings ?? selectedTrip.pricing?.gananciaNeta ?? 0).toLocaleString('es-CO')} COP
                    </Text>
                  </Text>
                  {selectedTrip.cancellationReason ? (
                    <Text style={[styles.detailLine, { color: colors.peligro, marginTop: 4 }]}>
                      Motivo cancelación: {selectedTrip.cancellationReason}
                    </Text>
                  ) : null}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
  filtersScroll: {
    maxHeight: 46,
    marginBottom: spacing.md,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  filterChip: {
    backgroundColor: colors.superficie,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  filterChipActive: {
    backgroundColor: colors.primarioSuave,
    borderColor: colors.primario,
  },
  filterText: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.primario,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  tripCard: {
    backgroundColor: colors.superficie,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  tripCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tripDate: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  routeBlock: {
    gap: 6,
    marginBottom: spacing.sm,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  routeText: {
    color: colors.texto,
    fontSize: typography.tamanios.sm,
    flex: 1,
  },
  tripCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borde,
    paddingTop: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
  },
  tripAmount: {
    color: colors.primario,
    fontSize: typography.tamanios.md,
    fontWeight: '800',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    color: colors.texto,
    fontSize: typography.tamanios.md,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  emptyDesc: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  loadMoreButton: {
    backgroundColor: colors.superficie,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primario,
  },
  loadMoreText: {
    color: colors.primario,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.superficie,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: '82%',
    borderWidth: 1,
    borderColor: colors.borde,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  modalTitle: {
    color: colors.texto,
    fontSize: typography.tamanios.lg,
    fontWeight: '800',
  },
  modalDate: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
    marginBottom: spacing.md,
  },
  detailBox: {
    backgroundColor: colors.fondo,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borde,
    gap: 6,
  },
  sectionMiniTitle: {
    color: colors.primario,
    fontSize: typography.tamanios.xs,
    fontWeight: '800',
    marginBottom: 4,
  },
  detailLine: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.sm,
  },
  detailVal: {
    color: colors.texto,
    fontWeight: '600',
  },
});

