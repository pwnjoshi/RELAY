/**
 * lib/goals.ts
 * CALL-E Goal Runs API 0.6 Autonomous Enterprise Goal Library
 *
 * Implements goal-driven task formulation where the AI agent autonomously
 * plans, executes, adapts to caller responses, and achieves specific business goals.
 */

import { LanguageCode } from "./types";

export interface GoalMilestone {
  id: string;
  title: string;
  description: string;
  isCompleted?: boolean;
}

export interface AutonomousGoal {
  id: string;
  title: string;
  category: "healthcare" | "automotive" | "legal" | "homeservices";
  badge: string;
  targetOutcome: string;
  estimatedDuration: string;
  description: string;
  milestones: GoalMilestone[];
  inputVariables: Array<{
    name: string;
    label: string;
    type: "text" | "phone" | "date" | "number";
    defaultVal: string;
  }>;
  localizedPrompts: Partial<
    Record<
      LanguageCode,
      {
        initialGreeting: string;
        systemInstruction: string;
        fallbackAction: string;
      }
    >
  > & {
    en: {
      initialGreeting: string;
      systemInstruction: string;
      fallbackAction: string;
    };
  };
}

export const AUTONOMOUS_GOALS: AutonomousGoal[] = [
  {
    id: "goal_recall_rebook",
    title: "Overdue Preventive Hygiene Recall Rebooking",
    category: "healthcare",
    badge: "HIGHEST REVENUE IMPACT",
    targetOutcome: "Confirmed Calendar Appointment in Google Calendar",
    estimatedDuration: "60-90s",
    description: "Contact overdue patients, verify identity, offer 2 open calendar slots from live Google Calendar, and secure confirmed booking.",
    milestones: [
      { id: "m1", title: "Patient Identity Verification", description: "Confirm speaking with intended patient politely." },
      { id: "m2", title: "Hygiene Status Check", description: "Remind patient of overdue dental/medical checkup." },
      { id: "m3", title: "Live Slot Offer", description: "Present two upcoming open slots from Free/Busy calendar sync." },
      { id: "m4", title: "Direct Booking Confirmation", description: "Lock slot in Google Calendar and dispatch confirmation SMS/WhatsApp." }
    ],
    inputVariables: [
      { name: "dueFor", label: "Service Overdue", type: "text", defaultVal: "6-Month Dental Cleaning & Exam" },
      { name: "doctorName", label: "Attending Doctor", type: "text", defaultVal: "Dr. Sarah Mitchell, DDS" },
      { name: "preferredDays", label: "Preferred Days", type: "text", defaultVal: "Thursday or Friday Morning" }
    ],
    localizedPrompts: {
      en: {
        initialGreeting: "Hello! This is Sarah calling from Apex Health. I'm following up regarding your regular wellness checkup with Dr. Mitchell.",
        systemInstruction: "Your goal is to rebook the patient for their overdue hygiene exam. Check their availability, offer the next available appointment slot, and confirm their booking politely.",
        fallbackAction: "If patient is unavailable, offer to send a direct WhatsApp/SMS booking link to their mobile."
      },
      hi: {
        initialGreeting: "नमस्ते! मैं एपेक्स हेल्थ से सारा बोल रही हूँ। मैं डॉ. मिशेल के साथ आपकी नियमित जांच के बारे में बात कर रही हूँ।",
        systemInstruction: "आपका लक्ष्य मरीज को उनकी लंबित जांच के लिए पुनः अपॉइंटमेंट बुक करना है। विनम्रता से समय तय करें।",
        fallbackAction: "यदि मरीज व्यस्त हैं, तो उनके फोन पर बुकिंग लिंक भेजने की पेशकश करें।"
      },
      ne: {
        initialGreeting: "नमस्ते! म एपेक्स हेल्थबाट सारा बोल्दै छु। म डा. मिशेलसँग तपाईंको नियमित स्वास्थ्य परीक्षणको बारेमा कल गर्दैछु।",
        systemInstruction: "तपाईंको लक्ष्य बिरामीको समय तालिका अनुसार अर्को उपयुक्त मितिमा अपोइन्टमेन्ट तय गर्नु हो।",
        fallbackAction: "यदि बिरामी अहिले व्यस्त हुनुहुन्छ भने एसएमएस मार्फत विवरण पठाउनुहोस्।"
      },
      es: {
        initialGreeting: "¡Hola! Le habla Sarah de Apex Health. Me comunico para coordinar su chequeo médico preventivo con la Dra. Mitchell.",
        systemInstruction: "Su objetivo es agendar la cita médica pendiente del paciente. Ofrezca los horarios disponibles y confirme la reserva.",
        fallbackAction: "Si no puede atender ahora, ofrezca enviar un enlace de confirmación por WhatsApp."
      }
    }
  },
  {
    id: "goal_noshow_recovery",
    title: "Missed Appointment Recovery & Rescheduling",
    category: "healthcare",
    badge: "ZERO-CHURN GUARANTEE",
    targetOutcome: "Rescheduled Slot & Reason Logged",
    estimatedDuration: "45-75s",
    description: "Reach out to patients who missed an appointment, show empathy, understand any issues, and offer immediate priority rebooking.",
    milestones: [
      { id: "m1", title: "Empathetic Outreach", description: "Acknowledge the missed appointment with care and zero judgment." },
      { id: "m2", title: "Reason Discovery", description: "Record why patient couldn't make it (illness, work, transport)." },
      { id: "m3", title: "Priority Slot Allocation", description: "Offer immediate next-day or weekend priority replacement slot." },
      { id: "m4", title: "Calendar Update", description: "Update Google Calendar event and dispatch reminder notification." }
    ],
    inputVariables: [
      { name: "originalDate", label: "Missed Date", type: "text", defaultVal: "Yesterday at 2:30 PM" },
      { name: "serviceType", label: "Treatment", type: "text", defaultVal: "Crown Fitting & Consultation" }
    ],
    localizedPrompts: {
      en: {
        initialGreeting: "Hi there! I noticed you missed your appointment yesterday. We wanted to check in and make sure everything is okay!",
        systemInstruction: "Show warm empathy. Inquire about the reason for missing the appointment, and offer to reschedule for tomorrow or this weekend.",
        fallbackAction: "Log cancellation notes and schedule a reminder callback."
      },
      hi: {
        initialGreeting: "नमस्ते! हमने देखा कि कल आप अपनी अपॉइंटमेंट में नहीं आ सके। हम बस यह सुनिश्चित करने के लिए कॉल कर रहे हैं कि सब ठीक है।",
        systemInstruction: "सहानुभूति दिखाएं और मरीज को कल या सप्ताहांत के लिए नया समय दें।",
        fallbackAction: "कारण नोट करें और बाद में फॉलो-अप सेट करें।"
      },
      ne: {
        initialGreeting: "नमस्ते! तपाईं हिजोको अपोइन्टमेन्टमा आउन सक्नुभएन। हामी तपाईंको स्वास्थ्य ठीक छ कि छैन भनेर बुझ्न कल गर्दैछौं।",
        systemInstruction: "न्यानोपनका साथ नयाँ समय प्रस्ताव गर्नुहोस्।",
        fallbackAction: "टिप्पणी नोट गर्नुहोस् र नयाँ समय पठाउनुहोस्।"
      },
      es: {
        initialGreeting: "¡Hola! Notamos que no pudo asistir a su cita de ayer. ¡Queríamos asegurarnos de que todo estuviera bien!",
        systemInstruction: "Muestre empatía y ofrezca reagendar para mañana o el fin de semana.",
        fallbackAction: "Registre los motivos y envíe recordatorio por mensaje."
      }
    }
  },
  {
    id: "goal_auto_recall",
    title: "Manufacturer Safety Recall & Service Bay Booking",
    category: "automotive",
    badge: "OEM COMPLIANCE",
    targetOutcome: "Service Bay Slot Reserved with VIN Match",
    estimatedDuration: "60-80s",
    description: "Notify vehicle owner of an active safety recall campaign, verify VIN/model, explain that parts are in stock, and schedule technician repair bay.",
    milestones: [
      { id: "m1", title: "Safety Recall Brief", description: "Explain active manufacturer safety campaign clearly and calmly." },
      { id: "m2", title: "Vehicle Verification", description: "Verify vehicle model, year, and current mileage." },
      { id: "m3", title: "Bay Scheduling", description: "Book free 45-minute repair slot in dealership service calendar." },
      { id: "m4", title: "Complimentary Loaner / Shuttle Offer", description: "Arrange shuttle service or loaner vehicle if requested." }
    ],
    inputVariables: [
      { name: "vehicleModel", label: "Vehicle Model", type: "text", defaultVal: "2024 Apex Velocity SUV" },
      { name: "recallCampaign", label: "Recall Notice", type: "text", defaultVal: "Airbag Sensor Firmware Calibration" },
      { name: "estimatedRepairTime", label: "Repair Duration", type: "text", defaultVal: "45 minutes (Complimentary)" }
    ],
    localizedPrompts: {
      en: {
        initialGreeting: "Hello! This is Apex Velocity Service Center. We are calling regarding a complimentary safety recall update for your vehicle.",
        systemInstruction: "Explain that the safety recall is 100% free, parts are in stock, and offer to schedule a fast 45-minute repair slot with free coffee and shuttle.",
        fallbackAction: "Offer to email or text the official recall safety bulletin."
      },
      hi: {
        initialGreeting: "नमस्ते! यह एपेक्स वेलोसिटी सर्विस सेंटर से कॉल है। आपके वाहन के लिए एक मुफ्त सुरक्षा रिकॉल अपडेट उपलब्ध है।",
        systemInstruction: "स्पष्ट करें कि यह सेवा पूरी तरह से मुफ्त है और 45 मिनट का सर्विस स्लॉट बुक करें।",
        fallbackAction: "व्हाट्सएप पर आधिकारिक नोटिस भेजें।"
      },
      ne: {
        initialGreeting: "नमस्ते! यो एपेक्स भेलोसिटी सर्भिस सेन्टरबाट कल हो। तपाईंको गाडीको लागि निःशुल्क सुरक्षा रिकॉल उपलब्ध छ।",
        systemInstruction: "रिकॉल पूर्ण रूपमा निःशुल्क छ भनी जानकारी दिनुहोस् र सर्भिस बुक गर्नुहोस्।",
        fallbackAction: "एसएमएस मार्फत विवरण पठाउनुहोस्।"
      },
      es: {
        initialGreeting: "¡Hola! Le llamamos del Centro de Servicio Apex Velocity sobre una actualización de seguridad gratuita para su vehículo.",
        systemInstruction: "Explique que la revisión es 100% gratuita y reserve un turno de 45 minutos en el taller.",
        fallbackAction: "Envíe el boletín de seguridad por WhatsApp."
      }
    }
  },
  {
    id: "goal_emergency_triage",
    title: "Zero-Harm Clinical Emergency & Pain Triage",
    category: "healthcare",
    badge: "FAIL-CLOSED PROTOCOL",
    targetOutcome: "Safe Triage or Immediate On-Call Escalation",
    estimatedDuration: "30-60s",
    description: "Safely screen caller symptoms. If acute chest pain, severe trauma, or breathing distress is detected, immediately halt automation and trigger urgent clinical escalation.",
    milestones: [
      { id: "m1", title: "Symptom Assessment", description: "Listen attentively to caller distress description." },
      { id: "m2", title: "Distress Keyword Screening", description: "Check for red-flag medical emergencies (acute chest pain, trauma, difficulty breathing)." },
      { id: "m3", title: "Fail-Closed Escalation", description: "If critical, instruct caller to seek 911 / emergency care and dispatch priority SMS alert to on-call physician." },
      { id: "m4", title: "Urgent Slot Booking", description: "If non-critical acute pain, book emergency same-day evaluation slot." }
    ],
    inputVariables: [
      { name: "onCallDoctor", label: "On-Call Physician", type: "text", defaultVal: "Dr. Marcus Vance, MD (Emergency Chief)" },
      { name: "clinicAddress", label: "Emergency Walk-in Address", type: "text", defaultVal: "100 Congress Ave, Suite 400, Austin, TX" }
    ],
    localizedPrompts: {
      en: {
        initialGreeting: "Hello, this is Apex Health Triage. I understand you may be experiencing discomfort. How can we best assist you right now?",
        systemInstruction: "Listen carefully. If caller describes severe emergency symptoms, invoke fail-closed protocol immediately: advise emergency services (911) and trigger physician callback alert.",
        fallbackAction: "Trigger immediate Slack and SMS high-priority alert to the medical director."
      },
      hi: {
        initialGreeting: "नमस्ते, यह एपेक्स हेल्थ ट्राइएज है। हम आपकी तुरंत क्या सहायता कर सकते हैं?",
        systemInstruction: "यदि मरीज गंभीर दर्द या आपात स्थिति में है, तो तुरंत आपातकालीन सलाह दें और ऑन-कॉल डॉक्टर को अलर्ट भेजें।",
        fallbackAction: "तत्काल मेडिकल अलर्ट ट्रिगर करें।"
      },
      ne: {
        initialGreeting: "नमस्ते, यो एपेक्स हेल्थ ट्राइएज हो। हामी तपाईंलाई अहिले कसरी मद्दत गर्न सक्छौं?",
        systemInstruction: "यदि बिरामी गम्भीर समस्यामा हुनुहुन्छ भने तत्काल अस्पताल जान सल्लाह दिनुहोस् र डाक्टरलाई सूचना दिनुहोस्।",
        fallbackAction: "उच्च प्राथमिकता सूचना पठाउनुहोस्।"
      },
      es: {
        initialGreeting: "Hola, le atiende el servicio de triaje de Apex Health. ¿En qué podemos ayudarle de inmediato?",
        systemInstruction: "Evalúe los síntomas. Si hay emergencia grave, active el protocolo de seguridad y notifique al médico de guardia.",
        fallbackAction: "Despache alerta urgente al equipo médico."
      }
    }
  },
  {
    id: "goal_insurance_preauth",
    title: "Insurance & Coverage Pre-Authorization Intake",
    category: "healthcare",
    badge: "BILLING ACCELERATOR",
    targetOutcome: "Verified Policy Number & Pre-Auth Summary",
    estimatedDuration: "60-90s",
    description: "Collect caller insurance carrier, subscriber ID, and group number prior to scheduled surgery or procedure.",
    milestones: [
      { id: "m1", title: "Insurance Carrier Identification", description: "Capture insurance provider name (BlueCross, Aetna, Cigna, Delta)." },
      { id: "m2", title: "Member ID Collection", description: "Accurately record member policy number and group code." },
      { id: "m3", title: "Procedure Confirmation", description: "Verify scheduled treatment requiring pre-authorization." },
      { id: "m4", title: "Intake Summary", description: "Log payload to CRM and send confirmation receipt to patient." }
    ],
    inputVariables: [
      { name: "procedureName", label: "Scheduled Procedure", type: "text", defaultVal: "Comprehensive Specialty Consultation" }
    ],
    localizedPrompts: {
      en: {
        initialGreeting: "Hello! This is Apex Health Patient Accounts. I'm reaching out to verify your insurance details for your upcoming appointment.",
        systemInstruction: "Politely collect the insurance provider name and member ID number. Re-read the numbers back to ensure 100% accuracy.",
        fallbackAction: "Offer secure web portal upload if caller doesn't have insurance card handy."
      },
      hi: {
        initialGreeting: "नमस्ते! यह एपेक्स हेल्थ से है। आपकी आगामी अपॉइंटमेंट के लिए बीमा विवरण सत्यापित करने हेतु कॉल किया गया है।",
        systemInstruction: "बीमा कंपनी का नाम और सदस्य आईडी नंबर विनम्रता से प्राप्त करें।",
        fallbackAction: "पोर्टल लिंक भेजने की पेशकश करें।"
      },
      ne: {
        initialGreeting: "नमस्ते! यो एपेक्स हेल्थबाट हो। तपाईंको आउँदो अपोइन्टमेन्टको लागि बीमा विवरण पुष्टि गर्न कल गर्दैछौं।",
        systemInstruction: "बीमा प्रदायकको नाम र कार्ड नम्बर संकलन गर्नुहोस्।",
        fallbackAction: "लिंक पठाउनुहोस्।"
      },
      es: {
        initialGreeting: "¡Hola! Nos comunicamos de Apex Health para verificar los datos de su seguro antes de su próxima consulta.",
        systemInstruction: "Solicite el nombre de la aseguradora y el número de póliza del paciente.",
        fallbackAction: "Ofrezca enviar el enlace seguro por SMS."
      }
    }
  }
];

export function getGoalById(id: string): AutonomousGoal | undefined {
  return AUTONOMOUS_GOALS.find((g) => g.id === id);
}
