/**
 * lib/omnichannel.ts
 * Client-safe Omnichannel WhatsApp & SMS Utility Functions
 */

import { LanguageCode } from "./types";

/**
 * Generate a direct WhatsApp deep-link URL (wa.me)
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = (phone || "").replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent(message);
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
}

/**
 * Generate localized post-call confirmation messages
 */
export function generateLocalizedFollowUpMessage(params: {
  callerName: string;
  branchName: string;
  serviceType?: string;
  datetime?: string;
  language?: LanguageCode;
}): string {
  const lang = params.language || "en";
  const name = params.callerName || "Valued Customer";
  const branch = params.branchName || "Apex Operations";
  const service = params.serviceType || "Appointment";
  const timeStr = params.datetime ? new Date(params.datetime).toLocaleString() : "your requested time";

  switch (lang) {
    case "hi":
      return `नमस्ते ${name}! ${branch} में आपका ${service} अपॉइंटमेंट ${timeStr} के लिए सफलतापूर्वक कन्फर्म हो गया है। अधिक जानकारी के लिए हमसे संपर्क करें।`;
    case "ne":
      return `नमस्ते ${name}! ${branch} मा तपाईंको ${service} अपोइन्टमेन्ट ${timeStr} को लागि सफलतापूर्वक तय गरिएको छ। धन्यवाद।`;
    case "es":
      return `¡Hola ${name}! Su cita de ${service} en ${branch} ha sido confirmada para ${timeStr}. ¡Gracias por confiar en nosotros!`;
    default:
      return `Hello ${name}! Your ${service} appointment with ${branch} has been confirmed for ${timeStr}. We look forward to seeing you!`;
  }
}
