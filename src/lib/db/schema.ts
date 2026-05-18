import { pgTable, text, timestamp, integer, date, uuid, boolean, index, jsonb } from 'drizzle-orm/pg-core'

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
  // Inspector's state — drives template recommendations and compliance badges
  inspectionState: text('inspection_state'), // US state code, e.g. 'TX', 'OH'
  defaultTemplateId: text('default_template_id'), // system template ID, e.g. 'trec-7-6', 'internachi'
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
  // Job tracking — report delivery and follow-up status
  reportDeliveredAt: timestamp('report_delivered_at'),
  followUpStatus: text('follow_up_status').default('none'), // 'none' | 'scheduled' | 'sent'
  followUpScheduledFor: timestamp('follow_up_scheduled_for'),
  followUpSentAt: timestamp('follow_up_sent_at'),
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
}, (table) => [
  index('custom_templates_user_id_idx').on(table.userId),
])

export const templateRooms = pgTable('template_rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').notNull().references(() => customTemplates.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
}, (table) => [
  index('template_rooms_template_id_idx').on(table.templateId),
])

export const templateItems = pgTable('template_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomId: uuid('room_id').notNull().references(() => templateRooms.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
}, (table) => [
  index('template_items_room_id_idx').on(table.roomId),
])

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

// Permit history cache — avoids duplicate API calls for the same address
export const permitCache = pgTable('permit_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  addressHash: text('address_hash').notNull(), // SHA-256 of normalized address
  addressRaw: text('address_raw').notNull(), // original address for display
  permits: text('permits').notNull().default('[]'), // JSON array of permit records
  source: text('source').default('shovels'), // API source
  fetchedAt: timestamp('fetched_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(), // cache TTL (30 days from fetch)
}, (table) => [
  index('permit_cache_address_hash_idx').on(table.addressHash),
])

// Agent configuration — per-user per-agent toggle + settings
export const agentConfigs = pgTable('agent_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  agentType: text('agent_type').notNull(), // 'report_writer' | 'delivery' | 'follow_up' | 'property_research' | 'review' | 'realtor_nurture' | 'repair_summary' | 'scheduling' | 'compliance' | 'lead_qualifier' | 'business_intel' | 'after_hours' | 'marketing'
  enabled: boolean('enabled').default(false),
  config: jsonb('config').default({}), // agent-specific settings (timing, tone, etc.)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('agent_configs_user_id_idx').on(table.userId),
  index('agent_configs_user_agent_idx').on(table.userId, table.agentType),
])

// Connected third-party accounts (Google, Microsoft, etc.)
export const connectedAccounts = pgTable('connected_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'google' | 'microsoft'
  accessToken: text('access_token').notNull(), // AES-256-GCM encrypted
  refreshToken: text('refresh_token'), // AES-256-GCM encrypted
  scopes: text('scopes').notNull(), // comma-separated scopes granted
  expiresAt: timestamp('expires_at'),
  email: text('email'), // the connected account's email address
  metadata: jsonb('metadata').default({}), // provider-specific data (e.g. GBP location ID)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('connected_accounts_user_id_idx').on(table.userId),
  index('connected_accounts_user_provider_idx').on(table.userId, table.provider),
])

// Agent activity log — audit trail for every action agents take
export const agentActivityLog = pgTable('agent_activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  agentType: text('agent_type').notNull(),
  action: text('action').notNull(), // 'email_sent' | 'review_requested' | 'permit_fetched' | 'report_generated' etc.
  details: jsonb('details').default({}), // action-specific data (recipient, inspection ID, etc.)
  inspectionId: uuid('inspection_id'), // optional link to inspection
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('agent_activity_log_user_id_idx').on(table.userId),
  index('agent_activity_log_created_at_idx').on(table.createdAt),
])

// Scheduling — inspector availability rules (weekly template)
export const availabilityRules = pgTable('availability_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: text('start_time').notNull(), // '08:00' 24hr format
  endTime: text('end_time').notNull(), // '17:00'
  enabled: boolean('enabled').default(true),
}, (table) => [
  index('availability_rules_user_id_idx').on(table.userId),
])

// Booking links — shareable URLs realtors can send to their buyers
export const bookingLinks = pgTable('booking_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  label: text('label').default('Default'), // e.g. 'Main', 'Commercial Only'
  bufferMinutes: integer('buffer_minutes').default(30),
  maxPerDay: integer('max_per_day').default(3),
  serviceAreaMiles: integer('service_area_miles').default(50),
  inspectionDurationMinutes: integer('inspection_duration_minutes').default(180), // 3 hours default
  autoConfirm: boolean('auto_confirm').default(false),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('booking_links_user_id_idx').on(table.userId),
  index('booking_links_token_idx').on(table.token),
])

// Realtor contacts — CRM for realtor relationships
export const realtorContacts = pgTable('realtor_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  company: text('company'),
  firstReferralAt: timestamp('first_referral_at'),
  lastReferralAt: timestamp('last_referral_at'),
  totalReferrals: integer('total_referrals').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('realtor_contacts_user_id_idx').on(table.userId),
])

// Compliance tracking — CE credits, license renewals, insurance
export const complianceItems = pgTable('compliance_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'license' | 'ce_credits' | 'eao_insurance' | 'general_liability' | 'business_license'
  description: text('description').notNull(),
  expiresAt: timestamp('expires_at'),
  hoursRequired: integer('hours_required'), // for CE credits
  hoursCompleted: integer('hours_completed').default(0), // for CE credits
  remindersSent: integer('reminders_sent').default(0),
  lastReminderAt: timestamp('last_reminder_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('compliance_items_user_id_idx').on(table.userId),
])

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  inspectionId: uuid('inspection_id').notNull().references(() => inspections.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  pdfUrl: text('pdf_url'),
  shareToken: text('share_token').unique(),
  shareTokenExpiresAt: timestamp('share_token_expires_at'), // null = never expires (default for now)
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('reports_inspection_id_idx').on(table.inspectionId),
])
