import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiHome, FiDatabase, FiClock, FiLogOut, FiMenu, FiList } from 'react-icons/fi';
import './Layouts.css'; // Common layout styles

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: <FiHome /> },
        { path: '/admin/daftar-kunjungan', label: 'Daftar Kunjungan', icon: <FiList /> },
        { path: '/admin/master-data', label: 'Master Data', icon: <FiDatabase /> },
        { path: '/admin/absensi', label: 'Rekap Absensi', icon: <FiClock /> },
    ];

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-container">
                        <img src="/images/Icon.png" alt="SIM LENTERA" className="app-logo-sm" style={{ objectFit: 'contain', maxWidth: '100%', width: 'auto' }} />
                        <span className="badge badge-primary">Admin Panel</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {navItems.map((item) => (
                            <li key={item.path} className="nav-item">
                                <Link
                                    to={item.path}
                                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="avatar">{user.nama_lengkap.charAt(0)}</div>
                        <div className="user-details">
                            <span className="user-name">{user.nama_lengkap}</span>
                            <span className="user-role">Administrator</span>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>
                        <FiLogOut /> Keluar
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="topbar">
                    <button className="mobile-menu-btn">
                        <FiMenu size={24} />
                    </button>
                    <div className="topbar-right">
                        <span className="current-date">
                            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </header>

                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
