const { Resend } = require('resend');  // ✅ CORRECT IMPORT

// Initialize Resend with API key from environment variable
// Add RESEND_API_KEY to your .env file
const resend = new Resend(process.env.RESEND_API_KEY);  // ✅ WORKS

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  
  console.log('📧 Sending password reset email via Resend...');
  console.log('   To:', email);
  console.log('   Reset URL:', resetUrl);
  
  try {
    const data = await resend.emails.send({
      from: 'Lyceum <theinneraxiom@gmail.com>',
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
    console.log('📧 Resend Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Resend error details:');
    console.error('   Error message:', error.message);
    console.error('   Error type:', error.constructor.name);
    if (error.response) {
      console.error('   Resend API response:', JSON.stringify(error.response, null, 2));
    }
    console.error('   Full error:', error);
    throw new Error(`Failed to send reset email: ${error.message}`);
  }
};

// Send comment notification email (when someone replies to your comment or comments on your post/essay)
const sendCommentNotificationEmail = async (email, commenterUsername, contentTitle, commentContent, isReply, parentAuthorUsername, contentUrl) => {
  try {
    const subject = isReply 
      ? `Lyceum - ${commenterUsername} replied to your comment`
      : `Lyceum - ${commenterUsername} commented on your ${contentTitle}`;
    
    const html = `
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
                      🏛️ New ${isReply ? 'Reply' : 'Comment'}
                    </h2>
                    <p style="color: #1a1a2e; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      ${isReply 
                        ? `<strong>${commenterUsername}</strong> replied to your comment on "${contentTitle}"`
                        : `<strong>${commenterUsername}</strong> commented on your "${contentTitle}"`
                      }
                    </p>
                    ${isReply && parentAuthorUsername ? (
                      `<p style="color: #1a1a2e; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0; font-style: italic;">
                        Replying to: ${parentAuthorUsername}
                      </p>`
                    ) : ''}
                    <div style="background-color: #ffffff; border-left: 4px solid #1a1a2e; padding: 20px; margin: 20px 0;">
                      <p style="color: #1a1a2e; font-size: 15px; line-height: 1.8; margin: 0;">
                        "${commentContent}"
                      </p>
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${contentUrl}" 
                             style="display: inline-block; background-color: #1a1a2e; color: #f5f5dc; 
                                    padding: 15px 30px; text-decoration: none; font-size: 16px; 
                                    font-weight: bold; border-radius: 3px;">
                            View ${isReply ? 'Reply' : 'Comment'}
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                      You're receiving this email because someone engaged with your content on Lyceum.
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
    `;

    const text = `
${isReply ? 'New Reply' : 'New Comment'}

${isReply 
  ? `${commenterUsername} replied to your comment on "${contentTitle}"`
  : `${commenterUsername} commented on your "${contentTitle}"`
}

Comment:
"${commentContent}"

View ${isReply ? 'reply' : 'comment'}: ${contentUrl}

Lyceum - Philosophy Discussion Platform
    `;

    const data = await resend.emails.send({
      from: 'Lyceum <theinneraxiom@gmail.com>',
      to: [email],
      subject: subject,
      html: html,
      text: text
    });

    console.log('✅ Comment notification email sent to:', email);
    return data;
  } catch (error) {
    console.error('❌ Resend error sending comment notification:', error);
    throw new Error('Failed to send comment notification email');
  }
};

module.exports = { sendPasswordResetEmail, sendCommentNotificationEmail };
