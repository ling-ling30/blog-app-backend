import { Hono } from "hono";
import * as jwt from "hono/jwt";
import { setCookie } from "hono/cookie";
import crypto from "crypto";

const auth = new Hono();

// Use environment variables for sensitive data
const JWT_SECRET =
  process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "your-secure-password";

// Login endpoint
auth.post("/login", async (c) => {
  const { password } = await c.req.json();

  if (password !== ADMIN_PASSWORD) {
    return c.json({ success: false }, 401);
  }

  // Generate simple JWT with expiration
  const token = await jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
      role: "admin",
      random: crypto.randomUUID(),
    },
    JWT_SECRET
  );

  // Set HTTP-only cookie
  setCookie(c, "auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return c.json({ success: true });
});
