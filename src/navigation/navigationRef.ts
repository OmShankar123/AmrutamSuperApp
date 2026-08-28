import {
  CommonActions,
  createNavigationContainerRef,
  type NavigationState,
  type PartialState,
} from '@react-navigation/native';

import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
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
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName }],
      }),
    );
  }
}
