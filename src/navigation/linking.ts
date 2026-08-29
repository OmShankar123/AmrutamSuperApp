import type { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { NAVIGATION } from './constants';
import type { RootStackParamList } from './types';

const prefix = Linking.createURL('/');

export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix, 'amrutam://', 'https://amrutam.co.in'],
  config: {
    screens: {
      [NAVIGATION.MAIN_TABS]: {
        screens: {
          [NAVIGATION.DOCTOR_LIST]: 'doctors',
          [NAVIGATION.PRODUCT_CATALOG]: 'shop',
          [NAVIGATION.TIMELINE]: 'records',
          [NAVIGATION.UPCOMING_CONSULTATIONS]: 'appointments',
          [NAVIGATION.CART]: 'cart',
        },
      },
      [NAVIGATION.DOCTOR_DETAIL]: 'doctor/:doctorId',
      [NAVIGATION.SLOT_BOOKING]: 'doctor/:doctorId/book',
      [NAVIGATION.BOOKING_CONFIRMATION]: 'booking/:bookingId',
      [NAVIGATION.PRODUCT_DETAIL]: 'product/:productId',
      [NAVIGATION.WISHLIST]: 'wishlist',
      [NAVIGATION.RECORD_DETAIL]: 'record/:recordId',
      [NAVIGATION.DEV_PANEL]: 'dev',
    },
  },
};
