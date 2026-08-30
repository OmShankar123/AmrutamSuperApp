import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { useFeatureFlags } from '@/core/config/featureFlags';
import { useNetworkStore } from '@/core/api/services/syncManager';
import { useLanguage } from '@/core/localization/useLanguage';
import { NAVIGATION } from '@/navigation/constants';
import { navigate } from '@/navigation/navigationRef';
import { Chip } from '@/shared/components/Chip';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { SearchHeader } from '@/shared/components/SearchHeader';
import { Typography } from '@/shared/components/Typography';
import { useDebounce } from '@/shared/hooks';
import { ms } from '@/shared/utils/scale';

import { DoctorCard } from '../components/DoctorCard';
import { DoctorFilterModal } from '../components/DoctorFilterModal';
import { useInfiniteDoctors } from '../hooks/useDoctors';
import type { Doctor, Specialization } from '../types';

const SPECIALIZATIONS: { name: Specialization; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'Panchakarma', icon: 'water-outline' },
  { name: 'Kayachikitsa', icon: 'fitness-outline' },
  { name: 'Nadi Pariksha', icon: 'pulse-outline' },
  { name: 'Shalya Tantra', icon: 'medkit-outline' },
  { name: 'Dravyaguna', icon: 'leaf-outline' },
  { name: 'Prasuti & Stri Roga', icon: 'heart-outline' },
  { name: 'Kaumarbhritya', icon: 'people-outline' },
  { name: 'Ayurvedic Dietetics', icon: 'restaurant-outline' },
];

export function DoctorListScreen(): React.JSX.Element {
  const { theme, rt } = useUnistyles();
  const { t } = useLanguage();
  const isConnected = useNetworkStore((s) => s.isConnected);
  const chipsListRef = useRef<FlatList>(null);
  const sortListRef = useRef<FlatList>(null);

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

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteDoctors(filters);

  const doctors = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const handleDoctorPress = useCallback((doctor: Doctor) => {
    navigate(NAVIGATION.DOCTOR_DETAIL, { doctorId: doctor.id, initialDoctor: doctor });
  }, []);

  const hasActiveFilters = Boolean(minExp || maxFee || minRating || availableToday);

  const handleResetFilters = () => {
    setMinExp(undefined);
    setMaxFee(undefined);
    setMinRating(undefined);
    setAvailableToday(false);
  };

  const handleSelectChip = (spec: Specialization | undefined, index: number) => {
    setSelectedSpec(spec);
    chipsListRef.current?.scrollToIndex({
      index,
      viewPosition: 0.5,
      animated: true,
    });
  };

  const enableDoctorRatingSort = useFeatureFlags((s) => s.flags.enableDoctorRatingSort);

  const sortOptions = useMemo(() => {
    const list = [];
    if (enableDoctorRatingSort) {
      list.push({ label: t('common.rating', 'Rating'), val: 'rating' as const });
    }
    list.push(
      { label: t('common.experience', 'Experience'), val: 'experience' as const },
      { label: t('consultation.feeLowHigh', 'Fee: Low to High'), val: 'fee_asc' as const },
      { label: t('consultation.feeHighLow', 'Fee: High to Low'), val: 'fee_desc' as const },
    );
    return list;
  }, [t, enableDoctorRatingSort]);

  const handleSelectSort = (
    val: 'rating' | 'experience' | 'fee_asc' | 'fee_desc',
    index: number,
  ) => {
    setSortBy(sortBy === val ? undefined : val);
    sortListRef.current?.scrollToIndex({
      index,
      viewPosition: 0.5,
      animated: true,
    });
  };

  const renderItem = useCallback(
    ({ item }: { item: Doctor }) => <DoctorCard onPress={handleDoctorPress} doctor={item} />,
    [handleDoctorPress],
  );

  const renderFooter = () => {
    if (!isConnected || !isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={theme.colors.primary} size="small" />
        <Typography style={styles.footerText} variant="caption">
          {t('common.loading', 'Loading more doctors...')}
        </Typography>
      </View>
    );
  };

  const chipItems = useMemo(
    () => [
      {
        name: undefined,
        label: t('consultation.allSpecializations', 'All Specializations'),
        icon: 'medkit-outline' as const,
      },
      ...SPECIALIZATIONS.map((s) => ({
        name: s.name,
        label: s.name,
        icon: s.icon,
      })),
    ],
    [t],
  );

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset>
      {/* Top Search & Controls Header */}
      <SearchHeader
        onQueryChange={setQuery}
        placeholder={t(
          'consultation.searchPlaceholder',
          'Search doctors, specializations, clinics...',
        )}
        query={query}
        subtitle={
          doctors.length > 0
            ? `${doctors.length} ${t('consultation.doctorsAvailable', 'Specialists Available')}`
            : t('consultation.findSpecialist', 'Find Expert Ayurvedic Practitioners')
        }
        title={t('consultation.title', 'Ayurvedic Consultations')}
      />

      {/* Auto-Centering Specialization Filter Chips */}
      <View style={styles.chipsWrapper}>
        <FlatList
          contentContainerStyle={styles.chipsScrollContent}
          data={chipItems}
          horizontal
          keyExtractor={(item, index) => `${item.name || 'all'}-${index}`}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              chipsListRef.current?.scrollToIndex({
                index: info.index,
                viewPosition: 0.5,
                animated: true,
              });
            }, 100);
          }}
          ref={chipsListRef}
          renderItem={({ item, index }) => {
            const isSelected = selectedSpec === item.name;
            return (
              <Chip
                icon={
                  <Ionicons
                    color={isSelected ? theme.colors.textInverse : theme.colors.textSecondary}
                    name={item.icon}
                    size={ms(14)}
                  />
                }
                label={item.label}
                onPress={() => handleSelectChip(item.name, index)}
                selected={isSelected}
              />
            );
          }}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Filter & Auto-Centering Sort Bar */}
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

      {/* Doctor List */}
      {isLoading && doctors.length === 0 ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Typography style={styles.loaderText} variant="bodySmall">
            {t('common.loading', 'Loading Ayurvedic specialists...')}
          </Typography>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(rt.insets.bottom, ms(20)) },
          ]}
          data={doctors}
          initialNumToRender={10}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            isError && doctors.length === 0 ? (
              <EmptyState
                actionTitle={t('common.retry', 'Retry')}
                description={t(
                  'common.errorSub',
                  'An error occurred while communicating with the server. Please check your connection and retry.',
                )}
                iconName="alert-circle-outline"
                onAction={() => refetch()}
                title={t('common.errorTitle', 'Unable to Load Data')}
              />
            ) : (
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
            )
          }
          ListFooterComponent={renderFooter}
          maxToRenderPerBatch={15}
          onEndReached={() => {
            if (isConnected && hasNextPage && !isFetchingNextPage) {
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
          windowSize={7}
        />
      )}

      {/* Extracted Filter Modal */}
      <DoctorFilterModal
        availableToday={availableToday}
        maxFee={maxFee}
        minExperience={minExp}
        minRating={minRating}
        onClose={() => setFilterModalVisible(false)}
        onResetFilters={handleResetFilters}
        onSelectExperience={setMinExp}
        onSelectMaxFee={setMaxFee}
        onSelectMinRating={setMinRating}
        onToggleAvailableToday={setAvailableToday}
        visible={filterModalVisible}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  chipsWrapper: {
    paddingVertical: ms(4),
  },
  chipsScrollContent: {
    paddingHorizontal: ms(16),
    gap: ms(6),
  },
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
    width: '100%',
  },
  footerText: {
    color: theme.colors.textSecondary,
  },
}));
