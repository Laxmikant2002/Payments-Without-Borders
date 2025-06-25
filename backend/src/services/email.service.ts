import { createTransport, SendMailOptions } from 'nodemailer';

/**
 * Email service configuration
 */
const transporter = createTransport({
  // Replace with actual email service configuration
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password',
  },
});

/**
 * Email options interface
 */
export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions: SendMailOptions = {
      from: process.env.SMTP_FROM || '"PayHack" <noreply@payhack.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${options.to}`);
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${(error as Error).message}`);
  }
};
