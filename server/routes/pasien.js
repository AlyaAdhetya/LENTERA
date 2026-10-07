import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/pasien - List all patients (with search)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM pasien';
        let countQuery = 'SELECT COUNT(*) as total FROM pasien';
        const params = [];
        const countParams = [];

        if (search) {
            const where = ' WHERE nama_lengkap LIKE ? OR nik LIKE ? OR nrm LIKE ?';
            const searchParam = `%${search}%`;
            query += where;
            countQuery += where;
            params.push(searchParam, searchParam, searchParam);
            countParams.push(searchParam, searchParam, searchParam);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));

        const [rows] = await pool.query(query, params);
        const [countResult] = await pool.query(countQuery, countParams);

        res.json({
            data: rows,
            pagination: {
                total: countResult[0].total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(countResult[0].total / limit),
            },
        });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/pasien/search/:identifier - Search by NIK or NRM (public)
router.get('/search/:identifier', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, nik, nrm, nama_lengkap, jenis_kelamin, tanggal_lahir, alamat FROM pasien WHERE nik = ? OR nrm = ?',
            [req.params.identifier, req.params.identifier]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Pasien tidak ditemukan' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/pasien/:id
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pasien WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Pasien tidak ditemukan' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// POST /api/pasien
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { nik, nrm, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, golongan_darah, alamat, no_hp, pekerjaan, alergi } = req.body;
        if (!nama_lengkap || !jenis_kelamin) {
            return res.status(400).json({ error: 'Nama dan jenis kelamin wajib diisi' });
        }

        // Auto-generate NRM if not provided
        let finalNrm = nrm;
        if (!finalNrm) {
            const [maxResult] = await pool.query("SELECT MAX(CAST(SUBSTRING(nrm, 4) AS UNSIGNED)) as max_nrm FROM pasien WHERE nrm LIKE 'RM-%'");
            const nextNum = (maxResult[0].max_nrm || 0) + 1;
            finalNrm = `RM-${String(nextNum).padStart(4, '0')}`;
        }

        const [result] = await pool.query(
            'INSERT INTO pasien (nik, nrm, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, golongan_darah, alamat, no_hp, pekerjaan, alergi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nik || null, finalNrm, nama_lengkap, tempat_lahir || null, tanggal_lahir || null, jenis_kelamin, golongan_darah || '-', alamat || null, no_hp || null, pekerjaan || null, alergi || null]
        );

        res.status(201).json({ id: result.insertId, nrm: finalNrm, message: 'Pasien berhasil ditambahkan' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'NIK atau NRM sudah terdaftar' });
        }
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// PUT /api/pasien/:id
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { nik, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, golongan_darah, alamat, no_hp, pekerjaan, alergi } = req.body;
        await pool.query(
            'UPDATE pasien SET nik=?, nama_lengkap=?, tempat_lahir=?, tanggal_lahir=?, jenis_kelamin=?, golongan_darah=?, alamat=?, no_hp=?, pekerjaan=?, alergi=? WHERE id=?',
            [nik, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, golongan_darah, alamat, no_hp, pekerjaan, alergi, req.params.id]
        );
        res.json({ message: 'Data pasien berhasil diupdate' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// DELETE /api/pasien/:id
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM pasien WHERE id = ?', [req.params.id]);
        res.json({ message: 'Pasien berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

export default router;
