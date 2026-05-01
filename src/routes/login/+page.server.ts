import { fail, redirect } from '@sveltejs/kit'
import { authenticateUser, getAppData } from '$lib/server/app-data'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  return getAppData(locals.user?.id || null)
}

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData()
    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')

    try {
      const user = authenticateUser(email, password)
      cookies.set('alfredgo_session', JSON.stringify({ userId: user.id }), {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 60 * 60 * 8,
      })
    } catch {
      return fail(401, { email, authError: 'Invalid email or password' })
    }

    redirect(303, '/')
  },
}
