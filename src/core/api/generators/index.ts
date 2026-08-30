import { appStorage } from '@/core/storage';
import type { Booking, Doctor, DoctorFilterParams, Slot } from '@/features/consultation/types';
import type { HealthRecord, HealthRecordFilterParams } from '@/features/health-records/types';
import type { Product, ProductFilterParams } from '@/features/shop/types';

import type { PaginatedResponse } from '../client';
import { generateDoctors, generateSlotsForDoctor, isTimeInPast } from './doctors';
import { generateProducts } from './products';
import { generateHealthRecords } from './records';

const BOOKINGS_STORAGE_KEY = 'amrutam_persisted_bookings';
const SLOTS_STORAGE_KEY = 'amrutam_persisted_slots';

class InMemoryDatabase {
  private doctors?: Doctor[];
  private products?: Product[];
  private records?: HealthRecord[];
  private bookings: Map<string, Booking> = new Map();
  private slotBookings: Set<string> = new Set();

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage(): void {
    try {
      const rawBookings = appStorage.getString(BOOKINGS_STORAGE_KEY);
      if (rawBookings) {
        const parsed: Booking[] = JSON.parse(rawBookings);
        parsed.forEach((b) => this.bookings.set(b.id, b));
      }

      const rawSlots = appStorage.getString(SLOTS_STORAGE_KEY);
      if (rawSlots) {
        const parsedSlots: string[] = JSON.parse(rawSlots);
        parsedSlots.forEach((s) => this.slotBookings.add(s));
      }
    } catch (e) {
      console.warn('Failed to hydrate bookings from storage:', e);
    }
  }

  private saveToStorage(): void {
    try {
      const bookingsArray = Array.from(this.bookings.values());
      appStorage.set(BOOKINGS_STORAGE_KEY, JSON.stringify(bookingsArray));
      appStorage.set(SLOTS_STORAGE_KEY, JSON.stringify(Array.from(this.slotBookings)));
    } catch (e) {
      console.warn('Failed to save bookings to storage:', e);
    }
  }

  reset(): void {
    this.doctors = undefined;
    this.products = undefined;
    this.records = undefined;
    this.bookings.clear();
    this.slotBookings.clear();
    try {
      appStorage.remove(BOOKINGS_STORAGE_KEY);
      appStorage.remove(SLOTS_STORAGE_KEY);
    } catch {}
  }

  getDoctors(): Doctor[] {
    if (!this.doctors) {
      this.doctors = generateDoctors(5000);
    }
    return this.doctors;
  }

  getProducts(): Product[] {
    if (!this.products) {
      this.products = generateProducts(20000);
    }
    return this.products;
  }

  getHealthRecords(): HealthRecord[] {
    if (!this.records) {
      this.records = generateHealthRecords(10000);
    }
    return this.records;
  }

  queryDoctors(params: DoctorFilterParams): PaginatedResponse<Doctor> {
    const all = this.getDoctors();
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, Math.min(params.limit ?? 50, 100));

    let filtered = all;

