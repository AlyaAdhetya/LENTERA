import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiDownload, FiMapPin, FiCamera } from 'react-icons/fi';
import api from '../../services/api';
import './Admin.css';

const Absensi = () => {
    const [rekap, setRekap] = useState({ data: [], summary: [] });
    const [loading, setLoading] = useState(true);

    // Filter states
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    const months = [
        { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' }, { value: 3, label: 'Maret' },
        { value: 4, label: 'April' }, { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' }, { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' }, { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
    ];

    const fetchRekap = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/absensi/rekap?bulan=${selectedMonth}&tahun=${selectedYear}`);
            setRekap(response.data);
        } catch (err) {
            console.error('Error fetching absensi:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRekap();
    }, [selectedMonth, selectedYear]);

    // Format time helper (HH:MM)
    const formatTime = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'hadir': return <span className="badge badge-success">Hadir</span>;
            case 'izin': return <span className="badge badge-primary">Izin</span>;
            case 'sakit': return <span className="badge badge-warning">Sakit</span>;
            case 'alpha': return <span className="badge badge-danger">Alpha</span>;
            case 'cuti': return <span className="badge bg-slate-200 text-slate-700">Cuti</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    return (
        <div className="admin-page animate-fade-in">
            <div className="page-header flex-between mb-6">
                <div>
                    <h1 className="page-title">Rekapitulasi Absensi</h1>
                    <p className="page-description">Monitoring kehadiran pegawai terintegrasi dari Android (Expo Go)</p>
                </div>
                <div className="flex gap-3">
                    <select
                        className="form-control"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        style={{ width: '150px' }}
                    >
                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select
                        className="form-control"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        style={{ width: '100px' }}
                    >
                        {[today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].map(y =>
                            <option key={y} value={y}>{y}</option>
                        )}
                    </select>
                    <button className="btn btn-outline border-slate-300">
                        <FiDownload /> Export
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="card p-8 text-center text-muted">Memuat data absensi...</div>
            ) : (
                <>
                    {/* Summary / Rekapitulasi - Tabular View */}
                    <div className="card mb-6 overflow-hidden">
                        <h3 className="font-bold border-b p-4 m-0 bg-slate-50 flex items-center gap-2">
                            <FiCalendar /> Ringkasan Kehadiran Bulanan
                        </h3>
                        <div className="table-responsive">
                            <table className="table w-full text-sm m-0">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="py-2">Nama Pegawai</th>
                                        <th className="py-2 text-center text-success">Hadir</th>
                                        <th className="py-2 text-center text-primary">Izin</th>
                                        <th className="py-2 text-center text-warning">Sakit</th>
                                        <th className="py-2 text-center text-danger">Alpha</th>
                                        <th className="py-2 text-center text-slate-600">Cuti</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rekap.summary.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-4">Belum ada data absensi bulan ini</td></tr>
                                    ) : (
                                        rekap.summary.map(item => (
                                            <tr key={item.pegawai_id}>
                                                <td className="py-2">
                                                    <div className="font-medium">{item.nama_lengkap}</div>
                                                    <div className="text-xs text-muted">{item.jabatan}</div>
                                                </td>
                                                <td className="py-2 text-center font-bold text-success">{item.hadir}</td>
                                                <td className="py-2 text-center font-medium">{item.izin}</td>
                                                <td className="py-2 text-center font-medium">{item.sakit}</td>
                                                <td className="py-2 text-center font-bold text-danger">{item.alpha}</td>
                                                <td className="py-2 text-center font-medium">{item.cuti}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Detailed Log Table */}
                    <div className="card overflow-hidden">
                        <div className="flex-between border-b p-4 bg-slate-50">
                            <h3 className="font-bold m-0 flex items-center gap-2">
                                <FiClock /> Log Kehadiran Harian
                            </h3>
                            <span className="text-sm text-muted">Aplikasi Android Integrated</span>
                        </div>

                        <div className="table-responsive">
                            <table className="table w-full m-0 align-middle">
                                <thead>
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Pegawai</th>
                                        <th>Status</th>
                                        <th>Jam Masuk</th>
                                        <th>Jam Pulang</th>
                                        <th>Lokasi (GPS)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rekap.data.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-8 text-muted">Data log harian kosong</td></tr>
                                    ) : (
                                        rekap.data.map(log => (
                                            <tr key={log.id}>
                                                <td>{new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                                                <td>
                                                    <div className="font-medium whitespace-nowrap">{log.nama_lengkap}</div>
                                                </td>
                                                <td>{getStatusBadge(log.status)}</td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-medium ${log.jam_masuk ? 'text-text-main' : 'text-muted'}`}>
                                                            {formatTime(log.jam_masuk)}
                                                        </span>
                                                        {/* Icon camera untuk visual aja sbgi penanda ada foto (dari mobile) */}
                                                        {log.foto_masuk && <FiCamera className="text-primary text-xs cursor-pointer" title="Lihat Foto Masuk" />}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-medium ${log.jam_pulang ? 'text-text-main' : 'text-muted'}`}>
                                                            {formatTime(log.jam_pulang)}
                                                        </span>
                                                        {log.foto_pulang && <FiCamera className="text-primary text-xs cursor-pointer" title="Lihat Foto Pulang" />}
                                                    </div>
                                                </td>
                                                <td>
                                                    {log.lokasi_masuk ? (
                                                        <div className="text-xs flex items-start gap-1 text-slate-600 max-w-[200px]" title={log.lokasi_masuk}>
                                                            <FiMapPin className="shrink-0 mt-0.5" />
                                                            <span className="truncate">{log.lokasi_masuk}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted text-xs">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Absensi;
