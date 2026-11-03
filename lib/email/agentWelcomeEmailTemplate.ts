import { EMAIL_THEME } from "./emailTheme";

export interface AgentWelcomeEmailTemplateProps {
  to: string;
  agentName: string;
  role: string;
  workspaceName: string;
  temporaryPassword: string;
  loginUrl: string;
}

export function renderAgentWelcomeEmailHtml({
  to,
  agentName,
  role,
  workspaceName,
  temporaryPassword,
  loginUrl,
}: AgentWelcomeEmailTemplateProps): { subject: string; html: string } {
  const subject = `Welcome to ${workspaceName} on ConvoDeck - Your Agent Credentials`;

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
                  <td style="width: 42px; height: 42px; background-color: ${EMAIL_THEME.white}; border-radius: 14px; text-align: center; vertical-align: middle; color: ${EMAIL_THEME.textHeading}; font-weight: 900; font-size: 20px; ${EMAIL_THEME.iconShadow}">
                    C
                  </td>
                  <td style="padding-left: 14px;">
                    <div style="font-size: 18px; font-weight: 900; color: ${EMAIL_THEME.textHeading}; line-height: 1.2;">ConvoDeck Team</div>
                    <div style="font-size: 10px; font-weight: 700; color: ${EMAIL_THEME.accentOrange}; letter-spacing: 0.8px; text-transform: uppercase; margin-top: 2px;">Shared Multi-Agent Inbox</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 900; color: ${EMAIL_THEME.textHeading};">
                Welcome aboard, ${agentName}! 👋
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: ${EMAIL_THEME.textBody};">
                You have been authorized as a <strong>${role.toUpperCase()}</strong> on the <strong>${workspaceName}</strong> WhatsApp CRM workspace.
              </p>

              <!-- Neumorphic Inset Credentials Capsule -->
              <div style="background-color: ${EMAIL_THEME.insetBg}; border: 1px solid #d5dfea; border-radius: 18px; padding: 20px; margin-bottom: 24px; ${EMAIL_THEME.insetShadow}">
                <p style="margin: 0 0 10px 0; font-size: 13px; color: ${EMAIL_THEME.textMuted};">
                  <strong style="color: ${EMAIL_THEME.textHeading};">Work Email:</strong> <span style="color: ${EMAIL_THEME.textHeading}; font-family: monospace;">${to}</span>
                </p>
                <p style="margin: 0; font-size: 13px; color: ${EMAIL_THEME.textMuted};">
                  <strong style="color: ${EMAIL_THEME.textHeading};">Temporary Password:</strong> <code style="background-color: ${EMAIL_THEME.white}; color: ${EMAIL_THEME.accentOrangeDark}; padding: 4px 10px; border-radius: 8px; font-weight: 800; font-family: monospace; font-size: 14px; border: 1px solid ${EMAIL_THEME.borderLight};">${temporaryPassword}</code>
                </p>
              </div>

              <!-- Neumorphic CTA Action -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${loginUrl}" style="background: linear-gradient(135deg, ${EMAIL_THEME.accentOrange} 0%, ${EMAIL_THEME.accentOrangeDark} 100%); color: #ffffff; font-weight: 800; font-size: 13px; padding: 13px 32px; border-radius: 9999px; text-decoration: none; display: inline-block; ${EMAIL_THEME.buttonShadow}">
                  Sign In to Agent Workspace &rarr;
                </a>
                <p style="margin: 14px 0 0 0; font-size: 11.5px; color: ${EMAIL_THEME.textMuted};">
                  📌 <strong>Daily Sign-In:</strong> Bookmark <code style="color: ${EMAIL_THEME.accentOrangeDark}; font-weight: 600;">/agent/login</code> for quick daily team access.
                </p>
              </div>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: ${EMAIL_THEME.textSubtle};">
                For security reasons, please change your temporary password after logging in for the first time.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 22px 32px; background-color: ${EMAIL_THEME.insetBg}; border-top: 1px solid ${EMAIL_THEME.borderLight}; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: ${EMAIL_THEME.textMuted};">
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

  return { subject, html };
}

