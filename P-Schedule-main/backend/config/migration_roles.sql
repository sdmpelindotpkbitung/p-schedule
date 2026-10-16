-- Jalankan sekali pada database lama tpk_scheduler.
USE tpk_scheduler;

CREATE TABLE IF NOT EXISTS divisions (
  id INT NOT NULL AUTO_INCREMENT,
  nama VARCHAR(100) NOT NULL UNIQUE,
  kode VARCHAR(30) NOT NULL UNIQUE,
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO divisions (nama, kode) VALUES
  ('Keuangan', 'KEU'), ('SDM', 'SDM'), ('HSSE', 'HSSE'),
  ('Operasional', 'OPS'), ('Teknik', 'TEK')
ON DUPLICATE KEY UPDATE nama = VALUES(nama);

ALTER TABLE users MODIFY role ENUM('admin', 'staff', 'pic', 'big_admin') NOT NULL DEFAULT 'staff';
ALTER TABLE users ADD COLUMN division_id INT NULL AFTER role;
ALTER TABLE users ADD CONSTRAINT fk_user_division
  FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL;

UPDATE users SET role = 'big_admin' WHERE role = 'admin';
ALTER TABLE users MODIFY role ENUM('staff', 'pic', 'big_admin') NOT NULL DEFAULT 'staff';
UPDATE users
SET division_id = (SELECT id FROM divisions WHERE kode = 'TEK')
WHERE role IN ('staff', 'pic') AND division_id IS NULL;
ALTER TABLE schedules DROP COLUMN status;