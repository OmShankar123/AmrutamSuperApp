import React from 'react';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useLanguage } from '@/core/localization/useLanguage';
import { DoctorListScreen } from '@/features/consultation/screens/DoctorListScreen';
import { UpcomingConsultationsScreen } from '@/features/consultation/screens/UpcomingConsultationsScreen';
import { TimelineScreen } from '@/features/health-records/screens/TimelineScreen';
import { CartScreen } from '@/features/shop/screens/CartScreen';
import { ProductCatalogScreen } from '@/features/shop/screens/ProductCatalogScreen';
import { ms } from '@/shared/utils/scale';

import { NAVIGATION } from './constants';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator(): React.JSX.Element {
  const { theme, rt } = useUnistyles();
  const { t } = useLanguage();

  const bottomInset = Math.max(rt.insets.bottom, ms(8));
  const tabBarHeight = ms(52) + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.colors.tabBarBackground,
            borderTopColor: theme.colors.border,
            height: tabBarHeight,
            paddingBottom: bottomInset,
          },
        ],
        tabBarLabelStyle: {
          fontFamily: theme.fonts.semiBold,
          fontSize: ms(11),
        },
      }}
    >
      <Tab.Screen
        component={DoctorListScreen}
        name={NAVIGATION.DOCTOR_LIST}
        options={{
          tabBarLabel: t('navigation.tabDoctors', 'Doctors'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="medkit-outline" size={size || ms(22)} />
          ),
        }}
      />
      <Tab.Screen
        component={ProductCatalogScreen}
        name={NAVIGATION.PRODUCT_CATALOG}
        options={{
          tabBarLabel: t('navigation.tabShop', 'Shop'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="leaf-outline" size={size || ms(22)} />
          ),
        }}
      />
      <Tab.Screen
        component={TimelineScreen}
        name={NAVIGATION.TIMELINE}
        options={{
          tabBarLabel: t('navigation.tabRecords', 'Records'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="document-text-outline" size={size || ms(22)} />
          ),
        }}
      />
      <Tab.Screen
        component={UpcomingConsultationsScreen}
        name={NAVIGATION.UPCOMING_CONSULTATIONS}
        options={{
          tabBarLabel: t('navigation.tabAppointments', 'Appointments'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="calendar-outline" size={size || ms(22)} />
          ),
        }}
      />
      <Tab.Screen
        component={CartScreen}
        name={NAVIGATION.CART}
        options={{
          tabBarLabel: t('navigation.tabCart', 'Cart'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="bag-handle-outline" size={size || ms(22)} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create((theme) => ({
  tabBar: {
    borderTopWidth: 1,
    paddingTop: ms(6),
    boxShadow: theme.shadows.md,
  },
}));
