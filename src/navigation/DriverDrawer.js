import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDriverSession } from '../context/DriverSessionContext';
import { useActiveTrip } from '../context/ActiveTripContext';
import TripStack from './TripStack';
import EarningsScreen from '../screens/EarningsScreen';
import TripHistoryScreen from '../screens/TripHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors, spacing, radius, typography } from '../theme';

const Tab = createBottomTabNavigator();

const DRAWER_ITEMS = [
  { route: 'TripTab', label: 'Inicio y Mapa GPS', icon: 'navigate-outline' },
  { route: 'EarningsTab', label: 'Ganancias y Saldo', icon: 'wallet-outline' },
  { route: 'HistoryTab', label: 'Historial de Viajes', icon: 'receipt-outline' },
  { route: 'ProfileTab', label: 'Perfil y Documentos', icon: 'person-outline' },
];

export default function DriverDrawer() {
  const insets = useSafeAreaInsets();
  const { driverProfile, balance, isAvailable, setIsAvailable, logoutDriver } = useDriverSession();
  const { activeTrip, hasActiveTrip, clearActiveTrip } = useActiveTrip();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const tabNavRef = useRef(null);

  const hideTabBar = hasActiveTrip || activeTrip?.status === 'completed';

  const navigateFromDrawer = (tabRoute) => {
    setDrawerOpen(false);
    if (tabNavRef.current?.navigate) {
      tabNavRef.current.navigate(tabRoute);
    }
  };

  const handleLogout = async () => {
    setDrawerOpen(false);
    clearActiveTrip();
    await logoutDriver();
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route, navigation: tabNav }) => {
          tabNavRef.current = tabNav;
          return {
          headerShown: false,
          tabBarActiveTintColor: colors.primario,
          tabBarInactiveTintColor: colors.textoSuave,
          tabBarStyle: hideTabBar
            ? { display: 'none' }
            : {
                backgroundColor: colors.superficie,
                borderTopColor: colors.borde,
                height: 60 + insets.bottom,
                paddingBottom: Math.max(insets.bottom, 6),
                paddingTop: 6,
              },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
          },
          tabBarIcon: ({ color, size, focused }) => {
            let iconName = 'car-outline';
            if (route.name === 'TripTab') {
              iconName = focused ? 'car-sport' : 'car-sport-outline';
            } else if (route.name === 'EarningsTab') {
              iconName = focused ? 'wallet' : 'wallet-outline';
            } else if (route.name === 'HistoryTab') {
              iconName = focused ? 'time' : 'time-outline';
            } else if (route.name === 'ProfileTab') {
              iconName = focused ? 'person' : 'person-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          };
        }}
      >
        <Tab.Screen name="TripTab" options={{ title: 'Inicio' }}>
          {() => <TripStack onOpenDrawer={() => setDrawerOpen(true)} />}
        </Tab.Screen>
        <Tab.Screen name="EarningsTab" options={{ title: 'Ganancias' }}>
          {() => <EarningsScreen onOpenDrawer={() => setDrawerOpen(true)} />}
        </Tab.Screen>
        <Tab.Screen name="HistoryTab" options={{ title: 'Historial' }}>
          {() => <TripHistoryScreen onOpenDrawer={() => setDrawerOpen(true)} />}
        </Tab.Screen>
        <Tab.Screen name="ProfileTab" options={{ title: 'Perfil' }}>
          {() => <ProfileScreen onOpenDrawer={() => setDrawerOpen(true)} />}
        </Tab.Screen>
      </Tab.Navigator>

      <Modal
        visible={drawerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={styles.drawerOverlay}>
          <View
            style={[
              styles.drawerPanel,
              { paddingTop: Math.max(insets.top, 24) + spacing.md },
            ]}
          >
            <View style={styles.drawerHeader}>
              {driverProfile?.personal?.photoUri ? (
                <Image
                  source={{ uri: driverProfile.personal.photoUri }}
                  style={styles.drawerAvatar}
                />
              ) : (
                <View style={styles.drawerAvatarPlaceholder}>
                  <Ionicons name="person" size={26} color={colors.textoSuave} />
                </View>
              )}
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.drawerName} numberOfLines={1}>
                  {driverProfile?.personal?.fullName || 'Conductor'}
                </Text>
                <Text style={styles.drawerVehicle} numberOfLines={1}>
                  {driverProfile?.vehicle?.plate || '---'} •{' '}
                  {driverProfile?.vehicle?.brandModel || 'Vehículo'}
                </Text>
                <Text style={styles.drawerBalance}>
                  Saldo: ${(balance || 0).toLocaleString('es-CO')} COP
                </Text>
              </View>
              <TouchableOpacity onPress={() => setDrawerOpen(false)}>
                <Ionicons name="close" size={22} color={colors.textoSuave} />
              </TouchableOpacity>
            </View>

            <View style={styles.drawerLinks}>
              {DRAWER_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.route}
                  style={styles.drawerItem}
                  onPress={() => navigateFromDrawer(item.route)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={item.icon} size={20} color={colors.primario} />
                  <Text style={styles.drawerItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.drawerAvailabilityBtn,
                  isAvailable ? styles.drawerOfflineBtn : styles.drawerOnlineBtn,
                ]}
                onPress={() => {
                  setIsAvailable(!isAvailable);
                  setDrawerOpen(false);
                }}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isAvailable ? 'stop-circle' : 'power'}
                  size={18}
                  color={colors.blanco}
                />
                <Text style={styles.drawerAvailabilityText}>
                  {isAvailable ? 'Ponerse Fuera de Línea' : 'Conectarse (Disponible)'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.drawerLogout,
                { marginBottom: Math.max(insets.bottom, spacing.lg) },
              ]}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.peligro} />
              <Text style={styles.drawerLogoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.drawerBackdropDismiss}
            activeOpacity={1}
            onPress={() => setDrawerOpen(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  drawerPanel: {
    width: '78%',
    maxWidth: 320,
    backgroundColor: colors.superficie,
    paddingHorizontal: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: colors.borde,
    justifyContent: 'space-between',
  },
  drawerBackdropDismiss: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
  },
  drawerAvatar: {
    width: 54,
    height: 54,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.primario,
  },
  drawerAvatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: radius.full,
    backgroundColor: colors.superficieClara,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerName: {
    color: colors.texto,
    fontSize: typography.tamanios.md,
    fontWeight: '800',
  },
  drawerVehicle: {
    color: colors.textoSuave,
    fontSize: typography.tamanios.xs,
    marginTop: 2,
  },
  drawerBalance: {
    color: colors.primario,
    fontSize: typography.tamanios.xs,
    fontWeight: '700',
    marginTop: 4,
  },
  drawerLinks: {
    flex: 1,
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  drawerItemText: {
    color: colors.texto,
    fontSize: typography.tamanios.md,
    fontWeight: '600',
  },
  drawerLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borde,
  },
  drawerLogoutText: {
    color: colors.peligro,
    fontSize: typography.tamanios.md,
    fontWeight: '700',
  },
  drawerAvailabilityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  drawerOfflineBtn: {
    backgroundColor: colors.peligro,
  },
  drawerOnlineBtn: {
    backgroundColor: colors.primario,
  },
  drawerAvailabilityText: {
    color: colors.blanco,
    fontSize: typography.tamanios.sm,
    fontWeight: '800',
  },
});
