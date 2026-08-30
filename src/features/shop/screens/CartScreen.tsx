import React, { useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';

import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { useNetworkStore } from '@/core/api/services/syncManager';
import { enqueueMutation } from '@/core/storage/queue';
import { useFeatureFlags } from '@/core/config/featureFlags';
import { useLanguage } from '@/core/localization/useLanguage';
import { usePushNotifications } from '@/core/notifications';
import { NAVIGATION } from '@/navigation/constants';
import { navigate } from '@/navigation/navigationRef';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { ConfirmationModal } from '@/shared/components/ConfirmationModal';
import { EmptyState } from '@/shared/components/EmptyState';
import { Header } from '@/shared/components/Header';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';
import { showSuccessToast } from '@/shared/utils/toast';

import { useCartStore } from '../store/useCartStore';

export function CartScreen(): React.JSX.Element {
  const { theme } = useUnistyles();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();

  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSummary = useCartStore((s) => s.getSummary);

  const enableAyushDiscount = useFeatureFlags((s) => s.flags.enableAyushDiscount);
  const discountPercentage = useFeatureFlags((s) => s.flags.discountPercentage);
  const { sendLocalNotification } = usePushNotifications();
  const summary = getSummary();
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [clearCartModalVisible, setClearCartModalVisible] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const isConnected = useNetworkStore((s) => s.isConnected);
  const [isOfflineOrder, setIsOfflineOrder] = useState(false);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    const itemCount = summary.itemCount;
    const totalAmount = summary.total;
    const orderPayload = {
      orderId: `order_${isConnected ? '' : 'offline_'}${Date.now()}`,
      items: [...items],
      summary,
      address: t('shop.mockAddress', 'Sector 62, Noida, UP (Home)'),
      paymentMethod: t('shop.mockPaymentMethod', 'UPI / NetBanking / COD'),
      createdAt: new Date().toISOString(),
    };

    let offlineMode = false;
    if (!isConnected) {
      offlineMode = true;
      setIsOfflineOrder(true);
      enqueueMutation({
        type: 'PLACE_ORDER',
        payload: orderPayload,
      });
      useNetworkStore.getState().updatePendingCount();
    } else {
      setIsOfflineOrder(false);
      try {
        await apiClient.post(API_ENDPOINTS.PLACE_ORDER, orderPayload);
      } catch {
        offlineMode = true;
        setIsOfflineOrder(true);
        enqueueMutation({
          type: 'PLACE_ORDER',
          payload: orderPayload,
        });
        useNetworkStore.getState().updatePendingCount();
      }
    }

    setTimeout(async () => {
      setIsPlacingOrder(false);
      setOrderPlaced(true);
      clearCart();

      // Trigger order push notification
      await sendLocalNotification(
        offlineMode ? '📦 Order Saved Offline!' : '🛍️ Ayurvedic Order Confirmed!',
        offlineMode
          ? `Your order for ${itemCount} formulation(s) worth ₹${totalAmount} is queued offline and will sync automatically when online.`
          : `Your order for ${itemCount} formulation(s) worth ₹${totalAmount} has been placed and is being handcrafted for dispatch.`,
        { type: 'order_placed', total: totalAmount },
      );

      showSuccessToast(
        offlineMode
          ? t('shop.orderSavedOffline', 'Order Saved Offline!')
          : t('shop.orderPlacedSuccess', 'Order Placed Successfully!'),
        offlineMode
          ? t('shop.orderSavedOfflineSub', 'Your Ayurvedic order is securely queued on your device.')
          : t('shop.orderSuccessSub', 'Your Ayurvedic formulations are being handcrafted.'),
      );
    }, 400);
  };

  const clearAction =
    items.length > 0 ? (
      <TouchableOpacity
        accessibilityLabel={t('shop.clearCart', 'Clear Cart')}
        onPress={() => setClearCartModalVisible(true)}
      >
        <Typography style={styles.clearText} variant="caption">
          {t('common.clear', 'Clear All')}
        </Typography>
      </TouchableOpacity>
    ) : null;

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
      <Header
        rightAction={clearAction}
        showBack={canGoBack}
        subtitle={
          items.length > 0
            ? `${items.length} ${t('shop.formulationsAvailable', 'Formulations')}`
            : undefined
        }
        title={t('shop.cart', 'Shopping Bag')}
        withTopInset
      />

      {items.length === 0 ? (
        <EmptyState
          actionTitle={t('shop.exploreStore', 'Explore Formulations')}
          description={t(
            'shop.emptyCartSub',
            'Add Ayurvedic herbal medicines and wellness products to your bag.',
          )}
          iconName="bag-handle-outline"
          onAction={() => navigate(NAVIGATION.PRODUCT_CATALOG)}
          title={t('shop.emptyCart', 'Your Bag is Empty')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Promo Discount Banner (Feature Flag Controlled) */}
          {enableAyushDiscount &&
            (summary.subtotal < 1000 ? (
              <View style={styles.discountPromoBanner}>
                <Ionicons color={theme.colors.warning} name="sparkles" size={ms(16)} />
                <Typography style={styles.discountPromoText} variant="bodySmallSemiBold">
                  {t(
                    'shop.addMoreForDiscount',
                    `Add ₹${1000 - summary.subtotal} more to get ${discountPercentage}% AYUSH Discount!`,
                    {
                      amount: 1000 - summary.subtotal,
                      percent: discountPercentage,
                    },
                  )}
                </Typography>
              </View>
            ) : (
              <View style={styles.discountSuccessBanner}>
                <Ionicons color={theme.colors.primary} name="shield-checkmark" size={ms(16)} />
                <Typography style={styles.discountSuccessText} variant="bodySmallSemiBold">
                  {t(
                    'shop.discountApplied',
                    `🎉 ${discountPercentage}% AYUSH Ministry Discount Applied!`,
                    { percent: discountPercentage },
                  )}
                </Typography>
              </View>
            ))}

          {/* Cart Item Cards */}
          {items.map(({ product, quantity }) => (
            <View key={product.id} style={styles.cartCard}>
              <Image
                cachePolicy="memory-disk"
                contentFit="cover"
                source={{ uri: product.imageUrl }}
                style={styles.cartImage}
                transition={100}
              />
              <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                  <Typography numberOfLines={1} style={styles.productName} variant="bodySemiBold">
                    {product.name}
                  </Typography>
                  <TouchableOpacity
                    accessibilityLabel={t('shop.removeFromCart', 'Remove from Cart')}
                    onPress={() => removeFromCart(product.id)}
                  >
                    <Ionicons
                      color={theme.colors.textTertiary}
                      name="trash-outline"
                      size={ms(18)}
                    />
                  </TouchableOpacity>
                </View>

                <Typography style={styles.category} variant="caption">
                  {product.category}
                </Typography>

                <View style={styles.priceStepperRow}>
                  <Typography variant="price">₹{product.price * quantity}</Typography>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      accessibilityLabel="Decrease Quantity"
                      onPress={() => updateQuantity(product.id, quantity - 1)}
                      style={styles.stepperBtn}
                    >
                      <Ionicons
                        color={quantity === 1 ? theme.colors.error : theme.colors.text}
                        name={quantity === 1 ? 'trash-outline' : 'remove'}
                        size={ms(14)}
                      />
                    </TouchableOpacity>
                    <Typography style={styles.qtyText} variant="bodySmallSemiBold">
                      {quantity}
                    </Typography>
                    <TouchableOpacity
                      accessibilityLabel="Increase Quantity"
                      onPress={() => updateQuantity(product.id, quantity + 1)}
                      style={styles.stepperBtn}
                    >
                      <Ionicons color={theme.colors.text} name="add" size={ms(14)} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {/* Order Summary Card */}
          <View style={styles.summaryCard}>
            <Typography style={styles.summaryTitle} variant="h3">
              {t('shop.orderSummary', 'Order Summary')}
            </Typography>

            <View style={styles.summaryRow}>
              <Typography style={styles.summaryLabel} variant="bodySmall">
                {t('shop.subtotal', 'Bag Subtotal')} ({summary.itemCount} {t('shop.items', 'items')}
                )
              </Typography>
              <Typography variant="bodySmallSemiBold">₹{summary.subtotal}</Typography>
            </View>

            {summary.discount > 0 && (
              <View style={styles.summaryRow}>
                <Typography style={styles.discountLabel} variant="bodySmall">
                  {t('shop.ayushDiscount', `AYUSH Discount (${discountPercentage}%)`, {
                    percent: discountPercentage,
                  })}
                </Typography>
                <Typography style={styles.discountValue} variant="bodySmallSemiBold">
                  -₹{summary.discount}
                </Typography>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Typography style={styles.summaryLabel} variant="bodySmall">
                {t('shop.deliveryFee', 'Standard Delivery')}
              </Typography>
              <Typography
                color={summary.deliveryFee === 0 ? theme.colors.success : theme.colors.text}
                variant="bodySmallSemiBold"
              >
                {summary.deliveryFee === 0 ? t('common.free', 'FREE') : `₹${summary.deliveryFee}`}
              </Typography>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Typography variant="h3">{t('shop.totalAmount', 'Total Amount')}</Typography>
              <Typography variant="price">₹{summary.total}</Typography>
            </View>

            <Button
              leftIcon={
                <Ionicons color={theme.colors.textInverse} name="lock-closed" size={ms(16)} />
              }
              onPress={() => setCheckoutModalVisible(true)}
              style={styles.checkoutBtn}
              title={t('shop.proceedToCheckout', 'Proceed to Secure Checkout')}
              variant="primary"
            />
          </View>
        </ScrollView>
      )}

      {/* Confirmation Modal to Clear Cart */}
      <ConfirmationModal
        cancelTitle={t('common.cancel', 'Cancel')}
        confirmTitle={t('shop.clearCart', 'Clear Cart')}
        confirmVariant="danger"
        description={t(
          'shop.clearCartConfirmDesc',
          'Are you sure you want to remove all formulations from your bag?',
        )}
        iconName="trash-outline"
        onCancel={() => setClearCartModalVisible(false)}
        onConfirm={() => {
          clearCart();
          setClearCartModalVisible(false);
        }}
        title={t('shop.clearCart', 'Clear Cart')}
        visible={clearCartModalVisible}
      />

      {/* Checkout Simulated Modal */}
      <Modal
        animationType="slide"
        onRequestClose={() => setCheckoutModalVisible(false)}
        transparent
        visible={checkoutModalVisible}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {!orderPlaced ? (
              <>
                <View style={styles.modalHeader}>
                  <Typography variant="h2">
                    {t('shop.confirmOrder', 'Confirm Ayurvedic Order')}
                  </Typography>
                  <TouchableOpacity onPress={() => setCheckoutModalVisible(false)}>
                    <Ionicons color={theme.colors.textSecondary} name="close" size={ms(22)} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.receiptRow}>
                    <Typography variant="bodySmall">
                      {t('shop.itemsCount', 'Items Count')}
                    </Typography>
                    <Typography variant="bodySmallSemiBold">
                      {summary.itemCount} {t('shop.units', 'Units')}
                    </Typography>
                  </View>
                  <View style={styles.receiptRow}>
                    <Typography variant="bodySmall">
                      {t('shop.deliveryAddress', 'Delivery Address')}
                    </Typography>
                    <Typography variant="bodySmallSemiBold">
                      {t('shop.mockAddress', 'Sector 62, Noida, UP (Home)')}
                    </Typography>
                  </View>
                  <View style={styles.receiptRow}>
                    <Typography variant="bodySmall">
                      {t('shop.paymentMethod', 'Payment Method')}
                    </Typography>
                    <Typography variant="bodySmallSemiBold">
                      {t('shop.mockPaymentMethod', 'UPI / NetBanking / COD')}
                    </Typography>
                  </View>
                  <View style={[styles.receiptRow, styles.totalRow]}>
                    <Typography variant="h3">{t('shop.totalPayable', 'Total Payable')}</Typography>
                    <Typography variant="price">₹{summary.total}</Typography>
                  </View>
                </View>

                <Button
                  isLoading={isPlacingOrder}
                  leftIcon={
                    <Ionicons
                      color={theme.colors.textInverse}
                      name="checkmark-done"
                      size={ms(18)}
                    />
                  }
                  onPress={handlePlaceOrder}
                  title={t('shop.placeOrderNow', 'Place Order Now')}
                  variant="primary"
                />
              </>
            ) : (
              <View style={styles.successWrapper}>
                {/* Clean Centered Badge */}
                <Animated.View
                  entering={ZoomIn.duration(400)}
                  style={[styles.successBadgeOuter, isOfflineOrder && styles.offlineBadgeOuter]}
                >
                  <View
                    style={[styles.successBadgeInner, isOfflineOrder && styles.offlineBadgeInner]}
                  >
                    <Ionicons
                      color={theme.colors.textInverse}
                      name={isOfflineOrder ? "cloud-offline-outline" : "checkmark"}
                      size={ms(32)}
                    />
                  </View>
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.delay(150).duration(350)}
                  style={{ alignItems: 'center' }}
                >
                  <Typography style={styles.successHeading} variant="h1">
                    {isOfflineOrder
                      ? t('shop.orderSavedOffline', 'Order Saved Offline!')
                      : t('shop.orderPlacedSuccess', 'Order Placed Successfully!')}
                  </Typography>
                </Animated.View>

                {isOfflineOrder && (
                  <Animated.View
                    entering={FadeInDown.delay(180).duration(350)}
                    style={{ marginTop: ms(8) }}
                  >
                    <Badge label={t('consultation.pendingSync', 'PENDING SYNC • OFFLINE')} variant="warning" />
                  </Animated.View>
                )}

                <Animated.View
                  entering={FadeInDown.delay(230).duration(350)}
                  style={{ alignItems: 'center' }}
                >
                  <Typography style={styles.successSub} variant="bodySmall">
                    {isOfflineOrder
                      ? t(
                          'shop.orderSavedOfflineSub',
                          'Your Ayurvedic order is securely queued on your device and will automatically transmit once connected.',
                        )
                      : t(
                          'shop.orderSuccessSub',
                          'Your Ayurvedic formulations are being handcrafted and prepared for dispatch.',
                        )}
                  </Typography>
                </Animated.View>

                {/* Clean Info Pill */}
                <Animated.View
                  entering={FadeInDown.delay(310).duration(350)}
                  style={styles.orderInfoPill}
                >
                  <Ionicons
                    color={isOfflineOrder ? theme.colors.warning : theme.colors.primary}
                    name={isOfflineOrder ? "shield-checkmark" : "shield-checkmark"}
                    size={ms(16)}
                  />
                  <Typography style={styles.orderInfoText} variant="caption">
                    {isOfflineOrder
                      ? t('shop.offlineOrderPill', 'Offline Protection Active • Auto-Sync on Reconnect')
                      : '100% Authentic Ayush Certified • Dispatch within 24h'}
                  </Typography>
                </Animated.View>

                {/* Action Buttons */}
                <Animated.View
                  entering={FadeInDown.delay(390).duration(350)}
                  style={styles.successBtnGroup}
                >
                  <Button
                    onPress={() => {
                      setCheckoutModalVisible(false);
                      setOrderPlaced(false);
                      navigate(NAVIGATION.PRODUCT_CATALOG);
                    }}
                    style={{ width: '100%' }}
                    title={t('shop.continueShopping', 'Continue Shopping')}
                    variant="primary"
                  />
                  <Button
                    onPress={() => {
                      setCheckoutModalVisible(false);
                      setOrderPlaced(false);
                      navigate(NAVIGATION.TIMELINE);
                    }}
                    style={{ width: '100%', marginTop: ms(10) }}
                    title={t('shop.viewTimeline', 'View Health Timeline')}
                    variant="outline"
                  />
                </Animated.View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  clearText: {
    color: theme.colors.error,
    fontFamily: theme.fonts.bold,
  },
  scrollContent: {
    padding: ms(16),
    paddingBottom: Math.max(rt.insets.bottom, ms(32)),
  },
  discountPromoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    backgroundColor: theme.colors.warningLight,
    padding: ms(12),
    borderRadius: theme.radius.md,
    marginBottom: ms(14),
  },
  discountPromoText: {
    color: theme.colors.warning,
    flex: 1,
  },
  discountSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    backgroundColor: theme.colors.successLight,
    padding: ms(12),
    borderRadius: theme.radius.md,
    marginBottom: ms(14),
  },
  discountSuccessText: {
    color: theme.colors.primary,
    flex: 1,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: ms(12),
    marginBottom: ms(10),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  cartImage: {
    width: ms(70),
    height: ms(70),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  cardContent: {
    flex: 1,
    marginLeft: ms(12),
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productName: {
    flex: 1,
    marginRight: ms(8),
  },
  category: {
    color: theme.colors.primary,
  },
  priceStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: ms(6),
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepperBtn: {
    width: ms(26),
    height: ms(26),
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    paddingHorizontal: ms(8),
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: ms(16),
    marginTop: ms(14),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  summaryTitle: {
    marginBottom: ms(12),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: ms(4),
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
  },
  discountLabel: {
    color: theme.colors.primary,
  },
  discountValue: {
    color: theme.colors.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: ms(10),
    marginTop: ms(10),
    alignItems: 'center',
  },
  checkoutBtn: {
    marginTop: ms(16),
    marginBottom: ms(16),
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
    padding: ms(20),
    paddingBottom: Math.max(rt.insets.bottom, ms(24)),
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
    paddingVertical: ms(16),
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: ms(6),
  },
  successWrapper: {
    alignItems: 'center',
    paddingVertical: ms(20),
  },
  successBadgeOuter: {
    width: ms(84),
    height: ms(84),
    borderRadius: ms(42),
    backgroundColor: theme.colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ms(16),
  },
  offlineBadgeOuter: {
    backgroundColor: theme.colors.warningLight,
  },
  successBadgeInner: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: theme.shadows.sm,
  },
  offlineBadgeInner: {
    backgroundColor: theme.colors.warning,
  },
  successHeading: {
    textAlign: 'center',
    fontSize: ms(20),
    fontFamily: theme.fonts.bold,
  },
  successSub: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: ms(8),
    paddingHorizontal: ms(20),
    lineHeight: ms(20),
  },
  orderInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: ms(8),
    paddingHorizontal: ms(14),
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: ms(16),
  },
  orderInfoText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.semiBold,
  },
  successBtnGroup: {
    width: '100%',
    marginTop: ms(20),
  },
}));
