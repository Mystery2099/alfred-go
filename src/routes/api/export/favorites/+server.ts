import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { favorites, tools } from '$lib/server/schema'
import { eq, inArray } from 'drizzle-orm'

export async function GET({ locals }) {
  if (!locals.user) {
    return json({ error: 'Authentication required' }, { status: 401 })
  }

  const userFavorites = db.select().from(favorites).where(eq(favorites.userId, locals.user.id)).all()
  const toolIds = userFavorites.map((f) => f.toolId)

  let favoriteTools: typeof tools.$inferSelect[] = []
  if (toolIds.length > 0) {
    favoriteTools = db.select().from(tools).where(inArray(tools.id, toolIds)).all()
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      name: locals.user.name,
      email: locals.user.email,
      role: locals.user.role,
    },
    favorites: favoriteTools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      url: tool.url,
      categoryId: tool.categoryId,
      tags: tool.tags,
    })),
  }

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="alfredgo-favorites-${locals.user.id}.json"`,
    },
  })
}
