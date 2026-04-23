import { NextResponse } from 'next/server'
import { db, inspections } from '@/lib/db'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { eq } from 'drizzle-orm'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await db.delete(inspections).where(eq(inspections.id, id))
  return NextResponse.json({ ok: true })
}
