import { eq } from "drizzle-orm";
import { tags, DrizzleDB } from "../../db";

export const tagModule = (db: DrizzleDB) => {
  const create = async (content: { name: string }) => {
    // Improve slug generation to handle more edge cases
    const slug = content.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-"); // Replace spaces with hyphens

    return await db
      .insert(tags)
      .values({
        name: content.name,
        slug,
      })
      .returning()
      .get();
  };

  const getAll = async () => {
    return await db.select().from(tags).orderBy(tags.createdAt);
  };

  const getById = async (id: number) => {
    return await db.select().from(tags).where(eq(tags.id, id)).get();
  };

  const update = async (
    id: number,
    data: Partial<typeof tags.$inferInsert>
  ) => {
    return await db
      .update(tags)
      .set(data)
      .where(eq(tags.id, id))
      .returning()
      .get();
  };

  const remove = async (id: number) => {
    return await db.delete(tags).where(eq(tags.id, id)).returning().get();
  };

  return {
    create,
    getAll,
    getById,
    update,
    remove,
  };
};
