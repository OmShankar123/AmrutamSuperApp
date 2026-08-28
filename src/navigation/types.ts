import type { NavigatorScreenParams } from '@react-navigation/native';

import type { NAVIGATION } from './constants';

export type TabParamList = {
  [NAVIGATION.DOCTOR_LIST]: undefined;
  [NAVIGATION.PRODUCT_CATALOG]: undefined;
  [NAVIGATION.TIMELINE]: undefined;
  [NAVIGATION.UPCOMING_CONSULTATIONS]: undefined;
  [NAVIGATION.CART]: undefined;
};

export type RootStackParamList = {
  [NAVIGATION.MAIN_TABS]: NavigatorScreenParams<TabParamList> | undefined;

  // Consultation Flow
  [NAVIGATION.DOCTOR_LIST]: undefined;
  [NAVIGATION.DOCTOR_DETAIL]: { doctorId: string };
  [NAVIGATION.SLOT_BOOKING]: { doctorId: string };
  [NAVIGATION.BOOKING_CONFIRMATION]: { bookingId: string };
  [NAVIGATION.UPCOMING_CONSULTATIONS]: undefined;

  // Shop Flow
  [NAVIGATION.PRODUCT_CATALOG]: undefined;
  [NAVIGATION.PRODUCT_DETAIL]: { productId: string };
  [NAVIGATION.CART]: undefined;
  [NAVIGATION.WISHLIST]: undefined;

  // Health Records Flow
  [NAVIGATION.TIMELINE]: undefined;
  [NAVIGATION.RECORD_DETAIL]: { recordId: string };

  // Chaos & Dev Panel
  [NAVIGATION.DEV_PANEL]: undefined;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
