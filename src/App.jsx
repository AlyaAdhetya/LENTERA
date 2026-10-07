import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import DaftarAntrean from './pages/public/DaftarAntrean';
import MonitorAntrean from './pages/public/MonitorAntrean';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Medical Staff Pages
import MedicalLayout from './layouts/MedicalLayout';
import AntreanPoli from './pages/medis/AntreanPoli';
import RekamMedis from './pages/medis/RekamMedis';
import InputPemeriksaan from './pages/medis/InputPemeriksaan';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import MasterData from './pages/admin/MasterData';
import Absensi from './pages/admin/Absensi';
import DaftarKunjungan from './pages/admin/DaftarKunjungan';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/daftar-antrean" element={<DaftarAntrean />} />
          <Route path="/monitor-antrean" element={<MonitorAntrean />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Medical Staff Routes */}
          <Route path="/medis" element={
            <ProtectedRoute allowedRoles={['dokter', 'perawat']}>
              <MedicalLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AntreanPoli />} />
            <Route path="rekam-medis" element={<RekamMedis />} />
            <Route path="periksa/:pasienId" element={<InputPemeriksaan />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="daftar-kunjungan" element={<DaftarKunjungan />} />
            <Route path="master-data" element={<MasterData />} />
            <Route path="absensi" element={<Absensi />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
