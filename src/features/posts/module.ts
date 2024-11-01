import { eq, and } from "drizzle-orm";
import { posts, postsCategories, postsTags, DrizzleDB } from "../../db";
import { PostStatus } from "../../db/schema"; // Assuming you've defined this
import { z } from "zod";
import { createPostSchema } from "../../types";

export const postModule = (db: DrizzleDB) => {
  const create = async (content: z.infer<typeof createPostSchema>) => {
    // Improve slug generation
    const slug = content.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-"); // Replace spaces with hyphens

    const id = crypto.randomUUID();
    // Insert post
    const [post] = await db
      .insert(posts)
      .values({
        id,
        title: content.title,
        slug,
        content: content.content,
        status: content.status || "DRAFT",
        excerpt: content.excerpt,
        featuredImageUrl: content.featuredImageUrl,
      })
      .returning();

    // Insert categories if provided
    if (content.categoryIds && content.categoryIds.length > 0) {
      await db.insert(postsCategories).values(
        content.categoryIds.map((categoryId) => ({
          postId: post.id,
          categoryId,
        }))
      );
    }

    // Insert tags if provided
    if (content.tagIds && content.tagIds.length > 0) {
      await db.insert(postsTags).values(
        content.tagIds.map((tagId) => ({
          postId: post.id,
          tagId,
        }))
      );
    }

    return await db.query.posts.findFirst({
      where: eq(posts.id, post.id),
      with: {
        tags: {
          with: {
            tag: true,
          },
        },
        categories: {
          with: {
            category: true,
          },
        },
      },
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
    // Update post
    const [updatedPost] = await db
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
      await db.delete(postsCategories).where(eq(postsCategories.postId, id));

      // Then insert new categories
      await db.insert(postsCategories).values(
        data.categories.map((categoryId) => ({
          postId: id,
          categoryId,
        }))
      );
    }

    // Update tags if provided
    if (data.tags) {
      // First, delete existing tags
      await db.delete(postsTags).where(eq(postsTags.postId, id));

      // Then insert new tags
      await db.insert(postsTags).values(
        data.tags.map((tagId) => ({
          postId: id,
          tagId,
        }))
      );
    }

    return updatedPost;
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
