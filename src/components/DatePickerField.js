import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const SHORT_MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

const WEEKDAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

function parseDateStr(str) {
  if (!str || typeof str !== 'string') return null;
  const match = str.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function formatDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatReadableDate(str) {
  const parsed = parseDateStr(str);
  if (!parsed) return '';
  return `${parsed.day} de ${MONTH_NAMES[parsed.month].toLowerCase()} de ${parsed.year}`;
}

function getLocalTodayStr() {
  const now = new Date();
  return formatDateStr(now.getFullYear(), now.getMonth(), now.getDate());
}

export default function DatePickerField({
  label,
  value,
  onChangeDate,
  placeholder = 'Selecciona una fecha',
  error,
  leftIcon = 'calendar-outline',
  helperText,
  minDate,
  maxDate,
  minYear,
  maxYear,
  initialViewDate,
}) {
  const currentYear = new Date().getFullYear();
  const effectiveMinYear = minYear !== undefined ? minYear : currentYear - 80;
  const effectiveMaxYear = maxYear !== undefined ? maxYear : currentYear + 15;
  const todayStr = getLocalTodayStr();

  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('days');
  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [tempDate, setTempDate] = useState(value || '');

  const openPicker = () => {
    const parsed = parseDateStr(value) || parseDateStr(initialViewDate);
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    } else {
      setViewYear(currentYear);
      setViewMonth(new Date().getMonth());
    }
    setTempDate(value || '');
    setViewMode('days');
    setModalVisible(true);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      if (viewYear > effectiveMinYear) {
        setViewMonth(11);
        setViewYear((y) => y - 1);
      }
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      if (viewYear < effectiveMaxYear) {
        setViewMonth(0);
        setViewYear((y) => y + 1);
      }
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isDateDisabled = (dateStr) => {
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const weeks = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    const rows = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [viewYear, viewMonth]);

  const yearsList = useMemo(() => {
    const list = [];
    const descending = effectiveMaxYear <= currentYear && effectiveMinYear < currentYear;
    if (descending) {
      for (let y = effectiveMaxYear; y >= effectiveMinYear; y--) {
        list.push(y);
      }
    } else {
      for (let y = effectiveMinYear; y <= effectiveMaxYear; y++) {
        list.push(y);
      }
    }
    return list;
  }, [effectiveMinYear, effectiveMaxYear, currentYear]);

  const handleConfirm = () => {
    if (tempDate) {
      onChangeDate(tempDate);
    }
    setModalVisible(false);
  };

  const displayText = value ? formatReadableDate(value) : placeholder;

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.inputWrapper, error ? styles.inputError : null]}
        onPress={openPicker}
        activeOpacity={0.75}
      >
        <Ionicons
          name={leftIcon}
          size={18}
          color={value ? colors.primario : colors.textoSuave}
          style={styles.icon}
        />
        <Text style={[styles.valueText, !value && styles.placeholderText]} numberOfLines={1}>
          {displayText}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textoSuave} />
      </TouchableOpacity>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderLabel}>{label.replace('*', '')}</Text>
              <Text style={styles.modalHeaderDate}>
                {tempDate ? formatReadableDate(tempDate) : 'Selecciona un día'}
              </Text>
            </View>

            <View style={styles.navRow}>
              <TouchableOpacity
                style={styles.navArrow}
                onPress={handlePrevMonth}
                disabled={viewMode !== 'days'}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={viewMode === 'days' ? colors.texto : 'transparent'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.monthYearButton}
                onPress={() => setViewMode((prev) => (prev === 'days' ? 'years' : 'days'))}
                activeOpacity={0.75}
              >
                <Text style={styles.monthYearText}>
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </Text>
                <Ionicons
                  name={viewMode === 'days' ? 'caret-down' : 'caret-up'}
                  size={14}
                  color={colors.primario}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navArrow}
                onPress={handleNextMonth}
                disabled={viewMode !== 'days'}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={viewMode === 'days' ? colors.texto : 'transparent'}
                />
              </TouchableOpacity>
            </View>

            {viewMode === 'days' && (
              <View style={styles.calendarBody}>
                <View style={styles.weekRow}>
                  {WEEKDAYS.map((dayName) => (
                    <View key={dayName} style={styles.dayCell}>
                      <Text style={styles.weekdayText}>{dayName}</Text>
                    </View>
                  ))}
                </View>

                {weeks.map((week, wIdx) => (
                  <View key={wIdx} style={styles.weekRow}>
                    {week.map((dayNum, dIdx) => {
                      if (!dayNum) {
                        return <View key={`empty-${wIdx}-${dIdx}`} style={styles.dayCell} />;
                      }
                      const cellDateStr = formatDateStr(viewYear, viewMonth, dayNum);
                      const disabled = isDateDisabled(cellDateStr);
                      const isSelected = tempDate === cellDateStr;
                      const isToday = todayStr === cellDateStr;

                      return (
                        <TouchableOpacity
                          key={cellDateStr}
                          style={styles.dayCell}
                          disabled={disabled}
                          onPress={() => setTempDate(cellDateStr)}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.dayCircle,
                              isToday && !isSelected && styles.dayToday,
                              isSelected && styles.daySelected,
                              disabled && styles.dayDisabled,
                            ]}
                          >
                            <Text
                              style={[
                                styles.dayText,
                                isToday && !isSelected && styles.dayTodayText,
                                isSelected && styles.daySelectedText,
                                disabled && styles.dayDisabledText,
                              ]}
                            >
                              {dayNum}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            )}

            {viewMode === 'years' && (
              <ScrollView style={styles.selectorScroll} contentContainerStyle={styles.gridSelector}>
                {yearsList.map((yr) => {
                  const active = yr === viewYear;
                  return (
                    <TouchableOpacity
                      key={yr}
                      style={[styles.gridItem, active && styles.gridItemActive]}
                      onPress={() => {
                        setViewYear(yr);
                        setViewMode('months');
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.gridItemText, active && styles.gridItemTextActive]}>
                        {yr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {viewMode === 'months' && (
              <View style={styles.gridSelector}>
                {SHORT_MONTHS.map((mName, mIdx) => {
                  const active = mIdx === viewMonth;
                  return (
                    <TouchableOpacity
                      key={mName}
                      style={[styles.gridItem, active && styles.gridItemActive]}
                      onPress={() => {
                        setViewMonth(mIdx);
                        setViewMode('days');
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.gridItemText, active && styles.gridItemTextActive]}>
                        {mName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.footerRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.75}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, !tempDate && styles.confirmButtonDisabled]}
                onPress={handleConfirm}
                disabled={!tempDate}
                activeOpacity={0.8}
              >
                <Text style={[styles.confirmButtonText, !tempDate && styles.confirmButtonTextDisabled]}>
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  icon: {
    marginRight: spacing.sm,
  },
  valueText: {
    flex: 1,
    color: colors.texto,
    fontSize: 14,
  },
  placeholderText: {
    color: colors.textoSuave,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.superficie,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borde,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: colors.superficieClara,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
  },
  modalHeaderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primario,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  modalHeaderDate: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.texto,
    marginTop: 4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.fondo,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  monthYearText: {
    color: colors.texto,
    fontSize: 14,
    fontWeight: '700',
  },
  calendarBody: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textoSuave,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayToday: {
    borderWidth: 1,
    borderColor: colors.primario,
  },
  daySelected: {
    backgroundColor: colors.primario,
  },
  dayDisabled: {
    opacity: 0.28,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.texto,
  },
  dayTodayText: {
    color: colors.primario,
    fontWeight: '700',
  },
  daySelectedText: {
    color: colors.fondo,
    fontWeight: '800',
  },
  dayDisabledText: {
    color: colors.textoSuave,
  },
  selectorScroll: {
    maxHeight: 240,
  },
  gridSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  gridItem: {
    width: '29%',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.fondo,
    borderWidth: 1,
    borderColor: colors.borde,
    alignItems: 'center',
  },
  gridItemActive: {
    backgroundColor: colors.primarioSuave,
    borderColor: colors.primario,
  },
  gridItemText: {
    color: colors.texto,
    fontSize: 13,
    fontWeight: '600',
  },
  gridItemTextActive: {
    color: colors.primario,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borde,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  cancelButtonText: {
    color: colors.textoSuave,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: colors.primario,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.superficieClara,
  },
  confirmButtonText: {
    color: colors.fondo,
    fontSize: 14,
    fontWeight: '800',
  },
  confirmButtonTextDisabled: {
    color: colors.textoSuave,
  },
});

