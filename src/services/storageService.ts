import { EventPlan, AISettings } from '../types';
import { INITIAL_EVENTS } from '../data/mockEvents';

const STORAGE_KEYS = {
  EVENTS: 'celebr_ai_te_events_v1',
  ACTIVE_EVENT_ID: 'celebr_ai_te_active_id_v1',
  AI_SETTINGS: 'celebr_ai_te_ai_settings_v1',
  THEME: 'celebr_ai_te_theme_v1'
};

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

  loadAISettings(): AISettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AI_SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return {
      apiKey: '',
      model: 'gemini-1.5-flash',
      useOfflineFallback: true
    };
  },

  saveAISettings(settings: AISettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(settings));
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
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      events
    };
    return JSON.stringify(payload, null, 2);
  },

  importDataJson(jsonString: string): { success: boolean; error?: string; count?: number } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.events)) {
        return { success: false, error: 'Invalid file format: "events" array is required.' };
      }
      // Basic schema sanitation
      const sanitizedEvents: EventPlan[] = parsed.events.filter((ev: any) => 
        typeof ev.id === 'string' && typeof ev.title === 'string' && typeof ev.type === 'string'
      );

      if (sanitizedEvents.length === 0) {
        return { success: false, error: 'No valid event plans found in the provided file.' };
      }

      this.saveEvents(sanitizedEvents);
      if (sanitizedEvents[0]) {
        this.saveActiveEventId(sanitizedEvents[0].id);
      }
      return { success: true, count: sanitizedEvents.length };
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
