import type { LayoutServerLoad } from './$types'
import { getAppData } from '$lib/server/app-data'

export const load: LayoutServerLoad = async ({ locals }) => {
  return getAppData(locals.user?.id || null)
}
