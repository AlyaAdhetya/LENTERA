import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/rekam-medis/pasien/:pasienId - Riwayat rekam medis
router.get('/pasien/:pasienId', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT rm.*, u.nama_lengkap as nama_dokter, p.nama_poli
       FROM rekam_medis rm
       JOIN users u ON rm.dokter_id = u.id
       JOIN poli p ON rm.poli_id = p.id
       WHERE rm.pasien_id = ?
       ORDER BY rm.tanggal_kunjungan DESC`,
            [req.params.pasienId]
        );

        // Get resep for each record
        for (let i = 0; i < rows.length; i++) {
            const [resep] = await pool.query(
                'SELECT * FROM resep_obat WHERE rekam_medis_id = ?',
                [rows[i].id]
            );
            rows[i].resep = resep;
        }

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// POST /api/rekam-medis - Input pemeriksaan baru
router.post('/', authenticateToken, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const {
            pasien_id, poli_id, antrean_id,
            keluhan, diagnosa, kode_icd10, tindakan, catatan,
            tekanan_darah, suhu_tubuh, nadi, berat_badan, tinggi_badan,
            resep = [],
        } = req.body;

        if (!pasien_id || !diagnosa) {
            return res.status(400).json({ error: 'Pasien dan diagnosa wajib diisi' });
        }

        const [result] = await conn.query(
            `INSERT INTO rekam_medis 
       (pasien_id, dokter_id, poli_id, antrean_id, tanggal_kunjungan, keluhan, diagnosa, kode_icd10, tindakan, catatan, tekanan_darah, suhu_tubuh, nadi, berat_badan, tinggi_badan)
       VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [pasien_id, req.user.id, poli_id || req.user.poli_id, antrean_id || null,
                keluhan, diagnosa, kode_icd10 || null, tindakan || null, catatan || null,
                tekanan_darah || null, suhu_tubuh || null, nadi || null, berat_badan || null, tinggi_badan || null]
        );

        const rekamMedisId = result.insertId;

        // Insert resep obat
        if (resep.length > 0) {
            const resepValues = resep.map((r) => [
                rekamMedisId, r.nama_obat, r.dosis || null, r.aturan_pakai || null, r.jumlah || 1, r.keterangan || null,
            ]);
            await conn.query(
                'INSERT INTO resep_obat (rekam_medis_id, nama_obat, dosis, aturan_pakai, jumlah, keterangan) VALUES ?',
                [resepValues]
            );
        }

        // Mark antrean as selesai
        if (antrean_id) {
            await conn.query("UPDATE antrean SET status = 'selesai', waktu_selesai = NOW() WHERE id = ?", [antrean_id]);
        }

        await conn.commit();
        res.status(201).json({ id: rekamMedisId, message: 'Rekam medis berhasil disimpan' });
    } catch (err) {
        await conn.rollback();
        console.error('Rekam medis error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    } finally {
        conn.release();
    }
});

// GET /api/rekam-medis/:id
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT rm.*, u.nama_lengkap as nama_dokter, p.nama_poli, ps.nama_lengkap as nama_pasien, ps.nik, ps.nrm, ps.alergi
       FROM rekam_medis rm
       JOIN users u ON rm.dokter_id = u.id
       JOIN poli p ON rm.poli_id = p.id
       JOIN pasien ps ON rm.pasien_id = ps.id
       WHERE rm.id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Rekam medis tidak ditemukan' });

        const [resep] = await pool.query('SELECT * FROM resep_obat WHERE rekam_medis_id = ?', [req.params.id]);
        rows[0].resep = resep;

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

export default router;
