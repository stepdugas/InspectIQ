// InterNACHI Standards of Practice — Inspection Templates
// Based on the International Association of Certified Home Inspectors SOP
// https://www.internachi.org/standards

export const INTERNACHI_BADGE = 'InterNACHI Standards of Practice'

export const DEFAULT_ROOMS = [
  {
    name: 'Roofing System',
    standard: 'InterNACHI SOP 2.1',
    items: [
      'Roof covering material & condition',
      'Flashing at roof penetrations',
      'Flashing at chimneys & walls',
      'Ridge, hips & valleys',
      'Gutters & downspouts',
      'Downspout termination & drainage',
      'Soffit & fascia condition',
      'Roof ventilation',
      'Skylights & roof windows',
      'Chimney cap & crown',
      'Chimney masonry & mortar',
      'Antenna & satellite dish attachments',
    ],
  },
  {
    name: 'Exterior',
    standard: 'InterNACHI SOP 2.2',
    items: [
      'Wall cladding & siding',
      'Trim, eaves & fascia',
      'Exterior doors & frames',
      'Window caulking & seals',
      'Grading & drainage slope',
      'Walkways, driveways & patios',
      'Deck or porch structure',
      'Deck railings & guards',
      'Stairway condition & handrail',
      'Vegetation clearance from structure',
      'Fencing & gates',
      'Exterior lighting',
    ],
  },
  {
    name: 'Foundation & Crawlspace',
    standard: 'InterNACHI SOP 2.3',
    items: [
      'Foundation wall material & condition',
      'Evidence of settlement or cracking',
      'Evidence of water intrusion or staining',
      'Crawlspace access & clearance',
      'Crawlspace ventilation',
      'Vapor barrier condition',
      'Subfloor structure & framing',
      'Sump pump (if present)',
      'Insulation in crawlspace',
      'Pest or moisture damage evidence',
    ],
  },
  {
    name: 'Attic & Insulation',
    standard: 'InterNACHI SOP 2.8',
    items: [
      'Attic access condition',
      'Roof framing — rafters & sheathing',
      'Evidence of water leaks or staining',
      'Insulation type & depth (R-value)',
      'Insulation distribution & coverage',
      'Ridge vent & soffit ventilation',
      'Powered attic ventilators',
      'HVAC ducts in attic',
      'Exhaust fans termination (bath/kitchen)',
      'Evidence of pest activity',
      'Fire blocking & draft stopping',
    ],
  },
  {
    name: 'Electrical System',
    standard: 'InterNACHI SOP 2.5',
    items: [
      'Main service panel — amperage',
      'Service panel condition & labeling',
      'Double-tapped breakers',
      'AFCI breaker protection',
      'GFCI protection — kitchen',
      'GFCI protection — bathrooms',
      'GFCI protection — garage & exterior',
      'GFCI protection — crawlspace & basement',
      'Visible wiring type & condition',
      'Aluminum branch circuit wiring',
      'Outlets — tested for proper operation',
      'Three-prong grounding verified',
      'Smoke detector locations & function',
      'Carbon monoxide detectors',
      'Exterior panel & weatherproofing',
    ],
  },
  {
    name: 'Plumbing System',
    standard: 'InterNACHI SOP 2.6',
    items: [
      'Water supply material (copper/PEX/galvanized)',
      'Drain, waste & vent material',
      'Water pressure (40–80 psi target)',
      'Main water shut-off location & condition',
      'Water heater age & condition',
      'Water heater TPR valve & discharge pipe',
      'Water heater flue venting',
      'Evidence of active leaks',
      'Evidence of past leaks or staining',
      'Hose bibs & exterior spigots',
      'Laundry hookups — washer drain & supply',
      'Visible drain line slope',
    ],
  },
  {
    name: 'HVAC — Heating',
    standard: 'InterNACHI SOP 2.4',
    items: [
      'Heating system type & fuel source',
      'Furnace / boiler age & condition',
      'Heat exchanger — visible cracks or damage',
      'Flue venting & connections',
      'Filter condition & access',
      'Thermostat operation',
      'Supply & return air registers',
      'Ductwork condition & insulation',
      'Carbon monoxide concern assessment',
      'System operation — heating confirmed',
    ],
  },
  {
    name: 'HVAC — Cooling',
    standard: 'InterNACHI SOP 2.4',
    items: [
      'Cooling system type',
      'Condenser unit age & condition',
      'Condenser clearance & leveling',
      'Refrigerant line insulation',
      'Evaporator coil — accessible condition',
      'Condensate drain & pan',
      'System operation — cooling confirmed',
      'Temperature differential test',
    ],
  },
  {
    name: 'Kitchen',
    standard: 'InterNACHI SOP 2.9',
    items: [
      'Cabinets — hardware & structure',
      'Countertops — condition & seams',
      'Sink — supply & drain operation',
      'Faucet — operation & evidence of leaks',
      'Dishwasher — operation & high-loop drain',
      'Range / cooktop — burner operation',
      'Oven — operation',
      'Range hood / exhaust fan',
      'Microwave (built-in)',
      'Refrigerator (if included)',
      'Garbage disposal',
      'GFCI outlets at countertop',
      'Flooring condition',
      'Ceiling & walls condition',
    ],
  },
  {
    name: 'Primary Bathroom',
    standard: 'InterNACHI SOP 2.9',
    items: [
      'Toilet — flush & fill operation',
      'Toilet — secure to floor, no rocking',
      'Sink — supply & drain operation',
      'Vanity & cabinet condition',
      'Shower — water operation & pressure',
      'Shower — caulking & grout condition',
      'Shower door / curtain rod',
      'Bathtub — drain & overflow',
      'Tub surround — caulking & tile',
      'Exhaust fan — operation & termination',
      'GFCI outlet',
      'Flooring — soft spots or damage',
      'Ceiling & walls — moisture evidence',
    ],
  },
  {
    name: 'Additional Bathrooms',
    standard: 'InterNACHI SOP 2.9',
    items: [
      'Toilet — flush & fill operation',
      'Sink & faucet condition',
      'Shower / tub condition',
      'Caulking & grout',
      'Exhaust fan',
      'GFCI outlet',
      'Flooring condition',
      'Evidence of water damage',
    ],
  },
  {
    name: 'Interior — Living Areas',
    standard: 'InterNACHI SOP 2.9',
    items: [
      'Ceilings — cracks, stains, damage',
      'Walls — cracks, damage, moisture',
      'Flooring — type & condition',
      'Interior doors — operation & hardware',
      'Windows — operation & sash condition',
      'Window seals — fogging or failure',
      'Stairways — treads, risers, handrail',
      'Fireplace — damper, firebox, hearth',
      'Fireplace — visible flue condition',
      'Outlets & switches — tested',
      'Smoke detector coverage',
    ],
  },
  {
    name: 'Bedrooms',
    standard: 'InterNACHI SOP 2.9',
    items: [
      'Ceiling condition',
      'Wall condition',
      'Flooring condition',
      'Windows — egress requirement met',
      'Window operation & locks',
      'Closet structure & door',
      'Outlets & switches',
      'Smoke detector (required per room)',
      'HVAC supply register',
    ],
  },
  {
    name: 'Garage',
    standard: 'InterNACHI SOP 2.9',
    items: [
      'Garage door — manual operation',
      'Garage door opener operation',
      'Auto-reverse safety feature',
      'Photo-eye sensors',
      'Fire-rated door to living space',
      'Fire-rated door — self-closing',
      'Garage floor — cracks & drainage',
      'Ceiling & wall framing',
      'Electrical — outlets & lighting',
      'Ventilation',
      'Vehicle door clearance',
    ],
  },
  {
    name: 'Laundry Room',
    standard: 'InterNACHI SOP 2.9',
    items: [
      'Washer connection — hot & cold supply',
      'Washer drain standpipe',
      'Dryer — 240V outlet or gas connection',
      'Dryer exhaust duct — rigid metal preferred',
      'Dryer exhaust exterior termination',
      'Exhaust duct length & restrictions',
      'Flooring — water damage',
      'Utility sink (if present)',
    ],
  },
]

