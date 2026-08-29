import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { useLanguage } from '@/core/localization/useLanguage';
import { ms } from '@/shared/utils/scale';

export function LanguageToggle(): React.JSX.Element {
  const { theme } = useUnistyles();
  const { changeLanguage, isHindi } = useLanguage();

  const handleToggle = () => {
    changeLanguage(isHindi ? 'en' : 'hi');
  };

  return (
    <TouchableOpacity
      accessibilityHint="Switches language between English and Hindi"
      accessibilityLabel={`Current language: ${isHindi ? 'Hindi' : 'English'}. Tap to switch.`}
      accessibilityRole="button"
      onPress={handleToggle}
      style={styles.container}
    >
      <Ionicons color={theme.colors.primary} name="globe-outline" size={ms(14)} />
      <Text style={styles.text}>{isHindi ? 'हिन्दी' : 'EN'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    height: ms(32),
    paddingHorizontal: ms(10),
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(4),
    boxShadow: theme.shadows.sm,
  },
  text: {
    fontFamily: theme.fonts.bold,
    fontSize: ms(12),
    color: theme.colors.primary,
  },
}));
