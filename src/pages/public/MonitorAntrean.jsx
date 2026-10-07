import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiVolume2, FiMonitor, FiArrowLeft } from 'react-icons/fi';
import api from '../../services/api';
import './PublicPages.css';

const MonitorAntrean = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date()); // ← jam live

    const fetchData = async () => {
        try {
            const response = await api.get('/antrean/live');
            setData(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching live queue:', err);
        }
    };

    // Auto refresh data setiap 1 detik
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 1000); // ← diubah dari 5000
        return () => clearInterval(interval);
    }, []);

    // Jam bergerak otomatis setiap detik
    useEffect(() => {
        const clockInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(clockInterval);
    }, []);

    const activeData = data.filter(p => (p.total > p.selesai) || p.sedang_dilayani);

    return (
        <div className="monitor-page">
            <header className="monitor-header">
                <div className="monitor-logo">
                    <img src="/images/Icon.png" alt="SIM LENTERA" className="app-logo" style={{ objectFit: 'contain' }} />
                    <div className="monitor-logo-text">
                        <span className="monitor-title">LENTERA</span>
                        <span className="monitor-subtitle">Sistem Antrean Poliklinik</span>
                    </div>
                </div>
                <div className="monitor-clock">
                    <div className="time">{currentTime.toLocaleTimeString('id-ID')}</div>
                    <div className="date">{currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
            </header>

            <main className="monitor-content">
                {loading && <div className="loading-state text-white">Memuat data secara live...</div>}

                {!loading && activeData.length === 0 && (
                    <div className="empty-state text-white">Belum ada antrean yang sedang aktif atau menunggu hari ini.</div>
                )}

                <div className="monitor-grid">
                    {activeData.map((poli) => (
                        <div key={poli.poli_id} className="monitor-card card">
                            <div className="monitor-card-header">
                                <h2>{poli.nama_poli}</h2>
                            </div>
                            <div className="monitor-card-body">
                                <div className="current-call">
                                    <span className="call-label">Sedang Dipanggil/Dilayani</span>
                                    <div className={`call-number ${poli.sedang_dilayani ? 'active animate-pulse' : ''}`}>
                                        {poli.sedang_dilayani ? poli.sedang_dilayani.nomor_antrean : '-'}
                                    </div>
                                </div>
                            </div>
                            <div className="monitor-card-footer">
                                <div className="stats">
                                    <span>Total: {poli.total}</span>
                                    <span>Selesai: {poli.selesai}</span>
                                    <span>Sisa: {poli.total - poli.selesai - (poli.sedang_dilayani ? 1 : 0)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <div className="monitor-actions">
                <Link to="/" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
                    <FiArrowLeft /> Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
};

export default MonitorAntrean;