-- ─────────────────────────────────────────────────────────────────────────────
-- NDSC Annual Fest 2026 — Segment Registration Tables (20 segments)
-- ─────────────────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS event_registrations;

-- Project Expo (has extra: hall)
CREATE TABLE reg_projectexpo (
  id              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED  NOT NULL UNIQUE,
  user_name       VARCHAR(255)     NOT NULL,
  email           VARCHAR(255)     NOT NULL,
  institution     VARCHAR(255)     NOT NULL,
  division        VARCHAR(100)     NULL,
  hall            ENUM('Jagadish Chandra Bose','Jamal Nazrul Islam','Nikola Tesla') NOT NULL,
  project_name    VARCHAR(255)     NOT NULL,
  category        ENUM('Junior 6-8','Secondary 9-10','Higher Secondary 11-12') NOT NULL,
  partner_email   VARCHAR(255)     NULL,
  partner_user_id BIGINT UNSIGNED  NULL,
  verified        TINYINT(1)       NOT NULL DEFAULT 1,
  registered_at   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pe_user    FOREIGN KEY (user_id)         REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_pe_partner FOREIGN KEY (partner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE reg_wallmagazine (
  id              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED  NOT NULL UNIQUE,
  user_name       VARCHAR(255)     NOT NULL,
  email           VARCHAR(255)     NOT NULL,
  team_name       VARCHAR(255)     NOT NULL,
  category        ENUM('Junior 6-10','Secondary 11-12') NOT NULL,
  partner_email   VARCHAR(255)     NULL,
  partner_user_id BIGINT UNSIGNED  NULL,
  verified        TINYINT(1)       NOT NULL DEFAULT 1,
  registered_at   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wm_user    FOREIGN KEY (user_id)         REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wm_partner FOREIGN KEY (partner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reg_digitalposter (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  user_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
  verified      TINYINT(1)  NOT NULL DEFAULT 1,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reg_scrapbook (
  id              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED  NOT NULL UNIQUE,
  user_name       VARCHAR(255)     NOT NULL,
  email           VARCHAR(255)     NOT NULL,
  team_name       VARCHAR(255)     NOT NULL,
  category        ENUM('Junior 6-10','Secondary 11-12') NOT NULL,
  partner_email   VARCHAR(255)     NULL,
  partner_user_id BIGINT UNSIGNED  NULL,
  verified        TINYINT(1)       NOT NULL DEFAULT 1,
  registered_at   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sb_user    FOREIGN KEY (user_id)         REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_sb_partner FOREIGN KEY (partner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reg_conceptualart (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  user_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
  verified      TINYINT(1)  NOT NULL DEFAULT 1,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ca_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reg_videography (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  user_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
  verified      TINYINT(1)  NOT NULL DEFAULT 1,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vg_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reg_scienceolympiad (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED  NOT NULL UNIQUE,
  user_name     VARCHAR(255)     NOT NULL,
  email         VARCHAR(255)     NOT NULL,
  category      ENUM('Primary 5-6','Junior 7-8','Secondary 9-10','Higher Secondary 11-12') NOT NULL,
  verified      TINYINT(1)       NOT NULL DEFAULT 1,
  registered_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_so_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reg_scifiwriting (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  user_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
  verified      TINYINT(1)  NOT NULL DEFAULT 1,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sfw_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reg_scinimequiz (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  user_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
  verified      TINYINT(1)  NOT NULL DEFAULT 1,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_snq_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reg_extempore (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  user_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
  verified      TINYINT(1)  NOT NULL DEFAULT 1,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ex_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reg_rubikscube (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  user_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
  verified      TINYINT(1)  NOT NULL DEFAULT 1,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reg_conundrumparadox (
  id              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED  NOT NULL UNIQUE,
  user_name       VARCHAR(255)     NOT NULL,
  email           VARCHAR(255)     NOT NULL,
  team_name       VARCHAR(255)     NOT NULL,
  partner_email   VARCHAR(255)     NULL,
  partner_user_id BIGINT UNSIGNED  NULL,
  transaction_id  VARCHAR(20)      NOT NULL,
  send_money_datetime DATETIME     NOT NULL,
  verified        TINYINT(1)       NOT NULL DEFAULT 0,
  registered_at   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cp_user    FOREIGN KEY (user_id)         REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cp_partner FOREIGN KEY (partner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reg_robosoccer (
  id              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED  NOT NULL UNIQUE,
  user_name       VARCHAR(255)     NOT NULL,
  email           VARCHAR(255)     NOT NULL,
  team_name       VARCHAR(255)     NOT NULL,
  partner_email   VARCHAR(255)     NULL,
  partner_user_id BIGINT UNSIGNED  NULL,
  verified        TINYINT(1)       NOT NULL DEFAULT 1,
  registered_at   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rs_user    FOREIGN KEY (user_id)         REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rs_partner FOREIGN KEY (partner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE reg_linefollower (
  id              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED  NOT NULL UNIQUE,
  user_name       VARCHAR(255)     NOT NULL,
  email           VARCHAR(255)     NOT NULL,
  team_name       VARCHAR(255)     NOT NULL,
  partner_email   VARCHAR(255)     NULL,
  partner_user_id BIGINT UNSIGNED  NULL,
  verified        TINYINT(1)       NOT NULL DEFAULT 1,
  registered_at   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lf_user    FOREIGN KEY (user_id)         REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_lf_partner FOREIGN KEY (partner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE reg_googleit (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  user_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
  verified      TINYINT(1)  NOT NULL DEFAULT 1,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_gi_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE reg_publicquiz (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  user_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
  verified      TINYINT(1)  NOT NULL DEFAULT 1,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pq_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reg_teamquiz (
  id               BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id          BIGINT UNSIGNED  NOT NULL UNIQUE,
  user_name        VARCHAR(255)     NOT NULL,
  email            VARCHAR(255)     NOT NULL,
  team_name        VARCHAR(255)     NOT NULL,
  role             ENUM('captain','member') NOT NULL DEFAULT 'captain',
  captain_user_id  BIGINT UNSIGNED  NOT NULL,
  verified         TINYINT(1)       NOT NULL DEFAULT 1,
  registered_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tq_user    FOREIGN KEY (user_id)         REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tq_captain FOREIGN KEY (captain_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reg_soloquiz (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  user_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
  verified      TINYINT(1)  NOT NULL DEFAULT 1,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sq_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reg_oldschoolquiz (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  user_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
  verified      TINYINT(1)  NOT NULL DEFAULT 1,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_osq_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reg_theoramvault (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  user_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
  verified      TINYINT(1)  NOT NULL DEFAULT 1,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_pe_user  ON reg_projectexpo(user_id);
CREATE INDEX idx_wm_user  ON reg_wallmagazine(user_id);
CREATE INDEX idx_dp_user  ON reg_digitalposter(user_id);
CREATE INDEX idx_tv_user  ON reg_theoramvault(user_id);
CREATE INDEX idx_sb_user  ON reg_scrapbook(user_id);
CREATE INDEX idx_ca_user  ON reg_conceptualart(user_id);
CREATE INDEX idx_vg_user  ON reg_videography(user_id);
CREATE INDEX idx_so_user  ON reg_scienceolympiad(user_id);
CREATE INDEX idx_sfw_user ON reg_scifiwriting(user_id);
CREATE INDEX idx_snq_user ON reg_scinimequiz(user_id);
CREATE INDEX idx_ex_user  ON reg_extempore(user_id);
CREATE INDEX idx_rc_user  ON reg_rubikscube(user_id);
CREATE INDEX idx_cp_user  ON reg_conundrumparadox(user_id);
CREATE INDEX idx_rs_user  ON reg_robosoccer(user_id);
CREATE INDEX idx_lf_user  ON reg_linefollower(user_id);
CREATE INDEX idx_gi_user  ON reg_googleit(user_id);
CREATE INDEX idx_wd_user  ON reg_webdesign(user_id);
CREATE INDEX idx_pq_user  ON reg_publicquiz(user_id);
CREATE INDEX idx_tq_user  ON reg_teamquiz(user_id);
CREATE INDEX idx_sq_user  ON reg_soloquiz(user_id);
CREATE INDEX idx_osq_user ON reg_oldschoolquiz(user_id);
-- Meme-o-logy registration
CREATE TABLE reg_memeology (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED  NOT NULL UNIQUE,
  user_name     VARCHAR(255)     NOT NULL,
  email         VARCHAR(255)     NOT NULL,
  institution   VARCHAR(255)     NOT NULL,
  registered_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_memo_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_memo_user ON reg_memeology(user_id);
