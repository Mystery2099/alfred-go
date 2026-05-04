import { count } from 'drizzle-orm'
import { db } from './db'
import { activities, announcements, categories, favorites, tools, userCredentials, userPreferences, users } from './schema'
import { hashPassword, testAccounts } from './auth'
import { seedData } from '../data/seed'

export async function reseed() {
  db.delete(activities).run()
  db.delete(announcements).run()
  db.delete(favorites).run()
  db.delete(userCredentials).run()
  db.delete(userPreferences).run()
  db.delete(tools).run()
  db.delete(categories).run()
  db.delete(users).run()

  db.insert(users).values(seedData.users).run()
  db.insert(categories).values(seedData.categories).run()
  db.insert(tools).values(seedData.tools).run()
  db.insert(favorites).values(seedData.favorites).run()
  db.insert(userPreferences).values(seedData.preferences).run()
  db.insert(announcements).values(seedData.announcements).run()
  seedCredentials()
}

export async function seedIfEmpty() {
  const [{ value }] = db.select({ value: count() }).from(users).all()
  if (value === 0) {
    await reseed()
    return
  }

  const [{ value: credentialCount }] = db.select({ value: count() }).from(userCredentials).all()
  if (credentialCount === 0) seedCredentials()
}

function seedCredentials() {
  const now = new Date().toISOString()
  db.insert(userCredentials).values(testAccounts.map((account) => ({
    userId: account.userId,
    email: account.email,
    passwordHash: hashPassword(account.password, account.userId),
    createdAt: now,
    updatedAt: now,
  }))).onConflictDoNothing().run()
}

if (process.argv[1]?.endsWith('server/seed.ts')) {
  reseed()
  console.log('Database reseeded')
}
