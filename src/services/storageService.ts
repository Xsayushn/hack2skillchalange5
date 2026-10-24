import { EventPlan, AISettings, EventType, BudgetCategory, PaymentStatus, TimelinePhase, VendorStatus, RsvpStatus } from '../types';
import { INITIAL_EVENTS } from '../data/mockEvents';

const STORAGE_KEYS = {
  EVENTS: 'celebr_ai_te_events_v1',
  ACTIVE_EVENT_ID: 'celebr_ai_te_active_id_v1',
  AI_MODEL: 'celebr_ai_te_model_v1',
  AI_OFFLINE_FLAG: 'celebr_ai_te_offline_flag_v1',
  THEME: 'celebr_ai_te_theme_v1'
};

const SESSION_KEYS = {
  API_KEY: 'celebr_ai_te_api_key_session'
};

const ALLOWED_EVENT_TYPES: EventType[] = ['wedding', 'birthday', 'community', 'corporate', 'anniversary', 'festival'];

export const storageService = {
  loadEvents(): EventPlan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!data) {
        this.saveEvents(INITIAL_EVENTS);
        return INITIAL_EVENTS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return INITIAL_EVENTS;
    } catch (err) {
      console.warn('Failed to parse events from storage, restoring defaults', err);
      return INITIAL_EVENTS;
    }
  },

  saveEvents(events: EventPlan[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (err) {
      console.error('Failed to save events to storage', err);
    }
  },

  getActiveEventId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID) || 'event-wedding-01';
  },

  saveActiveEventId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id);
  },

  /**
   * Safe Session-Based API Key Handling:
   * The API Key is stored in sessionStorage (cleared when browser session ends),
   * preventing cross-session persistence in localStorage while maintaining convenience.
   */
  loadAISettings(): AISettings {
    let key = '';
    try {
      key = sessionStorage.getItem(SESSION_KEYS.API_KEY) || '';
      // Backward-compatible fallback check
      if (!key) {
        key = localStorage.getItem('celebr_ai_te_api_key_legacy') || '';
      }
    } catch {
      // sessionStorage restricted fallback
    }

    const model = localStorage.getItem(STORAGE_KEYS.AI_MODEL) || 'gemini-1.5-flash';
    const useOffline = localStorage.getItem(STORAGE_KEYS.AI_OFFLINE_FLAG) !== 'false';

    return {
      apiKey: key,
      model,
      useOfflineFallback: useOffline
    };
  },

  saveAISettings(settings: AISettings): void {
    try {
      // Store API Key strictly in sessionStorage
      if (settings.apiKey) {
        sessionStorage.setItem(SESSION_KEYS.API_KEY, settings.apiKey.trim());
      } else {
        sessionStorage.removeItem(SESSION_KEYS.API_KEY);
      }
      localStorage.setItem(STORAGE_KEYS.AI_MODEL, settings.model || 'gemini-1.5-flash');
      localStorage.setItem(STORAGE_KEYS.AI_OFFLINE_FLAG, String(settings.useOfflineFallback));
    } catch (err) {
      console.error('Failed to save AI settings', err);
    }
  },

  loadTheme(): 'dark' | 'light' | 'contrast' {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (theme === 'light' || theme === 'contrast' || theme === 'dark') {
      return theme;
    }
    return 'dark'; // Default sleek dark aesthetic
  },

  saveTheme(theme: 'dark' | 'light' | 'contrast'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  exportAllDataJson(): string {
    const events = this.loadEvents();
    const payload = {
      app: 'CelebrAIte',
      version: '1.1.0',
      exportedAt: new Date().toISOString(),
      events
    };
    return JSON.stringify(payload, null, 2);
  },

  /**
   * Deep Schema Validation for imported JSON to eliminate injection & UI crashes
   */
  importDataJson(jsonString: string): { success: boolean; error?: string; count?: number } {
    try {
      if (!jsonString || typeof jsonString !== 'string') {
        return { success: false, error: 'Empty or invalid JSON payload.' };
      }

      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.events)) {
        return { success: false, error: 'Invalid file schema: Root object must contain an "events" array.' };
      }

      if (parsed.events.length === 0) {
        return { success: false, error: 'The provided backup contains an empty "events" array.' };
      }

      const validatedEvents: EventPlan[] = [];

      for (let i = 0; i < parsed.events.length; i++) {
        const ev = parsed.events[i];
        if (!ev || typeof ev !== 'object') continue;

        // Core identity checks
        if (typeof ev.id !== 'string' || !ev.id.trim()) continue;
        if (typeof ev.title !== 'string' || !ev.title.trim()) continue;
        if (!ALLOWED_EVENT_TYPES.includes(ev.type)) continue;

        // Deep sanitized structure
        const sanitizedEvent: EventPlan = {
          id: String(ev.id),
          title: String(ev.title),
          type: ev.type,
          date: typeof ev.date === 'string' && ev.date ? ev.date : new Date().toISOString().split('T')[0],
          targetGuests: typeof ev.targetGuests === 'number' && ev.targetGuests > 0 ? ev.targetGuests : 50,
          location: typeof ev.location === 'string' ? ev.location : 'Main Venue',
          vibe: typeof ev.vibe === 'string' ? ev.vibe : 'Celebratory',
          totalBudget: typeof ev.totalBudget === 'number' && ev.totalBudget >= 0 ? ev.totalBudget : 5000,
          currency: typeof ev.currency === 'string' ? ev.currency : 'USD',
          currencySymbol: typeof ev.currencySymbol === 'string' ? ev.currencySymbol : '$',
          notes: typeof ev.notes === 'string' ? ev.notes : '',
          createdAt: typeof ev.createdAt === 'string' ? ev.createdAt : new Date().toISOString(),
          updatedAt: typeof ev.updatedAt === 'string' ? ev.updatedAt : new Date().toISOString(),

          // Deep arrays with fallbacks
          budgetItems: Array.isArray(ev.budgetItems) ? ev.budgetItems.map((b: any, bIdx: number) => ({
            id: typeof b.id === 'string' ? b.id : `bi-${bIdx}`,
            category: typeof b.category === 'string' ? b.category : ('Venue & Rentals' as BudgetCategory),
            name: typeof b.name === 'string' ? b.name : 'Expense Item',
            estimatedCost: typeof b.estimatedCost === 'number' ? Math.max(0, b.estimatedCost) : 0,
            actualCost: typeof b.actualCost === 'number' ? Math.max(0, b.actualCost) : 0,
            paidCost: typeof b.paidCost === 'number' ? Math.max(0, b.paidCost) : 0,
            status: ['planned', 'deposit_paid', 'paid_in_full'].includes(b.status) ? b.status : ('planned' as PaymentStatus),
            notes: typeof b.notes === 'string' ? b.notes : ''
          })) : [],

          timelineItems: Array.isArray(ev.timelineItems) ? ev.timelineItems.map((t: any, tIdx: number) => ({
            id: typeof t.id === 'string' ? t.id : `tl-${tIdx}`,
            phase: ['foundation', 'bookings', 'final_prep', 'day_of'].includes(t.phase) ? t.phase : ('foundation' as TimelinePhase),
            title: typeof t.title === 'string' ? t.title : 'Milestone Task',
            description: typeof t.description === 'string' ? t.description : '',
            targetDateOrTime: typeof t.targetDateOrTime === 'string' ? t.targetDateOrTime : 'Scheduled',
            completed: Boolean(t.completed),
            priority: ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium'
          })) : [],

          vendors: Array.isArray(ev.vendors) ? ev.vendors.map((v: any, vIdx: number) => ({
            id: typeof v.id === 'string' ? v.id : `v-${vIdx}`,
            category: typeof v.category === 'string' ? v.category : ('Catering & Bar' as BudgetCategory),
            name: typeof v.name === 'string' ? v.name : 'Vendor Partner',
            contactPerson: typeof v.contactPerson === 'string' ? v.contactPerson : 'Lead Coordinator',
            email: typeof v.email === 'string' ? v.email : '',
            phone: typeof v.phone === 'string' ? v.phone : '',
            status: ['researching', 'contacted', 'quoted', 'booked', 'completed'].includes(v.status) ? v.status : ('researching' as VendorStatus),
            quotedCost: typeof v.quotedCost === 'number' ? Math.max(0, v.quotedCost) : 0,
            agreedCost: typeof v.agreedCost === 'number' ? Math.max(0, v.agreedCost) : 0,
            notes: typeof v.notes === 'string' ? v.notes : '',
            keyQuestions: Array.isArray(v.keyQuestions) ? v.keyQuestions.filter((q: any) => typeof q === 'string') : []
          })) : [],

          personalizedIdeas: ev.personalizedIdeas && typeof ev.personalizedIdeas === 'object' ? {
            themeName: typeof ev.personalizedIdeas.themeName === 'string' ? ev.personalizedIdeas.themeName : 'Custom Aesthetic',
            themeDescription: typeof ev.personalizedIdeas.themeDescription === 'string' ? ev.personalizedIdeas.themeDescription : '',
            colorPalette: Array.isArray(ev.personalizedIdeas.colorPalette) ? ev.personalizedIdeas.colorPalette.filter((c: any) => c && typeof c.name === 'string' && typeof c.hex === 'string') : [],
            activities: Array.isArray(ev.personalizedIdeas.activities) ? ev.personalizedIdeas.activities : [],
            cateringHighlights: Array.isArray(ev.personalizedIdeas.cateringHighlights) ? ev.personalizedIdeas.cateringHighlights.filter((h: any) => typeof h === 'string') : [],
            playlistVibe: ev.personalizedIdeas.playlistVibe && typeof ev.personalizedIdeas.playlistVibe === 'object' ? {
              mood: String(ev.personalizedIdeas.playlistVibe.mood || 'Celebratory'),
              sampleTracks: Array.isArray(ev.personalizedIdeas.playlistVibe.sampleTracks) ? ev.personalizedIdeas.playlistVibe.sampleTracks : []
            } : { mood: 'Celebratory', sampleTracks: [] },
            customSpeeches: Array.isArray(ev.personalizedIdeas.customSpeeches) ? ev.personalizedIdeas.customSpeeches : [],
            decorSuggestions: Array.isArray(ev.personalizedIdeas.decorSuggestions) ? ev.personalizedIdeas.decorSuggestions : [],
            costSavingTips: Array.isArray(ev.personalizedIdeas.costSavingTips) ? ev.personalizedIdeas.costSavingTips : []
          } : {
            themeName: 'Celebration Theme',
            themeDescription: '',
            colorPalette: [],
            activities: [],
            cateringHighlights: [],
            playlistVibe: { mood: 'Celebratory', sampleTracks: [] },
            customSpeeches: [],
            decorSuggestions: [],
            costSavingTips: []
          },

          guests: Array.isArray(ev.guests) ? ev.guests.map((g: any, gIdx: number) => ({
            id: typeof g.id === 'string' ? g.id : `g-${gIdx}`,
            name: typeof g.name === 'string' ? g.name : 'Guest',
            group: typeof g.group === 'string' ? g.group : 'General',
            rsvpStatus: ['confirmed', 'declined', 'pending'].includes(g.rsvpStatus) ? g.rsvpStatus : ('pending' as RsvpStatus),
            dietaryNotes: typeof g.dietaryNotes === 'string' ? g.dietaryNotes : 'None',
            plusOnes: typeof g.plusOnes === 'number' ? Math.max(0, g.plusOnes) : 0,
            tableOrZone: typeof g.tableOrZone === 'string' ? g.tableOrZone : 'Unassigned'
          })) : []
        };

        validatedEvents.push(sanitizedEvent);
      }

      if (validatedEvents.length === 0) {
        return { success: false, error: 'No structurally valid event plans found in file.' };
      }

      this.saveEvents(validatedEvents);
      if (validatedEvents[0]) {
        this.saveActiveEventId(validatedEvents[0].id);
      }
      return { success: true, count: validatedEvents.length };
    } catch (e: any) {
      return { success: false, error: e.message || 'Malformed JSON string.' };
    }
  },

  resetToDefaults(): EventPlan[] {
    this.saveEvents(INITIAL_EVENTS);
    this.saveActiveEventId(INITIAL_EVENTS[0].id);
    return INITIAL_EVENTS;
  }
};
