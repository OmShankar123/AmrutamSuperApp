import { StyleSheet } from 'react-native-unistyles';

import { ms } from '@/shared/utils/scale';

import { fonts } from './fonts';

export const TextStyles = StyleSheet.create((theme) => ({
  // Headings
  h1: {
    fontSize: ms(24),
    lineHeight: ms(32),
    fontFamily: fonts.openSans.bold,
    color: theme.colors.text,
  },
  h2: {
    fontSize: ms(20),
    lineHeight: ms(28),
    fontFamily: fonts.openSans.bold,
    color: theme.colors.text,
  },
  h3: {
    fontSize: ms(16),
    lineHeight: ms(22),
    fontFamily: fonts.openSans.semiBold,
    color: theme.colors.text,
  },

  // Body
  bodyLarge: {
    fontSize: ms(16),
    lineHeight: ms(24),
    fontFamily: fonts.openSans.regular,
    color: theme.colors.text,
  },
  body: {
    fontSize: ms(14),
    lineHeight: ms(20),
    fontFamily: fonts.openSans.regular,
    color: theme.colors.text,
  },
  bodySmall: {
    fontSize: ms(12),
    lineHeight: ms(18),
    fontFamily: fonts.openSans.regular,
    color: theme.colors.textSecondary,
  },

  // SemiBold Emphasis
  bodyLargeSemiBold: {
    fontSize: ms(16),
    lineHeight: ms(24),
    fontFamily: fonts.openSans.semiBold,
    color: theme.colors.text,
  },
  bodySemiBold: {
    fontSize: ms(14),
    lineHeight: ms(20),
    fontFamily: fonts.openSans.semiBold,
    color: theme.colors.text,
  },
  bodySmallSemiBold: {
    fontSize: ms(12),
    lineHeight: ms(18),
    fontFamily: fonts.openSans.semiBold,
    color: theme.colors.text,
  },

  // UI & Metadata
  caption: {
    fontSize: ms(11),
    lineHeight: ms(15),
    fontFamily: fonts.openSans.regular,
    color: theme.colors.textTertiary,
  },
  label: {
    fontSize: ms(13),
    lineHeight: ms(18),
    fontFamily: fonts.openSans.semiBold,
    color: theme.colors.text,
  },
  button: {
    fontSize: ms(14),
    lineHeight: ms(20),
    fontFamily: fonts.openSans.bold,
    color: theme.colors.textInverse,
  },
  price: {
    fontSize: ms(16),
    lineHeight: ms(22),
    fontFamily: fonts.openSans.bold,
    color: theme.colors.primary,
  },
  error: {
    fontSize: ms(12),
    lineHeight: ms(16),
    fontFamily: fonts.openSans.regular,
    color: theme.colors.error,
  },
  link: {
    fontSize: ms(14),
    lineHeight: ms(20),
    fontFamily: fonts.openSans.semiBold,
    color: theme.colors.primary,
    textDecorationLine: 'underline' as const,
  },
}));
