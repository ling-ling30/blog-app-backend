type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: number;
};

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Context, createCategorySchema } from "../../types";
import { categoryModule } from "./module";
import { getDB } from "../../db";

const categoriesApi = new Hono<Context>();

// List all categories
categoriesApi.get("/", async (c) => {
  try {
    const db = categoryModule(getDB(c));

    const allCategories = await db.getAll();
    return c.json(allCategories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

// src/features/categories/route.ts
categoriesApi.post("/", zValidator("json", createCategorySchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const db = categoryModule(getDB(c));

    // Check for existing slug before inserting
    const existingCategory = await db.getAll();
    const slugExists = existingCategory.some(
      (cat) => cat.slug === data.name.toLowerCase().replace(/\s+/g, "-")
    );

    if (slugExists) {
      return c.json({ error: "Category with this slug already exists" }, 400);
    }

    const result = await db.create(data);
    return c.json({ message: "created", data: result }, 201);
  } catch (error) {
    console.error("Failed to create category:", error);
    return c.json({ error: "Failed to create category" }, 500);
  }
});

// Add more routes for other CRUD operations
categoriesApi.get("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const db = categoryModule(getDB(c));
    const category = await db.getById(id);

    if (!category) {
      return c.json({ error: "Category not found" }, 404);
    }

    return c.json(category);
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return c.json({ error: "Failed to fetch category" }, 500);
  }
});

export default categoriesApi;
