import {
  BudgetCategory,
  BudgetItem,
  TimelineItem,
  Vendor,
  PersonalizedIdeas,
  GenerateEventParams
} from '../types';

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generates an intelligent budget distribution based on event type and priority weighting
 */
export function generateBudgetBreakdown(params: GenerateEventParams): BudgetItem[] {
  const total = Number(params.totalBudget) || 5000;
  const focus = params.priorityFocus || 'balanced';

  interface RatioConfig {
    category: BudgetCategory;
    name: string;
    percentage: number;
    notes: string;
  }

  let ratios: RatioConfig[];

  if (params.type === 'wedding') {
    ratios = [
      {
        category: 'Venue & Rentals',
        name: 'Main Ceremony & Reception Venue',
        percentage: 0.28,
        notes: 'Includes tables, baseline seating, and private suites'
      },
      {
        category: 'Catering & Bar',
        name: 'Plated/Buffet Dinner & Beverage Package',
        percentage: focus === 'catering' ? 0.36 : 0.31,
        notes: `Scaled for ${params.targetGuests} guests with cocktail hour`
      },
      {
        category: 'Photography & Video',
        name: 'Full-Day Visual Coverage & Drone Video',
        percentage: focus === 'photo' ? 0.16 : 0.12,
        notes: '8-10 hours coverage with high-resolution digital prints'
      },
      {
        category: 'Floral & Decor',
        name: 'Arbor Installation, Centerpieces & Ambient Lighting',
        percentage: focus === 'decor' ? 0.15 : 0.1,
        notes: 'Custom floral arrangements reflecting theme palette'
      },
      {
        category: 'Music & Entertainment',
        name: 'Ceremony Acoustic Duo & Evening Band/DJ',
        percentage: focus === 'entertainment' ? 0.13 : 0.08,
        notes: 'Microphones for speeches and full sound system'
      },
      {
        category: 'Attire & Styling',
        name: 'Gown, Suits, Accessories & Bridal Glam',
        percentage: 0.05,
        notes: 'Fittings and day-of beauty coordinator'
      },
      {
        category: 'Invitations & Marketing',
        name: 'Stationery Suite, Calligraphy & RSVP Site',
        percentage: 0.02,
        notes: 'Save-the-dates and day-of signage'
      },
      {
        category: 'Favors & Gifts',
        name: 'Curated Guest Keepsakes & Bridal Party Gifts',
        percentage: 0.02,
        notes: 'Artisanal tokens and thank-you bundles'
      },
      {
        category: 'Contingency & Misc',
        name: 'Emergency Rainy Day Buffer & Permits',
        percentage: 0.02,
        notes: 'Reserved for last-minute weather or transport changes'
      }
    ];
  } else if (params.type === 'birthday') {
    ratios = [
      {
        category: 'Venue & Rentals',
        name: 'Private Party Space & Activity Arena',
        percentage: 0.32,
        notes: 'Covers private hall rental with sound & setup'
      },
      {
        category: 'Catering & Bar',
        name: 'Specialty Bites, Refreshments & Custom Cake',
        percentage: focus === 'catering' ? 0.32 : 0.26,
        notes: `Tiered theme cake and finger food for ${params.targetGuests} guests`
      },
      {
        category: 'Music & Entertainment',
        name: 'Live Entertainer, DJ or Character Stunt Lead',
        percentage: focus === 'entertainment' ? 0.25 : 0.18,
        notes: 'Interactive games and energetic hosting'
      },
      {
        category: 'Floral & Decor',
        name: 'Theme Backdrop, Balloon Installations & Props',
        percentage: focus === 'decor' ? 0.2 : 0.12,
        notes: 'High-impact photo station and table decor'
      },
      {
        category: 'Photography & Video',
        name: 'Highlight Candid Photographer',
        percentage: focus === 'photo' ? 0.12 : 0.05,
        notes: '2 hours of candid cake cutting and games coverage'
      },
      {
        category: 'Favors & Gifts',
        name: 'Custom Goodie Bags & Swag',
        percentage: 0.05,
        notes: 'Themed gift bags for every attendee'
      },
      {
        category: 'Contingency & Misc',
        name: 'Miscellaneous Supplies & Spares',
        percentage: 0.02,
        notes: 'Extra games, prizes, and unexpected guests'
      }
    ];
  } else if (params.type === 'community' || params.type === 'festival') {
    ratios = [
      {
        category: 'Logistics & Permits',
        name: 'City Permits, Street Barriers & Sanitation',
        percentage: 0.25,
        notes: 'Official council permits, waste disposal and security'
      },
      {
        category: 'Catering & Bar',
        name: 'Community Refreshments, BBQ / Food Trucks',
        percentage: focus === 'catering' ? 0.35 : 0.28,
        notes: 'Wholesome communal meal and water hydration stations'
      },
      {
        category: 'Music & Entertainment',
        name: 'Public PA System, Stage & Local Musicians',
        percentage: focus === 'entertainment' ? 0.25 : 0.18,
        notes: 'Outdoor sound equipment and performance lineup'
      },
      {
        category: 'Invitations & Marketing',
        name: 'Signage, Banners, Posters & Flyers',
        percentage: 0.1,
        notes: 'Printed banners, road signs, and digital neighborhood ads'
      },
      {
        category: 'Contingency & Misc',
        name: 'First Aid Tent, Volunteer Gear & Emergency Fund',
        percentage: 0.12,
        notes: 'Safety vests, first aid supplies, rain ponchos'
      },
      {
        category: 'Floral & Decor',
        name: 'Eco-Friendly Bunting, Seedling Tables & Plants',
        percentage: 0.07,
        notes: 'Reusable decor and native plant displays'
      }
    ];
  } else {
    ratios = [
      {
        category: 'Venue & Rentals',
        name: 'Banquet Hall or Private Loft',
        percentage: 0.3,
        notes: 'Seating, podium, and AV projectors'
      },
      {
        category: 'Catering & Bar',
        name: 'Passed Canapés & Cocktail Service',
        percentage: 0.35,
        notes: `Catering service for ${params.targetGuests} attendees`
      },
      {
        category: 'Music & Entertainment',
        name: 'Keynote Audio, DJ & Lighting',
        percentage: 0.15,
        notes: 'Professional sound tech and evening music'
      },
      {
        category: 'Photography & Video',
        name: 'Event Coverage & Portrait Station',
        percentage: 0.1,
        notes: 'Step-and-repeat backdrop and photographer'
      },
      {
        category: 'Contingency & Misc',
        name: 'Contingency & Incidentals',
        percentage: 0.1,
        notes: 'Buffer for unforeseen logistics'
      }
    ];
  }

  // Normalize percentages to exactly 1.0
  const sum = ratios.reduce((acc, r) => acc + r.percentage, 0);
  const normalized = ratios.map((r) => ({
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
}

/**
 * Generates tailored timeline milestones and day-of run-of-show
 */
export function generatePhasedTimeline(params: GenerateEventParams): TimelineItem[] {
  const isWedding = params.type === 'wedding';
  const isCommunity = params.type === 'community' || params.type === 'festival';

  const items: TimelineItem[] = [];

  // Phase 1: Foundation
  items.push({
    id: 'tl-1',
    phase: 'foundation',
    title: isWedding
      ? 'Book Main Venue & Confirm Date'
      : isCommunity
        ? 'File Municipal Event & Noise Permits'
        : 'Secure Venue / Party Location',
    description:
      'Review contract terms, pay initial deposit, and lock in the date on the master calendar.',
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
    title: isWedding
      ? 'Hire Lead Photographer, Florist & Caterer'
      : isCommunity
        ? 'Partner with Food Vendors & Community Volunteers'
        : 'Order Custom Cake & Entertainment',
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
    description:
      'Provide final numbers to catering team and share delivery schedule with venue manager.',
    targetDateOrTime: '5 Days Before',
    completed: false,
    priority: 'high'
  });

  items.push({
    id: 'tl-6',
    phase: 'final_prep',
    title: 'Prepare Emergency Kit & Day-of Contact Binder',
    description:
      'Print run of show, vendor contact sheet, phone numbers, and pack tape, scissors, first aid.',
    targetDateOrTime: '2 Days Before',
    completed: false,
    priority: 'medium'
  });

  // Phase 4: Day-of Run of Show
  items.push({
    id: 'tl-7',
    phase: 'day_of',
    title: 'Venue Access & Morning Setup Kickoff',
    description:
      'Unload decor, set tables, verify audio/mic connections, and coordinate floral arrivals.',
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
    title: isWedding
      ? 'Grand Ceremony Procession & Vows'
      : isCommunity
        ? 'Opening Welcome & Community Kickoff'
        : 'Main Event & Action Activities',
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
    description:
      'Final dance or celebration send-off, pack personal items, and sign off with venue staff.',
    targetDateOrTime: isWedding ? '10:30 PM' : '05:00 PM',
    completed: false,
    priority: 'high'
  });

  return items;
}

/**
 * Generates realistic initial vendor records with tailored negotiation questions
 */
export function generateVendors(params: GenerateEventParams, budgetItems: BudgetItem[]): Vendor[] {
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
}

/**
 * Generates creative concepts, themes, palettes, speeches, and cost-saving tips,
 * dynamically weaving in the user's specific vibe and atmosphere.
 */
export function generateCreativeIdeas(params: GenerateEventParams): PersonalizedIdeas {
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
        name: isWedding
          ? 'Audio Guestbook Phone'
          : isBirthday
            ? 'Glow-in-the-Dark Quest'
            : 'Neighborhood Mural Live Art Station',
        description: isWedding
          ? `Guests record heartfelt advice reflecting the "${userVibe}" celebration vibe.`
          : isBirthday
            ? `Teams collaborate to solve riddles in a fast-paced activity themed around "${userVibe}".`
            : `Attendees paint a collective banner celebrating neighborhood history in ${params.location}.`,
        targetAudience: 'All Guests',
        duration: 'Ongoing'
      },
      {
        name: isWedding
          ? 'Late-Night Fire Pit S’mores'
          : isBirthday
            ? 'Custom T-Shirt Printing Station'
            : 'Local Talent Acoustic Showcase',
        description:
          'A dedicated interactive highlight that keeps guest energy lively and engaged.',
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
}
