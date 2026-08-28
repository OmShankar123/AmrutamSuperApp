export const NAVIGATION = {
  // Tabs Root
  MAIN_TABS: 'MainTabs',

  // Module 1: Consultations
  DOCTOR_LIST: 'DoctorList',
  DOCTOR_DETAIL: 'DoctorDetail',
  SLOT_BOOKING: 'SlotBooking',
  BOOKING_CONFIRMATION: 'BookingConfirmation',
  UPCOMING_CONSULTATIONS: 'UpcomingConsultations',

  // Module 2: Ayurvedic Shop
  PRODUCT_CATALOG: 'ProductCatalog',
  PRODUCT_DETAIL: 'ProductDetail',
  CART: 'Cart',
  WISHLIST: 'Wishlist',

  // Module 3: Health Records
  TIMELINE: 'Timeline',
  RECORD_DETAIL: 'RecordDetail',

  // Developer & Diagnostics
  DEV_PANEL: 'DevPanel',
} as const;

export type NavigationRoute = (typeof NAVIGATION)[keyof typeof NAVIGATION];
