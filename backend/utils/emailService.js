let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  return transporter;
}

const FROM = `"${process.env.FROM_NAME || 'HR Platform'}" <${process.env.FROM_EMAIL || 'noreply@hrplatform.com'}>`;

async function sendMail(to, subject, html) {
  const t = getTransporter();
  if (!t) {
    console.log(`[Email stub] To: ${to} | Subject: ${subject}`);
    return { messageId: 'stub', mock: true };
  }
  return t.sendMail({ from: FROM, to, subject, html });
}

const emailService = {
  async sendWelcomeEmail(to, name) {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Welcome to HR Platform, ${name}!</h2>
        <p>Your account has been created successfully. Start building your professional CV today.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/cv-builder"
           style="background:#4F46E5;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
          Build Your CV
        </a>
        <p style="color:#666;margin-top:24px">If you did not create this account, please ignore this email.</p>
      </div>`;
    return sendMail(to, 'Welcome to HR Platform!', html);
  },

  async sendPasswordReset(to, token) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Reset Your Password</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}"
           style="background:#4F46E5;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
          Reset Password
        </a>
        <p style="color:#666;margin-top:24px">If you did not request a password reset, please ignore this email.</p>
      </div>`;
    return sendMail(to, 'Reset Your HR Platform Password', html);
  },

  async sendSubscriptionConfirmation(to, plan) {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Subscription Confirmed!</h2>
        <p>Your <strong>${plan}</strong> subscription is now active. Enjoy all premium features!</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/cv-builder"
           style="background:#4F46E5;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
          Get Started
        </a>
      </div>`;
    return sendMail(to, `Your ${plan} Subscription is Active`, html);
  },

  async sendMessageNotification(to, senderName, preview) {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>New Message from ${senderName}</h2>
        <p style="background:#f5f5f5;padding:12px;border-radius:6px;color:#333">${preview}</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/messages"
           style="background:#4F46E5;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
          View Message
        </a>
      </div>`;
    return sendMail(to, `New message from ${senderName}`, html);
  }
};

module.exports = emailService;
