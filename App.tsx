import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import * as SplashScreen from 'expo-splash-screen';

import { initNetworkListener } from '@/core/api/services/syncManager';
import { initI18n } from '@/core/localization/i18n';
import { usePushNotifications } from '@/core/notifications';
import { QueryProvider } from '@/core/providers/QueryProvider';
import { initStorage } from '@/core/storage';
import { rehydrateStores } from '@/core/store';
import { RootNavigator } from '@/navigation/RootNavigator';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { OfflineBanner } from '@/shared/components/OfflineBanner';
import { toastConfig } from '@/shared/utils/toast';

SplashScreen.preventAutoHideAsync();

function AppContent(): React.JSX.Element {
  const { theme } = useUnistyles();

  // Initialize push notifications & request OS permission on app load
  usePushNotifications();

  return (
    <ErrorBoundary>
      <SystemBars
        style={{
          statusBar: theme.colors.barStyle === 'light-content' ? 'light' : 'dark',
          navigationBar: theme.colors.barStyle === 'light-content' ? 'light' : 'dark',
        }}
      />
      <GestureHandlerRootView style={styles.root}>
        <KeyboardProvider>
          <SafeAreaProvider>
            <QueryProvider>
              <View style={styles.root}>
                <OfflineBanner />
                <RootNavigator />
              </View>
            </QueryProvider>
          </SafeAreaProvider>
        </KeyboardProvider>
        <Toast config={toastConfig} position="top" />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default function App(): React.JSX.Element | null {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        await initStorage();
        await rehydrateStores();
        await initI18n();
      } catch (error) {
        if (__DEV__) console.error('[App] bootstrap failed:', error);
      } finally {
        setReady(true);
        SplashScreen.hideAsync();
      }
    }
    bootstrap();

    const unsubscribeNetInfo = initNetworkListener();
    return () => {
      unsubscribeNetInfo();
    };
  }, []);

  if (!ready) return null;

  return <AppContent />;
}

const styles = StyleSheet.create(() => ({
  root: {
    flex: 1,
  },
}));
