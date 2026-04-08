-- ─────────────────────────────────────────────────────────────────────────────
-- NDSC Annual Fest 2026 — Online Submission Tables
-- Run this AFTER segment_tables.sql (foreign keys reference reg_* tables)
-- ─────────────────────────────────────────────────────────────────────────────

-- Digital Poster submission
CREATE TABLE reg_digitalposter_submission (
  id           BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED  NOT NULL UNIQUE,
  user_name    VARCHAR(255)     NOT NULL,
  email        VARCHAR(255)     NOT NULL,
  drive_link   VARCHAR(2048)    NOT NULL,
  submitted_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_dps_reg  FOREIGN KEY (user_id) REFERENCES reg_digitalposter(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_dps_user ON reg_digitalposter_submission(user_id);

-- Project Expo divisional submission (video Drive link — non-Dhaka only)
CREATE TABLE reg_projectexpo_submission (
  id           BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED  NOT NULL UNIQUE,
  user_name    VARCHAR(255)     NOT NULL,
  email        VARCHAR(255)     NOT NULL,
  institution  VARCHAR(255)     NOT NULL,
  division     VARCHAR(100)     NOT NULL,
  project_name VARCHAR(255)     NOT NULL,
  category     ENUM('Junior 6-8','Secondary 9-10','Higher Secondary 11-12') NOT NULL,
  drive_link   VARCHAR(2048)    NOT NULL,
  submitted_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_pes_reg  FOREIGN KEY (user_id) REFERENCES reg_projectexpo(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_pes_user ON reg_projectexpo_submission(user_id);

-- Videography submission
CREATE TABLE reg_videography_submission (
  id           BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED  NOT NULL UNIQUE,
  user_name    VARCHAR(255)     NOT NULL,
  email        VARCHAR(255)     NOT NULL,
  drive_link   VARCHAR(2048)    NOT NULL,
  submitted_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_vs_reg  FOREIGN KEY (user_id) REFERENCES reg_videography(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_vs_user ON reg_videography_submission(user_id);



CREATE TABLE reg_theoramvault_submission (
  id           BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED  NOT NULL UNIQUE,
  user_name    VARCHAR(255)     NOT NULL,
  email        VARCHAR(255)     NOT NULL,
  drive_link   VARCHAR(2048)    NOT NULL,
  submitted_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tvs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tvs_reg  FOREIGN KEY (user_id) REFERENCES reg_theoramvault(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_tvs_user ON reg_theoramvault_submission(user_id);
-- Meme-o-logy submission
CREATE TABLE reg_memeology_submission (
  id           BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED  NOT NULL UNIQUE,
  user_name    VARCHAR(255)     NOT NULL,
  email        VARCHAR(255)     NOT NULL,
  drive_link   VARCHAR(2048)    NOT NULL,
  submitted_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_memos_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_memos_reg  FOREIGN KEY (user_id) REFERENCES reg_memeology(user_id) ON DELETE CASCADE
);
CREATE INDEX idx_memos_user ON reg_memeology_submission(user_id);

-- Web Page Designing submission
CREATE TABLE reg_webdesign_submission (
  id           BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED  NOT NULL UNIQUE,
  user_name    VARCHAR(255)     NOT NULL,
  email        VARCHAR(255)     NOT NULL,
  drive_link   VARCHAR(2048)    NOT NULL,
  submitted_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wds_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wds_reg  FOREIGN KEY (user_id) REFERENCES reg_webdesign(user_id) ON DELETE CASCADE
);
CREATE INDEX idx_wds_user ON reg_webdesign_submission(user_id);
