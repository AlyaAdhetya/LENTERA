import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username dan password harus diisi' });
        }

        const [users] = await pool.query(
            'SELECT u.*, p.nama_poli FROM users u LEFT JOIN poli p ON u.poli_id = p.id WHERE u.username = ? AND u.is_active = 1',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, poli_id: user.poli_id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                nama_lengkap: user.nama_lengkap,
                role: user.role,
                poli_id: user.poli_id,
                nama_poli: user.nama_poli,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/auth/profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT u.id, u.username, u.nama_lengkap, u.role, u.poli_id, p.nama_poli FROM users u LEFT JOIN poli p ON u.poli_id = p.id WHERE u.id = ?',
            [req.user.id]
        );
        if (users.length === 0) return res.status(404).json({ error: 'User tidak ditemukan' });
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// POST /api/auth/register (admin only - for creating new user accounts)
router.post('/register', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Hanya admin yang bisa membuat akun baru' });
        }

        const { username, password, nama_lengkap, role, poli_id } = req.body;
        if (!username || !password || !nama_lengkap || !role) {
            return res.status(400).json({ error: 'Semua field wajib diisi' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (username, password, nama_lengkap, role, poli_id) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, nama_lengkap, role, poli_id || null]
        );

        res.status(201).json({ id: result.insertId, message: 'Akun berhasil dibuat' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username sudah digunakan' });
        }
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

export default router;
