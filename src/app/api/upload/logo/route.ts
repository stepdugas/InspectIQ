import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { v2 as cloudinary } from 'cloudinary'
import { db, profiles } from '@/lib/db'
import { eq } from 'drizzle-orm'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// GET — return signed upload params for direct browser-to-Cloudinary upload
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const timestamp = Math.round(Date.now() / 1000)
  const folder = `inspectiq/logos/${userId}`
  const public_id = `${userId}_logo`

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder, public_id, overwrite: true },
    process.env.CLOUDINARY_API_SECRET!
  )

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    public_id,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  })
}

// POST — save the uploaded logo URL to the profile
export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { logoUrl } = await request.json()

  if (!logoUrl || typeof logoUrl !== 'string' || !logoUrl.startsWith('https://res.cloudinary.com/')) {
    return NextResponse.json({ error: 'logoUrl must be a valid Cloudinary URL starting with https://res.cloudinary.com/' }, { status: 400 })
  }

  await db.update(profiles).set({ logoUrl }).where(eq(profiles.id, userId))

  return NextResponse.json({ ok: true })
}
