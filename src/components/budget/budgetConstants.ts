import { BudgetCategory } from '../../types';

export const CATEGORIES: BudgetCategory[] = [
  'Venue & Rentals',
  'Catering & Bar',
  'Photography & Video',
  'Music & Entertainment',
  'Floral & Decor',
  'Attire & Styling',
  'Invitations & Marketing',
  'Logistics & Permits',
  'Favors & Gifts',
  'Contingency & Misc'
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
  { code: 'CAD', symbol: '$' },
  { code: 'AUD', symbol: '$' }
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Venue & Rentals': '#6366f1',
  'Catering & Bar': '#ec4899',
  'Photography & Video': '#06b6d4',
  'Music & Entertainment': '#f59e0b',
  'Floral & Decor': '#10b981',
  'Attire & Styling': '#8b5cf6',
  'Invitations & Marketing': '#3b82f6',
  'Logistics & Permits': '#64748b',
  'Favors & Gifts': '#d946ef',
  'Contingency & Misc': '#f43f5e'
};
