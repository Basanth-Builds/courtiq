export type UserRole = 'admin' | 'referee' | 'umpire' | 'spectator'

export interface User {
  id: string
  phone: string
  name?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  user: User
  expires: string
}
