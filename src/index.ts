import { drizzle } from "drizzle-orm/d1";
import { notFound, onError } from "stoker/middlewares";
import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from "hono/logger";
import { Context } from "./types";
import categoriesApi from "./features/categories/route";
import postsApi from "./features/posts/route";
import tagsApi from "./features/tags/route";
import { authApi } from "./features/authentication/route";
import publicApi from "./features/publicRoutes/route";
import { verifyToken } from "./utils/jwt/jwt";
import { cors } from "hono/cors";
import { uploadApi } from "./features/upload/route";
import { settingsApi } from "./features/settings/route";

const app = new OpenAPIHono<Context>();

export type Env = {
  DB: D1Database;
  R2: R2Bucket;
};

// Enable CORS and add logging middleware at the top
app.use("*", async (c, next) => {
  const origin = c.req.header("Origin") || "*"; // Get the request's Origin header
  c.header("Access-Control-Allow-Origin", origin === "null" ? "*" : origin); // Use dynamic origin
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  c.header("Access-Control-Allow-Credentials", "true"); // Allow credentials
  if (c.req.method === "OPTIONS") {
    return c.body(null, 204); // Handle preflight requests
  }
  await next();
});

app.options("*", (c) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return c.body(null, 204);
});

app.use(logger());

// Basic route for debugging
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// Public routes
app.route("/auth", authApi);
app.route("/public", publicApi);

app.get("/files/:filename", async (c, next) => {
  const param = c.req.param("filename");
  const file = await c.env.R2.get(param);

  if (!file) {
    return c.json({
      message: "File not found",
    });
  }

  const headers = new Headers();
  file.writeHttpMetadata(headers);
  headers.set("etag", file.httpEtag);

  return new Response(file.body, {
    headers,
  });
});

// Authorization middleware (only apply it to specific routes)
app.use("/*", async (c, next) => {
  const token = c.req.header("authorization");
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const decodedToken = await verifyToken(token);
    if (!decodedToken) throw new Error("Invalid token");
  } catch (error) {
    console.error("Error verifying token:", error);
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});

// Protected routes
app.route("/categories", categoriesApi);
app.route("/posts", postsApi);
app.route("/tags", tagsApi);
app.route("/upload", uploadApi);
app.route("/settings", settingsApi);

// Error handling
app.notFound(notFound);
app.onError(onError);

export default app;
