export type EventType = 
  | 'wedding' 
  | 'birthday' 
  | 'community' 
  | 'corporate' 
  | 'anniversary' 
  | 'festival';

export type BudgetCategory = 
  | 'Venue & Rentals'
  | 'Catering & Bar'
  | 'Photography & Video'
  | 'Music & Entertainment'
  | 'Floral & Decor'
  | 'Attire & Styling'
  | 'Invitations & Marketing'
  | 'Logistics & Permits'
  | 'Favors & Gifts'
  | 'Contingency & Misc';

export type PaymentStatus = 'planned' | 'deposit_paid' | 'paid_in_full';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  estimatedCost: number;
  actualCost: number;
  paidCost: number;
  status: PaymentStatus;
  vendorId?: string;
  notes?: string;
}

export type TimelinePhase = 
  | 'foundation' // Months before
  | 'bookings'   // Weeks before
  | 'final_prep' // Week/Days before
  | 'day_of';    // Day of event (Run of Show)

export interface TimelineItem {
  id: string;
  phase: TimelinePhase;
  title: string;
  description: string;
  targetDateOrTime: string; // e.g. "6 Months Prior", "10:00 AM"
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string;
}

export type VendorStatus = 'researching' | 'contacted' | 'quoted' | 'booked' | 'completed';

export interface Vendor {
  id: string;
  category: BudgetCategory;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: VendorStatus;
  quotedCost: number;
  agreedCost: number;
  notes: string;
  keyQuestions?: string[];
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface PersonalizedIdeas {
  themeName: string;
  themeDescription: string;
  colorPalette: ColorSwatch[];
  activities: {
    name: string;
    description: string;
    targetAudience: string;
    duration: string;
  }[];
  cateringHighlights: string[];
  playlistVibe: {
    mood: string;
    sampleTracks: string[];
  };
  customSpeeches: {
    title: string;
    role: string;
    text: string;
  }[];
  decorSuggestions: string[];
  costSavingTips: string[];
}

export type RsvpStatus = 'confirmed' | 'declined' | 'pending';

export interface Guest {
  id: string;
  name: string;
  group: string; // e.g. "Bride's Family", "Neighbors", "Kids"
  rsvpStatus: RsvpStatus;
  dietaryNotes?: string;
  plusOnes: number;
  tableOrZone?: string;
}

export interface EventPlan {
  id: string;
  title: string;
  type: EventType;
  date: string;
  targetGuests: number;
  location: string;
  vibe: string;
  totalBudget: number;
  currency: string;
  currencySymbol: string;
  budgetItems: BudgetItem[];
  timelineItems: TimelineItem[];
  vendors: Vendor[];
  personalizedIdeas: PersonalizedIdeas;
  guests: Guest[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestions?: string[];
  category?: 'general' | 'budget' | 'timeline' | 'vendor' | 'ideas';
}

export interface AISettings {
  apiKey: string;
  model: string;
  useOfflineFallback: boolean;
}
