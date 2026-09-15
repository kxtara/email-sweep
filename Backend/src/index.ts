/**
 * Server entry point.
 *
 * Separated from app.ts so the Express app can be imported in tests
 * without starting a real HTTP listener.
 */

import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.PORT, () => {

  console.log(`Server running on http://localhost:${env.PORT}`);
  console.log(`Connect to Gmail: http://localhost:${env.PORT}/auth`);

  if (env.SERVE_FRONTEND) {
    console.log(`Serving frontend from http://localhost:${env.PORT}`);
  }
});