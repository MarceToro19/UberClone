// AI-assisted: see docs/AI_LOG.md #3
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PersonalTabScreen from './PersonalTabScreen';
import VehicleTabScreen from './VehicleTabScreen';
import DocumentsTabScreen from './DocumentsTabScreen';
import { useDriverSession } from '../../context/DriverSessionContext';
import {
  validatePersonalTab,
  validateVehicleTab,
  validateDocumentsTab,
} from '../../utils/registerValidators';
import { colors, spacing, radius, typography } from '../../theme';

export default function RegisterTabsScreen({ onRegistrationSuccess }) {
  const insets = useSafeAreaInsets();
  const { registerForm, updateFormTab, submitRegistration } = useDriverSession();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'vehicle' | 'documents'
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Evaluaciones reactivas de validez de cada pestaña (Sección 2)
  const isPersonalValid = useMemo(
    () => validatePersonalTab(registerForm.personal).isValid,
    [registerForm.personal]
  );

  const isVehicleValid = useMemo(
    () => validateVehicleTab(registerForm.vehicle).isValid,
    [registerForm.vehicle]
  );

  const isDocumentsValid = useMemo(
    () => validateDocumentsTab(registerForm.documents, registerForm.vehicle.year).isValid,
    [registerForm.documents, registerForm.vehicle.year]
  );

  // Solo se habilita el botón Enviar registro cuando las tres están completas y válidas (Sección 2)
  const isAllValid = isPersonalValid && isVehicleValid && isDocumentsValid;

  const handleSubmit = () => {
    setHasAttemptedSubmit(true);
    if (isAllValid) {
      submitRegistration();
      if (onRegistrationSuccess) {
        onRegistrationSuccess();
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Cabecera con selector de Pestañas */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registro de Conductor</Text>
        <Text style={styles.headerSubtitle}>Completa las 3 secciones obligatorias</Text>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'personal' && styles.tabButtonActive]}
            onPress={() => setActiveTab('personal')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isPersonalValid ? 'checkmark-circle' : 'person-circle-outline'}
              size={18}
              color={isPersonalValid ? colors.primario : activeTab === 'personal' ? colors.texto : colors.textoSuave}
            />
            <Text style={[styles.tabButtonText, activeTab === 'personal' && styles.tabButtonTextActive]}>
              1. Personales
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'vehicle' && styles.tabButtonActive]}
            onPress={() => setActiveTab('vehicle')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isVehicleValid ? 'checkmark-circle' : 'car-sport-outline'}
              size={18}
              color={isVehicleValid ? colors.primario : activeTab === 'vehicle' ? colors.texto : colors.textoSuave}
            />
            <Text style={[styles.tabButtonText, activeTab === 'vehicle' && styles.tabButtonTextActive]}>
              2. Vehículo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'documents' && styles.tabButtonActive]}
            onPress={() => setActiveTab('documents')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isDocumentsValid ? 'checkmark-circle' : 'document-text-outline'}
              size={18}
              color={isDocumentsValid ? colors.primario : activeTab === 'documents' ? colors.texto : colors.textoSuave}
            />
            <Text style={[styles.tabButtonText, activeTab === 'documents' && styles.tabButtonTextActive]}>
              3. Documentos
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido dinámico según pestaña activa */}
      <View style={styles.body}>
        {activeTab === 'personal' && (
          <PersonalTabScreen
            formData={registerForm.personal}
            onChangeData={(data) => updateFormTab('personal', data)}
            isSubmitted={hasAttemptedSubmit}
          />
        )}
        {activeTab === 'vehicle' && (
          <VehicleTabScreen
            formData={registerForm.vehicle}
            onChangeData={(data) => updateFormTab('vehicle', data)}
            isSubmitted={hasAttemptedSubmit}
          />
        )}
        {activeTab === 'documents' && (
          <DocumentsTabScreen
            formData={registerForm.documents}
            vehicleYear={registerForm.vehicle.year}
            onChangeData={(data) => updateFormTab('documents', data)}
            isSubmitted={hasAttemptedSubmit}
          />
        )}
      </View>

      {/* Barra inferior fija con el botón Enviar registro */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>
            Estado:{' '}
            {isAllValid ? (
              <Text style={{ color: colors.primario, fontWeight: '700' }}>✓ 3/3 Secciones válidas</Text>
            ) : (
              <Text style={{ color: colors.advertencia }}>
                {[isPersonalValid, isVehicleValid, isDocumentsValid].filter(Boolean).length}/3 Secciones listas
              </Text>
            )}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, !isAllValid && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isAllValid}
          activeOpacity={0.85}
        >
          <Ionicons name="cloud-upload-outline" size={20} color={isAllValid ? colors.blanco : colors.textoSuave} style={{ marginRight: spacing.sm }} />
          <Text style={[styles.submitButtonText, !isAllValid && styles.submitButtonTextDisabled]}>
            Enviar registro
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  header: {
    backgroundColor: colors.superficie,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
  },
  headerTitle: {
    ...typography.tituloGrande,
  },
  headerSubtitle: {
    ...typography.cuerpo,
    color: colors.textoSuave,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 4,
  },
  tabButtonActive: {
    borderBottomColor: colors.primario,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textoSuave,
  },
  tabButtonTextActive: {
    color: colors.texto,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  footer: {
    backgroundColor: colors.superficie,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borde,
  },
  statusRow: {
    marginBottom: spacing.xs,
    alignItems: 'center',
  },
  statusText: {
    ...typography.etiqueta,
    color: colors.textoSuave,
  },
  submitButton: {
    backgroundColor: colors.primario,
    borderRadius: radius.md,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.superficieClara,
  },
  submitButtonText: {
    color: colors.blanco,
    fontSize: 16,
    fontWeight: '700',
  },
  submitButtonTextDisabled: {
    color: colors.textoSuave,
  },
});
