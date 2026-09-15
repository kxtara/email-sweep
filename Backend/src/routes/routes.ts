import { Router } from "express";
import {
  accessRequestEmail,
  auth,
  gmail,
  logout,
  runCleanup,
  sessionStatus,
} from "../controllers/controller.js";

import {
  accessRequestLimiter,
  cleanupLimiter,
} from "../middleware/rateLimiters.js";

const router = Router();

// Ops / monitoring
router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Session management
router.get("/auth/status", sessionStatus);
router.post("/auth/logout", logout);

// Google OAuth flow
router.get("/auth", auth);
router.get("/auth/google/callback", gmail);

// User-facing actions (rate-limited to prevent abuse)
router.post("/auth/request", accessRequestLimiter, accessRequestEmail);
router.post("/auth/cleanup", cleanupLimiter, runCleanup);

export default router;