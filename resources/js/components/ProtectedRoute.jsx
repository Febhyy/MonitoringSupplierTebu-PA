/**
 * ============================================================================
 * NON-AKTIF (DISABLED)
 * ============================================================================
 * Komponen ProtectedRoute ini saat ini dinonaktifkan karena sistem monitoring kualitas tebu
 * tidak menggunakan pembatasan akses/autentikasi masuk (login).
 * File ini dipertahankan hanya sebagai referensi masa depan.
 * ============================================================================
 */

import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
