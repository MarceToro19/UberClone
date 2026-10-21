// AI-assisted: see docs/AI_LOG.md #3
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDriverSession } from '../../context/DriverSessionContext';
import { colors, spacing, radius, typography } from '../../theme';
import { DRIVER_STATUS } from '../../config/pricing';

export default function PendingApprovalScreen() {
  const insets = useSafeAreaInsets();
  const { driverProfile, approvalStatus, simulateToggleApproval, isAvailable, setIsAvailable } = useDriverSession();

  const isApproved = approvalStatus === DRIVER_STATUS.APPROVED;

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + spacing.lg }]} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={[styles.iconCircle, isApproved ? styles.iconApproved : styles.iconPending]}>
          <Ionicons
            name={isApproved ? 'shield-checkmark' : 'time-outline'}
            size={48}
            color={isApproved ? colors.primario : colors.advertencia}
          />
        </View>

        <Text style={styles.title}>
          {isApproved ? '¡Cuenta Aprobada!' : 'Cuenta Pendiente de Aprobación'}
        </Text>

        <Text style={styles.description}>
          {isApproved
            ? 'Tu perfil, vehículo y documentos han sido verificados. Ahora puedes conectarte y recibir solicitudes de viaje.'
            : 'Hemos recibido tus documentos y datos del vehículo. Nuestro equipo está revisando la información. No podrás ponerte disponible hasta que tu estado sea Aprobado.'}
        </Text>

        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>ESTADO DE REVISIÓN:</Text>
          <Text style={[styles.statusBadge, isApproved ? styles.statusBadgeApproved : styles.statusBadgePending]}>
            {isApproved ? 'APROBADO' : 'PENDIENTE DE APROBACIÓN'}
          </Text>
        </View>

        {driverProfile && (
          <View style={styles.driverInfo}>
            <Text style={styles.driverInfoText}>
              • Conductor: <Text style={styles.boldText}>{driverProfile.personal?.fullName}</Text>
            </Text>
            <Text style={styles.driverInfoText}>
              • Vehículo: <Text style={styles.boldText}>{driverProfile.vehicle?.plate} ({driverProfile.vehicle?.brandModel})</Text>
            </Text>
            <Text style={styles.driverInfoText}>
              • Categoría: <Text style={styles.boldText}>{driverProfile.vehicle?.category?.toUpperCase()}</Text>
            </Text>
          </View>
        )}

        {/* Interruptor de Disponibilidad condicionado por Aprobación */}
        <View style={styles.switchSection}>
          <Text style={styles.switchTitle}>Disponibilidad para recibir viajes:</Text>
          <TouchableOpacity
            style={[
              styles.switchButton,
              !isApproved && styles.switchDisabled,
              isAvailable && styles.switchActive,
            ]}
            onPress={() => {
              if (isApproved) {
                setIsAvailable(!isAvailable);
              }
            }}
            disabled={!isApproved}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isAvailable ? 'radio-button-on' : 'power-outline'}
              size={20}
              color={!isApproved ? colors.textoSuave : isAvailable ? colors.blanco : colors.texto}
            />
            <Text
              style={[
                styles.switchButtonText,
                !isApproved && styles.switchButtonTextDisabled,
                isAvailable && styles.switchButtonTextActive,
              ]}
            >
              {!isApproved
                ? 'Bloqueado (Requiere aprobación)'
                : isAvailable
                ? 'Conectado (Disponible)'
                : 'Desconectado (Toca para conectar)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Herramienta de simulación de base de datos requerida en Sección 2 del PDF */}
        <View style={styles.devBox}>
          <Text style={styles.devTitle}>🛠 Simulación de Base de Datos (Sección 2 PDF):</Text>
          <Text style={styles.devSubtitle}>
            "puede simularse cambiando el campo en la base de datos"
          </Text>
          <TouchableOpacity style={styles.devButton} onPress={simulateToggleApproval} activeOpacity={0.8}>
            <Ionicons name="swap-horizontal-outline" size={18} color={colors.dorado} />
            <Text style={styles.devButtonText}>
              Simular cambio a {isApproved ? 'Pendiente' : 'Aprobado'}
            </Text>
          </TouchableOpacity>
        </View>
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
    padding: spacing.lg,
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  card: {
    width: '100%',
    maxWidth: 550,
    backgroundColor: colors.superficie,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borde,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  iconApproved: {
    backgroundColor: colors.primarioSuave,
  },
  title: {
    ...typography.tituloGrande,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.cuerpo,
    color: colors.textoSuave,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  statusBox: {
    width: '100%',
    backgroundColor: colors.fondo,
    padding: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusLabel: {
    ...typography.etiqueta,
    letterSpacing: 1,
    marginBottom: 4,
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: '800',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  statusBadgePending: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    color: colors.advertencia,
  },
  statusBadgeApproved: {
    backgroundColor: colors.primarioSuave,
    color: colors.primario,
  },
  driverInfo: {
    width: '100%',
    backgroundColor: colors.fondo,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.lg,
  },
  driverInfoText: {
    ...typography.cuerpo,
    color: colors.textoSuave,
    marginVertical: 2,
  },
  boldText: {
    color: colors.texto,
    fontWeight: '600',
  },
  switchSection: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  switchTitle: {
    ...typography.etiqueta,
    color: colors.textoSuave,
    marginBottom: spacing.xs,
  },
  switchButton: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borde,
    backgroundColor: colors.superficieClara,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  switchActive: {
    backgroundColor: colors.primario,
    borderColor: colors.primario,
  },
  switchDisabled: {
    opacity: 0.5,
  },
  switchButtonText: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.texto,
  },
  switchButtonTextActive: {
    color: colors.blanco,
  },
  switchButtonTextDisabled: {
    color: colors.textoSuave,
  },
  devBox: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors.borde,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  devTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.dorado,
    marginBottom: 2,
  },
  devSubtitle: {
    fontSize: 11,
    color: colors.textoSuave,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.dorado,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
  },
  devButtonText: {
    color: colors.dorado,
    fontSize: 12,
    fontWeight: '700',
  },
});
