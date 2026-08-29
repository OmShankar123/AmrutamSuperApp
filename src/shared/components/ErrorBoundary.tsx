import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { crashReporter } from '@/core/logger/crashReporter';
import { Typography } from '@/shared/components/Typography';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    crashReporter.recordError(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Typography style={styles.title} variant="h2">
            Something went wrong
          </Typography>
          <Typography style={styles.message} variant="bodySmall">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </Typography>
          <TouchableOpacity
            accessibilityLabel="Try Again"
            accessibilityRole="button"
            onPress={this.handleReset}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  title: {
    color: theme.colors.error,
    marginBottom: 8,
  },
  message: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
  },
  buttonText: {
    color: theme.colors.textInverse,
    fontFamily: theme.fonts.bold,
  },
}));
