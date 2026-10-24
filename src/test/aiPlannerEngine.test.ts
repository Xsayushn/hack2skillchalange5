import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { aiPlannerEngine, DEFAULT_AI_MODEL } from '../services/aiPlannerEngine';
import { generateBudgetBreakdown } from '../services/generators/budgetGenerator';
import { generatePhasedTimeline } from '../services/generators/timelineGenerator';
import { generateVendors } from '../services/generators/vendorGenerator';
import { generateCreativeIdeas } from '../services/generators/ideasGenerator';
import { autonomousAgentRespond, calculateDaysRemaining } from '../services/autonomousAssistant';
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
    expect(Math.abs(sumEstimated - 40000)).toBeLessThanOrEqual(50);

    // Validate catering gets prioritized
    const cateringItem = plan.budgetItems.find((b) => b.category === 'Catering & Bar');
    expect(cateringItem).toBeDefined();
    expect(cateringItem!.estimatedCost).toBeGreaterThan(12000);

    // Validate timeline phases
    expect(plan.timelineItems.some((t) => t.phase === 'foundation')).toBe(true);
    expect(plan.timelineItems.some((t) => t.phase === 'bookings')).toBe(true);
    expect(plan.timelineItems.some((t) => t.phase === 'day_of')).toBe(true);

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

    const entertainmentItem = plan.budgetItems.find((b) => b.category === 'Music & Entertainment');
    expect(entertainmentItem).toBeDefined();
    expect(entertainmentItem!.estimatedCost).toBeGreaterThanOrEqual(400);

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
    const permitsItem = plan.budgetItems.find((b) => b.category === 'Logistics & Permits');
    expect(permitsItem).toBeDefined();
    expect(permitsItem!.estimatedCost).toBeGreaterThan(500);

    expect(
      plan.timelineItems.some(
        (t) => t.title.toLowerCase().includes('permit') || t.title.toLowerCase().includes('council')
      )
    ).toBe(true);
  });

  it('directly invokes heuristicGenerators and validates domain physics', () => {
    const params = {
      title: 'Direct Heuristic Test',
      type: 'wedding' as const,
      date: '2026-12-01',
      targetGuests: 80,
      location: 'Estate',
      vibe: 'Classic',
      totalBudget: 20000,
      currency: 'USD',
      currencySymbol: '$'
    };

    const budget = generateBudgetBreakdown(params);
    expect(budget.length).toBeGreaterThan(3);

    const timeline = generatePhasedTimeline(params);
    expect(timeline.length).toBeGreaterThan(5);

    const vendors = generateVendors(params, budget);
    expect(vendors.length).toBeGreaterThanOrEqual(3);

    const ideas = generateCreativeIdeas(params);
    expect(ideas.themeName).toBeDefined();
    expect(ideas.colorPalette.length).toBeGreaterThanOrEqual(3);
  });
});

describe('aiPlannerEngine - Autonomous Assistant Reasoning', () => {
  const sampleEvent = INITIAL_EVENTS[0];

  it('provides strategic budget trimming recommendations', async () => {
    const res = await aiPlannerEngine.askAssistant(
      'Can you help us trim our wedding budget?',
      sampleEvent,
      { apiKey: '', model: DEFAULT_AI_MODEL, useOfflineFallback: true }
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
      { apiKey: '', model: DEFAULT_AI_MODEL, useOfflineFallback: true }
    );

    expect(res.text).toContain('Day-of Run of Show Blueprint');
    expect(res.text).toContain(sampleEvent.location);
  });

  it('crafts a personalized toast speech', async () => {
    const res = await aiPlannerEngine.askAssistant(
      'Write a warm toast speech for the reception',
      sampleEvent,
      { apiKey: '', model: DEFAULT_AI_MODEL, useOfflineFallback: true }
    );

    expect(res.text).toContain('Toast & Speech Template');
    expect(res.text).toContain(sampleEvent.location);
  });

  it('provides vendor negotiation and contract questions', async () => {
    const res = await aiPlannerEngine.askAssistant(
      'What questions should I ask vendors before signing contracts?',
      sampleEvent,
      { apiKey: '', model: DEFAULT_AI_MODEL, useOfflineFallback: true }
    );

    expect(res.text).toContain('Vendor Master Checklist & Negotiation');
    expect(res.text).toContain('Force Majeure');
  });

  it('provides inclusive dietary and catering engineering guidance', async () => {
    const res = await aiPlannerEngine.askAssistant(
      'How to handle catering menu and dietary restrictions for 150 guests?',
      sampleEvent,
      { apiKey: '', model: DEFAULT_AI_MODEL, useOfflineFallback: true }
    );

    expect(res.text).toContain('Inclusive Menu & Dietary');
    expect(res.text).toContain('150');
  });

  it('directly tests autonomousAssistant module exports', () => {
    const days = calculateDaysRemaining('2026-12-31');
    expect(typeof days).toBe('number');

    const offlineResponse = autonomousAgentRespond('cost trimming advice', sampleEvent);
    expect(offlineResponse.text).toContain('Budget Optimization Report');
  });
});