    if (params.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.clinicName.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q),
      );
    }

    if (params.specialization) {
      filtered = filtered.filter((d) => d.specialization === params.specialization);
    }

    if (params.minExperience !== undefined) {
      filtered = filtered.filter((d) => d.experienceYears >= (params.minExperience ?? 0));
    }

    if (params.maxFee !== undefined) {
      filtered = filtered.filter((d) => d.consultationFee <= (params.maxFee ?? Infinity));
    }

    if (params.minRating !== undefined) {
      filtered = filtered.filter((d) => d.rating >= (params.minRating ?? 0));
    }

    if (params.availableToday) {
      filtered = filtered.filter((d) => d.isAvailableToday);
    }

    if (params.sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (params.sortBy) {
          case 'rating':
            return b.rating - a.rating || a.id.localeCompare(b.id);
          case 'experience':
            return b.experienceYears - a.experienceYears || a.id.localeCompare(b.id);
          case 'fee_asc':
            return a.consultationFee - b.consultationFee || a.id.localeCompare(b.id);
          case 'fee_desc':
            return b.consultationFee - a.consultationFee || a.id.localeCompare(b.id);
          default:
            return a.id.localeCompare(b.id);
        }
      });
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const data = filtered.slice(startIndex, startIndex + limit);

    return {
      data,
      total,
      page,
      limit,
      hasMore: startIndex + limit < total,
    };
  }

  getDoctorById(id: string): Doctor | undefined {
    return this.getDoctors().find((d) => d.id === id);
  }

  getDoctorSlots(doctorId: string, dateStr: string): Slot[] {
    const slots = generateSlotsForDoctor(doctorId, dateStr);
    return slots.map((s) => ({
      ...s,
      isBooked: s.isBooked || this.slotBookings.has(s.id),
    }));
  }

  bookSlot(booking: Omit<Booking, 'id' | 'bookedAt' | 'status'>): Booking {
    if (this.slotBookings.has(booking.slotId)) {
      throw new Error('SLOT_CONFLICT: This slot has already been booked by another user.');
    }

    if (isTimeInPast(booking.date, booking.time)) {
      throw new Error('EXPIRED_SLOT: This appointment time slot has already expired.');
    }

    // Handle Double Booking / Patient Schedule Overlap across different doctors
    const existingPatientBooking = Array.from(this.bookings.values()).find(
      (b) => b.date === booking.date && b.time === booking.time && b.status === 'confirmed',
    );
    if (existingPatientBooking) {
      throw new Error(
        `DOUBLE_BOOKING: You already have a confirmed consultation with Dr. ${existingPatientBooking.doctorName} on ${booking.date} at ${booking.time}.`,
      );
    }

    const bookingId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdBooking: Booking = {
      ...booking,
      id: bookingId,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    };

    this.slotBookings.add(booking.slotId);
    this.bookings.set(bookingId, createdBooking);
    this.saveToStorage();

    // Cross-Module Integration: Auto-inject confirmed consultation record into patient timeline
    const now = new Date();
    const newRecord: HealthRecord = {
      id: `rec_${Date.now()}`,
      patientId: 'patient_default',
      type: 'consultation',
      title: `Ayurvedic Consultation - ${booking.doctorName}`,
      doctorName: booking.doctorName,
      clinicOrLabName: `${booking.specialization} Clinical Wing`,
      date: now.toISOString(),
      formattedDate: now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      monthYearGroup: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,
      summary: `Confirmed clinical consultation for: ${booking.symptoms}`,
      notes: `Consultation confirmed for patient ${booking.patientName} (Age: ${booking.patientAge}). Reported chief symptoms: ${booking.symptoms}. Scheduled slot: ${booking.date} at ${booking.time}. Consultation Fee: ₹${booking.consultationFee}.`,
      vitals: {
        dosha: 'Vata-Pitta',
        bp: '120/80',
        pulse: 74,
        weight: 68,
      },
      attachments: [
        {
          id: `att_${Date.now()}_rec`,
          name: `Consultation_Receipt_${booking.doctorId}.pdf`,
          type: 'pdf',
          url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800',
          size: '1.2 MB',
        },
      ],
      tags: ['consultation', booking.specialization.toLowerCase(), 'confirmed', 'amrutam'],
    };

    this.getHealthRecords().unshift(newRecord);

    return createdBooking;
  }

  cancelBooking(bookingId: string): boolean {
    const booking = this.bookings.get(bookingId);
    if (!booking) return false;

    booking.status = 'cancelled';
    this.slotBookings.delete(booking.slotId);
    this.saveToStorage();
    return true;
  }

  getUserBookings(): Booking[] {
    return Array.from(this.bookings.values()).sort(
      (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime(),
    );
  }

  queryProducts(params: ProductFilterParams): PaginatedResponse<Product> {
    const all = this.getProducts();
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, Math.min(params.limit ?? 50, 100));

    let filtered = all;

    if (params.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.healthConcerns.some((c) => c.toLowerCase().includes(q)),
      );
    }

    if (params.category) {
      filtered = filtered.filter((p) => p.category === params.category);
    }

    if (params.healthConcern) {
      filtered = filtered.filter((p) => p.healthConcerns.includes(params.healthConcern!));
    }

    if (params.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= (params.minPrice ?? 0));
    }

    if (params.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= (params.maxPrice ?? Infinity));
    }

    if (params.minRating !== undefined) {
      filtered = filtered.filter((p) => p.rating >= (params.minRating ?? 0));
    }

    if (params.inStockOnly) {
      filtered = filtered.filter((p) => p.inStock);
    }

    if (params.sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (params.sortBy) {
          case 'popularity':
            return b.reviewCount - a.reviewCount || a.id.localeCompare(b.id);
          case 'price_asc':
            return a.price - b.price || a.id.localeCompare(b.id);
          case 'price_desc':
            return b.price - a.price || a.id.localeCompare(b.id);
          case 'rating':
            return b.rating - a.rating || a.id.localeCompare(b.id);
          case 'discount':
            return b.discountPercentage - a.discountPercentage || a.id.localeCompare(b.id);
          default:
            return a.id.localeCompare(b.id);
        }
      });
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const data = filtered.slice(startIndex, startIndex + limit);

    return {
      data,
      total,
      page,
      limit,
      hasMore: startIndex + limit < total,
    };
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  queryHealthRecords(params: HealthRecordFilterParams): PaginatedResponse<HealthRecord> {
    const all = this.getHealthRecords();
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, Math.min(params.limit ?? 50, 100));

    let filtered = all;

    if (params.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.doctorName.toLowerCase().includes(q) ||
          r.clinicOrLabName.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.notes.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (params.type) {
      filtered = filtered.filter((r) => r.type === params.type);
    }

    if (params.tag) {
      filtered = filtered.filter((r) => r.tags.includes(params.tag!));
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const data = filtered.slice(startIndex, startIndex + limit);

    return {
      data,
      total,
      page,
      limit,
      hasMore: startIndex + limit < total,
    };
  }

  getHealthRecordById(id: string): HealthRecord | undefined {
    return this.getHealthRecords().find((r) => r.id === id);
  }
}

export const db = new InMemoryDatabase();
