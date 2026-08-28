import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { useLanguage } from '@/core/localization/useLanguage';
import { NAVIGATION } from '@/navigation/constants';
import { navigate } from '@/navigation/navigationRef';
import { Button } from '@/shared/components/Button';
import { Chip } from '@/shared/components/Chip';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { SearchHeader } from '@/shared/components/SearchHeader';
import { Typography } from '@/shared/components/Typography';
import { useDebounce } from '@/shared/hooks';
import { ms } from '@/shared/utils/scale';

import { DOCTOR_CARD_HEIGHT, DoctorCard } from '../components/DoctorCard';
import { useInfiniteDoctors } from '../hooks/useDoctors';
import type { Doctor, Specialization } from '../types';

const SPECIALIZATIONS: { name: Specialization; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'Panchakarma', icon: 'water-outline' },
  { name: 'Kayachikitsa', icon: 'fitness-outline' },
  { name: 'Nadi Pariksha', icon: 'pulse-outline' },
  { name: 'Shalya Tantra', icon: 'cut-outline' },
  { name: 'Dravyaguna', icon: 'leaf-outline' },
  { name: 'Prasuti & Stri Roga', icon: 'woman-outline' },
  { name: 'Kaumarbhritya', icon: 'happy-outline' },
  { name: 'Ayurvedic Dietetics', icon: 'nutrition-outline' },
];

