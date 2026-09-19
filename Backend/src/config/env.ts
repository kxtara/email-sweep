/**
 * Centralized environment configuration.
 *
 * All env vars are validated once at startup via Zod. Import `env` everywhere
 * instead of reading process.env directly — this catches misconfiguration early
 * and keeps naming consistent across the codebase.
 */
import dotenv from "dotenv";
import { z } from "zod";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    FRONTEND_URL: z.url().default("http://localhost:5173"),
    EMAIL: z.email(),
    EMAIL_PASSWORD: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    RESEND_API_KEY:z.string().min(1),
    GOOGLE_REDIRECT_URI: z
      .url()
      .default("http://localhost:3000/auth/google/callback"),
    SESSION_SECRET: z.string().min(1),
    DATABASE_URL: z.url().optional(),
    // When true, the backend serves the built React app from the same origin.
    SERVE_FRONTEND: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
  })
  .superRefine((data, ctx) => {
    // Stricter rules only apply in production — local dev can use short secrets.
    if (
      data.NODE_ENV === "production" &&
      data.SESSION_SECRET.length < 32
    ) {

      ctx.addIssue({
        code: "custom",
        path: ["SESSION_SECRET"],
        message: "SESSION_SECRET must be at least 32 characters in production",
      });
    }

    if (data.NODE_ENV === "production" && !data.DATABASE_URL) {
      ctx.addIssue({
        code: "custom",
        path: ["DATABASE_URL"],
        message: "DATABASE_URL is required in production for persistent sessions",
      });
    }
  });


export const env = envSchema.parse(process.env);