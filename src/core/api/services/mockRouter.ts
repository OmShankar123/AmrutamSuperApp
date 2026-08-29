import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { API_ENDPOINTS } from '../endpoints';
import { db } from '../generators';

export function handleMockRoute(config: InternalAxiosRequestConfig): AxiosResponse | null {
  const rawUrl = (config.url ?? '').replace(/^\/shop/, '');
  const url = rawUrl.split('?')[0]; // strip query string if appended
  const method = (config.method ?? 'get').toLowerCase();
  const params = (config.params ?? {}) as Record<string, any>;

  const createResponse = (data: any, status = 200): AxiosResponse => ({
    data,
    status,
    statusText: status === 200 || status === 201 ? 'OK' : 'Error',
    headers: {},
    config,
  });

  // DOCTORS ROUTES
  if (url === API_ENDPOINTS.DOCTORS && method === 'get') {
    const res = db.queryDoctors({
      query: params.query,
      specialization: params.specialization,
      minExperience: params.minExperience ? Number(params.minExperience) : undefined,
      maxFee: params.maxFee ? Number(params.maxFee) : undefined,
      minRating: params.minRating ? Number(params.minRating) : undefined,
      availableToday: params.availableToday === 'true' || params.availableToday === true,
      page: params.page ? Number(params.page) : 1,
      limit: params.limit ? Number(params.limit) : 20,
      sortBy: params.sortBy,
    });
    return createResponse(res);
  }

  const doctorDetailMatch = url.match(/^\/doctors\/([^/]+)$/);
  if (doctorDetailMatch && method === 'get') {
    const doctorId = doctorDetailMatch[1];
    const doctor = db.getDoctorById(doctorId);
    if (!doctor) return createResponse({ message: 'Doctor not found' }, 404);
    return createResponse(doctor);
  }

  const doctorSlotsMatch = url.match(/^\/doctors\/([^/]+)\/slots$/);
  if (doctorSlotsMatch && method === 'get') {
    const doctorId = doctorSlotsMatch[1];
    const date = params.date ?? new Date().toISOString().split('T')[0];
    const slots = db.getDoctorSlots(doctorId, date);
    return createResponse(slots);
  }

  // CONSULTATIONS & BOOKING ROUTES
  if (url === API_ENDPOINTS.BOOK_CONSULTATION && method === 'post') {
    try {
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const booking = db.bookSlot(body);
      return createResponse(booking, 201);
    } catch (err: any) {
      const msg = err?.message || 'Failed to book slot';
      const isConflict = msg.includes('SLOT_CONFLICT') || msg.includes('DOUBLE_BOOKING');
      const isExpired = msg.includes('EXPIRED_SLOT');
      return createResponse(
        {
          message: msg,
          code: isConflict ? 'SLOT_CONFLICT' : isExpired ? 'EXPIRED_SLOT' : 'BOOKING_FAILED',
        },
        isConflict ? 409 : 400,
      );
    }
  }

  const cancelBookingMatch = url.match(/^\/consultations\/([^/]+)\/cancel$/);
  if (cancelBookingMatch && method === 'post') {
    const bookingId = cancelBookingMatch[1];
    const success = db.cancelBooking(bookingId);
    if (!success) return createResponse({ message: 'Booking not found' }, 404);
    return createResponse({ success: true, message: 'Booking cancelled successfully' });
  }

  if (url === API_ENDPOINTS.MY_BOOKINGS && method === 'get') {
    const bookings = db.getUserBookings();
    return createResponse(bookings);
  }

  // PRODUCTS ROUTES
  if (url === API_ENDPOINTS.PRODUCTS && method === 'get') {
    const res = db.queryProducts({
      query: params.query,
      category: params.category,
      healthConcern: params.healthConcern,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      minRating: params.minRating ? Number(params.minRating) : undefined,
      inStockOnly: params.inStockOnly === 'true' || params.inStockOnly === true,
      page: params.page ? Number(params.page) : 1,
      limit: params.limit ? Number(params.limit) : 20,
      sortBy: params.sortBy,
    });
    return createResponse(res);
  }

  const productDetailMatch = url.match(/^\/products\/([^/]+)$/);
  if (productDetailMatch && method === 'get') {
    const productId = productDetailMatch[1];
    const product = db.getProductById(productId);
    if (!product) return createResponse({ message: 'Product not found' }, 404);
    return createResponse(product);
  }

  // HEALTH RECORDS ROUTES
  if (url === API_ENDPOINTS.HEALTH_RECORDS && method === 'get') {
    const res = db.queryHealthRecords({
      query: params.query,
      type: params.type,
      tag: params.tag,
      page: params.page ? Number(params.page) : 1,
      limit: params.limit ? Number(params.limit) : 20,
    });
    return createResponse(res);
  }

  const recordDetailMatch = url.match(/^\/health-records\/([^/]+)$/);
  if (recordDetailMatch && method === 'get') {
    const recordId = recordDetailMatch[1];
    const record = db.getHealthRecordById(recordId);
    if (!record) return createResponse({ message: 'Record not found' }, 404);
    return createResponse(record);
  }

  return null;
}
