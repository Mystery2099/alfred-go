import { json, type RequestHandler } from '@sveltejs/kit'
import { deleteSubscription } from '$lib/server/push'

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return json({ error: 'Endpoint required' }, { status: 400 })
    }

    deleteSubscription(endpoint)
    return json({ success: true })
  } catch (err: any) {
    return json({ error: err.message || 'Failed to remove subscription' }, { status: 500 })
  }
}
