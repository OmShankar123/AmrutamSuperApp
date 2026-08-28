import React, { type FC, type ReactNode } from 'react';
import { TouchableOpacity, View, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { goBack } from '@/navigation/navigationRef';
import { ms } from '@/shared/utils/scale';

import { Typography } from './Typography';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showClose?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  transparent?: boolean;
  withTopInset?: boolean;
  style?: ViewStyle;
}

export const Header: FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showClose = false,
  onBack,
  rightAction,
  transparent = false,
  withTopInset = true,
  style,
}) => {
  const { theme } = useUnistyles();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  const hasLeftButton = showBack || showClose;

  return (
    <View
      style={[
        styles.container,
        withTopInset && styles.topInset,
        transparent && styles.transparent,
        style,
      ]}
    >
      <View style={styles.innerRow}>
        {/* Left Action Button (Back / Close) */}
        <View style={styles.left}>
          {hasLeftButton ? (
            <TouchableOpacity
              accessibilityLabel={showClose ? 'Close' : 'Go back'}
              accessibilityRole="button"
              onPress={handleBack}
              style={styles.iconBtn}
            >
              <Ionicons
                color={theme.colors.text}
                name={showClose ? 'close' : 'chevron-back'}
                size={ms(20)}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {/* Center Title & Subtitle */}
        <View style={styles.center}>
          {title ? (
            <Typography numberOfLines={1} style={styles.title} variant="h3">
              {title}
            </Typography>
          ) : null}
          {subtitle ? (
            <Typography numberOfLines={1} style={styles.subtitle} variant="caption">
              {subtitle}
            </Typography>
          ) : null}
        </View>

        {/* Right Action */}
        <View style={styles.right}>{rightAction || <View style={styles.placeholder} />}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  topInset: {
    paddingTop: rt.insets.top,
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  innerRow: {
    height: ms(54),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(16),
  },
  left: {
    width: ms(40),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(8),
  },
  right: {
    width: ms(40),
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    color: theme.colors.text,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: ms(1),
  },
  iconBtn: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: ms(36),
    height: ms(36),
  },
}));
