import React, { useState, useEffect } from 'react';
import { FiVolume2, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';
import './Admin.css';

const DaftarKunjungan = () => {
    const [pasienBulanIni, setPasienBulanIni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const pasienBulanIniRes = await api.get('/dashboard/pasien-bulan-ini');
                setPasienBulanIni(pasienBulanIniRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handlePanggil = async (id, nomorAntrean, namaPasien, namaPoli) => {
        try {
            setActionLoading(id);
            await api.put(`/antrean/${id}/panggil`);

            // Auto-refresh the list
            const pasienBulanIniRes = await api.get('/dashboard/pasien-bulan-ini');
            setPasienBulanIni(pasienBulanIniRes.data);

            // TTS Voice Announcement (Online API with Native Fallback)
            const textNomor = String(nomorAntrean).split('').join(' ');
            const textToSpeak = `Panggilan untuk nomor antrean, ${textNomor}, atas nama, ${namaPasien}, silakan menuju ke ${namaPoli}`;
            const audioUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textToSpeak)}&tl=id&client=tw-ob`;
            
            const audio = new Audio(audioUrl);
            audio.play().catch(error => {
                console.warn("Online Audio rejected by browser/Google, falling back to Native TTS...", error);
                
                // Fallback ke fitur bawaan browser jika diblokir Google / CORS
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel(); 
                    const utterance = new SpeechSynthesisUtterance(textToSpeak);
                    utterance.lang = 'id-ID';
                    utterance.rate = 0.9;
                    utterance.pitch = 1;
                    
                    // Supaya mencari jenis suara Google Indonesia jika tersedia
                    const voices = window.speechSynthesis.getVoices();
                    const indoVoice = voices.find(v => v.lang === 'id-ID' && v.name.includes('Google'));
                    if (indoVoice) utterance.voice = indoVoice;
                    
                    window.speechSynthesis.speak(utterance);
                } else {
                    alert("Gagal memutar suara otomatis.");
                }
            });

        } catch (error) {
            console.error('Error updating status:', error);
            alert('Gagal memanggil pasien');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSelesai = async (id) => {
        try {
            setActionLoading(id);
            await api.put(`/antrean/${id}/selesai`);
            
            // Auto-refresh the list
            const pasienBulanIniRes = await api.get('/dashboard/pasien-bulan-ini');
            setPasienBulanIni(pasienBulanIniRes.data);
        } catch (error) {
            console.error('Error finishing status:', error);
            alert('Gagal menyelesaikan antrean');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted">Memuat data analitik...</div>;

    return (
        <div className="admin-page animate-fade-in">
            <div className="page-header mb-6">
                <h1 className="page-title">Daftar Kunjungan</h1>
                <p className="page-description">Rekap data kunjungan antrean pasien</p>
            </div>

            {/* Table: Pasien Bulan Ini */}
            <div className="card mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="chart-title mb-0">Daftar Kunjungan Pasien (Bulan Ini)</h3>
                </div>
                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>No. Antrean</th>
                                <th>Nama Pasien</th>
                                <th>NIK</th>
                                <th>Poli Tujuan</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center', minWidth: '220px' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pasienBulanIni.map(pasien => (
                                <tr key={pasien.id}>
                                    <td>{new Date(pasien.waktu_daftar).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>
                                        <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#334155' }}>
                                            {pasien.nomor_antrean}
                                        </span>
                                    </td>
                                    <td>{pasien.nama_pasien}</td>
                                    <td>{pasien.nik}</td>
                                    <td>{pasien.nama_poli}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500',
                                            backgroundColor: pasien.status === 'selesai' ? '#dcfce7' : (pasien.status === 'menunggu' ? '#fef3c7' : (pasien.status === 'batal' ? '#fee2e2' : '#e0e7ff')),
                                            color: pasien.status === 'selesai' ? '#166534' : (pasien.status === 'menunggu' ? '#92400e' : (pasien.status === 'batal' ? '#991b1b' : '#3730a3'))
                                        }}>
                                            {pasien.status.charAt(0).toUpperCase() + pasien.status.slice(1)}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className="flex justify-center gap-2">
                                            {pasien.status !== 'selesai' && pasien.status !== 'batal' && (
                                                <>
                                                    <button
                                                        className="btn btn-sm btn-outline text-primary"
                                                        onClick={() => handlePanggil(pasien.id, pasien.nomor_antrean, pasien.nama_pasien, pasien.nama_poli)}
                                                        disabled={actionLoading === pasien.id}
                                                        title="Panggil Pasien"
                                                    >
                                                        <FiVolume2 /> {pasien.status === 'menunggu' ? 'Panggil' : 'Panggil Lagi'}
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-success text-white"
                                                        onClick={() => handleSelesai(pasien.id)}
                                                        disabled={actionLoading === pasien.id}
                                                        title="Selesaikan Antrean"
                                                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <FiCheckCircle /> Selesai
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {pasienBulanIni.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-4">Belum ada data kunjungan pasien untuk bulan ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DaftarKunjungan;