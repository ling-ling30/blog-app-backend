import { eq } from "drizzle-orm";
import { DrizzleDB, settings } from "../../db";
import { z } from "zod";
import { settingsSchema } from "../../types";

export const settingsModule = (db: DrizzleDB) => {
  const getSettings = async () => {
    const data = await db.select().from(settings);
    return data;
  };

  const getSettingsByKey = async (key: string) => {
    const data = await db.select().from(settings).where(eq(settings.id, key));
    return data;
  };

  const updateSettings = async (values: z.infer<typeof settingsSchema>) => {
    for (const setting of Object.entries(values)) {
      const [key, value] = setting;
      await db.update(settings).set({ value }).where(eq(settings.id, key));
    }
  };

  return {
    getSettings,
    getSettingsByKey,
    updateSettings,
  };
};
