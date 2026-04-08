# NDSC Annual Fest 2025 & 35th GKC — Backend

Express.js backend with MySQL (Hostinger) for the Notre Dame Annual Science Festival website.

---

## Project Structure

```
Annual_Fest_V2/
├── app.js                          # Express entry point
├── config/
│   └── cookies.js                  # Cookie name + options constants
├── controllers/
│   ├── authController.js           # Register, login, logout, profile
│   ├── dashboardController.js      # Dashboard data, segment registrations
│   └── segmentController.js        # Segment-specific handlers
├── db/
│   ├── db.js                       # mysql2 connection pool (Hostinger)
│   ├── queries.js                  # Common queries (users, events, OTP)
│   ├── segmentQueries.js           # Segment registration queries
│   └── segments/
│       ├── conundrumParadox.js     # Conundrum Paradox logic
│       ├── lineFollower.js         # Line Following Robot logic
│       ├── projectExpo.js          # Project Expo logic
│       ├── roboSoccer.js           # Robo Soccer logic
│       ├── scrapbook.js            # Scrapbook logic
│       ├── teamQuiz.js             # Team Quiz logic
│       └── wallMagazine.js         # Wall Magazine logic
├── middleware/
│   ├── auth.js                     # requireAuth / optionalAuth
│   ├── errorHandler.js             # Global error handler
│   └── rateLimiter.js              # Rate limiting presets
├── routes/
│   ├── auth.js                     # /api/auth/*
│   ├── dashboard.js                # /api/dashboard/*
│   ├── segments.js                 # /api/segments/*
│   └── submissions.js              # /api/submissions/*
├── utils/
│   ├── jwt.js                      # signToken / verifyToken
│   ├── response.js                 # success() / error() helpers
│   └── mail.js                     # Email sending (Brevo SMTP)
├── public/                         # Static frontend files
│   ├── index.html
│   ├── register.html
│   ├── developers.html
│   ├── dashboard.html
│   ├── segments.html
│   ├── about.html
│   ├── contact.html
│   ├── css/
│   ├── js/
│   └── assets/
├── tables.sql                      # Main database schema
├── events.sql                      # Events seed data
├── segment_tables.sql              # Segment registration tables
├── submission_tables.sql           # Submission tables
└── .env                            # Environment variables (not committed)
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file with the following:

```env
# Server
PORT=3000
NODE_ENV=development

# Database (Hostinger MySQL)
DB_HOST=srv2184.hstgr.io
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database

# JWT
JWT_SECRET=your_jwt_secret

# Cookies
COOKIE_SECRET=your_cookie_secret

# Email (Brevo SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_username
SMTP_PASS=your_brevo_password
FROM_EMAIL=noreply@asf25.ndscbd.net
FROM_NAME=NDSC Fest

# OTP Email (separate Brevo account)
OTP_SMTP_HOST=smtp-relay.brevo.com
OTP_SMTP_PORT=587
OTP_SMTP_USER=your_otp_brevo_username
OTP_SMTP_PASS=your_otp_brevo_password
OTP_FROM_EMAIL=otp@asf25.ndscbd.net
OTP_FROM_NAME=NDSC Fest OTP

# CORS (production)
ALLOWED_ORIGIN=https://asf25.ndscbd.net
```

### 3. Set up the database

Run the SQL files in order in phpMyAdmin:

1. `tables.sql` - Core tables (users, events, cr_dr, club, otp_tokens, dev_visit)
2. `events.sql` - Seed event data
3. `segment_tables.sql` - Segment registration tables
4. `submission_tables.sql` - Submission tables

### 4. Run the server

```bash
# Development
npm start

