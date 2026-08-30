import React from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { useNetworkStore } from '@/core/api/services/syncManager';
import { useLanguage } from '@/core/localization/useLanguage';
import { ms } from '@/shared/utils/scale';

import { Typography } from './Typography';

export function OfflineBanner(): React.JSX.Element | null {
  const isConnected = useNetworkStore((s) => s.isConnected);
  const isForcedOffline = useNetworkStore((s) => s.isForcedOffline);
  const { theme } = useUnistyles();
  const { t } = useLanguage();

  if (isConnected) return null;

  return (
    <View style={styles.banner}>
      <Ionicons color={theme.colors.textInverse} name="cloud-offline-outline" size={ms(16)} />
      <Typography style={styles.text} variant="caption">
        {isForcedOffline
          ? t('dev.offlineSimulated', 'OFFLINE (Simulated)') +
            ' — ' +
            t('offline.showingCached', 'showing cached data')
          : t('offline.banner', 'You are offline — showing cached data')}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  banner: {
    paddingTop: rt.insets.top + ms(4),
    paddingBottom: ms(6),
    paddingHorizontal: ms(16),
    backgroundColor: theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(8),
    zIndex: 999,
  },
  text: {
    color: theme.colors.textInverse,
    fontFamily: theme.fonts.bold,
  },
}));
