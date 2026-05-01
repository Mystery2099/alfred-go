import { redirect } from '@sveltejs/kit'
import { logEvent } from '$lib/logger'
import type { Actions } from './$types'

export const actions: Actions = {
  logout: async ({ cookies, locals }) => {
    cookies.delete('alfredgo_session', { path: '/' })
    logEvent('info', 'auth.logout', { userId: locals.user?.id })
    redirect(303, '/login')
  },
}
