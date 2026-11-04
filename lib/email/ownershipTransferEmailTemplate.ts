import { EMAIL_THEME } from "./emailTheme";

export interface OwnershipTransferEmailTemplateProps {
  workspaceName: string;
  senderName: string;
  actionUrl: string;
  hasExistingAccount: boolean;
  recipientEmail: string;
}

/**
 * Single-responsibility template renderer for workspace ownership transfer emails.
 * Adheres to ConvoDeck's soft-grey tactile Neumorphic design with vibrant tangerine button.
 */
export function renderOwnershipTransferEmailHtml({
  workspaceName,
  senderName,
  actionUrl,
  hasExistingAccount,
  recipientEmail,
}: OwnershipTransferEmailTemplateProps): { subject: string; html: string } {
  const subject = hasExistingAccount
    ? `You are now the Primary Owner of ${workspaceName} on ConvoDeck`
    : `Set your password to claim ownership of ${workspaceName} on ConvoDeck`;

  const heading = hasExistingAccount
    ? "Workspace Ownership Transferred to You"
    : "Claim Your Workspace Ownership";

  const description = hasExistingAccount
    ? `<strong>${senderName}</strong> has transferred primary ownership and administrative control of <strong>${workspaceName}</strong> to your account (${recipientEmail}).`
    : `<strong>${senderName}</strong> has invited you as the primary Owner of <strong>${workspaceName}</strong> on ConvoDeck. Set your password to instantly activate your owner account.`;

  const buttonText = hasExistingAccount
    ? "Log In to Your Workspace"
    : "Set Password & Access Workspace";

  const hintText = hasExistingAccount
    ? "Log in with your existing ConvoDeck credentials to start managing this workspace."
    : "No complicated sign-up forms required. Simply click above to choose your secure password.";

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
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 520px; background-color: ${EMAIL_THEME.cardBg}; border: 1px solid ${EMAIL_THEME.borderCard}; border-radius: 28px; overflow: hidden; ${EMAIL_THEME.cardShadow}">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: left; border-bottom: 1px solid ${EMAIL_THEME.borderLight};">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width: 44px; height: 44px; background-color: ${EMAIL_THEME.white}; border-radius: 14px; text-align: center; vertical-align: middle; ${EMAIL_THEME.iconShadow}">
                    <span style="font-size: 20px; font-weight: 900; color: ${EMAIL_THEME.accentOrange};">C</span>
                  </td>
                  <td style="padding-left: 14px;">
                    <span style="font-size: 18px; font-weight: 800; color: ${EMAIL_THEME.textHeading}; letter-spacing: -0.5px; display: block;">ConvoDeck</span>
                    <span style="font-size: 11px; font-weight: 700; color: ${EMAIL_THEME.textMuted}; text-transform: uppercase; letter-spacing: 0.5px;">WhatsApp CRM</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px; text-align: left;">
              <h1 style="font-size: 20px; font-weight: 800; color: ${EMAIL_THEME.textHeading}; margin: 0 0 12px 0; letter-spacing: -0.3px;">
                ${heading}
              </h1>

              <p style="font-size: 14px; line-height: 1.6; color: ${EMAIL_THEME.textBody}; margin: 0 0 24px 0;">
                ${description}
              </p>

              <!-- Workspace Badge Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td style="background-color: ${EMAIL_THEME.insetBg}; border: 1px solid ${EMAIL_THEME.borderLight}; border-radius: 18px; padding: 18px 20px; ${EMAIL_THEME.insetShadow}">
                    <table role="presentation" width="100%">
                      <tr>
                        <td>
                          <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${EMAIL_THEME.textMuted}; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Transferred Workspace</span>
                          <span style="font-size: 16px; font-weight: 800; color: ${EMAIL_THEME.textHeading}; display: block;">${workspaceName}</span>
                          <span style="font-size: 12px; font-weight: 600; color: ${EMAIL_THEME.accentOrange}; margin-top: 4px; display: inline-block;">Role: Primary Owner &amp; Administrator</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${actionUrl}" style="display: inline-block; width: 100%; box-sizing: border-box; text-align: center; background: linear-gradient(135deg, ${EMAIL_THEME.accentOrange} 0%, ${EMAIL_THEME.accentOrangeDark} 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 16px; ${EMAIL_THEME.buttonShadow}">
                      ${buttonText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; line-height: 1.5; color: ${EMAIL_THEME.textMuted}; margin: 0; text-align: center;">
                ${hintText}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: rgba(255, 255, 255, 0.4); border-top: 1px solid ${EMAIL_THEME.borderLight}; text-align: center;">
              <p style="font-size: 11px; color: ${EMAIL_THEME.textSubtle}; margin: 0;">
                If you did not expect to receive ownership of this workspace, please contact your administrator or ignore this email.
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

  return { subject, html };
}

