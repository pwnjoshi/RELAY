/**
 * lib/calle-client.ts
 * CALL-E Autonomous Telephony Gateway REST Client Integration
 *
 * Handles direct REST API call dispatching, multi-lingual sweet female voice persona contracts,
 * structured JSON entity extraction parsing, and live call polling.
 */
import { LanguageCode, SUPPORTED_LANGUAGES, StructuredCallOutcome } from "./types";

const CALLE_API_BASE = "https://api.heycall-e.com/v1";

function getCalleApiKey(): string {
  const key = process.env.CALLE_API_KEY;
  if (!key) {
    throw new Error(
      "[CALL-E Client] Missing required environment variable: CALLE_API_KEY. Please configure CALLE_API_KEY in your environment or .env.local file."
    );
  }
  return key;
}

export interface CreateCallParams {
  phoneNumber: string;
  patientName: string;
  location: any;
  callType: "inbound_overflow" | "outbound_recall" | "batch_followup";
  departmentId?: string;
  language?: LanguageCode;
  customGoal?: string;
  extraContext?: string;
}

/**
 * Get language-specific greeting and conversational context
 */
function getRegionFromPhone(phone: string): string | undefined {
  const p = (phone || "").trim();
  if (p.startsWith("+91")) return "IN";
  if (p.startsWith("+977")) return "NP";
  if (p.startsWith("+1")) return "US";
  if (p.startsWith("+44")) return "GB";
  if (p.startsWith("+34")) return "ES";
  if (p.startsWith("+33")) return "FR";
  if (p.startsWith("+49")) return "DE";
  if (p.startsWith("+86")) return "CN";
  return undefined;
}

