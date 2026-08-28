import React from 'react';
import { useUnistyles } from 'react-native-unistyles';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { TabBarIcon } from '@/shared/components/TabBarIcon';

import { ConsultationStack } from './stacks/ConsultationStack';
import { HealthRecordsStack } from './stacks/HealthRecordsStack';
import { ShopStack } from './stacks/ShopStack';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator(): React.JSX.Element {
  const { theme } = useUnistyles();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Tab.Screen
        component={ConsultationStack}
        name="ConsultationTab"
        options={{
          tabBarLabel: 'Consult',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon color={color} name="stethoscope" size={size} />
          ),
        }}
      />
      <Tab.Screen
        component={ShopStack}
        name="ShopTab"
        options={{
          tabBarLabel: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon color={color} name="shopping-bag" size={size} />
          ),
        }}
      />
      <Tab.Screen
        component={HealthRecordsStack}
        name="HealthRecordsTab"
        options={{
          tabBarLabel: 'Records',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon color={color} name="file-medical" size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
