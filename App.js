// AI-assisted: see docs/AI_LOG.md #4
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { DriverSessionProvider, useDriverSession } from './src/context/DriverSessionContext';
import RegisterTabsScreen from './src/screens/register/RegisterTabsScreen';
import PendingApprovalScreen from './src/screens/register/PendingApprovalScreen';
import HomeScreen from './src/screens/HomeScreen';
import { colors, spacing, radius } from './src/theme';

function AppContent() {
  const insets = useSafeAreaInsets();
  const { isRegistered, isApproved } = useDriverSession();
  const [currentView, setCurrentView] = React.useState('auto'); 
  // 'auto' | 'register' | 'pending' | 'home'

  // Determinación de la pantalla a mostrar
  let activeScreen = 'register';
  if (currentView === 'auto') {
    if (!isRegistered) {
      activeScreen = 'register';
    } else if (!isApproved) {
      activeScreen = 'pending';
    } else {
      activeScreen = 'home';
    }
  } else {
    activeScreen = currentView;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Barra de navegación de desarrollo protegida con Safe Area */}
      <View style={[styles.navBar, { paddingTop: Math.max(insets.top, 16) + spacing.xs }]}>
        <TouchableOpacity
          style={[styles.navTab, activeScreen === 'register' && styles.navTabActive]}
          onPress={() => setCurrentView('register')}
        >
          <Text style={[styles.navTabText, activeScreen === 'register' && styles.navTabTextActive]}>
            📝 Registro
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeScreen === 'pending' && styles.navTabActive]}
          onPress={() => setCurrentView('pending')}
        >
          <Text style={[styles.navTabText, activeScreen === 'pending' && styles.navTabTextActive]}>
            ⏳ Aprobación
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeScreen === 'home' && styles.navTabActive]}
          onPress={() => setCurrentView('home')}
        >
          <Text style={[styles.navTabText, activeScreen === 'home' && styles.navTabTextActive]}>
            🚗 Inicio / GPS
          </Text>
        </TouchableOpacity>
      </View>

      {/* Renderizado de pantalla activa */}
      {activeScreen === 'register' && (
        <RegisterTabsScreen onRegistrationSuccess={() => setCurrentView('pending')} />
      )}
      {activeScreen === 'pending' && <PendingApprovalScreen />}
      {activeScreen === 'home' && <HomeScreen onOpenDrawer={() => setCurrentView('pending')} />}
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
  navBar: {
    flexDirection: 'row',
    backgroundColor: colors.superficie,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
    zIndex: 10,
  },
  navTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  navTabActive: {
    backgroundColor: colors.superficieClara,
  },
  navTabText: {
    color: colors.textoSuave,
    fontSize: 11,
    fontWeight: '600',
  },
  navTabTextActive: {
    color: colors.primario,
    fontWeight: '700',
  },
});
