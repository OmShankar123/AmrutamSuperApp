import type { Doctor, Slot, Specialization } from '@/features/consultation/types';

class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

const FIRST_NAMES = [
  'Aarav',
  'Vihaan',
  'Aditya',
  'Sai',
  'Reyansh',
  'Arjun',
  'Vivaan',
  'Ayaan',
  'Krishna',
  'Ishaan',
  'Ananya',
  'Diya',
  'Saanvi',
  'Aadhya',
  'Kiara',
  'Myra',
  'Ira',
  'Pari',
  'Prisha',
  'Riya',
  'Devendra',
  'Gayatri',
  'Vaidya',
  'Harish',
  'Madhav',
  'Pooja',
  'Shrikant',
  'Meera',
  'Ramesh',
  'Sunita',
];

const LAST_NAMES = [
  'Sharma',
  'Verma',
  'Gupta',
  'Patel',
  'Joshi',
  'Bhatt',
  'Nair',
  'Iyer',
  'Menon',
  'Kulkarni',
  'Deshmukh',
  'Pillai',
  'Rao',
  'Reddy',
  'Mishra',
  'Pandey',
  'Tripathi',
  'Acharya',
  'Upadhyay',
  'Tiwari',
];

const SPECIALIZATIONS: Specialization[] = [
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
  'Mumbai',
  'Delhi',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Varanasi',
  'Rishikesh',
  'Haridwar',
  'Kochi',
  'Thiruvananthapuram',
  'Udupi',
];

const CLINIC_NAMES = [
  'Amrutam Wellness Clinic',
  'AyurVeda Healing Sansthan',
  'Charaka Healthcare',
  'Patanjali Chikitsalaya',
  'Sushruta Holistic Center',
  'Vaidya Ratnam Clinic',
  'Dhanwantari Healing Sanctuary',
  'Ojas Ayurvedic Center',
  'Prana Wellness Clinic',
];

const DOCTOR_AVATARS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
  'https://images.unsplash.com/photo-1594824813501-48af59f0f9b6?w=400',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400',
  'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=400',
];

export function generateDoctors(count = 5000): Doctor[] {
  const doctors: Doctor[] = [];
  for (let i = 1; i <= count; i++) {
    const rng = new SeededRandom(i * 7919);
    const firstName = FIRST_NAMES[Math.floor(rng.next() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rng.next() * LAST_NAMES.length)];
    const name = `Dr. ${firstName} ${lastName}`;
    const specialization = SPECIALIZATIONS[Math.floor(rng.next() * SPECIALIZATIONS.length)];
    const city = CITIES[Math.floor(rng.next() * CITIES.length)];
    const clinicName = CLINIC_NAMES[Math.floor(rng.next() * CLINIC_NAMES.length)];
    const experienceYears = Math.floor(rng.next() * 30) + 3;
    const rating = Number((3.8 + rng.next() * 1.2).toFixed(1));
    const reviewCount = Math.floor(rng.next() * 450) + 20;
    const consultationFee = Math.floor(rng.next() * 15 + 4) * 100;
    const isAvailableToday = rng.next() > 0.35;
    const avatarUrl = DOCTOR_AVATARS[i % DOCTOR_AVATARS.length];

    doctors.push({
      id: `doc_${i}`,
      name,
      title: `Senior ${specialization} Practitioner`,
      specialization,
      qualifications: ['BAMS', 'MD (Ayurveda)', 'Fellowship in Panchakarma'],
      experienceYears,
      rating,
      reviewCount,
      ratingCount: reviewCount,
      consultationFee,
      languages: ['English', 'Hindi', 'Sanskrit'],
      clinicName,
      city,
      bio: `Dr. ${firstName} ${lastName} is a renowned ${specialization} specialist with over ${experienceYears} years of classical clinical practice. Specialized in pulse diagnosis, dosha balancing, and custom herbal decoction regimens.`,
      avatarUrl,
      isAvailableToday,
    });
  }
  return doctors;
}

export function isTimeInPast(dateStr: string, timeStr: string): boolean {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;

  const [timePart, modifier] = timeStr.split(' ');
  const [hoursStr, minutesStr] = timePart.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const slotDate = new Date(now);
  slotDate.setHours(hours, minutes, 0, 0);

  return slotDate < now;
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

  return times.map((t, idx) => {
    const expired = isTimeInPast(dateStr, t.time);
    return {
      id: `slot_${doctorId}_${dateStr}_${idx}`,
      doctorId,
      date: dateStr,
      time: t.time,
      timeOfDay: t.timeOfDay,
      price: 1000,
      isBooked: expired || rng.next() > 0.7,
      isExpired: expired,
    };
  });
}
