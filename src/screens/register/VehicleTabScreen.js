// AI-assisted: see docs/AI_LOG.md #3
import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { FormField, OptionSelector, PhotoPickerField } from '../../components/FormComponents';
import { validateVehicleTab } from '../../utils/registerValidators';
import { colors, spacing, typography } from '../../theme';

export default function VehicleTabScreen({ formData, onChangeData, isSubmitted }) {
  const validation = useMemo(() => validateVehicleTab(formData), [formData]);
  const errors = isSubmitted ? validation.errors : {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Paso 2: Datos del Vehículo</Text>
      <Text style={styles.sectionSubtitle}>Información del auto con el que prestarás el servicio.</Text>

      <OptionSelector
        label="Categoría del servicio*"
        options={[
          { label: 'Económico (1-4 pas)', value: 'economy' },
          { label: 'XL (Mínimo 6 pas)', value: 'xl' },
          { label: 'Premium (Confort)', value: 'premium' },
        ]}
        selectedValue={formData.category}
        onSelect={(val) => {
          const updates = { category: val };
          // Si elige XL y la capacidad actual es menor a 6, se sugiere 6
          if (val === 'xl' && parseInt(formData.capacity, 10) < 6) {
            updates.capacity = '6';
          }
          onChangeData(updates);
        }}
        error={errors.category}
      />

      <FormField
        label="Placa del vehículo (Carro colombiano)*"
        value={formData.plate}
        onChangeText={(text) => onChangeData({ plate: text.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
        placeholder="Ej. ABC123"
        autoCapitalize="characters"
        maxLength={6}
        error={errors.plate}
        leftIcon="barcode-outline"
        helperText="Formato 3 letras y 3 números"
      />

      <FormField
        label="Marca y modelo*"
        value={formData.brandModel}
        onChangeText={(text) => onChangeData({ brandModel: text })}
        placeholder="Ej. Chevrolet Onix / Renault Logan"
        maxLength={30}
        error={errors.brandModel}
        leftIcon="car-sport-outline"
      />

      <FormField
        label="Año de fabricación*"
        value={formData.year}
        onChangeText={(text) => onChangeData({ year: text.replace(/\D/g, '') })}
        placeholder="Ej. 2022"
        keyboardType="numeric"
        maxLength={4}
        error={errors.year}
        leftIcon="calendar-number-outline"
      />

      <OptionSelector
        label="Color*"
        options={[
          { label: 'Blanco', value: 'Blanco' },
          { label: 'Negro', value: 'Negro' },
          { label: 'Gris', value: 'Gris' },
          { label: 'Rojo', value: 'Rojo' },
          { label: 'Azul', value: 'Azul' },
        ]}
        selectedValue={formData.color}
        onSelect={(val) => onChangeData({ color: val })}
        error={errors.color}
      />

      <FormField
        label="Capacidad de pasajeros*"
        value={formData.capacity}
        onChangeText={(text) => onChangeData({ capacity: text.replace(/\D/g, '') })}
        placeholder={formData.category === 'xl' ? 'Mínimo 6 pasajeros' : 'Ej. 4'}
        keyboardType="numeric"
        maxLength={2}
        error={errors.capacity}
        leftIcon="people-outline"
        helperText={formData.category === 'xl' ? 'Requisito obligatorio para XL: mínimo 6 pasajeros' : null}
      />

      <PhotoPickerField
        label="Foto del vehículo con placa visible*"
        uri={formData.vehiclePhotoUri}
        onPickPhoto={() => {
          onChangeData({ vehiclePhotoUri: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400' });
        }}
        error={errors.vehiclePhotoUri}
        helper="Toca para cargar foto donde se distinga la placa"
      />
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
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.titulo,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.cuerpo,
    color: colors.textoSuave,
    marginBottom: spacing.lg,
  },
});
