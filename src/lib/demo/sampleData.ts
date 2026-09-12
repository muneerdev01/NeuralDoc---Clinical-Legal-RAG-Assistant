import { DocumentMetadata, DocumentChunk, Collection } from '../../types';

export const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-clinical-cardio',
    name: 'Cardiology Discharge Summaries',
    description: 'Post-operative clinical records, medication regimens, and patient discharge instructions.',
    documentCount: 1,
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'col-legal-contracts',
    name: 'Executive & Employment Agreements',
    description: 'Master service agreements, compensation structures, non-competes, and termination liability.',
    documentCount: 1,
    createdAt: '2026-09-02T14:30:00Z',
  },
];

export const SAMPLE_CLINICAL_CHUNKS: DocumentChunk[] = [
  {
    id: 'chunk-clin-1',
    documentId: 'doc-clinical-001',
    documentTitle: 'Sample Clinical Discharge Summary (Coronary Angioplasty)',
    category: 'clinical',
    pageNumber: 1,
    chunkIndex: 0,
    section: 'Demographics & Procedure Summary',
    content: `PATIENT DISCHARGE SUMMARY — METROPOLITAN CARDIOLOGY INSTITUTE
Patient: Doe, John | MRN: 9482-1102 | DOB: 1962-04-15 (Age 64M)
Admit Date: Sep 02, 2026 | Discharge Date: Sep 05, 2026
Attending Physician: Dr. Marcus Vance, MD, FACC

PRIMARY ADMISSION DIAGNOSIS:
Acute Coronary Syndrome (NSTEMI) with unstable angina and exertional dyspnea.

PROCEDURE PERFORMED (Sep 03, 2026):
Coronary Angiography and Percutaneous Coronary Intervention (PCI). Single drug-eluting stent (Xience Sierra 3.5 x 18 mm) successfully deployed to the proximal-mid Left Anterior Descending (LAD) coronary artery under fluoroscopic and intravascular ultrasound (IVUS) guidance. Post-dilation with non-compliant balloon achieved 0% residual stenosis and TIMI 3 distal flow. Right femoral access site closed with Angio-Seal vascular closure device. Hemostasis confirmed.`,
    tokenCount: 154,
    createdAt: '2026-09-05T12:00:00Z',
  },
  {
    id: 'chunk-clin-2',
    documentId: 'doc-clinical-001',
    documentTitle: 'Sample Clinical Discharge Summary (Coronary Angioplasty)',
    category: 'clinical',
    pageNumber: 2,
    chunkIndex: 1,
    section: 'Hospital Course & Laboratory Values',
    content: `HOSPITAL COURSE & POST-PROCEDURE MONITORING:
Patient was admitted to the Cardiac Care Unit (CCU) post-stenting. Continuous telemetry monitoring demonstrated normal sinus rhythm without ventricular ectopy or recurrent ST-segment shifts. Hemodynamics remained stable: BP 118/74 mmHg, Heart Rate 66 bpm, SpO2 98% on room air. 

LABORATORY & DIAGNOSTIC VALUES:
Peak Cardiac Troponin I: 0.42 ng/mL (down-trending to 0.08 ng/mL at discharge).
Serum Creatinine: 1.0 mg/dL (Baseline normal; hydration protocol completed without contrast-induced nephropathy).
Hemoglobin: 12.8 g/dL, Hematocrit: 38.4%, Platelets: 245,000/mcL.
Transthoracic Echocardiogram (TTE): Left ventricular ejection fraction (LVEF) 52% with mild hypokinesis of the anterior wall. Normal valvular function, no pericardial effusion.`,
    tokenCount: 148,
    createdAt: '2026-09-05T12:00:00Z',
  },
  {
    id: 'chunk-clin-3',
    documentId: 'doc-clinical-001',
    documentTitle: 'Sample Clinical Discharge Summary (Coronary Angioplasty)',
    category: 'clinical',
    pageNumber: 3,
    chunkIndex: 2,
    section: 'Discharge Medications & Allergies',
    content: `ALLERGIES:
1. Penicillin (Manifestation: Urticarial rash; anaphylaxis ruled out).

DISCHARGE MEDICATIONS (STRICT COMPLIANCE REQUIRED):
1. Aspirin 81 mg oral tablet, Once daily with food (Indefinite continuation).
2. Ticagrelor (Brilinta) 90 mg oral tablet, Twice daily (12 months mandatory dual antiplatelet therapy for drug-eluting stent protection; DO NOT DISCONTINUE without consulting cardiology).
3. Atorvastatin (Lipitor) 80 mg oral tablet, Once daily at bedtime (High-intensity lipid-lowering therapy; target LDL < 55 mg/dL).
4. Metoprolol Succinate Extended-Release 50 mg oral tablet, Once daily (Target resting heart rate 60-70 bpm).
5. Lisinopril 5 mg oral tablet, Once daily (Monitor blood pressure and renal function).
6. Sublingual Nitroglycerin 0.4 mg PRN chest pain (Take 1 tablet under tongue every 5 minutes up to 3 doses; call 911 if pain unresolved).`,
    tokenCount: 182,
    createdAt: '2026-09-05T12:00:00Z',
  },
  {
    id: 'chunk-clin-4',
    documentId: 'doc-clinical-001',
    documentTitle: 'Sample Clinical Discharge Summary (Coronary Angioplasty)',
    category: 'clinical',
    pageNumber: 4,
    chunkIndex: 3,
    section: 'Discharge Instructions & Warning Signs',
    content: `PATIENT DISCHARGE INSTRUCTIONS & ACTIVITY LIMITATIONS:
1. Physical Activity: Rest at home for 48 hours. No vigorous exercise, running, or stair climbing for 7 days.
2. Lifting Restriction: Strictly avoid lifting, pushing, or pulling any object heavier than 10 pounds (4.5 kg) for 7 days to protect the femoral puncture site.
3. Driving: Do not drive for 48 hours post-sedation or while taking narcotic analgesics.
4. Femoral Wound Care: Keep right groin dressing clean and dry. Showering permitted after 24 hours (pat dry gently); do not submerge in bathtub, swimming pool, or hot tub for 10 days.

RED FLAG EMERGENCY WARNING SIGNS (SEEK IMMEDIATE MEDICAL CARE):
- Bleeding, swelling, or enlarging lump/hematoma at the right groin puncture site.
- Recurrent chest pressure, tightness, pain radiating to left jaw or arm, shortness of breath, or cold sweats.
- Cold, pale, or painful right leg or foot.
- Sudden dizziness, syncope, or persistent fever > 100.4°F (38°C).

FOLLOW-UP APPOINTMENTS:
- Outpatient Cardiology clinic with Dr. Marcus Vance in 14 days (Sep 19, 2026).
- Cardiac Rehabilitation intake evaluation scheduled for Oct 02, 2026.`,
    tokenCount: 220,
    createdAt: '2026-09-05T12:00:00Z',
  },
];

