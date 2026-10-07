-- ============================================
-- SIM LENTERA - Sistem Informasi Puskesmas
-- MySQL Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS sim_lentera
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sim_lentera;

-- ============================================
-- 1. TABEL USERS (Login & Role)
-- ============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  role ENUM('admin', 'dokter', 'perawat') NOT NULL DEFAULT 'dokter',
  poli_id INT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 2. TABEL POLI
-- ============================================
CREATE TABLE poli (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_poli VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  icon VARCHAR(50) DEFAULT 'stethoscope',
  jam_buka TIME DEFAULT '08:00:00',
  jam_tutup TIME DEFAULT '15:00:00',
  kuota_harian INT DEFAULT 30,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 3. TABEL JADWAL DOKTER
-- ============================================
CREATE TABLE jadwal_dokter (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  poli_id INT NOT NULL,
  hari ENUM('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') NOT NULL,
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (poli_id) REFERENCES poli(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- 4. TABEL PEGAWAI
-- ============================================
CREATE TABLE pegawai (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  nip VARCHAR(30) UNIQUE,
  nama_lengkap VARCHAR(100) NOT NULL,
  jabatan VARCHAR(100),
  unit_kerja VARCHAR(100),
  no_hp VARCHAR(20),
  email VARCHAR(100),
  alamat TEXT,
  foto_url VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- 5. TABEL PASIEN
-- ============================================
CREATE TABLE pasien (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nik VARCHAR(16) UNIQUE,
  nrm VARCHAR(20) UNIQUE,
  nama_lengkap VARCHAR(100) NOT NULL,
  tempat_lahir VARCHAR(50),
  tanggal_lahir DATE,
  jenis_kelamin ENUM('L','P') NOT NULL,
  golongan_darah ENUM('A','B','AB','O','-') DEFAULT '-',
  alamat TEXT,
  no_bpjs VARCHAR(50) DEFAULT NULL,
  no_hp VARCHAR(20),
  pekerjaan VARCHAR(50),
  alergi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 6. TABEL ANTREAN
-- ============================================
CREATE TABLE antrean (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pasien_id INT NOT NULL,
  poli_id INT NOT NULL,
  tanggal DATE NOT NULL,
  nomor_antrean INT NOT NULL,
  status ENUM('menunggu','dipanggil','dilayani','selesai','batal') DEFAULT 'menunggu',
  waktu_daftar TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  waktu_panggil TIMESTAMP NULL,
  waktu_selesai TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pasien_id) REFERENCES pasien(id) ON DELETE CASCADE,
  FOREIGN KEY (poli_id) REFERENCES poli(id) ON DELETE CASCADE,
  UNIQUE KEY unique_antrean (pasien_id, poli_id, tanggal)
) ENGINE=InnoDB;

-- ============================================
-- 7. TABEL REKAM MEDIS
-- ============================================
CREATE TABLE rekam_medis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pasien_id INT NOT NULL,
  dokter_id INT NOT NULL,
  poli_id INT NOT NULL,
  antrean_id INT DEFAULT NULL,
  tanggal_kunjungan DATE NOT NULL,
  keluhan TEXT,
  diagnosa VARCHAR(255),
  kode_icd10 VARCHAR(10),
  tindakan TEXT,
  catatan TEXT,
  tekanan_darah VARCHAR(10),
  suhu_tubuh DECIMAL(4,1),
  nadi INT,
  berat_badan DECIMAL(5,1),
  tinggi_badan DECIMAL(5,1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pasien_id) REFERENCES pasien(id) ON DELETE CASCADE,
  FOREIGN KEY (dokter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (poli_id) REFERENCES poli(id) ON DELETE CASCADE,
  FOREIGN KEY (antrean_id) REFERENCES antrean(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- 8. TABEL RESEP OBAT
-- ============================================
CREATE TABLE resep_obat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rekam_medis_id INT NOT NULL,
  nama_obat VARCHAR(100) NOT NULL,
  dosis VARCHAR(50),
  aturan_pakai VARCHAR(100),
  jumlah INT DEFAULT 1,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rekam_medis_id) REFERENCES rekam_medis(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- 9. TABEL ABSENSI (untuk integrasi Android/Expo Go)
-- ============================================
CREATE TABLE absensi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pegawai_id INT NOT NULL,
  tanggal DATE NOT NULL,
  jam_masuk TIMESTAMP NULL,
  jam_pulang TIMESTAMP NULL,
  status ENUM('hadir','izin','sakit','alpha','cuti') DEFAULT 'hadir',
  lokasi_masuk VARCHAR(100),
  lokasi_pulang VARCHAR(100),
  lat_masuk DECIMAL(10,8),
  lng_masuk DECIMAL(11,8),
  lat_pulang DECIMAL(10,8),
  lng_pulang DECIMAL(11,8),
  foto_masuk VARCHAR(255),
  foto_pulang VARCHAR(255),
  device_id VARCHAR(100),
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE CASCADE,
  UNIQUE KEY unique_absensi (pegawai_id, tanggal)
) ENGINE=InnoDB;

-- ============================================
-- SEED DATA
-- ============================================

-- Default Admin (password: admin123)
INSERT INTO users (username, password, nama_lengkap, role) VALUES
('admin', '$2a$10$DCHwTShscbOkfibW2tsBreHbXPe0PYIoXUBGd2rVsE/bT5uPs0gNq', 'Administrator', 'admin');

-- Poli
INSERT INTO poli (nama_poli, deskripsi, icon, jam_buka, jam_tutup, kuota_harian) VALUES
('Poli Umum', 'Pelayanan kesehatan umum untuk semua usia', 'heart-pulse', '08:00:00', '15:00:00', 40),
('Poli Gigi', 'Pelayanan kesehatan gigi dan mulut', 'tooth', '08:00:00', '14:00:00', 25),
('Poli KIA/KB', 'Kesehatan Ibu Anak dan Keluarga Berencana', 'baby', '08:00:00', '14:00:00', 30),
('Poli Lansia', 'Pelayanan kesehatan bagi lanjut usia', 'users', '08:00:00', '12:00:00', 20),
('Poli MTBS', 'Manajemen Terpadu Balita Sakit', 'activity', '08:00:00', '14:00:00', 25);

-- Dokter (password: dokter123)
INSERT INTO users (username, password, nama_lengkap, role, poli_id) VALUES
('dr.sari', '$2a$10$u4i1Rhta/iwTRbLSPOMDW.IVZwnHTQujO6W.M1Y/0GQEOORzSZKLu', 'dr. Sari Dewi', 'dokter', 1),
('dr.andi', '$2a$10$u4i1Rhta/iwTRbLSPOMDW.IVZwnHTQujO6W.M1Y/0GQEOORzSZKLu', 'drg. Andi Pratama', 'dokter', 2),
('dr.ratna', '$2a$10$u4i1Rhta/iwTRbLSPOMDW.IVZwnHTQujO6W.M1Y/0GQEOORzSZKLu', 'dr. Ratna Sari', 'dokter', 3);

-- Pegawai
INSERT INTO pegawai (user_id, nip, nama_lengkap, jabatan, unit_kerja, no_hp) VALUES
(1, '198501012010011001', 'Administrator', 'Admin Sistem', 'IT', '081234567890'),
(2, '198702152012012002', 'dr. Sari Dewi', 'Dokter Umum', 'Poli Umum', '081234567891'),
(3, '199003202015011003', 'drg. Andi Pratama', 'Dokter Gigi', 'Poli Gigi', '081234567892'),
(4, '198805102013012004', 'dr. Ratna Sari', 'Dokter KIA', 'Poli KIA/KB', '081234567893');

-- Sample Pasien
INSERT INTO pasien (nik, nrm, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_hp, alergi) VALUES
('3201010101900001', 'RM-0001', 'Budi Santoso', 'Jakarta', '1990-01-01', 'L', 'Jl. Merdeka No. 1', '081111111111', 'Amoxicillin'),
('3201010101850002', 'RM-0002', 'Siti Aminah', 'Bandung', '1985-05-15', 'P', 'Jl. Pahlawan No. 5', '081222222222', NULL),
('3201010101950003', 'RM-0003', 'Ahmad Fauzi', 'Surabaya', '1995-08-20', 'L', 'Jl. Sudirman No. 10', '081333333333', 'Sulfa'),
('3201010101780004', 'RM-0004', 'Dewi Lestari', 'Yogyakarta', '1978-12-03', 'P', 'Jl. Malioboro No. 22', '081444444444', NULL),
('3201010102000005', 'RM-0005', 'Rizky Ramadhan', 'Semarang', '2000-03-17', 'L', 'Jl. Pemuda No. 8', '081555555555', 'Penisilin');

-- Jadwal Dokter
INSERT INTO jadwal_dokter (user_id, poli_id, hari, jam_mulai, jam_selesai) VALUES
(2, 1, 'Senin', '08:00:00', '12:00:00'),
(2, 1, 'Selasa', '08:00:00', '12:00:00'),
(2, 1, 'Rabu', '08:00:00', '12:00:00'),
(2, 1, 'Kamis', '08:00:00', '12:00:00'),
(2, 1, 'Jumat', '08:00:00', '11:00:00'),
(3, 2, 'Senin', '08:00:00', '14:00:00'),
(3, 2, 'Rabu', '08:00:00', '14:00:00'),
(3, 2, 'Jumat', '08:00:00', '14:00:00'),
(4, 3, 'Selasa', '08:00:00', '14:00:00'),
(4, 3, 'Kamis', '08:00:00', '14:00:00'),
(4, 3, 'Sabtu', '08:00:00', '12:00:00');
