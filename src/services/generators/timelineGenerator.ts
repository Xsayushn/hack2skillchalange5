import { GenerateEventParams, TimelineItem } from '../../types';

/**
 * Generates tailored timeline milestones and day-of run-of-show phases.
 *
 * @param params - User configuration containing event title, type, guest count, and vibe
 * @returns An array of milestone tasks structured into foundation, bookings, final_prep, and day_of phases
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
