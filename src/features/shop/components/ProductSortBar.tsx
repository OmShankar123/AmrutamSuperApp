import React, { type FC, useRef } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { useFeatureFlags } from '@/core/config/featureFlags';
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
  const sortListRef = useRef<FlatList>(null);

  const enableRatingSort = useFeatureFlags((s) => s.flags.enableDoctorRatingSort);

  const sortOptions = [
    {
      label: t('shop.popular', 'Popular'),
      icon: 'flame-outline' as const,
      val: 'popularity' as const,
    },
    ...(enableRatingSort
      ? [
          {
            label: t('shop.highestRated', 'Highest Rated'),
            icon: 'star' as const,
            val: 'rating' as const,
          },
        ]
      : []),
    {
      label: t('shop.priceLowToHigh', 'Price: Low to High'),
      icon: 'trending-up-outline' as const,
      val: 'price_asc' as const,
    },
    {
      label: t('shop.priceHighToLow', 'Price: High to Low'),
      icon: 'trending-down-outline' as const,
      val: 'price_desc' as const,
    },
    {
      label: t('shop.discount', 'Discount'),
      icon: 'pricetag-outline' as const,
      val: 'discount' as const,
    },
  ];

  const handleSelectSort = (val: ProductSortOption, index: number) => {
    onSortChange(sortBy === val ? undefined : val);
    sortListRef.current?.scrollToIndex({
      index,
      viewPosition: 0.5,
      animated: true,
    });
  };

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

      <FlatList
        contentContainerStyle={styles.sortScrollContent}
        data={sortOptions}
        horizontal
        keyExtractor={(item) => item.val}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            sortListRef.current?.scrollToIndex({
              index: info.index,
              viewPosition: 0.5,
              animated: true,
            });
          }, 100);
        }}
        ref={sortListRef}
        renderItem={({ item, index }) => {
          const isSelected = sortBy === item.val;
          return (
            <TouchableOpacity
              onPress={() => handleSelectSort(item.val, index)}
              style={[styles.sortPill, isSelected && styles.sortPillActive]}
            >
              <Ionicons
                color={isSelected ? theme.colors.textInverse : theme.colors.textSecondary}
                name={item.icon}
                size={ms(12)}
              />
              <Typography
                style={[styles.sortPillText, isSelected ? styles.sortPillTextActive : undefined]}
                variant="caption"
              >
                {item.label}
              </Typography>
            </TouchableOpacity>
          );
        }}
        showsHorizontalScrollIndicator={false}
        style={styles.sortList}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: ms(16),
    paddingVertical: ms(8),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    paddingHorizontal: ms(12),
    paddingVertical: ms(6),
    borderRadius: ms(20),
    backgroundColor: theme.colors.surfaceElevated,
    marginRight: ms(8),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: ms(11.5),
    fontFamily: theme.fonts.semiBold,
  },
  sortList: {
    flex: 1,
  },
  sortScrollContent: {
    gap: ms(6),
    alignItems: 'center',
    paddingRight: ms(16),
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    paddingHorizontal: ms(12),
    paddingVertical: ms(6),
    borderRadius: ms(20),
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sortPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sortPillText: {
    color: theme.colors.textSecondary,
    fontSize: ms(11.5),
    fontFamily: theme.fonts.semiBold,
  },
  sortPillTextActive: {
    color: theme.colors.textInverse,
    fontFamily: theme.fonts.bold,
  },
}));
