export type Role = 'applicant' | 'accepted_student' | 'student' | 'staff' | 'admin'

export type User = {
  id: string
  name: string
  email?: string | null
  role: Role
  createdAt: string
  updatedAt: string
}

export type Category = {
  id: string
  name: string
  description?: string
  parentCategoryId?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type Tool = {
  id: string
  name: string
  description: string
  url: string
  categoryId: string
  icon?: string
  tags: string[]
  audienceRoles: Role[]
  isFeatured: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type Favorite = {
  id: string
  userId: string
  toolId: string
  createdAt: string
}

export type AccessibilitySettings = {
  reducedMotion?: boolean
  highContrast?: boolean
  compactDensity?: boolean
}

export type UserPreference = {
  id: string
  userId: string
  dashboardLayout?: string
  theme: 'system' | 'light' | 'dark'
  preferredRoleView?: Role
  notificationSettings?: Record<string, boolean>
  accessibilitySettings?: AccessibilitySettings
  createdAt: string
  updatedAt: string
}

export type Announcement = {
  id: string
  title: string
  body: string
  tone: 'urgent' | 'deadline' | 'reminder'
  filter: 'updates' | 'deadlines' | 'reminders'
  actionLabel?: string
  toolId?: string
  url?: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type Activity = {
  id: string
  userId: string
  type: 'tool_launch' | 'favorite' | 'login'
  toolId?: string
  toolName?: string
  createdAt: string
}

export type AppData = {
  users: User[]
  categories: Category[]
  tools: Tool[]
  favorites: Favorite[]
  preferences: UserPreference[]
  announcements: Announcement[]
  activities: Activity[]
  authUserId?: string | null
}
