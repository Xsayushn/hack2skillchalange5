import { describe, it, expect } from 'vitest';
import { exportService } from '../services/exportService';
import { INITIAL_EVENTS } from '../data/mockEvents';

describe('exportService - Calendar & Document Generation', () => {
  const event = INITIAL_EVENTS[0];

  it('generates valid RFC 5545 iCalendar .ics format with all timeline items', () => {
    const ics = exportService.generateIcs(event);

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//CelebrAIte//Smart Event Planning Assistant//EN');
    expect(ics).toContain('METHOD:PUBLISH');

    // Contains main event event
    expect(ics).toContain(`UID:main-${event.id}@celebr-ai-te.app`);
    expect(ics).toContain('SUMMARY:🎉');

    // Contains each timeline item
    event.timelineItems.forEach((item) => {
      expect(ics).toContain(`[${item.phase.replace('_', ' ').toUpperCase()}]`);
    });

    expect(ics).toContain('END:VCALENDAR');
  });

  it('generates a comprehensive Markdown Master Dossier', () => {
    const md = exportService.generateMarkdownDossier(event);

    expect(md).toContain(`# ${event.title}`);
    expect(md).toContain('Master Planning Blueprint');
    expect(md).toContain('Budget & Financial Summary');
    expect(md).toContain('Line Items');
    expect(md).toContain('Timeline & Schedule of Events');
    expect(md).toContain('Vendor Directory');
    expect(md).toContain(event.personalizedIdeas.themeName);

    // Includes vendors
    event.vendors.forEach((v) => {
      expect(md).toContain(v.name);
    });

    // Includes color palette
    event.personalizedIdeas.colorPalette.forEach((c) => {
      expect(md).toContain(c.hex);
    });
  });

  it('escapes reserved iCal characters properly', () => {
    const escaped = exportService.escapeIcs('Hello; World, How are you?\nNext line');
    expect(escaped).toBe('Hello\\; World\\, How are you?\\nNext line');
  });

  it('calculates non-zero-day duration for all-day milestones (DTEND = DTSTART + 1 day)', () => {
    const milestoneItem =
      event.timelineItems.find((i) => i.phase !== 'day_of') || event.timelineItems[0];
    const timing = exportService.resolveTimelineTiming(
      milestoneItem,
      new Date('2026-10-24T00:00:00Z')
    );

    expect(timing.dtstart).toContain('DTSTART;VALUE=DATE:');
    expect(timing.dtend).toContain('DTEND;VALUE=DATE:');
    // Ensure start and end date are not identical (RFC 5545 non-inclusive end date requirement)
    expect(timing.dtstart).not.toBe(timing.dtend);
  });
});
