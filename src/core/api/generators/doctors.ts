import type { Doctor, Slot, Specialization } from '@/features/consultation/types';

import { SeededRandom } from './seed';

const SPECIALIZATIONS: readonly Specialization[] = [
  'Panchakarma',
  'Kayachikitsa',
  'Nadi Pariksha',
  'Shalya Tantra',
  'Dravyaguna',
  'Prasuti & Stri Roga',
  'Kaumarbhritya',
  'Ayurvedic Dietetics',
];

const CITIES = [
  'Varanasi',
  'Haridwar',
  'Rishikesh',
  'Kerala (Kottakkal)',
  'Udupi',
  'Pune',
  'Jaipur',
  'Bangalore',
  'Delhi NCR',
  'Mumbai',
  'Mysore',
  'Ahmedabad',
];

const FIRST_NAMES = [
  'Dr. Rajesh',
  'Dr. Priya',
  'Dr. Ananya',
  'Dr. Vikram',
  'Dr. Sunita',
  'Dr. Amit',
  'Dr. Deepa',
  'Dr. Suresh',
  'Dr. Meenakshi',
  'Dr. Arvind',
  'Dr. Kavita',
  'Dr. Manoj',
  'Dr. Shalini',
  'Dr. Harish',
  'Dr. Vandana',
  'Dr. Ramesh',
  'Dr. Neha',
  'Dr. Ashok',
  'Dr. Geeta',
  'Dr. Sanjay',
];

const LAST_NAMES = [
  'Sharma',
  'Nair',
  'Iyer',
  'Verma',
  'Patel',
  'Joshi',
  'Shukla',
  'Menon',
  'Bhattacharya',
  'Tripathi',
  'Gupta',
  'Pillai',
  'Kulkarni',
  'Pandey',
  'Acharya',
  'Deshmukh',
];

const CLINIC_NAMES = [
  'Amrutam Ayur Clinic',
  'Sanatan Veda Hospital',
  'Panchakarma Wellness Hub',
  'Nadi Healing Centre',
  'Sanjeevani Ayurvedic Kendra',
  'Charak Care Clinic',
  'Dhanwantari Healing Lounge',
  'Ayurshree Wellness Centre',
];

const ALL_LANGUAGES = ['Hindi', 'English', 'Sanskrit', 'Marathi', 'Malayalam', 'Gujarati', 'Tamil'];

const ALL_QUALIFICATIONS = [
  'BAMS',
  'MD (Ayurveda)',
  'PhD (Panchakarma)',
  'Gold Medalist BAMS',
  'MS (Shalya Tantra)',
  'Fellow in Pulse Diagnosis',
];

const VERIFIED_DOCTOR_IMAGES = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118',
  'https://images.unsplash.com/photo-1622902046580-2b47f47f5471',
];

export function generateDoctors(count = 5000): Doctor[] {
  const rng = new SeededRandom(42);
  const doctors: Doctor[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const firstName = rng.pick(FIRST_NAMES);
    const lastName = rng.pick(LAST_NAMES);
    const specialization = rng.pick(SPECIALIZATIONS);
    const city = rng.pick(CITIES);
    const clinic = rng.pick(CLINIC_NAMES);
    const experience = rng.nextInt(3, 35);
    const fee = rng.nextInt(4, 25) * 100;
    const rating = Number((4.2 + rng.next() * 0.79).toFixed(1));
    const reviewCount = rng.nextInt(12, 1850);
    const baseAvatar = VERIFIED_DOCTOR_IMAGES[i % VERIFIED_DOCTOR_IMAGES.length];

    doctors[i] = {
      id: `doc_${i + 1}`,
      name: `${firstName} ${lastName}`,
      title: `Senior Ayurvedic Consultant (${specialization})`,
      specialization,
      experienceYears: experience,
      consultationFee: fee,
      rating,
      reviewCount,
      languages: rng.pickMultiple(ALL_LANGUAGES, rng.nextInt(2, 4)),
      qualifications: rng.pickMultiple(ALL_QUALIFICATIONS, rng.nextInt(2, 3)),
      clinicName: clinic,
      city,
      bio: `Dedicated Ayurvedic practitioner specializing in holistic ${specialization} treatments with ${experience} years of clinical expertise.`,
      avatarUrl: `${baseAvatar}?w=300&auto=format&fit=crop&q=80`,
      isAvailableToday: rng.next() > 0.25,
      ratingCount: reviewCount,
    };
  }

  return doctors;
}

export function generateSlotsForDoctor(doctorId: string, dateStr: string): Slot[] {
  let hash = 0;
  const combined = `${doctorId}_${dateStr}`;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const rng = new SeededRandom(Math.abs(hash));

  const times = [
    { time: '09:00 AM', timeOfDay: 'Morning' as const },
    { time: '09:45 AM', timeOfDay: 'Morning' as const },
    { time: '10:30 AM', timeOfDay: 'Morning' as const },
    { time: '11:15 AM', timeOfDay: 'Morning' as const },
    { time: '02:00 PM', timeOfDay: 'Afternoon' as const },
    { time: '02:45 PM', timeOfDay: 'Afternoon' as const },
    { time: '03:30 PM', timeOfDay: 'Afternoon' as const },
    { time: '04:15 PM', timeOfDay: 'Afternoon' as const },
    { time: '05:30 PM', timeOfDay: 'Evening' as const },
    { time: '06:15 PM', timeOfDay: 'Evening' as const },
    { time: '07:00 PM', timeOfDay: 'Evening' as const },
    { time: '07:45 PM', timeOfDay: 'Evening' as const },
  ];

  return times.map((t, idx) => ({
    id: `slot_${doctorId}_${dateStr}_${idx}`,
    doctorId,
    date: dateStr,
    time: t.time,
    timeOfDay: t.timeOfDay,
    price: 1000,
    isBooked: rng.next() > 0.7,
  }));
}
