import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BookingConfirmationScreen } from '@/features/consultation/screens/BookingConfirmationScreen';
import { DoctorDetailScreen } from '@/features/consultation/screens/DoctorDetailScreen';
import { SlotBookingScreen } from '@/features/consultation/screens/SlotBookingScreen';
import { RecordDetailScreen } from '@/features/health-records/screens/RecordDetailScreen';
import { CartScreen } from '@/features/shop/screens/CartScreen';
import { ProductDetailScreen } from '@/features/shop/screens/ProductDetailScreen';
import { WishlistScreen } from '@/features/shop/screens/WishlistScreen';

import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen component={TabNavigator} name="Tabs" />
        <Stack.Screen component={DoctorDetailScreen} name="DoctorDetail" />
        <Stack.Screen
          component={SlotBookingScreen}
          name="SlotBooking"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          component={BookingConfirmationScreen}
          name="BookingConfirmation"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen component={ProductDetailScreen} name="ProductDetail" />
        <Stack.Screen component={CartScreen} name="Cart" />
        <Stack.Screen component={WishlistScreen} name="Wishlist" />
        <Stack.Screen component={RecordDetailScreen} name="RecordDetail" />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