describe('aiPlannerEngine - Live Gemini API Path & Security', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('successfully generates plan via live Gemini API with header authentication', async () => {
    const mockPlanJson = {
      themeName: 'Celestial Starlight Wonder',
      themeDescription: 'A starry, luminescent evening under glowing fairy lights.',
      colorPalette: [
        { name: 'Starlight Gold', hex: '#fbbf24' },
        { name: 'Cosmic Blue', hex: '#1e3a8a' },
        { name: 'Midnight', hex: '#0f172a' }
      ],
      activities: [
        {
          name: 'Constellation Viewing',
          description: 'Telescope stations',
          targetAudience: 'All',
          duration: '60 mins'
        }
      ],
      cateringHighlights: ['Galactic cocktails', 'Starlight dessert bar'],
      playlistVibe: { mood: 'Ethereal & Upbeat', sampleTracks: ['A Sky Full of Stars'] },
      customSpeeches: [{ title: 'Welcome Toast', role: 'Host', text: 'Welcome under the stars!' }],
      costSavingTips: ['Use fairy lights instead of heavy floral arches'],
      decorSuggestions: ['Glow in the dark accents']
    };

    let capturedUrl = '';
    let capturedHeaders: Record<string, string> = {};
    let capturedBody: Record<string, unknown> = {};

    global.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      capturedUrl = url;
      capturedHeaders = (init?.headers as Record<string, string>) || {};
      capturedBody = init?.body ? JSON.parse(init.body as string) : {};
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(mockPlanJson) }]
              }
            }
          ]
        })
      };
    });

    const params = {
      title: 'Starlight Gala',
      type: 'wedding' as const,
      date: '2026-10-25',
      targetGuests: 100,
      location: 'Observatory Hill',
      vibe: 'Starry & Enchanted',
      totalBudget: 25000,
      currency: 'USD',
      currencySymbol: '$'
    };

    const result = await aiPlannerEngine.generateEventPlanWithMeta(params, {
      apiKey: 'AIzaSyFakeKeyForTesting12345678',
      model: DEFAULT_AI_MODEL,
      useOfflineFallback: true
    });

    expect(result.source).toBe('live-gemini');
    expect(result.plan.personalizedIdeas.themeName).toBe('Celestial Starlight Wonder');
    expect(capturedUrl).toContain(DEFAULT_AI_MODEL);
    expect(capturedHeaders['x-goog-api-key']).toBe('AIzaSyFakeKeyForTesting12345678');
    // Ensure API key is NEVER leaked in URL query parameters
    expect(capturedUrl).not.toContain('key=');
    // Ensure maxOutputTokens is 8192 and responseMimeType is application/json
    expect((capturedBody.generationConfig as Record<string, unknown>).maxOutputTokens).toBe(8192);
    expect((capturedBody.generationConfig as Record<string, unknown>).responseMimeType).toBe(
      'application/json'
    );
  });

  it('falls back safely to autonomous heuristics with visible notice when live call fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error or rate limit 429'));

    const params = {
      title: 'Gala with Fallback',
      type: 'wedding' as const,
      date: '2026-10-25',
      targetGuests: 100,
      location: 'Grand Ballroom',
      vibe: 'Opulent',
      totalBudget: 30000,
      currency: 'USD',
      currencySymbol: '$'
    };

    const result = await aiPlannerEngine.generateEventPlanWithMeta(params, {
      apiKey: 'AIzaSyFakeKeyForTesting12345678',
      model: DEFAULT_AI_MODEL,
      useOfflineFallback: true
    });

    expect(result.source).toBe('autonomous-heuristics');
    expect(result.errorNotice).toBeDefined();
    expect(result.errorNotice).toContain('Live Gemini API call failed');
    expect(result.plan.id).toBeDefined();
    expect(result.plan.budgetItems.length).toBeGreaterThan(0);
  });

  it('throws error when live call fails and useOfflineFallback is false', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Gemini API 500 internal server error'));

    const params = {
      title: 'Strict Mode Gala',
      type: 'wedding' as const,
      date: '2026-10-25',
      targetGuests: 50,
      location: 'Hall',
      vibe: 'Formal',
      totalBudget: 10000,
      currency: 'USD',
      currencySymbol: '$'
    };

    await expect(
      aiPlannerEngine.generateEventPlanWithMeta(params, {
        apiKey: 'AIzaSyFakeKeyForTesting12345678',
        model: DEFAULT_AI_MODEL,
        useOfflineFallback: false
      })
    ).rejects.toThrow('Gemini API 500 internal server error');
  });

  it('handles truncated or invalid JSON from Gemini by falling back to heuristics', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: '{"themeName": "Truncated json without closing' }]
            }
          }
        ]
      })
    });

    const params = {
      title: 'Truncated Gala',
      type: 'wedding' as const,
      date: '2026-10-25',
      targetGuests: 50,
      location: 'Hall',
      vibe: 'Formal',
      totalBudget: 10000,
      currency: 'USD',
      currencySymbol: '$'
    };

    const result = await aiPlannerEngine.generateEventPlanWithMeta(params, {
      apiKey: 'AIzaSyFakeKeyForTesting12345678',
      model: DEFAULT_AI_MODEL,
      useOfflineFallback: true
    });

    expect(result.source).toBe('autonomous-heuristics');
    expect(result.errorNotice).toBeDefined();
    expect(result.plan.personalizedIdeas.themeName).toBeDefined();
  });

  it('handles 429 or 404 HTTP errors from Gemini gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests'
    });

    const params = {
      title: 'Rate Limited Gala',
      type: 'birthday' as const,
      date: '2026-10-25',
      targetGuests: 30,
      location: 'Park',
      vibe: 'Fun',
      totalBudget: 2000,
      currency: 'USD',
      currencySymbol: '$'
    };

    const result = await aiPlannerEngine.generateEventPlanWithMeta(params, {
      apiKey: 'AIzaSyFakeKeyForTesting12345678',
      model: DEFAULT_AI_MODEL,
      useOfflineFallback: true
    });

    expect(result.source).toBe('autonomous-heuristics');
    expect(result.errorNotice).toContain('429');
  });

  it('handles request abort/timeout gracefully', async () => {
    global.fetch = vi
      .fn()
      .mockRejectedValue(new DOMException('The user aborted a request.', 'AbortError'));

    const params = {
      title: 'Timeout Gala',
      type: 'community' as const,
      date: '2026-10-25',
      targetGuests: 150,
      location: 'Square',
      vibe: 'Festive',
      totalBudget: 5000,
      currency: 'USD',
      currencySymbol: '$'
    };

    const result = await aiPlannerEngine.generateEventPlanWithMeta(params, {
      apiKey: 'AIzaSyFakeKeyForTesting12345678',
      model: DEFAULT_AI_MODEL,
      useOfflineFallback: true
    });

    expect(result.source).toBe('autonomous-heuristics');
    expect(result.errorNotice).toContain('AbortError');
  });

  it('calls live Gemini chat assistant with 4096 tokens, parses suggestions and handles finishReason MAX_TOKENS', async () => {
    let capturedBody: Record<string, unknown> = {};

    global.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      capturedBody = init?.body ? JSON.parse(init.body as string) : {};
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: 'Here is your custom timeline advice!\n\nSUGGESTIONS:\n- Review contracts\n- Ask about backup power'
                  }
                ]
              },
              finishReason: 'MAX_TOKENS'
            }
          ]
        })
      };
    });

    const sampleEvent = INITIAL_EVENTS[0];
    const res = await aiPlannerEngine.askAssistant('How should I schedule vendors?', sampleEvent, {
      apiKey: 'AIzaSyFakeKeyForTesting12345678',
      model: DEFAULT_AI_MODEL,
      useOfflineFallback: true
    });

    expect(res.text).toContain('Here is your custom timeline advice!');
    expect(res.text).toContain('maximum output limit');
    expect(res.suggestions).toEqual(['Review contracts', 'Ask about backup power']);
    expect((capturedBody.generationConfig as Record<string, unknown>).maxOutputTokens).toBe(4096);
  });

  it('generates plan via generateEventPlanAsync directly', async () => {
    const params = {
      title: 'Async Gala',
      type: 'festival' as const,
      date: '2026-10-25',
      targetGuests: 200,
      location: 'Park',
      vibe: 'Festive',
      totalBudget: 8000,
      currency: 'USD',
      currencySymbol: '$'
    };

    const plan = await aiPlannerEngine.generateEventPlanAsync(params);
    expect(plan.title).toBe('Async Gala');
    expect(plan.budgetItems.length).toBeGreaterThan(0);
  });
});
