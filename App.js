import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';

import { DriverSessionProvider } from './src/context/DriverSessionContext';
import { ActiveTripProvider } from './src/context/ActiveTripContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

const AppNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primario,
    background: colors.fondo,
    card: colors.superficie,
    text: colors.texto,
    border: colors.borde,
    notification: colors.peligro,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <DriverSessionProvider>
        <ActiveTripProvider>
          <NavigationContainer theme={AppNavigationTheme}>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </ActiveTripProvider>
      </DriverSessionProvider>
    </SafeAreaProvider>
  );
}
