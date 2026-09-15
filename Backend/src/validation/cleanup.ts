/**
 * Cleanup request validation and Gmail query construction.
 *
 * Security model: the frontend sends structured choices (bucket ID, category
 * toggles) — never a raw Gmail search string. The server builds the query from
 * an allowlist so users cannot inject arbitrary searches like `from:ceo@...`.
 */

import { z } from "zod";

/** Time-window presets the user can pick in the UI. */
export const CLEANUP_BUCKET_IDS = ["older_than_1y", "older_than_6m"] as const;

/** Gmail operators the UI is allowed to exclude from a sweep. */
export const ALLOWED_CATEGORY_EXCLUSIONS = [
  "category:promotions",
  "category:social",
  "category:updates",
  "category:forums",
  "category:primary",
  "is:important",
  "is:unread",
  "label:purchases",
  "label:finance",
  "label:travel",
  "label:newsletters",
] as const;

export const cleanupRequestSchema = z.object({
  bucketId: z.enum(CLEANUP_BUCKET_IDS),
  excludedCategories: z
    .array(z.enum(ALLOWED_CATEGORY_EXCLUSIONS))
    .max(ALLOWED_CATEGORY_EXCLUSIONS.length)
    .default([]),
  excludeStarred: z.boolean().default(true),
});

export type CleanupRequest = z.infer<typeof cleanupRequestSchema>;

/** Server-owned mapping from bucket ID → Gmail query + batch size cap. */
export const CLEANUP_BUCKETS: Record<
  CleanupRequest["bucketId"],
  { query: string; maxResults: number }
> = {
  older_than_1y: { query: "older_than:1y", maxResults: 500 },
  older_than_6m: { query: "older_than:6m", maxResults: 200 },
};

/**
 * Builds the final Gmail search string from validated user choices.
 *
 * Example output:
 *   "older_than:1y (-category:promotions OR -is:important) -is:starred"
 *
 * Categories are negated (prefixed with -) because toggled categories are
 * *protected* — we exclude them from the sweep.
 */

export function buildGmailQuery(params: CleanupRequest): {
  q: string;
  maxResults: number;
} {

  const bucket = CLEANUP_BUCKETS[params.bucketId];
  const categoryPart =
    params.excludedCategories.length > 0
      ? `(${params.excludedCategories.map((category) => `-${category}`).join(" OR ")})`
      : "";

  const exclusionPart = params.excludeStarred ? "-is:starred" : "";

  const q = [bucket.query, categoryPart, exclusionPart]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return { q, maxResults: bucket.maxResults };
}