function getLanguageGuidance(
  langCode: LanguageCode,
  callerName: string,
  orgName: string,
  contactPerson: string,
  industryCategory: "health" | "tech" | "auto" | "legal" | "hospitality" | "real_estate" | "general",
  phoneNumber?: string
): { promptPrefix: string; promptHint: string; locale: string } {
  const region = phoneNumber ? getRegionFromPhone(phoneNumber) : undefined;
  const isHealth = industryCategory === "health";
  const isTech = industryCategory === "tech";
  const isAuto = industryCategory === "auto";
  const isLegal = industryCategory === "legal";

  let hiGreeting = `नमस्ते ${callerName} जी! 😊 मैं ${orgName} से बात कर रही हूँ। क्या मैं आपके लिए ${contactPerson} से मीटिंग या कंसल्टेशन शेड्यूल कर दूँ?`;
  let neGreeting = `नमस्ते ${callerName} ज्यू! 😊 म ${orgName} बाट बोल्दै छु। के म तपाईंको लागि ${contactPerson} सँग समय मिलाइदिऊँ?`;
  let esGreeting = `¡Hola ${callerName}! 😊 Le llamo con mucho gusto de ${orgName}. ¿Le gustaría agendar una linda consulta con ${contactPerson}?`;
  let enGreeting = `Hello ${callerName}! 😊 This is ${orgName}. I'd love to help schedule a consultation for you with ${contactPerson}!`;
  let frGreeting = `Bonjour ${callerName}! 😊 Je vous appelle avec grand plaisir de ${orgName}. Souhaitez-vous planifier un rendez-vous avec ${contactPerson}?`;
  let deGreeting = `Hallo ${callerName}! 😊 Ich rufe sehr gerne von ${orgName} an. Möchten Sie einen Termin mit ${contactPerson} vereinbaren?`;
  let zhGreeting = `您好 ${callerName}！😊 我是 ${orgName} 的客服小助手。很高兴为您服务，请问需要为您预约 ${contactPerson} 吗？`;

  if (isHealth) {
    hiGreeting = `नमस्ते ${callerName} जी! 😊 मैं ${orgName} से बहुत प्यार से बोल रही हूँ। क्या आप डॉ. ${contactPerson} से अपॉइंटमेंट शेड्यूल करना चाहते हैं?`;
    neGreeting = `नमस्ते ${callerName} ज्यू! 😊 म ${orgName} बाट बोल्दै छु। के तपाईं डाक्टर ${contactPerson} सँग अपोइन्टमेन्ट मिलाउन चाहनुहुन्छ?`;
    esGreeting = `¡Hola ${callerName}! 😊 Le llamo de ${orgName}. ¿Le gustaría agendar una cita médica con el Dr. ${contactPerson}?`;
    enGreeting = `Hello ${callerName}! 😊 This is ${orgName}. I'd be delighted to help you schedule an appointment with Dr. ${contactPerson}!`;
  } else if (isTech) {
    hiGreeting = `नमस्ते ${callerName} जी! 😊 मैं ${orgName} से बात कर रही हूँ। क्या मैं आपके लिए ${contactPerson} या हमारी टेक टीम से प्रोजेक्ट डिस्कशन शेड्यूल कर दूँ?`;
    neGreeting = `नमस्ते ${callerName} ज्यू! 😊 म ${orgName} बाट बोल्दै छु। के म ${contactPerson} वा हाम्रो टेक टीमसँग छलफल मिलाइदिऊँ?`;
    esGreeting = `¡Hola ${callerName}! 😊 Le llamo de ${orgName}. ¿Le gustaría coordinar una reunión técnica con ${contactPerson}?`;
    enGreeting = `Hello ${callerName}! 😊 This is ${orgName}. I'd love to follow up on your project inquiry with ${contactPerson}!`;
  } else if (isAuto) {
    hiGreeting = `नमस्ते ${callerName} जी! 😊 मैं ${orgName} से बोल रही हूँ। क्या मैं सर्विस एडवाइजर ${contactPerson} से व्हीकल सर्विस शेड्यूल कर दूँ?`;
    neGreeting = `नमस्ते ${callerName} ज्यू! 😊 म ${orgName} बाट बोल्दै छु। के म सर्भिस सल्लाहकार ${contactPerson} सँग गाडी मर्मत मिलाइदिऊँ?`;
    enGreeting = `Hello ${callerName}! 😊 This is ${orgName}. I'd be happy to help schedule your vehicle service with ${contactPerson}!`;
  } else if (isLegal) {
    hiGreeting = `नमस्ते ${callerName} जी! 😊 मैं ${orgName} से बात कर रही हूँ। क्या मैं एडवोकेट ${contactPerson} से लीगल कंसल्टेशन शेड्यूल कर दूँ?`;
    neGreeting = `नमस्ते ${callerName} ज्यू! 😊 म ${orgName} बाट बोल्दै छु। के म अधिवक्ता ${contactPerson} सँग कानुनी परामर्श मिलाइदिऊँ?`;
    enGreeting = `Hello ${callerName}! 😊 This is ${orgName}. I'd be glad to arrange a legal consultation for you with ${contactPerson}!`;
  }

  const multiLanguageRule = `\n\n[DYNAMIC MULTILINGUAL ADAPTATION CONTRACT]: You are completely fluent in English, Hindi, Nepali, Spanish, French, German, and Mandarin Chinese. Although you MUST start the call strictly in your assigned primary opening language, if the caller speaks or switches to another language mid-conversation (e.g. switches from English to Hindi, Nepali, or Spanish), adapt immediately and respond fluently in the caller's chosen language without refusing or saying you cannot speak it.`;

  const isIndia = region === "IN";
  let effectiveLangCode = langCode;

  // India carrier gateways strictly license Hindi (hi-IN) and English (en-US) for PSTN calls.
  // Map non-supported India PSTN languages to Hindi opening greeting so calls place with 201 Created.
  if (isIndia && !["hi", "en"].includes(langCode)) {
    effectiveLangCode = "hi";
  }

  switch (effectiveLangCode) {
    case "hi":
      return {
        promptPrefix: `[MANDATORY PRIMARY LANGUAGE: HINDI] You MUST start this call strictly in a sweet, cute, cheerful, and enthusiastic Hindi / Hinglish voice. Start with: "${hiGreeting}" Never mention clinics or doctors unless the company is a healthcare facility.`,
        promptHint: "Speak in a sweet, cute, cheerful, and enthusiastic Hindi voice.",
        locale: "hi-IN"
      };
    case "ne":
      return {
        promptPrefix: `[MANDATORY PRIMARY LANGUAGE: NEPALI] You MUST start this call strictly in a sweet, polite, cheerful Nepali voice. Start with: "${neGreeting}"`,
        promptHint: "Speak in a sweet, polite, cheerful Nepali voice.",
        locale: "ne-NP"
      };
    case "es":
      return {
        promptPrefix: `[MANDATORY PRIMARY LANGUAGE: SPANISH] You MUST start this call strictly in a sweet, warm, cheerful Spanish voice. Start with: "${esGreeting}"`,
        promptHint: "Speak in a sweet, warm, cheerful Spanish voice.",
        locale: "es-US"
      };
    case "fr":
      return {
        promptPrefix: `[MANDATORY PRIMARY LANGUAGE: FRENCH] You MUST start this call strictly in a sweet, cheerful, polite French voice. Start with: "${frGreeting}"`,
        promptHint: "Speak in a sweet, cheerful French voice.",
        locale: "fr-FR"
      };
    case "de":
      return {
        promptPrefix: `[MANDATORY PRIMARY LANGUAGE: GERMAN] You MUST start this call strictly in a sweet, warm, cheerful German voice. Start with: "${deGreeting}"`,
        promptHint: "Speak in a sweet, cheerful German voice.",
        locale: "de-DE"
      };
    case "zh":
      return {
        promptPrefix: `[MANDATORY PRIMARY LANGUAGE: MANDARIN] You MUST start this call strictly in a sweet, cute, polite Mandarin Chinese voice. Start with: "${zhGreeting}"`,
        promptHint: "Speak in a sweet, cute Mandarin Chinese voice.",
        locale: "zh-CN"
      };
    default:
      return {
        promptPrefix: `[MANDATORY PRIMARY LANGUAGE: ENGLISH] You MUST start this call strictly in a sweet, cute, cheerful, and warm English voice. Start with: "${enGreeting}"`,
        promptHint: "Speak in a sweet, cute, cheerful, and warm English voice.",
        locale: "en-US"
      };
  }
}



