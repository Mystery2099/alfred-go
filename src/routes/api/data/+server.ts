import { json } from '@sveltejs/kit'
import { getAppData } from '$lib/server/app-data'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
  return json(getAppData(locals.user?.id || null))
}
