import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
  path: "src/config/.env",
});

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1).default("gpt-5.6-luna"),
  PORT: z.coerce.number().default(8008),
});

export const env = envSchema.parse(process.env);
