import { EventPlan } from '../types';

export const INITIAL_EVENTS: EventPlan[] = [
  {
    id: 'event-wedding-01',
    title: "Elena & Liam's Enchanted Forest Wedding",
    type: 'wedding',
    date: '2026-09-18',
    targetGuests: 150,
    location: 'Pinecrest Botanical Estate, Portland OR',
    vibe: 'Rustic Romantic & Whimsical with Candlelit Magic',
    totalBudget: 35000,
    currency: 'USD',
    currencySymbol: '$',
    budgetItems: [
      {
        id: 'b-1',
        category: 'Venue & Rentals',
        name: 'Botanical Glasshouse & Pavilion Rental',
        estimatedCost: 8500,
        actualCost: 8200,
        paidCost: 4000,
        status: 'deposit_paid',
        vendorId: 'v-1',
        notes: 'Includes tables, heirloom chairs, and lighting rig.'
      },
      {
        id: 'b-2',
        category: 'Catering & Bar',
        name: 'Farm-to-Table 3-Course Dinner & Craft Bar',
        estimatedCost: 11000,
        actualCost: 11500,
        paidCost: 5000,
        status: 'deposit_paid',
        vendorId: 'v-2',
        notes: 'Covers 150 guests plus vendor plates and late-night pretzel station.'
      },
      {
        id: 'b-3',
        category: 'Photography & Video',
        name: 'Full Day Photography + Drone Highlight Reel',
        estimatedCost: 4200,
        actualCost: 4000,
        paidCost: 2000,
        status: 'deposit_paid',
        vendorId: 'v-3',
        notes: '10 hours coverage with 2 shooters and digital gallery.'
      },
      {
        id: 'b-4',
        category: 'Floral & Decor',
        name: 'Forest Arch, Cascading Centerpieces & Fairy Lights',
        estimatedCost: 3500,
        actualCost: 3300,
        paidCost: 1500,
        status: 'deposit_paid',
        vendorId: 'v-4',
        notes: 'Eucalyptus, blush peonies, moss runners, and hanging lanterns.'
      },
      {
        id: 'b-5',
        category: 'Music & Entertainment',
        name: 'Acoustic Ceremony Duo + Evening Live Quintet',
        estimatedCost: 2800,
        actualCost: 2800,
        paidCost: 1000,
        status: 'deposit_paid',
        notes: 'Sound equipment provided by band for speeches and first dance.'
      },
      {
        id: 'b-6',
        category: 'Attire & Styling',
        name: 'Bridal Gown, Tuxedo & Hair/Makeup Package',
        estimatedCost: 2500,
        actualCost: 2400,
        paidCost: 2400,
        status: 'paid_in_full',
        notes: 'Fittings scheduled for mid-August.'
      },
      {
        id: 'b-7',
        category: 'Invitations & Marketing',
        name: 'Letterpress Suite, Custom Wax Seals & Website',
        estimatedCost: 700,
        actualCost: 650,
        paidCost: 650,
        status: 'paid_in_full',
        notes: 'All RSVP cards mailed; wedding portal active.'
      },
      {
        id: 'b-8',
        category: 'Favors & Gifts',
        name: 'Artisanal Wildflower Honey Jars & Seed Packets',
        estimatedCost: 600,
        actualCost: 550,
        paidCost: 550,
        status: 'paid_in_full',
        notes: 'Custom calligraphed thank you tags attached.'
      },
      {
        id: 'b-9',
        category: 'Contingency & Misc',
        name: 'Emergency Fund & Weather Buffer Tent Deposit',
        estimatedCost: 1200,
        actualCost: 0,
        paidCost: 0,
        status: 'planned',
        notes: 'Reserved in case heaters or sidewall clear drapes are required.'
      }
    ],
    timelineItems: [
      {
        id: 't-1',
        phase: 'foundation',
        title: 'Lock In Primary Venue & Security Deposit',
        description: 'Signed contract for Pinecrest Estate glasshouse and paid 50% reservation deposit.',
        targetDateOrTime: '6 Months Prior',
        completed: true,
        priority: 'high'
      },
      {
        id: 't-2',
        phase: 'foundation',
        title: 'Send Save the Dates & Launch RSVP Portal',
        description: 'Sent digital and paper save-the-dates with accommodations hotel block code.',
        targetDateOrTime: '5 Months Prior',
        completed: true,
        priority: 'high'
      },
      {
        id: 't-3',
        phase: 'bookings',
        title: 'Menu Tasting & Specialty Cocktail Curation',
        description: 'Taste seasonal entrees and finalize His & Hers signature drinks with Cedar Grove Catering.',
        targetDateOrTime: '8 Weeks Prior',
        completed: true,
        priority: 'medium'
      },
      {
        id: 't-4',
        phase: 'bookings',
        title: 'Finalize Floral Mockups & Centerpiece Layout',
        description: 'Review mock arbor setup with Wildflower & Moss Studio.',
        targetDateOrTime: '6 Weeks Prior',
        completed: false,
        priority: 'medium'
      },
      {
        id: 't-5',
        phase: 'final_prep',
        title: 'Final Headcount & Table Chart Seating Submission',
        description: 'Provide final numbers to venue caterer with dietary restriction breakdown.',
        targetDateOrTime: '10 Days Prior',
        completed: false,
        priority: 'high'
      },
      {
        id: 't-6',
        phase: 'final_prep',
        title: 'Rehearsal Walkthrough & Welcome Dinner',
        description: 'Practice procession timing at ceremony gazebo followed by family dinner.',
        targetDateOrTime: '1 Day Prior (5:00 PM)',
        completed: false,
        priority: 'high'
      },
      {
        id: 't-7',
        phase: 'day_of',
        title: 'Bridal Suite Hair & Makeup Glam Session',
        description: 'Mimosas and light bites in suite; photographer arrives at 11:30 AM.',
        targetDateOrTime: '09:00 AM',
        completed: false,
        priority: 'medium'
      },
      {
        id: 't-8',
        phase: 'day_of',
        title: 'First Look & Private Vows Exchange',
        description: 'Secluded pine grove reveal followed by intimate bridal party portraits.',
        targetDateOrTime: '01:30 PM',
        completed: false,
        priority: 'high'
      },
      {
        id: 't-9',
        phase: 'day_of',
        title: 'Guest Arrival & Acoustic Prelude Music',
        description: 'Welcome infused water & lavender lemonade as guests are seated.',
        targetDateOrTime: '03:30 PM',
        completed: false,
        priority: 'medium'
      },
      {
        id: 't-10',
        phase: 'day_of',
        title: 'Ceremony & Grand I-Do Kiss',
        description: 'Officiant welcome, ring vows, floral petal exit march.',
        targetDateOrTime: '04:00 PM',
        completed: false,
        priority: 'high'
      },
      {
        id: 't-11',
        phase: 'day_of',
        title: 'Cocktail Hour & Passed Hors d’Oeuvres',
        description: 'Brie crostini, smoked salmon blinis, lawn games on the west terrace.',
        targetDateOrTime: '04:45 PM',
        completed: false,
        priority: 'medium'
      },
      {
        id: 't-12',
        phase: 'day_of',
        title: 'Grand Entrance, Plated Dinner & Toasts',
        description: 'Maid of Honor, Best Man, and Parents speeches, followed by cake cutting.',
        targetDateOrTime: '06:00 PM',
        completed: false,
        priority: 'high'
      },
      {
        id: 't-13',
        phase: 'day_of',
        title: 'First Dance & High-Energy Dance Floor',
        description: 'Opening dance to "Beyond" by Leon Bridges, then live band set kicks off.',
        targetDateOrTime: '07:30 PM',
        completed: false,
        priority: 'medium'
      },
      {
        id: 't-14',
        phase: 'day_of',
        title: 'Sparkler Send-Off & Vintage Getaway Car',
        description: 'Guests line up courtyard with 36-inch sparklers.',
        targetDateOrTime: '10:30 PM',
        completed: false,
        priority: 'high'
      }
    ],
    vendors: [
      {
        id: 'v-1',
        category: 'Venue & Rentals',
        name: 'Pinecrest Botanical Estate',
        contactPerson: 'Genevieve Scott',
        email: 'events@pinecrestestate.com',
        phone: '(503) 555-0192',
        status: 'booked',
        quotedCost: 8500,
        agreedCost: 8200,
        notes: 'Deposit paid. Final walkthrough scheduled for two weeks before.',
        keyQuestions: [
          'What is the exact noise curfew time for amplified music outdoors?',
          'Do we have access the evening before for arch pre-decorating?',
          'What is the designated bad-weather backup arrangement?'
        ]
      },
      {
        id: 'v-2',
        category: 'Catering & Bar',
        name: 'Cedar Grove Farmstead Kitchen',
        contactPerson: 'Chef Marcus Vance',
        email: 'marcus@cedargrovecatering.com',
        phone: '(503) 555-7381',
        status: 'booked',
        quotedCost: 11000,
        agreedCost: 11500,
        notes: 'Includes farm-fresh organic menu, 4 bar tenders, and linen rentals.',
        keyQuestions: [
          'Are vendor hot meals covered in the contract?',
          'What is your protocol for severe guest food allergies?'
        ]
      },
      {
        id: 'v-3',
        category: 'Photography & Video',
        name: 'Lumina Storytellers',
        contactPerson: 'Claire DuMont',
        email: 'claire@luminastorytellers.com',
        phone: '(503) 555-3349',
        status: 'booked',
        quotedCost: 4200,
        agreedCost: 4000,
        notes: 'Includes second shooter and full copyright release for digital prints.',
        keyQuestions: [
          'What is the turnaround time for teaser photos vs full gallery?',
          'Do you carry commercial liability insurance for drone flight?'
        ]
      },
      {
        id: 'v-4',
        category: 'Floral & Decor',
        name: 'Wildflower & Moss Botanical Studio',
        contactPerson: 'Sora Tanaka',
        email: 'hello@wildflowermoss.com',
        phone: '(503) 555-8812',
        status: 'booked',
        quotedCost: 3500,
        agreedCost: 3300,
        notes: 'Will repurpose ceremony aisle arrangements for reception sweetheart table.'
      }
    ],
    personalizedIdeas: {
      themeName: 'Enchanted Forest Twilight',
      themeDescription: 'A dreamy, fairy-tale celebration immersed in lush moss, warm candlelight, deep forest tones, and champagne accents.',
      colorPalette: [
        { name: 'Emerald Velvet', hex: '#1b4332' },
        { name: 'Warm Amber Gold', hex: '#d4a373' },
        { name: 'Champagne Crepe', hex: '#fefae0' },
        { name: 'Blush Dahlia', hex: '#e29578' },
        { name: 'Misty Slate', hex: '#2b2d42' }
      ],
      activities: [
        {
          name: 'Polaroid Memory Tree',
          description: 'Guests snap a vintage photo, write advice on the back, and clip it onto a twine-wrapped olive branch tree.',
          targetAudience: 'All Guests',
          duration: 'Throughout Evening'
        },
        {
          name: 'Artisan S’mores & Fireside Lounge',
          description: 'Marshmallow roasting bar with gourmet flavored grahams, dark sea salt chocolates, and cozy woven blankets.',
          targetAudience: 'Reception Guests',
          duration: '8:30 PM - 10:30 PM'
        },
        {
          name: 'Custom Couple Trivia Game',
          description: 'Fun 5-minute table trivia quizzing guests on Liam and Elena’s travel adventures before dessert.',
          targetAudience: 'Dinner Guests',
          duration: '15 Minutes'
        }
      ],
      cateringHighlights: [
        'Rosemary garlic crusted wild salmon with honey roasted root vegetables',
        'Truffle wild mushroom risotto cakes (Vegan & Gluten-free option)',
        'Signature Cocktail: "The Moss & Mule" (Gin, elderflower, cucumber, lime, ginger foam)',
        'Late night warm sourdough soft pretzels with artisanal beer cheese dip'
      ],
      playlistVibe: {
        mood: 'Ethereal Indie Folk into Energetic Funk & Soul',
        sampleTracks: [
          'Leon Bridges - Beyond (First Dance)',
          'Vance Joy - Riptide (Acoustic Ceremony)',
          'Earth, Wind & Fire - September (Floor Opener)',
          'The Lumineers - Ho Hey',
          'Dua Lipa - Levitating (Late night remix)'
        ]
      },
      customSpeeches: [
        {
          title: 'Maid of Honor Heartfelt Toast',
          role: 'Best Friend & Sister',
          text: "From treehouse pacts to standing here watching Elena radiate pure joy next to Liam, true love looks effortless when two kindred souls find each other. Liam, thank you for loving her with such patience, kindness, and spontaneous laughter. May your life together always feel like your favorite sunny Sunday morning. To Elena and Liam!"
        },
        {
          title: 'Couple’s Welcome & Gratitude Toast',
          role: 'Bride & Groom',
          text: "Looking out into this room and seeing faces from every chapter of our lives gathered under one roof fills our hearts beyond measure. Some of you crossed oceans and states to be here. Thank you for your unconditional love, your advice, and your friendship. Eat, drink, and dance the night away with us!"
        }
      ],
      decorSuggestions: [
        'Repurpose ceremony arch floral installations behind the sweetheart table for double value.',
        'Scatter warm battery-powered micro fairy lights inside bell glass cloches across guest tables.',
        'Use vintage brass candelabras with smokeless drip-free tapers for romantic ambient lighting.'
      ],
      costSavingTips: [
        'Provide your own thrifted vintage brass candlesticks to avoid rental upcharges.',
        'Serve a beautiful single-tier display cutting cake and sheet kitchen cakes for the 150 guests to save over $500.',
        'Print double-sided menu cards combined with place cards to cut paper printing expenses in half.'
      ]
    },
    guests: [
      { id: 'g-1', name: 'Sophia & David Vance', group: 'Groom Family', rsvpStatus: 'confirmed', dietaryNotes: 'Vegetarian for Sophia', plusOnes: 1, tableOrZone: 'Table 1 - Rosewood' },
      { id: 'g-2', name: 'Maya Patel', group: 'Bridal Party', rsvpStatus: 'confirmed', dietaryNotes: 'Gluten-Free', plusOnes: 1, tableOrZone: 'Table 2 - Willow' },
      { id: 'g-3', name: 'Arthur Pendelton', group: 'College Friends', rsvpStatus: 'confirmed', dietaryNotes: 'None', plusOnes: 0, tableOrZone: 'Table 3 - Cedar' },
      { id: 'g-4', name: 'Uncle George Vance', group: 'Extended Family', rsvpStatus: 'declined', dietaryNotes: 'N/A', plusOnes: 0, tableOrZone: 'N/A' },
      { id: 'g-5', name: 'Lucas Scott', group: 'Colleagues', rsvpStatus: 'pending', dietaryNotes: 'Pending response', plusOnes: 1, tableOrZone: 'Table 4 - Pine' }
    ],
    notes: 'Bride’s sister will coordinate with florist for morning bouquet delivery at the bridal suite.',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-15T14:30:00Z'
  },
  {
    id: 'event-birthday-02',
    title: "Leo's 10th Superhero Birthday Extravaganza",
    type: 'birthday',
    date: '2026-11-14',
    targetGuests: 40,
    location: 'Metro Cosmic Adventure Park & Party Loft',
    vibe: 'High Energy, Action-Packed, Comic Book Heroes',
    totalBudget: 2500,
    currency: 'USD',
    currencySymbol: '$',
    budgetItems: [
      {
        id: 'bb-1',
        category: 'Venue & Rentals',
        name: 'Party Loft 3-Hour Laser Tag & Obstacle Arena',
        estimatedCost: 950,
        actualCost: 900,
        paidCost: 450,
        status: 'deposit_paid',
        notes: 'Covers up to 35 kids + referee coordinator.'
      },
      {
        id: 'bb-2',
        category: 'Catering & Bar',
        name: 'Superhero Pizza Feast, Sliders & Juice Bar',
        estimatedCost: 550,
        actualCost: 520,
        paidCost: 200,
        status: 'deposit_paid',
        notes: 'Stone-baked pizzas, fruit kabobs, cupcakes & punch.'
      },
      {
        id: 'bb-3',
        category: 'Floral & Decor',
        name: 'Gotham Cityscape Backdrop & Balloon Arch',
        estimatedCost: 350,
        actualCost: 320,
        paidCost: 320,
        status: 'paid_in_full',
        notes: 'Comic pop-art signs (POW! BAM! ZAP!) and photo props.'
      },
      {
        id: 'bb-4',
        category: 'Music & Entertainment',
        name: 'Live Stunt Actor (Spider-Hero) & Face Painter',
        estimatedCost: 400,
        actualCost: 400,
        paidCost: 150,
        status: 'deposit_paid',
        notes: '1.5 hour appearance with agility training course for kids.'
      },
      {
        id: 'bb-5',
        category: 'Favors & Gifts',
        name: 'Custom Satin Superhero Capes, Masks & Badges',
        estimatedCost: 250,
        actualCost: 230,
        paidCost: 230,
        status: 'paid_in_full',
        notes: 'Every kid gets an official "Avenger Academy" graduation box.'
      }
    ],
    timelineItems: [
      {
        id: 'bt-1',
        phase: 'foundation',
        title: 'Reserve Cosmic Adventure Park Party Slot',
        description: 'Book Saturday 1:00 PM to 4:00 PM slot with private party room.',
        targetDateOrTime: '4 Weeks Prior',
        completed: true,
        priority: 'high'
      },
      {
        id: 'bt-2',
        phase: 'bookings',
        title: 'Send Comic Strip Digital Invites',
        description: 'Sent custom digital animated comic invitations to Leo’s classmates.',
        targetDateOrTime: '3 Weeks Prior',
        completed: true,
        priority: 'high'
      },
      {
        id: 'bt-3',
        phase: 'final_prep',
        title: 'Assemble Hero Academy Gift Packs',
        description: 'Pack capes, wrist cuffs, superhero stickers, and academy certificate.',
        targetDateOrTime: '3 Days Prior',
        completed: true,
        priority: 'medium'
      },
      {
        id: 'bt-4',
        phase: 'day_of',
        title: 'Setup Balloon Arch & Photo Area',
        description: 'Arrive 45 minutes early at the venue party room.',
        targetDateOrTime: '12:15 PM',
        completed: false,
        priority: 'high'
      },
      {
        id: 'bt-5',
        phase: 'day_of',
        title: 'Hero Training Obstacle Mission',
        description: 'Laser tag battle and agility obstacle course guided by referee.',
        targetDateOrTime: '01:30 PM',
        completed: false,
        priority: 'high'
      },
      {
        id: 'bt-6',
        phase: 'day_of',
        title: 'Pizza Fuel-Up & Birthday Cake Extravaganza',
        description: 'Happy Birthday singalong with multi-tiered comic cake sparklers.',
        targetDateOrTime: '02:45 PM',
        completed: false,
        priority: 'high'
      }
    ],
    vendors: [
      {
        id: 'bv-1',
        category: 'Venue & Rentals',
        name: 'Metro Cosmic Adventure Park',
        contactPerson: 'Trevor Bailey',
        email: 'parties@metrocosmic.com',
        phone: '(555) 438-9921',
        status: 'booked',
        quotedCost: 950,
        agreedCost: 900,
        notes: 'Room #3 reserved. Includes arcade tokens for all kids.'
      },
      {
        id: 'bv-2',
        category: 'Music & Entertainment',
        name: 'Hero Character Performances',
        contactPerson: 'Alex Rivera',
        email: 'alex@heroperformances.net',
        phone: '(555) 321-7788',
        status: 'booked',
        quotedCost: 400,
        agreedCost: 400,
        notes: 'Actor arriving in professional movie-grade suit at 1:45 PM.'
      }
    ],
    personalizedIdeas: {
      themeName: 'Cosmic Superhero Academy',
      themeDescription: 'Bold comic pop-art aesthetics with neon primary tones, heroic training missions, and personalized heroic gear.',
      colorPalette: [
        { name: 'Comic Book Red', hex: '#e63946' },
        { name: 'Electric Cyan', hex: '#457b9d' },
        { name: 'Power Yellow', hex: '#ffb703' },
        { name: 'Midnight Charcoal', hex: '#1d3557' }
      ],
      activities: [
        {
          name: 'The Kryptonite Laser Escape',
          description: 'Team relay through laser maze dodging light sensors to deactivate the "alien device".',
          targetAudience: 'Kids Age 7-12',
          duration: '30 Minutes'
        },
        {
          name: 'Custom Shield Design Workshop',
          description: 'Kids use foam discs, glow-in-the-dark paint markers, and glitter stickers to build their unique emblem.',
          targetAudience: 'All Kids',
          duration: '20 Minutes'
        }
      ],
      cateringHighlights: [
        '"Hero Power Sliders" (Mini cheddar beef & veggie sliders)',
        '"Laser-Cut Brick Oven Pizzas" (Pepperoni & Four Cheese)',
        '"Supercharge Electrolyte Punch" (Blue raspberry lime fizz)',
        'Comic Book Themed 3-Tier Chocolate Fudge Cake'
      ],
      playlistVibe: {
        mood: 'Epic Cinematic Marvel/DC Soundtracks + Upbeat Pop',
        sampleTracks: [
          'The Avengers Theme (Alan Silvestri)',
          'Spider-Man: Into the Spider-Verse - Sunflower',
          'Imagine Dragons - Believer',
          'Queen - Don’t Stop Me Now'
        ]
      },
      customSpeeches: [
        {
          title: 'Mom & Dad Birthday Toast to Leo',
          role: 'Parents',
          text: "Leo, from the minute you learned to run, you’ve tackled every day with curiosity, immense kindness, and the heart of a true superhero. Watching you turn double digits today makes us prouder than words can describe. Always keep standing up for your friends and dreaming bigger than the galaxy. Happy 10th Birthday, our hero!"
        }
      ],
      decorSuggestions: [
        'Use black foam core boards with yellow cutouts to create a 3D silhouette cityscape table runner.',
        'Hang speech bubble paper lanterns from the ceiling with comic sound words (KAPOW, ZOOM!).'
      ],
      costSavingTips: [
        'Order blank colorful satin capes in bulk online and use peel-and-stick foam emblems instead of custom printed gear.',
        'Bake cupcakes at home and top with store-bought superhero sugar toppers for a $150 saving.'
      ]
    },
    guests: [
      { id: 'bg-1', name: 'Zack Miller', group: 'School Pals', rsvpStatus: 'confirmed', dietaryNotes: 'Nut allergy', plusOnes: 0, tableOrZone: 'Squad Alpha' },
      { id: 'bg-2', name: 'Emily Watson', group: 'Soccer Team', rsvpStatus: 'confirmed', dietaryNotes: 'None', plusOnes: 0, tableOrZone: 'Squad Alpha' },
      { id: 'bg-3', name: 'Noah Chen', group: 'Neighbors', rsvpStatus: 'confirmed', dietaryNotes: 'Dairy free', plusOnes: 0, tableOrZone: 'Squad Beta' }
    ],
    notes: 'Bring cake cutter and birthday candle lighter from home.',
    createdAt: '2026-10-01T12:00:00Z',
    updatedAt: '2026-10-10T16:00:00Z'
  },
  {
    id: 'event-community-03',
    title: 'Oakridge Green Neighborhood Clean-Up & Block Festival',
    type: 'community',
    date: '2026-10-04',
    targetGuests: 250,
    location: 'Oakridge Community Park & Maple Boulevard',
    vibe: 'Eco-Friendly, Neighborly, Vibrant & Family-Friendly',
    totalBudget: 4500,
    currency: 'USD',
    currencySymbol: '$',
    budgetItems: [
      {
        id: 'cb-1',
        category: 'Logistics & Permits',
        name: 'City Street Closure Permit & Police Escort',
        estimatedCost: 650,
        actualCost: 600,
        paidCost: 600,
        status: 'paid_in_full',
        notes: 'Permit #2026-ST-409 approved by municipal council.'
      },
      {
        id: 'cb-2',
        category: 'Logistics & Permits',
        name: 'Compostable Cleanup Bags, Grabbers & Safety Vests',
        estimatedCost: 800,
        actualCost: 750,
        paidCost: 750,
        status: 'paid_in_full',
        notes: 'Covers 150 morning cleanup volunteers.'
      },
      {
        id: 'cb-3',
        category: 'Catering & Bar',
        name: 'Community BBQ, Cider Stand & Fruit Station',
        estimatedCost: 1400,
        actualCost: 1350,
        paidCost: 700,
        status: 'deposit_paid',
        notes: 'Sponsored sausages, corn on the cob, vegan burgers and hot spiced apple cider.'
      },
      {
        id: 'cb-4',
        category: 'Music & Entertainment',
        name: 'Local Youth Acoustic Band & Sound System Rental',
        estimatedCost: 600,
        actualCost: 600,
        paidCost: 300,
        status: 'deposit_paid',
        notes: 'Park gazebo stage with 2 speakers and microphone.'
      },
      {
        id: 'cb-5',
        category: 'Invitations & Marketing',
        name: 'Flyers, Yard Signs & Social Campaign',
        estimatedCost: 350,
        actualCost: 300,
        paidCost: 300,
        status: 'paid_in_full',
        notes: 'Placed at local bakeries, library, and neighborhood notice boards.'
      },
      {
        id: 'cb-6',
        category: 'Contingency & Misc',
        name: 'First Aid Kit Station & Volunteer Refreshments',
        estimatedCost: 700,
        actualCost: 450,
        paidCost: 450,
        status: 'paid_in_full',
        notes: 'Equipped with sunscreen, water refill gallons, and band-aids.'
      }
    ],
    timelineItems: [
      {
        id: 'ct-1',
        phase: 'foundation',
        title: 'Submit City Council Street Closure Application',
        description: 'File noise variance and Maple Boulevard closure request 90 days out.',
        targetDateOrTime: '3 Months Prior',
        completed: true,
        priority: 'high'
      },
      {
        id: 'ct-2',
        phase: 'bookings',
        title: 'Recruit Neighborhood Team Leaders',
        description: 'Organize 6 sector captains for park trails, creek bed, and high street.',
        targetDateOrTime: '4 Weeks Prior',
        completed: true,
        priority: 'high'
      },
      {
        id: 'ct-3',
        phase: 'final_prep',
        title: 'Distribute Yard Signs Across Entrances',
        description: 'Place 20 weather-proof promotional signs on street corners.',
        targetDateOrTime: '1 Week Prior',
        completed: true,
        priority: 'medium'
      },
      {
        id: 'ct-4',
        phase: 'day_of',
        title: 'Volunteer Check-In & Safety Briefing',
        description: 'Hand out gloves, grabbers, recycling bags, and safety vests at park gazebo.',
        targetDateOrTime: '08:30 AM',
        completed: false,
        priority: 'high'
      },
      {
        id: 'ct-5',
        phase: 'day_of',
        title: 'Community Clean-Up Drive Sweep',
        description: 'Teams sweep park, creek bed, and residential sidewalks.',
        targetDateOrTime: '09:00 AM - 11:30 AM',
        completed: false,
        priority: 'high'
      },
      {
        id: 'ct-6',
        phase: 'day_of',
        title: 'Weigh-In & Green Champion Awards',
        description: 'Weigh collected trash and recyclable bottles; announce heaviest haul prize.',
        targetDateOrTime: '11:45 AM',
        completed: false,
        priority: 'medium'
      },
      {
        id: 'ct-7',
        phase: 'day_of',
        title: 'Block Festival BBQ & Live Music',
        description: 'Barbecue lunch, kids seed planting workshop, and community raffle.',
        targetDateOrTime: '12:00 PM - 03:00 PM',
        completed: false,
        priority: 'high'
      }
    ],
    vendors: [
      {
        id: 'cv-1',
        category: 'Catering & Bar',
        name: 'Oakridge Farmers Collective & Smokehouse',
        contactPerson: 'Sarah Jenkins',
        email: 'sarah@oakridgefarmers.org',
        phone: '(555) 789-1122',
        status: 'booked',
        quotedCost: 1400,
        agreedCost: 1350,
        notes: 'Locally sourced burgers, plant patties, and corn.'
      },
      {
        id: 'cv-2',
        category: 'Music & Entertainment',
        name: 'The Maple Street Strings',
        contactPerson: 'Daniel Kim',
        email: 'daniel@maplestringsmusic.com',
        phone: '(555) 890-4433',
        status: 'booked',
        quotedCost: 600,
        agreedCost: 600,
        notes: 'Acoustic folk and bluegrass covers.'
      }
    ],
    personalizedIdeas: {
      themeName: 'Rooted in Community: Clean & Green',
      themeDescription: 'A wholesome, vibrant eco-celebration transforming civic pride into tangible environmental impact and neighborly camaraderie.',
      colorPalette: [
        { name: 'Forest Moss', hex: '#2d6a4f' },
        { name: 'Sunflower Yellow', hex: '#f3c053' },
        { name: 'Sky Cerulean', hex: '#52b788' },
        { name: 'Warm Terracotta', hex: '#b75d69' }
      ],
      activities: [
        {
          name: 'The Golden Trash Picker Challenge',
          description: 'Fun competition for youth teams with prizes for the most unusual piece of recycled debris found.',
          targetAudience: 'Youth & Families',
          duration: 'Morning Drive'
        },
        {
          name: 'Pollinator Seed Bomb Workshop',
          description: 'Kids roll native wildflower seeds in clay and compost to take home for backyard gardens.',
          targetAudience: 'Children & Gardeners',
          duration: '1:00 PM - 2:30 PM'
        },
        {
          name: 'Neighborhood Recipe & Seed Swap',
          description: 'A communal table where residents exchange heirloom garden seeds and home-cooked specialty recipes.',
          targetAudience: 'All Residents',
          duration: 'All Afternoon'
        }
      ],
      cateringHighlights: [
        'Fire-grilled sweet corn with chipotle lime herb butter',
        'Smoked pulled pork sliders and marinated portobello burgers',
        'Chilled organic watermelon wedges',
        'Warm spiced apple cider with cinnamon sticks'
      ],
      playlistVibe: {
        mood: 'Sunny Americana, Feel-Good Motown & Bluegrass',
        sampleTracks: [
          'Bill Withers - Lovely Day',
          'John Denver - Take Me Home, Country Roads',
          'Jack Johnson - Better Together',
          'Otis Redding - (Sittin’ On) The Dock of the Bay'
        ]
      },
      customSpeeches: [
        {
          title: 'Opening Welcome & Call to Action',
          role: 'Association President',
          text: "Good morning Oakridge! Look around at your neighbors standing beside you today. We aren’t just cleaning streets and raking leaves—we are stitching the fabric of our community tighter. Today proves that when neighbors unite for a shared passion, our hometown becomes brighter, greener, and more resilient. Let’s make today count!"
        }
      ],
      decorSuggestions: [
        'Use burlap table runners and reclaimed wood chalkboard signs for directional signage.',
        'Potted native perennial herbs as centerpieces that volunteers can take home at the end of the day.'
      ],
      costSavingTips: [
        'Partner with local municipal department of public works for free contractor cleanup bags and city trash truck pickups.',
        'Invite local food co-ops to sponsor cider and fresh fruit in exchange for community banner placement.'
      ]
    },
    guests: [
      { id: 'cg-1', name: 'The Henderson Family (4)', group: 'Zone A Captains', rsvpStatus: 'confirmed', plusOnes: 3, tableOrZone: 'Zone A - Creek Trail' },
      { id: 'cg-2', name: 'Oakridge High Eco-Club (18)', group: 'Student Volunteers', rsvpStatus: 'confirmed', plusOnes: 17, tableOrZone: 'Zone B - Park Center' },
      { id: 'cg-3', name: 'Councilmember Rachel Torres', group: 'Civic Guests', rsvpStatus: 'confirmed', plusOnes: 1, tableOrZone: 'VIP Pavilion' }
    ],
    notes: 'Sound equipment must be powered down by 3:30 PM per park permit regulation.',
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-09-02T11:00:00Z'
  }
];
