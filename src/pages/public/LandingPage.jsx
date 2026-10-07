import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiActivity, FiUsers, FiHeart, FiPhone, FiMapPin, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';
import './PublicPages.css';

const layananDetail = [
    {
        nama: "Poli Gigi",
        tag: "Kesehatan Gigi & Mulut",
        deskripsi:
            "Kami menyediakan perawatan gigi dan mulut yang menyeluruh menggunakan peralatan kedokteran gigi modern dan steril. Dari pemeriksaan rutin, pembersihan karang gigi (scaling), tambal gigi (komposit & amalgam), pencabutan gigi sulung maupun permanen, hingga perawatan saluran akar (PSA) — semua ditangani oleh dokter gigi berpengalaman dengan standar klinis terkini.",
        jam: "08:00 – 14:00",
        kuota: "25 / hari",
        foto: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=85",
        highlights: ["Pemeriksaan & konsultasi gratis", "Scaling & pembersihan karang gigi", "Tambal & pencabutan gigi", "Perawatan saluran akar (PSA)"],
        warna: "#0d9488",
    },
    {
        nama: "Poli KIA / KB",
        tag: "Kesehatan Ibu, Anak & Keluarga Berencana",
        deskripsi:
            "Poli KIA/KB hadir sebagai ruang aman bagi ibu dan anak untuk mendapatkan layanan kesehatan yang komprehensif. Mulai dari pemeriksaan kehamilan (ANC) setiap trimester, imunisasi lengkap untuk bayi dan balita, pemantauan tumbuh kembang anak, hingga konseling dan pelayanan kontrasepsi program Keluarga Berencana — semua tersedia dalam satu poli yang ramah ibu dan anak.",
        jam: "08:00 – 14:00",
        kuota: "30 / hari",
        foto: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=800&q=85",
        highlights: ["Pemeriksaan kehamilan (ANC)", "Imunisasi bayi & balita lengkap", "Pemantauan tumbuh kembang anak", "Konseling & layanan KB"],
        warna: "#0d9488",
    },
    {
        nama: "Poli Lansia",
        tag: "Pelayanan Khusus Lanjut Usia",
        deskripsi:
            "Poli Lansia dirancang khusus untuk memenuhi kebutuhan kesehatan warga berusia 60 tahun ke atas dengan pendekatan yang hangat, sabar, dan holistik. Layanan mencakup pemeriksaan tekanan darah rutin, pemantauan kadar gula dan kolesterol, konsultasi gizi lansia, skrining risiko penyakit degeneratif (diabetes, hipertensi, osteoporosis), serta rujukan ke fasilitas lanjutan bila diperlukan.",
        jam: "08:00 – 12:00",
        kuota: "20 / hari",
        foto: "https://images.unsplash.com/photo-1576765608866-5b51046452be?w=800&q=85",
        highlights: ["Pemeriksaan tekanan darah & gula darah", "Skrining penyakit degeneratif", "Konsultasi gizi khusus lansia", "Layanan ramah dan sabar"],
        warna: "#0d9488",
    },
    {
        nama: "Poli MTBS",
        tag: "Manajemen Terpadu Balita Sakit",
        deskripsi:
            "Poli MTBS menggunakan pendekatan terstandar dari WHO untuk menilai, mengklasifikasikan, dan menangani penyakit pada balita usia 0–5 tahun secara sistematis dan menyeluruh. Setiap balita diperiksa menggunakan formulir MTBS yang mencakup penilaian status gizi, batuk, demam, diare, masalah telinga, dan status imunisasi — disertai konseling langsung kepada orang tua mengenai cara perawatan di rumah.",
        jam: "08:00 – 14:00",
        kuota: "25 / hari",
        foto: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=85",
        highlights: ["Penilaian terpadu sesuai standar WHO", "Penanganan demam, batuk, dan diare", "Pemantauan status gizi balita", "Konseling orang tua & panduan perawatan"],
        warna: "#0d9488",
    },
    {
        nama: "Poli Umum",
        tag: "Layanan Kesehatan untuk Semua Usia",
        deskripsi:
            "Poli Umum adalah pintu utama layanan kesehatan di Puskesmas kami, melayani seluruh keluhan medis sehari-hari untuk semua kelompok usia. Dokter umum kami siap menangani pemeriksaan fisik menyeluruh, diagnosis dan pengobatan penyakit ringan hingga sedang, pemberian surat keterangan sehat, serta penerbitan surat rujukan ke poli spesialis atau rumah sakit bila kondisi pasien memerlukan penanganan lebih lanjut.",
        jam: "08:00 – 15:00",
        kuota: "40 / hari",
        foto: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800&q=85",
        highlights: ["Konsultasi & pemeriksaan fisik umum", "Pengobatan penyakit ringan–sedang", "Surat keterangan sehat & rujukan", "Melayani semua usia tanpa terkecuali"],
        warna: "#0d9488",
    },
];

