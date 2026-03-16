import nodemailer from "nodemailer";
import z from "zod";
import { env } from "../config/env";

const emailSchema = z.string().email();

export const sendAccessRequestEmail = async (
  requestedEmail: string 
): Promise<void> => {

    const validatedEmail = emailSchema.parse(requestedEmail);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL,
      pass: env.EMAIL_PASSWORD,
    },
  });

  const adminEmail = env.EMAIL; 
  
  const htmlTemplate = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 450px; margin: 0 auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
  <div style="height: 6px; background: linear-gradient(to right, #4facfe, #00f2fe, #43e97b);"></div>
  
  <div style="padding: 30px;">
    <div style="text-align: center; margin-bottom: 25px;">
      <h2 style="color: #2c3e50; margin-bottom: 5px; font-weight: 600;">New Access Request</h2>
      <p style="color: #7f8c8d; font-size: 14px; margin-top: 0;">EmailSweep Beta Program</p>
    </div>

    <p style="color: #555; font-size: 15px; line-height: 1.6;">
      A new user is requesting access to <strong>EmailSweep</strong>. Add this email to your Google Cloud Console to allow them to sign in.
    </p>

    <div style="background-color: #f4f7f9; border-left: 4px solid #4facfe; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0; color: #7f8c8d; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">User Email Address</p>
      <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #1a73e8;">${validatedEmail}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://console.cloud.google.com/apis/credentials/consent" 
         style="background-color: #1a73e8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
        Open Google Cloud Console
      </a>
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f0f0f0; text-align: center;">
      <p style="color: #aaa; font-size: 11px; margin: 0;">
        &copy; ${new Date().getFullYear()} EmailSweep Admin Tools
      </p>
    </div>
  </div>
</div>
`;

  await transporter.sendMail({
    from: `"EmailSweep System" <${adminEmail}>`,
    to: adminEmail, // Send the notification TO YOURSELF
    subject: `🚨 Access Request: ${validatedEmail}`,
    html: htmlTemplate,
  });
};