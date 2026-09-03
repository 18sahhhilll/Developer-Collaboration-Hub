/**
 * Email service for sending transactional emails.
 * Uses nodemailer with SMTP if configured.
 * Falls back to console output (development mode) when SMTP is not set up.
 */
import nodemailer from 'nodemailer';

const isDev = !process.env.SMTP_HOST || !process.env.SMTP_USER;

const getTransporter = () => {
  if (isDev) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const FROM = process.env.SMTP_FROM || '"DevCollab" <no-reply@devcollab.dev>';

/**
 * Send email verification link.
 * In dev mode, prints the link to console instead.
 */
export const sendVerificationEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const link = `${clientUrl}/verify-email?token=${token}`;

  if (isDev) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 [DEV] Email Verification Link:');
    console.log(`   To: ${email}`);
    console.log(`   Link: ${link}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Verify your DevCollab email',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111;">Verify your email</h2>
        <p>Click the button below to verify your email address and activate your DevCollab account.</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
          Verify Email
        </a>
        <p style="color:#666;font-size:14px;">This link expires in 24 hours. If you didn't create a DevCollab account, you can safely ignore this email.</p>
      </div>
    `,
  });
};

/**
 * Send password reset link.
 * In dev mode, prints the link to console instead.
 */
export const sendPasswordResetEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const link = `${clientUrl}/reset-password?token=${token}`;

  if (isDev) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 [DEV] Password Reset Link:');
    console.log(`   To: ${email}`);
    console.log(`   Link: ${link}`);
    console.log('   Expires: 15 minutes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Reset your DevCollab password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111;">Reset your password</h2>
        <p>Click the button below to reset your DevCollab password. This link expires in <strong>15 minutes</strong>.</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#666;font-size:14px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
};

export default { sendVerificationEmail, sendPasswordResetEmail };
