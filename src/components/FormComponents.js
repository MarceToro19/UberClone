// AI-assisted: see docs/AI_LOG.md #2
import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';

/**
 * Campo de texto reutilizable con label, icono y mensaje de error en línea debajo.
 * NO usa Alert para validación (cumple Sección 2 del PDF).
 */
export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  maxLength,
  autoCapitalize = 'none',
  editable = true,
  leftIcon,
  helperText,
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputError : null, !editable && styles.inputDisabled]}>
        {leftIcon && <Ionicons name={leftIcon} size={18} color={colors.textoSuave} style={styles.icon} />}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textoSuave}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          editable={editable}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
}

/**
 * Selector de opciones tipo Pills / Dropdown estilizado
 */
export function OptionSelector({ label, options, selectedValue, onSelect, error }) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsRow}>
        {options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.optionPill, isSelected && styles.optionPillActive]}
              onPress={() => onSelect(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

/**
 * Selector simulado/picker de foto para cámara o galería
 */
export function PhotoPickerField({ label, uri, onPickPhoto, error, helper = 'Toca para cargar o simular foto' }) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.photoBox, error ? styles.inputError : null]} onPress={onPickPhoto} activeOpacity={0.7}>
        {uri ? (
          <Image source={{ uri }} style={styles.photoPreview} resizeMode="cover" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera-outline" size={28} color={colors.primario} />
            <Text style={styles.photoPlaceholderText}>{helper}</Text>
          </View>
        )}
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.etiqueta,
    color: colors.texto,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.superficie,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borde,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  inputError: {
    borderColor: colors.peligro,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.texto,
    fontSize: 14,
    height: '100%',
  },
  errorText: {
    color: colors.peligro,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  helperText: {
    color: colors.textoSuave,
    fontSize: 11,
    marginTop: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionPill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  optionPillActive: {
    backgroundColor: colors.primarioSuave,
    borderColor: colors.primario,
  },
  optionText: {
    color: colors.textoSuave,
    fontSize: 13,
    fontWeight: '500',
  },
  optionTextActive: {
    color: colors.primario,
    fontWeight: '700',
  },
  photoBox: {
    height: 110,
    backgroundColor: colors.superficie,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borde,
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    color: colors.textoSuave,
    fontSize: 12,
    marginTop: 6,
  },
});
