import { Request, Response } from "express";
import { google } from "googleapis";
import { oauth2Client } from "../config/googleClient";
import open from "open";
import { sendAccessRequestEmail } from "../utils/requestAccess";


export const auth = async (_req: Request, res: Response): Promise<void> => {
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.readonly",
];

  const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
    });

        await res.redirect(authUrl);
    res.send("Check your browser to sign in to Google.")
}

export const gmail = async (req: Request, res: Response): Promise<void> => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).send("No code found.");
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    res.send("Cleanup started! You can close this tab.");

    const gmailApi = google.gmail({ version: "v1", auth: oauth2Client });

    const results = await gmailApi.users.messages.list({
      userId: "me",
      q: "newer_than:6m -is:starred -is:important -category:promotions -category:social -category:updates",
      maxResults: 20,
    });

    const messages = results.data.messages || []
    if(messages.length > 0){
      const ids = messages.map(m => m.id).filter((id): id is string => !!id);
      await gmailApi.users.messages.batchModify({
        userId: "me",
        requestBody: {
          ids: ids,
          addLabelIds: ["TRASH"],
          removeLabelIds: ["INBOX"]
        }
      });
      console.log(`Successfully trashed ${ids.length} messages.`);
    }

  } catch (err) {
    console.error("Gmial Cleanup Error:", err);
  }
};

export const accessRequestEmail = async (req: Request, res: Response):Promise<void> => {
  try {
    const {email} = req.body;
    await sendAccessRequestEmail(email)
    res.status(200).json({
      success: true,
      message : "Email request sent."
    })
  } catch (err) {
    res.status(500).json({ error: "Failed to send email" });
  }
}
