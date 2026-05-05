import { json, type RequestHandler } from '@sveltejs/kit'
import { saveSubscription } from '$lib/server/push'

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subscription } = body

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return json({ error: 'Invalid subscription payload' }, { status: 400 })
    }

    saveSubscription(locals.user.id, subscription)

    return json({ success: true })
  } catch (err: any) {
    return json({ error: err.message || 'Failed to save subscription' }, { status: 500 })
  }
}
