import { NextFunction, Request, Response } from "express";
import { google } from "googleapis";
import { oauth2Client } from "../config/googleClient.js";
import { sendAccessRequestEmail } from "../utils/requestAccess.js";

export const auth = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const SCOPES = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.readonly",
  ];

  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
    });

    await res.redirect(authUrl);
  } catch (err) {
    next(err);
  }
};

export const gmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).send("No code found.");
    return res.redirect("http://localhost:5173?error=no_code");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    (req as any).session.tokens = tokens;
    res.redirect("http://localhost:5173?auth=success");
  } catch (err) {
    next(err);
  }
};

export const runCleanup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // depending on the selection from the frontend, we can modify the maxResults to either 200 or 500
    const { searchQuery, maxResults } = req.body;

    const userTokens = (req as any).session?.tokens;
    if (!userTokens) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated." });
    }

    oauth2Client.setCredentials(userTokens);
    
    const gmailApi = google.gmail({ version: "v1", auth: oauth2Client });

    const results = await gmailApi.users.messages.list({
      userId: "me",
      q: searchQuery,
      maxResults: maxResults || 25, // default is 100, max is 500
    });

    const messages = results.data.messages || [];

    if (messages.length > 0) {
      const ids = messages.map((m) => m.id).filter((id): id is string => !!id);

      // await Promise.all(
      //   ids.map(id => gmailApi.users.messages.trash({userId: "me",id}))
      // )

      // Get details of each message before trashing
      const messageDetails = await Promise.all(
        ids.map((id) =>
          gmailApi.users.messages.get({
            userId: "me",
            id,
            format: "minimal",
          }),
        ),
      );

      // sum up the size of all messages to be trashed
      const totalBytes = messageDetails.reduce(
        (sum, msg) => sum + (msg.data.sizeEstimate || 0),
        0,
      );
      console.log(`Total size of messages to be trashed: ${totalBytes} bytes`);

      // convert bytes to megabytes and round to 2 decimal places
      const totalMegabytes = parseFloat(
        (totalBytes / (1024 * 1024)).toFixed(2),
      );

      await gmailApi.users.messages.batchModify({
        userId: "me",
        requestBody: {
          ids: ids,
          addLabelIds: ["TRASH"],
          removeLabelIds: ["INBOX"],
        },
      });

      console.log(
        `Successfully trashed ${ids.length} messages. Saved ${totalMegabytes} MB.`,
      );
      return res
        .status(200)
        .json({
          success: true,
          count: ids.length,
          megabytesSaved: totalMegabytes,
        });
    } else {
      res.status(200).json({
        success: true,
        count: 0,
        megabytesSaved: 0,
        message: "No messages found for this query.",
      });
    }
  } catch (err) {
    next(err);
  }
};

export const accessRequestEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body;
    await sendAccessRequestEmail(email);
    res.status(200).json({
      success: true,
      message: "Email request sent.",
    });
  } catch (err) {
    next(err);
  }
};