# Production (with PM2 or similar)
NODE_ENV=production npm start
```

Server runs at **http://localhost:3001** by default.

---

## API Reference

### Auth  `/api/auth`

| Method | Path                        | Auth | Description                          |
|--------|-----------------------------|------|--------------------------------------|
| POST   | `/send-registration-otp`    | —    | Send OTP for email verification      |
| POST   | `/verify-registration-otp`  | —    | Verify registration OTP              |
| POST   | `/register`                 | —    | Create account                       |
| POST   | `/login`                    | —    | Login with email/password            |
| POST   | `/send-otp`                 | —    | Send login OTP                       |
| POST   | `/verify-otp`               | —    | Verify login OTP                     |
| POST   | `/forgot-password`          | —    | Send password reset OTP              |
| POST   | `/reset-password`           | —    | Reset password with OTP              |
| POST   | `/logout`                   | ✓    | Clear session cookie                 |
| GET    | `/me`                       | ✓    | Get current user profile             |
| GET    | `/lookup-email`             | ✓    | Check if email exists (for partners) |
| POST   | `/record-dev-visit`         | ✓    | Record a visit to developers page    |
| PATCH  | `/update-profile`           | ✓    | Update profile fields                |

### Dashboard  `/api/dashboard`  *(all routes require auth)*

| Method | Path                          | Description                    |
|--------|-------------------------------|--------------------------------|
| GET    | `/`                           | User profile + registrations   |
| GET    | `/segments`                   | All available segments         |
| POST   | `/segments/:key/register`     | Register for a segment         |
| GET    | `/segment/:key`               | Get segment registration info  |

### Segments  `/api/segments`  *(all routes require auth)*

| Method | Path                          | Description                    |
|--------|-------------------------------|--------------------------------|
| POST   | `/:key/register`              | Register for a segment         |
| GET    | `/:key`                       | Get segment registration       |

### Submissions  `/api/submissions`  *(all routes require auth)*

| Method | Path                          | Description                    |
|--------|-------------------------------|--------------------------------|
| POST   | `/project-expo`               | Submit project expo entry      |
| POST   | `/scrapbook`                  | Submit scrapbook entry         |
| POST   | `/wall-magazine`              | Submit wall magazine entry     |

---

## Auth Flow

1. User registers with email → OTP sent via Brevo
2. User verifies OTP → email marked as verified
3. User completes registration → account created, session cookie set
4. All subsequent requests include `credentials: 'include'`
5. `requireAuth` middleware validates JWT from cookie
6. Logout clears the cookie

---

## Features

### User Registration
- OTP-based email verification
- Blood group and gender selection
- CR/DR and Club reference codes (auto-increment contribution counters)
- Profile edit cooldown (once per week)

### Segments
- 20+ event segments with individual registration tables
- Team-based registrations (Conundrum Paradox, Project Expo, etc.)
- Partner validation (must be registered user)
- Payment tracking (bKash transaction ID + datetime)

### Developers Page Visit Tracking
- `dev_visit` table tracks user visits
- Visit count increments on each page load
- First visit and last visit timestamps recorded

---

## Security

- Passwords hashed with **bcrypt** (cost factor 12)
- Auth cookie is `httpOnly`, `secure` in production, `sameSite: lax`
- JWT signed with secret from environment
- Timing-safe login comparison
- Rate limiting: 60 auth attempts per 15 min; 120 general API requests per min
- Input validation on all forms (client + server-side)
- SQL injection prevention via parameterized queries

---

## Database Schema Highlights

### Core Tables
- `users` - User accounts with profile data
- `events` - Event definitions
- `cr_dr` - CR/DR reference codes with contribution counters
- `club` - Club reference codes with contribution counters
- `otp_tokens` - OTP codes for login/registration/password reset
- `dev_visit` - Developer page visit tracking

### Segment Registration Tables
- `reg_conundrumparadox` - Conundrum Paradox (team + optional partner)
- `reg_projectexpo` - Project Expo
- `reg_wallmagazine` - Wall Magazine
- `reg_scrapbook` - Scrapbook
- `reg_robosoccer` - Robo Soccer
- `reg_linefollower` - Line Following Robot
- ...and more

---

## Email Configuration

Two separate Brevo SMTP accounts:
1. **Main SMTP** - Registration confirmations, segment notifications
2. **OTP SMTP** - Login/registration/password reset OTPs (dedicated subdomain)

---

## License

Proprietary — Notre Dame Science Club
