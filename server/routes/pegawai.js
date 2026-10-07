import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/pegawai
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { search } = req.query;
        let query = `SELECT pg.*, u.username, u.role FROM pegawai pg LEFT JOIN users u ON pg.user_id = u.id`;
        const params = [];

        if (search) {
            query += ' WHERE pg.nama_lengkap LIKE ? OR pg.nip LIKE ?';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY pg.nama_lengkap';
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/pegawai/:id
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT pg.*, u.username, u.role FROM pegawai pg LEFT JOIN users u ON pg.user_id = u.id WHERE pg.id = ?',
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Pegawai tidak ditemukan' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// POST /api/pegawai
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { user_id, nip, nama_lengkap, jabatan, unit_kerja, no_hp, email, alamat } = req.body;
        if (!nama_lengkap) return res.status(400).json({ error: 'Nama lengkap harus diisi' });

        const [result] = await pool.query(
            'INSERT INTO pegawai (user_id, nip, nama_lengkap, jabatan, unit_kerja, no_hp, email, alamat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [user_id || null, nip || null, nama_lengkap, jabatan || null, unit_kerja || null, no_hp || null, email || null, alamat || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Pegawai berhasil ditambahkan' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'NIP sudah terdaftar' });
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// PUT /api/pegawai/:id
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { nip, nama_lengkap, jabatan, unit_kerja, no_hp, email, alamat, is_active } = req.body;
        await pool.query(
            'UPDATE pegawai SET nip=?, nama_lengkap=?, jabatan=?, unit_kerja=?, no_hp=?, email=?, alamat=?, is_active=? WHERE id=?',
            [nip, nama_lengkap, jabatan, unit_kerja, no_hp, email, alamat, is_active ?? 1, req.params.id]
        );
        res.json({ message: 'Pegawai berhasil diupdate' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// DELETE /api/pegawai/:id
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM pegawai WHERE id = ?', [req.params.id]);
        res.json({ message: 'Pegawai berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

export default router;
