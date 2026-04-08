const SibApiV3Sdk = require('sib-api-v3-sdk');
const nodemailer = require('nodemailer');

class Mail {
  constructor(type = 'primary') {
    const isOtp = type === 'otp';
    const useGmail = process.env.USE_GOOGLE_GMAIL === 'true';

    if (useGmail) {
      // Use Gmail SMTP via nodemailer
      // Using port 465 with SSL (Render blocks port 587)
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465
        auth: {
          user: isOtp
            ? process.env.GMAIL_USER_OTP
            : process.env.GMAIL_USER,
          pass: isOtp
            ? process.env.GMAIL_APP_PASSWORD_OTP
            : process.env.GMAIL_APP_PASSWORD,
        },
      });

      this.from = {
        name: isOtp
          ? (process.env.GMAIL_FROM_NAME_OTP || 'Notre Dame Science Club')
          : (process.env.GMAIL_FROM_NAME || 'Notre Dame Science Club'),
        email: isOtp
          ? (process.env.GMAIL_USER_OTP || `noreply@otp.ndscbd.net`)
          : (process.env.GMAIL_USER || `noreply@mail.ndscbd.net`),
      };

      this.isGmail = true;
    } else {
      // Use Brevo API
      const client = new SibApiV3Sdk.ApiClient();
      client.authentications['api-key'].apiKey = isOtp
        ? process.env.BREVO_API_KEY_OTP
        : process.env.BREVO_API_KEY;

      this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi(client);
      this.from = {
        name: isOtp
          ? (process.env.BREVO_FROM_NAME_OTP || 'Notre Dame Science Club')
          : (process.env.BREVO_FROM_NAME || 'Notre Dame Science Club'),
        email: isOtp
          ? (process.env.BREVO_FROM_EMAIL_OTP || `noreply@otp.ndscbd.net`)
          : (process.env.BREVO_FROM_EMAIL || `noreply@mail.ndscbd.net`),
      };

      this.isGmail = false;
    }
  }

  /**
   * Send a transactional email.
   * @param {Object} opts
   * @param {string} opts.to
   * @param {string} [opts.toName]
   * @param {string} opts.subject
   * @param {string} opts.body   - HTML
   */
  async send({ to, toName, subject, body }) {
    if (this.isGmail) {
      // Send via Gmail SMTP
      try {
        const info = await this.transporter.sendMail({
          from: `"${this.from.name}" <${this.from.email}>`,
          to: to,
          subject: subject,
          html: body,
        });
        console.log('Email sent via Gmail, messageId:', info.messageId);
        return { messageId: info.messageId };
      } catch (err) {
        console.error('[Gmail SMTP Error]', {
          code: err.code,
          command: err.command,
          message: err.message,
          responseCode: err.responseCode,
        });
        throw err;
      }
    } else {
      // Send via Brevo API
      try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = this.from;
        sendSmtpEmail.to = [{ email: to, name: toName || to }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = body;

        const data = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent via Brevo, messageId:', data.messageId);
        return data;
      } catch (err) {
        console.error('[Brevo API Error]', {
          status: err.code,
          message: err.message,
          response: err.response?.body,
        });
        throw err;
      }
    }
  }
}

module.exports = Mail;
