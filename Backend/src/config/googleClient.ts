import { google } from "googleapis";
import { env } from "./env.js";
/**
 * Creates a fresh OAuth2 client per request.
 *
 * We intentionally avoid a shared singleton — a singleton would retain the
 * last user's credentials in memory and could leak access between sessions
 * under concurrent requests.
 */

export function createOAuth2Client() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );
}