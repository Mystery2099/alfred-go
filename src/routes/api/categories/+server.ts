import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { categories } from '$lib/server/schema'
import { eq } from 'drizzle-orm'
import { logEvent } from '$lib/logger'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  if (locals.user?.role !== 'admin') {
    return json({ error: 'Forbidden' }, { status: 403 })
  }

  const category = await request.json()
  const now = new Date().toISOString()

  const existing = db.select().from(categories).where(eq(categories.id, category.id)).all()

  if (existing.length > 0) {
    db.update(categories)
      .set({ ...category, updatedAt: now })
      .where(eq(categories.id, category.id))
      .run()
    logEvent('info', 'category.updated', { categoryId: category.id })
  } else {
    db.insert(categories).values({
      ...category,
      createdAt: now,
      updatedAt: now,
    }).run()
    logEvent('info', 'category.created', { categoryId: category.id })
  }

  return json({ success: true })
}

export const DELETE: RequestHandler = async ({ request, locals }) => {
  if (locals.user?.role !== 'admin') {
    return json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await request.json()
  db.delete(categories).where(eq(categories.id, id)).run()
  logEvent('info', 'category.deleted', { categoryId: id })

  return json({ success: true })
}
