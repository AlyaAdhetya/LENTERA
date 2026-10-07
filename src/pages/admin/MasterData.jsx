import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import api from '../../services/api';

const MasterData = () => {
    const [activeTab, setActiveTab] = useState('pasien'); // pasien, pegawai, poli
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = `/${activeTab}`;
            if (search) url += `?search=${search}`;

            const response = await api.get(url);

            // Pasien returns {data, pagination}, others return array
            if (activeTab === 'pasien') {
                setData(response.data.data || []);
            } else {
                setData(response.data || []);
            }
        } catch (err) {
            console.error(`Error fetching ${activeTab}:`, err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Yakin ingin menghapus ${name}?`)) {
            try {
                await api.delete(`/${activeTab}/${id}`);
                fetchData();
                alert('Data berhasil dihapus');
            } catch (err) {
                alert('Gagal menghapus data. Mungkin data masih terikat dengan data lain (cth: antrean/rekam medis).');
            }
        }
    };

    return (
        <div className="admin-page animate-fade-in">
            <div className="page-header mb-6">
                <h1 className="page-title">Master Data</h1>
                <p className="page-description">Kelola data dasar sistem (Pasien, Pegawai, Poli)</p>
            </div>

            <div className="card">
                {/* Tabs */}
                <div className="border-b mb-6 flex gap-4">
                    {['pasien', 'pegawai', 'poli'].map(tab => (
                        <button
                            key={tab}
                            className={`pb-3 px-4 font-bold border-b-2 text-lg capitalize transition-colors ${activeTab === tab
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted hover:text-text-main'
                                }`}
                            onClick={() => { setActiveTab(tab); setSearch(''); }}
                        >
                            Data {tab}
                        </button>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex-between mb-6">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-[400px]">
                        <div className="input-group flex-1">
                            <span className="input-icon"><FiSearch /></span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder={`Cari nama ${activeTab}...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-secondary">Cari</button>
                    </form>

                    <button className="btn btn-primary" onClick={() => alert('Fitur form input belum diimplementasi di demo ini.')}>
                        <FiPlus /> Tambah {activeTab}
                    </button>
                </div>

                {/* Table View */}
                {loading ? (
                    <div className="p-8 text-center text-muted">Memuat data...</div>
                ) : data.length === 0 ? (
                    <div className="p-8 text-center border-dashed border-2 rounded-lg text-muted">
                        Tidak ada data {activeTab} ditemukan
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table w-full align-middle">
                            <thead>
                                {activeTab === 'pasien' && (
                                    <tr>
                                        <th>NRM / NIK</th>
                                        <th>Nama Lengkap</th>
                                        <th>L/P</th>
                                        <th>TTL / Usia</th>
                                        <th>No. HP</th>
                                        <th className="text-right">Aksi</th>
                                    </tr>
                                )}
                                {activeTab === 'pegawai' && (
                                    <tr>
                                        <th>NIP</th>
                                        <th>Nama Lengkap</th>
                                        <th>Jabatan</th>
                                        <th>Unit/Poli</th>
                                        <th>Akun User</th>
                                        <th className="text-right">Aksi</th>
                                    </tr>
                                )}
                                {activeTab === 'poli' && (
                                    <tr>
                                        <th>Nama Poli</th>
                                        <th>Status</th>
                                        <th>Jam Buka</th>
                                        <th>Kuota Harian</th>
                                        <th className="text-right">Aksi</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {activeTab === 'pasien' && data.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="font-bold text-primary">{item.nrm}</div>
                                            <div className="text-sm text-muted">{item.nik || '-'}</div>
                                        </td>
                                        <td className="font-bold">{item.nama_lengkap}</td>
                                        <td>{item.jenis_kelamin}</td>
                                        <td>
                                            <div>{item.tempat_lahir || '-'}</div>
                                            <div className="text-sm text-muted">
                                                {item.tanggal_lahir ? new Date(item.tanggal_lahir).toLocaleDateString('id-ID') : '-'}
                                            </div>
                                        </td>
                                        <td>{item.no_hp || '-'}</td>
                                        <td className="text-right">
                                            <div className="flex-end gap-2">
                                                <button className="btn btn-sm btn-outline"><FiEdit2 /></button>
                                                <button className="btn btn-sm btn-outline text-danger border-none" onClick={() => handleDelete(item.id, item.nama_lengkap)}><FiTrash2 /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'pegawai' && data.map(item => (
                                    <tr key={item.id}>
                                        <td className="font-bold">{item.nip || '-'}</td>
                                        <td>
                                            <div className="font-bold">{item.nama_lengkap}</div>
                                            <div className="text-sm text-muted">{item.no_hp || '-'}</div>
                                        </td>
                                        <td>{item.jabatan}</td>
                                        <td>{item.unit_kerja}</td>
                                        <td>
                                            {item.username ? (
                                                <span className="badge badge-success text-xs">Aktif ({item.role})</span>
                                            ) : (
                                                <span className="badge bg-slate-200 text-slate-500 text-xs">Belum Ada Akun</span>
                                            )}
                                        </td>
                                        <td className="text-right">
                                            <div className="flex-end gap-2">
                                                <button className="btn btn-sm btn-outline"><FiEdit2 /></button>
                                                <button className="btn btn-sm btn-outline text-danger border-none" onClick={() => handleDelete(item.id, item.nama_lengkap)}><FiTrash2 /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'poli' && data.map(item => (
                                    <tr key={item.id}>
                                        <td className="font-bold">{item.nama_poli}</td>
                                        <td>
                                            {item.is_active ?
                                                <span className="badge badge-success">Buka</span> :
                                                <span className="badge badge-danger">Tutup</span>
                                            }
                                        </td>
                                        <td>{item.jam_buka ? item.jam_buka.substring(0, 5) : '-'} - {item.jam_tutup ? item.jam_tutup.substring(0, 5) : '-'}</td>
                                        <td>{item.kuota_harian} Pasien/Hari</td>
                                        <td className="text-right">
                                            <div className="flex-end gap-2">
                                                <button className="btn btn-sm btn-outline"><FiEdit2 /></button>
                                                <button className="btn btn-sm btn-outline text-danger border-none" onClick={() => handleDelete(item.id, item.nama_poli)}><FiTrash2 /></button>
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

export default MasterData;
