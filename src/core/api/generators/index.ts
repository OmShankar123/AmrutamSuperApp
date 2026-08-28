import type { Booking, Doctor, DoctorFilterParams, Slot } from '@/features/consultation/types';
import type {
  HealthRecord,
  HealthRecordFilterParams,
  TimelineGroup,
} from '@/features/health-records/types';
import type { Product, ProductFilterParams } from '@/features/shop/types';

import type { PaginatedResponse } from '../client';
import { generateDoctors, generateSlotsForDoctor } from './doctors';
import { generateProducts } from './products';
import { generateHealthRecords } from './records';

class InMemoryDatabase {
  private doctors?: Doctor[];
  private products?: Product[];
  private records?: HealthRecord[];
  private bookings: Map<string, Booking> = new Map();
  private slotBookings: Set<string> = new Set();

  reset(): void {
    this.doctors = undefined;
    this.products = undefined;
    this.records = undefined;
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

    const bookingId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdBooking: Booking = {
      ...booking,
      id: bookingId,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    };

    this.slotBookings.add(booking.slotId);
    this.bookings.set(bookingId, createdBooking);
    return createdBooking;
  }

  cancelBooking(bookingId: string): boolean {
    const booking = this.bookings.get(bookingId);
    if (!booking) return false;

    booking.status = 'cancelled';
    this.slotBookings.delete(booking.slotId);
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
          r.facility.toLowerCase().includes(q) ||
          r.diagnosisOrNotes.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (params.type) {
      filtered = filtered.filter((r) => r.type === params.type);
    }

    if (params.tag) {
      filtered = filtered.filter((r) => r.tags.includes(params.tag!));
    }

    if (params.year) {
      filtered = filtered.filter((r) => new Date(r.date).getFullYear() === params.year);
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

  getGroupedHealthTimeline(params: HealthRecordFilterParams): TimelineGroup[] {
    const records = this.queryHealthRecords({ ...params, limit: 1000 }).data;
    const groupsMap = new Map<string, HealthRecord[]>();

    for (const record of records) {
      const d = new Date(record.date);
      const monthYearKey = `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
      if (!groupsMap.has(monthYearKey)) {
        groupsMap.set(monthYearKey, []);
      }
      groupsMap.get(monthYearKey)!.push(record);
    }

    const result: TimelineGroup[] = [];
    groupsMap.forEach((groupedRecords, monthYear) => {
      const d = new Date(groupedRecords[0].date);
      result.push({
        monthYear,
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        records: groupedRecords,
      });
    });

    return result;
  }

  getHealthRecordById(id: string): HealthRecord | undefined {
    return this.getHealthRecords().find((r) => r.id === id);
  }
}

export const db = new InMemoryDatabase();
