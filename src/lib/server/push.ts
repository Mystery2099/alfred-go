import webpush from 'web-push'
import { db } from './db'
import { pushSubscriptions } from './schema'
import { eq } from 'drizzle-orm'
import { VAPID_PUBLIC_KEY } from '$lib/push-client'
import { env } from '$env/dynamic/private'

const VAPID_PRIVATE_KEY = env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = 'mailto:admin@alfredgo.local'

if (VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

export { VAPID_PUBLIC_KEY }

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export function saveSubscription(userId: string | null, sub: PushSubscription) {
  if (!VAPID_PRIVATE_KEY) {
    throw new Error('Push notifications are not configured')
  }
  const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  db.insert(pushSubscriptions)
    .values({
      id,
      userId: userId ?? null,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      createdAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        userId: userId ?? null,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        createdAt: new Date().toISOString(),
      },
    })
    .run()
  return { id }
}

export function deleteSubscription(endpoint: string) {
  db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint)).run()
}

export function getAllSubscriptions() {
  return db.select().from(pushSubscriptions).all()
}

export async function sendPushToAll(title: string, body: string, url = '/') {
  if (!VAPID_PRIVATE_KEY) return { sent: 0, successful: 0, failed: 0 }
  const subs = getAllSubscriptions()
  const payload = JSON.stringify({ title, body, url, timestamp: Date.now() })

  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        )
        return { endpoint: sub.endpoint, success: true }
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expired or invalid
          deleteSubscription(sub.endpoint)
        }
        return { endpoint: sub.endpoint, success: false, error: err.message }
      }
    })
  )

  const successful = results.filter((r) => r.status === 'fulfilled' && (r.value as any).success).length
  const failed = results.length - successful
  return { sent: results.length, successful, failed }
}

export async function sendPushToUser(userId: string, title: string, body: string, url = '/') {
  if (!VAPID_PRIVATE_KEY) return { sent: 0, successful: 0, failed: 0 }
  const subs = db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId)).all()
  if (!subs.length) return { sent: 0, successful: 0, failed: 0 }

  const payload = JSON.stringify({ title, body, url, timestamp: Date.now() })

  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        )
        return { endpoint: sub.endpoint, success: true }
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          deleteSubscription(sub.endpoint)
        }
        return { endpoint: sub.endpoint, success: false, error: err.message }
      }
    })
  )

  const successful = results.filter((r) => r.status === 'fulfilled' && (r.value as any).success).length
  const failed = results.length - successful
  return { sent: results.length, successful, failed }
}
