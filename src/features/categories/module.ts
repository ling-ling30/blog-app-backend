import { eq } from "drizzle-orm";
import { categories, DrizzleDB } from "../../db";

export const categoryModule = (db: DrizzleDB) => {
  const create = async (content: { name: string; description?: string }) => {
    // Improve slug generation to handle more edge cases
    const slug = content.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-"); // Replace spaces with hyphens

    return await db
      .insert(categories)
      .values({
        name: content.name,
        slug,
        description: content.description || null,
      })
      .returning()
      .get();
  };

  const getAll = async () => {
    return await db.select().from(categories).orderBy(categories.createdAt);
  };

  const getById = async (id: number) => {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .get();
  };

  const update = async (
    id: number,
    data: Partial<typeof categories.$inferInsert>
  ) => {
    return await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning()
      .get();
  };

  const remove = async (id: number) => {
    return await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning()
      .get();
  };

  return {
    create,
    getAll,
    getById,
    update,
    remove,
  };
};
