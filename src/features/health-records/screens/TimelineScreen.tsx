import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { useNetworkStore } from '@/core/api/services/syncManager';
import { useLanguage } from '@/core/localization/useLanguage';
import { NAVIGATION } from '@/navigation/constants';
import { navigate } from '@/navigation/navigationRef';
import { Badge } from '@/shared/components/Badge';
import { Chip } from '@/shared/components/Chip';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { SearchHeader } from '@/shared/components/SearchHeader';
import { Typography } from '@/shared/components/Typography';
import { useDebounce } from '@/shared/hooks';
import { ms } from '@/shared/utils/scale';

import { useInfiniteHealthRecords } from '../hooks/useHealthRecords';
import type { HealthRecord, RecordType } from '../types';

const RECORD_TYPE_CONFIG: {
  key: RecordType;
  labelKey: string;
  defaultLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant: 'success' | 'info' | 'warning' | 'error' | 'neutral';
}[] = [
  {
    key: 'prescription',
    labelKey: 'healthRecords.prescription',
    defaultLabel: 'Prescription',
    icon: 'medkit-outline',
    variant: 'success',
  },
  {
    key: 'lab_report',
    labelKey: 'healthRecords.labReport',
    defaultLabel: 'Lab Report',
    icon: 'flask-outline',
    variant: 'info',
  },
  {
    key: 'consultation',
    labelKey: 'healthRecords.consultation',
    defaultLabel: 'Consultation',
    icon: 'calendar-outline',
    variant: 'warning',
  },
  {
    key: 'vaccination',
    labelKey: 'healthRecords.vaccination',
    defaultLabel: 'Vaccination',
    icon: 'shield-checkmark-outline',
    variant: 'neutral',
  },
  {
    key: 'allergy',
    labelKey: 'healthRecords.allergy',
    defaultLabel: 'Allergy',
    icon: 'alert-circle-outline',
    variant: 'error',
  },
];

export function TimelineScreen(): React.JSX.Element {
  const { theme, rt } = useUnistyles();
  const { t } = useLanguage();
  const isConnected = useNetworkStore((s) => s.isConnected);
  const chipsListRef = useRef<FlatList>(null);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const [selectedType, setSelectedType] = useState<RecordType | undefined>();

  const filters = useMemo(
    () => ({
      query: debouncedQuery || undefined,
      type: selectedType,
    }),
    [debouncedQuery, selectedType],
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
  } = useInfiniteHealthRecords(filters);

  const records = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const handleRecordPress = useCallback((record: HealthRecord) => {
    navigate(NAVIGATION.RECORD_DETAIL, { recordId: record.id });
  }, []);

  const handleSelectChip = (type: RecordType | undefined, index: number) => {
    setSelectedType(type);
    chipsListRef.current?.scrollToIndex({
      index,
      viewPosition: 0.5,
      animated: true,
    });
  };

  const renderItem = useCallback(
    ({ item, index }: { item: HealthRecord; index: number }) => {
      const prev = records[index - 1];
      const showHeader = !prev || prev.monthYearGroup !== item.monthYearGroup;
      const typeConfig = RECORD_TYPE_CONFIG.find((c) => c.key === item.type);

      return (
        <View>
          {showHeader && (
            <View style={styles.stickyHeader}>
              <Ionicons color={theme.colors.primary} name="calendar" size={ms(14)} />
              <Typography numberOfLines={1} style={styles.stickyHeaderText} variant="label">
                {item.monthYearGroup}
              </Typography>
            </View>
          )}

          <TouchableOpacity
            accessibilityLabel={`${item.title}, ${item.date}`}
            accessibilityRole="button"
            onPress={() => handleRecordPress(item)}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons
                  color={theme.colors.primary}
                  name={typeConfig?.icon ?? 'document-text-outline'}
                  size={ms(18)}
                />
              </View>
              <View style={styles.headerTextCol}>
                <Typography numberOfLines={1} variant="bodySemiBold">
                  {item.title}
                </Typography>
                <Typography color={theme.colors.textSecondary} variant="caption">
                  {item.date} • {item.doctorName}
                </Typography>
              </View>
              <Badge
                label={t(typeConfig?.labelKey || '', typeConfig?.defaultLabel || item.type)}
                variant={typeConfig?.variant ?? 'neutral'}
              />
            </View>

            <Typography numberOfLines={2} style={styles.notes} variant="bodySmall">
              {item.notes}
            </Typography>

            {item.attachments && item.attachments.length > 0 && (
              <View style={styles.attBadge}>
                <Ionicons color={theme.colors.textSecondary} name="attach" size={ms(14)} />
                <Typography color={theme.colors.textSecondary} variant="caption">
                  {item.attachments.length} {t('healthRecords.attachments', 'Attachments')}
                </Typography>
              </View>
            )}
          </TouchableOpacity>
        </View>
      );
    },
    [records, handleRecordPress, theme, t],
  );

  const renderFooter = () => {
    if (!isConnected || !isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={theme.colors.primary} size="small" />
        <Typography style={styles.footerText} variant="caption">
          {t('common.loading', 'Loading historical records...')}
        </Typography>
      </View>
    );
  };

  const chipItems = useMemo(
    () => [
      {
        type: undefined,
        label: t('healthRecords.allTypes', 'All Types'),
        icon: 'albums-outline' as const,
      },
      ...RECORD_TYPE_CONFIG.map((c) => ({
        type: c.key,
        label: t(c.labelKey, c.defaultLabel),
        icon: c.icon,
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
          'healthRecords.searchPlaceholder',
          'Search reports, prescriptions, allergies...',
        )}
        query={query}
        subtitle={
          records.length > 0
            ? `${records.length} ${t('healthRecords.recordsFound', 'Timeline Records Loaded')}`
            : t('healthRecords.medicalHistory', 'Lifetime Ayurvedic Medical History')
        }
        title={t('healthRecords.title', 'Patient Health Timeline')}
      />

      {/* Auto-Centering Type Filter Chips */}
      <View style={styles.chipsWrapper}>
        <FlatList
          contentContainerStyle={styles.chipsScrollContent}
          data={chipItems}
          horizontal
          keyExtractor={(item, index) => `${item.type || 'all'}-${index}`}
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
            const isSelected = selectedType === item.type;
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
                onPress={() => handleSelectChip(item.type, index)}
                selected={isSelected}
              />
            );
          }}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Timeline List */}
      {isLoading && records.length === 0 ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Typography style={styles.loaderText} variant="bodySmall">
            {t('common.loading', 'Loading health records...')}
          </Typography>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(rt.insets.bottom, ms(40)) },
          ]}
          data={records}
          initialNumToRender={15}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            isError && records.length === 0 ? (
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
                  'healthRecords.noRecordsSub',
                  'Your medical history, prescriptions, and lab tests will appear here chronologically.',
                )}
                iconName="document-text-outline"
                onAction={() => {
                  setQuery('');
                  setSelectedType(undefined);
                }}
                title={t('healthRecords.noRecords', 'No Health Records Found')}
              />
            )
          }
          ListFooterComponent={renderFooter}
          maxToRenderPerBatch={20}
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
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: ms(6),
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: ms(5),
    paddingHorizontal: ms(10),
    borderRadius: theme.radius.sm,
    marginVertical: ms(8),
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  stickyHeaderText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  listContent: {
    paddingHorizontal: ms(16),
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: ms(16),
    marginBottom: ms(10),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
    marginBottom: ms(8),
  },
  iconCircle: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
    gap: ms(2),
  },
  notes: {
    color: theme.colors.textSecondary,
    marginBottom: ms(6),
  },
  attBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    marginTop: ms(4),
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
