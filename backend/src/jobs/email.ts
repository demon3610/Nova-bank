import { config } from '@/config';
import { logger } from '@/config/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(options: EmailOptions): Promise<void> {
  const nodemailer = await import('nodemailer');

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  const mailOptions = {
    from: '"NovaBank" <noreply@novabank.com>',
    to: options.to,
    subject: options.subject,
    text: options.text || '',
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent', { messageId: info.messageId, to: options.to, subject: options.subject });
  } catch (error) {
    logger.error('Failed to send email', { error, to: options.to, subject: options.subject });
    throw error;
  }
}

export async function sendWelcomeEmail(to: string, firstName: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'Welcome to NovaBank',
    html: `
      <h1>Welcome to NovaBank, ${firstName}!</h1>
      <p>Thank you for choosing NovaBank for your banking needs.</p>
      <p>Your account has been created successfully. You can now log in and start using our services.</p>
      <p>If you have any questions, please contact our support team.</p>
      <br>
      <p>Best regards,</p>
      <p>The NovaBank Team</p>
    `,
    text: `Welcome to NovaBank, ${firstName}! Thank you for choosing NovaBank. Your account has been created successfully.`,
  });
}

export async function sendOtpEmail(to: string, otp: string, purpose: string): Promise<void> {
  await sendEmail({
    to,
    subject: `NovaBank - ${purpose}`,
    html: `
      <h1>NovaBank OTP Verification</h1>
      <p>Your OTP for ${purpose} is: <strong>${otp}</strong></p>
      <p>This OTP is valid for ${config.otp.expiryMinutes} minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
    text: `Your OTP for ${purpose} is: ${otp}. Valid for ${config.otp.expiryMinutes} minutes.`,
  });
}

export async function sendTransactionAlert(to: string, type: string, amount: number, description: string): Promise<void> {
  await sendEmail({
    to,
    subject: `NovaBank - ${type} Alert`,
    html: `
      <h1>Transaction Alert</h1>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Amount:</strong> ₹${amount.toFixed(2)}</p>
      <p><strong>Description:</strong> ${description}</p>
      <p>If you did not perform this transaction, please contact support immediately.</p>
    `,
    text: `Transaction Alert - Type: ${type}, Amount: ₹${amount.toFixed(2)}, Description: ${description}`,
  });
}

export async function sendSecurityAlert(to: string, alertType: string, details: string): Promise<void> {
  await sendEmail({
    to,
    subject: `NovaBank - Security Alert: ${alertType}`,
    html: `
      <h1>Security Alert</h1>
      <p><strong>Type:</strong> ${alertType}</p>
      <p><strong>Details:</strong> ${details}</p>
      <p>If this was not you, please secure your account immediately.</p>
    `,
    text: `Security Alert - Type: ${alertType}, Details: ${details}`,
  });
}

export default { sendWelcomeEmail, sendOtpEmail, sendTransactionAlert, sendSecurityAlert };
