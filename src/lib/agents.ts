// Agent type definitions and default configurations

export const AGENT_TYPES = [
  'report_writer',
  'delivery',
  'follow_up',
  'property_research',
  'review',
  'realtor_nurture',
  'repair_summary',
  'scheduling',
  'compliance',
  'lead_qualifier',
  'business_intel',
  'after_hours',
  'marketing',
] as const

export type AgentType = typeof AGENT_TYPES[number]

export interface AgentDefinition {
  type: AgentType
  name: string
  description: string
  category: 'core' | 'post_inspection' | 'business_ops'
  requiresConnector: string[] // which connectors this agent needs
  defaultEnabled: boolean
  defaultConfig: Record<string, unknown>
}

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  // Core agents (already built)
  {
    type: 'report_writer',
    name: 'Report Writer',
    description: 'Generates professional narratives from your notes and photos.',
    category: 'core',
    requiresConnector: [],
    defaultEnabled: true,
    defaultConfig: {
      tone: 'professional', // 'professional' | 'conversational' | 'brief'
      autoGenerate: false,
    },
  },
  {
    type: 'delivery',
    name: 'Delivery Agent',
    description: 'Emails the finished report to the client and buyer\'s agent the moment you mark an inspection complete.',
    category: 'core',
    requiresConnector: [],
    defaultEnabled: true,
    defaultConfig: {
      autoSend: true,
      includePdf: false,
      ccBuyerAgent: true,
    },
  },
  {
    type: 'follow_up',
    name: 'Follow-Up Agent',
    description: 'Sends a follow-up to the client after report delivery asking if they have questions.',
    category: 'core',
    requiresConnector: [],
    defaultEnabled: true,
    defaultConfig: {
      timing: 'next_morning', // 'same_evening' | 'next_morning' | '48_hours' | 'custom'
      customHours: 24,
      content: 'any_questions', // 'any_questions' | 'top_findings' | 'custom'
      customMessage: '',
      tone: 'friendly', // 'professional' | 'friendly' | 'brief'
      includePhone: true,
    },
  },
  {
    type: 'property_research',
    name: 'Property Research Agent',
    description: 'Pulls building permit history for the property before you arrive on site.',
    category: 'core',
    requiresConnector: [],
    defaultEnabled: true,
    defaultConfig: {
      autoPull: false, // true = auto on inspection create, false = manual button
    },
  },

  // Post-inspection agents
  {
    type: 'review',
    name: 'Review Agent',
    description: 'Automatically requests a Google review from the client after each inspection.',
    category: 'post_inspection',
    requiresConnector: ['google'],
    defaultEnabled: false,
    defaultConfig: {
      delayDays: 3, // days after follow-up to send review request
      platforms: ['google'], // 'google' | 'yelp'
      followUpIfNoReview: true,
      followUpDelayDays: 5,
      customMessage: '',
    },
  },
  {
    type: 'realtor_nurture',
    name: 'Realtor Nurture Agent',
    description: 'Tracks which realtors refer you inspections and sends automatic thank-you emails. Alerts you when a realtor goes quiet.',
    category: 'post_inspection',
    requiresConnector: [],
    defaultEnabled: false,
    defaultConfig: {
      autoThankYou: true,
      inactiveAlertDays: 60,
      includeStats: true, // include inspection count in thank-you
    },
  },
  {
    type: 'repair_summary',
    name: 'Repair Summary Agent',
    description: 'Auto-generates a condensed repair request list from your report, formatted for the buyer\'s agent.',
    category: 'post_inspection',
    requiresConnector: [],
    defaultEnabled: false,
    defaultConfig: {
      autoGenerate: true,
      format: 'bullet_list', // 'bullet_list' | 'detailed' | 'realtor_addendum'
      includePhotos: false,
    },
  },

  // Business operations agents
  {
    type: 'scheduling',
    name: 'Scheduling Agent',
    description: 'Manages your availability, handles booking requests, and syncs with your calendar.',
    category: 'business_ops',
    requiresConnector: ['google'], // or 'microsoft'
    defaultEnabled: false,
    defaultConfig: {
      bufferMinutes: 30,
      maxPerDay: 3,
      autoConfirm: false,
      reminderHours: [24, 2], // send reminders at 24hr and 2hr before
      serviceAreaMiles: 50,
    },
  },
  {
    type: 'compliance',
    name: 'Compliance Agent',
    description: 'Tracks your CE credits, license renewal dates, and insurance expiration. Sends reminders before deadlines.',
    category: 'business_ops',
    requiresConnector: [],
    defaultEnabled: false,
    defaultConfig: {
      reminderDays: [30, 14, 7, 1],
    },
  },
  {
    type: 'lead_qualifier',
    name: 'Lead Qualifier Agent',
    description: 'Auto-responds to new inquiry emails, collects property details, quotes a price, and books the appointment.',
    category: 'business_ops',
    requiresConnector: ['google'], // needs email access
    defaultEnabled: false,
    defaultConfig: {
      autoRespond: true,
      pricingModel: 'flat', // 'flat' | 'per_sqft' | 'custom'
      flatRate: 400, // in dollars
      perSqftRate: 0.15,
      requirePropertyDetails: true,
    },
  },
  {
    type: 'business_intel',
    name: 'Business Intelligence Agent',
    description: 'Sends you a weekly or monthly report with revenue trends, top referring realtors, and business health metrics.',
    category: 'business_ops',
    requiresConnector: [],
    defaultEnabled: false,
    defaultConfig: {
      frequency: 'monthly', // 'weekly' | 'monthly'
      includeRevenue: true,
      includeRealtorPipeline: true,
    },
  },
  {
    type: 'after_hours',
    name: 'After-Hours Agent',
    description: 'Handles client and realtor emails outside your business hours with helpful auto-replies.',
    category: 'business_ops',
    requiresConnector: ['google'], // needs email access
    defaultEnabled: false,
    defaultConfig: {
      businessHoursStart: '08:00',
      businessHoursEnd: '18:00',
      businessDays: [1, 2, 3, 4, 5], // Mon-Fri
      timezone: 'America/New_York', // IANA timezone
      canBookAppointments: false,
    },
  },
  {
    type: 'marketing',
    name: 'Marketing Agent',
    description: 'Auto-generates Google Business Profile posts from your completed inspections to boost your local SEO.',
    category: 'business_ops',
    requiresConnector: ['google'],
    defaultEnabled: false,
    defaultConfig: {
      autoPost: false,
      frequencyDays: 7,
      anonymizeAddresses: true,
    },
  },
]

export function getAgentDefinition(type: AgentType): AgentDefinition | undefined {
  return AGENT_DEFINITIONS.find(a => a.type === type)
}

export function getDefaultConfig(type: AgentType): Record<string, unknown> {
  return getAgentDefinition(type)?.defaultConfig ?? {}
}
