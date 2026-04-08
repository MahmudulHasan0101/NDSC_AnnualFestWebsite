-- ─────────────────────────────────────────────
-- NDSC Annual Fest 2026 — MySQL Schema
-- Run this in phpMyAdmin → SQL tab
-- ─────────────────────────────────────────────

-- Users table
CREATE TABLE users (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(255)     NOT NULL,
  email         VARCHAR(255)     NOT NULL UNIQUE,
  phone         VARCHAR(30)      NOT NULL,
  institution   VARCHAR(255)     NOT NULL,
  division      VARCHAR(100)     NULL,
  student_class VARCHAR(50)      NULL,
  address       TEXT             NULL,
  blood_group   ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,
  gender        ENUM('male','female','other','prefer_not_to_say') NOT NULL,
  password_hash VARCHAR(255)     NOT NULL,
  cr_dr_ref_code VARCHAR(100)    NULL,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
  id          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255)     NOT NULL UNIQUE,
  description TEXT,
  type        VARCHAR(100)
);

-- CR / DR reference table
-- Populate manually with each CR/DR's name and their unique reference code.
CREATE TABLE cr_dr (
  id             BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(255)     NOT NULL,
  reference_code VARCHAR(100)     NOT NULL UNIQUE,
  contribution   INT UNSIGNED     NOT NULL DEFAULT 0
);

-- Add division, student_class, address + reference_code columns to existing users table
ALTER TABLE users
  ADD COLUMN division       VARCHAR(100)  NULL AFTER institution,
  ADD COLUMN student_class  VARCHAR(50)   NULL AFTER division,
  ADD COLUMN address        TEXT          NULL AFTER student_class,
  ADD COLUMN cr_dr_ref_code VARCHAR(100)  NULL AFTER address;
-- OTP tokens table (for login OTP and forgot-password)
CREATE TABLE otp_tokens (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255)    NOT NULL,
  otp_code   VARCHAR(20)      NOT NULL,
  purpose    ENUM('login','forgot_password', 'registration','registration_verified') NOT NULL,
  expires_at DATETIME        NOT NULL,
  used       TINYINT(1)      NOT NULL DEFAULT 0,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_otp_email_purpose (email, purpose)
);

ALTER TABLE users
  ADD COLUMN last_profile_updated_at DATETIME NULL DEFAULT NULL;

-- Club reference table
-- Each participating club has a unique reference code.
-- contribution increments by 1 whenever a user registers with that club's code.
CREATE TABLE club (
  id             BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(255)     NOT NULL,
  reference_code VARCHAR(100)     NOT NULL UNIQUE,
  contribution   INT UNSIGNED     NOT NULL DEFAULT 0
);

-- Seed club data
INSERT INTO club (name, reference_code) VALUES
  ('BF Shaheen',                        '2501'),
  ('Hamdard',                           '2502'),
  ('Gregory',                           '2503'),
  ('Samsul Haque',                      '2504'),
  ('Engineering University',            '2505'),
  ('Gazipur Cantonment Science Club',   '2506'),
  ('Rajuk',                             '2507'),
  ('St Joseph IT',                      '2508'),
  ('Imperial Career',                   '2509'),
  ('Noor Mohammad IT',                  '2510');

-- Add club_ref_code column to users
ALTER TABLE users
  ADD COLUMN club_ref_code VARCHAR(100) NULL AFTER cr_dr_ref_code;

-- Dev visit tracking table
-- Tracks visits to the developers page; visit_count increments on each visit
CREATE TABLE dev_visit (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL UNIQUE,
  visit_count INT UNSIGNED    NOT NULL DEFAULT 0,
  first_visit DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_visit  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dev_visit_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
