import {
  CommonActions,
  createNavigationContainerRef,
  type NavigationState,
  type PartialState,
} from '@react-navigation/native';

import { NAVIGATION } from './constants';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const TAB_SCREENS: readonly string[] = [
  NAVIGATION.DOCTOR_LIST,
  NAVIGATION.PRODUCT_CATALOG,
  NAVIGATION.TIMELINE,
  NAVIGATION.UPCOMING_CONSULTATIONS,
  NAVIGATION.CART,
];

export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
): void {
  if (navigationRef.isReady()) {
    if (TAB_SCREENS.includes(name as string)) {
      navigationRef.navigate(NAVIGATION.MAIN_TABS as any, {
        screen: name,
        params,
      });
    } else {
      navigationRef.navigate(name as any, params as any);
    }
  }
}

export function goBack(): void {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function resetRoot(state: PartialState<NavigationState> | NavigationState): void {
  if (navigationRef.isReady()) {
    navigationRef.resetRoot(state);
  }
}

export function resetAndNavigate(routeName: keyof RootStackParamList): void {
  if (navigationRef.isReady()) {
    if (TAB_SCREENS.includes(routeName as string)) {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: NAVIGATION.MAIN_TABS,
              state: {
                routes: [{ name: routeName }],
              },
            },
          ],
        }),
      );
    } else {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: routeName }],
        }),
      );
    }
  }
}
