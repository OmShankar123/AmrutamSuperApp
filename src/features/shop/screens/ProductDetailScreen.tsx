import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';

import { useLanguage } from '@/core/localization/useLanguage';
import { NAVIGATION } from '@/navigation/constants';
import { goBack } from '@/navigation/navigationRef';
import type { RootStackParamList } from '@/navigation/types';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Header } from '@/shared/components/Header';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';
import { showSuccessToast } from '@/shared/utils/toast';

import { useProductDetail } from '../hooks/useProducts';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

type ProductDetailRouteProp = RouteProp<RootStackParamList, typeof NAVIGATION.PRODUCT_DETAIL>;

export function ProductDetailScreen(): React.JSX.Element {
  const { theme } = useUnistyles();
  const route = useRoute<ProductDetailRouteProp>();
  const { productId } = route.params;
  const { t } = useLanguage();

  const { data: product, isLoading, isError } = useProductDetail(productId);
  const addToCart = useCartStore((s) => s.addToCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isWishlisted = useWishlistStore((s) => s.items.some((i) => i.id === productId));

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    setIsAdding(true);
    addToCart(product, quantity);
    setTimeout(() => {
      setIsAdding(false);
      showSuccessToast(
        `${quantity}x ${product.name} ${t('shop.addedToCart', 'added to cart')}`,
        t('shop.addedToCart', 'Added to Cart'),
      );
    }, 350);
  };

  if (isLoading) {
    return (
      <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
        <Header showBack title={t('shop.productDetails', 'Product Details')} />
        <View style={styles.centered}>
          <Typography color={theme.colors.textSecondary} variant="body">
            {t('common.loading', 'Loading product...')}
          </Typography>
        </View>
      </ScreenWrapper>
    );
  }

  if (isError || !product) {
    return (
      <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
        <Header showBack title={t('shop.productDetails', 'Product Details')} />
        <View style={styles.centered}>
          <Typography color={theme.colors.error} style={styles.errorText} variant="h3">
            {t('common.error', 'Product not found')}
          </Typography>
          <Button onPress={goBack} title={t('common.back', 'Go Back')} variant="outline" />
        </View>
      </ScreenWrapper>
    );
  }

  const wishlistAction = (
    <TouchableOpacity
      accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      onPress={() => toggleWishlist(product)}
      style={styles.wishlistBtn}
    >
      <Ionicons
        color={isWishlisted ? theme.colors.error : theme.colors.text}
        name={isWishlisted ? 'heart' : 'heart-outline'}
        size={ms(20)}
      />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
      <Header
        rightAction={wishlistAction}
        showBack
        subtitle={product.category}
        title={product.name}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Product Image Showcase */}
        <View style={styles.imageContainer}>
          <Image
            cachePolicy="memory-disk"
            contentFit="cover"
            source={{ uri: product.imageUrl }}
            style={styles.image}
            transition={300}
          />
          {product.discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <Typography style={styles.discountText} variant="label">
                {product.discountPercentage}% {t('shop.off', 'OFF')}
              </Typography>
            </View>
          )}
        </View>

        {/* Core Product Information */}
        <View style={styles.section}>
          <View style={styles.tagRow}>
            <Badge label={`🌿 ${product.category}`} variant="success" />
            <Badge label={`⚖️ ${product.size}`} variant="neutral" />
            {product.rating >= 4.5 && (
              <Badge label={`⭐ ${t('shop.bestseller', 'Bestseller')}`} variant="warning" />
            )}
          </View>

          <Typography style={styles.name} variant="h1">
            {product.name}
          </Typography>

          <Typography style={styles.subtitle} variant="body">
            {product.subtitle}
          </Typography>

          <View style={styles.ratingPriceRow}>
            <View style={styles.ratingRow}>
              <Ionicons color={theme.colors.secondary} name="star" size={ms(16)} />
              <Typography style={styles.ratingVal} variant="bodySemiBold">
                {product.rating}
              </Typography>
              <Typography style={styles.reviewsCount} variant="caption">
                ({product.reviewCount} {t('common.reviews', 'reviews')})
              </Typography>
            </View>

            <View style={styles.priceWrap}>
              <Typography style={styles.price} variant="price">
                ₹{product.price}
              </Typography>
              {product.originalPrice > product.price && (
                <Typography style={styles.originalPrice} variant="bodySmall">
                  ₹{product.originalPrice}
                </Typography>
              )}
            </View>
          </View>
        </View>

        {/* Stock Status */}
        <View style={styles.stockCard}>
          <Ionicons
            color={product.inStock ? theme.colors.primary : theme.colors.error}
            name={product.inStock ? 'checkmark-circle-outline' : 'close-circle-outline'}
            size={ms(20)}
          />
          <View style={{ flex: 1, marginLeft: ms(8) }}>
            <Typography variant="bodySmallSemiBold">
              {product.inStock
                ? t('shop.inStock', 'In Stock')
                : t('shop.outOfStock', 'Out of Stock')}
            </Typography>
            <Typography style={styles.deliveryText} variant="caption">
              {t('shop.freeDelivery', 'Free Delivery on orders above ₹500')}
            </Typography>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Typography style={styles.sectionHeading} variant="h3">
            {t('shop.description', 'Description')}
          </Typography>
          <Typography style={styles.bodyText} variant="body">
            {product.description}
          </Typography>
        </View>

        {/* Key Botanical Ingredients */}
        <View style={styles.section}>
          <Typography style={styles.sectionHeading} variant="h3">
            {t('shop.ingredients', 'Key Botanical Ingredients')}
          </Typography>
          <View style={styles.chipsWrap}>
            {product.ingredients.map((ing: string) => (
              <Badge key={ing} label={`🌿 ${ing}`} variant="success" />
            ))}
          </View>
        </View>

        {/* Classical Benefits */}
        <View style={styles.section}>
          <Typography style={styles.sectionHeading} variant="h3">
            {t('shop.benefits', 'Classical Benefits')}
          </Typography>
          {product.benefits.map((b: string) => (
            <View key={b} style={styles.benefitRow}>
              <Ionicons color={theme.colors.primary} name="checkmark" size={ms(16)} />
              <Typography style={styles.benefitText} variant="body">
                {b}
              </Typography>
            </View>
          ))}
        </View>

        {/* How to Use */}
        <View style={styles.section}>
          <Typography style={styles.sectionHeading} variant="h3">
            {t('shop.howToUse', 'How to Use & Dosage')}
          </Typography>
          <View style={styles.howToUseCard}>
            <Typography style={styles.bodyText} variant="body">
              {product.howToUse}
            </Typography>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Floating Bar with Safe Inset */}
      <View style={styles.bottomBar}>
        {/* Quantity Stepper */}
        <View style={styles.stepper}>
          <TouchableOpacity
            disabled={quantity <= 1}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            style={styles.stepperBtn}
          >
            <Ionicons color={theme.colors.text} name="remove" size={ms(16)} />
          </TouchableOpacity>

          <Typography style={styles.qtyText} variant="bodySemiBold">
            {quantity}
          </Typography>

          <TouchableOpacity
            disabled={quantity >= (product.stockCount || 10)}
            onPress={() => setQuantity((q) => Math.min(product.stockCount || 10, q + 1))}
            style={styles.stepperBtn}
          >
            <Ionicons color={theme.colors.text} name="add" size={ms(16)} />
          </TouchableOpacity>
        </View>

        {/* Add to Cart CTA with Loader */}
        <Button
          disabled={!product.inStock}
          isLoading={isAdding}
          leftIcon={
            <Ionicons color={theme.colors.textInverse} name="bag-handle-outline" size={ms(18)} />
          }
          onPress={handleAddToCart}
          style={styles.addCartBtn}
          title={t('shop.addToCart', 'Add to Cart')}
          variant="primary"
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  wishlistBtn: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: ms(16),
    paddingBottom: ms(120),
  },
  imageContainer: {
    width: '100%',
    height: ms(240),
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceElevated,
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    bottom: ms(12),
    left: ms(12),
    backgroundColor: theme.colors.primary,
    paddingHorizontal: ms(10),
    paddingVertical: ms(5),
    borderRadius: ms(6),
  },
  discountText: {
    color: theme.colors.textInverse,
    fontFamily: theme.fonts.bold,
  },
  section: {
    marginTop: ms(16),
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(6),
    marginBottom: ms(8),
  },
  name: {
    fontSize: ms(20),
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginTop: ms(4),
  },
  ratingPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: ms(12),
    paddingTop: ms(12),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingVal: {
    marginLeft: ms(4),
  },
  reviewsCount: {
    marginLeft: ms(6),
    color: theme.colors.textTertiary,
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
  },
  price: {
    fontSize: ms(20),
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: theme.colors.textTertiary,
  },
  stockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: ms(12),
    marginTop: ms(16),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  deliveryText: {
    color: theme.colors.textSecondary,
    marginTop: ms(2),
  },
  sectionHeading: {
    marginBottom: ms(8),
  },
  bodyText: {
    lineHeight: ms(22),
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(8),
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
    marginVertical: ms(4),
  },
  benefitText: {
    flex: 1,
  },
  howToUseCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: ms(14),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(20),
    paddingTop: ms(12),
    paddingBottom: Math.max(rt.insets.bottom, ms(16)),
    boxShadow: theme.shadows.md,
    gap: ms(12),
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepperBtn: {
    width: ms(36),
    height: ms(38),
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    paddingHorizontal: ms(10),
  },
  addCartBtn: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ms(24),
  },
  errorText: {
    marginBottom: ms(12),
  },
}));
