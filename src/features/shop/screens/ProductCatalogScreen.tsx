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

import { ProductCard } from '../components/ProductCard';
import { useInfiniteProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import type { HealthConcern, Product, ProductCategory } from '../types';

const CATEGORIES: { name: ProductCategory; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'Hair Care', icon: 'sparkles-outline' },
  { name: 'Skin Care', icon: 'flower-outline' },
  { name: 'Digestion & Gut', icon: 'restaurant-outline' },
  { name: 'Immunity', icon: 'shield-outline' },
  { name: 'Stress & Sleep', icon: 'moon-outline' },
  { name: 'Joint Care', icon: 'body-outline' },
  { name: 'Women Health', icon: 'heart-outline' },
  { name: 'Men Health', icon: 'male-outline' },
];

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

export function ProductCatalogScreen(): React.JSX.Element {
  const { theme, rt } = useUnistyles();
  const { t } = useLanguage();
  const cartItems = useCartStore((s) => s.items);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistItems = useWishlistStore((s) => s.items);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | undefined>();
  const [selectedConcern, setSelectedConcern] = useState<HealthConcern | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<
    'popularity' | 'price_asc' | 'price_desc' | 'rating' | 'discount' | undefined
  >('popularity');

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const filters = useMemo(
    () => ({
      query: debouncedQuery || undefined,
      category: selectedCategory,
      healthConcern: selectedConcern,
      minPrice,
      maxPrice,
      minRating,
      inStockOnly: inStockOnly || undefined,
      sortBy,
    }),
    [
      debouncedQuery,
      selectedCategory,
      selectedConcern,
      minPrice,
      maxPrice,
      minRating,
      inStockOnly,
      sortBy,
    ],
  );

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch, isRefetching } =
    useInfiniteProducts(filters);

  const products = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const handleProductPress = useCallback((product: Product) => {
    navigate(NAVIGATION.PRODUCT_DETAIL, { productId: product.id });
  }, []);

  const hasActiveFilters = Boolean(
    selectedConcern || minPrice || maxPrice || minRating || inStockOnly,
  );

  const handleResetFilters = () => {
    setSelectedConcern(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinRating(undefined);
    setInStockOnly(false);
  };

  const handleApplyFilters = () => {
    setIsApplyingFilters(true);
    setTimeout(() => {
      setIsApplyingFilters(false);
      setFilterModalVisible(false);
    }, 200);
  };

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductCard onPress={handleProductPress} product={item} />,
    [handleProductPress],
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={theme.colors.primary} size="small" />
        <Typography style={styles.footerText} variant="caption">
          {t('common.loading', 'Loading more formulations...')}
        </Typography>
      </View>
    );
  };

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset>
      {/* Unified Search Header with Wishlist Icon */}
      <SearchHeader
        onQueryChange={setQuery}
        placeholder={t('shop.searchPlaceholder', 'Search herbal medicines, oils, malts...')}
        query={query}
        rightAction={
          <TouchableOpacity
            accessibilityLabel={t('shop.wishlist', 'Wishlist')}
            onPress={() => navigate(NAVIGATION.WISHLIST)}
            style={styles.wishlistHeaderBtn}
          >
            <Ionicons
              color={wishlistItems.length > 0 ? theme.colors.error : theme.colors.textSecondary}
              name={wishlistItems.length > 0 ? 'heart' : 'heart-outline'}
              size={ms(18)}
            />
            {wishlistItems.length > 0 && (
              <View style={styles.wishlistBadge}>
                <Typography style={styles.wishlistBadgeText} variant="caption">
                  {wishlistItems.length}
                </Typography>
              </View>
            )}
          </TouchableOpacity>
        }
        subtitle={
          products.length > 0
            ? `${products.length} ${t('shop.formulationsAvailable', 'Formulations Available')}`
            : t('shop.pureFormulations', 'Pure Botanical Formulations')
        }
        title={t('shop.title', 'Ayurvedic Store')}
      />

      {/* Horizontally Scrolling Category Chips */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          contentContainerStyle={styles.chipsScrollContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <Chip
            icon={
              <Ionicons
                color={!selectedCategory ? theme.colors.textInverse : theme.colors.textSecondary}
                name="grid-outline"
                size={ms(14)}
              />
            }
            label={t('shop.allCategories', 'All Categories')}
            onPress={() => setSelectedCategory(undefined)}
            selected={!selectedCategory}
          />
          {CATEGORIES.map(({ name, icon }) => {
            const isSelected = selectedCategory === name;
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
                onPress={() => setSelectedCategory(isSelected ? undefined : name)}
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
              { label: t('shop.popular', 'Popular'), icon: 'flame-outline', val: 'popularity' },
              { label: t('shop.highestRated', 'Highest Rated'), icon: 'star', val: 'rating' },
              {
                label: t('shop.priceLowToHigh', 'Price: Low to High'),
                icon: 'trending-up-outline',
                val: 'price_asc',
              },
              {
                label: t('shop.priceHighToLow', 'Price: High to Low'),
                icon: 'trending-down-outline',
                val: 'price_desc',
              },
              { label: t('shop.discount', 'Discount'), icon: 'pricetag-outline', val: 'discount' },
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

      {/* Product Grid */}
      {isLoading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Typography style={styles.loaderText} variant="bodySmall">
            {t('common.loading', 'Loading classical Ayurvedic formulations...')}
          </Typography>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(rt.insets.bottom, ms(20)) },
          ]}
          data={products}
          initialNumToRender={10}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <EmptyState
              actionTitle={t('common.reset', 'Reset Filters')}
              description={t('shop.noResultsSub', 'Try adjusting your filters or search terms.')}
              iconName="leaf-outline"
              onAction={() => {
                setQuery('');
                setSelectedCategory(undefined);
                handleResetFilters();
              }}
              title={t('common.noResults', 'No Formulations Found')}
            />
          }
          ListFooterComponent={renderFooter}
          maxToRenderPerBatch={10}
          numColumns={2}
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

      {/* Floating Bag Indicator */}
      {totalCartCount > 0 && (
        <TouchableOpacity
          accessibilityLabel={`Shopping Bag with ${totalCartCount} items`}
          onPress={() => navigate(NAVIGATION.CART)}
          style={styles.floatingCart}
        >
          <Ionicons color={theme.colors.textInverse} name="bag-handle" size={ms(20)} />
          <Typography style={styles.floatingCartText} variant="bodySmallSemiBold">
            {totalCartCount}
          </Typography>
        </TouchableOpacity>
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
              <Typography variant="h2">{t('common.filter', 'Filter Formulations')}</Typography>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons color={theme.colors.textSecondary} name="close" size={ms(22)} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              {/* Stock Status */}
              <Typography style={styles.sectionLabel} variant="label">
                {t('shop.stockAvailability', 'Stock Availability')}
              </Typography>
              <TouchableOpacity
                onPress={() => setInStockOnly((v) => !v)}
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
                    onPress={() =>
                      setSelectedConcern(selectedConcern === concern ? undefined : concern)
                    }
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
                    onPress={() => setMaxPrice(maxPrice === price ? undefined : price)}
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
    gap: ms(6),
  },
  wishlistHeaderBtn: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  wishlistBadge: {
    position: 'absolute',
    top: -ms(3),
    right: -ms(3),
    backgroundColor: theme.colors.error,
    borderRadius: ms(8),
    minWidth: ms(16),
    height: ms(16),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(2),
  },
  wishlistBadgeText: {
    color: theme.colors.textInverse,
    fontSize: ms(9),
    fontFamily: theme.fonts.bold,
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
    paddingHorizontal: ms(10),
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
  floatingCart: {
    position: 'absolute',
    bottom: Math.max(rt.insets.bottom, ms(20)),
    right: ms(20),
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    paddingHorizontal: ms(16),
    paddingVertical: ms(12),
    borderRadius: ms(30),
    boxShadow: theme.shadows.lg,
    elevation: 6,
  },
  floatingCartText: {
    color: theme.colors.textInverse,
    fontFamily: theme.fonts.bold,
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
