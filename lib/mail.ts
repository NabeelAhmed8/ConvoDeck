import nodemailer, { Transporter } from "nodemailer";
import { renderVerificationEmailHtml } from "./email/verificationEmailTemplate";
import { renderAgentWelcomeEmailHtml } from "./email/agentWelcomeEmailTemplate";

export interface SendVerificationEmailParams {
  to: string;
  code: string;
  type: "signup" | "login" | "reset_password" | "change_email";
  recipientName?: string;
}

export function generateVerificationCode(): string {
  // 6-digit numeric code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Creates and returns the active Nodemailer transporter.
 * Uses environment variables SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.
 * Gracefully falls back to Ethereal/mock transporter for local testing.
 */
async function getMailTransporter(): Promise<{
  transporter: Transporter;
  fromAddress: string;
  isMock: boolean;
}> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from =
    process.env.SMTP_FROM ||
    `"ConvoDeck Security" <${user || "security@convodeck.com"}>`;

  // Real credentials provided
  if (host && user && pass) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });

    return { transporter, fromAddress: from, isMock: false };
  }

  // Fallback for development/testing
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    return { transporter, fromAddress: from, isMock: true };
  } catch {
    const transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "windows",
    });
    return { transporter, fromAddress: from, isMock: true };
  }
}

/**
 * Dispatches a 6-digit verification code with soft Neumorphic HTML styling.
 */
export async function sendVerificationEmail({
  to,
  code,
  type,
  recipientName,
}: SendVerificationEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  previewUrl?: string | false;
  error?: string;
}> {
  try {
    const { transporter, fromAddress, isMock } = await getMailTransporter();
    const { subject, title, html } = renderVerificationEmailHtml({
      code,
      type,
      recipientName,
    });

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: `${title}\n\nVerification Code: ${code}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
      html,
    });

    const previewUrl = isMock ? nodemailer.getTestMessageUrl(info) : false;

    console.log("--------------------------------------------------");
    console.log(`[ConvoDeck Nodemailer] ${type.toUpperCase()} OTP Sent`);
    console.log(`Recipient: ${to}`);
    console.log(`Code: ${code}`);
    if (previewUrl) {
      console.log(`Preview Email: ${previewUrl}`);
    }
    console.log("--------------------------------------------------");

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
    };
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to send verification email";
    console.error("Nodemailer Send Error:", error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Dispatches agent onboarding credentials with soft Neumorphic HTML styling.
 */
export async function sendAgentWelcomeEmail(params: {
  to: string;
  agentName: string;
  role: string;
  workspaceName: string;
  temporaryPassword: string;
  loginUrl: string;
}): Promise<{ success: boolean; previewUrl?: string | false; error?: string }> {
  try {
    const { transporter, fromAddress, isMock } = await getMailTransporter();
    const { subject, html } = renderAgentWelcomeEmailHtml(params);

    const info = await transporter.sendMail({
      from: fromAddress,
      to: params.to,
      subject,
      text: `Welcome to ${params.workspaceName}!\n\nEmail: ${params.to}\nTemporary Password: ${params.temporaryPassword}\nLogin: ${params.loginUrl}`,
      html,
    });

    const previewUrl = isMock ? nodemailer.getTestMessageUrl(info) : false;

    console.log("--------------------------------------------------");
    console.log(`[ConvoDeck Nodemailer] New Agent Welcome Email Sent to: ${params.to}`);
    if (previewUrl) console.log(`Preview: ${previewUrl}`);
    console.log("--------------------------------------------------");

    return { success: true, previewUrl };
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to send welcome email";
    return { success: false, error: errorMsg };
  }
}
