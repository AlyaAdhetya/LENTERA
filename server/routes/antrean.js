import express from 'express';
import pool from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/antrean/cek-nomor/:identifier - Cek antrean pasien hari ini (publik)
router.get('/cek-nomor/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        const today = new Date().toISOString().split('T')[0];

        const [rows] = await pool.query(
            `SELECT a.id, a.nomor_antrean, p.nama_poli as poli, a.tanggal, a.status, ps.nama_lengkap as nama_pasien
            FROM antrean a
            JOIN poli p ON a.poli_id = p.id
            JOIN pasien ps ON a.pasien_id = ps.id
            WHERE (ps.nik = ? OR ps.nrm = ?) AND a.tanggal = ?
            ORDER BY a.created_at DESC LIMIT 1`,
            [identifier, identifier, today]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Anda belum memiliki nomor antrean untuk hari ini.' });
        }

        res.json({ antrean: rows[0] });
    } catch (err) {
        console.error('Cek nomor antrean error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// POST /api/antrean/daftar - Pendaftaran antrean publik
router.post('/daftar', async (req, res) => {
    try {
        const { identifier, poli_id } = req.body;
        if (!identifier || !poli_id) {
            return res.status(400).json({ error: 'NIK/NRM dan Poli harus diisi' });
        }

        // Cari pasien by NIK or NRM
        const [patients] = await pool.query(
            'SELECT * FROM pasien WHERE nik = ? OR nrm = ?',
            [identifier, identifier]
        );

        if (patients.length === 0) {
            return res.status(404).json({ error: 'Data pasien tidak ditemukan. Silakan hubungi petugas pendaftaran.' });
        }

        const pasien = patients[0];
        const today = new Date().toISOString().split('T')[0];

        // Cek apakah sudah daftar hari ini di poli yang sama
        const [existing] = await pool.query(
            'SELECT * FROM antrean WHERE pasien_id = ? AND poli_id = ? AND tanggal = ?',
            [pasien.id, poli_id, today]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                error: 'Anda sudah terdaftar di poli ini hari ini',
                antrean: existing[0],
            });
        }

        // Cek kuota
        const [poli] = await pool.query('SELECT * FROM poli WHERE id = ? AND is_active = 1', [poli_id]);
        if (poli.length === 0) {
            return res.status(404).json({ error: 'Poli tidak ditemukan' });
        }

        const [countResult] = await pool.query(
            'SELECT COUNT(*) as total FROM antrean WHERE poli_id = ? AND tanggal = ?',
            [poli_id, today]
        );

        if (countResult[0].total >= poli[0].kuota_harian) {
            return res.status(400).json({ error: 'Kuota antrean hari ini sudah penuh' });
        }

        // Get next queue number
        const [maxResult] = await pool.query(
            'SELECT COALESCE(MAX(nomor_antrean), 0) as max_nomor FROM antrean WHERE poli_id = ? AND tanggal = ?',
            [poli_id, today]
        );

        const nomorAntrean = maxResult[0].max_nomor + 1;

        const [result] = await pool.query(
            'INSERT INTO antrean (pasien_id, poli_id, tanggal, nomor_antrean) VALUES (?, ?, ?, ?)',
            [pasien.id, poli_id, today, nomorAntrean]
        );

        res.status(201).json({
            message: 'Pendaftaran berhasil!',
            antrean: {
                id: result.insertId,
                nomor_antrean: nomorAntrean,
                nama_pasien: pasien.nama_lengkap,
                poli: poli[0].nama_poli,
                tanggal: today,
                status: 'menunggu',
            },
        });
    } catch (err) {
        console.error('Daftar antrean error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// POST /api/antrean/daftar-baru - Pendaftaran pasien baru + antrean
router.post('/daftar-baru', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { nik, nama_lengkap, jenis_kelamin, tanggal_lahir, alamat, no_hp, no_bpjs, poli_id } = req.body;
        if (!nik || !nama_lengkap || !jenis_kelamin || !poli_id) {
            await connection.rollback();
            return res.status(400).json({ error: 'NIK, Nama, Jenis Kelamin, dan Poli harus diisi' });
        }

        // Cek NIK
        const [existingPatient] = await connection.query('SELECT id FROM pasien WHERE nik = ?', [nik]);
        if (existingPatient.length > 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'NIK sudah terdaftar. Silakan gunakan menu Cek Antrean Pasien Lama.' });
        }

        // Cek Kuota Poli
        const today = new Date().toISOString().split('T')[0];
        const [poli] = await connection.query('SELECT * FROM poli WHERE id = ? AND is_active = 1', [poli_id]);
        if (poli.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Poli tidak ditemukan' });
        }

        const [countResult] = await connection.query(
            'SELECT COUNT(*) as total FROM antrean WHERE poli_id = ? AND tanggal = ?',
            [poli_id, today]
        );
        if (countResult[0].total >= poli[0].kuota_harian) {
            await connection.rollback();
            return res.status(400).json({ error: 'Kuota antrean hari ini sudah penuh' });
        }

        // Autogenerate NRM
        const [maxResultNrm] = await connection.query("SELECT MAX(CAST(SUBSTRING(nrm, 4) AS UNSIGNED)) as max_nrm FROM pasien WHERE nrm LIKE 'RM-%'");
        const nextNum = (maxResultNrm[0].max_nrm || 0) + 1;
        const finalNrm = `RM-${String(nextNum).padStart(4, '0')}`;

        // Insert Pasien
        const [insertPatientResult] = await connection.query(
            'INSERT INTO pasien (nik, nrm, nama_lengkap, jenis_kelamin, tanggal_lahir, alamat, no_hp, no_bpjs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nik, finalNrm, nama_lengkap, jenis_kelamin, tanggal_lahir || null, alamat, no_hp, no_bpjs]
        );
        const newPatientId = insertPatientResult.insertId;

        // Generate Queue Number
        const [maxResultQ] = await connection.query(
            'SELECT COALESCE(MAX(nomor_antrean), 0) as max_nomor FROM antrean WHERE poli_id = ? AND tanggal = ?',
            [poli_id, today]
        );
        const nomorAntrean = maxResultQ[0].max_nomor + 1;

        // Insert Queue
        const [insertQueueResult] = await connection.query(
            'INSERT INTO antrean (pasien_id, poli_id, tanggal, nomor_antrean) VALUES (?, ?, ?, ?)',
            [newPatientId, poli_id, today, nomorAntrean]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Pendaftaran berhasil!',
            antrean: {
                id: insertQueueResult.insertId,
                nomor_antrean: nomorAntrean,
                nama_pasien: nama_lengkap,
                poli: poli[0].nama_poli,
                tanggal: today,
                status: 'menunggu',
            },
        });
    } catch (err) {
        await connection.rollback();
        console.error('Daftar-baru error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan sistem pendaftaran' });
    } finally {
        connection.release();
    }
});