export type RoomTemplate = typeof DEFAULT_ROOMS[number]

// ─────────────────────────────────────────────────────────────────────────────
// TREC 7-6 — Texas Real Estate Commission Property Inspection Report
// ─────────────────────────────────────────────────────────────────────────────

export const TREC_7_6_BADGE = 'Texas REI 7-6'

export const TREC_7_6_STATUSES = ['I', 'NI', 'NP', 'D'] as const
export type TrecStatus = typeof TREC_7_6_STATUSES[number]

export const TREC_7_6_TEMPLATE = [
  {
    section: 'I',
    name: 'Structural Systems',
    items: [
      'A. Foundations',
      'B. Grading and Drainage',
      'C. Roof Covering Materials',
      'D. Roof Structures and Attics',
      'E. Walls (Interior and Exterior)',
      'F. Ceilings and Floors',
      'G. Doors (Interior and Exterior)',
      'H. Windows',
      'I. Stairways (Interior and Exterior)',
      'J. Fireplaces and Chimneys',
      'K. Porches, Balconies, Decks, and Carports',
      'L. Other',
    ],
  },
  {
    section: 'II',
    name: 'Electrical Systems',
    items: [
      'A. Service Entrance and Panels',
      'B. Branch Circuits, Connected Devices, and Fixtures',
      'C. Other',
    ],
  },
  {
    section: 'III',
    name: 'Heating, Ventilation, and Air Conditioning Systems',
    items: [
      'A. Heating Equipment',
      'B. Cooling Equipment',
      'C. Duct Systems, Chases, and Vents',
      'D. Other',
    ],
  },
  {
    section: 'IV',
    name: 'Plumbing Systems',
    items: [
      'A. Plumbing Supply, Distribution Systems and Fixtures',
      'B. Drains, Wastes, and Vents',
      'C. Water Heating Equipment',
      'D. Hydro-Massage Therapy Equipment',
      'E. Gas Distribution Systems and Gas Appliances',
      'F. Other',
    ],
  },
  {
    section: 'V',
    name: 'Appliances',
    items: [
      'A. Dishwashers',
      'B. Food Waste Disposers',
      'C. Range Hood and Exhaust Systems',
      'D. Ranges, Cooktops, and Ovens',
      'E. Microwave Ovens',
      'F. Mechanical Exhaust Vents and Bathroom Heaters',
      'G. Garage Door Operators',
      'H. Dryer Exhaust Systems',
      'I. Other',
    ],
  },
  {
    section: 'VI',
    name: 'Optional Systems',
    items: [
      'A. Landscape Irrigation (Sprinkler) Systems',
      'B. Swimming Pools, Spas, Hot Tubs, and Equipment',
      'C. Outbuildings',
      'D. Private Water Wells (A coliform analysis is recommended.)',
      'E. Private Sewage Disposal (Septic) Systems',
      'F. Other Built-in Appliances',
      'G. Other',
    ],
  },
] as const

