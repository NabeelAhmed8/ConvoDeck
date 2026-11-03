import { EMAIL_THEME } from "./emailTheme";

export interface VerificationEmailTemplateProps {
  code: string;
  type: "signup" | "login" | "reset_password" | "change_email";
  recipientName?: string;
}

export function renderVerificationEmailHtml({
  code,
  type,
  recipientName,
}: VerificationEmailTemplateProps): { subject: string; title: string; html: string } {
  const isSignup = type === "signup";
  const isReset = type === "reset_password";
  const isChangeEmail = type === "change_email";

  const subject = isReset
    ? `${code} is your ConvoDeck password reset code`
    : isSignup
    ? `${code} is your ConvoDeck verification code`
    : isChangeEmail
    ? `${code} is your ConvoDeck email change verification code`
    : `${code} is your ConvoDeck sign-in code`;

  const title = isReset
    ? "Reset your password"
    : isSignup
    ? "Verify your new account"
    : isChangeEmail
    ? "Verify email address change"
    : "Verify your sign-in attempt";

  const greeting = recipientName ? `Hello ${recipientName},` : "Hello,";

  const explanation = isReset
    ? "We received a request to reset your ConvoDeck password. Enter this 6-digit verification code to choose a new password:"
    : isSignup
    ? "Thank you for creating your ConvoDeck workspace. Enter this 6-digit verification code to complete registration:"
    : isChangeEmail
    ? "We received a request to change the primary email address for your ConvoDeck account. Enter this 6-digit verification code to confirm your identity:"
    : "We received a sign-in request for your ConvoDeck workspace. Enter this 6-digit code to securely log in:";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${EMAIL_THEME.bodyBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${EMAIL_THEME.textBody};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${EMAIL_THEME.bodyBg}; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Neumorphic Card -->
        <table role="presentation" width="100%" style="max-width: 520px; background-color: ${EMAIL_THEME.cardBg}; border: 1px solid ${EMAIL_THEME.borderCard}; border-radius: 28px; overflow: hidden; ${EMAIL_THEME.cardShadow}">
          <!-- Header Branding -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: left; border-bottom: 1px solid ${EMAIL_THEME.borderLight};">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Tactile Squircle Icon -->
                  <td style="width: 42px; height: 42px; background-color: ${EMAIL_THEME.white}; border-radius: 14px; text-align: center; vertical-align: middle; color: ${EMAIL_THEME.textHeading}; font-weight: 900; font-size: 20px; ${EMAIL_THEME.iconShadow}">
                    C
                  </td>
                  <td style="padding-left: 14px;">
                    <div style="font-size: 18px; font-weight: 900; color: ${EMAIL_THEME.textHeading}; line-height: 1.2; letter-spacing: -0.3px;">ConvoDeck</div>
                    <div style="font-size: 10px; font-weight: 700; color: ${EMAIL_THEME.accentOrange}; letter-spacing: 0.8px; text-transform: uppercase; margin-top: 2px;">WhatsApp Sales CRM</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 900; color: ${EMAIL_THEME.textHeading}; letter-spacing: -0.5px;">${title}</h1>
              <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: ${EMAIL_THEME.textBody};">${greeting}</p>
              <p style="margin: 0 0 26px 0; font-size: 13.5px; line-height: 1.6; color: ${EMAIL_THEME.textMuted};">${explanation}</p>

              <!-- Neumorphic Inset Code Capsule -->
              <div style="background-color: ${EMAIL_THEME.insetBg}; border: 1px solid #d5dfea; border-radius: 20px; padding: 24px; text-align: center; margin: 0 0 28px 0; ${EMAIL_THEME.insetShadow}">
                <span style="display: block; font-size: 11px; font-weight: 800; color: ${EMAIL_THEME.accentOrangeDark}; text-transform: uppercase; letter-spacing: 1.6px; margin-bottom: 8px;">
                  Your 6-Digit Verification Code
                </span>
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 40px; font-weight: 900; letter-spacing: 12px; color: ${EMAIL_THEME.accentOrange}; line-height: 1.2; display: inline-block;">
                  ${code}
                </span>
                <span style="display: block; font-size: 11.5px; color: ${EMAIL_THEME.textSubtle}; margin-top: 10px; font-weight: 500;">
                  ⏱ Valid for 10 minutes
                </span>
              </div>

              <!-- Neumorphic Security Advisory -->
              <div style="background-color: ${EMAIL_THEME.white}; border-left: 4px solid ${EMAIL_THEME.accentOrange}; padding: 14px 18px; border-radius: 12px; margin-bottom: 24px; ${EMAIL_THEME.iconShadow}">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: ${EMAIL_THEME.textBody};">
                  <strong style="color: ${EMAIL_THEME.textHeading};">Security Alert:</strong> Never share this verification code with anyone. ConvoDeck staff will never ask for your code.
                </p>
              </div>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: ${EMAIL_THEME.textSubtle};">
                If you did not request this verification code, you can safely ignore this email. Your workspace remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 22px 32px; background-color: ${EMAIL_THEME.insetBg}; border-top: 1px solid ${EMAIL_THEME.borderLight}; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: ${EMAIL_THEME.textMuted}; line-height: 1.5;">
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

  return { subject, title, html };
}