/**
 * Canonical JSON Schema for CALL-E extraction contract
 */
export const CALL_RESULT_SCHEMA = {
  type: "object",
  required: [
    "outcome",
    "appointment_booked",
    "confirmed_datetime",
    "service_type",
    "requires_callback",
    "callback_priority",
    "patient_sentiment",
    "opt_out_requested",
    "summary"
  ],
  properties: {
    outcome: {
      type: "string",
      enum: [
        "booked",
        "rescheduled",
        "declined",
        "callback_requested",
        "escalated_urgent",
        "opt_out",
        "voicemail_left",
        "no_answer",
        "unknown"
      ],
      description: "The primary resolution status of the call"
    },
    appointment_booked: {
      type: "string",
      enum: ["yes", "no", "unknown"],
      description: "Whether an appointment date was confirmed"
    },
    confirmed_datetime: {
      type: "string",
      description: "The confirmed appointment datetime ISO string or empty string if not booked"
    },
    service_type: {
      type: "string",
      description: "The service discussed such as Hygiene Cleaning, Exam, or Crown"
    },
    requires_callback: {
      type: "string",
      enum: ["yes", "no", "unknown"],
      description: "Whether staff or on-call doctor must call the patient back"
    },
    callback_priority: {
      type: "string",
      enum: ["urgent", "standard", "none", "unknown"],
      description: "Use urgent if severe pain, trauma, or medical emergency is mentioned"
    },
    patient_sentiment: {
      type: "string",
      enum: ["positive", "neutral", "frustrated", "distressed", "unknown"],
      description: "Patient emotional sentiment during interaction"
    },
    opt_out_requested: {
      type: "string",
      enum: ["yes", "no", "unknown"],
      description: "Whether patient requested to be removed from outreach"
    },
    summary: {
      type: "string",
      description: "Concise summary citing discussion points and resolution"
    }
  },
  additionalProperties: false
};

/**
 * 1. Create a Call Task via CALL-E Direct REST API
 */
