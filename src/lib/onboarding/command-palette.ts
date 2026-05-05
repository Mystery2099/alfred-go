import type { Role } from '$lib/types'
import type { CommandPaletteOnboarding } from './types'

export const commandPaletteOnboardingByRole: Partial<Record<Role, CommandPaletteOnboarding>> = {
  applicant: {
    title: 'Find admissions and aid tasks fast',
    body: 'Search by what you are trying to do, even if you do not know the system name yet.',
    suggestions: ['application status', 'missing documents', 'fafsa', 'tap', 'scholarships'],
  },
  accepted_student: {
    title: 'Jump to new student setup',
    body: 'Use plain words like bill, email, housing, classes, or account to find the right place.',
    suggestions: ['financial aid offer', 'pay bill', 'housing', 'email', 'bannerweb', 'my learning'],
  },
  student: {
    title: 'Search across campus tools',
    body: 'Find classes, grades, billing, email, favorites, and campus resources without browsing categories.',
    suggestions: ['classes', 'grades', 'degreeworks', 'email', 'dining'],
  },
}

export const defaultCommandPaletteOnboarding: CommandPaletteOnboarding = {
  title: 'Search AlfredGO',
  body: 'Find tools, pages, announcements, and categories from anywhere in the app.',
  suggestions: ['browse', 'favorites', 'settings', 'help desk'],
}
