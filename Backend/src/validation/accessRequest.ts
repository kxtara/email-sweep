import { z } from "zod";

/** Validates the email submitted on the "Request Access" form. */
export const accessRequestSchema = z.object({
  email: z.email().max(254),
});
