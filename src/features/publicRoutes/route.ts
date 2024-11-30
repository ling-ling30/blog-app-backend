// src/features/public/route.ts
import { Hono } from "hono";
import { Context } from "../../types";
import { publicModule } from "./module";
import { getDB } from "../../db";

const publicApi = new Hono<Context>();

// Get all categories
publicApi.get("/categories", async (c) => {
  try {
    const db = publicModule(getDB(c));
    const categories = await db.fetchAllCategory();
    return c.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

// Get all tags
publicApi.get("/tags", async (c) => {
  try {
    const db = publicModule(getDB(c));
    const tags = await db.fetchAllTag();
    return c.json(tags);
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return c.json({ error: "Failed to fetch tags" }, 500);
  }
});

// Get all public posts with filters
publicApi.get("/posts", async (c) => {
  try {
    const { categoryId, tagId, limit, offset, title } = c.req.query();
    const db = publicModule(getDB(c));

    const posts = await db.getPublicPosts({
      title: title ? title : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      tagId: tagId ? Number(tagId) : undefined,
      limit: limit ? Number(limit) : 10,
      offset: offset ? Number(offset) : 0,
    });

    return c.json(posts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return c.json({ error: "Failed to fetch posts" }, 500);
  }
});

// Get public post by slug (with view count increment)
publicApi.get("/posts/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const db = publicModule(getDB(c));

    const post = await db.getPublicPostBySlugWithStats(slug);

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    return c.json(post);
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return c.json({ error: "Failed to fetch post" }, 500);
  }
});

export default publicApi;
