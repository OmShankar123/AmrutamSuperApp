import 'tsx/cjs';
import './load-env';

import type { ConfigContext, ExpoConfig } from 'expo/config';

import Env from './env';

export default ({ config }: ConfigContext): ExpoConfig =>
  ({
    ...config,
    name: Env.EXPO_PUBLIC_NAME,
    slug: 'amrutamsuperapp',
    scheme: 'amrutam',
    version: Env.EXPO_PUBLIC_VERSION,
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: false,
      bundleIdentifier: Env.EXPO_PUBLIC_PACKAGE_NAME,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#1B4332',
      },
      package: Env.EXPO_PUBLIC_PACKAGE_NAME,
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#1E5631',
        },
      ],
      [
        'expo-font',
        {
          fonts: [
            './src/assets/fonts/OpenSans-Regular.ttf',
            './src/assets/fonts/OpenSans-Italic.ttf',
            './src/assets/fonts/OpenSans-Semibold.ttf',
            './src/assets/fonts/OpenSans-SemiboldItalic.ttf',
            './src/assets/fonts/OpenSans-Bold.ttf',
            './src/assets/fonts/OpenSans-BoldItalic.ttf',
          ],
        },
      ],
      'expo-image',
      'expo-localization',
      'expo-secure-store',
      'expo-status-bar',
      'expo-sharing',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#1B4332',
          image: './assets/splash.png',
          imageWidth: 200,
        },
      ],
      ['react-native-edge-to-edge', { android: { enforceNavigationBarContrast: false } }],
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '16.4',
          },
        },
      ],
    ],
  }) as ExpoConfig;
