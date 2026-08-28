import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BookingConfirmationScreen } from '@/features/consultation/screens/BookingConfirmationScreen';
import { DoctorDetailScreen } from '@/features/consultation/screens/DoctorDetailScreen';
import { SlotBookingScreen } from '@/features/consultation/screens/SlotBookingScreen';
import { RecordDetailScreen } from '@/features/health-records/screens/RecordDetailScreen';
import { ProductDetailScreen } from '@/features/shop/screens/ProductDetailScreen';
import { WishlistScreen } from '@/features/shop/screens/WishlistScreen';

import { NAVIGATION } from './constants';
import { navigationRef } from './navigationRef';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen component={TabNavigator} name={NAVIGATION.MAIN_TABS} />

        {/* Consultation Module Stack */}
        <Stack.Screen
          component={DoctorDetailScreen}
          name={NAVIGATION.DOCTOR_DETAIL}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          component={SlotBookingScreen}
          name={NAVIGATION.SLOT_BOOKING}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          component={BookingConfirmationScreen}
          name={NAVIGATION.BOOKING_CONFIRMATION}
          options={{ animation: 'fade' }}
        />

        {/* Shop Module Stack */}
        <Stack.Screen
          component={ProductDetailScreen}
          name={NAVIGATION.PRODUCT_DETAIL}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          component={WishlistScreen}
          name={NAVIGATION.WISHLIST}
          options={{ animation: 'slide_from_right' }}
        />

        {/* Health Records Stack */}
        <Stack.Screen
          component={RecordDetailScreen}
          name={NAVIGATION.RECORD_DETAIL}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
