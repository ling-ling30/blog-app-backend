import { eq, and } from "drizzle-orm";
import { posts, postsCategories, postsTags, DrizzleDB } from "../../db";
import { PostStatus } from "../../db/schema"; // Assuming you've defined this

export const postModule = (db: DrizzleDB) => {
  const create = async (content: {
    title: string;
    content: string;
    status?: keyof typeof PostStatus;
    excerpt?: string;
    featuredImageUrl?: string;
    categories?: number[];
    tags?: number[];
  }) => {
    // Improve slug generation
    const slug = content.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-"); // Replace spaces with hyphens

    return await db.transaction(async (tx) => {
      // Insert post
      const [post] = await tx
        .insert(posts)
        .values({
          title: content.title,
          slug,
          content: content.content,
          status: content.status || "DRAFT",
          excerpt: content.excerpt,
          featuredImageUrl: content.featuredImageUrl,
        })
        .returning();

      // Insert categories if provided
      if (content.categories && content.categories.length > 0) {
        await db.insert(postsCategories).values(
          content.categories.map((categoryId) => ({
            postId: post.id,
            categoryId,
          }))
        );
      }

      // Insert tags if provided
      if (content.tags && content.tags.length > 0) {
        await tx.insert(postsTags).values(
          content.tags.map((tagId) => ({
            postId: post.id,
            tagId,
          }))
        );
      }

      return post;
    });
  };

  const getAll = async (
    filters: {
      status?: keyof typeof PostStatus;
      categoryId?: number;
      tagId?: number;
      limit?: number;
      offset?: number;
    } = {}
  ) => {
    const { status, categoryId, tagId, limit = 10, offset = 0 } = filters;

    // Collect conditions into an array
    const conditions = [];
    if (status) conditions.push(eq(posts.status, status));
    if (categoryId) conditions.push(eq(postsCategories.categoryId, categoryId));
    if (tagId) conditions.push(eq(postsTags.tagId, tagId));

    // Build the query with the collected conditions
    const query = db
      .select({
        post: posts,
        categories: postsCategories,
        tags: postsTags,
      })
      .from(posts)
      .leftJoin(postsCategories, eq(posts.id, postsCategories.postId))
      .leftJoin(postsTags, eq(posts.id, postsTags.postId))
      .where(and(...conditions)) // Apply the conditions using `and()`
      .limit(limit)
      .offset(offset)
      .orderBy(posts.createdAt);

    return await query.all();
  };

  const getById = async (id: string) => {
    return await db.select().from(posts).where(eq(posts.id, id)).get();
  };

  const getBySlug = async (slug: string) => {
    return await db.select().from(posts).where(eq(posts.slug, slug)).get();
  };

  const update = async (
    id: string,
    data: Partial<typeof posts.$inferInsert> & {
      categories?: number[];
      tags?: number[];
    }
  ) => {
    return await db.transaction(async (tx) => {
      // Update post
      const [updatedPost] = await tx
        .update(posts)
        .set({
          title: data.title,
          content: data.content,
          status: data.status,
          excerpt: data.excerpt,
          featuredImageUrl: data.featuredImageUrl,
          updatedAt: Math.floor(Date.now() / 1000), // Current Unix timestamp
        })
        .where(eq(posts.id, id))
        .returning();

      // Update categories if provided
      if (data.categories) {
        // First, delete existing categories
        await tx.delete(postsCategories).where(eq(postsCategories.postId, id));

        // Then insert new categories
        await tx.insert(postsCategories).values(
          data.categories.map((categoryId) => ({
            postId: id,
            categoryId,
          }))
        );
      }

      // Update tags if provided
      if (data.tags) {
        // First, delete existing tags
        await tx.delete(postsTags).where(eq(postsTags.postId, id));

        // Then insert new tags
        await tx.insert(postsTags).values(
          data.tags.map((tagId) => ({
            postId: id,
            tagId,
          }))
        );
      }

      return updatedPost;
    });
  };

  const remove = async (id: string) => {
    return await db.delete(posts).where(eq(posts.id, id)).returning().get();
  };

  return {
    create,
    getAll,
    getById,
    getBySlug,
    update,
    remove,
  };
};
