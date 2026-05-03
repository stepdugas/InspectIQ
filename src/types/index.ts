export type InspectionStatus = 'draft' | 'in_progress' | 'completed'

export type ConditionRating = 'good' | 'fair' | 'poor' | 'na' | 'not_inspected'

export interface Profile {
  id: string
  email: string
  // Drizzle returns camelCase
  fullName?: string | null
  companyName?: string | null
  licenseNumber?: string | null
  phone?: string | null
  logoUrl?: string | null
  signatureUrl?: string | null
  referralCode?: string | null
  referredBy?: string | null
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  subscriptionStatus?: string | null
  // Legacy snake_case aliases
  full_name?: string | null
  company_name?: string | null
  license_number?: string | null
  logo_url?: string | null
  signature_url?: string | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  subscription_status?: string | null
  createdAt?: Date | string | null
  created_at?: string | null
}

export interface Inspection {
  id: string
  userId?: string
  user_id?: string
  propertyAddress?: string
  property_address?: string
  clientName?: string
  client_name?: string
  clientEmail?: string | null
  client_email?: string | null
  inspectionDate?: string
  inspection_date?: string
  status?: string | null
  reportUrl?: string | null
  report_url?: string | null
  createdAt?: Date | string | null
  created_at?: string | null
  summary?: string | null
  buyerAgentName?: string | null
  buyer_agent_name?: string | null
  listingAgentName?: string | null
  listing_agent_name?: string | null
  inspectorName?: string | null
  inspector_name?: string | null
  startedAt?: string | null
  started_at?: string | null
  completedAt?: string | null
  completed_at?: string | null
  rooms?: Room[]
}

export interface Room {
  id: string
  inspectionId?: string
  inspection_id?: string
  name: string
  orderIndex?: number
  order_index?: number
  items?: InspectionItem[]
}

export interface InspectionItem {
  id: string
  roomId?: string
  room_id?: string
  name: string
  condition: string | null
  notes: string | null
  aiNarrative?: string | null
  ai_narrative?: string | null
  photos?: string | null
  orderIndex?: number
  order_index?: number
  // Added at runtime when building summary
  roomName?: string
}

export interface Report {
  id: string
  inspectionId?: string
  inspection_id?: string
  userId?: string
  user_id?: string
  pdfUrl?: string | null
  pdf_url?: string | null
  shareToken?: string
  share_token?: string
  createdAt?: Date | string | null
  created_at?: string | null
  inspection?: Inspection
}
