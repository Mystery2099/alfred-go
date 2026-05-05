import { json } from '@sveltejs/kit'
import { getAppData, requireUser } from '$lib/server/app-data'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
  const user = requireUser(locals.user)
  return json(getAppData(user.id))
}
