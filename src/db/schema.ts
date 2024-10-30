import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable("articles", {
  id: integer("id", { mode: "timestamp_ms" }).primaryKey(),
  title: text("title"),
  content: text("content"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});
