import { relations, sql } from "drizzle-orm";
import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";

export const PostStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

//User
export const users = table("users", {
  id: t.text("id").primaryKey(),
  username: t.text("username").notNull().unique(),
  password: t.text("password").notNull(),
});

//post
export const posts = table(
  "posts",
  {
    id: t.text("id").primaryKey(),
    title: t.text("title").notNull(),
    slug: t.text("slug").notNull().unique(),
    content: t.text("content").notNull(),
    excerpt: t.text("excerpt"),
    featuredImageUrl: t.text("featured_image_url"),
    status: t.text("status").notNull().default("draft"),
    viewCount: t.integer("view_count").default(0),
    createdAt: t
      .integer("created_at")
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: t
      .integer("updated_at")
      .notNull()
      .default(sql`(unixepoch())`),
    publishedAt: t.integer("published_at"),
  },
  (table) => {
    return {
      slugIndex: t.uniqueIndex("slugIndex").on(table.slug),
      titleIndex: t.index("titleIndex").on(table.title),
      statusIndex: t.index("statusIndex").on(table.status),
    };
  }
);

export const postsRelations = relations(posts, ({ many }) => ({
  categories: many(postsCategories),
  tags: many(postsTags),
}));

// Juction Table postsToCategories
export const postsCategories = table(
  "post_categories",
  {
    postId: t
      .text("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    categoryId: t
      .integer("category_id")
      .references(() => categories.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: t
      .integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    pk: t.primaryKey({ columns: [table.postId, table.categoryId] }),
  })
);

export const postsCategoriesRelations = relations(
  postsCategories,
  ({ one }) => ({
    post: one(posts, {
      fields: [postsCategories.postId],
      references: [posts.id],
    }),
    category: one(categories, {
      fields: [postsCategories.categoryId],
      references: [categories.id],
    }),
  })
);

// Juction Table postsToTags
export const postsTags = table(
  "post_tags",
  {
    postId: t
      .text("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    tagId: t
      .integer("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: t
      .integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    pk: t.primaryKey({ columns: [table.postId, table.tagId] }),
  })
);

export const postsTagsRelations = relations(postsTags, ({ one }) => ({
  post: one(posts, {
    fields: [postsTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postsTags.tagId],
    references: [tags.id],
  }),
}));

// Categories table
export const categories = table(
  "categories",
  {
    id: t.integer("id").primaryKey({ autoIncrement: true }),
    name: t.text("name").notNull(),
    slug: t.text("slug").notNull().unique(),
    description: t.text("description"),
    createdAt: t
      .integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    // Add indexes for commonly queried fields
    nameIndex: t.index("categories_name_idx").on(table.name),
    slugIndex: t.uniqueIndex("categories_slug_idx").on(table.slug),
    createdAtIndex: t.index("categories_created_at_idx").on(table.createdAt),
  })
);

export const categoriesRelation = relations(categories, ({ many }) => ({
  posts: many(postsCategories),
}));

// Tags table
export const tags = table("tags", {
  id: t.integer("id").primaryKey({ autoIncrement: true }),
  name: t.text("name").notNull().unique(),
  slug: t.text("slug").notNull().unique(),
  createdAt: t
    .integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postsTags),
}));
