import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { useNetworkStore } from '@/core/api/services/syncManager';
import { useLanguage } from '@/core/localization/useLanguage';
import { ms } from '@/shared/utils/scale';

import { Typography } from './Typography';

export function OfflineBanner(): React.JSX.Element | null {
  const isConnected = useNetworkStore((s) => s.isConnected);
  const isForcedOffline = useNetworkStore((s) => s.isForcedOffline);
  const isSyncing = useNetworkStore((s) => s.isSyncing);
  const pendingSyncCount = useNetworkStore((s) => s.pendingSyncCount);
  const { theme } = useUnistyles();
  const { t } = useLanguage();

  if (isConnected && !isSyncing) return null;

  if (isSyncing) {
    return (
      <View style={[styles.banner, styles.syncingBanner]}>
        <ActivityIndicator color={theme.colors.textInverse} size="small" />
        <Typography style={styles.text} variant="caption">
          {t('offline.syncing', 'Syncing queued changes...')}
        </Typography>
      </View>
    );
  }

  const queueInfo =
    pendingSyncCount > 0 ? ` • ${pendingSyncCount} action(s) queued for sync` : '';

  return (
    <View style={styles.banner}>
      <Ionicons color={theme.colors.textInverse} name="cloud-offline-outline" size={ms(16)} />
      <Typography style={styles.text} variant="caption">
        {isForcedOffline
          ? `${t('dev.offlineSimulated', 'OFFLINE (Simulated)')}${queueInfo}`
          : `${t('offline.banner', 'You are offline — showing cached data')}${queueInfo}`}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  banner: {
    paddingTop: rt.insets.top + ms(4),
    paddingBottom: ms(6),
    paddingHorizontal: ms(16),
    backgroundColor: theme.colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(8),
    zIndex: 999,
  },
  syncingBanner: {
    backgroundColor: theme.colors.primary,
  },
  text: {
    color: theme.colors.textInverse,
    fontFamily: theme.fonts.bold,
  },
}));
