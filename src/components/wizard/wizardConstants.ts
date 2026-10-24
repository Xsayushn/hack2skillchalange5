import { EventType } from '../../types';

export interface ArchetypeConfig {
  type: EventType;
  icon: string;
  title: string;
  desc: string;
  defaultVibe: string;
  defaultBudget: number;
}

export const EVENT_ARCHETYPES: ArchetypeConfig[] = [
  {
    type: 'wedding',
    icon: '💍',
    title: 'Wedding & Reception',
    desc: 'Ceremony, cocktail hour, dinner, floral styling & guest hospitality',
    defaultVibe: 'Romantic, Timeless, Botanical & Candlelit Elegance',
    defaultBudget: 30000
  },
  {
    type: 'birthday',
    icon: '🎂',
    title: 'Milestone Birthday Party',
    desc: 'Fun activities, custom themed cake, energetic decor & memories',
    defaultVibe: 'High-Energy, Pop-Art, Lively & Unforgettable',
    defaultBudget: 2500
  },
  {
    type: 'community',
    icon: '🌳',
    title: 'Community Festival & Clean-Up',
    desc: 'Eco-drives, volunteer logistics, food trucks, street permits & music',
    defaultVibe: 'Neighborly, Vibrant, Green & Family-Friendly',
    defaultBudget: 5000
  },
  {
    type: 'corporate',
    icon: '🏛️',
    title: 'Gala, Fundraiser or Reunion',
    desc: 'Keynote speakers, banquet dinner, audio-visual stage & networking',
    defaultVibe: 'Sophisticated, Inspiring, Polished & Warm',
    defaultBudget: 15000
  }
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
  { code: 'CAD', symbol: '$' },
  { code: 'AUD', symbol: '$' }
];

export interface PriorityOption {
  id: 'balanced' | 'catering' | 'entertainment' | 'decor' | 'photo';
  label: string;
  sub: string;
}

export const PRIORITY_OPTIONS: PriorityOption[] = [
  { id: 'balanced', label: 'Balanced Standard', sub: 'Optimal industry benchmark split' },
  {
    id: 'catering',
    label: 'Gourmet Food & Drinks First',
    sub: 'Elevate culinary & open bar budget'
  },
  {
    id: 'entertainment',
    label: 'Live Entertainment First',
    sub: 'Premium live band & experiences'
  },
  { id: 'decor', label: 'Lush Decor & Aesthetics', sub: 'Max floral & atmospheric lighting' },
  { id: 'photo', label: 'Visual Memories First', sub: 'Full day drone & 2 shooters' }
];
