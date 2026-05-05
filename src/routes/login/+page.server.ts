import { fail, redirect } from '@sveltejs/kit'
import { authenticateUser, getLoginData } from '$lib/server/app-data'
import { sessionCookieOptions } from '$lib/server/auth'
import { checkRateLimit } from '$lib/server/rate-limit'
import { createSession } from '$lib/server/session'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  return getLoginData(locals.user)
}

export const actions: Actions = {
  default: async ({ request, cookies, getClientAddress }) => {
    const formData = await request.formData()
    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')
    const normalizedEmail = email.trim().toLowerCase()
    checkRateLimit(`login:ip:${getClientAddress()}`, 20, 15 * 60 * 1000)
    checkRateLimit(`login:email:${normalizedEmail}`, 8, 15 * 60 * 1000)

    try {
      const user = authenticateUser(normalizedEmail, password)
      cookies.set('alfredgo_session', createSession(user.id), sessionCookieOptions)
    } catch {
      return fail(401, { email, authError: 'Invalid email or password' })
    }

    redirect(303, '/')
  },
}
