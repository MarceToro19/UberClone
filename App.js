import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from './src/theme';
import { calculateFare } from './src/utils/calculateFare';

export default function App() {
  // Verificación matemática de tarifas basada en el ejemplo de la Sección 5:
  // Viaje de 8.5 km y 22 minutos, categoría XL:
  const pruebaCalculo = calculateFare({ distanceKm: 8.5, durationMin: 22, category: 'xl' });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.contenedor}>
        <StatusBar style="light" />
        <View style={styles.tarjeta}>
          <Text style={styles.badge}>UBERCLONE CONDUCTOR</Text>
          <Text style={styles.titulo}>Línea Base Lista</Text>
          <Text style={styles.subtitulo}>
            Estructura arquitectónica y tokens de diseño inicializados.
          </Text>

          <View style={styles.divisor} />

          <Text style={styles.seccionTitulo}>Prueba Motor de Tarifas (Sección 5):</Text>
          <Text style={styles.info}>• Distancia/Tiempo: 8.5 km / 22 min (XL)</Text>
          <Text style={styles.info}>• Tarifa calculada: ${pruebaCalculo.fare.toLocaleString('es-CO')} COP</Text>
          <Text style={styles.info}>• Comisión (20%): ${pruebaCalculo.commission.toLocaleString('es-CO')} COP</Text>
          <Text style={[styles.info, styles.ganancia]}>
            • Ganancia neta: ${pruebaCalculo.driverEarnings.toLocaleString('es-CO')} COP
          </Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.fondo,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  tarjeta: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.superficie,
    borderRadius: radius.md,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarioSuave,
    color: colors.primario,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  titulo: {
    ...typography.tituloGrande,
    marginBottom: spacing.xs,
  },
  subtitulo: {
    ...typography.cuerpo,
    color: colors.textoSuave,
    marginBottom: spacing.lg,
  },
  divisor: {
    height: 1,
    backgroundColor: colors.borde,
    marginVertical: spacing.md,
  },
  seccionTitulo: {
    ...typography.subtitulo,
    marginBottom: spacing.sm,
  },
  info: {
    ...typography.cuerpo,
    color: colors.textoSuave,
    marginVertical: 2,
  },
  ganancia: {
    color: colors.primario,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
});
