import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { tools } from '$lib/server/schema'
import { eq } from 'drizzle-orm'
import { logEvent } from '$lib/logger'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  if (locals.user?.role !== 'admin') {
    return json({ error: 'Forbidden' }, { status: 403 })
  }

  const tool = await request.json()
  const now = new Date().toISOString()

  const existing = db.select().from(tools).where(eq(tools.id, tool.id)).all()

  if (existing.length > 0) {
    db.update(tools)
      .set({ ...tool, updatedAt: now })
      .where(eq(tools.id, tool.id))
      .run()
    logEvent('info', 'tool.updated', { toolId: tool.id })
  } else {
    db.insert(tools).values({
      ...tool,
      createdAt: now,
      updatedAt: now,
    }).run()
    logEvent('info', 'tool.created', { toolId: tool.id })
  }

  return json({ success: true })
}

export const DELETE: RequestHandler = async ({ request, locals }) => {
  if (locals.user?.role !== 'admin') {
    return json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await request.json()
  db.delete(tools).where(eq(tools.id, id)).run()
  logEvent('info', 'tool.deleted', { toolId: id })

  return json({ success: true })
}
