-- ==============================================================================
-- Seed Data for NeuralDoc Demo Mode
-- Synthetic Clinical & Legal records with pre-computed metadata
-- ==============================================================================

INSERT INTO public.collections (id, name, description)
VALUES 
    ('col-clinical-cardio', 'Cardiology Discharge Summaries', 'Post-operative clinical records, medication regimens, and patient discharge instructions.'),
    ('col-legal-contracts', 'Executive & Employment Agreements', 'Master service agreements, compensation structures, non-competes, and termination liability.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.documents (id, title, filename, category, author, file_size, page_count, processing_status, summary)
VALUES
    ('doc-clinical-001', 'Sample Clinical Discharge Summary (Coronary Angioplasty)', 'Sample_Discharge_Summary_Cardiology.pdf', 'clinical', 'Dr. Marcus Vance, MD (Metropolitan Cardiology)', 428000, 4, 'ready', 'Clinical discharge summary for 64-year-old male who underwent successful coronary angiography and drug-eluting stent placement to the LAD. Outlines dual antiplatelet therapy with Ticagrelor and Aspirin, activity restrictions, and emergency red flags.'),
    ('doc-legal-001', 'Sample Executive Employment & IP Agreement (Apex BioTech)', 'ApexBio_Executive_Employment_Agreement.pdf', 'legal', 'Apex BioTech Corp Legal Counsel', 612000, 5, 'ready', 'Executive employment contract appointing Dr. Elena Rostova as Chief Medical Officer. Sets $385,000 base salary, 35% performance bonus, IP assignments, 60-day notice without cause with 12 months severance, and $1,000,000 liability limitation.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.collection_documents (collection_id, document_id)
VALUES
    ('col-clinical-cardio', 'doc-clinical-001'),
    ('col-legal-contracts', 'doc-legal-001')
ON CONFLICT DO NOTHING;
