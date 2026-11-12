import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDriverSession } from '../context/DriverSessionContext';
import { useActiveTrip } from '../context/ActiveTripContext';
import { colors, spacing, radius, typography } from '../theme';

export default function ProfileScreen({ onOpenDrawer }) {
  const insets = useSafeAreaInsets();
  const {
    driverProfile,
    isApproved,
    language,
    setLanguage,
    logoutDriver,
    simulateToggleApproval,
  } = useDriverSession();
  const { clearActiveTrip } = useActiveTrip();

  const personal = driverProfile?.personal || {};
  const vehicle = driverProfile?.vehicle || {};
  const documents = driverProfile?.documents || {};

  const handleLogout = async () => {
    clearActiveTrip();
    await logoutDriver();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 20) + spacing.md },
      ]}
    >
      <View style={styles.headerRow}>
        {onOpenDrawer && (
          <TouchableOpacity style={styles.menuButton} onPress={onOpenDrawer} activeOpacity={0.8}>
            <Ionicons name="menu" size={22} color={colors.texto} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Perfil del Conductor</Text>
          <Text style={styles.subtitle}>Cuenta, vehículo, documentos y sesión</Text>
        </View>
      </View>

      <View style={styles.profileHeaderCard}>
        {personal.photoUri ? (
          <Image source={{ uri: personal.photoUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={34} color={colors.textoSuave} />
          </View>
        )}
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.driverName}>{personal.fullName || 'Conductor UberClone'}</Text>
          <Text style={styles.driverEmail}>{personal.email || 'Sin correo'}</Text>
          <View
            style={[
              styles.approvalBadge,
              { backgroundColor: isApproved ? colors.primarioSuave : colors.superficieClara },
            ]}
          >
            <Ionicons
              name={isApproved ? 'shield-checkmark' : 'time-outline'}
              size={14}
              color={isApproved ? colors.primario : colors.advertencia}
            />
            <Text
              style={[
                styles.approvalText,
                { color: isApproved ? colors.primario : colors.advertencia },
              ]}
            >
              {isApproved ? 'APROBADO' : 'PENDIENTE DE APROBACIÓN'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Datos Personales</Text>
        <View style={styles.row}>
          <Text style={styles.key}>Documento</Text>
          <Text style={styles.val}>{personal.documentId || '---'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Celular</Text>
          <Text style={styles.val}>{personal.phone || '---'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Nacimiento</Text>
          <Text style={styles.val}>{personal.birthDate || '---'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>ID Firestore</Text>
          <Text style={styles.val}>{driverProfile?.id || '---'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vehículo Registrado</Text>
        {vehicle.vehiclePhotoUri ? (
          <Image source={{ uri: vehicle.vehiclePhotoUri }} style={styles.vehicleImage} />
        ) : null}
        <View style={styles.row}>
          <Text style={styles.key}>Categoría</Text>
          <Text style={styles.val}>{vehicle.category?.toUpperCase() || 'ECONOMY'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Placa</Text>
          <Text style={styles.val}>{vehicle.plate || '---'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Marca / Modelo</Text>
          <Text style={styles.val}>{vehicle.brandModel || '---'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Año / Color</Text>
          <Text style={styles.val}>
            {vehicle.year || '---'} • {vehicle.color || '---'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Documentos y Pagos</Text>
        <View style={styles.row}>
          <Text style={styles.key}>Licencia</Text>
          <Text style={styles.val}>
            {documents.licenseNumber || '---'} (Vence {documents.licenseExpiry || '---'})
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>SOAT</Text>
          <Text style={styles.val}>Vence {documents.soatExpiry || '---'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Técnico-Mecánica</Text>
          <Text style={styles.val}>
            {documents.tecnoExpiry ? `Vence ${documents.tecnoExpiry}` : 'No requerida / reciente'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Correo Mercado Pago</Text>
          <Text style={styles.val}>{documents.mercadoPagoEmail || '---'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preferencia de Idioma</Text>
        <View style={styles.langRow}>
          <TouchableOpacity
            style={[styles.langBtn, language === 'es' && styles.langBtnActive]}
            onPress={() => setLanguage('es')}
          >
            <Text style={[styles.langText, language === 'es' && styles.langTextActive]}>
              Español
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>
              English
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.simButton}
        onPress={simulateToggleApproval}
        activeOpacity={0.85}
      >
        <Ionicons name="swap-horizontal-outline" size={18} color={colors.dorado} />
        <Text style={styles.simButtonText}>
          Alternar Estado de Aprobación (Prueba)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.blanco} />
        <Text style={styles.logoutText}>Cerrar Sesión del Conductor</Text>
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
  profileHeaderCard: {
    backgroundColor: colors.superficie,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borde,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.primario,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.superficieClara,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverName: {
    color: colors.texto,
    fontSize: typography.tamanios.lg,
    fontWeight: '800',
  },
  driverEmail: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  approvalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 4,
  },
  approvalText: {
    fontSize: 11,
    fontWeight: '800',
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
  vehicleImage: {
    width: '100%',
    height: 150,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
  },
  key: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.sm,
  },
  val: {
    color: colors.texto,
    fontSize: typography.tamanios.sm,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  langBtn: {
    flex: 1,
    backgroundColor: colors.fondo,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borde,
  },
  langBtnActive: {
    backgroundColor: colors.primarioSuave,
    borderColor: colors.primario,
  },
  langText: {
    color: colors.textoSuave,
    fontWeight: '700',
  },
  langTextActive: {
    color: colors.primario,
  },
  simButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.superficie,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.dorado,
    marginBottom: spacing.md,
  },
  simButtonText: {
    color: colors.dorado,
    fontWeight: '700',
    fontSize: typography.tamanios.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.peligro,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
  },
  logoutText: {
    color: colors.blanco,
    fontWeight: '800',
    fontSize: typography.tamanios.md,
  },
});