export const SAMPLE_LEGAL_CHUNKS: DocumentChunk[] = [
  {
    id: 'chunk-leg-1',
    documentId: 'doc-legal-001',
    documentTitle: 'Sample Executive Employment & IP Agreement (Apex BioTech)',
    category: 'legal',
    pageNumber: 1,
    chunkIndex: 0,
    section: 'Parties, Recitals & Term',
    content: `EXECUTIVE EMPLOYMENT & INTELLECTUAL PROPERTY AGREEMENT
This Executive Employment Agreement (the "Agreement") is entered into as of September 15, 2026, by and between:
1. APEX BIOTECH CORP., a Delaware corporation having its principal office at 500 Discovery Way, Suite 400, Cambridge, MA ("Company"), and
2. DR. ELENA ROSTOVA, MD, PhD, residing at 42 Highland Terrace, Boston, MA ("Executive").

RECITALS:
The Company desires to employ Executive as its Chief Medical Officer (CMO), and Executive agrees to serve the Company in such capacity, subject to the terms and conditions set forth herein.

SECTION 1: TERM OF EMPLOYMENT
The term of this Agreement shall commence on October 01, 2026 (the "Effective Date") and shall continue for an initial period of twenty-four (24) months, unless terminated earlier pursuant to Section 7 hereof. The Agreement shall automatically renew for successive twelve (12) month terms unless either party provides written notice of non-renewal at least sixty (60) days prior to the expiration of the then-current term.`,
    tokenCount: 185,
    createdAt: '2026-09-15T09:00:00Z',
  },
  {
    id: 'chunk-leg-2',
    documentId: 'doc-legal-001',
    documentTitle: 'Sample Executive Employment & IP Agreement (Apex BioTech)',
    category: 'legal',
    pageNumber: 2,
    chunkIndex: 1,
    section: 'Intellectual Property & Work for Hire',
    content: `SECTION 4: INTELLECTUAL PROPERTY ASSIGNMENT & PROPRIETARY RIGHTS
4.1 Inventions and Discoveries: Executive agrees that all proprietary biological assays, pharmaceutical formulations, algorithms, clinical trial protocols, research methodologies, trade secrets, and patentable inventions conceived or developed solely or jointly during Executive's employment (collectively, "Company Inventions") shall be the sole and exclusive property of the Company.
4.2 Work Made for Hire: Executive acknowledges that all original works of authorship created within the scope of employment are "works made for hire" under the United States Copyright Act (17 U.S.C. § 101).
4.3 Power of Attorney: Executive irrevocably designates and appoints the Company and its duly authorized officers as Executive's agent and attorney-in-fact to execute, file, and prosecute any patent or copyright applications in Executive's name.
4.4 Prior Inventions: Attached as Exhibit B is a complete list of all prior inventions owned by Executive prior to the Effective Date, which are excluded from the scope of this Agreement.`,
    tokenCount: 178,
    createdAt: '2026-09-15T09:00:00Z',
  },
  {
    id: 'chunk-leg-3',
    documentId: 'doc-legal-001',
    documentTitle: 'Sample Executive Employment & IP Agreement (Apex BioTech)',
    category: 'legal',
    pageNumber: 3,
    chunkIndex: 2,
    section: 'Compensation & Benefits',
    content: `SECTION 5: COMPENSATION, BONUS & EQUITY
5.1 Base Salary: The Company shall pay Executive an annualized base salary of $385,000 USD, payable in bi-weekly installments in accordance with standard payroll practices.
5.2 Annual Performance Bonus: Executive shall be eligible to receive an annual target bonus of up to 35% of Base Salary, determined based on milestone achievements established by the Board of Directors, including FDA Phase II trial progression.
5.3 Equity Incentive: Subject to Board approval, Executive shall be granted stock options to purchase 250,000 shares of Company Common Stock, vesting over a four-year period with a one-year cliff (25% vesting after 12 months, remaining vesting monthly over 36 months).
5.4 Healthcare and Benefits: Executive shall receive comprehensive medical, dental, and vision insurance coverage, with 100% of premiums paid by the Company for Executive and dependents.`,
    tokenCount: 165,
    createdAt: '2026-09-15T09:00:00Z',
  },
  {
    id: 'chunk-leg-4',
    documentId: 'doc-legal-001',
    documentTitle: 'Sample Executive Employment & IP Agreement (Apex BioTech)',
    category: 'legal',
    pageNumber: 4,
    chunkIndex: 3,
    section: 'Termination Conditions & Severance',
    content: `SECTION 7: TERMINATION OF EMPLOYMENT & CONDITIONS
7.1 Termination for Cause: The Company may terminate Executive's employment immediately without notice for "Cause", defined as: (a) willful felony conviction or plea of nolo contendere; (b) gross negligence or willful misconduct causing material harm to the Company; (c) material breach of Section 4 or Section 8 (Confidentiality/Non-Compete); or (d) fraud or embezzlement. In the event of Termination for Cause, Executive shall receive only accrued unpaid base salary through the termination date.
7.2 Termination Without Cause: The Company may terminate Executive's employment without Cause upon sixty (60) days prior written notice. In such event, subject to execution of a binding release of claims, Executive shall receive: (i) twelve (12) months of Base Salary paid as severance; (ii) pro-rata target bonus for the year; and (iii) twelve (12) months of continued COBRA healthcare premium payments.
7.3 Voluntary Resignation: Executive may resign at any time upon sixty (60) days written notice to the Company.`,
    tokenCount: 196,
    createdAt: '2026-09-15T09:00:00Z',
  },
  {
    id: 'chunk-leg-5',
    documentId: 'doc-legal-001',
    documentTitle: 'Sample Executive Employment & IP Agreement (Apex BioTech)',
    category: 'legal',
    pageNumber: 5,
    chunkIndex: 4,
    section: 'Restrictive Covenants, Liability & Governing Law',
    content: `SECTION 8: RESTRICTIVE COVENANTS
8.1 Non-Competition: During the Term and for a period of twelve (12) months following termination of employment, Executive shall not, directly or indirectly, engage in, advise, or consult with any competitive biopharmaceutical enterprise developing small-molecule kinase inhibitors for oncology within the United States.
8.2 Non-Solicitation: For eighteen (18) months following termination, Executive shall not solicit, recruit, or hire any current employee, clinical investigator, or contractor of the Company.

SECTION 10: LIMITATION OF LIABILITY & INDEMNIFICATION
10.1 Indemnification: Company shall indemnify and hold Executive harmless to the fullest extent permitted by Delaware law against all liabilities arising from Executive's good faith performance of duties.
10.2 Liability Limitation: Except for breaches of Section 4 or Section 8, neither party's liability for indirect, punitive, or consequential damages shall exceed $1,000,000 USD.

SECTION 12: GOVERNING LAW & ARBITRATION
This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to conflicts of law principles. Any dispute arising hereunder shall be settled by confidential binding arbitration administered by JAMS in Boston, Massachusetts.`,
    tokenCount: 228,
    createdAt: '2026-09-15T09:00:00Z',
  },
];

