import { GenerateEventParams, PersonalizedIdeas } from '../../types';

/**
 * Generates creative concepts, themes, palettes, speeches, activities, and cost-saving tips,
 * dynamically incorporating the user's specific vibe and atmosphere.
 *
 * @param params - User configuration containing event title, location, vibe, guest count, and type
 * @returns Comprehensive creative plan including theme, color palette, custom speech, and tips
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
