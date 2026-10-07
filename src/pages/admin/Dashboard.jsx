import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { FiUsers, FiActivity, FiCheckCircle, FiBriefcase } from 'react-icons/fi';
import api from '../../services/api';
import './Admin.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [kunjunganBulanan, setKunjunganBulanan] = useState([]);
    const [kunjunganPoli, setKunjunganPoli] = useState([]);
    const [demografi, setDemografi] = useState({ gender: [], usia: [] });
    const [loading, setLoading] = useState(true);

    // Colors for Recharts
    const COLORS = ['#047857', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const GENDER_COLORS = ['#3b82f6', '#ec4899']; // Blue for Male, Pink for Female

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, bulananRes, poliRes, demoRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/kunjungan-bulanan'),
                    api.get('/dashboard/kunjungan-poli'),
                    api.get('/dashboard/demografi')
                ]);

                setStats(statsRes.data);
                setKunjunganBulanan(bulananRes.data);
                setKunjunganPoli(poliRes.data.map(item => ({ name: item.nama_poli, value: item.total })));

                // Format Demographics
                const formattedGender = demoRes.data.gender.map(g => ({
                    name: g.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
                    value: g.total
                }));

                setDemografi({ gender: formattedGender, usia: demoRes.data.usia });
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="p-8 text-center text-muted">Memuat data analitik...</div>;

    return (
        <div className="admin-page animate-fade-in">
            <div className="page-header mb-6">
                <h1 className="page-title">Dashboard Analitik</h1>
                <p className="page-description">Ringkasan operasional Puskesmas hari ini</p>
            </div>

            {/* Overview Cards */}
            <div className="stats-grid grid-layout-4 mb-6">
                <div className="stat-card card">
                    <div className="stat-icon bg-primary-light text-primary"><FiUsers /></div>
                    <div className="stat-content">
                        <span className="stat-label">Total Pasien</span>
                        <span className="stat-value">{stats?.total_pasien || 0}</span>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><FiActivity /></div>
                    <div className="stat-content">
                        <span className="stat-label">Antrean Hari Ini</span>
                        <span className="stat-value">{stats?.antrean_hari_ini || 0}</span>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}><FiCheckCircle /></div>
                    <div className="stat-content">
                        <span className="stat-label">Selesai Berobat</span>
                        <span className="stat-value">{stats?.selesai_hari_ini || 0}</span>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: '#fce7f3', color: '#ec4899' }}><FiBriefcase /></div>
                    <div className="stat-content">
                        <span className="stat-label">Total Pegawai</span>
                        <span className="stat-value">{stats?.total_pegawai || 0}</span>
                    </div>
                </div>
            </div>

            <div className="grid-layout-2 mb-6 gap-6">
                {/* Chart 1: Kunjungan Bulanan (Line Chart) */}
                <div className="col-span-1 card">
                    <h3 className="chart-title">Tren Kunjungan Bulanan ({new Date().getFullYear()})</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={kunjunganBulanan} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Proporsi Kunjungan Poli (Pie Chart) */}
                <div className="col-span-1 card">
                    <h3 className="chart-title">Kunjungan Per Poliklinik (Tahun Ini)</h3>
                    <div className="chart-container flex items-center justify-center">
                        {kunjunganPoli.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={kunjunganPoli}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {kunjunganPoli.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value) => [value, 'Kunjungan']} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-muted">Data kunjungan poli belum tersedia</div>
                        )}

                        {/* Custom Legend */}
                        {kunjunganPoli.length > 0 && (
                            <div className="flex flex-col justify-center ml-4 gap-2">
                                {kunjunganPoli.map((entry, index) => (
                                    <div key={index} className="flex items-center text-sm">
                                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                        <span className="text-slate-600 truncate max-w-[120px]" title={entry.name}>{entry.name}</span>
                                        <span className="ml-2 font-bold">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid-layout-2 gap-6">
                {/* Chart 3: Demografi Usia (Bar Chart) */}
                <div className="col-span-1 card">
                    <h3 className="chart-title">Demografi Usia Pasien</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={demografi.usia} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="kelompok" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} angle={-25} textAnchor="end" />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                <RechartsTooltip cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="total" fill="#047857" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 4: Demografi Gender (Pie Chart) */}
                <div className="col-span-1 card">
                    <h3 className="chart-title">Demografi Jenis Kelamin</h3>
                    <div className="chart-container flex items-center justify-center pt-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={demografi.gender}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                                    labelLine={true}
                                >
                                    {demografi.gender.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(value) => [value, 'Orang']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
