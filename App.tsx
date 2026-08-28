import React, { useEffect, useState } from 'react';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useUnistyles } from 'react-native-unistyles';
import * as SplashScreen from 'expo-splash-screen';

import { initI18n } from '@/core/localization/i18n';
import { QueryProvider } from '@/core/providers/QueryProvider';
import { initStorage } from '@/core/storage';
import { rehydrateStores } from '@/core/store';
import { RootNavigator } from '@/navigation/RootNavigator';
import { toastConfig } from '@/shared/utils/toast';

SplashScreen.preventAutoHideAsync();

function AppContent(): React.JSX.Element {
  const { theme } = useUnistyles();

  return (
    <>
      <SystemBars
        style={{
          statusBar: theme.colors.barStyle === 'light-content' ? 'light' : 'dark',
          navigationBar: theme.colors.barStyle === 'light-content' ? 'light' : 'dark',
        }}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <SafeAreaProvider>
            <QueryProvider>
              <RootNavigator />
            </QueryProvider>
          </SafeAreaProvider>
        </KeyboardProvider>
        <Toast config={toastConfig} position="top" />
      </GestureHandlerRootView>
    </>
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
  }, []);

  if (!ready) return null;

  return <AppContent />;
}
