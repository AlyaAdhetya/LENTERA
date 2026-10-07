import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiLock, FiUser, FiArrowLeft, FiAlertCircle, FiLogIn } from 'react-icons/fi';
import api from '../../services/api';
import '../public/PublicPages.css';
import './Auth.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { username, password });

            const { token, user } = response.data;
            login(user, token);

            // Redirect based on role instead of 'from' if they just naturally navigated to /login
            if (from === '/' || from === '/login') {
                if (user.role === 'admin') navigate('/admin');
                else if (user.role === 'dokter' || user.role === 'perawat') navigate('/medis');
                else navigate('/');
            } else {
                navigate(from, { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal login. Periksa username dan password.');
        } finally {
            setLoading(false);
        }
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

            <div className="form-container animate-fade-in" style={{ maxWidth: '450px' }}>
                <Link to="/" className="back-link">
                    <FiArrowLeft /> Kembali ke Beranda
                </Link>

                <div className="card form-card">
                    <div className="auth-header" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',      // ← ini kunci agar semua center
                        textAlign: 'center',
                        padding: '2rem 1.5rem 1rem',
                        gap: '0.75rem',
                    }}>
                        {/* Logo */}
                        <img
                            src="/images/Icon.png"
                            alt="SIM LENTERA"
                            className="app-logo-lg"
                            style={{ width: '90px', height: '120px', objectFit: 'contain' }}
                        />

                        {/* Badge LENTERA */}
                        <div style={{
                            border: '2px solid var(--primary)',
                            borderRadius: '40px',
                            padding: '6px 28px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <span style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                color: 'var(--primary)',
                            }}>
                                LENTERA
                            </span>
                        </div>

                        {/* Login Portal Pegawai */}
                        <p style={{
                            fontSize: '14px',
                            letterSpacing: '0.1em',
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            margin: 0,
                        }}>
                            Login Portal Pegawai
                        </p>
                    </div>

                    <div className="auth-body" style={{ padding: '2rem' }}>
                        {error && (
                            <div className="alert alert-danger mb-4">
                                <FiAlertCircle /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <div className="input-group">
                                    <span className="input-icon"><FiUser /></span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Masukkan username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group mb-6" style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">Password</label>
                                <div className="input-group">
                                    <span className="input-icon"><FiLock /></span>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Masukkan password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full btn-lg"
                                style={{ width: '100%', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                disabled={loading || !username || !password}
                            >
                                {loading ? 'Memverifikasi...' : <><FiLogIn /> Masuk ke Sistem</>}
                            </button>
                        </form>
                    </div>

                    <div className="auth-footer" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                        <p style={{ color: 'var(--text-muted)' }}>Akses ini khusus untuk internal pegawai Puskesmas. <br />Pasien silakan gunakan <Link to="/daftar-antrean" style={{ fontWeight: 700, color: 'var(--primary)' }}>Pendaftaran Mandiri</Link>.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
