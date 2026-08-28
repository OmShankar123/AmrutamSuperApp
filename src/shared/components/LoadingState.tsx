import React, { type FC } from 'react';
import { ActivityIndicator, View, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ms } from '@/shared/utils/scale';

import { Typography } from './Typography';

export interface LoadingStateProps {
  message?: string;
  style?: ViewStyle;
  size?: 'small' | 'large';
}

export const LoadingState: FC<LoadingStateProps> = ({ message, style, size = 'large' }) => {
  const { theme } = useUnistyles();

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator color={theme.colors.primary} size={size} />
      {message ? (
        <Typography style={styles.message} variant="bodySmall">
          {message}
        </Typography>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ms(24),
  },
  message: {
    color: theme.colors.textSecondary,
    marginTop: ms(12),
    textAlign: 'center',
  },
}));
