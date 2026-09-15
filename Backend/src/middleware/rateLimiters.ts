import rateLimit from "express-rate-limit";
/** Limits destructive cleanup calls — each one can trash up to 500 messages. */

export const cleanupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many cleanup requests. Please try again later.",
  },
});

/** Limits access-request emails to reduce spam to the admin inbox. */

export const accessRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many access requests. Please try again later.",
  },
});

