import { Hono } from "hono";
import * as jwt from "hono/jwt";
import { setCookie } from "hono/cookie";
import { getDB, users } from "../../db";
import { Context } from "../../types";
import { eq } from "drizzle-orm";

import * as bcrypt from "bcryptjs";

export const authApi = new Hono<Context>();

// Login endpoint
authApi.post("/login", async (c) => {
  const { username, password } = await c.req.json();

  const db = getDB(c);

  // Check if user exists
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .get();

  if (!user) {
    return c.json({ error: "Invalid username or password" }, 401);
  }
  console.log("Verifying password");

  const verifyPasswordFn = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
  };
  console.log(await verifyPasswordFn(password, user.password));

  // Verify password
  if (!(await verifyPasswordFn(password, user.password))) {
    return c.json({ error: "Invalid username or password" }, 401);
  }

  return c.json({
    ...user,
  });
});
