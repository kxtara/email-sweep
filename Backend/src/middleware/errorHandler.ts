import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";

/**
 * Global error handler — must be the last middleware registered on the app.
 *
 * Zod validation errors become 400s with field-level detail.
 * Everything else becomes a generic 500 (detail only in development).
 */

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,

): void {

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Invalid request.",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
    ...(env.NODE_ENV === "development" && err instanceof Error
      ? { detail: err.message }
      : {}),
  });
}