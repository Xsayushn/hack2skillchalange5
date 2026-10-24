import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../services/storageService';
import { DEFAULT_AI_MODEL } from '../services/aiPlannerEngine';
import { INITIAL_EVENTS } from '../data/mockEvents';

describe('storageService - Client Persistence & Schema Validation', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('loads starter events if storage is empty', () => {
    const events = storageService.loadEvents();
    expect(events.length).toBe(3);
    expect(events[0].id).toBe('event-wedding-01');
    expect(events[1].id).toBe('event-birthday-02');
    expect(events[2].id).toBe('event-community-03');
  });

  it('saves and loads customized events', () => {
    const customEvents = [
      {
        ...INITIAL_EVENTS[0],
        title: 'Custom Test Gala',
        totalBudget: 99999
      }
    ];

    storageService.saveEvents(customEvents);
    const loaded = storageService.loadEvents();

    expect(loaded.length).toBe(1);
    expect(loaded[0].title).toBe('Custom Test Gala');
    expect(loaded[0].totalBudget).toBe(99999);
  });

  it('exports valid JSON and validates schema on import', () => {
    const jsonStr = storageService.exportAllDataJson();
    expect(jsonStr).toContain('CelebrAIte');
    expect(jsonStr).toContain('events');

    // Valid import
    const result = storageService.importDataJson(jsonStr);
    expect(result.success).toBe(true);
    expect(result.count).toBe(3);

    // Invalid JSON test
    const invalidResult = storageService.importDataJson('{ "invalid": true }');
    expect(invalidResult.success).toBe(false);
    expect(invalidResult.error).toContain('events');

    // Malformed JSON test
    const malformedResult = storageService.importDataJson('not a json');
    expect(malformedResult.success).toBe(false);
  });

  it('rejects malformed nested collections on import without overwriting stored events', () => {
    storageService.saveEvents(INITIAL_EVENTS);

    // Malformed budget item: [null]
    const malformedBudgetPayload = JSON.stringify({
      events: [
        {
          id: 'test-event-1',
          title: 'Test Event with Null Item',
          type: 'wedding',
          budgetItems: [null]
        }
      ]
    });

    const res = storageService.importDataJson(malformedBudgetPayload);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Malformed budget item');

    // Ensure previous data in storage was NOT overwritten
    const preservedEvents = storageService.loadEvents();
    expect(preservedEvents.length).toBe(INITIAL_EVENTS.length);
    expect(preservedEvents[0].id).toBe(INITIAL_EVENTS[0].id);

    // Malformed timeline item: [null]
    const malformedTimelinePayload = JSON.stringify({
      events: [
        {
          id: 'test-event-2',
          title: 'Test Event with Null Timeline',
          type: 'birthday',
          timelineItems: [null]
        }
      ]
    });
    const timelineRes = storageService.importDataJson(malformedTimelinePayload);
    expect(timelineRes.success).toBe(false);
    expect(timelineRes.error).toContain('Malformed timeline item');
  });

  it('migrates retired or invalid AI models to DEFAULT_AI_MODEL', () => {
    // Simulate user having an old retired model in localStorage
    localStorage.setItem('celebr_ai_te_model', 'gemini-1.0-ultra-retired');
    const settings = storageService.loadAISettings();
    expect(settings.model).toBe(DEFAULT_AI_MODEL);

    // Saving an invalid model should automatically sanitize to DEFAULT_AI_MODEL
    storageService.saveAISettings({
      apiKey: 'test-key',
      model: 'completely-invalid-model-xyz',
      useOfflineFallback: true
    });
    const refreshed = storageService.loadAISettings();
    expect(refreshed.model).toBe(DEFAULT_AI_MODEL);
    expect(refreshed.apiKey).toBe('test-key');
  });

  it('handles theme loading and switching', () => {
    expect(storageService.loadTheme()).toBe('dark'); // default
    storageService.saveTheme('light');
    expect(storageService.loadTheme()).toBe('light');
    storageService.saveTheme('contrast');
    expect(storageService.loadTheme()).toBe('contrast');
  });
});
