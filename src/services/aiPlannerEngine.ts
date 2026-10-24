import { EventPlan, EventType, BudgetCategory, BudgetItem, TimelineItem, Vendor, PersonalizedIdeas, AISettings } from '../types';

export interface GenerateEventParams {
  title: string;
  type: EventType;
  date: string;
  targetGuests: number;
  location: string;
  vibe: string;
  totalBudget: number;
  currency: string;
  currencySymbol: string;
  priorityFocus?: 'catering' | 'entertainment' | 'decor' | 'photo' | 'balanced';
  dietaryOrSpecialNotes?: string;
}

export const DEFAULT_AI_MODEL = 'gemini-2.5-flash';

export const ALLOWED_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-2.5-pro'
];

export interface PlanGenerationResult {
  plan: EventPlan;
  source: 'live-gemini' | 'autonomous-heuristics';
  errorNotice?: string;
}

export const aiPlannerEngine = {
  /**
   * Generates a complete tailored EventPlan with source metadata.
   */
  async generateEventPlanWithMeta(params: GenerateEventParams, aiSettings?: AISettings): Promise<PlanGenerationResult> {
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
  async generateEventPlanAsync(params: GenerateEventParams, aiSettings?: AISettings): Promise<EventPlan> {
    const result = await this.generateEventPlanWithMeta(params, aiSettings);
    return result.plan;
  },

  /**
   * Calls Google Gemini to generate a truly dynamic, context-tailored event plan
   */
  async callGeminiForPlan(params: GenerateEventParams, aiSettings: AISettings): Promise<EventPlan | null> {
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
      generationConfig: { temperature: 0.8, maxOutputTokens: 1400 }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': aiSettings.apiKey.trim()
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`Gemini API returned status ${res.status}`);

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const basePlan = this.generateEventPlan(params);
    return {
      ...basePlan,
      personalizedIdeas: {
        themeName: parsed.themeName || basePlan.personalizedIdeas.themeName,
        themeDescription: parsed.themeDescription || basePlan.personalizedIdeas.themeDescription,
        colorPalette: Array.isArray(parsed.colorPalette) && parsed.colorPalette.length >= 3 ? parsed.colorPalette : basePlan.personalizedIdeas.colorPalette,
        activities: Array.isArray(parsed.activities) && parsed.activities.length ? parsed.activities : basePlan.personalizedIdeas.activities,
        cateringHighlights: Array.isArray(parsed.cateringHighlights) && parsed.cateringHighlights.length ? parsed.cateringHighlights : basePlan.personalizedIdeas.cateringHighlights,
        playlistVibe: parsed.playlistVibe || basePlan.personalizedIdeas.playlistVibe,
        customSpeeches: Array.isArray(parsed.customSpeeches) && parsed.customSpeeches.length ? parsed.customSpeeches : basePlan.personalizedIdeas.customSpeeches,
        decorSuggestions: Array.isArray(parsed.decorSuggestions) ? parsed.decorSuggestions : basePlan.personalizedIdeas.decorSuggestions,
        costSavingTips: Array.isArray(parsed.costSavingTips) ? parsed.costSavingTips : basePlan.personalizedIdeas.costSavingTips
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
      title: params.title.trim() || `${this.capitalize(params.type)} Celebration`,
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

  /**
   * Generates an intelligent budget distribution based on event type and priority weighting
   */
  generateBudgetBreakdown(params: GenerateEventParams): BudgetItem[] {
    const total = Number(params.totalBudget) || 5000;
    const focus = params.priorityFocus || 'balanced';

    interface RatioConfig {
      category: BudgetCategory;
      name: string;
      percentage: number;
      notes: string;
    }

    let ratios: RatioConfig[] = [];

    if (params.type === 'wedding') {
      ratios = [
        { category: 'Venue & Rentals', name: 'Main Ceremony & Reception Venue', percentage: 0.28, notes: 'Includes tables, baseline seating, and private suites' },
        { category: 'Catering & Bar', name: 'Plated/Buffet Dinner & Beverage Package', percentage: focus === 'catering' ? 0.36 : 0.31, notes: `Scaled for ${params.targetGuests} guests with cocktail hour` },
        { category: 'Photography & Video', name: 'Full-Day Visual Coverage & Drone Video', percentage: focus === 'photo' ? 0.16 : 0.12, notes: '8-10 hours coverage with high-resolution digital prints' },
        { category: 'Floral & Decor', name: 'Arbor Installation, Centerpieces & Ambient Lighting', percentage: focus === 'decor' ? 0.15 : 0.10, notes: 'Custom floral arrangements reflecting theme palette' },
        { category: 'Music & Entertainment', name: 'Ceremony Acoustic Duo & Evening Band/DJ', percentage: focus === 'entertainment' ? 0.13 : 0.08, notes: 'Microphones for speeches and full sound system' },
        { category: 'Attire & Styling', name: 'Gown, Suits, Accessories & Bridal Glam', percentage: 0.05, notes: 'Fittings and day-of beauty coordinator' },
        { category: 'Invitations & Marketing', name: 'Stationery Suite, Calligraphy & RSVP Site', percentage: 0.02, notes: 'Save-the-dates and day-of signage' },
        { category: 'Favors & Gifts', name: 'Curated Guest Keepsakes & Bridal Party Gifts', percentage: 0.02, notes: 'Artisanal tokens and thank-you bundles' },
        { category: 'Contingency & Misc', name: 'Emergency Rainy Day Buffer & Permits', percentage: 0.02, notes: 'Reserved for last-minute weather or transport changes' }
      ];
    } else if (params.type === 'birthday') {
      ratios = [
        { category: 'Venue & Rentals', name: 'Private Party Space & Activity Arena', percentage: 0.32, notes: 'Covers private hall rental with sound & setup' },
        { category: 'Catering & Bar', name: 'Specialty Bites, Refreshments & Custom Cake', percentage: focus === 'catering' ? 0.32 : 0.26, notes: `Tiered theme cake and finger food for ${params.targetGuests} guests` },
        { category: 'Music & Entertainment', name: 'Live Entertainer, DJ or Character Stunt Lead', percentage: focus === 'entertainment' ? 0.25 : 0.18, notes: 'Interactive games and energetic hosting' },
        { category: 'Floral & Decor', name: 'Theme Backdrop, Balloon Installations & Props', percentage: focus === 'decor' ? 0.20 : 0.12, notes: 'High-impact photo station and table decor' },
        { category: 'Photography & Video', name: 'Highlight Candid Photographer', percentage: focus === 'photo' ? 0.12 : 0.05, notes: '2 hours of candid cake cutting and games coverage' },
        { category: 'Favors & Gifts', name: 'Custom Goodie Bags & Swag', percentage: 0.05, notes: 'Themed gift bags for every attendee' },
        { category: 'Contingency & Misc', name: 'Miscellaneous Supplies & Spares', percentage: 0.02, notes: 'Extra games, prizes, and unexpected guests' }
      ];
    } else if (params.type === 'community' || params.type === 'festival') {
      ratios = [
        { category: 'Logistics & Permits', name: 'City Permits, Street Barriers & Sanitation', percentage: 0.25, notes: 'Official council permits, waste disposal and security' },
        { category: 'Catering & Bar', name: 'Community Refreshments, BBQ / Food Trucks', percentage: focus === 'catering' ? 0.35 : 0.28, notes: 'Wholesome communal meal and water hydration stations' },
        { category: 'Music & Entertainment', name: 'Public PA System, Stage & Local Musicians', percentage: focus === 'entertainment' ? 0.25 : 0.18, notes: 'Outdoor sound equipment and performance lineup' },
        { category: 'Invitations & Marketing', name: 'Signage, Banners, Posters & Flyers', percentage: 0.10, notes: 'Printed banners, road signs, and digital neighborhood ads' },
        { category: 'Contingency & Misc', name: 'First Aid Tent, Volunteer Gear & Emergency Fund', percentage: 0.12, notes: 'Safety vests, first aid supplies, rain ponchos' },
        { category: 'Floral & Decor', name: 'Eco-Friendly Bunting, Seedling Tables & Plants', percentage: 0.07, notes: 'Reusable decor and native plant displays' }
      ];
    } else {
      ratios = [
        { category: 'Venue & Rentals', name: 'Banquet Hall or Private Loft', percentage: 0.30, notes: 'Seating, podium, and AV projectors' },
        { category: 'Catering & Bar', name: 'Passed Canapés & Cocktail Service', percentage: 0.35, notes: `Catering service for ${params.targetGuests} attendees` },
        { category: 'Music & Entertainment', name: 'Keynote Audio, DJ & Lighting', percentage: 0.15, notes: 'Professional sound tech and evening music' },
        { category: 'Photography & Video', name: 'Event Coverage & Portrait Station', percentage: 0.10, notes: 'Step-and-repeat backdrop and photographer' },
        { category: 'Contingency & Misc', name: 'Contingency & Incidentals', percentage: 0.10, notes: 'Buffer for unforeseen logistics' }
      ];
    }

    // Normalize percentages to exactly 1.0
    const sum = ratios.reduce((acc, r) => acc + r.percentage, 0);
    const normalized = ratios.map(r => ({
      ...r,
      percentage: r.percentage / sum
    }));

    return normalized.map((r, i) => {
      const estimated = Math.round(total * r.percentage);
      return {
        id: `bi-${i + 1}`,
        category: r.category,
        name: r.name,
        estimatedCost: estimated,
        actualCost: 0,
        paidCost: 0,
        status: 'planned' as const,
        notes: r.notes
      };
    });
  },

  /**
   * Generates tailored timeline milestones and day-of run-of-show
   */
  generatePhasedTimeline(params: GenerateEventParams): TimelineItem[] {
    const isWedding = params.type === 'wedding';
    const isCommunity = params.type === 'community' || params.type === 'festival';

    const items: TimelineItem[] = [];

    // Phase 1: Foundation
    items.push({
      id: 'tl-1',
      phase: 'foundation',
      title: isWedding ? 'Book Main Venue & Confirm Date' : isCommunity ? 'File Municipal Event & Noise Permits' : 'Secure Venue / Party Location',
      description: 'Review contract terms, pay initial deposit, and lock in the date on the master calendar.',
      targetDateOrTime: isWedding ? '6-9 Months Before' : '4-6 Weeks Before',
      completed: true,
      priority: 'high'
    });

    items.push({
      id: 'tl-2',
      phase: 'foundation',
      title: 'Define Theme, Atmosphere & Estimated Headcount',
      description: `Establish target of ${params.targetGuests} guests and aesthetic vibe: "${params.vibe}".`,
      targetDateOrTime: isWedding ? '5 Months Before' : '3 Weeks Before',
      completed: true,
      priority: 'high'
    });

    // Phase 2: Bookings
    items.push({
      id: 'tl-3',
      phase: 'bookings',
      title: isWedding ? 'Hire Lead Photographer, Florist & Caterer' : isCommunity ? 'Partner with Food Vendors & Community Volunteers' : 'Order Custom Cake & Entertainment',
      description: 'Send contract inquiries, verify insurance, and finalize service agreements.',
      targetDateOrTime: isWedding ? '3-4 Months Before' : '2 Weeks Before',
      completed: false,
      priority: 'high'
    });

    items.push({
      id: 'tl-4',
      phase: 'bookings',
      title: 'Send Official Invitations & Launch RSVP Collection',
      description: 'Gather guest responses, track dietary preferences, and send reminder notes.',
      targetDateOrTime: isWedding ? '8-10 Weeks Before' : '10 Days Before',
      completed: false,
      priority: 'medium'
    });

    // Phase 3: Final Prep
    items.push({
      id: 'tl-5',
      phase: 'final_prep',
      title: 'Finalize Seating, Headcount & Vendor Arrival Times',
      description: 'Provide final numbers to catering team and share delivery schedule with venue manager.',
      targetDateOrTime: '5 Days Before',
      completed: false,
      priority: 'high'
    });

    items.push({
      id: 'tl-6',
      phase: 'final_prep',
      title: 'Prepare Emergency Kit & Day-of Contact Binder',
      description: 'Print run of show, vendor contact sheet, phone numbers, and pack tape, scissors, first aid.',
      targetDateOrTime: '2 Days Before',
      completed: false,
      priority: 'medium'
    });

    // Phase 4: Day-of Run of Show
    items.push({
      id: 'tl-7',
      phase: 'day_of',
      title: 'Venue Access & Morning Setup Kickoff',
      description: 'Unload decor, set tables, verify audio/mic connections, and coordinate floral arrivals.',
      targetDateOrTime: '09:00 AM',
      completed: false,
      priority: 'high'
    });

    items.push({
      id: 'tl-8',
      phase: 'day_of',
      title: 'Vendor Check-In & Sound Check',
      description: 'Confirm caterer prep area, test PA system microphones, and review cue sheet.',
      targetDateOrTime: '11:30 AM',
      completed: false,
      priority: 'medium'
    });

    items.push({
      id: 'tl-9',
      phase: 'day_of',
      title: 'Guest Doors Open & Welcome Refreshments',
      description: 'Background ambient music playing, welcome drinks served, greeters at the front.',
      targetDateOrTime: isWedding ? '03:30 PM' : '01:00 PM',
      completed: false,
      priority: 'medium'
    });

    items.push({
      id: 'tl-10',
      phase: 'day_of',
      title: isWedding ? 'Grand Ceremony Procession & Vows' : isCommunity ? 'Opening Welcome & Community Kickoff' : 'Main Event & Action Activities',
      description: 'Core ceremony or main planned entertainment commences.',
      targetDateOrTime: isWedding ? '04:00 PM' : '01:30 PM',
      completed: false,
      priority: 'high'
    });

    items.push({
      id: 'tl-11',
      phase: 'day_of',
      title: 'Meal Service & Celebratory Toasts',
      description: 'Dinner/lunch service begins, followed by curated host speeches and cake/dessert.',
      targetDateOrTime: isWedding ? '06:00 PM' : '03:00 PM',
      completed: false,
      priority: 'high'
    });

    items.push({
      id: 'tl-12',
      phase: 'day_of',
      title: 'Grand Finale & Tear Down / Departure',
      description: 'Final dance or celebration send-off, pack personal items, and sign off with venue staff.',
      targetDateOrTime: isWedding ? '10:30 PM' : '05:00 PM',
      completed: false,
      priority: 'high'
    });

    return items;
  },

  /**
   * Generates realistic initial vendor records with tailored negotiation questions
   */
  generateVendors(params: GenerateEventParams, budgetItems: BudgetItem[]): Vendor[] {
    const vendors: Vendor[] = [];

    budgetItems.slice(0, 4).forEach((item, idx) => {
      let contact = 'Event Coordinator';
      let company = `${params.location.split(',')[0].trim()} ${item.category.split('&')[0].trim()} Co.`;

      if (item.category.includes('Venue')) {
        company = `${params.location.split(',')[0].trim()} Event Hall`;
        contact = 'Jessica Morales';
      } else if (item.category.includes('Catering')) {
        company = 'Artisan Palate Kitchens';
        contact = 'Chef Anthony Russo';
      } else if (item.category.includes('Photography')) {
        company = 'Momentum Visual Arts';
        contact = 'Taylor Hayes';
      } else if (item.category.includes('Music')) {
        company = 'Sonic Grooves Entertainment';
        contact = 'DJ Marcus Reed';
      }

      vendors.push({
        id: `v-${idx + 1}`,
        category: item.category,
        name: company,
        contactPerson: contact,
        email: `contact@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        phone: '(555) 234-' + (1000 + idx * 111),
        status: 'quoted',
        quotedCost: item.estimatedCost,
        agreedCost: item.estimatedCost,
        notes: `Initial quote based on ${params.targetGuests} attendees.`,
        keyQuestions: [
          'What are the cancellation and date-change policies?',
          'Do you supply your own power and backup equipment?',
          'When is the final balance due relative to event day?'
        ]
      });
    });

    return vendors;
  },

  /**
   * Generates creative concepts, themes, palettes, speeches, and cost-saving tips,
   * dynamically weaving in the user's specific vibe and atmosphere.
   */
  generateCreativeIdeas(params: GenerateEventParams): PersonalizedIdeas {
    const isWedding = params.type === 'wedding';
    const isBirthday = params.type === 'birthday';
    const isCommunity = params.type === 'community' || params.type === 'festival';

    const userVibe = params.vibe || 'Warm, Celebratory & Memorable';

    let themeName = `Luminous Harmony: ${userVibe.split(',')[0].trim()}`;
    let themeDescription = `An elevated, heartfelt gathering styled around "${userVibe}" with seamless hospitality and tailored ambiance.`;
    let colorPalette = [
      { name: 'Midnight Navy', hex: '#0f172a' },
      { name: 'Warm Champagne', hex: '#fef08a' },
      { name: 'Rose Quartz', hex: '#f43f5e' },
      { name: 'Soft Sage', hex: '#84cc16' }
    ];

    if (isWedding) {
      themeName = `Botanical Romance: ${userVibe.split(',')[0].trim()}`;
      themeDescription = `An organic harmony of ethereal textures, ambient candlelight, heirloom wood, and botanical romance celebrating "${userVibe}".`;
      colorPalette = [
        { name: 'Deep Evergreen', hex: '#14532d' },
        { name: 'Brushed Gold', hex: '#ca8a04' },
        { name: 'Ivory Chiffon', hex: '#fdfbf7' },
        { name: 'Dusty Mauve', hex: '#a855f7' }
      ];
    } else if (isBirthday) {
      themeName = `Dynamic Fiesta: ${userVibe.split(',')[0].trim()}`;
      themeDescription = `A vibrant, high-energy festival of light, color, upbeat music, and interactive memories inspired by "${userVibe}".`;
      colorPalette = [
        { name: 'Neon Coral', hex: '#ff007f' },
        { name: 'Electric Cobalt', hex: '#2563eb' },
        { name: 'Solar Flare Yellow', hex: '#facc15' },
        { name: 'Charcoal Black', hex: '#18181b' }
      ];
    } else if (isCommunity) {
      themeName = `United Neighbors: ${userVibe.split(',')[0].trim()}`;
      themeDescription = `A civic celebration highlighting local talents, green practices, communal joy, and friendly unity themed around "${userVibe}".`;
      colorPalette = [
        { name: 'Earthy Terra Cotta', hex: '#c2410c' },
        { name: 'Meadow Green', hex: '#15803d' },
        { name: 'Sky Blue', hex: '#0284c7' },
        { name: 'Sunbeam Gold', hex: '#eab308' }
      ];
    }

    return {
      themeName,
      themeDescription,
      colorPalette,
      activities: [
        {
          name: isWedding ? 'Audio Guestbook Phone' : isBirthday ? 'Glow-in-the-Dark Quest' : 'Neighborhood Mural Live Art Station',
          description: isWedding ? `Guests record heartfelt advice reflecting the "${userVibe}" celebration vibe.` : isBirthday ? `Teams collaborate to solve riddles in a fast-paced activity themed around "${userVibe}".` : `Attendees paint a collective banner celebrating neighborhood history in ${params.location}.`,
          targetAudience: 'All Guests',
          duration: 'Ongoing'
        },
        {
          name: isWedding ? 'Late-Night Fire Pit S’mores' : isBirthday ? 'Custom T-Shirt Printing Station' : 'Local Talent Acoustic Showcase',
          description: 'A dedicated interactive highlight that keeps guest energy lively and engaged.',
          targetAudience: 'All Ages',
          duration: '45 Minutes'
        }
      ],
      cateringHighlights: [
        `Seasonal culinary menu crafted for ${params.targetGuests} guests with inclusive vegan and gluten-free accommodations`,
        `Signature Cocktail & Mocktail curated for a "${userVibe}" celebration`,
        'Interactive sweet treats dessert bar'
      ],
      playlistVibe: {
        mood: `${userVibe} curated music arc starting mellow and building to energetic celebration`,
        sampleTracks: [
          'Warm Acoustic Welcome Covers',
          'Feel-Good Soul & Golden Age Motown',
          'Modern Dance & High-Energy Anthems'
        ]
      },
      customSpeeches: [
        {
          title: 'Opening Welcome Speech',
          role: 'Lead Host',
          text: `Welcome everyone to ${params.title}! Looking out and seeing so many cherished faces gathered here in ${params.location} means the world to us. Today is all about celebrating "${userVibe}" and creating memories that outlast this evening. Please enjoy the food, laughter, and camaraderie!`
        }
      ],
      decorSuggestions: [
        'Cluster varied heights of warm LED pillar candles for maximum aesthetic romance and safety.',
        `Use custom signage reflecting the "${userVibe}" aesthetic at entrance and food stations.`
      ],
      costSavingTips: [
        'Select in-season local produce and seasonal flowers to cut vendor transport fees by up to 30%.',
        'Opt for a signature His & Hers cocktail rather than an unrestricted top-shelf open bar.',
        'Digital RSVPs with QR codes eliminate return postage costs and reduce paper waste.'
      ]
    };
  },

  /**
   * Responds intelligently to user chat queries using either Live Gemini API or the built-in Heuristic AI Engine
   */
  async askAssistant(
    prompt: string,
    currentEvent: EventPlan,
    aiSettings: AISettings
  ): Promise<{ text: string; suggestions?: string[] }> {
    // If user provided a Gemini API Key, attempt secure live Gemini call
    if (aiSettings.apiKey && aiSettings.apiKey.trim() !== '') {
      try {
        const liveResponse = await this.callGeminiAPI(prompt, currentEvent, aiSettings);
        if (liveResponse) {
          return liveResponse;
        }
      } catch (err) {
        console.warn('Gemini API call failed, evaluating fallback behavior', err);
        // Honor useOfflineFallback configuration
        if (aiSettings.useOfflineFallback === false) {
          throw new Error('Gemini API connection error. Offline fallback is disabled in settings.');
        }
      }
    }

    // Built-in Autonomous Intelligent Assistant Engine
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
- Pending Timeline Tasks: ${currentEvent.timelineItems.filter(t => !t.completed).length} incomplete
- Vibe: ${currentEvent.vibe}

Provide specific, practical, highly creative, and mathematically sound suggestions. Format your response cleanly in Markdown. Provide 2-3 short follow-up suggestion prompts at the end separated by a line starting with "SUGGESTIONS:".
`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${contextSummary}\n\nUser Question:\n${prompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': aiSettings.apiKey.trim()
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    // Parse suggestions if included
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

  /**
   * Autonomous intelligent planner logic when offline or running without external API key
   */
  autonomousAgentRespond(
    prompt: string,
    currentEvent: EventPlan
  ): { text: string; suggestions?: string[] } {
    const q = prompt.toLowerCase();
    const currency = currentEvent.currencySymbol;
    const totalBudgetSafe = currentEvent.totalBudget || 1;
    const spent = currentEvent.budgetItems.reduce((acc, b) => acc + (b.actualCost || b.estimatedCost), 0);
    const balance = currentEvent.totalBudget - spent;
    const daysLeft = this.calculateDaysRemaining(currentEvent.date);

    // 1. Budget & Cost Trimming
    if (q.includes('budget') || q.includes('save') || q.includes('cost') || q.includes('cheap') || q.includes('expensive')) {
      return {
        text: `### 💡 Budget Optimization Report for ${currentEvent.title}
**Financial Snapshot:**
- **Total Budget:** ${currency}${currentEvent.totalBudget.toLocaleString()}
- **Allocated / Committed:** ${currency}${spent.toLocaleString()} (${Math.round((spent / totalBudgetSafe) * 100)}%)
- **Remaining Buffer:** ${currency}${balance.toLocaleString()}

**Smart Strategic Trimming Recommendations:**
1. **BYO Bar or Specialty Signature Cocktail:** Instead of an unrestricted full-shelf open bar, serve local craft beer, house wine, and 2 curated signature cocktails. *Typical savings: 25% to 40% on beverage spend.*
2. **Sheet Cakes & Display Cutting Tier:** Display a gorgeous 1-tier artisan cake for photos and ceremonial cutting, with pre-sliced bakery sheet cakes prepared in the kitchen. *Estimated savings: ${currency}300 - ${currency}600.*
3. **Lighting Over Florals:** Repurpose ceremony floral arches behind the main head table. Swap high floral centerpieces with clusters of varying-height LED pillar candles and fresh eucalyptus runners.
4. **Digital & QR-Code Stationery:** Send digital save-the-dates and print single-sheet reception menus with a QR code linking to the full wedding program and photo upload album.`,
        suggestions: [
          'Show me a breakdown of catering costs',
          'How can I handle unexpected vendor price hikes?',
          'What percentage of budget should be in contingency?'
        ]
      };
    }

    // 2. Timeline & Schedule
    if (q.includes('timeline') || q.includes('schedule') || q.includes('time') || q.includes('run of show') || q.includes('day-of')) {
      return {
        text: `### ⏱️ Day-of Run of Show Blueprint: ${currentEvent.title}
*Target Date: ${currentEvent.date} (${daysLeft > 0 ? `${daysLeft} days from now` : 'Today'}!)*

**Key Synchronized Milestones:**
- **T - 4 Hours (Setup & First Arrivals):** Lead coordinator and floral team arrive at **${currentEvent.location}**. Audio and sound engineering check.
- **T - 2.5 Hours (Photo & Staging):** Couple / host party portraits and detail shots (rings, decor, centerpieces before guests enter).
- **T - 45 Minutes (Doors & Acoustic Welcome):** Ambient music begins; welcome lemonade/infused water served.
- **T - 0 (The Main Ceremony / Kickoff):** Procession, vows, or host welcome address (target duration: 30-40 minutes).
- **T + 45 Minutes (Cocktail / Interactive Hour):** Passed hors d'oeuvres and interactive guestbook.
- **T + 2 Hours (Dinner & Speeches):** Meal served; speeches scheduled between courses to keep energy moving.
- **T + 3.5 Hours (Dance Floor / Finale):** First dance or headline entertainment kicks off.
- **T + 5 Hours (Grand Send-Off & Departure):** Sparkler / cheer tunnel send-off and vendor load-out.`,
        suggestions: [
          'How to avoid speeches running too long?',
          'What buffer should I add between ceremony and dinner?',
          'Export this schedule to my calendar (.ics)'
        ]
      };
    }

    // 3. Speech & Toast writing
    if (q.includes('speech') || q.includes('toast') || q.includes('vow') || q.includes('words')) {
      return {
        text: `### 🎙️ Personalized Toast & Speech Template
**Role: Lead Host / Co-Planner**
**Tone: Warm, Humorous & Touching**

> *"Ladies and gentlemen, friends, and honored guests—welcome! Looking around this room at ${currentEvent.location}, my heart is completely full.*
> 
> *Planning this celebration reminded us of one eternal truth: life's greatest moments are not defined by the perfection of the decor, but by the warmth of the people who fill the chairs.*
> 
> *To everyone who traveled near and far, who helped setup chairs, who sent prayers and kind words—thank you. Let us raise a glass to love, to friendship, and to making memories that will make us smile decades from today. Cheers!"*

**Pro Tips for Delivery:**
- Keep it strictly between **2.5 to 3.5 minutes** (approx 350-450 words).
- Speak slowly; pause after jokes or poignant memories to let the room react.
- Look directly at the honored persons, not just your index card or phone.`,
        suggestions: [
          'Write a funny Best Man speech',
          'Write a welcome speech for a community festival',
          'Write a tearful speech for a 10th birthday'
        ]
      };
    }

    // 4. Vendors & Negotiations
    if (q.includes('vendor') || q.includes('caterer') || q.includes('contract') || q.includes('photographer') || q.includes('questions')) {
      return {
        text: `### 🤝 Vendor Master Checklist & Negotiation Playbook
You currently have **${currentEvent.vendors.length} vendors** in your directory.

**5 Mandatory Contract Clauses to Verify Before Signing:**
1. **Force Majeure & Inclement Weather:** Does the contract guarantee indoor relocation or reschedule flexibility without losing 100% of the deposit?
2. **Overtime Rates:** What is the hourly charge if the dance floor or speeches run 30 minutes over? (Get this in writing).
3. **Crew Meals:** How many hot meals are required for the photographer, videographer, and DJ? (Usually 1 hot meal for vendors on-site 5+ hours).
4. **Backup Equipment & Replacement Policy:** If the lead shooter or DJ falls ill on event morning, who is their designated, insured backup?
5. **Timeline of Deliverables:** Explicit date guarantees (e.g. "Sneak peek photos within 48 hours; full edited gallery within 6 weeks").`,
        suggestions: [
          'What questions to ask a wedding venue?',
          'How to negotiate catering quotes down?',
          'Add a new vendor to my list'
        ]
      };
    }

    // 5. Dietary, Catering & Drinks
    if (q.includes('food') || q.includes('menu') || q.includes('diet') || q.includes('vegan') || q.includes('cocktail') || q.includes('catering')) {
      return {
        text: `### 🍽️ Inclusive Menu & Dietary Engineering
Planning for **${currentEvent.targetGuests} attendees** with seamless hospitality:

**The Golden 3-Rule Dietary Formula:**
1. **Universal Hors d'Oeuvres:** Ensure at least 2 of 4 passed appetizers are naturally gluten-free and vegetarian (e.g., balsamic glazed caprese skewers; whipped goat cheese on polenta bites).
2. **Pre-Plated Special Orders:** Instruct the head chef to serve dietary guests (vegan, celiac, nut-free) at the exact same moment as the general tables so no guest waits alone.
3. **Signature Drinks:**
   - *Signature Cocktail:* Refreshing Citrus Herb Spritz (e.g., Gin or Vodka, St-Germain, fresh rosemary, club soda).
   - *Signature Mocktail (Zero-Proof):* Pomegranate Blood Orange Fizz with muddled mint—equally elevated in glassware!`,
        suggestions: [
          'Suggest kid-friendly party food',
          'How much alcohol do I need for 150 guests?',
          'Budget friendly late-night snack ideas'
        ]
      };
    }

    // Default Context-Rich Response
    return {
      text: `### 🌟 CelebrAIte Assistant: Ready to Help!
I am actively synced with **"${currentEvent.title}"** (*${currentEvent.type} on ${currentEvent.date}*).

**Current Event Health:**
- **Guest List:** ${currentEvent.targetGuests} anticipated guests.
- **Budget Status:** ${currency}${spent.toLocaleString()} allocated out of ${currency}${currentEvent.totalBudget.toLocaleString()} (${currency}${balance.toLocaleString()} remaining).
- **Milestones:** ${currentEvent.timelineItems.filter(t => t.completed).length} completed of ${currentEvent.timelineItems.length} total tasks.
- **Theme Concept:** *${currentEvent.personalizedIdeas.themeName}* (${currentEvent.vibe}).

How would you like to level up your plan right now? I can optimize budgets, draft emergency contingency plans, write speeches, or tailor activities!`,
      suggestions: [
        'How can I save 15% on my overall budget?',
        'Generate an emergency rain backup plan',
        'Suggest 3 fun interactive games for my guests'
      ]
    };
  },

  calculateDaysRemaining(dateStr: string): number {
    try {
      const target = new Date(dateStr).getTime();
      const now = new Date().getTime();
      const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      return isNaN(diff) ? 0 : diff;
    } catch {
      return 0;
    }
  },

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};