export const INITIAL_DOCUMENTS: DocumentMetadata[] = [
  {
    id: 'doc-clinical-001',
    title: 'Sample Clinical Discharge Summary (Coronary Angioplasty)',
    filename: 'Sample_Discharge_Summary_Cardiology.pdf',
    category: 'clinical',
    author: 'Dr. Marcus Vance, MD (Metropolitan Cardiology)',
    fileSize: 428000,
    pageCount: 4,
    processingStatus: 'ready',
    processingProgress: 100,
    processingStep: 'Indexed in pgvector',
    chunkCount: 4,
    uploadedAt: '2026-09-05T12:00:00Z',
    updatedAt: '2026-09-05T12:01:14Z',
    collectionId: 'col-clinical-cardio',
    summary: 'Clinical discharge summary for 64-year-old male who underwent successful coronary angiography and drug-eluting stent (DES) placement to the Left Anterior Descending (LAD) artery. Outlines dual antiplatelet therapy (DAPT) with Ticagrelor and Aspirin, activity restrictions, and emergency red-flag symptoms.',
    rawText: SAMPLE_CLINICAL_CHUNKS.map((c) => `--- PAGE ${c.pageNumber} (${c.section}) ---\n${c.content}`).join('\n\n'),
  },
  {
    id: 'doc-legal-001',
    title: 'Sample Executive Employment & IP Agreement (Apex BioTech)',
    filename: 'ApexBio_Executive_Employment_Agreement.pdf',
    category: 'legal',
    author: 'Apex BioTech Corp Legal Counsel',
    fileSize: 612000,
    pageCount: 5,
    processingStatus: 'ready',
    processingProgress: 100,
    processingStep: 'Indexed in pgvector',
    chunkCount: 5,
    uploadedAt: '2026-09-15T09:00:00Z',
    updatedAt: '2026-09-15T09:01:22Z',
    collectionId: 'col-legal-contracts',
    summary: 'Executive employment contract appointing Dr. Elena Rostova as Chief Medical Officer. Sets $385,000 base salary, 35% performance bonus, IP assignments, 60-day notice without cause with 12 months severance, 12-month oncology non-compete, Delaware governing law, and $1,000,000 liability limitation.',
    rawText: SAMPLE_LEGAL_CHUNKS.map((c) => `--- PAGE ${c.pageNumber} (${c.section}) ---\n${c.content}`).join('\n\n'),
  },
];
