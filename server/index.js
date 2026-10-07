process.on('unhandledRejection', console.error);
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import antreanRoutes from './routes/antrean.js';
import pasienRoutes from './routes/pasien.js';
import rekamMedisRoutes from './routes/rekamMedis.js';
import poliRoutes from './routes/poli.js';
import pegawaiRoutes from './routes/pegawai.js';
import absensiRoutes from './routes/absensi.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'SIM LENTERA API is running', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/antrean', antreanRoutes);
app.use('/api/pasien', pasienRoutes);
app.use('/api/rekam-medis', rekamMedisRoutes);
app.use('/api/poli', poliRoutes);
app.use('/api/pegawai', pegawaiRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

app.listen(PORT, () => {
    console.log(`🏥 SIM LENTERA API running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
