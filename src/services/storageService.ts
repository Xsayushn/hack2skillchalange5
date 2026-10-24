import { EventPlan, AISettings } from '../types';
import { INITIAL_EVENTS } from '../data/mockEvents';
import { DEFAULT_AI_MODEL, ALLOWED_MODELS } from './aiPlannerEngine';
import { validateAndSanitizeImport } from './schemaValidator';

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

/**
 * Storage management service for CelebrAIte.
 * Manages offline persistence with localStorage and isolated sessionStorage credentials.
 */
export const storageService = {
  /**
   * Loads saved event plans from persistent storage, falling back to starter templates.
   */
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

  /**
   * Persists an array of event plans to local storage.
   */
  saveEvents(events: EventPlan[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (err) {
      console.error('Failed to save events to storage', err);
    }
  },

  /**
   * Retrieves the currently active event ID.
   */
  getActiveEventId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID) || 'event-wedding-01';
  },

  /**
   * Updates the currently active event ID in local storage.
   */
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
      // Actively purge any legacy localStorage key to ensure complete storage isolation
      localStorage.removeItem('celebr_ai_te_api_key_legacy');
    } catch {
      // sessionStorage restricted fallback
    }

    const rawModel = localStorage.getItem(STORAGE_KEYS.AI_MODEL);
    // Migration: If previously saved model is retired or not in ALLOWED_MODELS, seamlessly reset to DEFAULT_AI_MODEL
    const model = rawModel && ALLOWED_MODELS.includes(rawModel) ? rawModel : DEFAULT_AI_MODEL;
    const useOffline = localStorage.getItem(STORAGE_KEYS.AI_OFFLINE_FLAG) !== 'false';

    return {
      apiKey: key,
      model,
      useOfflineFallback: useOffline
    };
  },

  /**
   * Persists AI provider settings, keeping API keys exclusively in sessionStorage.
   */
  saveAISettings(settings: AISettings): void {
    try {
      if (settings.apiKey) {
        sessionStorage.setItem(SESSION_KEYS.API_KEY, settings.apiKey.trim());
      } else {
        sessionStorage.removeItem(SESSION_KEYS.API_KEY);
      }
      const validModel =
        settings.model && ALLOWED_MODELS.includes(settings.model)
          ? settings.model
          : DEFAULT_AI_MODEL;
      localStorage.setItem(STORAGE_KEYS.AI_MODEL, validModel);
      localStorage.setItem(STORAGE_KEYS.AI_OFFLINE_FLAG, String(settings.useOfflineFallback));
    } catch (err) {
      console.error('Failed to save AI settings', err);
    }
  },

  /**
   * Loads current UI theme mode ('dark' | 'light' | 'contrast').
   */
  loadTheme(): 'dark' | 'light' | 'contrast' {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (theme === 'light' || theme === 'contrast' || theme === 'dark') {
      return theme;
    }
    return 'dark';
  },

  /**
   * Persists user UI theme selection.
   */
  saveTheme(theme: 'dark' | 'light' | 'contrast'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  /**
   * Exports entire workspace to a portable JSON backup payload.
   */
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
   * Validates and imports JSON backup data into local storage.
   */
  importDataJson(jsonString: string): { success: boolean; error?: string; count?: number } {
    const result = validateAndSanitizeImport(jsonString);
    if (!result.success || !result.events) {
      return { success: false, error: result.error };
    }

    this.saveEvents(result.events);
    if (result.events[0]) {
      this.saveActiveEventId(result.events[0].id);
    }
    return { success: true, count: result.events.length };
  },

  /**
   * Resets workspace data to default starter templates.
   */
  resetToDefaults(): EventPlan[] {
    this.saveEvents(INITIAL_EVENTS);
    this.saveActiveEventId(INITIAL_EVENTS[0].id);
    return INITIAL_EVENTS;
  }
};
