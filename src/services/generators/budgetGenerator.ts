import { BudgetCategory, BudgetItem, GenerateEventParams } from '../../types';

/**
 * Capitalizes the first character of an input string.
 *
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

interface RatioConfig {
  category: BudgetCategory;
  name: string;
  percentage: number;
  notes: string;
}

/**
 * Generates an intelligent budget distribution based on event type, total budget,
 * and user priority focus weighting.
 *
 * @param params - User configuration containing budget, event type, guest count, and priorities
 * @returns An array of normalized budget items summing to the target budget
 */
export function generateBudgetBreakdown(params: GenerateEventParams): BudgetItem[] {
  const total = Number(params.totalBudget) || 5000;
  const focus = params.priorityFocus || 'balanced';

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
