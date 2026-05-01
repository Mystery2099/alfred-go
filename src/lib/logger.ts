type LogLevel = 'info' | 'warn' | 'error'

type LogContext = Record<string, unknown>

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return {
    name: 'UnknownError',
    message: String(error),
  }
}

function sanitize(context: LogContext = {}) {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => {
      const normalizedKey = key.toLowerCase()
      if (normalizedKey.includes('password') || normalizedKey.includes('token') || normalizedKey.includes('secret')) {
        return [key, '[redacted]']
      }
      return [key, value]
    })
  )
}

export function logEvent(level: LogLevel, event: string, context: LogContext = {}) {
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    ...sanitize(context),
  }

  const writer = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info
  writer(`[AlfredGO] ${event}`, payload)
}

export function logError(event: string, error: unknown, context: LogContext = {}) {
  logEvent('error', event, {
    ...context,
    error: serializeError(error),
  })
}
