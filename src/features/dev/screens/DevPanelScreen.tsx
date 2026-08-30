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
import { cacheStorage } from '@/core/storage';
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
  const isForcedOffline = useNetworkStore((s) => s.isForcedOffline);
  const setForcedOffline = useNetworkStore((s) => s.setForcedOffline);

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
    setForcedOffline(val);
    setChaos(getChaosConfig());
    if (val) {
      showSuccessToast(t('dev.offlineEnabled', 'Simulated offline mode enabled'), 'Offline Mode');
    } else {
      showSuccessToast(t('dev.onlineRestored', 'Simulated online mode restored'), 'Online Mode');
    }
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
    cacheStorage.clearAll();
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
      { type: 'CONSULTATION_REMINDER', doctorId: 'doc_1' },
    );
  };

  const latencyPresets = [
    { label: 'Off', val: 0 },
    { label: '200ms (Fast 4G)', val: 200 },
    { label: '800ms (3G)', val: 800 },
    { label: '2000ms (Edge)', val: 2000 },
    { label: '4000ms (Extreme)', val: 4000 },
  ];

  const errorRatePresets = [
    { label: '0%', val: 0 },
    { label: '10%', val: 0.1 },
    { label: '25%', val: 0.25 },
    { label: '50%', val: 0.5 },
    { label: '100%', val: 1.0 },
  ];

  return (
    <ScreenWrapper style={styles.screen} withHorizontalPadding={false} withTopInset={false}>
      <Header
        subtitle={t('dev.subtitle', 'API Simulation & Diagnostics')}
        title={t('dev.title', 'Chaos & Dev Panel')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Runtime Theme Switcher (Placed at Top) */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons color={theme.colors.primary} name="color-palette-outline" size={ms(18)} />
            <Typography variant="h3">
              {t('dev.runtimeThemeSwitcher', 'Runtime Theme Switcher')}
            </Typography>
          </View>
          <Typography style={styles.sectionDesc} variant="caption">
            {t(
              'dev.themeSwitcherSub',
              'Switch between Vedic Light, Dark, or System Adaptive theme on the fly',
            )}
          </Typography>

          <View style={styles.themeGrid}>
            {(['light', 'dark', 'system'] as const).map((mode) => {
              const isSelected = activeTheme === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => handleSelectTheme(mode)}
                  style={[styles.themeChip, isSelected && styles.themeChipActive]}
                >
                  <Ionicons
                    color={isSelected ? theme.colors.textInverse : theme.colors.text}
                    name={
                      mode === 'light'
                        ? 'sunny-outline'
                        : mode === 'dark'
                          ? 'moon-outline'
                          : 'phone-portrait-outline'
                    }
                    size={ms(16)}
                  />
                  <Typography
                    style={isSelected ? styles.themeTextActive : styles.themeText}
                    variant="bodySmallSemiBold"
                  >
                    {mode === 'light'
                      ? t('dev.light', 'Light')
                      : mode === 'dark'
                        ? t('dev.dark', 'Dark')
                        : t('dev.system', 'System')}
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
              thumbColor={isForcedOffline ? theme.colors.error : theme.colors.border}
              trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.errorLight }}
              value={isForcedOffline}
            />
          </View>
        </View>

        {/* Push Notification Diagnostics Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons color={theme.colors.primary} name="notifications-outline" size={ms(18)} />
            <Typography variant="h3">
              {t('dev.pushDiagnostics', 'Push Notification Diagnostics')}
            </Typography>
          </View>
          <Typography style={styles.sectionDesc} variant="caption">
            {t(
              'dev.pushDiagnosticsSub',
              'Verify APNs / FCM hardware tokens, permissions, and test local notifications',
            )}
          </Typography>

          <View style={styles.diagRow}>
            <Typography style={styles.diagLabel} variant="bodySmall">
              {t('dev.permissionStatus', 'OS Permission')}
            </Typography>
            <Typography
              style={permissionGranted ? styles.connectedText : styles.disconnectedText}
              variant="bodySmallSemiBold"
            >
              {permissionGranted
                ? t('dev.granted', 'GRANTED')
                : t('dev.notGranted', 'NOT GRANTED')}
            </Typography>
          </View>

          <View style={styles.tokenBox}>
            <Typography style={styles.tokenLabel} variant="caption">
              {t('dev.expoPushToken', 'Expo Push Token')}
            </Typography>
            <Typography numberOfLines={2} selectable style={styles.tokenValue} variant="caption">
              {expoPushToken || t('dev.tokenPending', 'No token generated yet')}
            </Typography>
          </View>

          {devicePushToken ? (
            <View style={styles.tokenBox}>
              <Typography style={styles.tokenLabel} variant="caption">
                {t('dev.nativeDeviceToken', 'Native FCM/APNs Device Token')}
              </Typography>
              <Typography numberOfLines={2} selectable style={styles.tokenValue} variant="caption">
                {devicePushToken}
              </Typography>
            </View>
          ) : null}

          <View style={styles.btnRow}>
            {!permissionGranted ? (
              <Button
                onPress={requestPermissionAndGetToken}
                size="sm"
                style={styles.actionBtn}
                title={t('dev.requestPushPermission', 'Request Permission & Token')}
                variant="outline"
              />
            ) : null}
            <Button
              onPress={handleTestNotification}
              size="sm"
              style={styles.actionBtn}
              title={t('dev.sendTestPush', 'Trigger Local Test Push')}
              variant="secondary"
            />
          </View>
        </View>

        {/* Feature Flags (Config Remote/Local) */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons color={theme.colors.primary} name="flag-outline" size={ms(18)} />
            <Typography variant="h3">{t('dev.featureFlags', 'Feature Flags')}</Typography>
          </View>
          <Typography style={styles.sectionDesc} variant="caption">
            {t('dev.featureFlagsSub', 'Toggle experimental and in-flight features instantly')}
          </Typography>

          <View style={styles.flagItem}>
            <View style={styles.labelGroup}>
              <Typography variant="bodySemiBold">
                {t('dev.flagAyushDiscount', 'AYUSH Ministry Discount')}
              </Typography>
              <Typography style={styles.subtext} variant="caption">
                {t('dev.flagAyushDiscountSub', 'Enable special ministry subsidies in cart')}
              </Typography>
            </View>
            <Switch
              onValueChange={(val) => setFlag('enableAyushDiscount', val)}
              thumbColor={flags.enableAyushDiscount ? theme.colors.primary : theme.colors.border}
              trackColor={{
                false: theme.colors.surfaceElevated,
                true: theme.colors.primaryLight,
              }}
              value={flags.enableAyushDiscount}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.flagItem}>
            <View style={styles.labelGroup}>
              <Typography variant="bodySemiBold">
                {t('dev.flagPdfExport', 'Prescription PDF Export')}
              </Typography>
              <Typography style={styles.subtext} variant="caption">
                {t('dev.flagPdfExportSub', 'Allow direct download and print of health records')}
              </Typography>
            </View>
            <Switch
              onValueChange={(val) => setFlag('enablePdfExport', val)}
              thumbColor={flags.enablePdfExport ? theme.colors.primary : theme.colors.border}
              trackColor={{
                false: theme.colors.surfaceElevated,
                true: theme.colors.primaryLight,
              }}
              value={flags.enablePdfExport}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.flagItem}>
            <View style={styles.labelGroup}>
              <Typography variant="bodySemiBold">
                {t('dev.flagDoctorRatingSort', 'Doctor Rating Sort Filter')}
              </Typography>
              <Typography style={styles.subtext} variant="caption">
                {t('dev.flagDoctorRatingSortSub', 'Sort doctors by patient satisfaction rating')}
              </Typography>
            </View>
            <Switch
              onValueChange={(val) => setFlag('enableDoctorRatingSort', val)}
              thumbColor={
                flags.enableDoctorRatingSort ? theme.colors.primary : theme.colors.border
              }
              trackColor={{
                false: theme.colors.surfaceElevated,
                true: theme.colors.primaryLight,
              }}
              value={flags.enableDoctorRatingSort}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.flagItem}>
            <View style={styles.labelGroup}>
              <Typography variant="bodySemiBold">
                {t('dev.flagExpressDelivery', 'Express Dispatch Tier')}
              </Typography>
              <Typography style={styles.subtext} variant="caption">
                {t('dev.flagExpressDeliverySub', 'Ultra-fast dispatch tier option for medicines')}
              </Typography>
            </View>
            <Switch
              onValueChange={(val) => setFlag('enableExpressDelivery', val)}
              thumbColor={
                flags.enableExpressDelivery ? theme.colors.primary : theme.colors.border
              }
              trackColor={{
                false: theme.colors.surfaceElevated,
                true: theme.colors.primaryLight,
              }}
              value={flags.enableExpressDelivery}
            />
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
              style={!isConnected ? styles.disconnectedText : styles.connectedText}
              variant="bodySmallSemiBold"
            >
              {isForcedOffline
                ? t('dev.offlineSimulated', 'OFFLINE (Simulated)')
                : isConnected
                  ? t('dev.online', 'ONLINE')
                  : t('dev.offline', 'OFFLINE')}
            </Typography>
          </View>

          <View style={styles.diagRow}>
            <Typography style={styles.diagLabel} variant="bodySmall">
              {t('dev.mmkvEngine', 'MMKV Storage Engine')}
            </Typography>
            <Typography style={styles.connectedText} variant="bodySmallSemiBold">
              {t('dev.active', 'Active')}
            </Typography>
          </View>

          <View style={styles.diagRow}>
            <Typography style={styles.diagLabel} variant="bodySmall">
              {t('dev.queryCache', 'TanStack Query Cache')}
            </Typography>
            <Typography style={styles.connectedText} variant="bodySmallSemiBold">
              {t('dev.hydrated', 'Hydrated')}
            </Typography>
          </View>
        </View>

        {/* Cache & Data Management */}
        <View style={styles.card}>
          <Typography variant="h3">
            {t('dev.wipeCache', 'Wipe Query Cache & Reset Stores')}
          </Typography>
          <Typography style={styles.sectionDesc} variant="caption">
            {t(
              'dev.wipeCacheSub',
              'Clear local queries, mutations queue, cart and wishlist for clean state testing',
            )}
          </Typography>
          <Button
            onPress={handleResetCache}
            style={styles.wipeBtn}
            title={t('dev.wipeCache', 'Wipe All Local Storage')}
            variant="danger"
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: ms(16),
    paddingBottom: ms(40),
    gap: ms(14),
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: ms(14),
    padding: ms(16),
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: ms(10),
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
    gap: ms(8),
  },
  sectionDesc: {
    color: theme.colors.textSecondary,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(8),
    marginTop: ms(4),
  },
  presetChip: {
    paddingVertical: ms(8),
    paddingHorizontal: ms(12),
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  presetChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  presetText: {
    color: theme.colors.text,
  },
  presetTextActive: {
    color: theme.colors.textInverse,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: ms(10),
    marginTop: ms(4),
  },
  themeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(6),
    paddingVertical: ms(10),
    borderRadius: ms(10),
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  themeChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  themeText: {
    color: theme.colors.text,
  },
  themeTextActive: {
    color: theme.colors.textInverse,
  },
  flagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: ms(4),
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  tokenBox: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: ms(8),
    padding: ms(10),
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: ms(4),
  },
  tokenLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bold,
  },
  tokenValue: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.semiBold,
  },
  btnRow: {
    flexDirection: 'row',
    gap: ms(10),
    marginTop: ms(4),
  },
  actionBtn: {
    flex: 1,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ms(4),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  diagLabel: {
    color: theme.colors.textSecondary,
  },
  connectedText: {
    color: theme.colors.success,
  },
  disconnectedText: {
    color: theme.colors.error,
  },
  wipeBtn: {
    marginTop: ms(4),
  },
}));
