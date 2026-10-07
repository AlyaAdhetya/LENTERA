import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiPlus, FiTrash2, FiActivity } from 'react-icons/fi';
import api from '../../services/api';
import './Medical.css';

const InputPemeriksaan = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { pasienId } = useParams();

    const antrean = location.state?.antrean || null;
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        keluhan: '',
        diagnosa: '',
        kode_icd10: '',
        tindakan: '',
        catatan: '',
        tekanan_darah: '',
        suhu_tubuh: '',
        nadi: '',
        berat_badan: '',
        tinggi_badan: ''
    });

    const [resepList, setResepList] = useState([]);
    const [currentResep, setCurrentResep] = useState({
        nama_obat: '', dosis: '', aturan_pakai: '', jumlah: 1, keterangan: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handeResepChange = (e) => {
        const { name, value } = e.target;
        setCurrentResep(prev => ({ ...prev, [name]: value }));
    };

    const handleAddResep = (e) => {
        e.preventDefault();
        if (!currentResep.nama_obat) return;

        setResepList([...resepList, { ...currentResep, id: Date.now() }]);
        setCurrentResep({ nama_obat: '', dosis: '', aturan_pakai: '', jumlah: 1, keterangan: '' });
    };

    const handleRemoveResep = (id) => {
        setResepList(resepList.filter(r => r.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.diagnosa || !formData.keluhan) {
            alert('Keluhan dan Diagnosa wajb diisi!');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                pasien_id: pasienId,
                antrean_id: antrean?.id,
                poli_id: antrean?.poli_id,
                resep: resepList
            };

            await api.post('/rekam-medis', payload);
            alert('Data pemeriksaan berhasil disimpan!');
            navigate('/medis'); // Kembali ke halaman antrean
        } catch (err) {
            alert(err.response?.data?.error || 'Gagal menyimpan data pemeriksaan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="medical-page animate-fade-in">
            <div className="page-header mb-6">
                <h1 className="page-title">Input Pemeriksaan (RME)</h1>
                {antrean && <p className="page-description">Pasien: <strong>{antrean.nama_pasien}</strong> (Antrean No. {antrean.nomor_antrean})</p>}
            </div>

            <form onSubmit={handleSubmit} className="pemeriksaan-form-container grid-layout-2">
                {/* Kolom Kiri - Data Klinis */}
                <div className="col-span-1 flex flex-col gap-6">
                    <div className="card">
                        <h3 className="font-bold mb-4 flex items-center border-b pb-2"><FiActivity className="mr-2" /> Tanda-tanda Vital</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group mb-0">
                                <label className="form-label text-sm">Tekanan Darah (mmHg)</label>
                                <input type="text" className="form-control form-control-sm" name="tekanan_darah" value={formData.tekanan_darah} onChange={handleChange} placeholder="Contoh: 120/80" />
                            </div>
                            <div className="form-group mb-0">
                                <label className="form-label text-sm">Suhu (°C)</label>
                                <input type="number" step="0.1" className="form-control form-control-sm" name="suhu_tubuh" value={formData.suhu_tubuh} onChange={handleChange} placeholder="Contoh: 36.5" />
                            </div>
                            <div className="form-group mb-0">
                                <label className="form-label text-sm">Nadi (bpm)</label>
                                <input type="number" className="form-control form-control-sm" name="nadi" value={formData.nadi} onChange={handleChange} placeholder="Contoh: 80" />
                            </div>
                            <div className="form-group mb-0">
                                <label className="form-label text-sm">Berat Badan (kg)</label>
                                <input type="number" step="0.1" className="form-control form-control-sm" name="berat_badan" value={formData.berat_badan} onChange={handleChange} placeholder="Contoh: 65.5" />
                            </div>
                        </div>
                    </div>

                    <div className="card fill-height">
                        <h3 className="font-bold mb-4 border-b pb-2">Hasil Pemeriksaan Klinis</h3>

                        <div className="form-group">
                            <label className="form-label">Keluhan Utama <span className="text-danger">*</span></label>
                            <textarea className="form-control" rows="3" name="keluhan" value={formData.keluhan} onChange={handleChange} required></textarea>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="form-group col-span-2">
                                <label className="form-label">Diagnosa Pasti <span className="text-danger">*</span></label>
                                <input type="text" className="form-control" name="diagnosa" value={formData.diagnosa} onChange={handleChange} required />
                            </div>
                            <div className="form-group col-span-1">
                                <label className="form-label">Kode ICD-10</label>
                                <input type="text" className="form-control" name="kode_icd10" value={formData.kode_icd10} onChange={handleChange} placeholder="Contoh: J00" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tindakan Medis</label>
                            <textarea className="form-control" rows="2" name="tindakan" value={formData.tindakan} onChange={handleChange} placeholder="Isi jika ada tindakan yang dilakukan"></textarea>
                        </div>

                        <div className="form-group mb-0">
                            <label className="form-label">Catatan Tambahan</label>
                            <textarea className="form-control" rows="2" name="catatan" value={formData.catatan} onChange={handleChange}></textarea>
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan - E-Resep */}
                <div className="col-span-1 flex flex-col gap-6">
                    <div className="card fill-height flex flex-col">
                        <h3 className="font-bold mb-4 flex-between border-b pb-2">
                            <span>E-Resep Obat</span>
                            <span className="badge badge-primary">{resepList.length} Obat</span>
                        </h3>

                        {/* Form Tambah Resep */}
                        <div className="add-resep-box bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300 mb-4">
                            <div className="grid grid-cols-4 gap-3 mb-3">
                                <div className="form-group mb-0 col-span-3">
                                    <label className="form-label text-xs">Nama Obat</label>
                                    <input type="text" className="form-control form-control-sm" name="nama_obat" value={currentResep.nama_obat} onChange={handeResepChange} placeholder="Contoh: Paracetamol 500mg" />
                                </div>
                                <div className="form-group mb-0 col-span-1">
                                    <label className="form-label text-xs">Jumlah</label>
                                    <input type="number" min="1" className="form-control form-control-sm" name="jumlah" value={currentResep.jumlah} onChange={handeResepChange} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="form-group mb-0">
                                    <label className="form-label text-xs">Aturan Pakai</label>
                                    <select className="form-control form-control-sm" name="aturan_pakai" value={currentResep.aturan_pakai} onChange={handeResepChange}>
                                        <option value="">-- Pilih Aturan --</option>
                                        <option value="3 x 1 Sesudah Makan">3 x 1 Sesudah Makan</option>
                                        <option value="3 x 1 Sebelum Makan">3 x 1 Sebelum Makan</option>
                                        <option value="2 x 1 Sesudah Makan">2 x 1 Sesudah Makan</option>
                                        <option value="1 x 1 Sesudah Makan">1 x 1 Sesudah Makan</option>
                                        <option value="Bila Perlu / Demam">Bila Perlu / Demam</option>
                                        <option value="Lainnya">Lainnya...</option>
                                    </select>
                                </div>
                                <div className="form-group mb-0">
                                    <label className="form-label text-xs">Keterangan / Dosis Khusus</label>
                                    <input type="text" className="form-control form-control-sm" name="keterangan" value={currentResep.keterangan} onChange={handeResepChange} placeholder="Opsional" />
                                </div>
                            </div>
                            <button type="button" onClick={handleAddResep} className="btn btn-sm btn-outline text-primary border-primary w-full" disabled={!currentResep.nama_obat}>
                                <FiPlus /> Tambah ke Resep
                            </button>
                        </div>

                        {/* List Resep */}
                        <div className="resep-items flex-1 overflow-y-auto min-h-[200px]">
                            {resepList.length === 0 ? (
                                <div className="text-center text-muted p-4 text-sm mt-4">Belum ada obat yang diresepkan.</div>
                            ) : (
                                <ul className="list-none p-0 m-0">
                                    {resepList.map((resep, index) => (
                                        <li key={resep.id} className="p-3 border-b border-slate-100 flex justify-between items-start hover:bg-slate-50 transition-colors">
                                            <div>
                                                <div className="font-bold flex items-center gap-2">
                                                    <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{index + 1}</span>
                                                    {resep.nama_obat} <span className="badge ml-2" style={{ background: '#e0f2fe', color: '#0369a1' }}>{resep.jumlah}</span>
                                                </div>
                                                <div className="text-sm mt-1 text-slate-600 pl-7"><i className="font-medium">{resep.aturan_pakai}</i> {resep.keterangan && `- ${resep.keterangan}`}</div>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveResep(resep.id)} className="text-danger hover:bg-red-50 p-2 rounded" title="Hapus Obat">
                                                <FiTrash2 size={16} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t">
                            <button type="submit" className="btn btn-primary btn-lg w-full flex-center font-bold" disabled={loading}>
                                {loading ? 'Menyimpan...' : <><FiSave size={20} className="mr-2" /> Simpan Pemeriksaan & Resep</>}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default InputPemeriksaan;
