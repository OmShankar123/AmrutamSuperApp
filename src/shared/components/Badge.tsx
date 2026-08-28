import React, { type FC } from 'react';
import { Text, type TextStyle, View, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ms } from '@/shared/utils/scale';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: FC<BadgeProps> = ({ label, variant = 'neutral', style, textStyle }) => {
  const badgeStyleMap: Record<BadgeVariant, object> = {
    success: styles.success,
    warning: styles.warning,
    error: styles.error,
    info: styles.info,
    neutral: styles.neutral,
  };

  const textStyleMap: Record<BadgeVariant, object> = {
    success: styles.successText,
    warning: styles.warningText,
    error: styles.errorText,
    info: styles.infoText,
    neutral: styles.neutralText,
  };

  return (
    <View style={[styles.badge, badgeStyleMap[variant], style]}>
      <Text style={[styles.text, textStyleMap[variant], textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  badge: {
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(6),
    alignSelf: 'flex-start',
  },
  success: {
    backgroundColor: theme.colors.successLight,
  },
  warning: {
    backgroundColor: theme.colors.warningLight,
  },
  error: {
    backgroundColor: theme.colors.errorLight,
  },
  info: {
    backgroundColor: theme.colors.infoLight,
  },
  neutral: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  text: {
    fontFamily: theme.fonts.bold,
    fontSize: ms(11),
  },
  successText: {
    color: theme.colors.primary,
  },
  warningText: {
    color: theme.colors.warning,
  },
  errorText: {
    color: theme.colors.error,
  },
  infoText: {
    color: theme.colors.info,
  },
  neutralText: {
    color: theme.colors.textSecondary,
  },
}));
