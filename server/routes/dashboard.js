import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/dashboard/stats - Overall statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const [totalPasien] = await pool.query('SELECT COUNT(*) as total FROM pasien');
        const [totalPegawai] = await pool.query('SELECT COUNT(*) as total FROM pegawai WHERE is_active = 1');
        const [totalPoli] = await pool.query('SELECT COUNT(*) as total FROM poli WHERE is_active = 1');
        const [antreanHariIni] = await pool.query(
            'SELECT COUNT(*) as total FROM antrean WHERE tanggal = ?', [today]
        );
        const [selesaiHariIni] = await pool.query(
            "SELECT COUNT(*) as total FROM antrean WHERE tanggal = ? AND status = 'selesai'", [today]
        );
        const [hadirHariIni] = await pool.query(
            "SELECT COUNT(*) as total FROM absensi WHERE tanggal = ? AND status = 'hadir'", [today]
        );

        res.json({
            total_pasien: totalPasien[0].total,
            total_pegawai: totalPegawai[0].total,
            total_poli: totalPoli[0].total,
            antrean_hari_ini: antreanHariIni[0].total,
            selesai_hari_ini: selesaiHariIni[0].total,
            hadir_hari_ini: hadirHariIni[0].total,
        });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/dashboard/kunjungan-bulanan - Monthly visit trend
router.get('/kunjungan-bulanan', authenticateToken, async (req, res) => {
    try {
        const tahun = req.query.tahun || new Date().getFullYear();
        const [rows] = await pool.query(
            `SELECT MONTH(tanggal_kunjungan) as bulan, COUNT(*) as total
       FROM rekam_medis
       WHERE YEAR(tanggal_kunjungan) = ?
       GROUP BY MONTH(tanggal_kunjungan)
       ORDER BY bulan`,
            [tahun]
        );

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const data = months.map((name, i) => {
            const found = rows.find(r => r.bulan === i + 1);
            return { bulan: name, total: found ? found.total : 0 };
        });

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/dashboard/kunjungan-poli - Visits per poli
router.get('/kunjungan-poli', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT p.nama_poli, COUNT(rm.id) as total
       FROM poli p
       LEFT JOIN rekam_medis rm ON p.id = rm.poli_id AND YEAR(rm.tanggal_kunjungan) = YEAR(CURDATE())
       WHERE p.is_active = 1
       GROUP BY p.id, p.nama_poli
       ORDER BY total DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/dashboard/diagnosa-terbanyak - Top diagnoses
router.get('/diagnosa-terbanyak', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT diagnosa, COUNT(*) as total
       FROM rekam_medis
       WHERE YEAR(tanggal_kunjungan) = YEAR(CURDATE()) AND diagnosa IS NOT NULL
       GROUP BY diagnosa
       ORDER BY total DESC
       LIMIT 10`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/dashboard/demografi - Patient demographics
router.get('/demografi', authenticateToken, async (req, res) => {
    try {
        const [gender] = await pool.query(
            `SELECT jenis_kelamin, COUNT(*) as total FROM pasien GROUP BY jenis_kelamin`
        );

        const [usia] = await pool.query(
            `SELECT 
        CASE 
          WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 5 THEN 'Balita (0-4)'
          WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 12 THEN 'Anak (5-11)'
          WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 18 THEN 'Remaja (12-17)'
          WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 45 THEN 'Dewasa (18-44)'
          WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 60 THEN 'Paruh Baya (45-59)'
          ELSE 'Lansia (60+)'
        END as kelompok,
        COUNT(*) as total
       FROM pasien
       WHERE tanggal_lahir IS NOT NULL
       GROUP BY kelompok
       ORDER BY MIN(TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()))`
        );

        res.json({ gender, usia });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/dashboard/pasien-bulan-ini - Get table of patients who visited this month
router.get('/pasien-bulan-ini', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT a.id, a.tanggal, a.waktu_daftar, a.nomor_antrean, a.status,
                    p.nama_lengkap as nama_pasien, p.nrm, p.nik, p.no_hp,
                    po.nama_poli
             FROM antrean a
             JOIN pasien p ON a.pasien_id = p.id
             JOIN poli po ON a.poli_id = po.id
             WHERE MONTH(a.tanggal) = MONTH(CURDATE()) AND YEAR(a.tanggal) = YEAR(CURDATE())
             ORDER BY a.tanggal DESC, a.waktu_daftar DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});


export default router;
