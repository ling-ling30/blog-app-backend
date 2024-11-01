import { z } from "zod";
import { categories } from "./db";

export type Context = {
  Bindings: CloudflareBindings;
  Variables: {};
};

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const PostStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export type PostStatusType = keyof typeof PostStatus;

// Define the createPostSchema for creating a new post
export const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1, "Content cannot be empty"),
  excerpt: z.string().max(255).optional(),
  featuredImageUrl: z.string().url().optional(),
  status: z.enum([PostStatus.DRAFT, PostStatus.PUBLISHED, PostStatus.ARCHIVED]),
  categoryIds: z.array(z.number()).optional(),
  tagIds: z.array(z.number()).optional(),
  viewCount: z.number().nonnegative().optional().default(0),
  publishedAt: z.number().optional(), // assuming UNIX timestamp
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
});

// Define the updatePostSchema for updating an existing post
export const updatePostSchema = createPostSchema.partial();

// Define the createTagSchema for creating a new tag
export const createTagSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100, "Tag name must be between 1 and 100 characters"),
  createdAt: z.coerce.date().optional(), // Coerce to Date if a number or string timestamp is passed
});

// Define the updateTagSchema for updating an existing tag
export const updateTagSchema = createTagSchema.partial();
