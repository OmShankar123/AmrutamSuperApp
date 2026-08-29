import React, { useState } from 'react';
import { ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import type { ChaosConfig } from '@/core/api/interceptors/chaos';
import { getChaosConfig, setChaosConfig } from '@/core/api/interceptors/chaos';
import { useNetworkStore } from '@/core/api/services/syncManager';
import { useFeatureFlags } from '@/core/config/featureFlags';
import { useLanguage } from '@/core/localization/useLanguage';
import { usePushNotifications } from '@/core/notifications';
import { queryClient } from '@/core/providers/QueryProvider';
import { clearMutationQueue } from '@/core/storage/queue';
import { useCartStore } from '@/features/shop/store/useCartStore';
import { useWishlistStore } from '@/features/shop/store/useWishlistStore';
import { Button } from '@/shared/components/Button';
import { Header } from '@/shared/components/Header';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';
import { showSuccessToast } from '@/shared/utils/toast';

export function DevPanelScreen(): React.JSX.Element {
  const { theme } = useUnistyles();
  const { t } = useLanguage();
  const [chaos, setChaos] = useState<ChaosConfig>(getChaosConfig);
  const isConnected = useNetworkStore((s) => s.isConnected);
  const setNetworkState = useNetworkStore((s) => s.setNetworkState);

  const { flags, setFlag, resetFlags } = useFeatureFlags();
  const {
    expoPushToken,
    devicePushToken,
    permissionGranted,
    requestPermissionAndGetToken,
    sendLocalNotification,
  } = usePushNotifications();

  const [activeTheme, setActiveTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (UnistylesRuntime.hasAdaptiveThemes) return 'system';
    return (UnistylesRuntime.themeName as 'light' | 'dark') || 'light';
  });

  const updateChaos = (patch: Partial<ChaosConfig>) => {
    setChaosConfig(patch);
    setChaos(getChaosConfig());
  };

  const toggleForceOffline = (val: boolean) => {
    updateChaos({ enabled: true, offline: val });
    setNetworkState(!val, !val);
  };

  const handleSelectTheme = (mode: 'light' | 'dark' | 'system') => {
    setActiveTheme(mode);
    if (mode === 'system') {
      UnistylesRuntime.setAdaptiveThemes(true);
    } else {
      UnistylesRuntime.setAdaptiveThemes(false);
      UnistylesRuntime.setTheme(mode);
    }
    showSuccessToast(`Theme changed to ${mode.toUpperCase()}`, 'Theme Updated');
  };

  const handleResetCache = () => {
    queryClient.clear();
    clearMutationQueue();
    resetFlags();
    useCartStore.getState().clearCart();
    useWishlistStore.getState().clearWishlist();
    showSuccessToast(
      t('dev.cacheWiped', 'TanStack Cache, MMKV Mutation Queue, Cart, and Wishlist reset!'),
      t('dev.wiped', 'Wiped'),
    );
  };

  const handleTestNotification = async () => {
    await sendLocalNotification(
      '🌿 Amrutam Consultation Reminder',
      'Your upcoming Ayurvedic consultation with Dr. Pari Iyer starts in 15 minutes!',
      { doctorId: 'doc-1', type: 'consultation_reminder' },
    );
    showSuccessToast(
      'Test notification sent with high priority sound & badge!',
      'Notification Sent',
    );
  };

  const latencyPresets = [
    { label: t('dev.zeroDelay', '0ms (Fast)'), val: 0 },
    { label: t('dev.normalWifi', '350ms (Normal 4G)'), val: 350 },
    { label: t('dev.slow3g', '2000ms (Slow 3G)'), val: 2000 },
    { label: t('dev.edge2g', '4000ms (2G Network)'), val: 4000 },
  ];

  const errorRatePresets = [
    { label: t('dev.zeroErrors', '0% (Stable)'), val: 0 },
    { label: t('dev.tenPercent', '10% (Flaky)'), val: 0.1 },
    { label: t('dev.twentyFivePercent', '25% (Degraded)'), val: 0.25 },
    { label: t('dev.fiftyPercent', '50% (High Failure)'), val: 0.5 },
  ];

  const themeOptions: {
    label: string;
    mode: 'light' | 'dark' | 'system';
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { label: t('dev.light', 'Light'), mode: 'light', icon: 'sunny-outline' },
    { label: t('dev.dark', 'Dark'), mode: 'dark', icon: 'moon-outline' },
    { label: t('dev.system', 'System'), mode: 'system', icon: 'phone-portrait-outline' },
  ];

  const deliveryThresholdPresets = [
    { label: '₹299 (Flash Sale)', val: 299 },
    { label: '₹500 (Default)', val: 500 },
    { label: '₹999 (Standard)', val: 999 },
  ];

  const discountRatePresets = [
    { label: '10% (Default)', val: 10 },
    { label: '15% (Festive)', val: 15 },
    { label: '20% (Mega Sale)', val: 20 },
  ];

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
      <Header showClose title={t('dev.title', 'Developer & Chaos Panel')} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Theme Switcher (Dark Mode Toggle) */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons color={theme.colors.primary} name="color-palette-outline" size={ms(18)} />
            <Typography variant="h3">{t('dev.themeMode', 'App Theme Mode')}</Typography>
          </View>
          <Typography style={styles.sectionDesc} variant="caption">
            {t('dev.themeModeSub', 'Switch between Light, Dark, or System Adaptive theme')}
          </Typography>

          <View style={styles.presetGrid}>
            {themeOptions.map((opt) => {
              const isSelected = activeTheme === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  onPress={() => handleSelectTheme(opt.mode)}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                >
                  <Ionicons
                    color={isSelected ? theme.colors.textInverse : theme.colors.textSecondary}
                    name={opt.icon}
                    size={ms(14)}
                  />
                  <Typography
                    style={isSelected ? styles.presetTextActive : styles.presetText}
                    variant="bodySmallSemiBold"
                  >
                    {opt.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Push Notification Diagnostics */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons color={theme.colors.primary} name="notifications-outline" size={ms(18)} />
            <Typography variant="h3">Push Notifications & FCM</Typography>
          </View>
          <Typography style={styles.sectionDesc} variant="caption">
            Expo SDK 57 push token generator, notification channels & permissions
          </Typography>

          <View style={styles.diagRow}>
            <Typography style={styles.diagLabel} variant="bodySmall">
              Permission Status
            </Typography>
            <Typography
              style={permissionGranted ? styles.connectedText : styles.disconnectedText}
              variant="bodySmallSemiBold"
            >
              {permissionGranted ? 'GRANTED' : 'NOT GRANTED'}
            </Typography>
          </View>

          <View style={styles.diagRow}>
            <Typography style={styles.diagLabel} variant="bodySmall">
              Expo Push Token
            </Typography>
            <Typography
              numberOfLines={1}
              style={[styles.diagValue, { maxWidth: '55%' }]}
              variant="caption"
            >
              {expoPushToken ?? 'Requesting...'}
            </Typography>
          </View>

          {devicePushToken && (
            <View style={styles.diagRow}>
              <Typography style={styles.diagLabel} variant="bodySmall">
                Native FCM Token
              </Typography>
              <Typography
                numberOfLines={1}
                style={[styles.diagValue, { maxWidth: '55%' }]}
                variant="caption"
              >
                {devicePushToken}
              </Typography>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: ms(8), marginTop: ms(10) }}>
            <Button
              onPress={requestPermissionAndGetToken}
              style={{ flex: 1 }}
              title="Request Permission"
              variant="outline"
            />
            <Button
              leftIcon={
                <Ionicons
                  color={theme.colors.textInverse}
                  name="paper-plane-outline"
                  size={ms(14)}
                />
              }
              onPress={handleTestNotification}
              style={{ flex: 1 }}
              title="Trigger Test Push"
              variant="primary"
            />
          </View>
        </View>

        {/* Remote Feature Flags Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons color={theme.colors.primary} name="flag-outline" size={ms(18)} />
            <Typography variant="h3">Remote Feature Flags</Typography>
          </View>
          <Typography style={styles.sectionDesc} variant="caption">
            Toggle dynamic app features and promotional campaigns in real-time
          </Typography>

          <View style={styles.flagRow}>
            <View style={styles.flagLabelWrap}>
              <Typography variant="bodySmallSemiBold">AYUSH Discount Banner</Typography>
              <Typography style={styles.flagDesc} variant="caption">
                Enables promotional discount campaign in Shop Cart
              </Typography>
            </View>
            <Switch
              onValueChange={(val) => setFlag('enableAyushDiscount', val)}
              thumbColor={flags.enableAyushDiscount ? theme.colors.primary : theme.colors.border}
              trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.primaryLight }}
              value={flags.enableAyushDiscount}
            />
          </View>

          <View style={styles.flagRow}>
            <View style={styles.flagLabelWrap}>
              <Typography variant="bodySmallSemiBold">PDF Report Export</Typography>
              <Typography style={styles.flagDesc} variant="caption">
                Enables client-side PDF medical summary export in Health Records
              </Typography>
            </View>
            <Switch
              onValueChange={(val) => setFlag('enablePdfExport', val)}
              thumbColor={flags.enablePdfExport ? theme.colors.primary : theme.colors.border}
              trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.primaryLight }}
              value={flags.enablePdfExport}
            />
          </View>

          <View style={styles.flagRow}>
            <View style={styles.flagLabelWrap}>
              <Typography variant="bodySmallSemiBold">Doctor Rating Sort</Typography>
              <Typography style={styles.flagDesc} variant="caption">
                Enables the top ratings sort algorithm in Consultation & Shop catalogs
              </Typography>
            </View>
            <Switch
              onValueChange={(val) => setFlag('enableDoctorRatingSort', val)}
              thumbColor={flags.enableDoctorRatingSort ? theme.colors.primary : theme.colors.border}
              trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.primaryLight }}
              value={flags.enableDoctorRatingSort}
            />
          </View>
        </View>

        {/* Remote Config Dynamic Parameters */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons color={theme.colors.primary} name="cloud-outline" size={ms(18)} />
            <Typography variant="h3">Remote Config Dynamic Variables</Typography>
          </View>
          <Typography style={styles.sectionDesc} variant="caption">
            Change runtime values and business rules over the air
          </Typography>

          <Typography style={styles.subHeading} variant="label">
            Free Delivery Threshold (Current: ₹{flags.freeDeliveryThreshold})
          </Typography>
          <View style={styles.presetGrid}>
            {deliveryThresholdPresets.map((preset) => {
              const isSelected = flags.freeDeliveryThreshold === preset.val;
              return (
                <TouchableOpacity
                  key={preset.val}
                  onPress={() => setFlag('freeDeliveryThreshold', preset.val)}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                >
                  <Typography
                    style={isSelected ? styles.presetTextActive : styles.presetText}
                    variant="bodySmallSemiBold"
                  >
                    {preset.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>

          <Typography style={[styles.subHeading, { marginTop: ms(12) }]} variant="label">
            Promotional Discount Rate (Current: {flags.discountPercentage}%)
          </Typography>
          <View style={styles.presetGrid}>
            {discountRatePresets.map((preset) => {
              const isSelected = flags.discountPercentage === preset.val;
              return (
                <TouchableOpacity
                  key={preset.val}
                  onPress={() => setFlag('discountPercentage', preset.val)}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                >
                  <Typography
                    style={isSelected ? styles.presetTextActive : styles.presetText}
                    variant="bodySmallSemiBold"
                  >
                    {preset.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Chaos Mode Master Switch */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.labelGroup}>
              <Typography variant="h3">{t('dev.chaosMode', 'Chaos Mode')}</Typography>
              <Typography style={styles.subtext} variant="caption">
                {t('dev.chaosModeSub', 'Enable simulated network latency & error injection')}
              </Typography>
            </View>
            <Switch
              onValueChange={(enabled) => updateChaos({ enabled })}
              thumbColor={chaos.enabled ? theme.colors.primary : theme.colors.border}
              trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.primaryLight }}
              value={chaos.enabled}
            />
          </View>
        </View>

        {/* Latency Presets */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons color={theme.colors.primary} name="timer-outline" size={ms(18)} />
            <Typography variant="h3">
              {t('dev.simulatedLatency', 'Simulated API Latency')}
            </Typography>
          </View>
          <Typography style={styles.sectionDesc} variant="caption">
            {t('dev.currentDelay', 'Current delay: {{ms}}ms', { ms: chaos.delayMs })}
          </Typography>

          <View style={styles.presetGrid}>
            {latencyPresets.map((preset) => {
              const isSelected = chaos.delayMs === preset.val;
              return (
                <TouchableOpacity
                  key={preset.val}
                  onPress={() => updateChaos({ enabled: true, delayMs: preset.val })}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                >
                  <Typography
                    style={isSelected ? styles.presetTextActive : styles.presetText}
                    variant="bodySmallSemiBold"
                  >
                    {preset.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 500 Error Rate Injection */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons color={theme.colors.error} name="warning-outline" size={ms(18)} />
            <Typography variant="h3">
              {t('dev.errorInjection', 'HTTP 500 Error Injection')}
            </Typography>
          </View>
          <Typography style={styles.sectionDesc} variant="caption">
            {t('dev.errorProbability', 'Probability of simulated network failure: {{rate}}%', {
              rate: Math.round(chaos.errorRate * 100),
            })}
          </Typography>

          <View style={styles.presetGrid}>
            {errorRatePresets.map((preset) => {
              const isSelected = chaos.errorRate === preset.val;
              return (
                <TouchableOpacity
                  key={preset.val}
                  onPress={() => updateChaos({ enabled: true, errorRate: preset.val })}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                >
                  <Typography
                    style={isSelected ? styles.presetTextActive : styles.presetText}
                    variant="bodySmallSemiBold"
                  >
                    {preset.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Force Offline Toggle */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.labelGroup}>
              <Typography variant="h3">{t('dev.forceOffline', 'Force Offline Mode')}</Typography>
              <Typography style={styles.subtext} variant="caption">
                {t(
                  'dev.forceOfflineSub',
                  'Disconnect app from network to test offline sync banner & cached queries',
                )}
              </Typography>
            </View>
            <Switch
              onValueChange={toggleForceOffline}
              thumbColor={!isConnected ? theme.colors.error : theme.colors.border}
              trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.errorLight }}
              value={!isConnected}
            />
          </View>
        </View>

        {/* System Diagnostics */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons color={theme.colors.info} name="analytics-outline" size={ms(18)} />
            <Typography variant="h3">{t('dev.systemDiagnostics', 'System Diagnostics')}</Typography>
          </View>

          <View style={styles.diagRow}>
            <Typography style={styles.diagLabel} variant="bodySmall">
              {t('dev.networkStatus', 'Network Status')}
            </Typography>
            <Typography
              style={isConnected ? styles.connectedText : styles.disconnectedText}
              variant="bodySmallSemiBold"
            >
              {isConnected
                ? t('dev.online', 'ONLINE')
                : t('dev.offlineSimulated', 'OFFLINE (Simulated)')}
            </Typography>
          </View>

          <View style={styles.diagRow}>
            <Typography style={styles.diagLabel} variant="bodySmall">
              {t('dev.mmkvEngine', 'MMKV Storage Engine')}
            </Typography>
            <Typography variant="bodySmallSemiBold">{t('dev.active', 'Active')}</Typography>
          </View>

          <View style={styles.diagRow}>
            <Typography style={styles.diagLabel} variant="bodySmall">
              {t('dev.queryCache', 'TanStack Query Cache')}
            </Typography>
            <Typography variant="bodySmallSemiBold">{t('dev.hydrated', 'Hydrated')}</Typography>
          </View>
        </View>

        {/* Actions */}
        <Button
          leftIcon={
            <Ionicons color={theme.colors.textInverse} name="trash-outline" size={ms(18)} />
          }
          onPress={handleResetCache}
          style={styles.resetBtn}
          title={t('dev.wipeCache', 'Wipe Query Cache & Reset Stores')}
          variant="danger"
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    padding: ms(16),
    paddingBottom: ms(40),
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: ms(16),
    marginBottom: ms(12),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelGroup: {
    flex: 1,
    paddingRight: ms(12),
  },
  subtext: {
    color: theme.colors.textSecondary,
    marginTop: ms(2),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    marginBottom: ms(4),
  },
  sectionDesc: {
    color: theme.colors.textSecondary,
    marginBottom: ms(12),
  },
  subHeading: {
    marginBottom: ms(6),
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(8),
  },
  presetChip: {
    flex: 1,
    minWidth: '30%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: ms(4),
    paddingVertical: ms(10),
    paddingHorizontal: ms(10),
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  presetChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
  },
  presetText: {
    color: theme.colors.text,
  },
  presetTextActive: {
    color: theme.colors.textInverse,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: ms(10),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceElevated,
  },
  flagLabelWrap: {
    flex: 1,
    paddingRight: ms(12),
  },
  flagDesc: {
    color: theme.colors.textSecondary,
    marginTop: ms(2),
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: ms(6),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceElevated,
  },
  diagLabel: {
    color: theme.colors.textSecondary,
  },
  diagValue: {
    color: theme.colors.text,
  },
  connectedText: {
    color: theme.colors.success,
  },
  disconnectedText: {
    color: theme.colors.error,
  },
  resetBtn: {
    marginTop: ms(12),
  },
}));
