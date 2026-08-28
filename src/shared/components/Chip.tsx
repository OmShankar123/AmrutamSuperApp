import React, { type FC } from 'react';
import { Pressable, Text, type TextStyle, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ms } from '@/shared/utils/scale';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Chip: FC<ChipProps> = ({ label, selected = false, onPress, style, textStyle }) => {
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
      <Text style={[styles.text, selected && styles.textSelected, textStyle]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  chip: {
    paddingHorizontal: ms(14),
    paddingVertical: ms(7),
    backgroundColor: theme.colors.surface,
    borderRadius: ms(20),
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: ms(8),
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontFamily: theme.fonts.semiBold,
    fontSize: ms(13),
    color: theme.colors.textSecondary,
  },
  textSelected: {
    color: theme.colors.textInverse,
  },
}));
