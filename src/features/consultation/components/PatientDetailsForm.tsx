import React, { type FC } from 'react';
import { TextInput, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useLanguage } from '@/core/localization/useLanguage';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';

export interface PatientDetailsFormProps {
  name: string;
  onNameChange: (text: string) => void;
  phone: string;
  onPhoneChange: (text: string) => void;
  age: string;
  onAgeChange: (text: string) => void;
  symptoms: string;
  onSymptomsChange: (text: string) => void;
}

export const PatientDetailsForm: FC<PatientDetailsFormProps> = ({
  name,
  onNameChange,
  phone,
  onPhoneChange,
  age,
  onAgeChange,
  symptoms,
  onSymptomsChange,
}) => {
  const { theme } = useUnistyles();
  const { t } = useLanguage();

  return (
    <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <Typography style={styles.inputLabel} variant="label">
          {t('consultation.fullName', 'Full Name')} *
        </Typography>
        <TextInput
          onChangeText={onNameChange}
          placeholder={t('consultation.fullNamePlaceholder', 'e.g. Ramesh Patel')}
          placeholderTextColor={theme.colors.textTertiary}
          style={styles.input}
          value={name}
        />
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Typography style={styles.inputLabel} variant="label">
            {t('consultation.phone', 'Phone')} *
          </Typography>
          <TextInput
            keyboardType="phone-pad"
            onChangeText={onPhoneChange}
            placeholder="+91 98765 43210"
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.input}
            value={phone}
          />
        </View>

        <View style={[styles.inputGroup, { width: ms(80) }]}>
          <Typography style={styles.inputLabel} variant="label">
            {t('consultation.age', 'Age')}
          </Typography>
          <TextInput
            keyboardType="number-pad"
            maxLength={3}
            onChangeText={onAgeChange}
            placeholder="32"
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.input}
            value={age}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Typography style={styles.inputLabel} variant="label">
          {t('consultation.healthSymptoms', 'Health Concern / Symptoms')}
        </Typography>
        <TextInput
          multiline
          numberOfLines={3}
          onChangeText={onSymptomsChange}
          placeholder={t(
            'consultation.symptomsPlaceholder',
            'Describe symptoms, chronic conditions, or allergies...',
          )}
          placeholderTextColor={theme.colors.textTertiary}
          style={[styles.input, styles.textArea]}
          value={symptoms}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  formContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: ms(16),
    gap: ms(12),
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: ms(16),
  },
  inputGroup: {
    gap: ms(4),
  },
  inputLabel: {
    color: theme.colors.textSecondary,
  },
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    paddingHorizontal: ms(12),
    paddingVertical: ms(10),
    fontFamily: theme.fonts.regular,
    fontSize: ms(14),
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: ms(70),
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: ms(12),
  },
}));
