import { AlertTriangle, CheckCircle2, MinusCircle, XCircle } from 'lucide-svelte'
import type { ToolStatus } from '$lib/types'

export function getToolStatusIcon(status?: ToolStatus | null) {
  if (status === 'online') return CheckCircle2
  if (status === 'maintenance') return AlertTriangle
  if (status === 'degraded') return MinusCircle
  if (status === 'offline') return XCircle
  return null
}

export function getToolStatusColor(status?: ToolStatus | null) {
  if (status === 'online') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30'
  if (status === 'maintenance') return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
  if (status === 'degraded') return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30'
  if (status === 'offline') return 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30'
  return 'text-text-muted bg-muted'
}
