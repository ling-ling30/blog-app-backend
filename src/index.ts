import { drizzle } from "drizzle-orm/d1";
import { notFound, onError } from "stoker/middlewares";
import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from "hono/logger";
import { config } from "dotenv";
import { Context } from "./types";
import categoriesApi from "./features/categories/route";

const app = new OpenAPIHono<Context>();

export type Env = {
  DB: D1Database;
};

app.use(logger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.route("/categories", categoriesApi);

app.notFound(notFound);
app.onError(onError);

export default app;
