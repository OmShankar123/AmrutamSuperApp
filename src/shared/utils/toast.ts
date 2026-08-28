import type { ToastConfig } from 'react-native-toast-message';

export const toastConfig: ToastConfig = {};

export function showSuccessToast(message: string, title?: string): void {
  const Toast = require('react-native-toast-message').default;
  Toast.show({ type: 'success', text1: title ?? 'Success', text2: message });
}

export function showErrorToast(message: string, title?: string): void {
  const Toast = require('react-native-toast-message').default;
  Toast.show({ type: 'error', text1: title ?? 'Error', text2: message });
}

export function showInfoToast(message: string, title?: string): void {
  const Toast = require('react-native-toast-message').default;
  Toast.show({ type: 'info', text1: title ?? 'Info', text2: message });
}
