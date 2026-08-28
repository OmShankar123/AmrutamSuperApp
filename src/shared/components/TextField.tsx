import React, { type FC, type ReactNode } from 'react';
import {
  Text,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ms } from '@/shared/utils/scale';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const TextField: FC<TextFieldProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  ...rest
}) => {
  const { theme } = useUnistyles();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={theme.colors.textTertiary}
          style={[styles.input, inputStyle]}
          {...rest}
        />
        {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    marginVertical: ms(6),
  },
  label: {
    fontFamily: theme.fonts.semiBold,
    fontSize: ms(13),
    color: theme.colors.text,
    marginBottom: ms(4),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: ms(12),
    minHeight: ms(44),
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  leftIconWrapper: {
    marginRight: ms(8),
  },
  rightIconWrapper: {
    marginLeft: ms(8),
  },
  input: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: ms(14),
    color: theme.colors.text,
    paddingVertical: ms(10),
  },
  errorText: {
    fontFamily: theme.fonts.regular,
    fontSize: ms(11),
    color: theme.colors.error,
    marginTop: ms(3),
  },
}));
