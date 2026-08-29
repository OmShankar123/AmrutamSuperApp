import React, { type FC, useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { useFeatureFlags } from '@/core/config/featureFlags';
import { useLanguage } from '@/core/localization/useLanguage';
import { Button } from '@/shared/components/Button';
import { Chip } from '@/shared/components/Chip';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';

export interface DoctorFilterModalProps {
  visible: boolean;
  onClose: () => void;
  minExperience: number | undefined;
  onSelectExperience: (exp: number | undefined) => void;
  maxFee: number | undefined;
  onSelectMaxFee: (fee: number | undefined) => void;
  minRating: number | undefined;
  onSelectMinRating: (rating: number | undefined) => void;
  availableToday: boolean;
  onToggleAvailableToday: (val: boolean) => void;
  onResetFilters: () => void;
}

export const DoctorFilterModal: FC<DoctorFilterModalProps> = ({
  visible,
  onClose,
  minExperience,
  onSelectExperience,
  maxFee,
  onSelectMaxFee,
  minRating,
  onSelectMinRating,
  availableToday,
  onToggleAvailableToday,
  onResetFilters,
}) => {
  const { theme } = useUnistyles();
  const { t } = useLanguage();
  const [isApplying, setIsApplying] = useState(false);
  const enableDoctorRatingSort = useFeatureFlags((s) => s.flags.enableDoctorRatingSort);

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      onClose();
    }, 200);
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Typography variant="h2">{t('common.filter', 'Filter Specialists')}</Typography>
            <TouchableOpacity onPress={onClose}>
              <Ionicons color={theme.colors.textSecondary} name="close" size={ms(22)} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
            {/* Availability */}
            <Typography style={styles.sectionLabel} variant="label">
              {t('consultation.availability', 'Availability')}
            </Typography>
            <TouchableOpacity
              onPress={() => onToggleAvailableToday(!availableToday)}
              style={[styles.checkboxRow, availableToday && styles.checkboxRowActive]}
            >
              <View style={styles.optionLeftRow}>
                <Ionicons color={theme.colors.primary} name="calendar-outline" size={ms(16)} />
                <Typography variant="bodySemiBold">
                  {t('consultation.availableToday', 'Available Today')}
                </Typography>
              </View>
              {availableToday && (
                <Ionicons color={theme.colors.primary} name="checkmark" size={ms(18)} />
              )}
            </TouchableOpacity>

            {/* Minimum Experience */}
            <Typography style={styles.sectionLabel} variant="label">
              {t('common.experience', 'Experience (Years)')}
            </Typography>
            <View style={styles.rowWrap}>
              {[5, 10, 15, 20].map((exp) => (
                <Chip
                  key={exp}
                  label={`${exp}+ ${t('common.years', 'Years')}`}
                  onPress={() => onSelectExperience(minExperience === exp ? undefined : exp)}
                  selected={minExperience === exp}
                />
              ))}
            </View>

            {/* Maximum Fee */}
            <Typography style={styles.sectionLabel} variant="label">
              {t('consultation.fee', 'Maximum Consultation Fee')}
            </Typography>
            <View style={styles.rowWrap}>
              {[500, 1000, 1500, 2000].map((fee) => (
                <Chip
                  key={fee}
                  label={`${t('common.under', 'Under')} ₹${fee}`}
                  onPress={() => onSelectMaxFee(maxFee === fee ? undefined : fee)}
                  selected={maxFee === fee}
                />
              ))}
            </View>

            {/* Minimum Rating (Feature Flag Controlled) */}
            {enableDoctorRatingSort && (
              <>
                <Typography style={styles.sectionLabel} variant="label">
                  {t('common.rating', 'Minimum Rating')}
                </Typography>
                <View style={styles.rowWrap}>
                  {[4.0, 4.5, 4.8].map((rating) => (
                    <Chip
                      key={rating}
                      label={`★ ${rating}+`}
                      onPress={() => onSelectMinRating(minRating === rating ? undefined : rating)}
                      selected={minRating === rating}
                    />
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              onPress={onResetFilters}
              style={styles.modalBtn}
              title={t('common.reset', 'Reset')}
              variant="secondary"
            />
            <Button
              isLoading={isApplying}
              onPress={handleApply}
              style={styles.modalBtn}
              title={t('common.apply', 'Apply Filters')}
              variant="primary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  modalBackdrop: {
    flex: 1,
    backgroundColor: theme.colors.backdrop,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: ms(24),
    borderTopRightRadius: ms(24),
    maxHeight: '80%',
    padding: ms(20),
    paddingBottom: Math.max(rt.insets.bottom, ms(20)),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: ms(12),
  },
  modalBody: {
    paddingVertical: ms(12),
  },
  sectionLabel: {
    marginTop: ms(14),
    marginBottom: ms(8),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: ms(12),
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checkboxRowActive: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.primary,
  },
  optionLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(8),
  },
  modalFooter: {
    flexDirection: 'row',
    gap: ms(12),
    marginTop: ms(16),
  },
  modalBtn: {
    flex: 1,
  },
}));
