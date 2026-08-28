import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DoctorListScreen } from '@/features/consultation/screens/DoctorListScreen';
import { UpcomingConsultationsScreen } from '@/features/consultation/screens/UpcomingConsultationsScreen';

import type { ConsultationStackParamList } from '../types';

const Stack = createNativeStackNavigator<ConsultationStackParamList>();

export function ConsultationStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorList" component={DoctorListScreen} />
      <Stack.Screen name="UpcomingConsultations" component={UpcomingConsultationsScreen} />
    </Stack.Navigator>
  );
}
