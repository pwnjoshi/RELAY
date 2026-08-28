const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const url = "https://gxfsdvirncnucvvurzwg.supabase.co";
const key = "sb_publishable_s-BBcE72buvoUCWu6qeVGg_ABG3efED";
const client = createClient(url, key);

async function seed() {
  console.log("Seeding Supabase Cloud tables...");

  // 1. Organization
  const { error: orgErr } = await client.from("organizations").upsert({
    id: "org_apex",
    name: "Apex Health Dental Group",
    slug: "apex-health",
    plan: "enterprise"
  });
  if (orgErr) console.error("Org error:", orgErr);

  // 2. Locations
  const { error: locErr } = await client.from("clinic_locations").upsert([
    {
      id: "loc_downtown",
      org_id: "org_apex",
      name: "Apex Health - Downtown Metro",
      address: "450 Sutter St, Suite 1200, San Francisco, CA",
      phone: "+1-555-0100",
      timezone: "America/Los_Angeles",
      services: [
        "Preventive Hygiene & Cleaning",
        "Comprehensive Oral Exam",
        "Emergency Triage & Pain Relief",
        "Invisalign Consultation",
        "Crowns & Restorative Care"
      ],
      average_ticket_value: 320,
      on_call_doctor: "Dr. Sarah Chen, DDS"
    },
    {
      id: "loc_westside",
      org_id: "org_apex",
      name: "Apex Health - Westside Family Clinic",
      address: "2100 Olympic Blvd, Los Angeles, CA",
      phone: "+1-555-0200",
      timezone: "America/Los_Angeles",
      services: [
        "Routine Health & Wellness Exam",
        "Pediatric Checkups",
        "Hygiene & Teeth Whitening",
        "Chronic Condition Follow-up"
      ],
      average_ticket_value: 280,
      on_call_doctor: "Dr. Marcus Vance, MD"
    },
    {
      id: "loc_highland",
      org_id: "org_apex",
      name: "Apex Health - Highland Park Specialty",
      address: "880 North Highland Ave, Austin, TX",
      phone: "+1-555-0300",
      timezone: "America/Chicago",
      services: [
        "Oral & Maxillofacial Surgery",
        "Sedation Dentistry",
        "Wisdom Teeth Extraction",
        "Dental Implants"
      ],
      average_ticket_value: 550,
      on_call_doctor: "Dr. Elena Rostova, MD, DMD"
    }
  ]);
  if (locErr) console.error("Loc error:", locErr);

  // 3. Departments
  const { error: deptErr } = await client.from("departments").upsert([
    {
      id: "dept_general",
      org_id: "org_apex",
      location_id: "loc_downtown",
      name: "General Dentistry & Hygiene",
      code: "GEN-DENT",
      description: "Routine checkups, hygiene cleanings, cavity fillings, and preventive care.",
      head_doctor: "Dr. Sarah Chen, DDS",
      phone_extension: "101",
      active_calls_count: 2,
      monthly_quota: 1000,
      monthly_used: 384,
      allowed_roles: ["owner", "dept_admin", "operator"]
    },
    {
      id: "dept_ortho",
      org_id: "org_apex",
      location_id: "loc_westside",
      name: "Orthodontics & Implants",
      code: "ORTHO-IMP",
      description: "Invisalign aligners, braces adjustments, titanium implants, and cosmetic veneers.",
      head_doctor: "Dr. Marcus Vance, DDS, MS",
      phone_extension: "102",
      active_calls_count: 1,
      monthly_quota: 800,
      monthly_used: 210,
      allowed_roles: ["owner", "dept_admin", "operator"]
    },
    {
      id: "dept_emergency",
      org_id: "org_apex",
      location_id: "loc_highland",
      name: "Emergency & Oral Surgery",
      code: "EMERG-SURG",
      description: "24/7 Acute pain triage, wisdom tooth extractions, abscesses, and trauma relief.",
      head_doctor: "Dr. Elena Rostova, MD, DMD",
      phone_extension: "911",
      active_calls_count: 1,
      monthly_quota: 500,
      monthly_used: 142,
      allowed_roles: ["owner", "dept_admin", "operator"]
    },
    {
      id: "dept_billing",
      org_id: "org_apex",
      location_id: "loc_downtown",
      name: "Billing, Claims & CareCredit",
      code: "BILL-FIN",
      description: "Patient insurance verification, zero-interest payment plans, and claim reconciliations.",
      head_doctor: "Finance Manager Lisa Wong",
      phone_extension: "104",
      active_calls_count: 0,
      monthly_quota: 400,
      monthly_used: 95,
      allowed_roles: ["owner", "dept_admin", "operator"]
    },
    {
      id: "dept_pr_media",
      org_id: "org_apex",
      location_id: "loc_downtown",
      name: "Patient Relations, Media & PR",
      code: "PR-MEDIA",
      description: "Patient satisfaction outreach, community health drives, PR follow-ups, and review campaigns.",
      head_doctor: "Director Amanda Cruz",
      phone_extension: "105",
      active_calls_count: 0,
      monthly_quota: 600,
      monthly_used: 180,
      allowed_roles: ["owner", "dept_admin", "media_pr"]
    }
  ]);
  if (deptErr) console.error("Dept error:", deptErr);

  // 4. Users
  const { error: userErr } = await client.from("users").upsert([
    {
      id: "usr_owner_1",
      org_id: "org_apex",
      name: "Dr. Arthur Pendelton",
      email: "arthur@apexhealth.com",
      role: "owner",
      department_ids: ["dept_general", "dept_ortho", "dept_emergency", "dept_billing", "dept_pr_media"],
      status: "active"
    },
    {
      id: "usr_admin_dental",
      org_id: "org_apex",
      name: "Dr. Sarah Chen, DDS",
      email: "sarah.chen@apexhealth.com",
      role: "dept_admin",
      department_ids: ["dept_general"],
      status: "active"
    }
  ]);
  if (userErr) console.error("User error:", userErr);

  // 5. Calls
  const rawCalls = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../data/sample-calls.json"), "utf-8")
  );
  const dbCalls = rawCalls.map((c) => ({
    id: c.id,
    run_id: c.runId || null,
    org_id: "org_apex",
    location_id: c.locationId || "loc_downtown",
    department_id: c.departmentId || "dept_general",
    phone_number: c.phoneNumber,
    patient_name: c.patientName,
    call_type: c.callType,
    status: c.status,
    language: c.language || "en",
    custom_goal: c.customGoal || null,
    summary: c.summary || null,
    structured_outcome: c.structuredOutcome || null,
    recovered_revenue: c.recoveredRevenue || 0,
    created_at: c.createdAt || new Date().toISOString(),
    completed_at: c.completedAt || null
  }));

  const { error: callsErr } = await client.from("calls").upsert(dbCalls);
  if (callsErr) {
    console.error("Calls error:", callsErr);
  } else {
    console.log("Successfully inserted " + dbCalls.length + " call records into Supabase!");
  }

  console.log("All tables seeded successfully in Supabase Cloud!");
}

seed().catch(console.error);