export const TREC_7_6_PRESET_ROOMS = TREC_7_6_TEMPLATE.map((sec) => ({
  name: `${sec.section}. ${sec.name}`,
  items: sec.items.map((item) => ({ name: item })),
}))

export const TREC_7_6_HEADER_NOTICE = `PURPOSE OF INSPECTION

A real estate inspection is a visual survey of a structure and a basic performance evaluation of the systems and components of a building. It provides information regarding the general condition of a residence at the time the inspection was conducted. It is important that you carefully read ALL of this information. Ask the inspector to clarify any items or comments that are unclear.

REPORT LIMITATIONS

This report is provided for the specific benefit of the client named above and is based on observations made by the named inspector on the date the inspection was performed (shown above). This report is not a warranty or guarantee.`

// ─────────────────────────────────────────────────────────────────────────────
// ASHI Standards of Practice — American Society of Home Inspectors
// ─────────────────────────────────────────────────────────────────────────────

export const ASHI_SOP_TEMPLATE = [
  { name: 'Structural Components', items: ['Foundation type & material', 'Foundation walls & piers', 'Evidence of water penetration', 'Evidence of structural movement', 'Floor structure & framing', 'Wall structure & framing', 'Ceiling structure & framing', 'Roof structure & framing', 'Columns & beams'] },
  { name: 'Exterior', items: ['Wall cladding, flashing & trim', 'Entryway doors, windows & frames', 'Garage door operators', 'Deck, balcony, stoop & porch condition', 'Railings, guards & handrails', 'Eaves, soffits & fascia', 'Vegetation, grading & drainage', 'Driveways, walkways & patios', 'Retaining walls'] },
  { name: 'Roofing', items: ['Roof covering material & condition', 'Roof drainage systems (gutters & downspouts)', 'Flashing', 'Skylights, chimneys & roof penetrations', 'Signs of water penetration or leaks', 'Method used to observe roof'] },
  { name: 'Plumbing', items: ['Interior water supply & distribution', 'Interior drain, waste & vent systems', 'Hot water system, controls & chimneys', 'Fuel storage & distribution', 'Sump pumps & sewage ejectors', 'Fixtures & faucets (functional flow)', 'Hose bibs'] },
  { name: 'Electrical', items: ['Service entrance conductors', 'Service entrance equipment, grounding & bonding', 'Main overcurrent device', 'Main & distribution panels', 'Amperage & voltage ratings', 'Branch circuit conductors, overcurrent devices & compatibility', 'Connected devices & fixtures', 'Operation of GFCI devices', 'Operation of AFCI devices', 'Smoke & carbon monoxide alarms'] },
  { name: 'Heating', items: ['Heating equipment type & energy source', 'Heating distribution systems', 'Operating controls & normal operating sequence', 'Chimneys, flues & vents', 'Solid fuel heating devices', 'Presence of installed heat source in each room'] },
  { name: 'Air Conditioning', items: ['Central & through-wall cooling equipment', 'Distribution systems', 'Operating controls & normal operating sequence', 'Temperature differential'] },
  { name: 'Interior', items: ['Walls, ceilings & floors', 'Steps, stairways, balconies & railings', 'Countertops & installed cabinets', 'Doors & windows (representative sample)', 'Garage vehicle doors & operators', 'Garage door auto-reverse', 'Installed ovens, ranges, cooktops, exhaust systems & microwaves', 'Installed dishwashers & food waste disposers', 'Installed laundry equipment'] },
  { name: 'Insulation & Ventilation', items: ['Insulation in unfinished spaces', 'Ventilation of attics & foundation areas', 'Kitchen, bathroom & laundry exhaust systems', 'Type & condition of vapor retarders'] },
  { name: 'Fireplaces & Solid Fuel Burning Appliances', items: ['System components (firebox, damper, hearth)', 'Chimney & vent systems', 'Hearth extension & clearance from combustibles', 'Lintels above fireplace openings'] },
]

