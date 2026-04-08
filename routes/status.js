/**
 * routes/status.js
 * ──────────────────────────────────────────────────────────────────────────────
 * System status endpoint for monitoring email services and system health
 */

'use strict';

const express = require('express');
const router = express.Router();
const SibApiV3Sdk = require('sib-api-v3-sdk');
const nodemailer = require('nodemailer');

/**
 * GET /api/status
 * Returns comprehensive system status including:
 * - Email service status (Brevo or Gmail based on USE_GOOGLE_GMAIL)
 * - Database connection
 * - Environment configuration
 */
router.get('/', async (req, res, next) => {
  const status = {
    timestamp: new Date().toISOString(),
    environment: {
      node_env: process.env.NODE_ENV || 'development',
      use_gmail: process.env.USE_GOOGLE_GMAIL === 'true',
    },
    services: {
      database: { status: 'unknown', message: '' },
      email: { status: 'unknown', provider: '', message: '' },
    },
  };

  // Check database connection
  try {
    const pool = require('../db/db');
    await pool.execute('SELECT 1');
    status.services.database = {
      status: 'operational',
      message: 'Connected to MySQL',
      host: process.env.DB_HOST ? `${process.env.DB_HOST}:${process.env.DB_PORT}` : 'not configured',
    };
  } catch (err) {
    status.services.database = {
      status: 'error',
      message: err.message,
    };
  }

  // Check email service
  const useGmail = process.env.USE_GOOGLE_GMAIL === 'true';

  if (useGmail) {
    // Test Gmail SMTP connection
    const isOtp = req.query.type === 'otp';
    const user = isOtp ? process.env.GMAIL_USER_OTP : process.env.GMAIL_USER;
    const pass = isOtp ? process.env.GMAIL_APP_PASSWORD_OTP : process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass || pass === 'your_gmail_app_password_here') {
      status.services.email = {
        status: 'misconfigured',
        provider: 'Gmail',
        message: 'Gmail credentials not configured',
        config: {
          primary: !!process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD !== 'your_gmail_app_password_here',
          otp: !!process.env.GMAIL_USER_OTP && process.env.GMAIL_APP_PASSWORD_OTP !== 'your_gmail_app_password_here',
        },
      };
    } else {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user, pass },
      });

      try {
        await transporter.verify();
        status.services.email = {
          status: 'operational',
          provider: 'Gmail',
          message: 'SMTP connection successful',
          from: user,
        };
      } catch (err) {
        status.services.email = {
          status: 'error',
          provider: 'Gmail',
          message: err.message,
        };
      }
    }
  } else {
    // Check Brevo API
    const isOtp = req.query.type === 'otp';
    const apiKey = isOtp ? process.env.BREVO_API_KEY_OTP : process.env.BREVO_API_KEY;
    const fromEmail = isOtp ? process.env.BREVO_FROM_EMAIL_OTP : process.env.BREVO_FROM_EMAIL;

    if (!apiKey || apiKey.includes('xkeysib') === false) {
      status.services.email = {
        status: 'misconfigured',
        provider: 'Brevo',
        message: 'Brevo API key not configured',
      };
    } else {
      try {
        const client = new SibApiV3Sdk.ApiClient();
        client.authentications['api-key'].apiKey = apiKey;
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi(client);

        // Get sender info (includes credit/usage info if available)
        const sendersApi = new SibApiV3Sdk.SendersApi(client);
        const sendersData = await sendersApi.getSenders();

        let creditInfo = null;
        try {
          const accountApi = new SibApiV3Sdk.AccountApi(client);
          const accountData = await accountApi.getAccount();
          creditInfo = {
            plan: accountData.plan,
            credits: accountData.credits,
          };
        } catch (e) {
          // Account API might not be available for all plans
        }

        status.services.email = {
          status: 'operational',
          provider: 'Brevo',
          message: 'API connection successful',
          from: fromEmail,
          senders: sendersData.senders || [],
          credits: creditInfo,
        };
      } catch (err) {
        status.services.email = {
          status: 'error',
          provider: 'Brevo',
          message: err.message,
        };
      }
    }
  }

  res.json(status);
});

/**
 * GET /api/status/email
 * Quick email service status check
 */
router.get('/email', async (req, res, next) => {
  const useGmail = process.env.USE_GOOGLE_GMAIL === 'true';
  const result = {
    timestamp: new Date().toISOString(),
    provider: useGmail ? 'Gmail' : 'Brevo',
    status: 'unknown',
  };

  if (useGmail) {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass || pass === 'your_gmail_app_password_here') {
      result.status = 'misconfigured';
      result.message = 'Gmail credentials not configured';
    } else {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user, pass },
      });

      try {
        await transporter.verify();
        result.status = 'operational';
        result.message = 'SMTP connection successful';
      } catch (err) {
        result.status = 'error';
        result.message = err.message;
      }
    }
  } else {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey || !apiKey.includes('xkeysib')) {
      result.status = 'misconfigured';
      result.message = 'Brevo API key not configured';
    } else {
      try {
        const client = new SibApiV3Sdk.ApiClient();
        client.authentications['api-key'].apiKey = apiKey;
        const sendersApi = new SibApiV3Sdk.SendersApi(client);
        await sendersApi.getSenders();

        result.status = 'operational';
        result.message = 'API connection successful';

        // Try to get credit info
        try {
          const accountApi = new SibApiV3Sdk.AccountApi(client);
          const accountData = await accountApi.getAccount();
          result.credits = accountData.credits;
        } catch (e) {
          // Ignore if account API not available
        }
      } catch (err) {
        result.status = 'error';
        result.message = err.message;
      }
    }
  }

  res.json(result);
});

/**
 * GET /api/status/db
 * Quick database status check
 */
router.get('/db', async (req, res, next) => {
  try {
    const pool = require('../db/db');
    const start = Date.now();
    await pool.execute('SELECT 1');
    const latency = Date.now() - start;

    res.json({
      status: 'operational',
      message: 'Connected to MySQL',
      latency_ms: latency,
      host: `${process.env.DB_HOST || 'unknown'}:${process.env.DB_PORT || '3306'}`,
    });
  } catch (err) {
    res.json({
      status: 'error',
      message: err.message,
    });
  }
});

module.exports = router;
