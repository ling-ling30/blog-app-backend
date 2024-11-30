import { and, desc, eq, isNotNull, like, sql } from "drizzle-orm";
import {
  categories,
  DrizzleDB,
  posts,
  postsCategories,
  postsTags,
  PostStatus,
  tags,
} from "../../db";
import { Category, Tag } from "../../types";

export const publicModule = (db: DrizzleDB) => {
  const fetchAllCategory = async () => {
    const data = await db.select().from(categories);
    return data;
  };

  const getPublicPosts = async (
    filters: {
      title?: string;
      categoryId?: number;
      tagId?: number;
      limit?: number;
      offset?: number;
    } = {}
  ) => {
    const { title, categoryId, tagId, limit = 10, offset = 0 } = filters;

    const conditions = [
      // Only published posts
      eq(posts.status, PostStatus.PUBLISHED),
      // Only posts with publishedAt date
      isNotNull(posts.publishedAt),
    ];

    if (title) conditions.push(like(posts.title, `%${title}%`));
    if (categoryId) conditions.push(eq(postsCategories.categoryId, categoryId));
    if (tagId) conditions.push(eq(postsTags.tagId, tagId));

    const rawData = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        content: posts.content,
        excerpt: posts.excerpt,
        featuredImageUrl: posts.featuredImageUrl,
        viewCount: posts.viewCount,
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
      .orderBy(desc(posts.publishedAt));

    const postsData = rawData.map((item) => {
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
        viewCount: item.viewCount,
        publishedAt: item.publishedAt,
        categories: categoryArray,
        tags: tagArray,
      };
    });

    return postsData;
  };

  const getPublicPostBySlugWithStats = async (slug: string) => {
    const getPublicPostBySlug = async (slug: string) => {
      const post = await db
        .select({
          post: {
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            content: posts.content,
            excerpt: posts.excerpt,
            featuredImageUrl: posts.featuredImageUrl,
            viewCount: posts.viewCount,
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
        .where(
          and(
            eq(posts.slug, slug),
            eq(posts.status, PostStatus.PUBLISHED),
            isNotNull(posts.publishedAt)
          )
        )
        .groupBy(posts.id)
        .get();

      if (!post) return null;

      // Parse JSON strings back to arrays
      return {
        ...post.post,
        categories: post.categories ? JSON.parse(`[${post.categories}]`) : [],
        tags: post.tags ? JSON.parse(`[${post.tags}]`) : [],
      };
    };

    const incrementPostViewCount = async (postId: string) => {
      await db
        .update(posts)
        .set({
          viewCount: sql`${posts.viewCount} + 1`,
        })
        .where(eq(posts.id, postId));
    };

    const post = await getPublicPostBySlug(slug);

    if (post) {
      // Increment view count asynchronously
      await incrementPostViewCount(post.id);

      // Return updated view count
      return {
        ...post,
        viewCount: (post.viewCount ?? 0) + 1,
      };
    }

    return null;
  };

  const fetchAllTag = async () => {
    const data = await db.select().from(tags);
    return data;
  };

  return {
    fetchAllCategory,
    getPublicPosts,
    fetchAllTag,
    getPublicPostBySlugWithStats,
  };
};
