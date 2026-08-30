import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { logger } from '@/core/logger';
import { appStorage } from '@/core/storage';

// Configure foreground notification presentation handler for Expo SDK 57
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

const PUSH_TOKEN_STORAGE_KEY = 'amrutam_push_token';
const DEVICE_FCM_TOKEN_STORAGE_KEY = 'amrutam_device_fcm_token';

export interface PushNotificationState {
  expoPushToken: string | null;
  devicePushToken: string | null;
  notification: Notifications.Notification | null;
  permissionGranted: boolean;
  requestPermissionAndGetToken: () => Promise<string | null>;
  sendLocalNotification: (
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ) => Promise<string>;
  scheduleAppointmentReminder: (
    title: string,
    body: string,
    triggerDate: Date,
    data?: Record<string, unknown>,
  ) => Promise<string>;
}

export function usePushNotifications(): PushNotificationState {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(
    () => appStorage.getString(PUSH_TOKEN_STORAGE_KEY) ?? null,
  );
  const [devicePushToken, setDevicePushToken] = useState<string | null>(
    () => appStorage.getString(DEVICE_FCM_TOKEN_STORAGE_KEY) ?? null,
  );
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'General Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1E5631',
      });

      await Notifications.setNotificationChannelAsync('appointments', {
        name: 'Consultation & Doctor Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#1E5631',
      });
    }

    if (!Device.isDevice) {
      logger.warn('PushNotifications', 'Physical device recommended for Push Notifications token.');
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      setPermissionGranted(false);
      logger.warn('PushNotifications', 'Push notification permission was not granted by user.');
      return null;
    }

    setPermissionGranted(true);

    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId ??
        'amrutam-super-app';

      const expoTokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      token = expoTokenResponse.data;
      setExpoPushToken(token);
      appStorage.set(PUSH_TOKEN_STORAGE_KEY, token);
      logger.log('PushNotifications', `Expo Push Token: ${token}`);

      // Retrieve native Device FCM/APNs token for raw backend push
      try {
        const rawDeviceToken = await Notifications.getDevicePushTokenAsync();
        setDevicePushToken(rawDeviceToken.data);
        appStorage.set(DEVICE_FCM_TOKEN_STORAGE_KEY, rawDeviceToken.data);
        logger.log('PushNotifications', `Native FCM Device Token: ${rawDeviceToken.data}`);
      } catch (fcmErr) {
        logger.warn('PushNotifications', 'Native device FCM token fetch skipped:', fcmErr);
      }
    } catch (e) {
      logger.error('PushNotifications', 'Failed to retrieve push token:', e);
    }

    return token;
  };

  const sendLocalNotification = async (
    title: string,
    body: string,
    data: Record<string, unknown> = {},
  ): Promise<string> => {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // deliver immediately
    });
  };

  const scheduleAppointmentReminder = async (
    title: string,
    body: string,
    triggerDate: Date,
    data: Record<string, unknown> = {},
  ): Promise<string> => {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const token = await registerForPushNotificationsAsync();
      if (!isMounted) return;
      if (token) {
        setExpoPushToken(token);
      }
    };

    init();

    // Foreground notification listener
    notificationListener.current = Notifications.addNotificationReceivedListener((notif) => {
      if (isMounted) {
        setNotification(notif);
      }
      logger.log(
        'PushNotifications',
        `Notification Received: ${notif.request.content.title} - ${notif.request.content.body}`,
      );
    });

    // Notification interaction (tap) listener
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      logger.log('PushNotifications', 'User tapped notification:', data);
    });

    return () => {
      isMounted = false;
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    devicePushToken,
    notification,
    permissionGranted,
    requestPermissionAndGetToken: registerForPushNotificationsAsync,
    sendLocalNotification,
    scheduleAppointmentReminder,
  };
}
