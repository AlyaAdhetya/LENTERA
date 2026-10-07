import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ======================================================
// API ABSENSI - Siap untuk integrasi Android/Expo Go
// ======================================================

// POST /api/absensi/checkin - Check-in dari mobile app
router.post('/checkin', authenticateToken, async (req, res) => {
    try {
        const { pegawai_id, lat, lng, lokasi, foto_url, device_id } = req.body;
        if (!pegawai_id) return res.status(400).json({ error: 'ID Pegawai harus diisi' });

        const today = new Date().toISOString().split('T')[0];

        // Cek sudah check-in hari ini?
        const [existing] = await pool.query(
            'SELECT * FROM absensi WHERE pegawai_id = ? AND tanggal = ?',
            [pegawai_id, today]
        );

        if (existing.length > 0 && existing[0].jam_masuk) {
            return res.status(400).json({ error: 'Anda sudah check-in hari ini', data: existing[0] });
        }

        if (existing.length > 0) {
            // Update existing record (e.g., status was pre-set by admin)
            await pool.query(
                'UPDATE absensi SET jam_masuk = NOW(), lat_masuk = ?, lng_masuk = ?, lokasi_masuk = ?, foto_masuk = ?, device_id = ?, status = ? WHERE id = ?',
                [lat || null, lng || null, lokasi || null, foto_url || null, device_id || null, 'hadir', existing[0].id]
            );
            return res.json({ message: 'Check-in berhasil', id: existing[0].id });
        }

        const [result] = await pool.query(
            'INSERT INTO absensi (pegawai_id, tanggal, jam_masuk, lat_masuk, lng_masuk, lokasi_masuk, foto_masuk, device_id, status) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)',
            [pegawai_id, today, lat || null, lng || null, lokasi || null, foto_url || null, device_id || null, 'hadir']
        );

        res.status(201).json({ message: 'Check-in berhasil', id: result.insertId });
    } catch (err) {
        console.error('Check-in error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// POST /api/absensi/checkout - Check-out dari mobile app
router.post('/checkout', authenticateToken, async (req, res) => {
    try {
        const { pegawai_id, lat, lng, lokasi, foto_url } = req.body;
        if (!pegawai_id) return res.status(400).json({ error: 'ID Pegawai harus diisi' });

        const today = new Date().toISOString().split('T')[0];

        const [existing] = await pool.query(
            'SELECT * FROM absensi WHERE pegawai_id = ? AND tanggal = ?',
            [pegawai_id, today]
        );

        if (existing.length === 0) {
            return res.status(400).json({ error: 'Anda belum check-in hari ini' });
        }

        if (existing[0].jam_pulang) {
            return res.status(400).json({ error: 'Anda sudah check-out hari ini' });
        }

        await pool.query(
            'UPDATE absensi SET jam_pulang = NOW(), lat_pulang = ?, lng_pulang = ?, lokasi_pulang = ?, foto_pulang = ? WHERE id = ?',
            [lat || null, lng || null, lokasi || null, foto_url || null, existing[0].id]
        );

        res.json({ message: 'Check-out berhasil' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/absensi/today/:pegawaiId - Status hari ini (for mobile)
router.get('/today/:pegawaiId', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const [rows] = await pool.query(
            'SELECT * FROM absensi WHERE pegawai_id = ? AND tanggal = ?',
            [req.params.pegawaiId, today]
        );
        res.json(rows.length > 0 ? rows[0] : null);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/absensi/rekap - Rekapitulasi (for admin dashboard)
router.get('/rekap', authenticateToken, async (req, res) => {
    try {
        const { bulan, tahun, pegawai_id } = req.query;
        const month = bulan || new Date().getMonth() + 1;
        const year = tahun || new Date().getFullYear();

        let query = `
      SELECT a.*, pg.nama_lengkap, pg.nip, pg.jabatan, pg.unit_kerja
      FROM absensi a
      JOIN pegawai pg ON a.pegawai_id = pg.id
      WHERE MONTH(a.tanggal) = ? AND YEAR(a.tanggal) = ?
    `;
        const params = [month, year];

        if (pegawai_id) {
            query += ' AND a.pegawai_id = ?';
            params.push(pegawai_id);
        }

        query += ' ORDER BY a.tanggal DESC, pg.nama_lengkap';

        const [rows] = await pool.query(query, params);

        // Summary stats
        const summary = {};
        rows.forEach((row) => {
            if (!summary[row.pegawai_id]) {
                summary[row.pegawai_id] = {
                    pegawai_id: row.pegawai_id,
                    nama_lengkap: row.nama_lengkap,
                    nip: row.nip,
                    jabatan: row.jabatan,
                    hadir: 0, izin: 0, sakit: 0, alpha: 0, cuti: 0,
                };
            }
            summary[row.pegawai_id][row.status]++;
        });

        res.json({ data: rows, summary: Object.values(summary) });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/absensi/riwayat/:pegawaiId - Riwayat absensi (for mobile)
router.get('/riwayat/:pegawaiId', authenticateToken, async (req, res) => {
    try {
        const { bulan, tahun } = req.query;
        const month = bulan || new Date().getMonth() + 1;
        const year = tahun || new Date().getFullYear();

        const [rows] = await pool.query(
            'SELECT * FROM absensi WHERE pegawai_id = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ? ORDER BY tanggal DESC',
            [req.params.pegawaiId, month, year]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

export default router;
