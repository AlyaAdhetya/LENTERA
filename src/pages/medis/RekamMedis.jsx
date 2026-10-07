import React, { useState } from 'react';
import { FiSearch, FiUser, FiActivity, FiFileText, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import './Medical.css';

const RekamMedis = () => {
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [pasien, setPasien] = useState(null);
    const [riwayat, setRiwayat] = useState([]);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!identifier) return;

        setLoading(true);
        setError('');
        setPasien(null);
        setRiwayat([]);

        try {
            // 1. Get pasien details first
            const pasienRes = await api.get(`/pasien/search/${identifier}`);
            setPasien(pasienRes.data);

            // 2. Get medical records list
            if (pasienRes.data?.id) {
                const riwayatRes = await api.get(`/rekam-medis/pasien/${pasienRes.data.id}`);
                setRiwayat(riwayatRes.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Data pasien tidak ditemukan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="medical-page animate-fade-in">
            <div className="page-header mb-6">
                <h1 className="page-title">Rekam Medis Elektronik (RME)</h1>
                <p className="page-description">Cari riwayat kunjungan dan rekam medis pasien</p>
            </div>

            <div className="card mb-6 search-rme-card">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="form-group mb-0 flex-1">
                        <div className="input-group">
                            <span className="input-icon"><FiSearch /></span>
                            <input
                                type="text"
                                className="form-control form-control-lg"
                                placeholder="Cari berdasarkan NIK atau NRM (Contoh: RM-0001)"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary px-6" disabled={loading || !identifier}>
                        {loading ? 'Mencari...' : 'Cari Berkas RME'}
                    </button>
                </form>
                {error && <div className="text-danger mt-3">{error}</div>}
            </div>

            {pasien && (
                <div className="grid-layout-2">
                    {/* Panel Kiri - Bio Pasien */}
                    <div className="col-span-1">
                        <div className="card h-full bio-card border-none bg-surface-alt shadow-inner">
                            <div className="flex items-center gap-4 mb-6 border-b pb-4">
                                <div className="avatar avatar-lg bg-primary text-white">
                                    <FiUser size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">{pasien.nama_lengkap}</h3>
                                    <p className="text-primary font-bold">{pasien.nrm}</p>
                                </div>
                            </div>

                            <div className="bio-details">
                                <div className="bio-row">
                                    <span className="bio-label">NIK</span>
                                    <span className="bio-value">{pasien.nik || '-'}</span>
                                </div>
                                <div className="bio-row">
                                    <span className="bio-label">Jenis Kelamin</span>
                                    <span className="bio-value">{pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                </div>
                                <div className="bio-row">
                                    <span className="bio-label">Tanggal Lahir</span>
                                    <span className="bio-value">
                                        {pasien.tanggal_lahir ? new Date(pasien.tanggal_lahir).toLocaleDateString('id-ID') : '-'}
                                    </span>
                                </div>
                                <div className="bio-row">
                                    <span className="bio-label">Alamat</span>
                                    <span className="bio-value">{pasien.alamat || '-'}</span>
                                </div>
                                {/* Alergi highlight container */}
                                <div className="mt-6 p-4 bg-danger-light border-danger-soft rounded text-danger">
                                    <div className="font-bold mb-1 flex items-center gap-2"><FiActivity /> Peringatan Alergi:</div>
                                    <div>{pasien.alergi || 'Tidak ada riwayat alergi obat tercatat.'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel Kanan - Riwayat Kunjungan */}
                    <div className="col-span-2">
                        <div className="card h-full riwayat-card">
                            <h3 className="font-bold mb-4 flex items-center gap-2 border-b pb-3">
                                <FiClock className="text-primary" /> Riwayat Kunjungan & Pemeriksaan
                            </h3>

                            {riwayat.length === 0 ? (
                                <div className="text-center p-8 text-muted">
                                    <FiFileText size={48} opacity={0.3} className="mx-auto mb-3" />
                                    <p>Belum ada riwayat kunjungan tercatat (Pasien Baru).</p>
                                </div>
                            ) : (
                                <div className="timeline">
                                    {riwayat.map((rm) => (
                                        <div key={rm.id} className="timeline-item shadow-sm">
                                            <div className="timeline-date">
                                                {new Date(rm.tanggal_kunjungan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                            <div className="timeline-content border p-4 rounded bg-white">
                                                <div className="flex-between mb-3 border-b pb-2">
                                                    <span className="font-bold text-primary">{rm.nama_poli}</span>
                                                    <span className="text-sm text-muted">Dokter: {rm.nama_dokter}</span>
                                                </div>

                                                <div className="mb-2"><strong>Keluhan: </strong>{rm.keluhan}</div>
                                                <div className="mb-2"><strong>Diagnosa: </strong>{rm.diagnosa} {rm.kode_icd10 && `(ICD-10: ${rm.kode_icd10})`}</div>

                                                <div className="grid-vital mt-3 bg-slate-50 p-2 rounded text-sm">
                                                    <div><span className="text-muted">TD:</span> {rm.tekanan_darah || '-'} mmHg</div>
                                                    <div><span className="text-muted">Suhu:</span> {rm.suhu_tubuh || '-'} °C</div>
                                                    <div><span className="text-muted">Nadi:</span> {rm.nadi || '-'} bpm</div>
                                                    <div><span className="text-muted">BB:</span> {rm.berat_badan || '-'} kg</div>
                                                </div>

                                                {rm.tindakan && <div className="mt-3 text-sm"><strong>Tindakan:</strong> {rm.tindakan}</div>}

                                                {rm.resep && rm.resep.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t text-sm bg-blue-50 p-3 rounded">
                                                        <strong className="block mb-2 text-blue-700">Resep Obat:</strong>
                                                        <ul className="pl-5 list-disc m-0">
                                                            {rm.resep.map((r) => (
                                                                <li key={r.id} className="mb-1">
                                                                    {r.nama_obat} ({r.jumlah} buah) - <i className="text-muted">{r.aturan_pakai}</i> {r.keterangan && `[${r.keterangan}]`}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RekamMedis;
