import React from 'react';
import { View } from 'react-native';
import Toast, { type BaseToastProps, type ToastConfig } from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '@/shared/components/Typography';

import { ms } from './scale';

interface CustomToastViewProps {
  type: 'success' | 'error' | 'info';
  text1?: string;
  text2?: string;
}

const CustomToastView: React.FC<CustomToastViewProps> = ({ type, text1, text2 }) => {
  const { theme } = useUnistyles();

  const getThemeDetails = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: theme.colors.primary,
          bgColor: theme.colors.successLight,
          borderColor: theme.colors.primaryLight,
        };
      case 'error':
        return {
          icon: 'alert-circle' as const,
          color: theme.colors.error,
          bgColor: theme.colors.errorLight,
          borderColor: theme.colors.error,
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          color: theme.colors.info,
          bgColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.border,
        };
    }
  };

  const details = getThemeDetails();

  return (
    <View
      style={[
        styles.toastContainer,
        {
          backgroundColor: theme.colors.surface,
          borderLeftColor: details.color,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: details.bgColor }]}>
        <Ionicons color={details.color} name={details.icon} size={ms(20)} />
      </View>

      <View style={styles.textWrap}>
        {Boolean(text1) && (
          <Typography
            numberOfLines={2}
            style={[styles.title, { color: details.color }]}
            variant="label"
          >
            {text1}
          </Typography>
        )}
        {Boolean(text2) && (
          <Typography
            numberOfLines={4}
            style={[styles.message, { color: theme.colors.text }]}
            variant="caption"
          >
            {text2}
          </Typography>
        )}
      </View>
    </View>
  );
};

export const toastConfig: ToastConfig = {
  success: (props: BaseToastProps) => (
    <CustomToastView text1={props.text1} text2={props.text2} type="success" />
  ),
  error: (props: BaseToastProps) => (
    <CustomToastView text1={props.text1} text2={props.text2} type="error" />
  ),
  info: (props: BaseToastProps) => (
    <CustomToastView text1={props.text1} text2={props.text2} type="info" />
  ),
};

export function showSuccessToast(message: string, title?: string): void {
  Toast.show({ type: 'success', text1: title ?? 'Success', text2: message, visibilityTime: 4000 });
}

export function showErrorToast(message: string, title?: string): void {
  Toast.show({ type: 'error', text1: title ?? 'Error', text2: message, visibilityTime: 5000 });
}

export function showInfoToast(message: string, title?: string): void {
  Toast.show({ type: 'info', text1: title ?? 'Info', text2: message, visibilityTime: 4000 });
}

const styles = StyleSheet.create((theme) => ({
  toastContainer: {
    width: '92%',
    minHeight: ms(56),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(12),
    paddingVertical: ms(10),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderLeftWidth: ms(5),
    boxShadow: theme.shadows.md,
    gap: ms(10),
  },
  iconWrap: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: ms(2),
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: ms(13),
  },
  message: {
    lineHeight: ms(18),
    fontSize: ms(12),
  },
}));
