type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: number;
};

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { categories } from "../../db/schema";
import {
  Context,
  createCategorySchema,
  updateCategorySchema,
} from "../../types";
import { categoryModule } from "./module";
import { DrizzleDB, getDB } from "../../db";

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

// Create category
categoriesApi.post("/", zValidator("json", createCategorySchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const db = categoryModule(getDB(c));
    // Check if slug already exists
    const result = await db.create(data);
    return c.json({ message: "created", data: result }, 201);
    // return c.json({ error: "Slug already exists" }, 400);
  } catch (error) {
    console.error("Failed to create category:", error);
    return c.json({ error: "Failed to create category" }, 500);
  }
});

// Get category by ID
// categoriesApi.get("/:id", async (c) => {
//   try {
//     const id = parseInt(c.req.param("id"));
//     if (isNaN(id)) {
//       return c.json({ error: "Invalid ID" }, 400);
//     }

//     const db = createDb(c.env.DB);
//     const category = await db
//       .select()
//       .from(categories)
//       .where(eq(categories.id, id))
//       .limit(1);

//     if (!category.length) {
//       return c.json({ error: "Category not found" }, 404);
//     }

//     return c.json(category[0]);
//   } catch (error) {
//     console.error("Failed to fetch category:", error);
//     return c.json({ error: "Failed to fetch category" }, 500);
//   }
// });

// Update category
// categoriesApi.patch(
//   "/:id",
//   zValidator("json", updateCategorySchema),
//   async (c) => {
//     try {
//       const id = parseInt(c.req.param("id"));
//       if (isNaN(id)) {
//         return c.json({ error: "Invalid ID" }, 400);
//       }

//       const data = c.req.valid("json");
//       const db = createDb(c.env.DB);

//       // Check if slug is being updated and already exists
//       if (data.slug) {
//         const existing = await db
//           .select()
//           .from(categories)
//           .where(eq(categories.slug, data.slug))
//           .limit(1);

//         if (existing.length > 0 && existing[0].id !== id) {
//           return c.json({ error: "Slug already exists" }, 400);
//         }
//       }

//       const updated = await db
//         .update(categories)
//         .set({
//           ...data,
//           updatedAt: Math.floor(Date.now() / 1000),
//         })
//         .where(eq(categories.id, id))
//         .returning();

//       if (!updated.length) {
//         return c.json({ error: "Category not found" }, 404);
//       }

//       return c.json(updated[0]);
//     } catch (error) {
//       console.error("Failed to update category:", error);
//       return c.json({ error: "Failed to update category" }, 500);
//     }
//   }
// );

// Delete category
// categoriesApi.delete("/:id", async (c) => {
//   try {
//     const id = parseInt(c.req.param("id"));
//     if (isNaN(id)) {
//       return c.json({ error: "Invalid ID" }, 400);
//     }

//     const db = createDb(c.env.DB);
//     const deleted = await db
//       .delete(categories)
//       .where(eq(categories.id, id))
//       .returning();

//     if (!deleted.length) {
//       return c.json({ error: "Category not found" }, 404);
//     }

//     return c.json(deleted[0]);
//   } catch (error) {
//     console.error("Failed to delete category:", error);
//     return c.json({ error: "Failed to delete category" }, 500);
//   }
// });

export default categoriesApi;
