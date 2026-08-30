import React, { memo, useEffect } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { useLanguage } from '@/core/localization/useLanguage';
import { Badge } from '@/shared/components/Badge';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';

import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

export const PRODUCT_CARD_HEIGHT = ms(270);

const COLLAPSED_WIDTH = ms(32);
const EXPANDED_WIDTH = ms(82);

export const ProductCard = memo(function ProductCard({
  product,
  onPress,
}: ProductCardProps): React.JSX.Element {
  const { theme } = useUnistyles();
  const { t } = useLanguage();
  const addToCart = useCartStore((s) => s.addToCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const cartItem = useCartStore((s) => s.items.find((i) => i.product.id === product.id));
  const cartQuantity = cartItem?.quantity ?? 0;

  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isWishlisted = useWishlistStore((s) => s.items.some((i) => i.id === product.id));

  // Smooth linear width expansion/shrink (NO bouncy spring)
  const buttonWidth = useSharedValue(cartQuantity > 0 ? EXPANDED_WIDTH : COLLAPSED_WIDTH);

  useEffect(() => {
    buttonWidth.value = withTiming(cartQuantity > 0 ? EXPANDED_WIDTH : COLLAPSED_WIDTH, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
  }, [cartQuantity, buttonWidth]);

  const animatedButtonContainer = useAnimatedStyle(() => ({
    width: buttonWidth.value,
  }));

  return (
    <Pressable
      accessibilityHint="Navigates to product details"
      accessibilityLabel={`${product.name}, ${product.category}, ₹${product.price}`}
      accessibilityRole="button"
      onPress={() => onPress(product)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* Image Container with Badges & Wishlist Action */}
      <View style={styles.imageWrapper}>
        <Image
          cachePolicy="memory-disk"
          contentFit="cover"
          source={{ uri: product.imageUrl }}
          style={styles.image}
          transition={100}
        />

        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <Typography numberOfLines={1} style={styles.discountText} variant="caption">
              {product.discountPercentage}% {t('shop.off', 'OFF')}
            </Typography>
          </View>
        )}

        {/* Wishlist Button */}
        <TouchableOpacity
          accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onPress={() => toggleWishlist(product)}
          style={styles.wishlistBtn}
        >
          <Ionicons
            color={isWishlisted ? theme.colors.error : theme.colors.textSecondary}
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={ms(18)}
          />
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View style={styles.categoryRow}>
          <Typography numberOfLines={1} style={styles.category} variant="caption">
            {product.category}
          </Typography>
          <View style={styles.ratingWrap}>
            <Ionicons color={theme.colors.secondary} name="star" size={ms(12)} />
            <Typography style={styles.ratingText} variant="caption">
              {product.rating}
            </Typography>
          </View>
        </View>

        <Typography numberOfLines={2} style={styles.name} variant="bodySmallSemiBold">
          {product.name}
        </Typography>

        {/* Price Row & Smooth Expanding/Collapsing Button */}
        <View style={styles.footer}>
          <View>
            <Typography variant="price">₹{product.price}</Typography>
            {product.originalPrice > product.price && (
              <Typography style={styles.originalPrice} variant="caption">
                ₹{product.originalPrice}
              </Typography>
            )}
          </View>

          {!product.inStock ? (
            <Badge label={t('shop.outOfStock', 'Sold Out')} variant="error" />
          ) : (
            <Animated.View style={[styles.cartActionBox, animatedButtonContainer]}>
              {cartQuantity > 0 ? (
                <Animated.View
                  entering={FadeIn.duration(150)}
                  exiting={FadeOut.duration(100)}
                  style={styles.stepperInner}
                >
                  <TouchableOpacity
                    accessibilityLabel="Decrease quantity"
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 4 }}
                    onPress={() => updateQuantity(product.id, cartQuantity - 1)}
                    style={styles.stepperBtn}
                  >
                    <Ionicons color={theme.colors.textInverse} name="remove" size={ms(13)} />
                  </TouchableOpacity>

                  <View style={styles.qtyCountWrap}>
                    <Ionicons color={theme.colors.textInverse} name="bag-handle" size={ms(11)} />
                    <Typography style={styles.qtyCountText} variant="caption">
                      {cartQuantity}
                    </Typography>
                  </View>

                  <TouchableOpacity
                    accessibilityLabel="Increase quantity"
                    hitSlop={{ top: 6, bottom: 6, left: 4, right: 6 }}
                    onPress={() => addToCart(product, 1)}
                    style={styles.stepperBtn}
                  >
                    <Ionicons color={theme.colors.textInverse} name="add" size={ms(13)} />
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <TouchableOpacity
                  accessibilityLabel="Add to Cart"
                  onPress={() => addToCart(product, 1)}
                  style={styles.singleAddBtn}
                >
                  <Ionicons color={theme.colors.textInverse} name="add" size={ms(18)} />
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create((theme) => ({
  card: {
    flex: 1,
    height: PRODUCT_CARD_HEIGHT,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    margin: ms(6),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  imageWrapper: {
    width: '100%',
    height: ms(140),
    position: 'relative',
    backgroundColor: theme.colors.surfaceElevated,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surfaceElevated,
  },
  discountBadge: {
    position: 'absolute',
    top: ms(8),
    left: ms(8),
    backgroundColor: theme.colors.primary,
    paddingHorizontal: ms(6),
    paddingVertical: ms(3),
    borderRadius: ms(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountText: {
    color: theme.colors.textInverse,
    fontFamily: theme.fonts.bold,
    fontSize: ms(9),
  },
  wishlistBtn: {
    position: 'absolute',
    top: ms(8),
    right: ms(8),
    width: ms(30),
    height: ms(30),
    borderRadius: ms(15),
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: theme.shadows.sm,
  },
  content: {
    flex: 1,
    padding: ms(10),
    justifyContent: 'space-between',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  category: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.semiBold,
    flex: 1,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(2),
  },
  ratingText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
  },
  name: {
    color: theme.colors.text,
    marginTop: ms(2),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: ms(4),
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: theme.colors.textTertiary,
  },
  cartActionBox: {
    height: ms(32),
    backgroundColor: theme.colors.primary,
    borderRadius: ms(16),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: theme.shadows.sm,
  },
  singleAddBtn: {
    width: ms(32),
    height: ms(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperInner: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(4),
  },
  stepperBtn: {
    padding: ms(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyCountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(3),
    paddingHorizontal: ms(2),
  },
  qtyCountText: {
    color: theme.colors.textInverse,
    fontFamily: theme.fonts.bold,
    fontSize: ms(11),
  },
}));
