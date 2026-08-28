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

import { ProductCard } from '../components/ProductCard';
import { useInfiniteProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/useCartStore';
import type { HealthConcern, Product, ProductCategory, ProductFilterParams } from '../types';

const CATEGORIES: readonly ProductCategory[] = [
  'Hair Care',
  'Skin Care',
  'Digestion & Gut',
  'Immunity',
  'Stress & Sleep',
  'Joint Care',
  'Women Health',
  'Men Health',
];

const HEALTH_CONCERNS: readonly HealthConcern[] = [
  'Hair Fall',
  'Dandruff',
  'Acne & Blemishes',
  'Acidity & Bloating',
  'Insomnia',
  'Joint Pain',
  'Low Energy',
  'Hormonal Balance',
];

export function ProductCatalogScreen(): React.JSX.Element {
  const { theme } = useUnistyles();
  const { t } = useLanguage();

  const cartItemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | undefined>();
  const [selectedConcern, setSelectedConcern] = useState<HealthConcern | undefined>();
  const [sortBy, setSortBy] = useState<ProductFilterParams['sortBy']>('popularity');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const hasActiveFilters = Boolean(
    selectedConcern || inStockOnly || minRating !== undefined || maxPrice !== undefined,
  );

  const filters: ProductFilterParams = useMemo(
    () => ({
      query: debouncedQuery.trim() || undefined,
      category: selectedCategory,
      healthConcern: selectedConcern,
      inStockOnly: inStockOnly || undefined,
      minRating,
      maxPrice,
      sortBy,
    }),
    [debouncedQuery, selectedCategory, selectedConcern, inStockOnly, minRating, maxPrice, sortBy],
  );

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteProducts(filters);

  const allProducts = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const totalCount = data?.pages[0]?.total ?? 0;

  const handleProductPress = useCallback((product: Product) => {
    navigate(NAVIGATION.PRODUCT_DETAIL, { productId: product.id });
  }, []);

  const handleApplyFilters = useCallback(() => {
    setIsApplyingFilters(true);
    setTimeout(() => {
      setIsApplyingFilters(false);
      setFilterModalVisible(false);
    }, 250);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductCard onPress={handleProductPress} product={item} />,
    [handleProductPress],
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset>
      {/* Header with Title, Wishlist, Cart & Language */}
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Typography variant="h1">{t('shop.title', 'Ayurvedic Store')}</Typography>
          <Typography style={styles.subtitle} variant="bodySmall">
            {totalCount > 0
              ? `${totalCount.toLocaleString()} Formulations Available`
              : 'Pure Botanical Formulations'}
          </Typography>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            accessibilityLabel="Wishlist"
            onPress={() => navigate(NAVIGATION.WISHLIST)}
            style={styles.iconBtn}
          >
            <Ionicons color={theme.colors.text} name="heart-outline" size={ms(20)} />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Cart"
            onPress={() => navigate(NAVIGATION.CART)}
            style={styles.iconBtn}
          >
            <Ionicons color={theme.colors.text} name="bag-handle-outline" size={ms(20)} />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Typography style={styles.cartBadgeText} variant="caption">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </Typography>
              </View>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: ms(8) }}>
            <TouchableOpacity onPress={() => navigate(NAVIGATION.DEV_PANEL)} style={styles.devBtn}>
              <Ionicons color={theme.colors.textSecondary} name="construct-outline" size={ms(18)} />
            </TouchableOpacity>
            <LanguageToggle />
          </View>
        </View>
      </View>

      {/* Search Bar with Live Debounced Input */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons color={theme.colors.textSecondary} name="search-outline" size={ms(18)} />
          <TextInput
            accessibilityLabel={t('shop.searchPlaceholder')}
            clearButtonMode="while-editing"
            onChangeText={setQuery}
            placeholder={t('shop.searchPlaceholder', 'Search herbal medicines, oils, malts...')}
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

      {/* Category Chips Scroll */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          contentContainerStyle={styles.chipsScrollContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <Chip
            label={t('shop.allCategories', 'All Categories')}
            onPress={() => setSelectedCategory(undefined)}
            selected={!selectedCategory}
          />
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onPress={() => setSelectedCategory(selectedCategory === cat ? undefined : cat)}
              selected={selectedCategory === cat}
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
              { label: 'Popular', icon: 'flame-outline', val: 'popularity' },
              { label: 'Highest Rated', icon: 'star-outline', val: 'rating' },
              { label: 'Price: Low to High', icon: 'trending-up-outline', val: 'price_asc' },
              { label: 'Price: High to Low', icon: 'trending-down-outline', val: 'price_desc' },
              { label: 'Discount', icon: 'pricetag-outline', val: 'discount' },
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

      {/* Products Grid (2 Columns) */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Typography style={styles.loadingText} variant="bodySmall">
            {t('common.loading', 'Loading products...')}
          </Typography>
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Typography style={styles.errorText} variant="error">
            {t('common.error', 'Could not load products.')}
          </Typography>
          <Button onPress={() => refetch()} title={t('common.retry', 'Retry')} variant="primary" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={allProducts}
          initialNumToRender={10}
          keyExtractor={keyExtractor}
          ListEmptyComponent={
            <EmptyState
              description={t('shop.noResultsSub', 'Try adjusting your filters or search terms.')}
              iconName="leaf-outline"
              title={t('common.noResults', 'No products found')}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={theme.colors.primary} size="small" />
                <Typography style={styles.footerLoaderText} variant="caption">
                  {t('common.loading', 'Loading more products...')}
                </Typography>
              </View>
            ) : (
              <View style={{ height: ms(20) }} />
            )
          }
          maxToRenderPerBatch={10}
          numColumns={2}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={1.5}
          onRefresh={refetch}
          refreshing={isLoading}
          removeClippedSubviews={false}
          renderItem={renderItem}
          windowSize={11}
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
              <Typography variant="h2">{t('common.filter', 'Filter Products')}</Typography>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons color={theme.colors.textSecondary} name="close" size={ms(22)} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Typography style={styles.sectionLabel} variant="label">
                {t('shop.stockAvailability', 'Stock Availability')}
              </Typography>
              <TouchableOpacity
                onPress={() => setInStockOnly(!inStockOnly)}
                style={[styles.modalOption, inStockOnly && styles.modalOptionSelected]}
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

              <Typography style={styles.sectionLabel} variant="label">
                {t('shop.healthConcern', 'Health Concern')}
              </Typography>
              <View style={styles.rowWrap}>
                {HEALTH_CONCERNS.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    onPress={() => setSelectedConcern(selectedConcern === c ? undefined : c)}
                    selected={selectedConcern === c}
                  />
                ))}
              </View>

              <Typography style={styles.sectionLabel} variant="label">
                {t('shop.maximumPrice', 'Maximum Price')}
              </Typography>
              <View style={styles.rowWrap}>
                {[500, 1000, 2000, 3500].map((p) => (
                  <Chip
                    key={p}
                    label={`Under ₹${p}`}
                    onPress={() => setMaxPrice(maxPrice === p ? undefined : p)}
                    selected={maxPrice === p}
                  />
                ))}
              </View>

              <Typography style={styles.sectionLabel} variant="label">
                {t('shop.minimumRating', 'Minimum Rating')}
              </Typography>
              <View style={styles.rowWrap}>
                {[4.0, 4.3, 4.6].map((r) => (
                  <Chip
                    key={r}
                    label={`★ ${r}+`}
                    onPress={() => setMinRating(minRating === r ? undefined : r)}
                    selected={minRating === r}
                  />
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                onPress={() => {
                  setSelectedConcern(undefined);
                  setInStockOnly(false);
                  setMaxPrice(undefined);
                  setMinRating(undefined);
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
  headerTextWrap: {
    flex: 1,
    marginRight: ms(8),
  },
  subtitle: {
    marginTop: ms(2),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
  },
  iconBtn: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -ms(4),
    right: -ms(4),
    backgroundColor: theme.colors.error,
    borderRadius: ms(10),
    minWidth: ms(18),
    height: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(3),
  },
  cartBadgeText: {
    color: theme.colors.textInverse,
    fontFamily: theme.fonts.bold,
    fontSize: ms(9),
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
    paddingHorizontal: ms(10),
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