const LandingPage = () => {
    const [polis, setPolis] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolis = async () => {
            try {
                const response = await api.get('/poli');
                setPolis(response.data.filter(p => p.is_active));
            } catch (error) {
                console.error('Error fetching polis:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPolis();
    }, []);

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'activity': return <FiActivity />;
            case 'users': return <FiUsers />;
            case 'baby': return <FiHeart />;
            default: return <FiHeart />;
        }
    };

    return (
        <div className="landing-page">
            {/* Header/Nav */}
            <header className="public-header">
                <div className="container nav-container">
                    <div className="logo-container">
                        <img src="/images/Icon.png" alt="SIM LENTERA" className="app-logo" />
                    </div>
                    <nav className="public-nav">
                        <Link to="/" className="nav-link active">Beranda</Link>
                        <Link to="/daftar-antrean" className="nav-link">Pendaftaran</Link>
                        <Link to="/monitor-antrean" className="nav-link">Monitor Antrean</Link>
                        <Link to="/login" className="btn btn-outline">Login Pegawai</Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="abstract-accent abstract-dot-pattern"></div>
                <div className="abstract-accent abstract-circle-1"></div>
                <div className="abstract-accent abstract-circle-2"></div>
                <div className="abstract-accent abstract-shape-1">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="rgba(88, 204, 161, 0.15)" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.4,-46.4C91,-33.7,97.2,-18.4,96.3,-3.1C95.4,12.2,87.4,27.3,77.3,40.1C67.2,52.9,55,63.4,41.2,71.4C27.4,79.4,12,84.9,-3.2,84.9C-18.4,84.9,-33.4,79.4,-45.5,70.5C-57.6,61.6,-66.8,49.3,-74.6,35.6C-82.4,21.9,-88.8,6.8,-88.1,-8.2C-87.4,-23.2,-79.6,-38,-68.6,-49.4C-57.6,-60.8,-43.4,-68.8,-29.4,-76C-15.4,-83.2,-1.6,-89.6,12.4,-89.6C26.4,-89.6,40.6,-83.2,44.7,-76.4Z" transform="translate(100 100)" />
                    </svg>
                </div>
                <div className="abstract-accent abstract-shape-2">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="rgba(252, 107, 147, 0.1)" d="M51.9,-67.2C65.6,-57.3,73.9,-38.3,77.9,-18.2C81.9,1.9,81.6,23.1,72.4,40.1C63.2,57.1,45.1,69.9,25.4,75.4C5.7,80.9,-15.6,79.1,-33.4,70.9C-51.2,62.7,-65.5,48.1,-74.2,30.3C-82.9,12.5,-86,-8.5,-79.2,-26.4C-72.4,-44.3,-55.7,-59.1,-38.4,-68.8C-21.1,-78.5,-3.2,-83.1,13.8,-79.6C30.8,-76.1,48,-64.5,51.9,-67.2Z" transform="translate(100 100)" />
                    </svg>
                </div>

                <div className="container hero-container">
                    <div className="hero-content animate-fade-in">
                        <span className="badge badge-success mb-4">Pusat Layanan Kesehatan Terpadu</span>
                        <h1 className="hero-title">Kesehatan Anda adalah <br /><span className="text-primary">Prioritas Utama Kami</span></h1>
                        <p className="hero-description">
                            Sistem Informasi Manajemen Puskesmas terintegrasi untuk layanan yang lebih cepat, transparan, dan akurat. Daftar antrean dari rumah tanpa harus menunggu lama.
                        </p>
                        <div className="hero-actions">
                            <Link to="/daftar-antrean" className="btn btn-primary btn-lg">
                                <FiCalendar /> Ambil Antrean Sekarang
                            </Link>
                            <Link to="/monitor-antrean" className="btn btn-secondary btn-lg">
                                <FiActivity /> Monitor Antrean Live
                            </Link>
                        </div>
                    </div>
                    <div className="hero-image-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="floating-card pulse">
                            <div className="stat-value">20+</div>
                            <div className="stat-label">Dokter Tersedia</div>
                        </div>
                        <img
                            src="/images/Dokter-HD.png"
                            alt="Tim Medis Puskesmas"
                            className="hero-image"
                            onError={(e) => { e.target.src = '/images/Dokter.png'; }}
                        />
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="services-section container">
                <div className="section-header text-center mb-10">
                    <h2 className="section-title">Layanan Poliklinik</h2>
                    <p className="section-subtitle">Daftar poli yang tersedia di Puskesmas kami dengan tenaga ahli medis berpengalaman.</p>
                </div>

                {loading ? (
                    <div className="loading-state">Memuat data poliklinik...</div>
                ) : (
                    <div className="services-grid">
                        {polis.map((poli, index) => (
                            <div key={poli.id} className="service-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="service-icon">
                                    {getIcon(poli.icon)}
                                </div>
                                <h3 className="service-title">{poli.nama_poli}</h3>
                                <p className="service-desc">{poli.deskripsi}</p>
                                <div className="service-meta">
                                    <span className="service-time"><FiClock /> {poli.jam_buka.substring(0, 5)} - {poli.jam_tutup.substring(0, 5)}</span>
                                    <span className="service-quota">Kuota: {poli.kuota_harian} / hari</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ===== Kenali Layanan Kami Section ===== */}
            <section className="ld-section">
                {/* Section Header */}
                <div className="ld-section-header">
                    <span className="ld-section-eyebrow">Layanan Unggulan Kami</span>
                    <h2 className="ld-section-title">Kenali Setiap Layanan<br />yang Kami Sediakan</h2>
                    <p className="ld-section-subtitle">
                        Puskesmas kami menghadirkan lima poli spesialis yang siap melayani kebutuhan kesehatan seluruh lapisan masyarakat — dari anak-anak hingga lansia, dengan tenaga medis berdedikasi dan fasilitas yang terus ditingkatkan.
                    </p>
                    <div className="ld-section-divider"></div>
                </div>

                {/* Alternating Items */}
                <div className="ld-items-wrapper">
                    {layananDetail.map((item, index) => (
                        <div
                            key={item.nama}
                            className={`ld-item ${index % 2 !== 0 ? 'ld-item--reverse' : ''}`}
                        >
                            {/* Image Side */}
                            <div className="ld-img-side">
                                <div className="ld-img-frame">
                                    <div className="ld-img-glow"></div>
                                    <img src={item.foto} alt={item.nama} className="ld-img" />
                                    <div className="ld-img-overlay">
                                        <div className="ld-img-badge">
                                            <FiClock size={14} />
                                            <span>{item.jam}</span>
                                        </div>
                                        <div className="ld-img-badge">
                                            <FiUsers size={14} />
                                            <span>Kuota {item.kuota}</span>
                                        </div>
                                    </div>
                                    <div className="ld-img-number">{String(index + 1).padStart(2, '0')}</div>
                                </div>
                                {/* Decorative blob behind image */}
                                <div className={`ld-blob ${index % 2 !== 0 ? 'ld-blob--right' : 'ld-blob--left'}`}></div>
                            </div>

                            {/* Text Side */}
                            <div className="ld-text-side">
                                <span className="ld-tag">{item.tag}</span>
                                <h3 className="ld-title">{item.nama}</h3>
                                <p className="ld-desc">{item.deskripsi}</p>

                                <ul className="ld-highlights">
                                    {item.highlights.map((h) => (
                                        <li key={h} className="ld-highlight-item">
                                            <FiCheckCircle className="ld-check-icon" />
                                            <span>{h}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link to="/daftar-antrean" className="ld-cta-btn">
                                    Daftar Antrean Sekarang
                                    <span className="ld-cta-arrow">→</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="public-footer">
                <div className="container footer-container">
                    <div className="footer-brand">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <img src="/images/Icon.png" alt="SIM LENTERA" className="app-logo footer-logo-white" style={{ marginBottom: 0 }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 700, fontSize: '2rem', color: 'white', lineHeight: '1.1' }}>LENTERA</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'rgba(255, 255, 255, 0.8)', marginTop: '4px' }}>(Layanan Elektronik Terpadu & Rekam Medis Anda)</span>
                            </div>
                        </div>
                        <p className="footer-desc" style={{ marginTop: '1.5rem' }}>Solusi kesehatan modern terintegrasi untuk pelayanan publik yang prima.</p>
                    </div>
                    <div className="footer-links">
                        <h4 className="footer-title">Kontak Kami</h4>
                        <ul className="footer-contact-list">
                            <li><FiMapPin /> Jl. Kesehatan No. 123, Kota Bahagia</li>
                            <li><FiPhone /> (021) 555-0123</li>
                            <li><FiClock /> Senin - Sabtu, 08:00 - 15:00 WIB</li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div className="container">
                        <p>&copy; {new Date().getFullYear()} SIM LENTERA Puskesmas. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;