// ─────────────────────────────────────────────────────────────────────────────
// System Templates — built-in templates available to all users
// ─────────────────────────────────────────────────────────────────────────────
//
// Instead of duplicating InterNACHI rooms for each state-compliant template,
// state templates reference 'internachi' as their base and only differ in
// badge/metadata. The UI and API resolve the actual rooms at usage time.

export interface SystemTemplate {
  id: string
  name: string
  description: string
  badge: string
  badgeColor: 'red' | 'blue' | 'gray'
  state?: string
  summaryPageRequired?: boolean
  // If set, rooms come from the referenced template instead of being stored here
  baseTemplateId?: string
  rooms: { name: string; items: string[] }[]
}

const internachiRooms = () => DEFAULT_ROOMS.map((r) => ({ name: r.name, items: [...r.items] }))

export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  // ── Universal standards ──
  {
    id: 'internachi',
    name: 'InterNACHI Standard',
    description: 'Most popular residential checklist in the US — used by 30,000+ inspectors',
    badge: 'InterNACHI SOP',
    badgeColor: 'gray',
    rooms: internachiRooms(),
  },
  {
    id: 'ashi-sop',
    name: 'ASHI Standard of Practice',
    description: 'American Society of Home Inspectors — 10 section residential checklist',
    badge: 'ASHI SOP',
    badgeColor: 'gray',
    rooms: ASHI_SOP_TEMPLATE.map((r) => ({ name: r.name, items: [...r.items] })),
  },

  // ── State-mandated form ──
  {
    id: 'trec-7-6',
    name: 'Texas Required Form (TREC REI 7-6)',
    description: 'Texas Real Estate Commission mandatory report form — legally required for all TX residential inspections',
    badge: 'TX Mandatory',
    badgeColor: 'red',
    state: 'TX',
    rooms: TREC_7_6_TEMPLATE.map((sec) => ({
      name: `${sec.section}. ${sec.name}`,
      items: [...sec.items],
    })),
  },

  // ── State-compliant template (one template, configurable per state) ──
  // States that require licensing but accept any SOP-compliant report format.
  // Uses InterNACHI rooms + a state compliance badge + mandatory summary page.
  {
    id: 'state-compliant',
    name: 'State-Compliant Residential',
    description: 'InterNACHI checklist with state compliance badge and mandatory summary page — for licensed states (NC, WI, IL, NY, MA, NJ, and more)',
    badge: 'State Compliant',
    badgeColor: 'blue',
    summaryPageRequired: true,
    rooms: internachiRooms(),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// State Regulatory Data — drives the "Choose by state" template selector
// ─────────────────────────────────────────────────────────────────────────────

export type StateRegulation = 'mandatory_form' | 'licensed' | 'unlicensed'

export interface StateInfo {
  code: string
  name: string
  regulation: StateRegulation
  complianceBadge?: string // shown on the state-compliant template for this state
  recommendedTemplates: string[]
}

export const US_STATES: StateInfo[] = [
  { code: 'AL', name: 'Alabama', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'AK', name: 'Alaska', regulation: 'unlicensed', recommendedTemplates: ['internachi', 'ashi-sop'] },
  { code: 'AZ', name: 'Arizona', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'AR', name: 'Arkansas', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'CA', name: 'California', regulation: 'unlicensed', recommendedTemplates: ['internachi', 'ashi-sop'] },
  { code: 'CO', name: 'Colorado', regulation: 'unlicensed', recommendedTemplates: ['internachi', 'ashi-sop'] },
  { code: 'CT', name: 'Connecticut', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'DE', name: 'Delaware', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'DC', name: 'District of Columbia', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'FL', name: 'Florida', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'GA', name: 'Georgia', regulation: 'unlicensed', recommendedTemplates: ['internachi', 'ashi-sop'] },
  { code: 'HI', name: 'Hawaii', regulation: 'unlicensed', recommendedTemplates: ['internachi', 'ashi-sop'] },
  { code: 'ID', name: 'Idaho', regulation: 'unlicensed', recommendedTemplates: ['internachi', 'ashi-sop'] },
  { code: 'IL', name: 'Illinois', regulation: 'licensed', complianceBadge: 'IL IDFPR Compliant', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'IN', name: 'Indiana', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'IA', name: 'Iowa', regulation: 'unlicensed', recommendedTemplates: ['internachi', 'ashi-sop'] },
  { code: 'KS', name: 'Kansas', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'KY', name: 'Kentucky', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'LA', name: 'Louisiana', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'ME', name: 'Maine', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'MD', name: 'Maryland', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'MA', name: 'Massachusetts', regulation: 'licensed', complianceBadge: 'MA HIB Compliant', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'MI', name: 'Michigan', regulation: 'unlicensed', recommendedTemplates: ['internachi', 'ashi-sop'] },
  { code: 'MN', name: 'Minnesota', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'MS', name: 'Mississippi', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'MO', name: 'Missouri', regulation: 'unlicensed', recommendedTemplates: ['internachi', 'ashi-sop'] },
  { code: 'MT', name: 'Montana', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'NE', name: 'Nebraska', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'NV', name: 'Nevada', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'NH', name: 'New Hampshire', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'NJ', name: 'New Jersey', regulation: 'licensed', complianceBadge: 'NJ HIAC Compliant', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'NM', name: 'New Mexico', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'NY', name: 'New York', regulation: 'licensed', complianceBadge: 'NY DOS Compliant', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'NC', name: 'North Carolina', regulation: 'licensed', complianceBadge: 'NC HILB Compliant', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'ND', name: 'North Dakota', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'OH', name: 'Ohio', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'OK', name: 'Oklahoma', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'OR', name: 'Oregon', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'PA', name: 'Pennsylvania', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'RI', name: 'Rhode Island', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'SC', name: 'South Carolina', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'SD', name: 'South Dakota', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'TN', name: 'Tennessee', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'TX', name: 'Texas', regulation: 'mandatory_form', recommendedTemplates: ['trec-7-6', 'internachi'] },
  { code: 'UT', name: 'Utah', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'VT', name: 'Vermont', regulation: 'unlicensed', recommendedTemplates: ['internachi', 'ashi-sop'] },
  { code: 'VA', name: 'Virginia', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'WA', name: 'Washington', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'WV', name: 'West Virginia', regulation: 'licensed', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'WI', name: 'Wisconsin', regulation: 'licensed', complianceBadge: 'WI SPS 131', recommendedTemplates: ['state-compliant', 'internachi', 'ashi-sop'] },
  { code: 'WY', name: 'Wyoming', regulation: 'unlicensed', recommendedTemplates: ['internachi', 'ashi-sop'] },
]
