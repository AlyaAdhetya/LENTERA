import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle, FiUser, FiCalendar, FiArrowLeft, FiUserPlus, FiCreditCard } from 'react-icons/fi';
import api from '../../services/api';
import './PublicPages.css';

const DaftarAntrean = () => {
    const [activeTab, setActiveTab] = useState('baru'); // 'baru' = form daftar, 'lama' = cari data
    const [polis, setPolis] = useState([]);

    // --- State Pasien Lama ---
    const [identifier, setIdentifier] = useState('');
    const [poliIdLama, setPoliIdLama] = useState('');
    const [pasienInfo, setPasienInfo] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    // --- State Pasien Baru ---
    const [formDataBaru, setFormDataBaru] = useState({
        nik: '',
        nama_lengkap: '',
        jenis_kelamin: 'L',
        tanggal_lahir: '',
        alamat: '',
        no_hp: '',
        no_bpjs: '',
        poli_id: ''
    });

    // --- State Global ---
    const [submitLoading, setSubmitLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        const fetchPolis = async () => {
            try {
                const response = await api.get('/poli');
                setPolis(response.data.filter(p => p.is_active));
            } catch (error) {
                console.error('Error fetching polis');
            }
        };
        fetchPolis();
    }, []);

    // --- Handler Pasien Lama (Cari Nomor Antrean) ---
    const handleCariPasien = async (e) => {
        e.preventDefault();
        if (!identifier) return;

        setSearchLoading(true);
        setSearchError('');
        setResult(null);

        try {
            const response = await api.get(`/antrean/cek-nomor/${identifier}`);
            setResult(response.data.antrean);
        } catch (err) {
            setSearchError(err.response?.data?.error || 'Nomor antrean tidak ditemukan. Pastikan Anda sudah mendaftar untuk hari ini.');
        } finally {
            setSearchLoading(false);
        }
    };

    // --- Handler Pasien Baru ---
    const handleInputChangeBaru = (e) => {
        setFormDataBaru({ ...formDataBaru, [e.target.name]: e.target.value });
    };

    const handleSubmitBaru = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setSubmitError('');

        try {
            const response = await api.post('/antrean/daftar-baru', formDataBaru);
            setResult(response.data.antrean);
        } catch (err) {
            setSubmitError(err.response?.data?.error || 'Terjadi kesalahan saat mendaftar');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleReset = () => {
        setIdentifier('');
        setPoliIdLama('');
        setPasienInfo(null);
        setResult(null);
        setSubmitError('');
        setSearchError('');
        setFormDataBaru({
            nik: '', nama_lengkap: '', jenis_kelamin: 'L', tanggal_lahir: '', alamat: '', no_hp: '', no_bpjs: '', poli_id: ''
        });
    };

    return (
        <div className="public-screen-wrap midnight-teal-theme">
            {/* Premium Midnight Teal Background Elements */}
            <div className="theme-backdrop">
                <div className="vertical-lines"></div>
                <div className="bottom-curve"></div>
                <div className="ekg-wave ekg-top"></div>
                <div className="ekg-wave ekg-bottom"></div>
                <div className="concentric-circles"></div>

                <div className="health-icon icon-1">+</div>
                <div className="health-icon icon-2">❤</div>
                <div className="health-icon icon-3">⚕</div>
                <div className="health-icon icon-4">⚕</div>
                <div className="health-icon icon-5">⚕</div>
                <div className="health-icon icon-6">❤</div>
                <div className="health-icon icon-7">+</div>
                <div className="health-icon icon-8">❤</div>
                <div className="health-icon icon-9">❤</div>
                <div className="health-icon icon-10">⚕</div>

                <div className="glass-circle circle-1"></div>
                <div className="glass-circle circle-2"></div>

                <div className="line-pattern pattern-1"></div>
                <div className="line-pattern pattern-2"></div>

                <div className="gradient-glow glow-1"></div>
                <div className="gradient-glow glow-2"></div>

                {/* Floating Elements */}
                <div className="floating-plus plus-1">+</div>
                <div className="floating-dot dot-1"></div>
                <div className="floating-dot dot-2"></div>
                <div className="floating-dot dot-3"></div>
                <div className="floating-dot dot-4"></div>
                <div className="floating-dot dot-5"></div>
                <div className="floating-dot dot-6"></div>
            </div>

            <div className="form-container animate-fade-in" style={{ maxWidth: activeTab === 'baru' ? '800px' : '600px' }}>
                <Link to="/" className="back-link">
                    <FiArrowLeft /> Kembali ke Beranda
                </Link>

                <div className="card queue-form-card">
                    <div className="form-header text-center">
                        <div style={{ display: 'inline-block', backgroundColor: 'var(--primary-dark)', color: 'white', padding: '6px 20px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '16px' }}>SIM LENTERA</div>
                        <h2 className="title">Daftar Antrean Online</h2>
                        <p className="subtitle">Ambil nomor antrean mandiri tanpa harus datang pagi ke Puskesmas</p>
                    </div>

                    {!result ? (
                        <div className="form-body">
                            {/* Switcher Teks Sesuai User Request */}
                            {activeTab === 'baru' && (
                                <div className="alert-info-custom mb-6 animate-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <div>
                                        <strong>Sudah pernah berobat?</strong>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cari data Anda untuk langsung mengambil antrean.</div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        style={{ whiteSpace: 'nowrap' }}
                                        onClick={() => { setActiveTab('lama'); setSubmitError(''); }}
                                    >
                                        <FiUser /> Cari Data Pasien
                                    </button>
                                </div>
                            )}

                            {activeTab === 'lama' && (
                                <div className="animate-fade-in">
                                    <div className="alert-info-custom mb-6 animate-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <div>
                                            <strong>Pasien Baru?</strong>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Silakan isi form pendaftaran terlebih dahulu.</div>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            style={{ whiteSpace: 'nowrap' }}
                                            onClick={() => { setActiveTab('baru'); setSubmitError(''); }}
                                        >
                                            <FiUserPlus /> Daftar Pasien Baru
                                        </button>
                                    </div>
                                    
                                    <div className="step-section">
                                        <h3 className="step-title">Cek Nomor Antrean Hari Ini</h3>
                                        <form onSubmit={handleCariPasien}>
                                            <div className="form-group mb-4">
                                                <label className="form-label">Masukkan NIK KTP atau NRM</label>
                                                <div className="input-group">
                                                    <span className="input-icon"><FiUser /></span>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Contoh: 320101... atau RM-0001"
                                                        value={identifier}
                                                        onChange={(e) => setIdentifier(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={searchLoading || !identifier}>
                                                <FiCalendar /> {searchLoading ? 'Mencari Antrean...' : 'Cek Nomor Antrean'}
                                            </button>
                                        </form>

                                        {searchError && (
                                            <div className="alert alert-warning mt-4">
                                                <FiAlertCircle /> {searchError}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB CONTENT: PASIEN BARU */}
                            {activeTab === 'baru' && (
                                <div className="animate-fade-in">
                                    <h3 className="step-title mb-4">Isi Data Diri Pasien</h3>
                                    <form onSubmit={handleSubmitBaru}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="form-group">
                                                <label className="form-label">NIK (16 Digit) *</label>
                                                <div className="input-group">
                                                    <span className="input-icon"><FiCreditCard /></span>
                                                    <input type="text" className="form-control" name="nik" placeholder="3201..." value={formDataBaru.nik} onChange={handleInputChangeBaru} required minLength="16" maxLength="16" />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Nama Lengkap Sesuai KTP *</label>
                                                <input type="text" className="form-control" name="nama_lengkap" value={formDataBaru.nama_lengkap} onChange={handleInputChangeBaru} required />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Jenis Kelamin *</label>
                                                <select className="form-control" name="jenis_kelamin" value={formDataBaru.jenis_kelamin} onChange={handleInputChangeBaru} required>
                                                    <option value="L">Laki-laki</option>
                                                    <option value="P">Perempuan</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Tanggal Lahir *</label>
                                                <input type="date" className="form-control" name="tanggal_lahir" value={formDataBaru.tanggal_lahir} onChange={handleInputChangeBaru} required />
                                            </div>
                                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                                <label className="form-label">Alamat Lengkap *</label>
                                                <textarea className="form-control" name="alamat" rows="2" value={formDataBaru.alamat} onChange={handleInputChangeBaru} required></textarea>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">No. Telepon/HP/WA</label>
                                                <input type="text" className="form-control" name="no_hp" placeholder="081x..." value={formDataBaru.no_hp} onChange={handleInputChangeBaru} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">No. BPJS/KIS (Opsional)</label>
                                                <input type="text" className="form-control" name="no_bpjs" placeholder="Masukkan jika ada" value={formDataBaru.no_bpjs} onChange={handleInputChangeBaru} />
                                            </div>
                                        </div>

                                        <h3 className="step-title mt-6 mb-4">Pilih Poliklinik</h3>
                                        <div className="form-group">
                                            <label className="form-label">Poliklinik Tujuan *</label>
                                            <select className="form-control" name="poli_id" value={formDataBaru.poli_id} onChange={handleInputChangeBaru} required>
                                                <option value="">-- Pilih Poliklinik --</option>
                                                {polis.map(poli => <option key={poli.id} value={poli.id}>{poli.nama_poli}</option>)}
                                            </select>
                                        </div>

                                        {submitError && <div className="alert alert-danger mb-4"><FiAlertCircle /> {submitError}</div>}

                                        <button type="submit" className="btn btn-primary w-full btn-lg mt-4" disabled={submitLoading || !formDataBaru.poli_id}>
                                            <FiCalendar /> {submitLoading ? 'Menyimpan & Memproses Antrean...' : 'Daftar & Ambil Antrean'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Success View (Sama untuk Baru dan Lama) */
                        <div className="success-view animate-fade-in text-center">
                            <div className="success-icon">
                                <FiCheckCircle size={64} color="var(--success)" />
                            </div>
                            <h3 className="success-title">
                                {activeTab === 'baru' ? 'Antrean Berhasil!' : 'Nomor Antrean Ditemukan!'}
                            </h3>
                            <p className="success-desc">
                                {activeTab === 'baru' 
                                    ? 'Silakan tangkap layar (screenshot) ini dan tunjukkan kepada petugas pendaftaran saat Anda tiba di Puskesmas.'
                                    : 'Berikut adalah detail antrean Anda hari ini. Silakan screenshot atau catat nomor antrean ini.'}
                            </p>

                            <div className="ticket-card">
                                <div className="ticket-header">
                                    <h4>{result.poli}</h4>
                                    <span className="ticket-date">{result.tanggal}</span>
                                </div>
                                <div className="ticket-body">
                                    <span className="ticket-label">Nomor Antrean Anda</span>
                                    <div className="ticket-number text-primary">{result.nomor_antrean}</div>
                                    <div className="ticket-patient">{result.nama_pasien}</div>
                                </div>
                            </div>

                            <div className="success-actions mt-6">
                                <button onClick={handleReset} className="btn btn-outline">Daftar Pasien Lain</button>
                                <Link to="/monitor-antrean" className="btn btn-secondary">Monitor Antrean Live</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DaftarAntrean;
