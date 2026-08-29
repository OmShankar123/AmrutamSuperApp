import React, { type FC, useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { useLanguage } from '@/core/localization/useLanguage';
import { Button } from '@/shared/components/Button';
import { Chip } from '@/shared/components/Chip';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';

import type { HealthConcern } from '../types';

const HEALTH_CONCERNS: HealthConcern[] = [
  'Hair Fall',
  'Dandruff',
  'Acne & Blemishes',
  'Acidity & Bloating',
  'Insomnia',
  'Joint Pain',
  'Low Energy',
  'Hormonal Balance',
];

export interface ProductFilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedConcern: HealthConcern | undefined;
  onSelectConcern: (concern: HealthConcern | undefined) => void;
  maxPrice: number | undefined;
  onSelectMaxPrice: (price: number | undefined) => void;
  minRating: number | undefined;
  onSelectMinRating: (rating: number | undefined) => void;
  inStockOnly: boolean;
  onToggleInStockOnly: (val: boolean) => void;
  onResetFilters: () => void;
}

export const ProductFilterModal: FC<ProductFilterModalProps> = ({
  visible,
  onClose,
  selectedConcern,
  onSelectConcern,
  maxPrice,
  onSelectMaxPrice,
  minRating,
  onSelectMinRating,
  inStockOnly,
  onToggleInStockOnly,
  onResetFilters,
}) => {
  const { theme } = useUnistyles();
  const { t } = useLanguage();
  const [isApplying, setIsApplying] = useState(false);

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
            <Typography variant="h2">{t('common.filter', 'Filter Formulations')}</Typography>
            <TouchableOpacity onPress={onClose}>
              <Ionicons color={theme.colors.textSecondary} name="close" size={ms(22)} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
            {/* Stock Status */}
            <Typography style={styles.sectionLabel} variant="label">
              {t('shop.stockAvailability', 'Stock Availability')}
            </Typography>
            <TouchableOpacity
              onPress={() => onToggleInStockOnly(!inStockOnly)}
              style={[styles.checkboxRow, inStockOnly && styles.checkboxRowActive]}
            >
              <View style={styles.optionLeftRow}>
                <Ionicons color={theme.colors.primary} name="cube-outline" size={ms(16)} />
                <Typography variant="bodySemiBold">
                  {t('shop.inStockOnly', 'In Stock Only')}
                </Typography>
              </View>
              {inStockOnly && (
                <Ionicons color={theme.colors.primary} name="checkmark" size={ms(18)} />
              )}
            </TouchableOpacity>

            {/* Health Concerns */}
            <Typography style={styles.sectionLabel} variant="label">
              {t('shop.healthConcern', 'Health Concern')}
            </Typography>
            <View style={styles.rowWrap}>
              {HEALTH_CONCERNS.map((concern) => (
                <Chip
                  key={concern}
                  label={concern}
                  onPress={() => onSelectConcern(selectedConcern === concern ? undefined : concern)}
                  selected={selectedConcern === concern}
                />
              ))}
            </View>

            {/* Maximum Price */}
            <Typography style={styles.sectionLabel} variant="label">
              {t('shop.maximumPrice', 'Maximum Price')}
            </Typography>
            <View style={styles.rowWrap}>
              {[500, 1000, 1500, 2500].map((price) => (
                <Chip
                  key={price}
                  label={`${t('common.under', 'Under')} ₹${price}`}
                  onPress={() => onSelectMaxPrice(maxPrice === price ? undefined : price)}
                  selected={maxPrice === price}
                />
              ))}
            </View>

            {/* Minimum Rating */}
            <Typography style={styles.sectionLabel} variant="label">
              {t('shop.minimumRating', 'Minimum Rating')}
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
