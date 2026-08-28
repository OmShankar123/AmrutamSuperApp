import type {
  Dosha,
  HealthRecord,
  RecordAttachment,
  RecordType,
} from '@/features/health-records/types';

const RECORD_TYPES: RecordType[] = [
  'lab_report',
  'prescription',
  'consultation',
  'vaccination',
  'allergy',
];

const CLINICAL_TITLES: Record<RecordType, string[]> = {
  lab_report: [
    'Prakriti & Dosha Biochemical Profile',
    'Comprehensive Lipid & Triglycerides Panel',
    'HbA1c & Fasting Blood Sugar Evaluation',
    'Liver Function & Detoxification Index',
    'Thyroid Stimulating Hormone (TSH) Assay',
    'Renal Function & Electrolyte Assessment',
    'Complete Blood Count (CBC) with ESR',
    'Ayurvedic Srotas & Ama Toxicity Screen',
  ],
  prescription: [
    'Pitta Shaman & Digestive Herbal Prescription',
    'Vata Calming & Joint Vitality Formulations',
    'Rasayana Rejuvenation & Immunity Blend',
    'Respiratory Relief & Shwas Kuthar Rasa',
    'Deep Rest & Brahmi Neuro-Calm Regimen',
    'Skin Radiance & Manjistha Detox Protocol',
    'Keshya Hair Growth & Bhringraj Therapy',
    'Cardiovascular Strength & Arjuna Ksheerapaka',
  ],
  consultation: [
    'Nadi Pariksha Pulse & Dosha Diagnostic Assessment',
    'Digestive Agni & Metabolic Health Consultation',
    'Chronic Joint Stiffness & Amavata Review',
    'Panchakarma Detox Pre-Procedure Evaluation',
    'Stress & Sleep Quality Wellness Follow-up',
    'Seasonal Ritucharya Lifestyle & Diet Plan',
    'Post-Panchakarma Rejuvenation Assessment',
    'Holistic Immunity & Vital Ojas Evaluation',
  ],
  vaccination: [
    'Seasonal Influenza Immunization',
    'Tetanus Toxoid Booster Injection',
    'Hepatitis B Preventive Immunization',
    'Pneumococcal Vaccine Dose',
    'Typhoid Preventive Immunization',
  ],
  allergy: [
    'Dietary Gluten & Dairy Sensitivity Panel',
    'Seasonal Pollen & Dust Mite Hypersensitivity',
    'Herb & Botanical Extract Allergy Screening',
    'Contact Dermatitis & Fragrance Skin Test',
  ],
};

const DOCTOR_NAMES = [
  'Dr. Rajeshwar Sharma, BAMS, MD',
  'Dr. Neha Tripathi, PhD (Ayur)',
  'Dr. Vikramaditya Joshi, BAMS',
  'Dr. Priya Namboodiri, MD (Kayachikitsa)',
  'Dr. Arvind Shastry, BAMS',
  'Dr. Ananya Deshmukh, MS (Shalya)',
  'Dr. Meenakshi Sundaram, BAMS',
  'Dr. Harshvardhan Dave, PhD',
];

const LAB_NAMES = [
  'Amrutam Central Ayurvedic Diagnostics, Delhi',
  'Patanjali Clinical Pathology Lab, Haridwar',
  'Charaka Institute of Diagnostics, Bengaluru',
  'Vaidyaratnam Diagnostic Centre, Kerala',
  'Kottakkal Clinical Testing Services, Mumbai',
  'National Institute of Ayurveda Lab, Jaipur',
];

const DOSHAS: Dosha[] = ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Tridoshic'];

const ATTACHMENT_PREVIEWS = [
  {
    name: 'Diagnostic_Report_Scan.jpg',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    size: '1.4 MB',
  },
  {
    name: 'Clinical_Prescription_Card.jpg',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    size: '850 KB',
  },
  {
    name: 'Official_Medical_Record.pdf',
    type: 'pdf' as const,
    url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80',
    size: '2.8 MB',
  },
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function generateHealthRecords(count = 10000): HealthRecord[] {
  const records: HealthRecord[] = [];
  const baseTimestamp = new Date('2026-08-28T12:00:00Z').getTime();

  for (let i = 0; i < count; i++) {
    // Generate records distributed over the last 6 years (step ~5 hours per record)
    const recordTime = new Date(baseTimestamp - i * (5.5 * 3600 * 1000));
    const year = recordTime.getFullYear();
    const month = MONTH_NAMES[recordTime.getMonth()];
    const day = String(recordTime.getDate()).padStart(2, '0');
    const monthYearGroup = `${month} ${year}`;
    const formattedDate = `${day} ${month.slice(0, 3)} ${year}`;

    const type = RECORD_TYPES[i % RECORD_TYPES.length];
    const titles = CLINICAL_TITLES[type];
    const title = titles[i % titles.length];
    const doctorName = DOCTOR_NAMES[i % DOCTOR_NAMES.length];
    const clinicOrLabName = LAB_NAMES[i % LAB_NAMES.length];
    const dosha = DOSHAS[i % DOSHAS.length];

    const attachmentCount = (i % 3) + 1;
    const attachments: RecordAttachment[] = [];
    for (let a = 0; a < attachmentCount; a++) {
      const template = ATTACHMENT_PREVIEWS[(i + a) % ATTACHMENT_PREVIEWS.length];
      attachments.push({
        id: `att_${i}_${a}`,
        name: `${title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)}_${a + 1}.${template.type === 'pdf' ? 'pdf' : 'jpg'}`,
        type: template.type,
        url: template.url,
        size: template.size,
      });
    }

    records.push({
      id: `rec_${100000 + i}`,
      patientId: 'pat_current_user',
      type,
      title,
      doctorName,
      clinicOrLabName,
      date: recordTime.toISOString(),
      formattedDate,
      monthYearGroup,
      summary: `Clinical assessment for ${type.replace('_', ' ')} with ${doctorName}. Evaluated dosha balance and documented therapeutic recommendations.`,
      notes: `Patient presented with mild ${dosha} aggravation. Pulse (Nadi) examination revealed rhythmic Kapha-Pitta predominance. Recommended tailored herbal formulations and scheduled follow-up review.`,
      tags: [type.replace('_', ' '), dosha, `${year}`],
      vitals: {
        bp: `${115 + (i % 15)}/${75 + (i % 10)} mmHg`,
        pulse: 68 + (i % 16),
        weight: 65 + (i % 15),
        dosha,
        temperature: '98.4 °F',
      },
      medications:
        type === 'prescription' || type === 'consultation'
          ? [
              {
                name: 'Amrutam Kuntal Care Hair Oil',
                dosage: '5-10 ml',
                frequency: 'Twice weekly before sleep',
                duration: '60 days',
              },
              {
                name: 'Amrutam Chyawanprash Gold Blend',
                dosage: '1 teaspoon (10g)',
                frequency: 'Once daily with warm milk',
                duration: '90 days',
              },
              {
                name: 'Brahmi Vati & Ashwagandha Churna',
                dosage: '250 mg',
                frequency: 'After dinner',
                duration: '30 days',
              },
            ]
          : undefined,
      attachments,
    });
  }

  return records;
}