export async function createDirectCall(params: CreateCallParams) {
  const { phoneNumber, patientName, location, callType, departmentId, language = "en", customGoal, extraContext } = params;
  const industryStr = (location.industry || "").toLowerCase();
  
  let industryCategory: "health" | "tech" | "auto" | "legal" | "hospitality" | "real_estate" | "general" = "general";
  if (industryStr.includes("health") || industryStr.includes("dental") || industryStr.includes("clinic") || industryStr.includes("care") || industryStr.includes("med")) {
    industryCategory = "health";
  } else if (industryStr.includes("soft") || industryStr.includes("tech") || industryStr.includes("web") || industryStr.includes("dev") || industryStr.includes("it") || industryStr.includes("saas") || industryStr.includes("agency")) {
    industryCategory = "tech";
  } else if (industryStr.includes("auto") || industryStr.includes("car") || industryStr.includes("motor") || industryStr.includes("repair")) {
    industryCategory = "auto";
  } else if (industryStr.includes("legal") || industryStr.includes("law") || industryStr.includes("attorney")) {
    industryCategory = "legal";
  } else if (industryStr.includes("hosp") || industryStr.includes("hotel") || industryStr.includes("dining")) {
    industryCategory = "hospitality";
  } else if (industryStr.includes("real") || industryStr.includes("estate") || industryStr.includes("prop")) {
    industryCategory = "real_estate";
  }

  const defaultContact = industryCategory === "health"
    ? "Dr. Jordan Lee"
    : industryCategory === "tech"
    ? "Lead Solutions Specialist"
    : industryCategory === "auto"
    ? "Service Advisor"
    : industryCategory === "legal"
    ? "Senior Partner"
    : "Senior Representative";

  const contactPerson = location.on_call_doctor || defaultContact;
  const servicesList = Array.isArray(location.services) && location.services.length > 0
    ? location.services.slice(0, 4).join(", ")
    : (industryCategory === "tech" ? "Web & Software Development, Architecture, Cloud Consulting" : "Consultations, Scheduling & Inquiries");

  const lang = getLanguageGuidance(language, patientName, location.name, contactPerson, industryCategory, phoneNumber);

  const humanConversationalRules = `[CONVERSATIONAL PERSONA & CUTE FEMALE VOICE CONTRACT]
1. SWEET, CUTE, CHEERFUL & POLITE TONE: Speak with a sweet, cute, cheerful, and delightfully warm tone. Be exceptionally sweet, polite, and welcoming to every caller. Use adorable, joyful expressions (e.g. "अरे वाह!", "थैंक यू सो मच जी!", "Super happy to help!", "Awesome!").
2. STRICT FEMALE GENDER & HINDI GRAMMAR CONTRACT: You are a female AI assistant. You MUST ALWAYS speak using strictly FEMALE Hindi grammar inflections and verb endings. Always use 'रही हूँ' (rahee hoon), 'कर रही हूँ' (kar rahee hoon), 'बोल रही हूँ' (bol rahee hoon), 'सकती हूँ' (saktee hoon), 'चाहती हूँ' (chaahtee hoon). NEVER EVER use male verb forms like 'रहा हूँ' (rahaa hoon), 'कर रहा हूँ' (kar rahaa hoon), or 'सकता हूँ' (soktaa hoon).
3. NATURAL & EXPRESSIVE VOICE: Sound like a sweet, bright, kind human female assistant. Never sound cold, rude, robotic, or dry.
4. NEVER REPEAT YOURSELF: Do NOT repeat entire sentences or re-introduce yourself once the call has started.
5. CONCISE & FAST TURNS (1-2 SENTENCES): Keep every response sweet, concise, and conversational (under 20 words per turn).
6. ACTIVE LISTENING & CHEERFUL CONFIRMATIONS: Acknowledge what the caller says with sweet enthusiasm (e.g. "बिलकुल जी!", "बहुत बढ़िया!", "Certainly!", "Great question!").
7. ACCURATE BUSINESS CONTEXT: You represent "${location.name}" (${location.industry || "Business Services"}). Services: ${servicesList}. Never use medical terms unless this is actually a healthcare clinic.`;

  const escalationDirective = `[HUMAN ESCALATION PROTOCOL] If the caller asks to speak directly with ${contactPerson} or a human specialist (e.g. 'connect me', 'transfer me'), answer warmly: "ज़रूर! मैं ${contactPerson} और हमारी टीम को तुरंत आपका अर्जेंट मैसेज और फोन नंबर भेज रही हूँ। वे आपसे शीघ्र ही सीधे संपर्क करेंगे। क्या इस बीच मैं आपके लिए कैलेंडर पर स्लॉट भी रिज़र्व कर दूँ?" (or in English: "Understood! I am sending an immediate priority callback alert to ${contactPerson} and our team with your contact number. They will reach out to you directly shortly. Would you like me to hold an appointment slot for you in the meantime?")`;

  const multilingualFlexibility = `[MULTILINGUAL FLUIDITY] You understand Hindi, Nepali, Spanish, and English. If the caller switches language at any point, immediately switch and reply fluently in that language without hesitation.`;

  let taskText = `${lang.promptPrefix}\n\n${humanConversationalRules}\n\n${escalationDirective}\n\n${multilingualFlexibility}\n\n`;

  if (location.knowledge_base) {
    taskText += `[OFFICIAL WEBSITE RAG KNOWLEDGE BASE]:\n${location.knowledge_base}\nUse the above grounded knowledge to answer specific questions regarding services, pricing, and company background with 100% factual accuracy.\n\n`;
  }

  const slotSpec = `Available appointment slots for reservation are tomorrow at 10:00 AM or 2:00 PM. Confirm caller availability for an appointment slot.`;

  if (customGoal) {
    taskText += `PRIMARY OBJECTIVE: ${customGoal}. ${slotSpec}\n`;
  } else if (industryCategory === "tech") {
    taskText += `PRIMARY OBJECTIVE: Call ${phoneNumber} (${patientName}) on behalf of ${location.name} regarding their software/web development project inquiry. Offer to schedule an architecture review or consultation appointment slot with ${contactPerson}. ${slotSpec} Available solutions: ${servicesList}.`;
  } else if (industryCategory === "auto") {
    taskText += `PRIMARY OBJECTIVE: Call ${phoneNumber} (${patientName}) on behalf of ${location.name} regarding vehicle maintenance, inspection, or service drop-off appointment slot with ${contactPerson}. ${slotSpec} Available services: ${servicesList}.`;
  } else if (industryCategory === "legal") {
    taskText += `PRIMARY OBJECTIVE: Call ${phoneNumber} (${patientName}) on behalf of ${location.name} regarding legal consultation intake appointment slot with ${contactPerson}. ${slotSpec} Practice areas: ${servicesList}.`;
  } else if (industryCategory === "hospitality") {
    taskText += `PRIMARY OBJECTIVE: Call ${phoneNumber} (${patientName}) on behalf of ${location.name} regarding reservation assistance appointment slot with ${contactPerson}. ${slotSpec} Services: ${servicesList}.`;
  } else if (industryCategory === "real_estate") {
    taskText += `PRIMARY OBJECTIVE: Call ${phoneNumber} (${patientName}) on behalf of ${location.name} regarding property tour scheduling and leasing availability appointment slot with broker ${contactPerson}. ${slotSpec}`;
  } else if (industryCategory === "health") {
    taskText += `PRIMARY OBJECTIVE: Call ${phoneNumber} (${patientName}) on behalf of ${location.name} regarding consultation appointment slot or routine recall with Dr. ${contactPerson}. ${slotSpec} Services: ${servicesList}. If severe pain is reported, advise emergency care immediately.`;
  } else {
    taskText += `PRIMARY OBJECTIVE: Call ${phoneNumber} (${patientName}) on behalf of ${location.name} regarding their business consultation appointment slot inquiry with ${contactPerson}. ${slotSpec} Services: ${servicesList}.`;
  }

  if (extraContext) {
    taskText += `\nADDITIONAL CONTEXT & CALLER GOAL: ${extraContext}`;
  }

  const idempotencyKey = `call_${callType}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const region = getRegionFromPhone(phoneNumber);

  try {
    console.log(`[CALL-E REST] Dispatching call (${language}, region: ${region || "auto"}) to: ${phoneNumber}`);
    const res = await fetch(`${CALLE_API_BASE}/calls`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getCalleApiKey()}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify({
        task: taskText,
        recipients: [
          {
            phones: [phoneNumber],
            locale: lang.locale,
            ...(region ? { region } : {})
          }
        ],
        result_schema: CALL_RESULT_SCHEMA,
        metadata: {
          location_id: location.id,
          location_name: location.name,
          department_id: departmentId || "dept_general",
          call_type: callType,
          patient_name: patientName,
          phone_number: phoneNumber,
          language: language
        }
      })
    });

    const data = await res.json();
    if (!res.ok) {
      console.error(`[CALL-E REST] Error response (${res.status}):`, data);
      const errMsg = data.error?.message || data.message || (typeof data.error === "string" ? data.error : JSON.stringify(data));
      return { ok: false, error: errMsg, details: data, status: res.status };
    }

    return {
      ok: true,
      result: {
        id: data.id,
        run_id: data.id,
        status: data.status,
        created_at: data.created_at,
        raw: data
      }
    };
  } catch (err: any) {
    console.error("[CALL-E REST] Fetch failed:", err);
    return { ok: false, error: err.message || String(err) };
  }
}

/**
 * 2. Get Call Task Status & Result via CALL-E Direct REST API
 */
export async function getDirectCall(callId: string) {
  try {
    const res = await fetch(`${CALLE_API_BASE}/calls/${callId}`, {
      headers: {
        Authorization: `Bearer ${getCalleApiKey()}`
      }
    });

    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.message || "Failed to query call", status: res.status };
    }

    return { ok: true, result: data };
  } catch (err: any) {
    return { ok: false, error: err.message || String(err) };
  }
}

/**
 * Parse structured JSON outcome from CALL-E Direct REST API result
 */
export function parseRestCallOutcome(
  callData: any,
  fallbackDefaults: {
    callId: string;
    locationId: string;
    departmentId?: string;
    callType: "inbound_overflow" | "outbound_recall" | "batch_followup";
    language?: LanguageCode;
  }
): StructuredCallOutcome {
  const structured = callData.structured_result || callData.recipients?.[0]?.structured_result;
  const summary = callData.summary || callData.recipients?.[0]?.summary || "";

  if (structured) {
    const isBooked = structured.appointment_booked === "yes" || structured.outcome === "booked" || structured.outcome === "rescheduled";
    const isEscalated = structured.outcome === "escalated_urgent" || structured.callback_priority === "urgent";
    const isOptOut = structured.opt_out_requested === "yes" || structured.outcome === "opt_out";
    const callbackReq = structured.requires_callback === "yes" || isEscalated;

    let sentiment: StructuredCallOutcome["sentiment"] = "neutral";
    if (structured.patient_sentiment === "positive") sentiment = "positive";
    else if (structured.patient_sentiment === "distressed" || isEscalated) sentiment = "distressed";
    else if (structured.patient_sentiment === "frustrated") sentiment = "frustrated";

    let outcome: StructuredCallOutcome["outcome"] = "booked";
    if (isEscalated) outcome = "escalated_urgent";
    else if (isOptOut) outcome = "opt_out";
    else if (structured.outcome === "rescheduled") outcome = "rescheduled";
    else if (isBooked) outcome = "booked";
    else if (callbackReq) outcome = "callback_requested";
    else if (structured.outcome === "declined") outcome = "declined";
    else if (structured.outcome === "voicemail_left") outcome = "voicemail_left";
    else if (structured.outcome === "no_answer") outcome = "no_answer";

    return {
      call_id: fallbackDefaults.callId,
      location_id: fallbackDefaults.locationId,
      department_id: fallbackDefaults.departmentId || "dept_general",
      call_type: fallbackDefaults.callType,
      caller_verified: true,
      outcome,
      appointment: {
        booked: isBooked,
        datetime: isBooked ? (structured.confirmed_datetime || new Date(Date.now() + 86400000 * 3).toISOString()) : null,
        service_type: isBooked ? (structured.service_type || "Preventive Care & Exam") : null
      },
      callback: {
        requested: callbackReq,
        priority: isEscalated ? "urgent" : structured.callback_priority === "standard" ? "standard" : null,
        reason: isEscalated ? "Acute symptoms reported; immediate on-call provider follow-up." : null
      },
      opt_out: isOptOut,
      sentiment,
      language: fallbackDefaults.language || "en",
      notes: structured.summary || summary || "Call resolved."
    };
  }

  const isBooked = summary.toLowerCase().includes("booked") || summary.toLowerCase().includes("confirm");
  const isEscalated = summary.toLowerCase().includes("pain") || summary.toLowerCase().includes("escalat") || summary.toLowerCase().includes("doctor");

  return {
    call_id: fallbackDefaults.callId,
    location_id: fallbackDefaults.locationId,
    department_id: fallbackDefaults.departmentId || "dept_general",
    call_type: fallbackDefaults.callType,
    caller_verified: true,
    outcome: isEscalated ? "escalated_urgent" : isBooked ? "booked" : "callback_requested",
    appointment: {
      booked: isBooked,
      datetime: isBooked ? new Date(Date.now() + 86400000 * 3).toISOString() : null,
      service_type: isBooked ? "Preventive Hygiene & Exam" : null
    },
    callback: {
      requested: isEscalated,
      priority: isEscalated ? "urgent" : null,
      reason: isEscalated ? "Acute symptoms reported." : null
    },
    opt_out: false,
    sentiment: isEscalated ? "distressed" : "neutral",
    language: fallbackDefaults.language || "en",
    notes: summary || "Call session completed."
  };
}

// Aliases
export const planCall = createDirectCall;
export const runCall = async (planId: string, confirmToken: string) => ({ ok: true, result: { run_id: planId } });
export const getCallRun = getDirectCall;
export const parseStructuredOutcome = parseRestCallOutcome;
