import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './pages/Login'; // DINONAKTIFKAN
import Dashboard from './pages/Dashboard';
import PemasokanPage from './pages/PemasokanPage';
import PengirimanDetailPage from './pages/PengirimanDetailPage';
// import ProtectedRoute from './components/ProtectedRoute'; // DINONAKTIFKAN

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                {/* <Route path="/login" element={<Login />} /> */ /* DINONAKTIFKAN */}
                {/* Semua route dashboard, supplier, tambahsupplier ditangani oleh Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/supplier" element={<Dashboard />} />
                <Route path="/tambahsupplier" element={<Dashboard />} />
                <Route path="/pemasokan/:id_supplier" element={<PemasokanPage />} />
                <Route path="/pemasokan/:id_supplier/edit/:id_transaksi" element={<PemasokanPage />} />
                <Route path="/pengiriman/:id_transaksi" element={<PengirimanDetailPage />} />
            </Routes>
        </BrowserRouter>
    );
}

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);