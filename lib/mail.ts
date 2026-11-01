import nodemailer, { Transporter } from "nodemailer";

export interface SendVerificationEmailParams {
  to: string;
  code: string;
  type: "signup" | "login";
  recipientName?: string;
}

export function generateVerificationCode(): string {
  // 6-digit numeric code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Creates and returns the active Nodemailer transporter.
 * Uses environment variables SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.
 * Gracefully falls back to Ethereal/mock transporter for effortless local testing.
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

  // If real credentials are provided, use real SMTP server
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

  // Fallback for development/testing when SMTP is not yet configured
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
    // Graceful fallback transporter if Ethereal is unreachable on cloud serverless
    const transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "windows",
    });
    return { transporter, fromAddress: from, isMock: true };
  }
}

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

    const isSignup = type === "signup";
    const subject = isSignup
      ? `${code} is your ConvoDeck verification code`
      : `${code} is your ConvoDeck sign-in code`;

    const title = isSignup
      ? "Verify your new account"
      : "Verify your sign-in attempt";

    const greeting = recipientName ? `Hello ${recipientName},` : "Hello,";

    const explanation = isSignup
      ? "Thank you for choosing ConvoDeck. Enter this 6-digit verification code to complete your workspace registration and start using your WhatsApp CRM:"
      : "We received a sign-in request for your ConvoDeck workspace. Enter this 6-digit verification code to securely access your account:";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #020617; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header Branding -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: left; border-bottom: 1px solid #1e293b;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width: 36px; height: 36px; background: linear-gradient(135deg, #25D366 0%, #2563eb 100%); border-radius: 10px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: 900; font-size: 18px;">
                    C
                  </td>
                  <td style="padding-left: 12px;">
                    <div style="font-size: 17px; font-weight: 800; color: #ffffff; line-height: 1.2;">ConvoDeck</div>
                    <div style="font-size: 11px; font-weight: 600; color: #34d399; letter-spacing: 0.5px; text-transform: uppercase;">WhatsApp Sales CRM</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">${title}</h1>
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">${greeting}</p>
              <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">${explanation}</p>

              <!-- OTP Code Display Box -->
              <div style="background-color: #020617; border: 1.5px solid #25D366; border-radius: 14px; padding: 22px; text-align: center; margin: 0 0 28px 0;">
                <span style="display: block; font-size: 11px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">Your 6-Digit Verification Code</span>
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #ffffff; line-height: 1.2; text-shadow: 0 0 15px rgba(37, 211, 102, 0.4);">${code}</span>
                <span style="display: block; font-size: 11px; color: #64748b; margin-top: 8px;">Valid for 10 minutes</span>
              </div>

              <!-- Security Warning -->
              <div style="background-color: #1e293b; border-left: 3px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #cbd5e1;">
                  <strong style="color: #ffffff;">Security Alert:</strong> Never share this verification code with anyone, including ConvoDeck support staff. We will never ask for your code.
                </p>
              </div>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                If you did not make this request, you can safely ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #020617; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} ConvoDeck Inc. Official WhatsApp Multi-Agent Sales Platform.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: `${title}\n\n${greeting}\n\n${explanation}\n\nVerification Code: ${code}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
      html,
    });

    const previewUrl = isMock ? nodemailer.getTestMessageUrl(info) : false;

    // Output clean message to server console for testing convenience
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
    const { to, agentName, role, workspaceName, temporaryPassword, loginUrl } = params;

    const subject = `Welcome to ${workspaceName} on ConvoDeck - Your Agent Credentials`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #020617; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden;">
          <tr>
            <td style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #1e293b;">
              <span style="font-size: 18px; font-weight: 800; color: #ffffff;">ConvoDeck Team Workspace</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #ffffff;">Welcome aboard, ${agentName}! 👋</h1>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                You have been granted access to the <strong>${workspaceName}</strong> WhatsApp CRM as a <strong>${role.toUpperCase()}</strong>.
              </p>

              <div style="background-color: #020617; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;"><strong>Work Email:</strong> <span style="color: #ffffff;">${to}</span></p>
                <p style="margin: 0; font-size: 12px; color: #94a3b8;"><strong>Temporary Password:</strong> <code style="background-color: #1e293b; color: #34d399; padding: 2px 8px; border-radius: 6px; font-weight: bold;">${temporaryPassword}</code></p>
              </div>

              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${loginUrl}" style="background-color: #25D366; color: #020617; font-weight: 800; font-size: 14px; padding: 12px 28px; border-radius: 10px; text-decoration: none; display: inline-block;">
                  Sign In to Workspace &rarr;
                </a>
                <p style="margin: 14px 0 0 0; font-size: 11px; color: #94a3b8;">
                  📌 <strong>Daily Sign-In:</strong> Bookmark this portal in your browser (<code style="color: #38bdf8;">/agent/login</code>) for easy daily access.
                </p>
              </div>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                For security reasons, please update your password upon your first login.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: `Welcome to ${workspaceName}!\n\nEmail: ${to}\nTemporary Password: ${temporaryPassword}\nLogin: ${loginUrl}`,
      html,
    });

    const previewUrl = isMock ? nodemailer.getTestMessageUrl(info) : false;

    console.log("--------------------------------------------------");
    console.log(`[ConvoDeck Nodemailer] New Agent Welcome Email Sent to: ${to}`);
    if (previewUrl) console.log(`Preview: ${previewUrl}`);
    console.log("--------------------------------------------------");

    return { success: true, previewUrl };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to send welcome email";
    return { success: false, error: errorMsg };
  }
}
