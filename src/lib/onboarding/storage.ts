import type { Role } from '$lib/types'

export function checklistStorageKey(userId: string | null | undefined, role: Role) {
  return `alfredgo_checklist_${userId ?? 'guest'}_${role}`
}

export function checklistDismissedStorageKey(userId: string | null | undefined, role: Role) {
  return `alfredgo_checklist_dismissed_${userId ?? 'guest'}_${role}`
}

export function resetChecklistStorage(userId: string | null | undefined, role: Role) {
  if (typeof window === 'undefined') return
  localStorage.removeItem(checklistStorageKey(userId, role))
  localStorage.removeItem(checklistDismissedStorageKey(userId, role))
}
