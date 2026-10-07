import bcrypt from 'bcryptjs';
import pool from './db.js';

async function runSeed() {
    console.log("🕒 Memulai proses Input Data Awal (Seeding) ke Supabase...");
    try {
        // 1. Password hashing
        console.log("🔒 Menggenerate Password Hash...");
        const adminHash = await bcrypt.hash('admin123', 10);
        const dokterHash = await bcrypt.hash('dokter123', 10);

        // 2. Insert Poli
        console.log("🏥 Menambahkan data Poli...");
        await pool.query(`
            INSERT INTO poli (id, nama_poli, deskripsi, icon, jam_buka, jam_tutup, kuota_harian) 
            VALUES 
            (1, 'Poli Umum', 'Pelayanan kesehatan umum untuk semua usia', 'heart-pulse', '08:00:00', '15:00:00', 40),
            (2, 'Poli Gigi', 'Pelayanan kesehatan gigi dan mulut', 'tooth', '08:00:00', '14:00:00', 25),
            (3, 'Poli KIA/KB', 'Kesehatan Ibu Anak dan Keluarga Berencana', 'baby', '08:00:00', '14:00:00', 30),
            (4, 'Poli Lansia', 'Pelayanan kesehatan bagi lanjut usia', 'users', '08:00:00', '12:00:00', 20),
            (5, 'Poli MTBS', 'Manajemen Terpadu Balita Sakit', 'activity', '08:00:00', '14:00:00', 25)
            ON CONFLICT (id) DO NOTHING;
        `);

        // 3. Insert Users
        console.log("👥 Menambahkan data Users (Admin & Dokter)...");
        await pool.query(`
            INSERT INTO users (id, username, password, nama_lengkap, role, poli_id) 
            VALUES 
            (1, 'admin', $1, 'Administrator', 'admin', NULL),
            (2, 'dr.sari', $2, 'dr. Sari Dewi', 'dokter', 1),
            (3, 'dr.andi', $2, 'drg. Andi Pratama', 'dokter', 2),
            (4, 'dr.ratna', $2, 'dr. Ratna Sari', 'dokter', 3)
            ON CONFLICT (id) DO NOTHING;
        `, [adminHash, dokterHash]);

        // Fix sequences
        await pool.query("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));");
        await pool.query("SELECT setval('poli_id_seq', (SELECT MAX(id) FROM poli));");

        // 4. Insert Pegawai
        console.log("👨‍⚕️ Menambahkan data Pegawai...");
        await pool.query(`
            INSERT INTO pegawai (id, user_id, nip, nama_lengkap, jabatan, unit_kerja, no_hp) 
            VALUES 
            (1, 1, '198501012010011001', 'Administrator', 'Admin Sistem', 'IT', '081234567890'),
            (2, 2, '198702152012012002', 'dr. Sari Dewi', 'Dokter Umum', 'Poli Umum', '081234567891'),
            (3, 3, '199003202015011003', 'drg. Andi Pratama', 'Dokter Gigi', 'Poli Gigi', '081234567892'),
            (4, 4, '198805102013012004', 'dr. Ratna Sari', 'Dokter KIA', 'Poli KIA/KB', '081234567893')
            ON CONFLICT (id) DO NOTHING;
        `);
        await pool.query("SELECT setval('pegawai_id_seq', (SELECT MAX(id) FROM pegawai));");

        // 5. Insert Pasien
        console.log("🤒 Menambahkan Sample Pasien...");
        await pool.query(`
            INSERT INTO pasien (id, nik, nrm, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_hp, alergi) 
            VALUES 
            (1, '3201010101900001', 'RM-0001', 'Budi Santoso', 'Jakarta', '1990-01-01', 'L', 'Jl. Merdeka No. 1', '081111111111', 'Amoxicillin'),
            (2, '3201010101850002', 'RM-0002', 'Siti Aminah', 'Bandung', '1985-05-15', 'P', 'Jl. Pahlawan No. 5', '081222222222', NULL),
            (3, '3201010101950003', 'RM-0003', 'Ahmad Fauzi', 'Surabaya', '1995-08-20', 'L', 'Jl. Sudirman No. 10', '081333333333', 'Sulfa'),
            (4, '3201010101780004', 'RM-0004', 'Dewi Lestari', 'Yogyakarta', '1978-12-03', 'P', 'Jl. Malioboro No. 22', '081444444444', NULL),
            (5, '3201010102000005', 'RM-0005', 'Rizky Ramadhan', 'Semarang', '2000-03-17', 'L', 'Jl. Pemuda No. 8', '081555555555', 'Penisilin')
            ON CONFLICT (id) DO NOTHING;
        `);
        await pool.query("SELECT setval('pasien_id_seq', (SELECT MAX(id) FROM pasien));");

        // 6. Insert Jadwal Dokter
        console.log("📅 Menambahkan Jadwal Dokter...");
        await pool.query(`
            INSERT INTO jadwal_dokter (id, user_id, poli_id, hari, jam_mulai, jam_selesai) 
            VALUES 
            (1, 2, 1, 'Senin', '08:00:00', '12:00:00'),
            (2, 2, 1, 'Selasa', '08:00:00', '12:00:00'),
            (3, 2, 1, 'Rabu', '08:00:00', '12:00:00'),
            (4, 2, 1, 'Kamis', '08:00:00', '12:00:00'),
            (5, 2, 1, 'Jumat', '08:00:00', '11:00:00'),
            (6, 3, 2, 'Senin', '08:00:00', '14:00:00'),
            (7, 3, 2, 'Rabu', '08:00:00', '14:00:00'),
            (8, 3, 2, 'Jumat', '08:00:00', '14:00:00'),
            (9, 4, 3, 'Selasa', '08:00:00', '14:00:00'),
            (10, 4, 3, 'Kamis', '08:00:00', '14:00:00'),
            (11, 4, 3, 'Sabtu', '08:00:00', '12:00:00')
            ON CONFLICT (id) DO NOTHING;
        `);
        await pool.query("SELECT setval('jadwal_dokter_id_seq', (SELECT MAX(id) FROM jadwal_dokter));");

        console.log("✅ BERHASIL! Semua data test berhasil dimasukkan ke Supabase!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Terjadi Error saat Seeding:", err);
        process.exit(1);
    }
}

runSeed();