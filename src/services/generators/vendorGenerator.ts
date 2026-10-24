import { BudgetItem, GenerateEventParams, Vendor } from '../../types';

/**
 * Generates initial vendor records with tailored negotiation questions and estimated costs.
 *
 * @param params - User configuration containing location, guest count, and event details
 * @param budgetItems - Existing budget items used to align initial vendor categories and quotes
 * @returns An array of initial Vendor contacts with negotiation questions and contact data
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
