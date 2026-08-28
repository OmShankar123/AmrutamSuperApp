import React, { type FC } from 'react';
import { View, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { ms } from '@/shared/utils/scale';

import { Button } from './Button';
import { Typography } from './Typography';

export interface EmptyStateProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  icon?: string;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: FC<EmptyStateProps> = ({
  iconName = 'leaf-outline',
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => {
  const { theme } = useUnistyles();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons color={theme.colors.primary} name={iconName} size={ms(36)} />
      </View>
      <Typography style={styles.title} variant="h3">
        {title}
      </Typography>
      {description && (
        <Typography style={styles.description} variant="bodySmall">
          {description}
        </Typography>
      )}
      {actionTitle && onAction && (
        <Button
          onPress={onAction}
          style={styles.actionButton}
          title={actionTitle}
          variant="primary"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: ms(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: ms(72),
    height: ms(72),
    borderRadius: ms(36),
    backgroundColor: theme.colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ms(16),
  },
  title: {
    textAlign: 'center',
    marginBottom: ms(6),
  },
  description: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    lineHeight: ms(19),
    marginBottom: ms(20),
    paddingHorizontal: ms(12),
  },
  actionButton: {
    minWidth: ms(140),
  },
}));
