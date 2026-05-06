import { pgTable, text, timestamp, integer, date, uuid, boolean, index } from 'drizzle-orm/pg-core'

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull(),
  fullName: text('full_name'),
  companyName: text('company_name'),
  licenseNumber: text('license_number'),
  phone: text('phone'),
  logoUrl: text('logo_url'),
  signatureUrl: text('signature_url'),
  referralCode: text('referral_code'),
  referredBy: text('referred_by'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status'),
  trialEndsAt: timestamp('trial_ends_at').defaultNow(),
  // Founding member — first 50 inspectors get $99/mo locked forever
  isFoundingMember: boolean('is_founding_member').default(false),
  foundingMemberNumber: integer('founding_member_number'), // 1-50, null if not founding
  // Referral reward tracking — true once the referrer has been credited for this user subscribing
  referralRewarded: boolean('referral_rewarded').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  // Stripe Connect — inspector's own Stripe account for collecting client payments
  stripeConnectAccountId: text('stripe_connect_account_id'),
  stripeConnectOnboarded: boolean('stripe_connect_onboarded').default(false),
  // ISN integration — null means not connected
  isnCompanyKey: text('isn_company_key'),
  isnUsername: text('isn_username'),
  isnPassword: text('isn_password'), // AES-256-GCM encrypted via lib/crypto.ts
  isnBaseUrl: text('isn_base_url'),  // resolved via Admin API on connect
}, (table) => [
  index('profiles_stripe_customer_id_idx').on(table.stripeCustomerId),
  index('profiles_referral_code_idx').on(table.referralCode),
  index('profiles_email_idx').on(table.email),
])

export const inspections = pgTable('inspections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  propertyAddress: text('property_address').notNull(),
  clientName: text('client_name').notNull(),
  clientEmail: text('client_email'),
  inspectionDate: date('inspection_date').notNull(),
  status: text('status').default('draft'),
  reportUrl: text('report_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  // ISN order link — set when inspection is created from an ISN import
  isnOrderId: text('isn_order_id'), // indexed below
  // Client payment — inspector sets fee, generates Stripe link for client to pay
  inspectionFee: integer('inspection_fee'), // in cents, null = fee not set
  paymentStatus: text('payment_status').default('unpaid'), // 'unpaid' | 'pending' | 'paid'
  paymentSessionId: text('payment_session_id'), // Stripe checkout session ID
  paymentCheckoutUrl: text('payment_checkout_url'), // Stripe checkout URL for client
  // Scheduling — time of day and client phone for calendar view
  scheduledTime: text('scheduled_time'), // e.g. '09:00' 24hr format
  clientPhone: text('client_phone'),
  // Agent / realtor info — tracks referral pipeline
  buyerAgentName: text('buyer_agent_name'),
  buyerAgentEmail: text('buyer_agent_email'),
  buyerAgentPhone: text('buyer_agent_phone'),
  listingAgentName: text('listing_agent_name'),
  listingAgentEmail: text('listing_agent_email'),
  listingAgentPhone: text('listing_agent_phone'),
  // Overall inspection summary / notes
  summary: text('summary'),
  // Pre-Inspection Agreement (PIA)
  agreementToken: text('agreement_token'),
  agreementSentAt: timestamp('agreement_sent_at'),
  agreementSignedAt: timestamp('agreement_signed_at'),
  agreementSignerName: text('agreement_signer_name'),
  agreementSignerIp: text('agreement_signer_ip'),
  // Inspector who performed this inspection (defaults to profile fullName)
  inspectorName: text('inspector_name'),
  // Duration tracking — when the inspector started/stopped on-site
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
}, (table) => [
  index('inspections_user_id_idx').on(table.userId),
  index('inspections_isn_order_id_idx').on(table.isnOrderId),
])

export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  inspectionId: uuid('inspection_id').notNull().references(() => inspections.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
}, (table) => [
  index('rooms_inspection_id_idx').on(table.inspectionId),
])

export const inspectionItems = pgTable('inspection_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomId: uuid('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  condition: text('condition').default('good'),
  notes: text('notes'),
  aiNarrative: text('ai_narrative'),
  photos: text('photos').default('[]'),
  orderIndex: integer('order_index').notNull().default(0),
}, (table) => [
  index('inspection_items_room_id_idx').on(table.roomId),
])

// Custom inspection templates — inspectors build their own for commercial, pool, radon, etc.
export const customTemplates = pgTable('custom_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const templateRooms = pgTable('template_rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').notNull().references(() => customTemplates.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
})

export const templateItems = pgTable('template_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomId: uuid('room_id').notNull().references(() => templateRooms.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
})

export const repairRequests = pgTable('repair_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').notNull().references(() => reports.id, { onDelete: 'cascade' }),
  createdBy: text('created_by'), // name of person who created the list (e.g., buyer's agent)
  createdByEmail: text('created_by_email'),
  createdByRole: text('created_by_role'), // 'buyer_agent' | 'buyer' | 'listing_agent'
  notes: text('notes'), // overall notes on the repair request
  status: text('status').default('draft'), // 'draft' | 'submitted' | 'accepted' | 'countered'
  createdAt: timestamp('created_at').defaultNow(),
  submittedAt: timestamp('submitted_at'),
}, (table) => [
  index('repair_requests_report_id_idx').on(table.reportId),
])

export const repairRequestItems = pgTable('repair_request_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  repairRequestId: uuid('repair_request_id').notNull().references(() => repairRequests.id, { onDelete: 'cascade' }),
  inspectionItemId: uuid('inspection_item_id').notNull().references(() => inspectionItems.id, { onDelete: 'cascade' }),
  selected: boolean('selected').default(false),
  priority: text('priority').default('medium'), // 'high' | 'medium' | 'low'
  estimatedCost: integer('estimated_cost'), // in cents, optional
  agentNotes: text('agent_notes'), // agent's notes about this specific repair
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('repair_request_items_request_id_idx').on(table.repairRequestId),
])

export const adminSettings = pgTable('admin_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  inspectionId: uuid('inspection_id').notNull().references(() => inspections.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  pdfUrl: text('pdf_url'),
  shareToken: text('share_token').unique(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('reports_inspection_id_idx').on(table.inspectionId),
])
