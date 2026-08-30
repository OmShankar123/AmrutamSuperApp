import React from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { useLanguage } from '@/core/localization/useLanguage';
import { NAVIGATION } from '@/navigation/constants';
import { navigate } from '@/navigation/navigationRef';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { Header } from '@/shared/components/Header';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';

import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import type { Product } from '../types';

export function WishlistScreen(): React.JSX.Element {
  const { theme } = useUnistyles();
  const { t } = useLanguage();

  const items = useWishlistStore((s) => s.items);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const addToCart = useCartStore((s) => s.addToCart);

  const handleMoveToCart = (product: Product) => {
    addToCart(product, 1);
    toggleWishlist(product);
  };

  const clearAction =
    items.length > 0 ? (
      <TouchableOpacity onPress={clearWishlist}>
        <Typography style={styles.clearText} variant="caption">
          {t('shop.clearWishlist', 'Clear All')}
        </Typography>
      </TouchableOpacity>
    ) : null;

  const renderWishlistItem = ({ item }: { item: Product }) => (
    <View style={styles.wishlistCard}>
      <Image
        cachePolicy="memory-disk"
        contentFit="cover"
        source={{ uri: item.imageUrl }}
        style={styles.productImage}
        transition={200}
      />

      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => navigate(NAVIGATION.PRODUCT_DETAIL, { productId: item.id, initialProduct: item })}
      >
        <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Typography numberOfLines={1} style={styles.productName} variant="bodySmallSemiBold">
            {item.name}
          </Typography>
          <TouchableOpacity onPress={() => toggleWishlist(item)}>
            <Ionicons color={theme.colors.error} name="heart" size={ms(20)} />
          </TouchableOpacity>
        </View>

        <Badge label={item.category} variant="success" />

        <View style={styles.footerRow}>
          <Typography variant="price">₹{item.price}</Typography>
          <Button
            leftIcon={
              <Ionicons color={theme.colors.textInverse} name="bag-handle-outline" size={ms(14)} />
            }
            onPress={() => handleMoveToCart(item)}
            size="sm"
            title={t('shop.moveToCart', 'Move to Cart')}
            variant="primary"
          />
        </View>
      </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
      <Header
        rightAction={clearAction}
        showBack
        subtitle={items.length > 0 ? `${items.length} ${t('shop.saved', 'Saved')}` : undefined}
        title={t('shop.wishlist', 'Wishlist')}
      />

      {items.length === 0 ? (
        <EmptyState
          actionTitle={t('shop.exploreStore', 'Explore Formulations')}
          description={t(
            'shop.emptyWishlistSub',
            'Save your favorite Ayurvedic formulations and natural herbs here.',
          )}
          icon="❤️"
          onAction={() => navigate(NAVIGATION.PRODUCT_CATALOG)}
          title={t('shop.emptyWishlist', 'Your Wishlist is Empty')}
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderWishlistItem}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  clearText: {
    color: theme.colors.error,
    fontFamily: theme.fonts.bold,
  },
  listContent: {
    padding: ms(16),
    paddingBottom: Math.max(rt.insets.bottom, ms(24)),
  },
  wishlistCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: ms(12),
    marginBottom: ms(10),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  productImage: {
    width: ms(80),
    height: ms(80),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  cardContent: {
    flex: 1,
    marginLeft: ms(12),
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productName: {
    flex: 1,
    marginRight: ms(8),
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: ms(6),
  },
}));
