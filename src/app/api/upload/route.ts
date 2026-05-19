import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { inspectionId, itemId } = await request.json()

  // Verify the user owns this inspection before signing an upload
  if (inspectionId) {
    const { db, inspections } = await import('@/lib/db')
    const { eq, and } = await import('drizzle-orm')
    const [inspection] = await db.select({ id: inspections.id }).from(inspections)
      .where(and(eq(inspections.id, inspectionId), eq(inspections.userId, userId)))
      .limit(1)
    if (!inspection) return NextResponse.json({ error: 'Inspection not found' }, { status: 403 })
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!
  const apiKey = process.env.CLOUDINARY_API_KEY!
  const apiSecret = process.env.CLOUDINARY_API_SECRET!

  const timestamp = Math.round(Date.now() / 1000)
  const folder = `inspectiq/${inspectionId}/${itemId}`

  // Sign the upload params so the client can upload directly to Cloudinary
  const allowedFormats = 'jpg,jpeg,png,webp,heic'
  const signature = crypto
    .createHash('sha1')
    .update(`allowed_formats=${allowedFormats}&folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex')

  return NextResponse.json({ signature, timestamp, folder, cloudName, apiKey, allowedFormats })
}
