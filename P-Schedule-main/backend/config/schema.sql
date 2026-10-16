-- ============================================================
-- SCHEMA DATABASE - Sistem Penjadwalan TPK Bitung
-- Jalankan file ini sekali untuk membuat struktur database
-- ============================================================

CREATE DATABASE IF NOT EXISTS tpk_scheduler
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tpk_scheduler;

-- ------------------------------------------------------------
-- Tabel: users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS divisions (
  id         INT          NOT NULL AUTO_INCREMENT,
  nama       VARCHAR(100) NOT NULL UNIQUE,
  kode       VARCHAR(30)  NOT NULL UNIQUE,
  aktif      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id         INT          NOT NULL AUTO_INCREMENT,
  nama       VARCHAR(100) NOT NULL,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,          -- bcrypt hash
  role       ENUM('staff','pic','big_admin') NOT NULL DEFAULT 'staff',
  division_id INT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
  ,CONSTRAINT fk_user_division FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO divisions (nama, kode) VALUES
  ('Keuangan', 'KEU'), ('SDM', 'SDM'), ('HSSE', 'HSSE'),
  ('Operasional', 'OPS'), ('Teknik', 'TEK')
ON DUPLICATE KEY UPDATE nama = VALUES(nama);

-- ------------------------------------------------------------
-- Tabel: rooms
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
  id         INT          NOT NULL AUTO_INCREMENT,
  nama       VARCHAR(100) NOT NULL,
  kapasitas  INT          NOT NULL DEFAULT 0,
  keterangan TEXT,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Tabel: schedules
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedules (
  id          INT          NOT NULL AUTO_INCREMENT,
  user_id     INT          NOT NULL,
  room_id     INT          NOT NULL,
  tanggal     DATE         NOT NULL,
  jam_mulai   TIME         NOT NULL,
  jam_selesai TIME         NOT NULL,
  agenda      VARCHAR(255) NOT NULL,
  keterangan  TEXT,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_schedule_user FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_schedule_room FOREIGN KEY (room_id) REFERENCES rooms(id)  ON DELETE CASCADE,
  -- Index untuk mempercepat query deteksi bentrok
  INDEX idx_conflict (room_id, tanggal, jam_mulai, jam_selesai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Data awal: Ruangan
-- ------------------------------------------------------------
INSERT INTO rooms (nama, kapasitas, keterangan) VALUES
  ('Ruang Rapat Lantai 1', 20, 'Dilengkapi proyektor & papan tulis'),
  ('Ruang Rapat Lantai 2', 15, 'Dilengkapi layar presentasi & AC')
ON DUPLICATE KEY UPDATE id = id;

-- ------------------------------------------------------------
-- Data awal: Admin default
-- Password: admin123  (bcrypt hash)
-- ------------------------------------------------------------
INSERT INTO users (nama, username, password, role) VALUES
  ('Administrator', 'admin', '$2a$10$yMSDCnt5PB3qxxYmCKJe.uqt.k973NUTk4GLTAafaanNrN99gjGTa', 'big_admin')
ON DUPLICATE KEY UPDATE id = id;

-- Catatan: Ganti password admin setelah pertama login
-- Hash di atas adalah bcrypt dari string "admin123"
