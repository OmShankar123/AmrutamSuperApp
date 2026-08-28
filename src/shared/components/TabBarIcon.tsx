import React from 'react';
import { Text } from 'react-native';

const ICON_MAP: Record<string, string> = {
  stethoscope: '🩺',
  'shopping-bag': '🛍️',
  'file-medical': '📋',
};

interface TabBarIconProps {
  name: string;
  color: string;
  size: number;
}

export function TabBarIcon({ name, size }: TabBarIconProps): React.JSX.Element {
  return <Text style={{ fontSize: size }}>{ICON_MAP[name] ?? '●'}</Text>;
}
