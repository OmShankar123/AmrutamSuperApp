import React, { type FC, type ReactNode } from 'react';
import { Pressable, Text, type TextStyle, View, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ms } from '@/shared/utils/scale';

export interface ChipProps {
  label: string;
  selected?: boolean;
  icon?: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Chip: FC<ChipProps> = ({
  label,
  selected = false,
  icon,
  onPress,
  style,
  textStyle,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <Text style={[styles.text, selected && styles.textSelected, textStyle]}>{label}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  chip: {
    paddingHorizontal: ms(11),
    paddingVertical: ms(6),
    backgroundColor: theme.colors.surface,
    borderRadius: ms(20),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    boxShadow: theme.shadows.sm,
  },
  pressed: {
    opacity: 0.75,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: ms(4),
  },
  text: {
    fontFamily: theme.fonts.semiBold,
    fontSize: ms(12.5),
    color: theme.colors.textSecondary,
  },
  textSelected: {
    color: theme.colors.textInverse,
  },
}));
