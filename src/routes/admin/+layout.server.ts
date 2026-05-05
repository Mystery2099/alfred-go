import type { LayoutServerLoad } from './$types'
import { requireAdmin } from '$lib/server/app-data'

export const load: LayoutServerLoad = async ({ locals }) => {
  requireAdmin(locals.user)
  return {}
}
