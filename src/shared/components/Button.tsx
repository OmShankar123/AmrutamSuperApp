import React, { type FC, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ms } from '@/shared/utils/scale';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'disabled';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...rest
}) => {
  const { theme } = useUnistyles();
  const isActionBlocked = disabled || isLoading || variant === 'disabled';
  const showDisabledStyle = (disabled || variant === 'disabled') && !isLoading;

  const buttonStyleMap: Record<ButtonVariant, object> = {
    primary: styles.primary,
    secondary: styles.secondary,
    outline: styles.outline,
    danger: styles.danger,
    disabled: styles.disabled,
  };

  const sizeStyleMap: Record<ButtonSize, object> = {
    sm: styles.sm,
    md: styles.md,
    lg: styles.lg,
  };

  const textStyleMap: Record<ButtonVariant, object> = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    outline: styles.outlineText,
    danger: styles.dangerText,
    disabled: styles.disabledText,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isActionBlocked, busy: isLoading }}
      disabled={isActionBlocked}
      style={({ pressed }) => [
        styles.base,
        sizeStyleMap[size],
        buttonStyleMap[variant],
        showDisabledStyle && styles.disabled,
        pressed && !isActionBlocked && styles.pressed,
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'secondary'
              ? theme.colors.primary
              : theme.colors.textInverse
          }
          size="small"
        />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}
          <Text
            style={[
              styles.textBase,
              textStyleMap[variant],
              showDisabledStyle && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  base: {
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    paddingVertical: ms(8),
    paddingHorizontal: ms(14),
  },
  md: {
    paddingVertical: ms(12),
    paddingHorizontal: ms(20),
  },
  lg: {
    paddingVertical: ms(15),
    paddingHorizontal: ms(28),
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  danger: {
    backgroundColor: theme.colors.error,
  },
  disabled: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    opacity: 1,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconWrapper: {
    marginRight: ms(8),
  },
  rightIconWrapper: {
    marginLeft: ms(8),
  },
  textBase: {
    fontFamily: theme.fonts.bold,
    fontSize: ms(14),
    textAlign: 'center',
  },
  primaryText: {
    color: theme.colors.textInverse,
  },
  secondaryText: {
    color: theme.colors.text,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  dangerText: {
    color: theme.colors.textInverse,
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
}));
