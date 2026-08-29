import { db } from '@/core/api/generators';

describe('Doctor Consultation & Slot Conflict Engine', () => {
  beforeEach(() => {
    db.reset();
  });

  test('generates doctor catalog and verifies query filtering', () => {
    const res = db.queryDoctors({ page: 1, limit: 10 });
    expect(res.data.length).toBe(10);
    expect(res.total).toBeGreaterThanOrEqual(5000);
    expect(res.hasMore).toBe(true);
  });

  test('filters doctors by specialization', () => {
    const res = db.queryDoctors({ specialization: 'Panchakarma', limit: 20 });
    expect(res.data.length).toBeGreaterThan(0);
    res.data.forEach((doc) => {
      expect(doc.specialization).toBe('Panchakarma');
    });
  });

  test('successfully books an available time slot and injects record into health timeline', () => {
    const doctor = db.getDoctors()[0];
    const slots = db.getDoctorSlots(doctor.id, '2026-12-15');
    const availableSlot = slots.find((s) => !s.isBooked && !s.isExpired);
    expect(availableSlot).toBeDefined();

    const booking = db.bookSlot({
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      slotId: availableSlot!.id,
      date: availableSlot!.date,
      time: availableSlot!.time,
      patientName: 'Test Patient',
      patientPhone: '+91 99999 88888',
      patientAge: 30,
      symptoms: 'Mild fatigue and stress',
      consultationFee: doctor.consultationFee,
    });

    expect(booking.id).toBeDefined();
    expect(booking.status).toBe('confirmed');

    // Verify cross-module timeline integration
    const latestTimelineRecord = db.getHealthRecords()[0];
    expect(latestTimelineRecord.type).toBe('consultation');
    expect(latestTimelineRecord.doctorName).toBe(doctor.name);
    expect(latestTimelineRecord.attachments.length).toBeGreaterThanOrEqual(1);
  });

  test('throws SLOT_CONFLICT error when booking the same slot twice', () => {
    const doctor = db.getDoctors()[0];
    const slots = db.getDoctorSlots(doctor.id, '2026-12-15');
    const availableSlot = slots.find((s) => !s.isBooked && !s.isExpired);

    db.bookSlot({
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      slotId: availableSlot!.id,
      date: availableSlot!.date,
      time: availableSlot!.time,
      patientName: 'First Patient',
      patientPhone: '+91 99999 11111',
      patientAge: 28,
      symptoms: 'Headache',
      consultationFee: doctor.consultationFee,
    });

    expect(() => {
      db.bookSlot({
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        slotId: availableSlot!.id,
        date: availableSlot!.date,
        time: availableSlot!.time,
        patientName: 'Second Patient',
        patientPhone: '+91 99999 22222',
        patientAge: 35,
        symptoms: 'Fever',
        consultationFee: doctor.consultationFee,
      });
    }).toThrow('SLOT_CONFLICT');
  });

  test('throws EXPIRED_SLOT error when attempting to book a past slot', () => {
    const doctor = db.getDoctors()[0];

    expect(() => {
      db.bookSlot({
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        slotId: `slot_past_${Date.now()}`,
        date: '2020-01-01',
        time: '09:00 AM',
        patientName: 'Late Patient',
        patientPhone: '+91 99999 33333',
        patientAge: 40,
        symptoms: 'Back pain',
        consultationFee: doctor.consultationFee,
      });
    }).toThrow('EXPIRED_SLOT');
  });
});
