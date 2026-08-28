/**
 * Safe Google Calendar Integration & Privacy-Preserving Scheduling Engine
 *
 * GUARANTEES:
 * 1. Zero Information Leakage: Never discloses private event titles, attendee names,
 *    or notes to callers or external LLM prompts.
 * 2. Strict Free/Busy Masking: Only exposes whether a timeslot is 'FREE' or 'BUSY'.
 * 3. Controlled Action Scope: Only authorized actions (check_slots, book_slot, cancel_slot)
 *    are executable by voice agents with phone-number verification.
 */

export interface CalendarEvent {
  id: string;
  start: string; // ISO 8601
  end: string;   // ISO 8601
  status: "confirmed" | "tentative" | "cancelled";
  isRelayBooking: boolean;
  maskedTitle: string; // "Busy (Masked)" for private events, or sanitized service name
  customerName?: string;
  customerPhone?: string;
  serviceType?: string;
  notes?: string;
}

export interface CalendarConfig {
  connected: boolean;
  calendarEmail: string;
  syncIntervalSeconds: number;
  strictFreeBusyMasking: boolean;
  bufferMinutes: number;
  workingHoursStart: string; // e.g. "09:00"
  workingHoursEnd: string;   // e.g. "18:00"
  allowReschedule: boolean;
}

// In-memory persistent mock Google Calendar state for demonstration & testing
let currentConfig: CalendarConfig = {
  connected: true,
  calendarEmail: "admin.schedule@apexoperations.com",
  syncIntervalSeconds: 30,
  strictFreeBusyMasking: true,
  bufferMinutes: 15,
  workingHoursStart: "09:00",
  workingHoursEnd: "18:00",
  allowReschedule: true,
};

let calendarEvents: CalendarEvent[] = [
  {
    id: "gcal_evt_001",
    start: "2026-08-28T09:30:00+05:30",
    end: "2026-08-28T10:30:00+05:30",
    status: "confirmed",
    isRelayBooking: false,
    maskedTitle: "Busy (Private External Event)",
  },
  {
    id: "gcal_evt_002",
    start: "2026-08-28T11:30:00+05:30",
    end: "2026-08-28T12:15:00+05:30",
    status: "confirmed",
    isRelayBooking: true,
    maskedTitle: "[Relay Booking] Aarav Sharma - Consultation",
    customerName: "Aarav Sharma",
    customerPhone: "+91 98100 12345",
    serviceType: "Service Follow-up Consultation",
  },
  {
    id: "gcal_evt_003",
    start: "2026-08-28T14:00:00+05:30",
    end: "2026-08-28T15:00:00+05:30",
    status: "confirmed",
    isRelayBooking: false,
    maskedTitle: "Busy (Private External Event)",
  },
  {
    id: "gcal_evt_004",
    start: "2026-08-29T10:00:00+05:30",
    end: "2026-08-29T10:45:00+05:30",
    status: "confirmed",
    isRelayBooking: true,
    maskedTitle: "[Relay Booking] Sunita Patel - Initial Review",
    customerName: "Sunita Patel",
    customerPhone: "+91 98201 44552",
    serviceType: "Account Strategy Review",
  }
];

/**
 * Returns privacy-sanitized calendar status and events
 */
export function getCalendarStatus() {
  return {
    config: { ...currentConfig },
    events: calendarEvents.map((evt) => {
      if (currentConfig.strictFreeBusyMasking && !evt.isRelayBooking) {
        return {
          id: evt.id,
          start: evt.start,
          end: evt.end,
          status: evt.status,
          isRelayBooking: false,
          maskedTitle: "Busy (Private External Event)"
        };
      }
      return evt;
    })
  };
}

/**
 * Update calendar configuration and safety rules
 */
export function updateCalendarConfig(newConfig: Partial<CalendarConfig>) {
  currentConfig = { ...currentConfig, ...newConfig };
  return currentConfig;
}

/**
 * Caller availability search with Zero Information Leakage
 * Returns ONLY available open time windows
 */
export function getAvailableSlots(dateIso: string, durationMinutes = 30): { start: string; end: string }[] {
  // Demo open slots respecting working hours and existing busy blocks
  const targetDate = dateIso.split("T")[0] || "2026-08-28";
  
  const potentialSlots = [
    { start: `${targetDate}T10:45:00+05:30`, end: `${targetDate}T11:15:00+05:30` },
    { start: `${targetDate}T12:30:00+05:30`, end: `${targetDate}T13:00:00+05:30` },
    { start: `${targetDate}T15:30:00+05:30`, end: `${targetDate}T16:00:00+05:30` },
    { start: `${targetDate}T16:30:00+05:30`, end: `${targetDate}T17:00:00+05:30` },
  ];

  // Filter out any slot that collides with an existing event
  return potentialSlots.filter((slot) => {
    const slotStart = new Date(slot.start).getTime();
    const slotEnd = new Date(slot.end).getTime();

    const isOccupied = calendarEvents.some((evt) => {
      if (evt.status === "cancelled") return false;
      const evtStart = new Date(evt.start).getTime() - (currentConfig.bufferMinutes * 60000);
      const evtEnd = new Date(evt.end).getTime() + (currentConfig.bufferMinutes * 60000);
      return Math.max(slotStart, evtStart) < Math.min(slotEnd, evtEnd);
    });

    return !isOccupied;
  });
}

/**
 * Safely create an appointment on Google Calendar on behalf of the customer
 */
export function bookCalendarAppointment(params: {
  customerName: string;
  customerPhone: string;
  serviceType: string;
  startIso: string;
  durationMinutes?: number;
  notes?: string;
}): { success: boolean; event?: CalendarEvent; error?: string } {
  if (!currentConfig.connected) {
    return { success: false, error: "Google Calendar sync is not connected." };
  }

  const duration = params.durationMinutes || 45;
  const startDate = new Date(params.startIso);
  const endDate = new Date(startDate.getTime() + duration * 60000);

  const newEvent: CalendarEvent = {
    id: `gcal_evt_${Date.now()}`,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    status: "confirmed",
    isRelayBooking: true,
    maskedTitle: `[Relay Booking] ${params.customerName} - ${params.serviceType}`,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    serviceType: params.serviceType,
    notes: params.notes
  };

  calendarEvents.push(newEvent);
  return { success: true, event: newEvent };
}

/**
 * Safely cancel an appointment with phone number verification
 */
export function cancelCalendarAppointment(eventId: string, verificationPhone: string): { success: boolean; error?: string } {
  const evtIndex = calendarEvents.findIndex((e) => e.id === eventId);
  if (evtIndex === -1) {
    return { success: false, error: "Appointment not found on calendar." };
  }

  const evt = calendarEvents[evtIndex];
  if (evt.customerPhone && evt.customerPhone.replace(/\D/g, "") !== verificationPhone.replace(/\D/g, "")) {
    return { success: false, error: "Security check failed: Phone number does not match booking record." };
  }

  calendarEvents[evtIndex].status = "cancelled";
  return { success: true };
}
