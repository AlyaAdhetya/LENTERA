import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/poli - List all poli (public)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM poli ORDER BY nama_poli');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/poli/:id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM poli WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Poli tidak ditemukan' });

        // Get jadwal dokter for this poli
        const [jadwal] = await pool.query(
            `SELECT jd.*, u.nama_lengkap as nama_dokter
       FROM jadwal_dokter jd
       JOIN users u ON jd.user_id = u.id
       WHERE jd.poli_id = ? AND jd.is_active = 1
       ORDER BY FIELD(jd.hari, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu')`,
            [req.params.id]
        );

        res.json({ ...rows[0], jadwal });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// POST /api/poli
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { nama_poli, deskripsi, icon, jam_buka, jam_tutup, kuota_harian } = req.body;
        if (!nama_poli) return res.status(400).json({ error: 'Nama poli harus diisi' });

        const [result] = await pool.query(
            'INSERT INTO poli (nama_poli, deskripsi, icon, jam_buka, jam_tutup, kuota_harian) VALUES (?, ?, ?, ?, ?, ?)',
            [nama_poli, deskripsi || null, icon || 'stethoscope', jam_buka || '08:00:00', jam_tutup || '15:00:00', kuota_harian || 30]
        );
        res.status(201).json({ id: result.insertId, message: 'Poli berhasil ditambahkan' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// PUT /api/poli/:id
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { nama_poli, deskripsi, icon, jam_buka, jam_tutup, kuota_harian, is_active } = req.body;
        await pool.query(
            'UPDATE poli SET nama_poli=?, deskripsi=?, icon=?, jam_buka=?, jam_tutup=?, kuota_harian=?, is_active=? WHERE id=?',
            [nama_poli, deskripsi, icon, jam_buka, jam_tutup, kuota_harian, is_active, req.params.id]
        );
        res.json({ message: 'Poli berhasil diupdate' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// DELETE /api/poli/:id
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM poli WHERE id = ?', [req.params.id]);
        res.json({ message: 'Poli berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// ======= JADWAL DOKTER =======
// GET /api/poli/jadwal/all
router.get('/jadwal/all', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT jd.*, u.nama_lengkap as nama_dokter, p.nama_poli
       FROM jadwal_dokter jd
       JOIN users u ON jd.user_id = u.id
       JOIN poli p ON jd.poli_id = p.id
       WHERE jd.is_active = 1
       ORDER BY p.nama_poli, FIELD(jd.hari, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu')`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// POST /api/poli/jadwal
router.post('/jadwal', authenticateToken, async (req, res) => {
    try {
        const { user_id, poli_id, hari, jam_mulai, jam_selesai } = req.body;
        const [result] = await pool.query(
            'INSERT INTO jadwal_dokter (user_id, poli_id, hari, jam_mulai, jam_selesai) VALUES (?, ?, ?, ?, ?)',
            [user_id, poli_id, hari, jam_mulai, jam_selesai]
        );
        res.status(201).json({ id: result.insertId, message: 'Jadwal berhasil ditambahkan' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// DELETE /api/poli/jadwal/:id
router.delete('/jadwal/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM jadwal_dokter WHERE id = ?', [req.params.id]);
        res.json({ message: 'Jadwal berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

export default router;
