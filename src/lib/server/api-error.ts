import { isHttpError, json } from '@sveltejs/kit'

export function jsonApiError(error: unknown, fallbackMessage = 'Request failed') {
  if (isHttpError(error)) {
    return json({ error: error.body.message }, { status: error.status })
  }

  return json({ error: fallbackMessage }, { status: 500 })
}
