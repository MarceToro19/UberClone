// AI-assisted: see docs/AI_LOG.md #4
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDriverSession } from '../context/DriverSessionContext';
import useDriverLocation from '../hooks/useDriverLocation';
import DriverMapView from '../components/DriverMapView';
import { colors, spacing, radius, typography } from '../theme';

/**
 * Pantalla Principal del Conductor (HomeScreen)
 * Sección 3.1 del documento oficial:
 * - Mapa con la ubicación actual
 * - Interruptor Disponible / No disponible
 * - Rastreo de ubicación activo mientras está disponible
 * - Limpieza de rastreo al pasar a No disponible o salir de la pantalla
 */
export default function HomeScreen({ onOpenDrawer }) {
  const insets = useSafeAreaInsets();
  const { isAvailable, setIsAvailable, isApproved, driverProfile, balance } = useDriverSession();

  // Hook obligatorio con limpieza en desmontaje/desconexión
  const { location, isTracking } = useDriverLocation(isAvailable);

  const toggleAvailability = () => {
    if (!isApproved) return;
    setIsAvailable(!isAvailable);
  };

  return (
    <View style={styles.container}>
      {/* Vista de Mapa en Vivo */}
      <DriverMapView location={location} isTracking={isTracking} isAvailable={isAvailable} />

      {/* Barra Superior con botón de menú e información de saldo */}
      <View style={[styles.topBar, { top: Math.max(insets.top, 24) + spacing.md }]}>
        <TouchableOpacity style={styles.menuButton} onPress={onOpenDrawer} activeOpacity={0.8}>

          <Ionicons name="menu" size={24} color={colors.texto} />
        </TouchableOpacity>

        <View style={styles.balanceBadge}>
          <Text style={styles.balanceLabel}>SALDO</Text>
          <Text style={[styles.balanceValue, balance < 0 ? styles.balanceNegative : null]}>
            ${(balance || 0).toLocaleString('es-CO')} COP
          </Text>
        </View>

        <View style={styles.categoryBadge}>
          <Ionicons name="car-outline" size={14} color={colors.primario} style={{ marginRight: 4 }} />
          <Text style={styles.categoryText}>
            {driverProfile?.vehicle?.category ? driverProfile.vehicle.category.toUpperCase() : 'ECONÓMICO'}
          </Text>
        </View>
      </View>

      {/* Panel Inferior Flotante con el Switch Disponible / No Disponible */}
      <View style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <View style={styles.driverQuickInfo}>
          <View style={styles.avatarMini}>
            <Ionicons name="person" size={20} color={colors.texto} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>
              {driverProfile?.personal?.fullName || 'Conductor UberClone'}
            </Text>
            <Text style={styles.vehicleSubtitle}>
              {driverProfile?.vehicle?.brandModel || 'Vehículo'} • Placa: {driverProfile?.vehicle?.plate || '---'}
            </Text>
          </View>
          <View style={[styles.stateDot, isAvailable ? styles.stateDotOnline : styles.stateDotOffline]} />
        </View>

        {/* Botón Principal Switch Disponible / No Disponible */}
        <TouchableOpacity
          style={[styles.switchButton, isAvailable ? styles.switchOnline : styles.switchOffline]}
          onPress={toggleAvailability}
          disabled={!isApproved}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isAvailable ? 'stop-circle' : 'power'}
            size={22}
            color={colors.blanco}
            style={{ marginRight: spacing.sm }}
          />
          <Text style={styles.switchButtonText}>
            {isAvailable ? 'Desconectarse (No Disponible)' : 'Conectarse (Disponible)'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.hintText}>
          {isAvailable
            ? 'Estás en línea recibiendo solicitudes cercanas. Tu GPS se envía en tiempo real.'
            : 'Estás desconectado. El seguimiento GPS y recepción de viajes están detenidos.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  topBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borde,
  },
  balanceBadge: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borde,
  },
  balanceLabel: {
    fontSize: 9,
    color: colors.textoSuave,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primario,
  },
  balanceNegative: {
    color: colors.peligro,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.texto,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.superficie,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borde,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  driverQuickInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarMini: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.superficieClara,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  driverName: {
    ...typography.subtitulo,
    fontSize: 15,
  },
  vehicleSubtitle: {
    ...typography.etiqueta,
    color: colors.textoSuave,
    marginTop: 2,
  },
  stateDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  stateDotOnline: {
    backgroundColor: colors.primario,
  },
  stateDotOffline: {
    backgroundColor: colors.peligro,
  },
  switchButton: {
    height: 50,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  switchOnline: {
    backgroundColor: colors.peligro,
  },
  switchOffline: {
    backgroundColor: colors.primario,
  },
  switchButtonText: {
    color: colors.blanco,
    fontSize: 15,
    fontWeight: '700',
  },
  hintText: {
    ...typography.etiqueta,
    color: colors.textoSuave,
    textAlign: 'center',
    marginTop: 4,
  },
});
