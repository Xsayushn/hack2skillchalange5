import { EventPlan } from '../types';

export function calculateDaysRemaining(dateStr: string): number {
  try {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return isNaN(diff) ? 0 : diff;
  } catch {
    return 0;
  }
}

/**
 * Autonomous intelligent planner logic when offline or running without external API key
 */
export function autonomousAgentRespond(
  prompt: string,
  currentEvent: EventPlan
): { text: string; suggestions?: string[] } {
  const q = prompt.toLowerCase();
  const currency = currentEvent.currencySymbol;
  const totalBudgetSafe = currentEvent.totalBudget || 1;
  const spent = currentEvent.budgetItems.reduce((acc, b) => acc + (b.actualCost || b.estimatedCost), 0);
  const balance = currentEvent.totalBudget - spent;
  const daysLeft = calculateDaysRemaining(currentEvent.date);

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
}
