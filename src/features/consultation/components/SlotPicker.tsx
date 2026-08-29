import React, { type FC } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { useLanguage } from '@/core/localization/useLanguage';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';

import type { Slot } from '../types';

export interface SlotPickerProps {
  slots: Slot[] | undefined;
  isLoading: boolean;
  selectedSlot: Slot | null;
  onSelectSlot: (slot: Slot) => void;
}

export const SlotPicker: FC<SlotPickerProps> = ({
  slots,
  isLoading,
  selectedSlot,
  onSelectSlot,
}) => {
  const { theme } = useUnistyles();
  const { t } = useLanguage();

  const morningSlots = slots?.filter((s) => s.timeOfDay === 'Morning') ?? [];
  const afternoonSlots = slots?.filter((s) => s.timeOfDay === 'Afternoon') ?? [];
  const eveningSlots = slots?.filter((s) => s.timeOfDay === 'Evening') ?? [];

  if (isLoading) {
    return (
      <View style={styles.slotsLoader}>
        <ActivityIndicator color={theme.colors.primary} size="small" />
        <Typography color={theme.colors.textSecondary} variant="caption">
          {t('consultation.checkingSlots', 'Checking available slots...')}
        </Typography>
      </View>
    );
  }

  const renderSlotGroup = (
    title: string,
    icon: keyof typeof Ionicons.glyphMap,
    groupSlots: Slot[],
  ) => {
    if (groupSlots.length === 0) return null;
    return (
      <View style={styles.timeSection}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons color={theme.colors.primary} name={icon} size={ms(16)} />
          <Typography style={styles.timeSectionLabel} variant="label">
            {title}
          </Typography>
        </View>
        <View style={styles.slotsGrid}>
          {groupSlots.map((slot) => {
            const isSelected = selectedSlot?.id === slot.id;
            const isUnavailable = slot.isBooked || slot.isExpired;
            return (
              <TouchableOpacity
                accessibilityLabel={`${slot.time}, ${slot.isExpired ? 'Expired' : slot.isBooked ? 'Booked' : 'Available'}`}
                accessibilityRole="button"
                disabled={isUnavailable}
                key={slot.id}
                onPress={() => onSelectSlot(slot)}
                style={[
                  styles.slotChip,
                  isUnavailable && styles.slotBooked,
                  isSelected && styles.slotSelected,
                ]}
              >
                <Text
                  style={[
                    styles.slotText,
                    isUnavailable && styles.slotTextBooked,
                    isSelected && styles.slotTextSelected,
                  ]}
                >
                  {slot.time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.slotsContainer}>
      {renderSlotGroup(t('consultation.morning', 'Morning'), 'sunny-outline', morningSlots)}
      {renderSlotGroup(
        t('consultation.afternoon', 'Afternoon'),
        'partly-sunny-outline',
        afternoonSlots,
      )}
      {renderSlotGroup(t('consultation.evening', 'Evening'), 'moon-outline', eveningSlots)}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  slotsLoader: {
    paddingVertical: ms(20),
    alignItems: 'center',
    gap: ms(8),
  },
  slotsContainer: {
    gap: ms(14),
    marginBottom: ms(12),
  },
  timeSection: {
    gap: ms(8),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
  },
  timeSectionLabel: {
    color: theme.colors.textSecondary,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(8),
  },
  slotChip: {
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  slotSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  slotBooked: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    opacity: 0.5,
  },
  slotText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: ms(12),
    color: theme.colors.text,
  },
  slotTextSelected: {
    color: theme.colors.textInverse,
  },
  slotTextBooked: {
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
  },
}));
