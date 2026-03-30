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
    res.redirect("http://localhost:5173");
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
    const { searchQuery } = req.body;

    const gmailApi = google.gmail({ version: "v1", auth: oauth2Client });

    const results = await gmailApi.users.messages.list({
      userId: "me",
      q: searchQuery,
      maxResults: 25,
    });

    const messages = results.data.messages || [];

    if (messages.length > 0) {
      const ids = messages.map((m) => m.id).filter((id): id is string => !!id);

      // await Promise.all(
      //   ids.map(id => gmailApi.users.messages.trash({userId: "me",id}))
      // )

      await gmailApi.users.messages.batchModify({
        userId: "me",
        requestBody: {
          ids: ids,
          addLabelIds: ["TRASH"],
          removeLabelIds: ["INBOX"],
        },
      });
      
      console.log(`Successfully trashed ${ids.length} messages.`);
      return res.status(200).json({ success: true, count: ids.length });
    } else {
      res
        .status(200)
        .json({
          success: true,
          count: 0,
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
