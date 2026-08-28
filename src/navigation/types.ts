import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  DoctorDetail: { doctorId: string };
  SlotBooking: { doctorId: string };
  BookingConfirmation: { bookingId: string };
  ProductDetail: { productId: string };
  Cart: undefined;
  Wishlist: undefined;
  RecordDetail: { recordId: string };
};

export type TabParamList = {
  ConsultationTab: NavigatorScreenParams<ConsultationStackParamList>;
  ShopTab: NavigatorScreenParams<ShopStackParamList>;
  HealthRecordsTab: NavigatorScreenParams<HealthRecordsStackParamList>;
};

export type ConsultationStackParamList = {
  DoctorList: undefined;
  DoctorDetail: { doctorId: string };
  UpcomingConsultations: undefined;
};

export type ShopStackParamList = {
  ProductCatalog: undefined;
  Cart: undefined;
  Wishlist: undefined;
};

export type HealthRecordsStackParamList = {
  Timeline: undefined;
  RecordDetail: { recordId: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
