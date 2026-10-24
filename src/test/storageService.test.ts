import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../services/storageService';
import { INITIAL_EVENTS } from '../data/mockEvents';

describe('storageService - Client Persistence & Schema Validation', () => {
  beforeEach(() => {
    localStorage.clear();
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

  it('handles theme loading and switching', () => {
    expect(storageService.loadTheme()).toBe('dark'); // default
    storageService.saveTheme('light');
    expect(storageService.loadTheme()).toBe('light');
    storageService.saveTheme('contrast');
    expect(storageService.loadTheme()).toBe('contrast');
  });
});
