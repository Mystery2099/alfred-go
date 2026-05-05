import type { Role } from '$lib/types'

export interface ChecklistItem {
  id: string
  label: string
  description?: string
  category: string
  what: string
  why: string
  next: string
  toolId?: string
  icon: any
  urgency?: 'high' | 'medium' | 'low'
}

export interface RoleOnboarding {
  title: string
  subtitle: string
  focus: string[]
}

export interface CommandPaletteOnboarding {
  title: string
  body: string
  suggestions: string[]
}

export interface ToolOnboardingGuide {
  label: string
  what: string
  useWhen: string
  firstStep: string
}

export interface LoginRoleExplainer {
  helper: string
  icon: any
}

export type RoleOnboardingMap<T> = Partial<Record<Role, T>>
