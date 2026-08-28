import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  TextInput,
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
import { LanguageToggle } from '@/shared/components/LanguageToggle';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { Typography } from '@/shared/components/Typography';
import { useDebounce } from '@/shared/hooks';
import { ms } from '@/shared/utils/scale';

import { DOCTOR_CARD_HEIGHT, DoctorCard } from '../components/DoctorCard';
import { useInfiniteDoctors } from '../hooks/useDoctors';
import type { Doctor, DoctorFilterParams, Specialization } from '../types';

const SPECIALIZATIONS: readonly Specialization[] = [
  'Panchakarma',
  'Kayachikitsa',
  'Nadi Pariksha',
  'Shalya Tantra',
  'Dravyaguna',
  'Prasuti & Stri Roga',
  'Kaumarbhritya',
  'Ayurvedic Dietetics',
];

const ROW_HEIGHT = DOCTOR_CARD_HEIGHT + ms(12);

export function DoctorListScreen(): React.JSX.Element {
  const { theme } = useUnistyles();
  const { t } = useLanguage();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);

  const [selectedSpec, setSelectedSpec] = useState<Specialization | undefined>();
  const [sortBy, setSortBy] = useState<DoctorFilterParams['sortBy']>('rating');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const [minExp, setMinExp] = useState<number | undefined>();
  const [maxFee, setMaxFee] = useState<number | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();
  const [availableToday, setAvailableToday] = useState<boolean>(false);

  const hasActiveFilters = Boolean(
    minExp !== undefined || maxFee !== undefined || minRating !== undefined || availableToday,
  );

  const filters: DoctorFilterParams = useMemo(
    () => ({
      query: debouncedQuery.trim() || undefined,
      specialization: selectedSpec,
      minExperience: minExp,
      maxFee,
      minRating,
      availableToday: availableToday || undefined,
      sortBy,
    }),
    [debouncedQuery, selectedSpec, minExp, maxFee, minRating, availableToday, sortBy],
  );

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteDoctors(filters);

  const allDoctors = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const totalCount = data?.pages[0]?.total ?? 0;

  const handleDoctorPress = useCallback((doctor: Doctor) => {
    navigate(NAVIGATION.DOCTOR_DETAIL, { doctorId: doctor.id });
  }, []);

  const handleApplyFilters = useCallback(() => {
    setIsApplyingFilters(true);
    setTimeout(() => {
      setIsApplyingFilters(false);
      setFilterModalVisible(false);
    }, 250);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Doctor }) => <DoctorCard doctor={item} onPress={handleDoctorPress} />,
    [handleDoctorPress],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * index,
      index,
    }),
    [],
  );

  const keyExtractor = useCallback((item: Doctor) => item.id, []);

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset>
      {/* Top Header Row */}
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Typography variant="h1">
            {t('consultation.title', 'Find an Ayurvedic Doctor')}
          </Typography>
          <Typography style={styles.subtitle} variant="bodySmall">
            {totalCount > 0
              ? `${totalCount.toLocaleString()} ${t('consultation.specialistsAvailable', 'Specialists Available')}`
              : t('consultation.title')}
          </Typography>
        </View>
        <LanguageToggle />
      </View>

      {/* Search Bar Container with Live Debounce */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons color={theme.colors.textSecondary} name="search-outline" size={ms(18)} />
          <TextInput
            accessibilityLabel={t('consultation.searchPlaceholder')}
            clearButtonMode="while-editing"
            onChangeText={setQuery}
            placeholder={t(
              'consultation.searchPlaceholder',
              'Search by doctor, specialty, clinic...',
            )}
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.searchInput}
            value={query}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons color={theme.colors.textTertiary} name="close-circle" size={ms(18)} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Horizontally Scrolling Specialization Chips */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          contentContainerStyle={styles.chipsScrollContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <Chip
            label={t('consultation.allSpecializations', 'All Specializations')}
            onPress={() => setSelectedSpec(undefined)}
            selected={!selectedSpec}
          />
          {SPECIALIZATIONS.map((spec) => (
            <Chip
              key={spec}
              label={spec}
              onPress={() => setSelectedSpec(selectedSpec === spec ? undefined : spec)}
              selected={selectedSpec === spec}
            />
          ))}
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
              { label: 'Price: Low to High', icon: 'trending-up-outline', val: 'fee_asc' },
              { label: 'Price: High to Low', icon: 'trending-down-outline', val: 'fee_desc' },
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
                  size={ms(13)}
                />
                <Typography
                  style={isSelected ? styles.sortPillTextActive : styles.sortPillText}
                  variant="bodySmallSemiBold"
                >
                  {s.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Doctor List */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Typography style={styles.loadingText} variant="bodySmall">
            {t('common.loading', 'Loading specialists...')}
          </Typography>
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Typography style={styles.errorText} variant="error">
            {t('common.error', 'Could not load doctors.')}
          </Typography>
          <Button onPress={() => refetch()} title={t('common.retry', 'Retry')} variant="primary" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={allDoctors}
          getItemLayout={getItemLayout}
          initialNumToRender={10}
          keyExtractor={keyExtractor}
          ListEmptyComponent={
            <EmptyState
              description={t(
                'consultation.noResultsSub',
                'Try adjusting your search query or removing active filters.',
              )}
              iconName="search-outline"
              title={t('common.noResults', 'No doctors found')}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={theme.colors.primary} size="small" />
                <Typography style={styles.footerLoaderText} variant="caption">
                  {t('common.loading', 'Loading more doctors...')}
                </Typography>
              </View>
            ) : (
              <View style={{ height: ms(20) }} />
            )
          }
          maxToRenderPerBatch={15}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={2}
          onRefresh={refetch}
          refreshing={isLoading}
          removeClippedSubviews={false}
          renderItem={renderItem}
          windowSize={15}
        />
      )}

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
        transparent
        visible={filterModalVisible}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="h2">{t('common.filter', 'Filter Specialists')}</Typography>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons color={theme.colors.textSecondary} name="close" size={ms(22)} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Typography style={styles.sectionLabel} variant="label">
                {t('consultation.availability', 'Availability')}
              </Typography>
              <TouchableOpacity
                onPress={() => setAvailableToday(!availableToday)}
                style={[styles.modalOption, availableToday && styles.modalOptionSelected]}
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

              <Typography style={styles.sectionLabel} variant="label">
                {t('consultation.maximumFee', 'Maximum Fee')}
              </Typography>
              <View style={styles.rowWrap}>
                {[500, 1000, 1500, 2000].map((fee) => (
                  <Chip
                    key={fee}
                    label={`Under ₹${fee}`}
                    onPress={() => setMaxFee(maxFee === fee ? undefined : fee)}
                    selected={maxFee === fee}
                  />
                ))}
              </View>

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
                onPress={() => {
                  setMinExp(undefined);
                  setMaxFee(undefined);
                  setMinRating(undefined);
                  setAvailableToday(false);
                }}
                style={{ flex: 1 }}
                title={t('common.reset', 'Reset')}
                variant="secondary"
              />
              <Button
                isLoading={isApplyingFilters}
                onPress={handleApplyFilters}
                style={{ flex: 2 }}
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

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(16),
    paddingTop: ms(8),
    paddingBottom: ms(6),
  },
  headerTextWrap: {
    flex: 1,
    marginRight: ms(12),
  },
  subtitle: {
    marginTop: ms(2),
  },
  searchWrapper: {
    paddingHorizontal: ms(16),
    marginTop: ms(8),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: ms(12),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: ms(46),
    gap: ms(8),
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: ms(14),
    color: theme.colors.text,
    height: '100%',
  },
  chipsWrapper: {
    marginTop: ms(10),
  },
  chipsScrollContent: {
    paddingHorizontal: ms(16),
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: ms(16),
    marginVertical: ms(10),
  },
  sortScrollContent: {
    paddingRight: ms(16),
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    paddingHorizontal: ms(12),
    paddingVertical: ms(7),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: ms(8),
  },
  filterButtonActive: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: ms(12),
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    paddingHorizontal: ms(12),
    paddingVertical: ms(7),
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.sm,
    marginRight: ms(6),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sortPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sortPillText: {
    color: theme.colors.textSecondary,
    fontSize: ms(12),
  },
  sortPillTextActive: {
    color: theme.colors.textInverse,
    fontSize: ms(12),
  },
  listContent: {
    paddingHorizontal: ms(16),
    paddingBottom: ms(24),
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ms(24),
  },
  loadingText: {
    marginTop: ms(12),
  },
  errorText: {
    marginBottom: ms(12),
  },
  footerLoader: {
    paddingVertical: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(6),
  },
  footerLoaderText: {
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: ms(14),
  },
  modalBody: {
    paddingVertical: ms(12),
  },
  sectionLabel: {
    marginTop: ms(14),
    marginBottom: ms(8),
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: ms(12),
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  optionLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
  },
  modalOptionSelected: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.primary,
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
    paddingTop: ms(12),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
}));
