import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Context, createTagSchema, updateTagSchema } from "../../types";
import { tagModule } from "./module";
import { getDB } from "../../db";

const tagsApi = new Hono<Context>();

// List all tags
tagsApi.get("/", async (c) => {
  try {
    const db = tagModule(getDB(c));
    const allTags = await db.getAll();
    return c.json(allTags);
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return c.json({ error: "Failed to fetch tags" }, 500);
  }
});

// Create tag
tagsApi.post("/", zValidator("json", createTagSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const db = tagModule(getDB(c));

    // Check for existing slug before inserting
    const existingTags = await db.getAll();
    const slugExists = existingTags.some(
      (tag) => tag.slug === data.name.toLowerCase().replace(/\s+/g, "-")
    );

    if (slugExists) {
      return c.json({ error: "Tag with this slug already exists" }, 400);
    }

    const result = await db.create(data);
    return c.json({ message: "created", data: result }, 201);
  } catch (error) {
    console.error("Failed to create tag:", error);
    return c.json({ error: "Failed to create tag" }, 500);
  }
});

// Get tag by ID
tagsApi.get("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const db = tagModule(getDB(c));
    const tag = await db.getById(id);

    if (!tag) {
      return c.json({ error: "Tag not found" }, 404);
    }

    return c.json(tag);
  } catch (error) {
    console.error("Failed to fetch tag:", error);
    return c.json({ error: "Failed to fetch tag" }, 500);
  }
});

// Update tag
tagsApi.put("/:id", zValidator("json", updateTagSchema), async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    const db = tagModule(getDB(c));

    const result = await db.update(id, data);

    if (!result) {
      return c.json({ error: "Tag not found" }, 404);
    }

    return c.json({ message: "updated", data: result });
  } catch (error) {
    console.error("Failed to update tag:", error);
    return c.json({ error: "Failed to update tag" }, 500);
  }
});

// Delete tag
tagsApi.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const db = tagModule(getDB(c));

    const result = await db.remove(id);

    if (!result) {
      return c.json({ error: "Tag not found" }, 404);
    }

    return c.json({ message: "deleted", data: result });
  } catch (error) {
    console.error("Failed to delete tag:", error);
    return c.json({ error: "Failed to delete tag" }, 500);
  }
});

export default tagsApi;
