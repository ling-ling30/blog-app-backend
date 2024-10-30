import { drizzle } from "drizzle-orm/d1";
import { articles } from "./db/schema";
import { notFound, onError } from "stoker/middlewares";
import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from "hono/logger";
import { config } from "dotenv";

type AppBindings = {
  Bindings: CloudflareBindings;
  Variables: {
    logger: ReturnType<typeof logger>;
  };
};

const app = new OpenAPIHono<AppBindings>();

export type Env = {
  DB: D1Database;
};

app.use(logger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/articles", async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(articles).all();
  return c.json(result);
});

app.notFound(notFound);
app.onError(onError);

export default app;
