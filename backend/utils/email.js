const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASSWORD // your app password
  }
});

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Lyceum - Password Reset Request',
    html: `
      <div style="font-family: serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e; border-bottom: 3px solid #1a1a2e; padding-bottom: 10px;">
          Password Reset Request
        </h2>
        <p>You requested to reset your password for your Lyceum account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; background: #1a1a2e; color: #f5f5dc; 
                  padding: 12px 24px; text-decoration: none; margin: 20px 0;">
          Reset Password
        </a>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: 1px solid #1a1a2e; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Lyceum - Philosophy Discussion Platform
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };
