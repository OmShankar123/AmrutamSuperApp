import React, { type FC, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ms } from '@/shared/utils/scale';

export interface ScreenWrapperProps {
  children: ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  withTopInset?: boolean;
  withBottomInset?: boolean;
  withHorizontalPadding?: boolean;
}

export const ScreenWrapper: FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  withTopInset = true,
  withBottomInset = false,
  withHorizontalPadding = true,
}) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        styles.root,
        withTopInset && styles.topInset,
        withBottomInset && styles.bottomInset,
        withHorizontalPadding && styles.horizontalPadding,
        style,
      ]}
    >
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, contentContainerStyle]}>{children}</View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topInset: {
    paddingTop: rt.insets.top,
  },
  bottomInset: {
    paddingBottom: rt.insets.bottom,
  },
  horizontalPadding: {
    paddingHorizontal: ms(16),
  },
  scrollContent: {
    flexGrow: 1,
  },
}));
