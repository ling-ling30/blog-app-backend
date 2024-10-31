import { z } from "zod";

const envSchema = z.object({
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  CLOUDFLARE_DATABASE_ID: z.string(),
  CLOUDFLARE_D1_TOKEN: z.string(),
  // PORT: z.number().optional().default(3000),
});

type Env = z.infer<typeof envSchema>;
let env: Env;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error("❌ Invalid environment variables");
  console.error(error);
  process.exit(1);
}

export default env;
