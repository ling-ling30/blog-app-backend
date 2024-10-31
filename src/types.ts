import { z } from "zod";
export type Context = {
  Bindings: CloudflareBindings;
  Variables: {};
};

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
