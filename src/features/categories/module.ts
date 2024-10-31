import { categories, DrizzleDB } from "../../db";

export const categoryModule = (db: DrizzleDB) => {
  const create = async (content: { name: string }) => {
    return await db
      .insert(categories)
      .values({
        name: content.name,
        slug: content.name.toLowerCase().replace(/\s+/g, "-"),
      })
      .returning()
      .get();
  };

  const getAll = async () => {
    return await db.select().from(categories);
  };

  return {
    create,
    getAll,
  };
};
