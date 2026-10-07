-- ============================================
-- SIM LENTERA - Sistem Informasi Puskesmas
-- Supabase / PostgreSQL Database Schema
-- ============================================

-- ============================================
-- 1. TABEL USERS (Login & Role)
-- ============================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'dokter', 'perawat')) NOT NULL DEFAULT 'dokter',
  poli_id INT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. TABEL POLI
-- ============================================
CREATE TABLE poli (
  id SERIAL PRIMARY KEY,
  nama_poli VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  icon VARCHAR(50) DEFAULT 'stethoscope',
  jam_buka TIME DEFAULT '08:00:00',
  jam_tutup TIME DEFAULT '15:00:00',
  kuota_harian INT DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. TABEL JADWAL DOKTER
-- ============================================
CREATE TABLE jadwal_dokter (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  poli_id INT NOT NULL,
  hari VARCHAR(10) CHECK (hari IN ('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu')) NOT NULL,
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (poli_id) REFERENCES poli(id) ON DELETE CASCADE
);

-- ============================================
-- 4. TABEL PEGAWAI
-- ============================================
CREATE TABLE pegawai (
  id SERIAL PRIMARY KEY,
  user_id INT DEFAULT NULL,
  nip VARCHAR(30) UNIQUE,
  nama_lengkap VARCHAR(100) NOT NULL,
  jabatan VARCHAR(100),
  unit_kerja VARCHAR(100),
  no_hp VARCHAR(20),
  email VARCHAR(100),
  alamat TEXT,
  foto_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 5. TABEL PASIEN
-- ============================================
CREATE TABLE pasien (
  id SERIAL PRIMARY KEY,
  nik VARCHAR(16) UNIQUE,
  nrm VARCHAR(20) UNIQUE,
  nama_lengkap VARCHAR(100) NOT NULL,
  tempat_lahir VARCHAR(50),
  tanggal_lahir DATE,
  jenis_kelamin VARCHAR(1) CHECK (jenis_kelamin IN ('L','P')) NOT NULL,
  golongan_darah VARCHAR(2) CHECK (golongan_darah IN ('A','B','AB','O','-')) DEFAULT '-',
  alamat TEXT,
  no_bpjs VARCHAR(50) DEFAULT NULL,
  no_hp VARCHAR(20),
  pekerjaan VARCHAR(50),
  alergi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. TABEL ANTREAN
-- ============================================
CREATE TABLE antrean (
  id SERIAL PRIMARY KEY,
  pasien_id INT NOT NULL,
  poli_id INT NOT NULL,
  tanggal DATE NOT NULL,
  nomor_antrean INT NOT NULL,
  status VARCHAR(20) CHECK (status IN ('menunggu','dipanggil','dilayani','selesai','batal')) DEFAULT 'menunggu',
  waktu_daftar TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  waktu_panggil TIMESTAMP NULL,
  waktu_selesai TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pasien_id) REFERENCES pasien(id) ON DELETE CASCADE,
  FOREIGN KEY (poli_id) REFERENCES poli(id) ON DELETE CASCADE,
  UNIQUE (pasien_id, poli_id, tanggal)
);

-- ============================================
-- 7. TABEL REKAM MEDIS
-- ============================================
CREATE TABLE rekam_medis (
  id SERIAL PRIMARY KEY,
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
);

-- ============================================
-- 8. TABEL RESEP OBAT
-- ============================================
CREATE TABLE resep_obat (
  id SERIAL PRIMARY KEY,
  rekam_medis_id INT NOT NULL,
  nama_obat VARCHAR(100) NOT NULL,
  dosis VARCHAR(50),
  aturan_pakai VARCHAR(100),
  jumlah INT DEFAULT 1,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rekam_medis_id) REFERENCES rekam_medis(id) ON DELETE CASCADE
);

-- ============================================
-- 9. TABEL ABSENSI (untuk integrasi Android/Expo Go & Supabase Storage)
-- ============================================
CREATE TABLE absensi (
  id SERIAL PRIMARY KEY,
  pegawai_id INT NOT NULL,
  tanggal DATE NOT NULL,
  jam_masuk TIMESTAMP NULL,
  jam_pulang TIMESTAMP NULL,
  status VARCHAR(20) CHECK (status IN ('hadir','izin','sakit','alpha','cuti')) DEFAULT 'hadir',
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
  UNIQUE (pegawai_id, tanggal)
);

-- Note: In Supabase Postgres, triggers should be created manually to replicate `ON UPDATE CURRENT_TIMESTAMP`. For now, we will leave `updated_at` to default at insert, and can be updated by our App logic or specific PostgreSQL triggers.
