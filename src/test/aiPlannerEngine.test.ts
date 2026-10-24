import { describe, it, expect } from 'vitest';
import { aiPlannerEngine } from '../services/aiPlannerEngine';
import { INITIAL_EVENTS } from '../data/mockEvents';

describe('aiPlannerEngine - Event Architecture & Domain Logic', () => {
  it('generates a complete, tailored wedding event plan', () => {
    const plan = aiPlannerEngine.generateEventPlan({
      title: 'Serena & Daniel Wedding',
      type: 'wedding',
      date: '2026-10-10',
      targetGuests: 120,
      location: 'Magnolia Manor',
      vibe: 'Timeless Elegance',
      totalBudget: 40000,
      currency: 'USD',
      currencySymbol: '$',
      priorityFocus: 'catering'
    });

    expect(plan.id).toBeDefined();
    expect(plan.title).toBe('Serena & Daniel Wedding');
    expect(plan.type).toBe('wedding');
    expect(plan.targetGuests).toBe(120);
    expect(plan.totalBudget).toBe(40000);

    // Validate budget items
    expect(plan.budgetItems.length).toBeGreaterThan(5);
    const sumEstimated = plan.budgetItems.reduce((acc, b) => acc + b.estimatedCost, 0);
    // Sum of budget items should approximate total budget within rounding tolerance
    expect(Math.abs(sumEstimated - 40000)).toBeLessThanOrEqual(50);

    // Validate catering gets prioritized
    const cateringItem = plan.budgetItems.find(b => b.category === 'Catering & Bar');
    expect(cateringItem).toBeDefined();
    expect(cateringItem!.estimatedCost).toBeGreaterThan(12000);

    // Validate timeline phases
    expect(plan.timelineItems.some(t => t.phase === 'foundation')).toBe(true);
    expect(plan.timelineItems.some(t => t.phase === 'bookings')).toBe(true);
    expect(plan.timelineItems.some(t => t.phase === 'day_of')).toBe(true);

    // Validate creative concepts
    expect(plan.personalizedIdeas.themeName).toBeDefined();
    expect(plan.personalizedIdeas.colorPalette.length).toBeGreaterThanOrEqual(4);
    expect(plan.personalizedIdeas.customSpeeches.length).toBeGreaterThan(0);
  });

  it('generates an action-packed birthday event plan', () => {
    const plan = aiPlannerEngine.generateEventPlan({
      title: 'Lucas 12th Laser Birthday',
      type: 'birthday',
      date: '2026-11-20',
      targetGuests: 30,
      location: 'Galaxy Arcade',
      vibe: 'High Energy Neon',
      totalBudget: 2000,
      currency: 'USD',
      currencySymbol: '$',
      priorityFocus: 'entertainment'
    });

    expect(plan.type).toBe('birthday');
    expect(plan.targetGuests).toBe(30);

    // Entertainment should be heavily allocated
    const entertainmentItem = plan.budgetItems.find(b => b.category === 'Music & Entertainment');
    expect(entertainmentItem).toBeDefined();
    expect(entertainmentItem!.estimatedCost).toBeGreaterThanOrEqual(400);

    // Personalized ideas check
    expect(plan.personalizedIdeas.activities.length).toBeGreaterThanOrEqual(1);
    expect(plan.personalizedIdeas.activities[0].name).toBeDefined();
  });

  it('generates an eco-friendly community festival plan with permits and logistics', () => {
    const plan = aiPlannerEngine.generateEventPlan({
      title: 'Riverside Community Green Clean-Up',
      type: 'community',
      date: '2026-09-05',
      targetGuests: 200,
      location: 'Riverside Public Green',
      vibe: 'Eco-Friendly, Neighborly',
      totalBudget: 5000,
      currency: 'USD',
      currencySymbol: '$'
    });

    expect(plan.type).toBe('community');
    // Must include Logistics & Permits
    const permitsItem = plan.budgetItems.find(b => b.category === 'Logistics & Permits');
    expect(permitsItem).toBeDefined();
    expect(permitsItem!.estimatedCost).toBeGreaterThan(500);

    // Timeline must include municipal permits
    expect(plan.timelineItems.some(t => t.title.toLowerCase().includes('permit') || t.title.toLowerCase().includes('council'))).toBe(true);
  });
});

describe('aiPlannerEngine - Autonomous Assistant Reasoning', () => {
  const sampleEvent = INITIAL_EVENTS[0]; // Elena & Liam's Wedding

  it('provides strategic budget trimming recommendations', async () => {
    const res = await aiPlannerEngine.askAssistant(
      'Can you help us trim our wedding budget?',
      sampleEvent,
      { apiKey: '', model: 'gemini-1.5-flash', useOfflineFallback: true }
    );

    expect(res.text).toContain('Budget Optimization Report');
    expect(res.text).toContain(sampleEvent.currencySymbol);
    expect(res.suggestions).toBeDefined();
    expect(res.suggestions!.length).toBeGreaterThan(0);
  });

  it('generates a synchronized day-of run-of-show schedule', async () => {
    const res = await aiPlannerEngine.askAssistant(
      'What is our day-of timeline and schedule?',
      sampleEvent,
      { apiKey: '', model: 'gemini-1.5-flash', useOfflineFallback: true }
    );

    expect(res.text).toContain('Day-of Run of Show Blueprint');
    expect(res.text).toContain(sampleEvent.location);
  });

  it('crafts a personalized toast speech', async () => {
    const res = await aiPlannerEngine.askAssistant(
      'Write a warm toast speech for the reception',
      sampleEvent,
      { apiKey: '', model: 'gemini-1.5-flash', useOfflineFallback: true }
    );

    expect(res.text).toContain('Toast & Speech Template');
    expect(res.text).toContain(sampleEvent.location);
  });

  it('provides vendor negotiation and contract questions', async () => {
    const res = await aiPlannerEngine.askAssistant(
      'What questions should I ask vendors before signing contracts?',
      sampleEvent,
      { apiKey: '', model: 'gemini-1.5-flash', useOfflineFallback: true }
    );

    expect(res.text).toContain('Vendor Master Checklist & Negotiation');
    expect(res.text).toContain('Force Majeure');
  });

  it('provides inclusive dietary and catering engineering guidance', async () => {
    const res = await aiPlannerEngine.askAssistant(
      'How to handle catering menu and dietary restrictions for 150 guests?',
      sampleEvent,
      { apiKey: '', model: 'gemini-1.5-flash', useOfflineFallback: true }
    );

    expect(res.text).toContain('Inclusive Menu & Dietary');
    expect(res.text).toContain('150');
  });
});
