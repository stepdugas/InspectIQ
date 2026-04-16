import { pgTable, text, timestamp, integer, date, uuid } from 'drizzle-orm/pg-core'

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
  createdAt: timestamp('created_at').defaultNow(),
  // ISN integration — null means not connected
  isnCompanyKey: text('isn_company_key'),
  isnUsername: text('isn_username'),
  isnPassword: text('isn_password'), // TODO: encrypt at rest before v1 launch
  isnBaseUrl: text('isn_base_url'),  // resolved via Admin API on connect
})

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
  isnOrderId: text('isn_order_id'),
})

export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  inspectionId: uuid('inspection_id').notNull().references(() => inspections.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
})

export const inspectionItems = pgTable('inspection_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomId: uuid('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  condition: text('condition').default('good'),
  notes: text('notes'),
  aiNarrative: text('ai_narrative'),
  photos: text('photos').default('[]'),
  orderIndex: integer('order_index').notNull().default(0),
})

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
})
