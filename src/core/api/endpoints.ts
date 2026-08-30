export const API_ENDPOINTS = {
  // Consultations
  DOCTORS: '/doctors',
  DOCTOR_DETAIL: (id: string) => `/doctors/${id}`,
  DOCTOR_SLOTS: (doctorId: string) => `/doctors/${doctorId}/slots`,
  BOOK_CONSULTATION: '/consultations/book',
  CANCEL_CONSULTATION: (bookingId: string) => `/consultations/${bookingId}/cancel`,
  MY_BOOKINGS: '/consultations/my-bookings',

  // Shop
  PRODUCTS: '/products',
  PLACE_ORDER: '/orders',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,

  // Health Records
  HEALTH_RECORDS: '/health-records',
  HEALTH_RECORD_DETAIL: (id: string) => `/health-records/${id}`,
} as const;
