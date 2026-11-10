import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormField, PhotoPickerField } from '../../components/FormComponents';
import DatePickerField from '../../components/DatePickerField';
import { validateDocumentsTab } from '../../utils/registerValidators';
import { colors, spacing, radius, typography } from '../../theme';
import { PRICING_CONFIG } from '../../config/pricing';

export default function DocumentsTabScreen({ formData, vehicleYear, onChangeData, isSubmitted }) {
  const validation = useMemo(() => validateDocumentsTab(formData, vehicleYear), [formData, vehicleYear]);
  const errors = isSubmitted ? validation.errors : {};

  const currentYear = new Date().getFullYear();
  const vYear = parseInt(vehicleYear, 10);
  const requiresTecno = !isNaN(vYear) && currentYear - vYear >= 5;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Paso 3: Documentos y Pagos</Text>
      <Text style={styles.sectionSubtitle}>Carga los documentos legales para revisión y cuenta de cobro.</Text>

      <FormField
        label="Número de Licencia de Conducción*"
        value={formData.licenseNumber}
        onChangeText={(text) => onChangeData({ licenseNumber: text.replace(/\D/g, '').slice(0, 10) })}
        placeholder="(ej. 1098765432)"
        keyboardType="numeric"
        maxLength={10}
        error={errors.licenseNumber}
        leftIcon="document-text-outline"
      />

      <DatePickerField
        label="Fecha de vencimiento de Licencia (Futura)*"
        value={formData.licenseExpiry}
        onChangeDate={(dateStr) => onChangeData({ licenseExpiry: dateStr })}
        placeholder="Selecciona fecha de vencimiento"
        error={errors.licenseExpiry}
        leftIcon="calendar-outline"
        minDate={tomorrowStr}
        minYear={currentYear}
        maxYear={currentYear + 15}
      />

      <PhotoPickerField
        label="Foto de la Licencia de Conducción*"
        uri={formData.licensePhotoUri}
        onPickPhoto={() => {
          onChangeData({ licensePhotoUri: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=300' });
        }}
        error={errors.licensePhotoUri}
        helper="Foto clara del anverso de la licencia"
      />

      <View style={styles.separator} />

      <DatePickerField
        label="Fecha de vencimiento del SOAT (Futura)*"
        value={formData.soatExpiry}
        onChangeDate={(dateStr) => onChangeData({ soatExpiry: dateStr })}
        placeholder="Selecciona fecha de vencimiento"
        error={errors.soatExpiry}
        leftIcon="shield-checkmark-outline"
        minDate={tomorrowStr}
        minYear={currentYear}
        maxYear={currentYear + 15}
      />

      <PhotoPickerField
        label="Foto del SOAT vigente*"
        uri={formData.soatPhotoUri}
        onPickPhoto={() => {
          onChangeData({ soatPhotoUri: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300' });
        }}
        error={errors.soatPhotoUri}
        helper="Cargar certificado digital o foto del SOAT"
      />

      {requiresTecno && (
        <>
          <View style={styles.separator} />
          <Text style={styles.infoBadge}>
            Vehículo de más de 5 años: Exige Revisión Técnico-Mecánica
          </Text>
          <DatePickerField
            label="Fecha de vencimiento Técnico-Mecánica*"
            value={formData.tecnoExpiry}
            onChangeDate={(dateStr) => onChangeData({ tecnoExpiry: dateStr })}
            placeholder="Selecciona fecha de vencimiento"
            error={errors.tecnoExpiry}
            leftIcon="build-outline"
            minDate={tomorrowStr}
            minYear={currentYear}
            maxYear={currentYear + 15}
          />
          <PhotoPickerField
            label="Foto del certificado de Técnico-Mecánica*"
            uri={formData.tecnoPhotoUri}
            onPickPhoto={() => {
              onChangeData({ tecnoPhotoUri: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300' });
            }}
            error={errors.tecnoPhotoUri}
            helper="Foto del certificado de revisión"
          />
        </>
      )}

      <View style={styles.separator} />

      <FormField
        label="Correo de cuenta Mercado Pago (Recepción de pagos)*"
        value={formData.mercadoPagoEmail}
        onChangeText={(text) => onChangeData({ mercadoPagoEmail: text.trim() })}
        placeholder="cuenta.conductor@mercadopago.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.mercadoPagoEmail}
        leftIcon="wallet-outline"
        helperText="Aquí se transferirán tus ganancias netas de los viajes con pasarela"
      />

      <TouchableOpacity
        style={[styles.termsContainer, errors.termsAccepted ? styles.termsContainerError : null]}
        onPress={() => onChangeData({ termsAccepted: !formData.termsAccepted })}
        activeOpacity={0.8}
      >
        <Ionicons
          name={formData.termsAccepted ? 'checkbox' : 'square-outline'}
          size={24}
          color={formData.termsAccepted ? colors.primario : colors.textoSuave}
        />
        <View style={styles.termsTextWrapper}>
          <Text style={styles.termsText}>
            Acepto los términos y condiciones de la plataforma y la comisión de servicio del{' '}
            <Text style={styles.termsHighlight}>{PRICING_CONFIG.comisionPorcentaje * 100}%</Text> sobre cada viaje.
          </Text>
          <Text style={styles.securityNote}>
            No guardamos números de tarjeta ni cuentas bancarias en la aplicación.
          </Text>
        </View>
      </TouchableOpacity>
      {errors.termsAccepted ? <Text style={styles.termsError}>{errors.termsAccepted}</Text> : null}
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
  separator: {
    height: 1,
    backgroundColor: colors.borde,
    marginVertical: spacing.lg,
  },
  infoBadge: {
    backgroundColor: colors.superficieClara,
    color: colors.advertencia,
    padding: spacing.sm,
    borderRadius: radius.sm,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.superficie,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borde,
    marginTop: spacing.md,
  },
  termsContainerError: {
    borderColor: colors.peligro,
  },
  termsTextWrapper: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  termsText: {
    ...typography.cuerpo,
    fontSize: 13,
  },
  termsHighlight: {
    color: colors.primario,
    fontWeight: '700',
  },
  securityNote: {
    ...typography.etiqueta,
    color: colors.textoSuave,
    marginTop: 4,
  },
  termsError: {
    color: colors.peligro,
    fontSize: 11,
    marginTop: 4,
    marginLeft: spacing.xs,
  },
});
