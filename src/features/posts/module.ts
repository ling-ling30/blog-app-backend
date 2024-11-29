import { eq, and, sql, desc, asc, or, like } from "drizzle-orm";
import { posts, postsCategories, postsTags, DrizzleDB } from "../../db";
import { categories, PostStatus, tags } from "../../db/schema"; // Assuming you've defined this
import { z } from "zod";
import {
  Category,
  createPostSchema,
  Post,
  PostWithRelations,
  Tag,
} from "../../types";

export const postModule = (db: DrizzleDB) => {
  const create = async (content: z.infer<typeof createPostSchema>) => {
    const randomString = crypto.randomUUID();
    // Improve slug generation
    const sluggedTitle = content.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-"); // Replace spaces with hyphens

    const slug = sluggedTitle + `-${randomString}`;

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
        content.categoryIds.map((category) => ({
          postId: post.id,
          categoryId: category.id,
        }))
      );
    }

    // Insert tags if provided
    if (content.tagIds && content.tagIds.length > 0) {
      await db.insert(postsTags).values(
        content.tagIds.map((tag) => ({
          postId: post.id,
          tagId: tag.id,
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
      isPublished?: boolean;
      search?: string;
      sortBy?: "createdAt" | "title" | "viewCount" | "publishedAt";
      sortOrder?: "asc" | "desc";
    } = {}
  ): Promise<PostWithRelations[]> => {
    const {
      status,
      categoryId,
      tagId,
      limit = 10,
      offset = 0,
      isPublished,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const conditions = [];
    if (isPublished) conditions.push(eq(posts.status, PostStatus.PUBLISHED));
    if (status) conditions.push(eq(posts.status, status));
    if (categoryId) conditions.push(eq(postsCategories.categoryId, categoryId));
    if (tagId) conditions.push(eq(postsTags.tagId, tagId));
    if (search) {
      conditions.push(
        or(
          like(posts.title, `%${search}%`),
          like(posts.content, `%${search}%`),
          like(posts.excerpt, `%${search}%`)
        )
      );
    }

    // Type-safe sorting configuration
    const sortConfig = {
      createdAt: () =>
        sortOrder === "desc" ? desc(posts.createdAt) : asc(posts.createdAt),
      title: () =>
        sortOrder === "desc" ? desc(posts.title) : asc(posts.title),
      viewCount: () =>
        sortOrder === "desc" ? desc(posts.viewCount) : asc(posts.viewCount),
      publishedAt: () =>
        sortOrder === "desc" ? desc(posts.publishedAt) : asc(posts.publishedAt),
    } as const;

    const getSortExpression = () => {
      return (
        sortConfig[sortBy as keyof typeof sortConfig] || sortConfig.createdAt
      )();
    };

    const rawData = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        content: posts.content,
        excerpt: posts.excerpt,
        featuredImageUrl: posts.featuredImageUrl,
        status: posts.status,
        viewCount: posts.viewCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        publishedAt: posts.publishedAt,
        categories: sql<string>`GROUP_CONCAT(DISTINCT json_object(
          'id', ${categories.id},
          'name', ${categories.name},
          'slug', ${categories.slug}
        ))`.as("categories"),
        tags: sql<string>`GROUP_CONCAT(DISTINCT json_object(
          'id', ${tags.id},
          'name', ${tags.name},
          'slug', ${tags.slug}
        ))`.as("tags"),
      })
      .from(posts)
      .leftJoin(postsCategories, eq(posts.id, postsCategories.postId))
      .leftJoin(categories, eq(postsCategories.categoryId, categories.id))
      .leftJoin(postsTags, eq(posts.id, postsTags.postId))
      .leftJoin(tags, eq(postsTags.tagId, tags.id))
      .where(and(...conditions))
      .groupBy(posts.id)
      .limit(limit)
      .offset(offset)
      .orderBy(getSortExpression());

    // Transform raw data into Post[] with parsed categories and tags
    const postsData: PostWithRelations[] = rawData.map((item) => {
      let categoryArray: Category[] = [];
      let tagArray: Tag[] = [];

      const parsedCategories: Category[] = item.categories
        ? JSON.parse(`[${item.categories}]`)
        : [];
      for (const category of parsedCategories) {
        if (category.id !== null) categoryArray.push(category);
      }

      const parsedTags: Tag[] = item.tags ? JSON.parse(`[${item.tags}]`) : [];

      for (const tag of parsedTags) {
        if (tag.id !== null) tagArray.push(tag);
      }
      // Return the properly typed result

      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        content: item.content,
        excerpt: item.excerpt,
        featuredImageUrl: item.featuredImageUrl,
        status: item.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        viewCount: item.viewCount,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        publishedAt: item.publishedAt,
        categories: categoryArray,
        tags: tagArray,
      };
    });

    return postsData;
  };

  const getById = async (id: string) => {
    return await db.select().from(posts).where(eq(posts.id, id)).get();
  };

  const getBySlug = async (slug: string): Promise<PostWithRelations | null> => {
    const post = await db
      .select({
        post: {
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          content: posts.content,
          excerpt: posts.excerpt,
          featuredImageUrl: posts.featuredImageUrl,
          status: posts.status,
          viewCount: posts.viewCount,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          publishedAt: posts.publishedAt,
        },
        categories: sql<string>`GROUP_CONCAT(DISTINCT json_object(
          'id', ${categories.id},
          'name', ${categories.name},
          'slug', ${categories.slug}
        ))`.as("categories"),
        tags: sql<string>`GROUP_CONCAT(DISTINCT json_object(
          'id', ${tags.id},
          'name', ${tags.name},
          'slug', ${tags.slug}
        ))`.as("tags"),
      })
      .from(posts)
      .leftJoin(postsCategories, eq(posts.id, postsCategories.postId))
      .leftJoin(categories, eq(postsCategories.categoryId, categories.id))
      .leftJoin(postsTags, eq(posts.id, postsTags.postId))
      .leftJoin(tags, eq(postsTags.tagId, tags.id))
      .where(eq(posts.slug, slug))
      .groupBy(posts.id)
      .get();

    if (!post) return null;

    // Parse the GROUP_CONCAT results safely
    let categoryArray: Category[] = [];
    let tagArray: Tag[] = [];

    const parsedCategories: Category[] = post.categories
      ? JSON.parse(`[${post.categories}]`)
      : [];
    for (const category of parsedCategories) {
      if (category.id !== null) categoryArray.push(category);
    }

    const parsedTags: Tag[] = post.tags ? JSON.parse(`[${post.tags}]`) : [];

    for (const tag of parsedTags) {
      if (tag.id !== null) tagArray.push(tag);
    }
    // Return the properly typed result
    return {
      ...post.post,
      categories: categoryArray,
      tags: tagArray,
    };
  };

  const update = async (
    id: string,
    data: Partial<typeof posts.$inferInsert> & {
      categoryIds?: Category[] | [];
      tagIds?: Tag[] | [];
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
    if (data.categoryIds && data.categoryIds.length > 0) {
      // First, delete existing categories
      await db.delete(postsCategories).where(eq(postsCategories.postId, id));
      // Then insert new categories
      await db.insert(postsCategories).values(
        data.categoryIds.map((category) => ({
          postId: id,
          categoryId: category.id,
        }))
      );
    }

    // Update tags if provided
    if (data.tagIds && data.tagIds.length > 0) {
      // First, delete existing tags

      await db.delete(postsTags).where(eq(postsTags.postId, id));

      // Then insert new tags
      await db.insert(postsTags).values(
        data.tagIds.map((tag) => ({
          postId: id,
          tagId: tag.id,
        }))
      );
    }

    return updatedPost;
  };

  const remove = async (id: string) => {
    return await db.delete(posts).where(eq(posts.id, id)).returning().get();
  };

  const publish = async (id: string) => {
    const post = await db
      .update(posts)
      .set({
        status: PostStatus.PUBLISHED,
        publishedAt: Math.floor(Date.now() / 1000), // Current Unix timestamp
      })
      .where(eq(posts.id, id))
      .returning();

    return post;
  };
  return {
    create,
    getAll,
    getById,
    getBySlug,
    update,
    remove,
    publish,
  };
};
