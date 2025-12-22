const resend = require('resend').Resend(process.env.RESEND_API_KEY);

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  try {
    const data = await resend.emails.send({
      from: 'Lyceum <noreply@lyceum.blog>',  // Verify domain in Resend dashboard
      to: [email],
      subject: 'Lyceum - Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Georgia, serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #f5f5dc; border: 3px solid #1a1a2e;">
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #1a1a2e; border-bottom: 3px solid #1a1a2e; padding-bottom: 10px; margin: 0 0 20px 0; font-size: 28px;">
                        🏛️ Password Reset Request
                      </h2>
                      <p style="color: #1a1a2e; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        You requested to reset your password for your Lyceum account.
                      </p>
                      <p style="color: #1a1a2e; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Click the button below to reset your password:
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${resetUrl}" 
                               style="display: inline-block; background-color: #1a1a2e; color: #f5f5dc; 
                                      padding: 15px 30px; text-decoration: none; font-size: 16px; 
                                      font-weight: bold; border-radius: 3px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #1a1a2e; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                        <strong>⏰ This link will expire in 1 hour.</strong>
                      </p>
                      <p style="color: #1a1a2e; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        If the button doesn't work, copy and paste this link into your browser:
                      </p>
                      <p style="color: #4a4a4a; font-size: 12px; word-break: break-all; margin: 10px 0 20px 0;">
                        ${resetUrl}
                      </p>
                      <hr style="border: none; border-top: 2px solid #1a1a2e; margin: 30px 0;">
                      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                        If you didn't request this password reset, please ignore this email. 
                        Your password will remain unchanged.
                      </p>
                      <p style="color: #999; font-size: 12px; margin: 20px 0 0 0; font-style: italic;">
                        Lyceum - Philosophy Discussion Platform
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Password Reset Request

You requested to reset your password for your Lyceum account.

Click this link to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.

Lyceum - Philosophy Discussion Platform
      `
    });

    console.log('✅ Password reset email sent to:', email);
    console.log('📧 Resend Message ID:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Resend error:', error);
    throw new Error('Failed to send reset email');
  }
};

module.exports = { sendPasswordResetEmail };
