/**
 * Express application factory.
 *
 * All middleware and routes are wired here. Exporting createApp() (instead of
 * building the app inline in index.ts) lets tests spin up the full stack via
 * supertest without binding to a port.
 */
import express from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/routes.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  // Required when running behind a reverse proxy (Docker, Railway, etc.) so
  // Express trusts X-Forwarded-* headers for secure cookies and client IPs.
  if (env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  const PgSession = connectPgSimple(session);

  // Postgres store keeps OAuth sessions alive across server restarts.
  // Without DATABASE_URL we fall back to in-memory storage (fine for local dev).
  const sessionStore = env.DATABASE_URL
    ? new PgSession({
        conString: env.DATABASE_URL,
        createTableIfMissing: true,
      })
    : undefined;

  if (!sessionStore && env.NODE_ENV !== "test") {
    console.warn(
      "DATABASE_URL is not set. Sessions are stored in memory and will be lost on restart.",
    );
  }

  app.use(
    session({
      secret: env.SESSION_SECRET,
      store: sessionStore,
      resave: false, // Don't re-save unchanged sessions (recommended for stores)
      saveUninitialized: false, // Only create a session after something is stored (e.g. OAuth tokens)
      cookie: {
        secure: env.NODE_ENV === "production", // HTTPS-only in production
        httpOnly: true, // Prevent JavaScript from reading the session cookie
        // Cross-origin frontend (split deploy): SameSite=None + Secure so the
        // browser sends the cookie on fetch() from a different domain.
        // Single-origin deploy (SERVE_FRONTEND): Lax is sufficient.
        sameSite:
          env.NODE_ENV === "production" && !env.SERVE_FRONTEND ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  // credentials: true is required so the browser sends session cookies on
  // cross-origin requests from the React frontend.
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // Cap body size to limit abuse of JSON endpoints.
  app.use(express.json({ limit: "16kb" }));
  app.use(router);

  // Production single-origin mode: serve the Vite build and fall back to
  // index.html for client-side routing (React handles all non-API paths).
  if (env.SERVE_FRONTEND) {
    const frontendDist = path.resolve(__dirname, "../../Frontend/dist");
    app.use(express.static(frontendDist));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/auth") || req.path === "/health") {
        next();
        return;
      }
      res.sendFile(path.join(frontendDist, "index.html"), (err) => {
        if (err) next(err);
      });
    });
  }

  // Must be registered last so it catches errors thrown in routes/middleware.
  app.use(errorHandler);

  return app;
}