// GET /api/antrean/live - Monitor antrean live (publik)
router.get('/live', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const [rows] = await pool.query(
            `SELECT a.*, p.nama_poli, ps.nama_lengkap as nama_pasien
       FROM antrean a
       JOIN poli p ON a.poli_id = p.id
       JOIN pasien ps ON a.pasien_id = ps.id
       WHERE a.tanggal = ?
       ORDER BY a.poli_id, a.nomor_antrean`,
            [today]
        );

        // Group by poli
        const grouped = {};
        rows.forEach((row) => {
            if (!grouped[row.poli_id]) {
                grouped[row.poli_id] = {
                    poli_id: row.poli_id,
                    nama_poli: row.nama_poli,
                    antrean: [],
                    sedang_dilayani: null,
                    total: 0,
                    selesai: 0,
                };
            }
            grouped[row.poli_id].antrean.push(row);
            grouped[row.poli_id].total++;
            if (row.status === 'dilayani' || row.status === 'dipanggil') {
                grouped[row.poli_id].sedang_dilayani = row;
            }
            if (row.status === 'selesai') {
                grouped[row.poli_id].selesai++;
            }
        });

        res.json(Object.values(grouped));
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/antrean/poli/:poliId - Antrean per poli (for doctors)
router.get('/poli/:poliId', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const [rows] = await pool.query(
            `SELECT a.*, ps.nama_lengkap as nama_pasien, ps.nik, ps.nrm, ps.alergi
       FROM antrean a
       JOIN pasien ps ON a.pasien_id = ps.id
       WHERE a.poli_id = ? AND a.tanggal = ?
       ORDER BY a.nomor_antrean`,
            [req.params.poliId, today]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// PUT /api/antrean/:id/panggil - Panggil pasien
router.put('/:id/panggil', authenticateToken, async (req, res) => {
    try {
        await pool.query(
            "UPDATE antrean SET status = 'dipanggil', waktu_panggil = NOW() WHERE id = ?",
            [req.params.id]
        );
        res.json({ message: 'Pasien dipanggil' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// PUT /api/antrean/:id/layani - Mulai melayani
router.put('/:id/layani', authenticateToken, async (req, res) => {
    try {
        await pool.query("UPDATE antrean SET status = 'dilayani' WHERE id = ?", [req.params.id]);
        res.json({ message: 'Mulai melayani pasien' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// PUT /api/antrean/:id/selesai - Selesai
router.put('/:id/selesai', authenticateToken, async (req, res) => {
    try {
        await pool.query(
            "UPDATE antrean SET status = 'selesai', waktu_selesai = NOW() WHERE id = ?",
            [req.params.id]
        );
        res.json({ message: 'Pasien selesai dilayani' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// PUT /api/antrean/:id/batal - Batalkan
router.put('/:id/batal', authenticateToken, async (req, res) => {
    try {
        await pool.query("UPDATE antrean SET status = 'batal' WHERE id = ?", [req.params.id]);
        res.json({ message: 'Antrean dibatalkan' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

export default router;
