import { EventPlan, TimelineItem } from '../types';

/**
 * Service for exporting event plans across formats: RFC 5545 iCalendar (.ics),
 * JSON data files, Markdown dossiers, and print stylesheets.
 */
export const exportService = {
  /**
   * Generates a valid RFC 5545 iCalendar (.ics) string containing master event details,
   * phased timeline milestones, and day-of run-of-show calendar entries with reminder alarms.
   *
   * @param event - The complete active EventPlan
   * @returns An RFC 5545 formatted iCalendar string
   */
  generateIcs(event: EventPlan): string {
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const baseEventDate = new Date(event.date + 'T00:00:00');

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CelebrAIte//Smart Event Planning Assistant//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${this.escapeIcs(event.title)}`,
      `X-WR-TIMEZONE:UTC`
    ];

    // Main Master Event entry
    const cleanDate = this.formatDateOnly(baseEventDate);
    lines.push(
      'BEGIN:VEVENT',
      `UID:main-${event.id}@celebr-ai-te.app`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${cleanDate}`,
      `SUMMARY:🎉 ${this.escapeIcs(event.title)}`,
      `DESCRIPTION:${this.escapeIcs(`Main Celebration Day! Theme: ${event.personalizedIdeas.themeName}. Location: ${event.location}`)}`,
      `LOCATION:${this.escapeIcs(event.location)}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Event Day is Today!',
      'TRIGGER:-PT2H',
      'END:VALARM',
      'END:VEVENT'
    );

    // Timeline items with intelligent date/time resolution
    event.timelineItems.forEach((item, index) => {
      const timing = this.resolveTimelineTiming(item, baseEventDate);

      lines.push(
        'BEGIN:VEVENT',
        `UID:timeline-${event.id}-${item.id || index}@celebr-ai-te.app`,
        `DTSTAMP:${now}`,
        timing.dtstart,
        timing.dtend,
        `SUMMARY:[${item.phase.replace('_', ' ').toUpperCase()}] ${this.escapeIcs(item.title)}`,
        `DESCRIPTION:${this.escapeIcs(`${item.description} (Slot: ${item.targetDateOrTime})`)}`,
        `STATUS:${item.completed ? 'COMPLETED' : 'CONFIRMED'}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:Reminder: ${this.escapeIcs(item.title)}`,
        'TRIGGER:-PT15M',
        'END:VALARM',
        'END:VEVENT'
      );
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  },

  /**
   * Resolves milestone dates relative to the event date or calculates precise day-of times
   * suitable for iCalendar DTSTART and DTEND fields.
   *
   * @param item - The timeline item
   * @param eventDate - The master date of the event
   * @returns Object containing formatted dtstart and dtend string entries
   */
  resolveTimelineTiming(item: TimelineItem, eventDate: Date): { dtstart: string; dtend: string } {
    const rawTime = (item.targetDateOrTime || '').trim();

    // 1. Day-of Phase: Parse specific clock times (e.g., "09:00 AM", "01:30 PM", "09:00 AM - 11:30 AM")
    if (item.phase === 'day_of') {
      const timeMatch = rawTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const mins = parseInt(timeMatch[2], 10);
        const modifier = timeMatch[3] ? timeMatch[3].toUpperCase() : null;

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const startDt = new Date(eventDate);
        startDt.setHours(hours, mins, 0, 0);

        const endDt = new Date(startDt);
        endDt.setHours(startDt.getHours() + 1); // 1 hour duration default

        const startStr = this.formatDateTimeUtc(startDt);
        const endStr = this.formatDateTimeUtc(endDt);

        return {
          dtstart: `DTSTART:${startStr}`,
          dtend: `DTEND:${endStr}`
        };
      }
    }

    // 2. Planning Phases: Calculate calendar date offset backwards from event date
    const offsetDays = this.parseDateOffsetInDays(rawTime);
    const milestoneDate = new Date(eventDate);
    milestoneDate.setDate(milestoneDate.getDate() - offsetDays);

    // RFC 5545 requirement: For all-day events, DTEND is non-inclusive (exclusive)
    // To ensure a full 1-day milestone event, DTEND must be the following calendar day
    const milestoneEndDate = new Date(milestoneDate);
    milestoneEndDate.setDate(milestoneEndDate.getDate() + 1);

    const startClean = this.formatDateOnly(milestoneDate);
    const endClean = this.formatDateOnly(milestoneEndDate);
    return {
      dtstart: `DTSTART;VALUE=DATE:${startClean}`,
      dtend: `DTEND;VALUE=DATE:${endClean}`
    };
  },

  /**
   * Parses human-readable time offset descriptions into number of days prior to event.
   *
   * @param text - Time description (e.g., "3-4 Months Before", "2 Weeks Before", "5 Days Before")
   * @returns Estimated number of days offset
   */
  parseDateOffsetInDays(text: string): number {
    const lower = text.toLowerCase();

    // Months
    const monthMatch = lower.match(/(\d+)\s*month/);
    if (monthMatch) return parseInt(monthMatch[1], 10) * 30;

    // Weeks
    const weekMatch = lower.match(/(\d+)\s*week/);
    if (weekMatch) return parseInt(weekMatch[1], 10) * 7;

    // Days
    const dayMatch = lower.match(/(\d+)\s*day/);
    if (dayMatch) return parseInt(dayMatch[1], 10);

    // Common phrases
    if (lower.includes('rehearsal') || lower.includes('1 day')) return 1;
    if (lower.includes('final prep') || lower.includes('week before')) return 7;

    return 14; // sensible default 2 weeks prior
  },

  /**
   * Formats a Date object into YYYYMMDD string format.
   *
   * @param date - Date to format
   * @returns 8-character string (YYYYMMDD)
   */
  formatDateOnly(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  },

  /**
   * Formats a Date object into UTC iCalendar timestamp string format (YYYYMMDDTHHMMSSZ).
   *
   * @param date - Date to format
   * @returns UTC formatted timestamp string
   */
  formatDateTimeUtc(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    const h = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getUTCMinutes()).padStart(2, '0');
    const s = String(date.getUTCSeconds()).padStart(2, '0');
    return `${y}${m}${d}T${h}${min}${s}Z`;
  },

  /**
   * Triggers client-side browser download of the event timeline as an .ics file.
   *
   * @param event - The active EventPlan
   */
  downloadIcs(event: EventPlan): void {
    const icsContent = this.generateIcs(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const filename = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_schedule.ics`;
    this.triggerDownload(blob, filename);
  },

  /**
   * Triggers client-side browser download of the full EventPlan as a formatted JSON file.
   *
   * @param event - The active EventPlan
   */
  downloadJson(event: EventPlan): void {
    const jsonStr = JSON.stringify(event, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const filename = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_data.json`;
    this.triggerDownload(blob, filename);
  },

  /**
   * Generates a comprehensive, human-readable Markdown dossier including budget table,
   * timeline schedule, vendor directory, speeches, and cost-saving insights.
   *
   * @param event - The active EventPlan
   * @returns Formatted Markdown string
   */
  generateMarkdownDossier(event: EventPlan): string {
    const totalEstimated = event.budgetItems.reduce((acc, b) => acc + b.estimatedCost, 0);
    const totalActual = event.budgetItems.reduce(
      (acc, b) => acc + (b.actualCost || b.estimatedCost),
      0
    );
    const totalPaid = event.budgetItems.reduce((acc, b) => acc + b.paidCost, 0);
    const budgetSafe = event.totalBudget || 1;

    return `# ${event.title}
**Event Dossier & Master Planning Blueprint**
*Generated by CelebrAIte GenAI Assistant on ${new Date().toLocaleDateString()}*

---

## 📌 Event Overview
- **Type:** ${event.type.toUpperCase()}
- **Target Date:** ${event.date}
- **Location:** ${event.location}
- **Vibe & Atmosphere:** ${event.vibe}
- **Target Guest Count:** ${event.targetGuests}
- **Total Budget:** ${event.currencySymbol}${event.totalBudget.toLocaleString()} ${event.currency}

---

## 💰 Budget & Financial Summary
- **Total Estimated:** ${event.currencySymbol}${totalEstimated.toLocaleString()}
- **Total Committed / Actual:** ${event.currencySymbol}${totalActual.toLocaleString()} (${Math.round((totalActual / budgetSafe) * 100)}%)
- **Total Paid to Date:** ${event.currencySymbol}${totalPaid.toLocaleString()}
- **Remaining Balance:** ${event.currencySymbol}${(event.totalBudget - totalActual).toLocaleString()}

### Line Items
| Category | Item Name | Estimated | Actual | Paid | Status | Notes |
|---|---|---|---|---|---|---|
${event.budgetItems.map((b) => `| ${b.category} | ${b.name} | ${event.currencySymbol}${b.estimatedCost} | ${event.currencySymbol}${b.actualCost} | ${event.currencySymbol}${b.paidCost} | ${b.status} | ${b.notes || '-'} |`).join('\n')}

---

## ⏱️ Timeline & Schedule of Events
${event.timelineItems.map((t) => `- **[${t.phase.toUpperCase()}]** *${t.targetDateOrTime}* - ${t.completed ? '✅' : '⏳'} **${t.title}**: ${t.description}`).join('\n')}

---

## 🤝 Vendor Directory
${event.vendors
  .map(
    (v) => `### ${v.name} (${v.category})
- **Contact:** ${v.contactPerson} (${v.email} | ${v.phone})
- **Status:** ${v.status.toUpperCase()} | Agreed: ${event.currencySymbol}${v.agreedCost}
- **Notes:** ${v.notes}
${v.keyQuestions && v.keyQuestions.length ? `**Key Verification Questions:**\n${v.keyQuestions.map((q) => `  - [ ] ${q}`).join('\n')}` : ''}
`
  )
  .join('\n')}

---

## 🎨 Personalized Creative Concepts
- **Theme:** ${event.personalizedIdeas.themeName}
- **Concept:** ${event.personalizedIdeas.themeDescription}
- **Color Palette:** ${event.personalizedIdeas.colorPalette.map((c) => `${c.name} (${c.hex})`).join(', ')}

### Curated Activities
${event.personalizedIdeas.activities.map((a) => `- **${a.name}** (${a.duration}, for ${a.targetAudience}): ${a.description}`).join('\n')}

### Speeches & Toasts
${event.personalizedIdeas.customSpeeches.map((s) => `#### ${s.title} (${s.role})\n> "${s.text}"\n`).join('\n')}

### Cost Saving Insights
${event.personalizedIdeas.costSavingTips.map((c) => `- 💡 ${c}`).join('\n')}
`;
  },

  /**
   * Triggers client-side browser download of the full markdown event dossier.
   *
   * @param event - The active EventPlan
   */
  downloadMarkdown(event: EventPlan): void {
    const md = this.generateMarkdownDossier(event);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const filename = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_dossier.md`;
    this.triggerDownload(blob, filename);
  },

  /**
   * Invokes the browser's native print dialog to print or save the event dossier as PDF.
   */
  printDossier(): void {
    window.print();
  },

  /**
   * Escapes special characters for RFC 5545 iCalendar standard compliance.
   *
   * @param text - Raw text string
   * @returns RFC 5545 escaped string
   */
  escapeIcs(text: string): string {
    return text.replace(/[\\;,]/g, (match) => '\\' + match).replace(/\n/g, '\\n');
  },

  /**
   * Helper method that creates an anchor tag to trigger browser download of a given Blob.
   *
   * @param blob - Binary or text file content
   * @param filename - Desired filename for download
   */
  triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
