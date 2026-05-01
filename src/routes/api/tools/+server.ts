import { json } from '@sveltejs/kit'
import { jsonApiError } from '$lib/server/api-error'
import { db } from '$lib/server/db'
import { tools } from '$lib/server/schema'
import { eq } from 'drizzle-orm'
import { logEvent } from '$lib/logger'
import { saveTool } from '$lib/server/app-data'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const tool = await request.json()
    saveTool(locals.user, tool)
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
  db.delete(tools).where(eq(tools.id, id)).run()
  logEvent('info', 'tool.deleted', { toolId: id })

  return json({ success: true })
}
