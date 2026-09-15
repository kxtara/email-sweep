import type { Credentials } from "google-auth-library";
/**
 * Extends express-session's SessionData so TypeScript knows about our
 * custom `tokens` field (Google OAuth credentials stored per user).
 */

declare module "express-session" {
  interface SessionData {
    tokens?: Credentials;
  }
}

