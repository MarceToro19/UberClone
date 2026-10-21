// AI-assisted: see docs/AI_LOG.md #3
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DriverSessionProvider, useDriverSession } from './src/context/DriverSessionContext';
import RegisterTabsScreen from './src/screens/register/RegisterTabsScreen';
import PendingApprovalScreen from './src/screens/register/PendingApprovalScreen';
import { colors, spacing, radius } from './src/theme';

function AppContent() {
  const { isRegistered, driverProfile } = useDriverSession();
  const [viewMode, setViewMode] = React.useState('auto'); // 'auto' | 'force_register' | 'force_status'

  // Si no está registrado va a RegisterTabsScreen; si ya se registró va a PendingApprovalScreen
  const showRegister = viewMode === 'force_register' || (viewMode === 'auto' && !isRegistered);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Selector superior para navegar fácilmente entre las vistas de prueba */}
      <View style={styles.debugBar}>
        <TouchableOpacity
          style={[styles.debugTab, showRegister && styles.debugTabActive]}
          onPress={() => setViewMode('force_register')}
        >
          <Text style={[styles.debugTabText, showRegister && styles.debugTabTextActive]}>
            📝 Formulario (3 Tabs)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.debugTab, !showRegister && styles.debugTabActive]}
          onPress={() => setViewMode('force_status')}
        >
          <Text style={[styles.debugTabText, !showRegister && styles.debugTabTextActive]}>
            ⏳ Estado Aprobación
          </Text>
        </TouchableOpacity>
      </View>

      {showRegister ? (
        <RegisterTabsScreen onRegistrationSuccess={() => setViewMode('force_status')} />
      ) : (
        <PendingApprovalScreen />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DriverSessionProvider>
        <AppContent />
      </DriverSessionProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  debugBar: {
    flexDirection: 'row',
    backgroundColor: colors.superficie,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
    zIndex: 10,
  },
  debugTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  debugTabActive: {
    backgroundColor: colors.superficieClara,
  },
  debugTabText: {
    color: colors.textoSuave,
    fontSize: 12,
    fontWeight: '600',
  },
  debugTabTextActive: {
    color: colors.primario,
    fontWeight: '700',
  },
});
