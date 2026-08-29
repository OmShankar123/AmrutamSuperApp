import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { HealthRecord } from '@/features/health-records/types';

export async function generateAndDownloadReportPdf(record: HealthRecord): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #2D3748;
            padding: 32px;
            margin: 0;
            background-color: #FFFFFF;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #1B4332;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .brand {
            font-size: 24px;
            font-weight: bold;
            color: #1B4332;
            letter-spacing: 1px;
          }
          .brand-sub {
            font-size: 11px;
            color: #718096;
            margin-top: 2px;
          }
          .badge {
            background-color: #E8F5E9;
            color: #1B4332;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #1B4332;
            border-bottom: 1px solid #E2E8F0;
            padding-bottom: 6px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .grid {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
          }
          .grid-item {
            flex: 1;
            min-width: 200px;
          }
          .label {
            font-size: 11px;
            color: #718096;
            margin-bottom: 2px;
          }
          .val {
            font-size: 13px;
            font-weight: 600;
            color: #1A202C;
          }
          .vitals-box {
            display: flex;
            gap: 12px;
            background-color: #F7FAFC;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #E2E8F0;
          }
          .vital-card {
            flex: 1;
            background-color: #FFFFFF;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #EDF2F7;
            text-align: center;
          }
          .vital-val {
            font-size: 15px;
            font-weight: bold;
            color: #1B4332;
          }
          .notes-box {
            background-color: #F7FAFC;
            padding: 12px;
            border-radius: 8px;
            font-size: 13px;
            line-height: 1.6;
            color: #2D3748;
            border-left: 4px solid #1B4332;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }
          th {
            background-color: #F7FAFC;
            color: #4A5568;
            font-size: 11px;
            text-align: left;
            padding: 8px 12px;
            border-bottom: 1px solid #CBD5E0;
          }
          td {
            padding: 8px 12px;
            font-size: 12px;
            border-bottom: 1px solid #E2E8F0;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px dashed #CBD5E0;
            padding-top: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #A0AEC0;
          }
          .stamp {
            border: 2px solid #1B4332;
            color: #1B4332;
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">🌿 AMRUTAM AYURVEDA</div>
            <div class="brand-sub">Clinical Telehealth & Holistic Healthcare Sansthan</div>
          </div>
          <div class="badge">${record.type.replace('_', ' ')}</div>
        </div>

        <div class="section">
          <div class="section-title">Clinical Record Summary</div>
          <div class="grid">
            <div class="grid-item">
              <div class="label">Report Title</div>
              <div class="val">${record.title}</div>
            </div>
            <div class="grid-item">
              <div class="label">Record ID</div>
              <div class="val">${record.id}</div>
            </div>
            <div class="grid-item">
              <div class="label">Consulting Practitioner</div>
              <div class="val">${record.doctorName}</div>
            </div>
            <div class="grid-item">
              <div class="label">Facility / Lab</div>
              <div class="val">${record.clinicOrLabName}</div>
            </div>
            <div class="grid-item">
              <div class="label">Date of Consultation</div>
              <div class="val">${record.formattedDate}</div>
            </div>
          </div>
        </div>

        ${
          record.vitals
            ? `
          <div class="section">
            <div class="section-title">Patient Vitals & Dosha Assessment</div>
            <div class="vitals-box">
              ${
                record.vitals.dosha
                  ? `
                <div class="vital-card">
                  <div class="label">Dosha Imbalance</div>
                  <div class="vital-val">${record.vitals.dosha}</div>
                </div>
              `
                  : ''
              }
              ${
                record.vitals.bp
                  ? `
                <div class="vital-card">
                  <div class="label">Blood Pressure</div>
                  <div class="vital-val">${record.vitals.bp}</div>
                </div>
              `
                  : ''
              }
              ${
                record.vitals.pulse
                  ? `
                <div class="vital-card">
                  <div class="label">Pulse (Nadi)</div>
                  <div class="vital-val">${record.vitals.pulse} bpm</div>
                </div>
              `
                  : ''
              }
              ${
                record.vitals.weight
                  ? `
                <div class="vital-card">
                  <div class="label">Weight</div>
                  <div class="vital-val">${record.vitals.weight} kg</div>
                </div>
              `
                  : ''
              }
            </div>
          </div>
        `
            : ''
        }

        <div class="section">
          <div class="section-title">Clinical Notes & Observations</div>
          <div class="notes-box">
            ${record.notes || record.summary}
          </div>
        </div>

        ${
          record.medications && record.medications.length > 0
            ? `
          <div class="section">
            <div class="section-title">Prescribed Ayurvedic Formulations</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Formulation Name</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                ${record.medications
                  .map(
                    (med, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${med.name}</strong></td>
                    <td>${med.dosage}</td>
                    <td>${med.frequency}</td>
                    <td>${med.duration}</td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `
            : ''
        }

        <div class="footer">
          <div>
            <div class="stamp">AYUSH MINISTRY VERIFIED</div>
            <div style="margin-top: 4px;">Digitally generated & authenticated via Amrutam Clinical Gateway</div>
          </div>
          <div>Generated on: ${new Date().toLocaleDateString()}</div>
        </div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html: htmlContent });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: `Download ${record.title} PDF`,
    });
  }
}
