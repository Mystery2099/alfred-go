import { getAppData } from '$lib/server/app-data'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.session?.userId
  const data = getAppData(userId)
  return {
    announcements: data.announcements.filter((a) => a.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
  }
}
