import { Hono } from "hono";
import { Context, settingsSchema } from "../../types";
import { zValidator } from "@hono/zod-validator";

import { settingsModule } from "./module";
import { getDB } from "../../db";

export const settingsApi = new Hono<Context>();

settingsApi.get("", async (c) => {
  try {
    const db = settingsModule(getDB(c));
    const settings = await db.getSettings();
    return c.json(settings);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return c.json({ error: "Failed to fetch settings" }, 500);
  }
});

settingsApi.get("/:key", async (c) => {
  try {
    const key = c.req.param("key");
    const db = settingsModule(getDB(c));
    const settings = await db.getSettingsByKey(key);
    return c.json(settings);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return c.json({ error: "Failed to fetch settings" }, 500);
  }
});

settingsApi.put("/", zValidator("json", settingsSchema), async (c) => {
  try {
    const values = c.req.valid("json");
    const db = settingsModule(getDB(c));
    await db.updateSettings(values);
    return c.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return c.json({ error: "Failed to update settings" }, 500);
  }
});
