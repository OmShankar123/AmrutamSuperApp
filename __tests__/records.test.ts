import { generateHealthRecords } from '@/core/api/generators/records';

describe('Health Records Procedural Generator (10,000 records)', () => {
  test('generates exactly 10,000 records deterministically', () => {
    const records = generateHealthRecords(10000);
    expect(records.length).toBe(10000);
    expect(records[0].id).toBe('rec_100000');
    expect(records[9999].id).toBe('rec_109999');
  });

  test('each record contains valid clinical details and attachments', () => {
    const records = generateHealthRecords(100);
    records.forEach((record) => {
      expect(record.title).toBeTruthy();
      expect(record.doctorName).toBeTruthy();
      expect(record.clinicOrLabName).toBeTruthy();
      expect(record.monthYearGroup).toBeTruthy();
      expect(record.attachments.length).toBeGreaterThanOrEqual(1);
      expect(record.vitals?.dosha).toBeDefined();
    });
  });
});
