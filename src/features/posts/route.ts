import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Context, createPostSchema, updatePostSchema } from "../../types";
import { postModule } from "./module";
import { getDB } from "../../db";

const postsApi = new Hono<Context>();

// List all posts with optional filtering
postsApi.get("/", async (c) => {
  try {
    const db = postModule(getDB(c));
    const status = c.req.query("status");
    const categoryId = c.req.query("categoryId");
    const tagId = c.req.query("tagId");
    const limit = Number(c.req.query("limit") || 10);
    const offset = Number(c.req.query("offset") || 0);
    const publish = c.req.query("isPublished");

    let isPublished;
    if (publish === "true") {
      isPublished = true;
    } else {
      isPublished = false;
    }

    const posts = await db.getAll({
      status: status as any,
      categoryId: categoryId ? Number(categoryId) : undefined,
      tagId: tagId ? Number(tagId) : undefined,
      limit,
      offset,
      isPublished: publish ? isPublished : undefined,
    });

    return c.json(posts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return c.json({ error: "Failed to fetch posts" }, 500);
  }
});

// Create post
postsApi.post("/", zValidator("json", createPostSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const db = postModule(getDB(c));

    // Optional: Check for existing slug
    const existingPost = await db.getBySlug(
      data.title.toLowerCase().replace(/\s+/g, "-")
    );

    if (existingPost) {
      return c.json({ error: "Post with this slug already exists" }, 400);
    }

    const result = await db.create(data);
    return c.json({ message: "created", data: result }, 201);
  } catch (error) {
    console.error("Failed to create post:", error);
    return c.json({ error: "Failed to create post" }, 500);
  }
});

// Get post by ID
postsApi.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = postModule(getDB(c));
    const post = await db.getById(id);

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    return c.json(post);
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return c.json({ error: "Failed to fetch post" }, 500);
  }
});

// Get post by slug
postsApi.get("/slug/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const db = postModule(getDB(c));
    const post = await db.getBySlug(slug);

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    return c.json(post);
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return c.json({ error: "Failed to fetch post" }, 500);
  }
});

// Update post
postsApi.put("/:id", zValidator("json", updatePostSchema), async (c) => {
  try {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    const db = postModule(getDB(c));

    const result = await db.update(id, data);

    if (!result) {
      return c.json({ error: "Post not found" }, 404);
    }

    return c.json({ message: "updated", data: result });
  } catch (error) {
    console.error("Failed to update post:", error);
    return c.json({ error: "Failed to update post" }, 500);
  }
});

// Delete post
postsApi.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = postModule(getDB(c));

    const result = await db.remove(id);

    if (!result) {
      return c.json({ error: "Post not found" }, 404);
    }

    return c.json({ message: "deleted", data: result });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return c.json({ error: "Failed to delete post" }, 500);
  }
});

export default postsApi;
