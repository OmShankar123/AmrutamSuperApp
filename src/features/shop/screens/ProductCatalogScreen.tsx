import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

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

import { ProductCard } from '../components/ProductCard';
import { ProductFilterModal } from '../components/ProductFilterModal';
import type { ProductSortOption } from '../components/ProductSortBar';
import { ProductSortBar } from '../components/ProductSortBar';
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

export function ProductCatalogScreen(): React.JSX.Element {
  const { theme, rt } = useUnistyles();
  const { t } = useLanguage();
  const isConnected = useNetworkStore((s) => s.isConnected);
  const cartItems = useCartStore((s) => s.items);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistItems = useWishlistStore((s) => s.items);
  const categoryListRef = useRef<FlatList>(null);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | undefined>();
  const [selectedConcern, setSelectedConcern] = useState<HealthConcern | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<ProductSortOption>('popularity');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

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

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteProducts(filters);

  const products = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const handleProductPress = useCallback((product: Product) => {
    navigate(NAVIGATION.PRODUCT_DETAIL, { productId: product.id, initialProduct: product });
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

  const handleSelectCategory = (cat: ProductCategory | undefined, index: number) => {
    setSelectedCategory(cat);
    categoryListRef.current?.scrollToIndex({
      index,
      viewPosition: 0.5,
      animated: true,
    });
  };

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductCard onPress={handleProductPress} product={item} />,
    [handleProductPress],
  );

  const renderFooter = () => {
    if (!isConnected || !isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={theme.colors.primary} size="small" />
        <Typography style={styles.footerText} variant="caption">
          {t('common.loading', 'Loading more formulations...')}
        </Typography>
      </View>
    );
  };

  const categoryItems = useMemo(
    () => [
      {
        name: undefined,
        label: t('shop.allCategories', 'All Categories'),
        icon: 'grid-outline' as const,
      },
      ...CATEGORIES.map((c) => ({
        name: c.name,
        label: c.name,
        icon: c.icon,
      })),
    ],
    [t],
  );

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

      {/* Auto-Centering Category Chips */}
      <View style={styles.chipsWrapper}>
        <FlatList
          contentContainerStyle={styles.chipsScrollContent}
          data={categoryItems}
          horizontal
          keyExtractor={(item, index) => `${item.name || 'all'}-${index}`}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              categoryListRef.current?.scrollToIndex({
                index: info.index,
                viewPosition: 0.5,
                animated: true,
              });
            }, 100);
          }}
          ref={categoryListRef}
          renderItem={({ item, index }) => {
            const isSelected = selectedCategory === item.name;
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
                onPress={() => handleSelectCategory(item.name, index)}
                selected={isSelected}
              />
            );
          }}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Extracted Filter & Sort Bar */}
      <ProductSortBar
        hasActiveFilters={hasActiveFilters}
        onOpenFilter={() => setFilterModalVisible(true)}
        onSortChange={setSortBy}
        sortBy={sortBy}
      />

      {/* Product Grid */}
      {isLoading && products.length === 0 ? (
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
            isError && products.length === 0 ? (
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
                description={t('shop.noResultsSub', 'Try adjusting your filters or search terms.')}
                iconName="leaf-outline"
                onAction={() => {
                  setQuery('');
                  setSelectedCategory(undefined);
                  handleResetFilters();
                }}
                title={t('common.noResults', 'No Formulations Found')}
              />
            )
          }
          ListFooterComponent={renderFooter}
          maxToRenderPerBatch={10}
          numColumns={2}
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

      {/* Extracted Advanced Filter Modal */}
      <ProductFilterModal
        inStockOnly={inStockOnly}
        maxPrice={maxPrice}
        minRating={minRating}
        onClose={() => setFilterModalVisible(false)}
        onResetFilters={handleResetFilters}
        onSelectConcern={setSelectedConcern}
        onSelectMaxPrice={setMaxPrice}
        onSelectMinRating={setMinRating}
        onToggleInStockOnly={setInStockOnly}
        selectedConcern={selectedConcern}
        visible={filterModalVisible}
      />
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
}));
