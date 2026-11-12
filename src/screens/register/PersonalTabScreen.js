import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { FormField, OptionSelector, PhotoPickerField } from '../../components/FormComponents';
import DatePickerField from '../../components/DatePickerField';
import { validatePersonalTab } from '../../utils/registerValidators';
import { colors, spacing, typography } from '../../theme';

export default function PersonalTabScreen({ formData, onChangeData, isSubmitted }) {
  const validation = useMemo(() => validatePersonalTab(formData), [formData]);
  const errors = isSubmitted ? validation.errors : {};

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Paso 1: Datos Personales</Text>
      <Text style={styles.sectionSubtitle}>Información oficial del titular de la cuenta.</Text>

      <PhotoPickerField
        label="Foto de perfil (Obligatoria)*"
        uri={formData.photoUri}
        onPickPhoto={(uri) => onChangeData({ photoUri: uri })}
        error={errors.photoUri}
        helper="Toca para cargar tu foto de frente"
      />

      <FormField
        label="Nombre completo*"
        value={formData.fullName}
        onChangeText={(text) => onChangeData({ fullName: text.replace(/\d/g, '').slice(0, 50) })}
        placeholder="Ej. Juan Carlos Pérez"
        maxLength={50}
        error={errors.fullName}
        leftIcon="person-outline"
        autoCapitalize="words"
      />

      <FormField
        label="Documento de identidad (C.C.)*"
        value={formData.documentId}
        onChangeText={(text) => onChangeData({ documentId: text.replace(/\D/g, '') })}
        placeholder="6 a 10 dígitos numéricos"
        keyboardType="numeric"
        maxLength={10}
        error={errors.documentId}
        leftIcon="card-outline"
      />

      <FormField
        label="Número de celular*"
        value={formData.phone}
        onChangeText={(text) => onChangeData({ phone: text.replace(/\D/g, '') })}
        placeholder="10 dígitos (ej. 3001234567)"
        keyboardType="phone-pad"
        maxLength={10}
        error={errors.phone}
        leftIcon="call-outline"
      />

      <DatePickerField
        label="Fecha de nacimiento (Mayor de 18 años)*"
        value={formData.birthDate}
        onChangeDate={(dateStr) => onChangeData({ birthDate: dateStr })}
        placeholder="Selecciona tu fecha de nacimiento"
        error={errors.birthDate}
        leftIcon="calendar-outline"
        maxDate={todayStr}
        minYear={1940}
        maxYear={now.getFullYear()}
        initialViewDate="1995-05-15"
      />

      <OptionSelector
        label="Género*"
        options={[
          { label: 'Masculino', value: 'M' },
          { label: 'Femenino', value: 'F' },
          { label: 'Otro', value: 'O' },
        ]}
        selectedValue={formData.gender}
        onSelect={(val) => onChangeData({ gender: val })}
        error={errors.gender}
      />

      <FormField
        label="Correo electrónico*"
        value={formData.email}
        onChangeText={(text) => onChangeData({ email: text.trim() })}
        placeholder="nombre@correo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
        leftIcon="mail-outline"
      />

      <OptionSelector
        label="Idioma de la app*"
        options={[
          { label: 'Español', value: 'es' },
          { label: 'English', value: 'en' },
        ]}
        selectedValue={formData.language}
        onSelect={(val) => onChangeData({ language: val })}
        error={errors.language}
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
