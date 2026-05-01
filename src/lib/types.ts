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

export type UserPreference = {
  id: string
  userId: string
  dashboardLayout?: string
  theme: 'system' | 'light' | 'dark'
  preferredRoleView?: Role
  createdAt: string
  updatedAt: string
}

export type AppData = {
  users: User[]
  categories: Category[]
  tools: Tool[]
  favorites: Favorite[]
  preferences: UserPreference[]
  authUserId?: string | null
}
