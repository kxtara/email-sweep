import { NextFunction, Request, Response } from "express";
import { google } from "googleapis";
import { createOAuth2Client } from "../config/googleClient.js";
import { env } from "../config/env.js";
import { sendAccessRequestEmail } from "../utils/requestAccess.js";
import {
  buildGmailQuery,
  cleanupRequestSchema,
} from "../validation/cleanup.js";
import { accessRequestSchema } from "../validation/accessRequest.js";

// gmail.modify lets us trash messages; gmail.readonly lets us list/search them.
const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.readonly",
];

/** OAuth: redirect the user to Google's consent screen. */
export const auth = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const oauth2Client = createOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline", // Request a refresh token for long-lived access
      scope: GMAIL_SCOPES,
      prompt: "consent", // Force consent so we always get a refresh token
    });
    res.redirect(authUrl);
  } catch (err) {
    next(err);
  }
};

/**
 * OAuth: Google redirects here with a one-time `code`.
 * We exchange it for tokens and store them in the user's session.
 */

export const gmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {

  const code = req.query.code;
  if (typeof code !== "string" || code.length === 0 || code.length > 2048) {
    res.redirect(`${env.FRONTEND_URL}?error=no_code`);
    return;
  }

  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    req.session.tokens = tokens;
    res.redirect(`${env.FRONTEND_URL}?auth=success`);
  } catch (err) {
    next(err);
  }
};

/**
 * Core cleanup handler: search Gmail, then batch-move matches to Trash.
 *
 * Flow: validate body → build query server-side → list messages →
 * estimate size → batchModify (add TRASH, remove INBOX).
 */

export const runCleanup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {

  try {
    const userTokens = req.session.tokens;
    if (!userTokens) {
      res.status(401).json({ success: false, message: "User not authenticated." });
      return;
    }

    const cleanupParams = cleanupRequestSchema.parse(req.body);
    const { q: searchQuery, maxResults } = buildGmailQuery(cleanupParams);
    const oauth2Client = createOAuth2Client();

    oauth2Client.setCredentials(userTokens);

    const gmailApi = google.gmail({ version: "v1", auth: oauth2Client });
    const results = await gmailApi.users.messages.list({
      userId: "me",
      q: searchQuery,
      maxResults,
    });

    const messages = results.data.messages || [];

    // Check if any messages were found; if not, return early with a success response.
    if (messages.length === 0) {
      res.status(200).json({
        success: true,
        count: 0,
        megabytesSaved: 0,
        message: "No messages found for this query.",
      });
      return;
    }

    // Extract message IDs, filtering out any undefined values.
    const ids = messages.map((m) => m.id).filter((id): id is string => !!id);

    // Fetch size estimates so we can report how much storage was reclaimed.
    const messageDetails = await Promise.all(
      ids.map((id) =>
        gmailApi.users.messages.get({
          userId: "me",
          id,
          format: "minimal",
        }),
      ),
    );

    const totalBytes = messageDetails.reduce(
      (sum, msg) => sum + (msg.data.sizeEstimate || 0),0,
    );

    const totalMegabytes = parseFloat((totalBytes / (1024 * 1024)).toFixed(2));

    // Gmail batchModify moves messages to Trash in one API call (up to maxResults). -- will work on background workers for larger batches in the future.
    await gmailApi.users.messages.batchModify({
      userId: "me",
      requestBody: {
        ids,
        addLabelIds: ["TRASH"],
        removeLabelIds: ["INBOX"],
      },
    });

    res.status(200).json({
      success: true,
      count: ids.length,
      megabytesSaved: totalMegabytes,
    });
  } catch (err) {
    next(err);
  }
};

/** Lets the frontend check whether a valid OAuth session exists. */
export const sessionStatus = (
  req: Request,
  res: Response,
): void => {
  res.status(200).json({
    authenticated: Boolean(req.session.tokens),
  });
};

/** Destroys the session and clears the cookie so tokens are no longer usable. */
export const logout = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ success: false, message: "Could not log out." });
      return;
    }

    res.clearCookie("connect.sid");
    res.status(200).json({ success: true, message: "Logged out." });
  });
};

/** Sends the admin an email when someone requests beta access. */
export const accessRequestEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = accessRequestSchema.parse(req.body);
    await sendAccessRequestEmail(email);
    res.status(200).json({
      success: true,
      message: "Email request sent.",
    });
  } catch (err) {
    next(err);
  }
};
