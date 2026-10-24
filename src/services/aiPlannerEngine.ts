import {
  EventPlan,
  BudgetItem,
  TimelineItem,
  Vendor,
  PersonalizedIdeas,
  AISettings,
  GenerateEventParams,
  PlanGenerationResult
} from '../types';
import {
  capitalize,
  generateBudgetBreakdown,
  generatePhasedTimeline,
  generateVendors,
  generateCreativeIdeas
} from './heuristicGenerators';
import { calculateDaysRemaining, autonomousAgentRespond } from './autonomousAssistant';

export type { GenerateEventParams, PlanGenerationResult };

export const DEFAULT_AI_MODEL = 'gemini-3.8-flash';

export const ALLOWED_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash'
];

export const aiPlannerEngine = {
  /**
   * Generates a complete tailored EventPlan with source metadata.
   */
  async generateEventPlanWithMeta(
    params: GenerateEventParams,
    aiSettings?: AISettings
  ): Promise<PlanGenerationResult> {
    if (aiSettings?.apiKey && aiSettings.apiKey.trim().length > 5) {
      try {
        const livePlan = await this.callGeminiForPlan(params, aiSettings);
        if (livePlan) {
          return { plan: livePlan, source: 'live-gemini' };
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn('Live Gemini plan generation failed, falling back to autonomous engine', err);
        if (aiSettings?.useOfflineFallback === false) {
          throw err;
        }
        const offlinePlan = this.generateEventPlan(params);
        return {
          plan: offlinePlan,
          source: 'autonomous-heuristics',
          errorNotice: `Live Gemini API call failed (${errMsg.slice(0, 100)}). Safely fell back to Autonomous Heuristic Engine.`
        };
      }
    }
    return {
      plan: this.generateEventPlan(params),
      source: 'autonomous-heuristics'
    };
  },

  /**
   * Generates a complete tailored EventPlan.
   * If an active Gemini API key is configured, it dynamically invokes the Gemini model to synthesize
   * bespoke event elements; otherwise, it seamlessly uses the Autonomous Context-Aware Heuristics engine.
   */
  async generateEventPlanAsync(
    params: GenerateEventParams,
    aiSettings?: AISettings
  ): Promise<EventPlan> {
    const result = await this.generateEventPlanWithMeta(params, aiSettings);
    return result.plan;
  },

  /**
   * Calls Google Gemini to generate a truly dynamic, context-tailored event plan
   */
  async callGeminiForPlan(
    params: GenerateEventParams,
    aiSettings: AISettings
  ): Promise<EventPlan | null> {
    const rawModel = aiSettings.model || DEFAULT_AI_MODEL;
    const model = ALLOWED_MODELS.includes(rawModel) ? rawModel : DEFAULT_AI_MODEL;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const systemPrompt = `You are CelebrAIte, an expert AI Event Planner.
Generate a tailored JSON event plan for:
- Title: "${params.title}"
- Type: ${params.type}
- Target Date: ${params.date}
- Location: "${params.location}"
- Vibe / Theme requested: "${params.vibe}"
- Target Guests: ${params.targetGuests}
- Budget: ${params.currencySymbol}${params.totalBudget} ${params.currency}
- Focus: ${params.priorityFocus || 'balanced'}

You must respond ONLY with a raw JSON object (no markdown quotes, no explanation):
{
  "themeName": string,
  "themeDescription": string,
  "colorPalette": [{"name": string, "hex": string}],
  "activities": [{"name": string, "description": string, "targetAudience": string, "duration": string}],
  "cateringHighlights": [string],
  "playlistVibe": {"mood": string, "sampleTracks": [string]},
  "customSpeeches": [{"title": string, "role": string, "text": string}],
  "costSavingTips": [string],
  "decorSuggestions": [string]
}`;

    const body = {
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      }
    };

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), 30_000);

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': aiSettings.apiKey.trim()
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutTimer);
    }

    if (!res.ok) throw new Error(`Gemini API returned status ${res.status}`);

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const cleaned = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const parsed = JSON.parse(cleaned);

    const basePlan = this.generateEventPlan(params);
    return {
      ...basePlan,
      personalizedIdeas: {
        themeName: parsed.themeName || basePlan.personalizedIdeas.themeName,
        themeDescription: parsed.themeDescription || basePlan.personalizedIdeas.themeDescription,
        colorPalette:
          Array.isArray(parsed.colorPalette) && parsed.colorPalette.length >= 3
            ? parsed.colorPalette
            : basePlan.personalizedIdeas.colorPalette,
        activities:
          Array.isArray(parsed.activities) && parsed.activities.length
            ? parsed.activities
            : basePlan.personalizedIdeas.activities,
        cateringHighlights:
          Array.isArray(parsed.cateringHighlights) && parsed.cateringHighlights.length
            ? parsed.cateringHighlights
            : basePlan.personalizedIdeas.cateringHighlights,
        playlistVibe: parsed.playlistVibe || basePlan.personalizedIdeas.playlistVibe,
        customSpeeches:
          Array.isArray(parsed.customSpeeches) && parsed.customSpeeches.length
            ? parsed.customSpeeches
            : basePlan.personalizedIdeas.customSpeeches,
        decorSuggestions: Array.isArray(parsed.decorSuggestions)
          ? parsed.decorSuggestions
          : basePlan.personalizedIdeas.decorSuggestions,
        costSavingTips: Array.isArray(parsed.costSavingTips)
          ? parsed.costSavingTips
          : basePlan.personalizedIdeas.costSavingTips
      },
      notes: `Generated dynamically via Google Gemini (${model}). Tailored to "${params.vibe}".`
    };
  },

  /**
   * Generates a complete tailored EventPlan using intelligent heuristics and domain modeling
   */
  generateEventPlan(params: GenerateEventParams): EventPlan {
    const id = `event-${params.type}-${Date.now().toString(36)}`;
    const budgetItems = this.generateBudgetBreakdown(params);
    const timelineItems = this.generatePhasedTimeline(params);
    const vendors = this.generateVendors(params, budgetItems);
    const personalizedIdeas = this.generateCreativeIdeas(params);

    return {
      id,
      title: params.title.trim() || `${capitalize(params.type)} Celebration`,
      type: params.type,
      date: params.date,
      targetGuests: Number(params.targetGuests) || 50,
      location: params.location.trim() || 'Local Venue',
      vibe: params.vibe.trim() || 'Warm, Celebratory & Memorable',
      totalBudget: Number(params.totalBudget) || 5000,
      currency: params.currency || 'USD',
      currencySymbol: params.currencySymbol || '$',
      budgetItems,
      timelineItems,
      vendors,
      personalizedIdeas,
      guests: [
        {
          id: 'g-init-1',
          name: 'Organizer & Host Committee',
          group: 'Hosts',
          rsvpStatus: 'confirmed',
          dietaryNotes: 'None',
          plusOnes: 1,
          tableOrZone: 'VIP / Lead'
        }
      ],
      notes: `Generated with CelebrAIte Autonomous Engine. Priority Focus: ${params.priorityFocus || 'balanced'}.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  // Heuristic generation delegates
  generateBudgetBreakdown(params: GenerateEventParams): BudgetItem[] {
    return generateBudgetBreakdown(params);
  },

  generatePhasedTimeline(params: GenerateEventParams): TimelineItem[] {
    return generatePhasedTimeline(params);
  },

  generateVendors(params: GenerateEventParams, budgetItems: BudgetItem[]): Vendor[] {
    return generateVendors(params, budgetItems);
  },

  generateCreativeIdeas(params: GenerateEventParams): PersonalizedIdeas {
    return generateCreativeIdeas(params);
  },

  /**
   * Responds intelligently to user chat queries using either Live Gemini API or the built-in Heuristic AI Engine
   */
  async askAssistant(
    prompt: string,
    currentEvent: EventPlan,
    aiSettings: AISettings
  ): Promise<{ text: string; suggestions?: string[] }> {
    if (aiSettings.apiKey && aiSettings.apiKey.trim() !== '') {
      try {
        const liveResponse = await this.callGeminiAPI(prompt, currentEvent, aiSettings);
        if (liveResponse) {
          return liveResponse;
        }
      } catch (err) {
        console.warn('Gemini API call failed, evaluating fallback behavior', err);
        if (aiSettings.useOfflineFallback === false) {
          throw new Error(
            'Gemini API connection error. Offline fallback is disabled in settings.',
            { cause: err }
          );
        }
      }
    }

    return this.autonomousAgentRespond(prompt, currentEvent);
  },

  /**
   * Calls Google Gemini REST endpoint securely with Header-based authentication and model allowlisting
   */
  async callGeminiAPI(
    prompt: string,
    currentEvent: EventPlan,
    aiSettings: AISettings
  ): Promise<{ text: string; suggestions?: string[] } | null> {
    const rawModel = aiSettings.model || DEFAULT_AI_MODEL;
    const model = ALLOWED_MODELS.includes(rawModel) ? rawModel : DEFAULT_AI_MODEL;

    // Security Fix: API key is passed securely via 'x-goog-api-key' header, never exposed in URL query parameters!
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const contextSummary = `
You are CelebrAIte, an expert, encouraging, detail-oriented Event Planning Assistant.
Current Event Context:
- Title: "${currentEvent.title}"
- Type: ${currentEvent.type}
- Date: ${currentEvent.date}
- Location: ${currentEvent.location}
- Target Guests: ${currentEvent.targetGuests}
- Total Budget: ${currentEvent.currencySymbol}${currentEvent.totalBudget} ${currentEvent.currency}
- Current Budget Items: ${currentEvent.budgetItems.length} items logged
- Pending Timeline Tasks: ${currentEvent.timelineItems.filter((t) => !t.completed).length} incomplete
- Vibe: ${currentEvent.vibe}

Provide specific, practical, highly creative, and mathematically sound suggestions. Format your response cleanly in Markdown. Provide 2-3 short follow-up suggestion prompts at the end separated by a line starting with "SUGGESTIONS:".
`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${contextSummary}\n\nUser Question:\n${prompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    };

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), 30_000);

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': aiSettings.apiKey.trim()
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutTimer);
    }

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    let text = rawText;
    let suggestions: string[] = [];

    if (rawText.includes('SUGGESTIONS:')) {
      const parts = rawText.split('SUGGESTIONS:');
      text = parts[0].trim();
      suggestions = parts[1]
        .split('\n')
        .map((s: string) => s.replace(/^[-*•\d.]\s*/, '').trim())
        .filter((s: string) => s.length > 3 && s.length < 80);
    }

    return { text, suggestions };
  },

  autonomousAgentRespond(
    prompt: string,
    currentEvent: EventPlan
  ): { text: string; suggestions?: string[] } {
    return autonomousAgentRespond(prompt, currentEvent);
  },

  calculateDaysRemaining(dateStr: string): number {
    return calculateDaysRemaining(dateStr);
  },

  capitalize(str: string): string {
    return capitalize(str);
  }
};
