import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private smtpTransporter: Transporter | null = null;
  private sendGridEnabled = false;
  private smtpEnabled = false;

  constructor() {
    this.initializeEmailProviders();
  }

  private initializeEmailProviders(): void {
    // Initialize SendGrid if API key is provided
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    if (sendGridApiKey) {
      sgMail.setApiKey(sendGridApiKey);
      this.sendGridEnabled = true;
      this.logger.log('SendGrid email provider initialized');
    }

    // Initialize SMTP if configuration is provided
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    if (smtpConfig.host && smtpConfig.auth.user && smtpConfig.auth.pass) {
      this.smtpTransporter = nodemailer.createTransport(smtpConfig);
      this.smtpEnabled = true;
      this.logger.log('SMTP email provider initialized');
    }

    if (!this.sendGridEnabled && !this.smtpEnabled) {
      this.logger.warn(
        'No email providers configured. Emails will be logged only.'
      );
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Try SendGrid first if available
      if (this.sendGridEnabled) {
        return await this.sendWithSendGrid(options);
      }

      // Fallback to SMTP if available
      if (this.smtpEnabled && this.smtpTransporter) {
        return await this.sendWithSMTP(options);
      }

      // Fallback to logging (development mode)
      this.logger.log(`[EMAIL PLACEHOLDER] Would send email to: ${options.to}`);
      this.logger.log(`[EMAIL PLACEHOLDER] Subject: ${options.subject}`);

      if (options.html) {
        this.logger.log(
          `[EMAIL PLACEHOLDER] HTML content: ${options.html.substring(0, 100)}...`
        );
      } else if (options.text) {
        this.logger.log(
          `[EMAIL PLACEHOLDER] Text content: ${options.text.substring(0, 100)}...`
        );
      }

      // Simulate email send delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  private async sendWithSendGrid(options: EmailOptions): Promise<boolean> {
    try {
      const msg = {
        to: options.to,
        from: process.env.FROM_EMAIL || 'noreply@muditor.com',
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      await sgMail.send(msg);
      this.logger.log(`Email sent successfully via SendGrid to: ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`SendGrid email failed:`, error);
      throw error;
    }
  }

  private async sendWithSMTP(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      await this.smtpTransporter!.sendMail(mailOptions);
      this.logger.log(`Email sent successfully via SMTP to: ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`SMTP email failed:`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
        <p>You requested a password reset for your Muditor account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p><strong>This link will expire in 15 minutes.</strong></p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          If you didn't request this password reset, you can safely ignore this email.
        </p>
      </div>
    `;

    const text = `
Password Reset Request

You requested a password reset for your Muditor account.

Reset your password by visiting this link:
${resetUrl}

This link will expire in 15 minutes.

If you didn't request this password reset, you can safely ignore this email.
    `;

    return this.sendEmail({
      to: email,
      subject: 'Muditor - Password Reset Request',
      html,
      text,
    });
  }

  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #333; text-align: center;">Welcome to Muditor!</h1>
        <p>Hi ${username},</p>
        <p>Welcome to Muditor, the modern MUD world editor and administration tool!</p>
        <p>You can now:</p>
        <ul>
          <li>Create and edit zones, rooms, mobs, and objects</li>
          <li>Use the visual zone editor for intuitive world building</li>
          <li>Write and test Lua scripts for interactive behaviors</li>
          <li>Collaborate with other builders in real-time</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <p>Happy world building!</p>
        <p>The Muditor Team</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Muditor!',
      html,
    });
  }
}
