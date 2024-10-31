import { Context as HonoContext } from "hono";
import { DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { Context } from "../types";

export type DrizzleDB = DrizzleD1Database<typeof schema>;

export const getDB = (context: HonoContext<Context>) => {
  return drizzle<typeof schema>(context.env.DB, { schema });
};