export function DoctorListScreen(): React.JSX.Element {
  const { theme, rt } = useUnistyles();
  const { t } = useLanguage();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const [selectedSpec, setSelectedSpec] = useState<Specialization | undefined>();
  const [minExp, setMinExp] = useState<number | undefined>();
  const [maxFee, setMaxFee] = useState<number | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();
  const [availableToday, setAvailableToday] = useState(false);
  const [sortBy, setSortBy] = useState<
    'rating' | 'experience' | 'fee_asc' | 'fee_desc' | undefined
  >('rating');

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const filters = useMemo(
    () => ({
      query: debouncedQuery || undefined,
      specialization: selectedSpec,
      minExperience: minExp,
      maxFee,
      minRating,
      availableToday: availableToday || undefined,
      sortBy,
    }),
    [debouncedQuery, selectedSpec, minExp, maxFee, minRating, availableToday, sortBy],
  );

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch, isRefetching } =
    useInfiniteDoctors(filters);

  const doctors = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const handleDoctorPress = useCallback((doctor: Doctor) => {
    navigate(NAVIGATION.DOCTOR_DETAIL, { doctorId: doctor.id });
  }, []);

  const hasActiveFilters = Boolean(minExp || maxFee || minRating || availableToday);

  const handleResetFilters = () => {
    setMinExp(undefined);
    setMaxFee(undefined);
    setMinRating(undefined);
    setAvailableToday(false);
  };

  const handleApplyFilters = () => {
    setIsApplyingFilters(true);
    setTimeout(() => {
      setIsApplyingFilters(false);
      setFilterModalVisible(false);
    }, 200);
  };

  const renderItem = useCallback(
    ({ item }: { item: Doctor }) => <DoctorCard doctor={item} onPress={handleDoctorPress} />,
    [handleDoctorPress],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: DOCTOR_CARD_HEIGHT + ms(12),
      offset: (DOCTOR_CARD_HEIGHT + ms(12)) * index,
      index,
    }),
    [],
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={theme.colors.primary} size="small" />
        <Typography style={styles.footerText} variant="caption">
          {t('common.loading', 'Loading more doctors...')}
        </Typography>
      </View>
    );
  };

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset>
      {/* Unified Search Header */}
      <SearchHeader
        onQueryChange={setQuery}
        placeholder={t('consultation.searchPlaceholder', 'Search by doctor, specialty, clinic...')}
        query={query}
        subtitle={
          doctors.length > 0
            ? `${doctors.length} ${t('consultation.specialistsAvailable', 'Specialists Available')}`
            : t('consultation.title', 'Find an Ayurvedic Doctor')
        }
        title={t('consultation.title', 'Find an Ayurvedic Doctor')}
      />

      {/* Horizontally Scrolling Specialization Chips */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          contentContainerStyle={styles.chipsScrollContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <Chip
            icon={
              <Ionicons
                color={!selectedSpec ? theme.colors.textInverse : theme.colors.textSecondary}
                name="apps-outline"
                size={ms(14)}
              />
            }
            label={t('consultation.allSpecializations', 'All Specializations')}
            onPress={() => setSelectedSpec(undefined)}
            selected={!selectedSpec}
          />
          {SPECIALIZATIONS.map(({ name, icon }) => {
            const isSelected = selectedSpec === name;
            return (
              <Chip
                icon={
                  <Ionicons
                    color={isSelected ? theme.colors.textInverse : theme.colors.textSecondary}
                    name={icon}
                    size={ms(14)}
                  />
                }
                key={name}
                label={name}
                onPress={() => setSelectedSpec(isSelected ? undefined : name)}
                selected={isSelected}
              />
            );
          })}
        </ScrollView>
      </View>

      {/* Filter & Sort Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
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
          {(
            [
              { label: t('common.rating', 'Highest Rated'), icon: 'star', val: 'rating' },
              {
                label: t('common.experience', 'Experience'),
                icon: 'time-outline',
                val: 'experience',
              },
              {
                label: t('shop.priceLowToHigh', 'Fee: Low to High'),
                icon: 'trending-up-outline',
                val: 'fee_asc',
              },
              {
                label: t('shop.priceHighToLow', 'Fee: High to Low'),
                icon: 'trending-down-outline',
                val: 'fee_desc',
              },
            ] as const
          ).map((s) => {
            const isSelected = sortBy === s.val;
            return (
              <TouchableOpacity
                key={s.val}
                onPress={() => setSortBy(isSelected ? undefined : s.val)}
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

      {/* Doctor Virtualized List */}
      {isLoading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Typography style={styles.loaderText} variant="bodySmall">
            {t('common.loading', 'Finding Ayurvedic Specialists...')}
          </Typography>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(rt.insets.bottom, ms(20)) },
          ]}
          data={doctors}
          getItemLayout={getItemLayout}
          initialNumToRender={10}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <EmptyState
              actionTitle={t('common.reset', 'Reset Filters')}
              description={t(
                'consultation.noResultsSub',
                'Try adjusting your search query or removing active filters.',
              )}
              iconName="search-outline"
              onAction={() => {
                setQuery('');
                setSelectedSpec(undefined);
                handleResetFilters();
              }}
              title={t('common.noResults', 'No Doctors Found')}
            />
          }
          ListFooterComponent={renderFooter}
          maxToRenderPerBatch={15}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              colors={[theme.colors.primary]}
              onRefresh={refetch}
              refreshing={isRefetching}
              tintColor={theme.colors.primary}
            />
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          windowSize={5}
        />
      )}

      {/* Advanced Filter Modal */}
      <Modal
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
        transparent
        visible={filterModalVisible}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="h2">
                {t('consultation.filterSpecialists', 'Filter Specialists')}
              </Typography>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons color={theme.colors.textSecondary} name="close" size={ms(22)} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              {/* Availability Filter */}
              <Typography style={styles.sectionLabel} variant="label">
                {t('consultation.availability', 'Availability')}
              </Typography>
              <TouchableOpacity
                onPress={() => setAvailableToday((v) => !v)}
                style={[styles.checkboxRow, availableToday && styles.checkboxRowActive]}
              >
                <View style={styles.optionLeftRow}>
                  <Ionicons color={theme.colors.primary} name="flash-outline" size={ms(16)} />
                  <Typography variant="bodySemiBold">
                    {t('common.today', 'Available Today')}
                  </Typography>
                </View>
                {availableToday && (
                  <Ionicons color={theme.colors.primary} name="checkmark" size={ms(18)} />
                )}
              </TouchableOpacity>

              {/* Minimum Experience */}
              <Typography style={styles.sectionLabel} variant="label">
                {t('consultation.minimumExperience', 'Minimum Experience')}
              </Typography>
              <View style={styles.rowWrap}>
                {[5, 10, 15, 20].map((exp) => (
                  <Chip
                    key={exp}
                    label={`${exp}+ ${t('common.years', 'Years')}`}
                    onPress={() => setMinExp(minExp === exp ? undefined : exp)}
                    selected={minExp === exp}
                  />
                ))}
              </View>

              {/* Maximum Fee */}
              <Typography style={styles.sectionLabel} variant="label">
                {t('consultation.maximumFee', 'Maximum Fee')}
              </Typography>
              <View style={styles.rowWrap}>
                {[500, 800, 1200, 2000].map((fee) => (
                  <Chip
                    key={fee}
                    label={`${t('common.under', 'Under')} ₹${fee}`}
                    onPress={() => setMaxFee(maxFee === fee ? undefined : fee)}
                    selected={maxFee === fee}
                  />
                ))}
              </View>

              {/* Minimum Rating */}
              <Typography style={styles.sectionLabel} variant="label">
                {t('consultation.minimumRating', 'Minimum Rating')}
              </Typography>
              <View style={styles.rowWrap}>
                {[4.0, 4.5, 4.8].map((rating) => (
                  <Chip
                    key={rating}
                    label={`★ ${rating}+`}
                    onPress={() => setMinRating(minRating === rating ? undefined : rating)}
                    selected={minRating === rating}
                  />
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                onPress={handleResetFilters}
                style={styles.modalBtn}
                title={t('common.reset', 'Reset')}
                variant="secondary"
              />
              <Button
                isLoading={isApplyingFilters}
                onPress={handleApplyFilters}
                style={styles.modalBtn}
                title={t('common.apply', 'Apply Filters')}
                variant="primary"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  chipsWrapper: {
    paddingVertical: ms(4),
  },
  chipsScrollContent: {
    paddingHorizontal: ms(16),
    gap: ms(8),
  },
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
  listContent: {
    paddingHorizontal: ms(16),
    paddingTop: ms(6),
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ms(32),
  },
  loaderText: {
    color: theme.colors.textSecondary,
    marginTop: ms(12),
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ms(16),
    gap: ms(8),
  },
  footerText: {
    color: theme.colors.textSecondary,
  },
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
