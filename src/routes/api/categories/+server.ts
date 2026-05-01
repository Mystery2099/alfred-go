import { json } from '@sveltejs/kit'
import { jsonApiError } from '$lib/server/api-error'
import { db } from '$lib/server/db'
import { categories } from '$lib/server/schema'
import { eq } from 'drizzle-orm'
import { logEvent } from '$lib/logger'
import { saveCategory } from '$lib/server/app-data'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const category = await request.json()
    saveCategory(locals.user, category)
    return json({ success: true })
  } catch (error) {
    return jsonApiError(error)
  }
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
