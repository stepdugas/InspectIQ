import { NextResponse } from 'next/server'
import { db, inspections, rooms, inspectionItems, reports, profiles } from '@/lib/db'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { DEMO_INSPECTIONS } from '@/lib/demo-seed'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

export async function POST() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Seed under the admin email's profile
  const adminEmail = process.env.ADMIN_EMAIL ?? ''
  const [adminProfile] = await db.select().from(profiles).where(eq(profiles.email, adminEmail)).limit(1)
  if (!adminProfile) return NextResponse.json({ error: 'Admin profile not found — sign in to the inspector dashboard first, then seed demo data.' }, { status: 400 })

  const userId = adminProfile.id
  let created = 0

  for (const demo of DEMO_INSPECTIONS) {
    const [inspection] = await db.insert(inspections).values({
      userId,
      propertyAddress: demo.property_address,
      clientName: demo.client_name,
      clientEmail: demo.client_email,
      inspectionDate: demo.inspection_date,
      status: demo.status,
    }).returning()

    if (!inspection) continue

    for (let ri = 0; ri < demo.rooms.length; ri++) {
      const room = demo.rooms[ri]
      const [roomRow] = await db.insert(rooms).values({
        inspectionId: inspection.id,
        name: room.name,
        orderIndex: ri,
      }).returning()

      if (!roomRow) continue

      for (let ii = 0; ii < room.items.length; ii++) {
        const item = room.items[ii]
        await db.insert(inspectionItems).values({
          roomId: roomRow.id,
          name: item.name,
          condition: item.condition,
          notes: item.notes || null,
          aiNarrative: item.narrative || null,
          orderIndex: ii,
        })
      }
    }

    await db.insert(reports).values({
      inspectionId: inspection.id,
      userId,
      shareToken: crypto.randomBytes(16).toString('hex'),
    })

    created++
  }

  return NextResponse.json({ created, message: `${created} demo inspections seeded` })
}
