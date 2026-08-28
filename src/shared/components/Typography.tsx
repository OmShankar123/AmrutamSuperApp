import React, { type FC } from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { TextStyles } from '@/core/styles/TextStyles';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bodyLarge'
  | 'body'
  | 'bodySmall'
  | 'bodyLargeSemiBold'
  | 'bodySemiBold'
  | 'bodySmallSemiBold'
  | 'caption'
  | 'label'
  | 'button'
  | 'price'
  | 'error'
  | 'link';

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  style?: TextStyle;
}

export const Typography: FC<TypographyProps> = ({
  variant = 'body',
  color,
  style,
  children,
  ...rest
}) => {
  return (
    <Text style={[TextStyles[variant], color ? { color } : undefined, style]} {...rest}>
      {children}
    </Text>
  );
};

export const AppText = Typography;
