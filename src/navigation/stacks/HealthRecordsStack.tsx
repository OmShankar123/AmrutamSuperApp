import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { TimelineScreen } from '@/features/health-records/screens/TimelineScreen';

import type { HealthRecordsStackParamList } from '../types';

const Stack = createNativeStackNavigator<HealthRecordsStackParamList>();

export function HealthRecordsStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Timeline" component={TimelineScreen} />
    </Stack.Navigator>
  );
}
