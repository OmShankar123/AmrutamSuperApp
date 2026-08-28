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
import { LoadingState } from '@/shared/components/LoadingState';
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
    setTimeout(() => {
      addToCart(product, quantity);
      setIsAdding(false);
      showSuccessToast(
        t('shop.addedToCartDesc', '{{quantity}}x {{name}} added to your bag', {
          quantity,
          name: product.name,
        }),
        t('shop.addedToCart', 'Added to Cart'),
      );
    }, 350);
  };

  if (isLoading) {
    return (
      <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
        <Header showBack title={t('shop.title', 'Product Details')} />
        <LoadingState message={t('common.loading', 'Loading product details...')} />
      </ScreenWrapper>
    );
  }

  if (isError || !product) {
    return (
      <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
        <Header showBack title={t('shop.title', 'Product Details')} />
        <View style={styles.centered}>
          <Typography color={theme.colors.error} style={styles.errorText} variant="h3">
            {t('common.error', 'Product not found')}
          </Typography>
          <Button onPress={goBack} title={t('common.back', 'Go Back')} variant="outline" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
      {/* Top Header with Share/Wishlist Action */}
      <Header
        rightAction={
          <TouchableOpacity
            accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            onPress={() => toggleWishlist(product)}
            style={styles.iconBtn}
          >
            <Ionicons
              color={isWishlisted ? theme.colors.error : theme.colors.text}
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={ms(20)}
            />
          </TouchableOpacity>
        }
        showBack
        subtitle={product.category}
        title={product.name}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Product Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            cachePolicy="memory-disk"
            contentFit="cover"
            source={{ uri: product.imageUrl }}
            style={styles.image}
            transition={150}
          />
          {product.discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <Typography style={styles.discountText} variant="caption">
                {product.discountPercentage}% {t('shop.off', 'OFF')}
              </Typography>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Tags / Size Row */}
          <View style={styles.tagsRow}>
            <Badge label={product.category} variant="success" />
            {product.size && <Badge label={product.size} variant="neutral" />}
          </View>

          {/* Title & Subtitle */}
          <Typography style={styles.name} variant="h1">
            {product.name}
          </Typography>
          {product.subtitle && (
            <Typography style={styles.subtitle} variant="bodySmall">
              {product.subtitle}
            </Typography>
          )}

          {/* Rating & Reviews */}
          <View style={styles.ratingRow}>
            <Ionicons color={theme.colors.secondary} name="star" size={ms(16)} />
            <Typography style={styles.ratingText} variant="bodySemiBold">
              {product.rating}
            </Typography>
            <Typography style={styles.reviewCount} variant="caption">
              ({product.reviewCount} {t('consultation.reviews', 'Reviews')})
            </Typography>
          </View>

          {/* Price Card */}
          <View style={styles.priceRow}>
            <View style={styles.priceWrap}>
              <Typography style={styles.currentPrice} variant="h1">
                ₹{product.price}
              </Typography>
              {product.originalPrice > product.price && (
                <Typography style={styles.originalPrice} variant="bodyLarge">
                  ₹{product.originalPrice}
                </Typography>
              )}
            </View>
            <Badge
              label={
                product.inStock ? t('shop.inStock', 'In Stock') : t('shop.outOfStock', 'Sold Out')
              }
              variant={product.inStock ? 'success' : 'error'}
            />
          </View>

          {/* AYUSH Trust Card */}
          <View style={styles.trustCard}>
            <Ionicons color={theme.colors.primary} name="shield-checkmark-outline" size={ms(20)} />
            <View style={styles.trustCardContent}>
              <Typography variant="bodySmallSemiBold">
                {t('shop.ayushMinistryCertified', '100% Ayurvedic & AYUSH Certified')}
              </Typography>
              <Typography style={styles.trustCardSub} variant="caption">
                {t('shop.freeDeliveryOnOrders', 'Free Delivery on orders above ₹500')}
              </Typography>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Typography style={styles.sectionTitle} variant="h3">
              {t('shop.description', 'Description')}
            </Typography>
            <Typography style={styles.descText} variant="body">
              {product.description}
            </Typography>
          </View>

          {/* Key Botanical Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <View style={styles.section}>
              <Typography style={styles.sectionTitle} variant="h3">
                {t('shop.keyBotanicalIngredients', 'Key Botanical Ingredients')}
              </Typography>
              <View style={styles.chipGrid}>
                {product.ingredients.map((ing, idx) => (
                  <View key={idx} style={styles.ingredientChip}>
                    <Ionicons color={theme.colors.primary} name="leaf-outline" size={ms(14)} />
                    <Typography style={styles.ingredientText} variant="bodySmallSemiBold">
                      {ing}
                    </Typography>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Ayurvedic Health Benefits */}
          {product.benefits && product.benefits.length > 0 && (
            <View style={styles.section}>
              <Typography style={styles.sectionTitle} variant="h3">
                {t('shop.ayurvedicBenefits', 'Ayurvedic Health Benefits')}
              </Typography>
              {product.benefits.map((benefit, idx) => (
                <View key={idx} style={styles.benefitRow}>
                  <Ionicons color={theme.colors.primary} name="checkmark-circle" size={ms(16)} />
                  <Typography style={styles.benefitText} variant="bodySmall">
                    {benefit}
                  </Typography>
                </View>
              ))}
            </View>
          )}

          {/* How to Use / Dosage */}
          {product.howToUse && (
            <View style={styles.section}>
              <Typography style={styles.sectionTitle} variant="h3">
                {t('shop.howToUse', 'How to Use / Dosage')}
              </Typography>
              <Typography style={styles.descText} variant="bodySmall">
                {product.howToUse}
              </Typography>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={styles.stickyFooter}>
        <View style={styles.qtyContainer}>
          <TouchableOpacity
            disabled={quantity <= 1}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
          >
            <Ionicons color={theme.colors.text} name="remove" size={ms(16)} />
          </TouchableOpacity>
          <Typography style={styles.qtyText} variant="bodyLargeSemiBold">
            {quantity}
          </Typography>
          <TouchableOpacity onPress={() => setQuantity((q) => q + 1)} style={styles.qtyBtn}>
            <Ionicons color={theme.colors.text} name="add" size={ms(16)} />
          </TouchableOpacity>
        </View>

        <Button
          disabled={!product.inStock}
          isLoading={isAdding}
          leftIcon={
            <Ionicons color={theme.colors.textInverse} name="bag-handle-outline" size={ms(18)} />
          }
          onPress={handleAddToCart}
          style={styles.addToCartBtn}
          title={
            product.inStock ? t('shop.addToCart', 'Add to Cart') : t('shop.outOfStock', 'Sold Out')
          }
          variant={product.inStock ? 'primary' : 'disabled'}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ms(24),
  },
  errorText: {
    marginBottom: ms(12),
  },
  iconBtn: {
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
    paddingBottom: ms(100),
  },
  imageContainer: {
    width: '100%',
    height: ms(320),
    backgroundColor: theme.colors.surfaceElevated,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    bottom: ms(16),
    left: ms(16),
    backgroundColor: theme.colors.primary,
    paddingHorizontal: ms(10),
    paddingVertical: ms(5),
    borderRadius: theme.radius.sm,
  },
  discountText: {
    color: theme.colors.textInverse,
    fontFamily: theme.fonts.bold,
  },
  body: {
    padding: ms(16),
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
    marginBottom: ms(8),
  },
  name: {
    color: theme.colors.text,
    marginBottom: ms(4),
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginBottom: ms(10),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    marginBottom: ms(14),
  },
  ratingText: {
    color: theme.colors.text,
  },
  reviewCount: {
    color: theme.colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: ms(12),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: ms(16),
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: ms(8),
  },
  currentPrice: {
    color: theme.colors.primary,
  },
  originalPrice: {
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
    backgroundColor: theme.colors.surfaceElevated,
    padding: ms(12),
    borderRadius: theme.radius.md,
    marginBottom: ms(20),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  trustCardContent: {
    flex: 1,
  },
  trustCardSub: {
    color: theme.colors.textSecondary,
    marginTop: ms(2),
  },
  section: {
    marginBottom: ms(20),
  },
  sectionTitle: {
    marginBottom: ms(8),
    color: theme.colors.text,
  },
  descText: {
    color: theme.colors.textSecondary,
    lineHeight: ms(22),
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(8),
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: ms(12),
    paddingVertical: ms(6),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ingredientText: {
    color: theme.colors.primaryDark,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ms(8),
    marginBottom: ms(6),
  },
  benefitText: {
    color: theme.colors.textSecondary,
    flex: 1,
    lineHeight: ms(20),
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: ms(16),
    paddingTop: ms(12),
    paddingBottom: Math.max(rt.insets.bottom, ms(16)),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
    boxShadow: theme.shadows.md,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: ms(4),
  },
  qtyBtn: {
    width: ms(36),
    height: ms(44),
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyText: {
    paddingHorizontal: ms(8),
  },
  addToCartBtn: {
    flex: 1,
  },
}));
