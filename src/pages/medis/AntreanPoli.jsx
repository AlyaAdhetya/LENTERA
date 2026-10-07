import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiPlayCircle, FiCheckCircle, FiXCircle, FiActivity, FiRefreshCw, FiVolume2 } from 'react-icons/fi';
import api from '../../services/api';
import './Medical.css';

const AntreanPoli = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [antrean, setAntrean] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchAntrean = async () => {
        if (!user?.poli_id) return;
        try {
            const response = await api.get(`/antrean/poli/${user.poli_id}`);
            setAntrean(response.data);
        } catch (err) {
            console.error('Error fetching antrean:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAntrean();
        // Auto refresh every 30s for medical staff
        const interval = setInterval(fetchAntrean, 30000);
        return () => clearInterval(interval);
    }, [user?.poli_id]);

    const handleAction = async (id, action) => {
        setActionLoading(id);
        try {
            if (action === 'periksa') {
                const item = antrean.find(a => a.id === id);
                if (item) {
                    navigate(`/medis/periksa/${item.pasien_id}`, { state: { antrean: item } });
                }
            } else {
                if (action === 'panggil') {
                    const item = antrean.find(a => a.id === id);
                    if (item && user?.nama_poli) {
                        const textNomor = String(item.nomor_antrean || '').split('').join(' ');
                        const text = `Panggilan untuk nomor antrean, ${textNomor}, atas nama ${item.nama_pasien}, silakan menuju ${user.nama_poli}`;
                        const audioUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=id&client=tw-ob`;
                        
                        const audio = new Audio(audioUrl);
                        audio.play().catch(error => {
                            console.warn("Online Audio fallback triggered:", error);
                            if ('speechSynthesis' in window) {
                                window.speechSynthesis.cancel();
                                const speech = new SpeechSynthesisUtterance(text);
                                speech.lang = 'id-ID';
                                speech.rate = 0.9;
                                
                                const voices = window.speechSynthesis.getVoices();
                                const indoVoice = voices.find(v => v.lang === 'id-ID' && v.name.includes('Google'));
                                if (indoVoice) speech.voice = indoVoice;
                                
                                window.speechSynthesis.speak(speech);
                            }
                        });
                    }
                }
                await api.put(`/antrean/${id}/${action}`);
                await fetchAntrean(); // refresh list
            }
        } catch (err) {
            alert(`Gagal memproses aksi: ${action}`);
        } finally {
            setActionLoading(null);
        }
    };

    if (!user?.poli_id && user?.role !== 'admin') {
        return (
            <div className="alert alert-warning">
                Anda tidak terdaftar dalam poli manapun. Silakan hubungi Administrator.
            </div>
        );
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'menunggu': return <span className="badge badge-warning">Menunggu</span>;
            case 'dipanggil': return <span className="badge badge-primary">Dipanggil</span>;
            case 'dilayani': return <span className="badge badge-success">Dilayani</span>;
            case 'selesai': return <span className="badge" style={{ background: '#e2e8f0', color: '#64748b' }}>Selesai</span>;
            case 'batal': return <span className="badge badge-danger">Batal</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    return (
        <div className="medical-page animate-fade-in">
            <div className="page-header flex-between mb-6">
                <div>
                    <h1 className="page-title">Manajemen Antrean</h1>
                    <p className="page-description">Daftar pasien hari ini di poli Anda</p>
                </div>
                <button onClick={fetchAntrean} className="btn btn-outline" disabled={loading}>
                    <FiRefreshCw className={loading ? 'spin' : ''} /> Segarkan Data
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <div className="p-8 text-center">Memuat antrean...</div>
                ) : antrean.length === 0 ? (
                    <div className="empty-state text-center p-8">
                        <div className="empty-icon text-muted mb-4"><FiActivity size={48} opacity={0.5} /></div>
                        <h3>Belum ada antrean</h3>
                        <p className="text-muted">Tidak ada pasien yang mendaftar ke poli ini hari ini.</p> 
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Pasien</th>
                                    <th>RM / NIK</th>
                                    <th>Status</th>
                                    <th>Waktu Daftar</th>
                                    <th className="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {antrean.map((item) => (
                                    <tr key={item.id} className={item.status === 'dilayani' || item.status === 'dipanggil' ? 'bg-primary-light active-row' : ''}>
                                        <td className="font-bold text-lg">{item.nomor_antrean}</td>
                                        <td>
                                            <div className="font-bold">{item.nama_pasien}</div>
                                            {item.alergi && <div className="text-sm text-danger mt-1">Alergi: {item.alergi}</div>}
                                        </td>
                                        <td>
                                            <div>{item.nrm || '-'}</div>
                                            <div className="text-sm text-muted">{item.nik || '-'}</div>
                                        </td>
                                        <td>{getStatusBadge(item.status)}</td>
                                        <td>
                                            {new Date(item.waktu_daftar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="text-right">
                                            <div className="action-buttons flex-end gap-2">
                                                {item.status === 'menunggu' && (
                                                    <button
                                                        className="btn btn-sm btn-outline text-primary"     
                                                        onClick={() => handleAction(item.id, 'panggil')}    
                                                        disabled={actionLoading === item.id}
                                                    >
                                                        <FiVolume2 /> Panggil
                                                    </button>
                                                )}

                                                {(item.status === 'menunggu' || item.status === 'dipanggil') && (
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleAction(item.id, 'layani')}     
                                                        disabled={actionLoading === item.id}
                                                    >
                                                        <FiPlayCircle /> Mulai Periksa
                                                    </button>
                                                )}

                                                {item.status === 'dilayani' && (
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleAction(item.id, 'periksa')}    
                                                        disabled={actionLoading === item.id}
                                                    >
                                                        <FiActivity /> Input RME & Resep
                                                    </button>
                                                )}

                                                {item.status !== 'selesai' && item.status !== 'batal' && (  
                                                    <button
                                                        className="btn btn-sm btn-outline text-danger border-none"
                                                        onClick={() => {
                                                            if (window.confirm('Yakin ingin membatalkan antrean ini?')) handleAction(item.id, 'batal')
                                                        }}
                                                        disabled={actionLoading === item.id}
                                                    >
                                                        <FiXCircle />
                                                    </button>
                                                )}

                                                {item.status === 'selesai' && (
                                                    <button disabled className="btn btn-sm btn-outline text-muted">Selesai</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AntreanPoli;
