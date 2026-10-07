import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to dashboard or appropriate home based on role if not authorized
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'dokter' || user.role === 'perawat') return <Navigate to="/medis" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
