import {
  EventPlan,
  EventType,
  BudgetCategory,
  PaymentStatus,
  TimelinePhase,
  VendorStatus,
  RsvpStatus
} from '../types';

export const ALLOWED_EVENT_TYPES: EventType[] = [
  'wedding',
  'birthday',
  'community',
  'corporate',
  'anniversary',
  'festival'
];

export interface ValidationResult {
  success: boolean;
  error?: string;
  events?: EventPlan[];
}

/**
 * Validates and sanitizes imported JSON backup data.
 * Performs structural verification on all properties and nested arrays
 * to prevent runtime crashes and malformed data persistence.
 */
export function validateAndSanitizeImport(jsonString: string): ValidationResult {
  if (!jsonString || typeof jsonString !== 'string') {
    return { success: false, error: 'Empty or invalid JSON payload.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : 'Malformed JSON string.';
    return { success: false, error: errMsg };
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !('events' in parsed) ||
    !Array.isArray((parsed as Record<string, unknown>).events)
  ) {
    return {
      success: false,
      error: 'Invalid file schema: Root object must contain an "events" array.'
    };
  }

  const rawEvents = (parsed as { events: unknown[] }).events;

  if (rawEvents.length === 0) {
    return { success: false, error: 'The provided backup contains an empty "events" array.' };
  }

  const validatedEvents: EventPlan[] = [];

  for (let i = 0; i < rawEvents.length; i++) {
    const ev = rawEvents[i] as Record<string, unknown>;
    if (!ev || typeof ev !== 'object') continue;

    // Core identity checks
    if (typeof ev.id !== 'string' || !ev.id.trim()) continue;
    if (typeof ev.title !== 'string' || !ev.title.trim()) continue;
    if (!ALLOWED_EVENT_TYPES.includes(ev.type as EventType)) continue;

    // Validate nested collections: reject null or primitive entries
    if (Array.isArray(ev.budgetItems)) {
      for (const b of ev.budgetItems) {
        if (!b || typeof b !== 'object') {
          return { success: false, error: 'Malformed budget item detected in imported event.' };
        }
      }
    }
    if (Array.isArray(ev.timelineItems)) {
      for (const t of ev.timelineItems) {
        if (!t || typeof t !== 'object') {
          return {
            success: false,
            error: 'Malformed timeline item detected in imported event.'
          };
        }
      }
    }
    if (Array.isArray(ev.vendors)) {
      for (const v of ev.vendors) {
        if (!v || typeof v !== 'object') {
          return { success: false, error: 'Malformed vendor item detected in imported event.' };
        }
      }
    }
    if (Array.isArray(ev.guests)) {
      for (const g of ev.guests) {
        if (!g || typeof g !== 'object') {
          return { success: false, error: 'Malformed guest item detected in imported event.' };
        }
      }
    }

    const rawIdeas = (
      ev.personalizedIdeas && typeof ev.personalizedIdeas === 'object' ? ev.personalizedIdeas : {}
    ) as Record<string, unknown>;

    // Deep sanitized structure
    const sanitizedEvent: EventPlan = {
      id: String(ev.id),
      title: String(ev.title),
      type: ev.type as EventType,
      date:
        typeof ev.date === 'string' && ev.date ? ev.date : new Date().toISOString().split('T')[0],
      targetGuests:
        typeof ev.targetGuests === 'number' && ev.targetGuests > 0 ? ev.targetGuests : 50,
      location: typeof ev.location === 'string' ? ev.location : 'Main Venue',
      vibe: typeof ev.vibe === 'string' ? ev.vibe : 'Celebratory',
      totalBudget:
        typeof ev.totalBudget === 'number' && ev.totalBudget >= 0 ? ev.totalBudget : 5000,
      currency: typeof ev.currency === 'string' ? ev.currency : 'USD',
      currencySymbol: typeof ev.currencySymbol === 'string' ? ev.currencySymbol : '$',
      notes: typeof ev.notes === 'string' ? ev.notes : '',
      createdAt: typeof ev.createdAt === 'string' ? ev.createdAt : new Date().toISOString(),
      updatedAt: typeof ev.updatedAt === 'string' ? ev.updatedAt : new Date().toISOString(),

      budgetItems: Array.isArray(ev.budgetItems)
        ? ev.budgetItems.map((b: Record<string, unknown>, bIdx: number) => ({
            id: typeof b.id === 'string' ? b.id : `bi-${bIdx}`,
            category:
              typeof b.category === 'string'
                ? (b.category as BudgetCategory)
                : ('Venue & Rentals' as BudgetCategory),
            name: typeof b.name === 'string' ? b.name : 'Expense Item',
            estimatedCost: typeof b.estimatedCost === 'number' ? Math.max(0, b.estimatedCost) : 0,
            actualCost: typeof b.actualCost === 'number' ? Math.max(0, b.actualCost) : 0,
            paidCost: typeof b.paidCost === 'number' ? Math.max(0, b.paidCost) : 0,
            status:
              typeof b.status === 'string' &&
              ['planned', 'deposit_paid', 'paid_in_full'].includes(b.status)
                ? (b.status as PaymentStatus)
                : ('planned' as PaymentStatus),
            notes: typeof b.notes === 'string' ? b.notes : ''
          }))
        : [],

      timelineItems: Array.isArray(ev.timelineItems)
        ? ev.timelineItems.map((t: Record<string, unknown>, tIdx: number) => ({
            id: typeof t.id === 'string' ? t.id : `tl-${tIdx}`,
            phase:
              typeof t.phase === 'string' &&
              ['foundation', 'bookings', 'final_prep', 'day_of'].includes(t.phase)
                ? (t.phase as TimelinePhase)
                : ('foundation' as TimelinePhase),
            title: typeof t.title === 'string' ? t.title : 'Milestone Task',
            description: typeof t.description === 'string' ? t.description : '',
            targetDateOrTime:
              typeof t.targetDateOrTime === 'string' ? t.targetDateOrTime : 'Scheduled',
            completed: Boolean(t.completed),
            priority:
              typeof t.priority === 'string' && ['high', 'medium', 'low'].includes(t.priority)
                ? (t.priority as 'high' | 'medium' | 'low')
                : 'medium'
          }))
        : [],

      vendors: Array.isArray(ev.vendors)
        ? ev.vendors.map((v: Record<string, unknown>, vIdx: number) => ({
            id: typeof v.id === 'string' ? v.id : `v-${vIdx}`,
            category:
              typeof v.category === 'string'
                ? (v.category as BudgetCategory)
                : ('Catering & Bar' as BudgetCategory),
            name: typeof v.name === 'string' ? v.name : 'Vendor Partner',
            contactPerson:
              typeof v.contactPerson === 'string' ? v.contactPerson : 'Lead Coordinator',
            email: typeof v.email === 'string' ? v.email : '',
            phone: typeof v.phone === 'string' ? v.phone : '',
            status:
              typeof v.status === 'string' &&
              ['researching', 'contacted', 'quoted', 'booked', 'completed'].includes(v.status)
                ? (v.status as VendorStatus)
                : ('researching' as VendorStatus),
            quotedCost: typeof v.quotedCost === 'number' ? Math.max(0, v.quotedCost) : 0,
            agreedCost: typeof v.agreedCost === 'number' ? Math.max(0, v.agreedCost) : 0,
            notes: typeof v.notes === 'string' ? v.notes : '',
            keyQuestions: Array.isArray(v.keyQuestions)
              ? v.keyQuestions.filter((q: unknown): q is string => typeof q === 'string')
              : []
          }))
        : [],

      personalizedIdeas: {
        themeName: typeof rawIdeas.themeName === 'string' ? rawIdeas.themeName : 'Custom Aesthetic',
        themeDescription:
          typeof rawIdeas.themeDescription === 'string' ? rawIdeas.themeDescription : '',
        colorPalette: Array.isArray(rawIdeas.colorPalette)
          ? rawIdeas.colorPalette.filter(
              (c: unknown): c is { name: string; hex: string } =>
                typeof c === 'object' &&
                c !== null &&
                'name' in c &&
                'hex' in c &&
                typeof (c as Record<string, unknown>).name === 'string' &&
                typeof (c as Record<string, unknown>).hex === 'string'
            )
          : [],
        activities: Array.isArray(rawIdeas.activities)
          ? rawIdeas.activities
              .filter(
                (a: unknown): a is Record<string, unknown> => typeof a === 'object' && a !== null
              )
              .map((a: Record<string, unknown>) => ({
                name: typeof a.name === 'string' ? a.name : 'Activity',
                description: typeof a.description === 'string' ? a.description : '',
                targetAudience: typeof a.targetAudience === 'string' ? a.targetAudience : 'All',
                duration: typeof a.duration === 'string' ? a.duration : '30 mins'
              }))
          : [],
        cateringHighlights: Array.isArray(rawIdeas.cateringHighlights)
          ? rawIdeas.cateringHighlights.filter((h: unknown): h is string => typeof h === 'string')
          : [],
        playlistVibe:
          rawIdeas.playlistVibe && typeof rawIdeas.playlistVibe === 'object'
            ? {
                mood: String(
                  (rawIdeas.playlistVibe as Record<string, unknown>).mood || 'Celebratory'
                ),
                sampleTracks: Array.isArray(
                  (rawIdeas.playlistVibe as Record<string, unknown>).sampleTracks
                )
                  ? ((rawIdeas.playlistVibe as Record<string, unknown>).sampleTracks as string[])
                  : []
              }
            : { mood: 'Celebratory', sampleTracks: [] },
        customSpeeches: Array.isArray(rawIdeas.customSpeeches)
          ? rawIdeas.customSpeeches
              .filter(
                (s: unknown): s is Record<string, unknown> => typeof s === 'object' && s !== null
              )
              .map((s: Record<string, unknown>) => ({
                title: typeof s.title === 'string' ? s.title : 'Speech',
                role: typeof s.role === 'string' ? s.role : 'Host',
                text: typeof s.text === 'string' ? s.text : ''
              }))
          : [],
        decorSuggestions: Array.isArray(rawIdeas.decorSuggestions)
          ? (rawIdeas.decorSuggestions as string[])
          : [],
        costSavingTips: Array.isArray(rawIdeas.costSavingTips)
          ? (rawIdeas.costSavingTips as string[])
          : []
      },

      guests: Array.isArray(ev.guests)
        ? ev.guests.map((g: Record<string, unknown>, gIdx: number) => ({
            id: typeof g.id === 'string' ? g.id : `g-${gIdx}`,
            name: typeof g.name === 'string' ? g.name : 'Guest',
            group: typeof g.group === 'string' ? g.group : 'General',
            rsvpStatus:
              typeof g.rsvpStatus === 'string' &&
              ['confirmed', 'declined', 'pending'].includes(g.rsvpStatus)
                ? (g.rsvpStatus as RsvpStatus)
                : ('pending' as RsvpStatus),
            dietaryNotes: typeof g.dietaryNotes === 'string' ? g.dietaryNotes : 'None',
            plusOnes: typeof g.plusOnes === 'number' ? Math.max(0, g.plusOnes) : 0,
            tableOrZone: typeof g.tableOrZone === 'string' ? g.tableOrZone : 'Unassigned'
          }))
        : []
    };

    validatedEvents.push(sanitizedEvent);
  }

  if (validatedEvents.length === 0) {
    return { success: false, error: 'No structurally valid event plans found in file.' };
  }

  return { success: true, events: validatedEvents };
}
