import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius, typography } from '../theme';

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

export function PhotoPickerField({ label, uri, onPickPhoto, error, helper = 'Toca para cargar o cambiar foto' }) {
  const openGallery = async () => {
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.status !== 'granted') {
          Alert.alert('Permiso requerido', 'Autoriza el acceso a tus fotos para cargar la imagen.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri && onPickPhoto) {
        onPickPhoto(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Error seleccionando imagen:', err.message);
    }
  };

  const openCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permiso requerido', 'Autoriza el acceso a la cámara para tomar la foto.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri && onPickPhoto) {
        onPickPhoto(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Error abriendo cámara:', err.message);
    }
  };

  const handlePress = () => {
    if (Platform.OS === 'web') {
      openGallery();
      return;
    }

    Alert.alert('Seleccionar imagen', 'Elige cómo deseas cargar la foto', [
      { text: 'Cámara', onPress: openCamera },
      { text: 'Galería', onPress: openGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.photoBox, error ? styles.inputError : null]} onPress={handlePress} activeOpacity={0.7}>
        {uri ? (
          <>
            <Image source={{ uri }} style={styles.photoPreview} resizeMode="cover" />
            <View style={styles.changePhotoBadge}>
              <Ionicons name="camera-outline" size={14} color={colors.blanco} />
              <Text style={styles.changePhotoText}>Cambiar foto</Text>
            </View>
          </>
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
  changePhotoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primario,
  },
  changePhotoText: {
    color: colors.blanco,
    fontSize: 11,
    fontWeight: '700',
  },
});
