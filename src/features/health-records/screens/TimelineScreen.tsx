import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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
import { Badge } from '@/shared/components/Badge';
import { Chip } from '@/shared/components/Chip';
import { EmptyState } from '@/shared/components/EmptyState';
import { LanguageToggle } from '@/shared/components/LanguageToggle';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
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
    key: 'lab_report',
    labelKey: 'healthRecords.labReport',
    defaultLabel: 'Lab Report',
    icon: 'flask-outline',
    variant: 'info',
  },
  {
    key: 'prescription',
    labelKey: 'healthRecords.prescription',
    defaultLabel: 'Prescription',
    icon: 'document-text-outline',
    variant: 'success',
  },
  {
    key: 'consultation',
    labelKey: 'healthRecords.consultation',
    defaultLabel: 'Consultation',
    icon: 'medkit-outline',
    variant: 'warning',
  },
  {
    key: 'vaccination',
    labelKey: 'healthRecords.vaccination',
    defaultLabel: 'Vaccination',
    icon: 'shield-checkmark-outline',
    variant: 'success',
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

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const [selectedType, setSelectedType] = useState<RecordType | undefined>(undefined);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch, isRefetching } =
    useInfiniteHealthRecords({
      query: debouncedQuery || undefined,
      type: selectedType,
    });

  const records = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const handlePressRecord = useCallback((record: HealthRecord) => {
    navigate(NAVIGATION.RECORD_DETAIL, { recordId: record.id });
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: HealthRecord; index: number }) => {
      const prevItem = index > 0 ? records[index - 1] : null;
      const isNewMonth = !prevItem || prevItem.monthYearGroup !== item.monthYearGroup;
      const typeConfig =
        RECORD_TYPE_CONFIG.find((c) => c.key === item.type) ?? RECORD_TYPE_CONFIG[0];

      return (
        <View style={styles.itemWrapper}>
          {/* Section Group Header */}
          {isNewMonth && (
            <View style={styles.monthHeader}>
              <View style={styles.monthIconWrap}>
                <Ionicons color={theme.colors.primary} name="calendar" size={ms(14)} />
              </View>
              <Typography style={styles.monthHeaderText} variant="h3">
                {item.monthYearGroup}
              </Typography>
            </View>
          )}

          {/* Timeline Card */}
          <TouchableOpacity
            accessibilityHint="Navigates to clinical health record details and attachments"
            accessibilityLabel={`${item.title}, ${item.doctorName}, ${item.formattedDate}`}
            accessibilityRole="button"
            activeOpacity={0.7}
            onPress={() => handlePressRecord(item)}
            style={styles.card}
          >
            <View style={styles.cardTopRow}>
              <Badge
                label={t(typeConfig.labelKey, typeConfig.defaultLabel)}
                variant={typeConfig.variant}
              />
              <Typography style={styles.dateText} variant="caption">
                {item.formattedDate}
              </Typography>
            </View>

            <Typography numberOfLines={2} style={styles.titleText} variant="bodySemiBold">
              {item.title}
            </Typography>

            <View style={styles.metaRow}>
              <Ionicons color={theme.colors.textSecondary} name="person-outline" size={ms(13)} />
              <Typography numberOfLines={1} style={styles.metaText} variant="caption">
                {item.doctorName}
              </Typography>
            </View>

            <View style={styles.metaRow}>
              <Ionicons color={theme.colors.textSecondary} name="business-outline" size={ms(13)} />
              <Typography numberOfLines={1} style={styles.metaText} variant="caption">
                {item.clinicOrLabName}
              </Typography>
            </View>

            {/* Dosha & Vitals Tag Pills */}
            <View style={styles.tagsRow}>
              {item.vitals?.dosha && (
                <View style={styles.doshaTag}>
                  <Ionicons color={theme.colors.primary} name="leaf-outline" size={ms(11)} />
                  <Typography style={styles.doshaTagText} variant="caption">
                    {item.vitals.dosha}
                  </Typography>
                </View>
              )}
              {item.vitals?.bp && (
                <View style={styles.vitalTag}>
                  <Ionicons color={theme.colors.error} name="heart-outline" size={ms(11)} />
                  <Typography style={styles.vitalTagText} variant="caption">
                    {item.vitals.bp}
                  </Typography>
                </View>
              )}
              {item.attachments.length > 0 && (
                <View style={styles.attachmentTag}>
                  <Ionicons color={theme.colors.info} name="attach" size={ms(12)} />
                  <Typography style={styles.attachmentTagText} variant="caption">
                    {item.attachments.length} {t('healthRecords.attachments', 'Files')}
                  </Typography>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      );
    },
    [records, theme, t, handlePressRecord],
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={theme.colors.primary} size="small" />
        <Typography style={styles.footerText} variant="caption">
          {t('common.loading', 'Loading more records...')}
        </Typography>
      </View>
    );
  };

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Typography variant="h2">{t('healthRecords.title', 'Health Timeline')}</Typography>
          <Typography style={styles.headerSub} variant="caption">
            {records.length > 0
              ? `${records.length} ${t('healthRecords.allTypes', 'Records Available')}`
              : t('healthRecords.title', 'Patient Records')}
          </Typography>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: ms(8) }}>
          <TouchableOpacity onPress={() => navigate(NAVIGATION.DEV_PANEL)} style={styles.devBtn}>
            <Ionicons color={theme.colors.textSecondary} name="construct-outline" size={ms(18)} />
          </TouchableOpacity>
          <LanguageToggle />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons color={theme.colors.textSecondary} name="search-outline" size={ms(18)} />
        <TextInput
          accessibilityLabel="Search health records"
          clearButtonMode="while-editing"
          onChangeText={setQuery}
          placeholder={t(
            'healthRecords.searchPlaceholder',
            'Search reports, prescriptions, allergies...',
          )}
          placeholderTextColor={theme.colors.textTertiary}
          style={styles.searchInput}
          value={query}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons color={theme.colors.textSecondary} name="close-circle" size={ms(18)} />
          </TouchableOpacity>
        )}
      </View>

      {/* Record Type Filter Pills */}
      <View style={styles.filterSection}>
        <ScrollView
          contentContainerStyle={styles.filterScroll}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <Chip
            icon={
              <Ionicons
                color={
                  selectedType === undefined ? theme.colors.textInverse : theme.colors.textSecondary
                }
                name="albums-outline"
                size={ms(14)}
              />
            }
            label={t('healthRecords.allTypes', 'All Types')}
            onPress={() => setSelectedType(undefined)}
            selected={selectedType === undefined}
          />
          {RECORD_TYPE_CONFIG.map((cfg) => {
            const isSelected = selectedType === cfg.key;
            return (
              <Chip
                icon={
                  <Ionicons
                    color={isSelected ? theme.colors.textInverse : theme.colors.textSecondary}
                    name={cfg.icon}
                    size={ms(14)}
                  />
                }
                key={cfg.key}
                label={t(cfg.labelKey, cfg.defaultLabel)}
                onPress={() => setSelectedType(isSelected ? undefined : cfg.key)}
                selected={isSelected}
              />
            );
          })}
        </ScrollView>
      </View>

      {/* Virtualized Timeline List */}
      {isLoading ? (
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
          }
          ListFooterComponent={renderFooter}
          maxToRenderPerBatch={20}
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
          windowSize={7}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  devBtn: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(16),
    paddingTop: ms(8),
    paddingBottom: ms(6),
  },
  headerLeft: {
    flex: 1,
  },
  headerSub: {
    color: theme.colors.textSecondary,
    marginTop: ms(2),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: ms(12),
    marginHorizontal: ms(16),
    marginTop: ms(6),
    marginBottom: ms(8),
    height: ms(44),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: ms(14),
    color: theme.colors.text,
    marginLeft: ms(8),
    paddingVertical: 0,
  },
  filterSection: {
    paddingVertical: ms(4),
    marginBottom: ms(4),
  },
  filterScroll: {
    paddingHorizontal: ms(16),
    gap: ms(8),
  },
  listContent: {
    paddingHorizontal: ms(16),
    paddingTop: ms(4),
  },
  itemWrapper: {
    marginBottom: ms(10),
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    marginTop: ms(12),
    marginBottom: ms(8),
    paddingHorizontal: ms(2),
  },
  monthIconWrap: {
    width: ms(24),
    height: ms(24),
    borderRadius: ms(12),
    backgroundColor: theme.colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthHeaderText: {
    color: theme.colors.primaryDark,
    fontSize: ms(15),
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: ms(14),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ms(8),
  },
  dateText: {
    color: theme.colors.textSecondary,
  },
  titleText: {
    color: theme.colors.text,
    marginBottom: ms(6),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    marginVertical: ms(2),
  },
  metaText: {
    color: theme.colors.textSecondary,
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: ms(6),
    marginTop: ms(8),
    paddingTop: ms(8),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  doshaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(3),
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(4),
  },
  doshaTagText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.semiBold,
  },
  vitalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(3),
    backgroundColor: theme.colors.errorLight,
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(4),
  },
  vitalTagText: {
    color: theme.colors.error,
    fontFamily: theme.fonts.semiBold,
  },
  attachmentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(3),
    backgroundColor: theme.colors.infoLight,
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(4),
  },
  attachmentTagText: {
    color: theme.colors.info,
    fontFamily: theme.fonts.semiBold,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ms(32),
  },
  loaderText: {
    color: theme.colors.textSecondary,
    marginTop: ms(10),
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
}));
