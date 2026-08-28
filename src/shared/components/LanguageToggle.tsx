import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useLanguage } from '@/core/localization/useLanguage';

export function LanguageToggle(): React.JSX.Element {
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
      <Text style={styles.text}>{isHindi ? '🇮🇳 हिन्दी' : '🌐 EN'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
}));
