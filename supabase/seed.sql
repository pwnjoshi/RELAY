-- ============================================================
-- RELAY SEED DATA FOR SUPABASE
-- Run this in Supabase SQL Editor to populate initial demo data
-- ============================================================

-- 1. Organization
INSERT INTO organizations (id, name, slug, plan)
VALUES ('org_apex', 'Apex Health Dental Group', 'apex-health', 'enterprise')
ON CONFLICT (id) DO NOTHING;

-- 2. Clinic Locations
INSERT INTO clinic_locations (id, org_id, name, address, phone, timezone, services, average_ticket_value, on_call_doctor)
VALUES 
  ('loc_downtown', 'org_apex', 'Apex Health - Downtown Metro', '450 Sutter St, Suite 1200, San Francisco, CA', '+1-555-0100', 'America/Los_Angeles', ARRAY['Preventive Hygiene & Cleaning', 'Comprehensive Oral Exam', 'Emergency Triage & Pain Relief', 'Invisalign Consultation', 'Crowns & Restorative Care'], 320, 'Dr. Sarah Chen, DDS'),
  ('loc_westside', 'org_apex', 'Apex Health - Westside Family Clinic', '2100 Olympic Blvd, Los Angeles, CA', '+1-555-0200', 'America/Los_Angeles', ARRAY['Routine Health & Wellness Exam', 'Pediatric Checkups', 'Hygiene & Teeth Whitening', 'Chronic Condition Follow-up'], 280, 'Dr. Marcus Vance, MD'),
  ('loc_highland', 'org_apex', 'Apex Health - Highland Park Specialty', '880 North Highland Ave, Austin, TX', '+1-555-0300', 'America/Chicago', ARRAY['Oral & Maxillofacial Surgery', 'Sedation Dentistry', 'Wisdom Teeth Extraction', 'Dental Implants'], 550, 'Dr. Elena Rostova, MD, DMD')
ON CONFLICT (id) DO NOTHING;

-- 3. Departments
INSERT INTO departments (id, org_id, location_id, name, code, description, head_doctor, phone_extension, active_calls_count, monthly_quota, monthly_used, allowed_roles)
VALUES
  ('dept_general', 'org_apex', 'loc_downtown', 'General Dentistry & Hygiene', 'GEN-DENT', 'Routine checkups, hygiene cleanings, cavity fillings, and preventive care.', 'Dr. Sarah Chen, DDS', '101', 2, 1000, 384, ARRAY['owner', 'dept_admin', 'operator']),
  ('dept_ortho', 'org_apex', 'loc_westside', 'Orthodontics & Implants', 'ORTHO-IMP', 'Invisalign aligners, braces adjustments, titanium implants, and cosmetic veneers.', 'Dr. Marcus Vance, DDS, MS', '102', 1, 800, 210, ARRAY['owner', 'dept_admin', 'operator']),
  ('dept_emergency', 'org_apex', 'loc_highland', 'Emergency & Oral Surgery', 'EMERG-SURG', '24/7 Acute pain triage, wisdom tooth extractions, abscesses, and trauma relief.', 'Dr. Elena Rostova, MD, DMD', '911', 1, 500, 142, ARRAY['owner', 'dept_admin', 'operator']),
  ('dept_billing', 'org_apex', 'loc_downtown', 'Billing, Claims & CareCredit', 'BILL-FIN', 'Patient insurance verification, zero-interest payment plans, and claim reconciliations.', 'Finance Manager Lisa Wong', '104', 0, 400, 95, ARRAY['owner', 'dept_admin', 'operator']),
  ('dept_pr_media', 'org_apex', 'loc_downtown', 'Patient Relations, Media & PR', 'PR-MEDIA', 'Patient satisfaction outreach, community health drives, PR follow-ups, and review campaigns.', 'Director Amanda Cruz', '105', 0, 600, 180, ARRAY['owner', 'dept_admin', 'media_pr'])
ON CONFLICT (id) DO NOTHING;

-- 4. Users / Staff
INSERT INTO users (id, org_id, name, email, role, department_ids, status)
VALUES
  ('usr_owner_1', 'org_apex', 'Dr. Arthur Pendelton', 'arthur@apexhealth.com', 'owner', ARRAY['dept_general', 'dept_ortho', 'dept_emergency', 'dept_billing', 'dept_pr_media'], 'active'),
  ('usr_admin_dental', 'org_apex', 'Dr. Sarah Chen, DDS', 'sarah.chen@apexhealth.com', 'dept_admin', ARRAY['dept_general'], 'active'),
  ('usr_admin_ortho', 'org_apex', 'Dr. Marcus Vance', 'marcus.vance@apexhealth.com', 'dept_admin', ARRAY['dept_ortho'], 'active'),
  ('usr_media_pr', 'org_apex', 'Amanda Cruz (PR & Media)', 'pr.team@apexhealth.com', 'media_pr', ARRAY['dept_pr_media'], 'active'),
  ('usr_frontdesk_1', 'org_apex', 'Alex Rivera (Lead Receptionist)', 'frontdesk@apexhealth.com', 'operator', ARRAY['dept_general', 'dept_billing'], 'active')
ON CONFLICT (id) DO NOTHING;

-- 5. Batch Campaigns
INSERT INTO batch_campaigns (id, org_id, department_id, title, status, total_contacts, completed_count, booked_count)
VALUES
  ('camp_hygiene_q3', 'org_apex', 'dept_general', 'Q3 Preventive Hygiene Recall & Fluoride', 'completed', 14, 14, 11),
  ('camp_ortho_invisalign', 'org_apex', 'dept_ortho', 'Summer Invisalign & Smile Scan Outreach', 'processing', 8, 6, 5)
ON CONFLICT (id) DO NOTHING;
