import React, { type FC } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { useLanguage } from '@/core/localization/useLanguage';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';

export type ProductSortOption =
  'popularity' | 'price_asc' | 'price_desc' | 'rating' | 'discount' | undefined;

export interface ProductSortBarProps {
  sortBy: ProductSortOption;
  onSortChange: (sort: ProductSortOption) => void;
  onOpenFilter: () => void;
  hasActiveFilters: boolean;
}

export const ProductSortBar: FC<ProductSortBarProps> = ({
  sortBy,
  onSortChange,
  onOpenFilter,
  hasActiveFilters,
}) => {
  const { theme } = useUnistyles();
  const { t } = useLanguage();

  const sortOptions = [
    { label: t('shop.popular', 'Popular'), icon: 'flame-outline', val: 'popularity' as const },
    { label: t('shop.highestRated', 'Highest Rated'), icon: 'star', val: 'rating' as const },
    {
      label: t('shop.priceLowToHigh', 'Price: Low to High'),
      icon: 'trending-up-outline',
      val: 'price_asc' as const,
    },
    {
      label: t('shop.priceHighToLow', 'Price: High to Low'),
      icon: 'trending-down-outline',
      val: 'price_desc' as const,
    },
    { label: t('shop.discount', 'Discount'), icon: 'pricetag-outline', val: 'discount' as const },
  ];

  return (
    <View style={styles.filterBar}>
      <TouchableOpacity
        onPress={onOpenFilter}
        style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
      >
        <Ionicons
          color={hasActiveFilters ? theme.colors.primary : theme.colors.text}
          name="options-outline"
          size={ms(14)}
        />
        <Typography style={styles.filterButtonText} variant="label">
          {t('common.filter', 'Filters')} {hasActiveFilters ? '●' : ''}
        </Typography>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.sortScrollContent}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {sortOptions.map((s) => {
          const isSelected = sortBy === s.val;
          return (
            <TouchableOpacity
              key={s.val}
              onPress={() => onSortChange(isSelected ? undefined : s.val)}
              style={[styles.sortPill, isSelected && styles.sortPillActive]}
            >
              <Ionicons
                color={isSelected ? theme.colors.textInverse : theme.colors.textSecondary}
                name={s.icon as any}
                size={ms(12)}
              />
              <Typography
                style={[styles.sortPillText, isSelected ? styles.sortPillTextActive : undefined]}
                variant="caption"
              >
                {s.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(16),
    paddingVertical: ms(8),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    paddingHorizontal: ms(10),
    paddingVertical: ms(5),
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceElevated,
    marginRight: ms(8),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.successLight,
  },
  filterButtonText: {
    fontSize: ms(11),
  },
  sortScrollContent: {
    gap: ms(6),
    alignItems: 'center',
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    paddingHorizontal: ms(10),
    paddingVertical: ms(5),
    borderRadius: ms(20),
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sortPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sortPillText: {
    color: theme.colors.textSecondary,
    fontSize: ms(11),
  },
  sortPillTextActive: {
    color: theme.colors.textInverse,
    fontFamily: theme.fonts.bold,
  },
}));
