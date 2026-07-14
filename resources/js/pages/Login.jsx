/**
 * ============================================================================
 * NON-AKTIF (DISABLED)
 * ============================================================================
 * Halaman Login ini saat ini dinonaktifkan karena sistem monitoring kualitas tebu
 * tidak menggunakan sistem autentikasi masuk (login).
 * Rute ke halaman ini di resources/js/app.jsx telah dinonaktifkan.
 * ============================================================================
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/api/login', {
                username,
                password
            });

            if (response.data.success) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', response.data.username);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Username atau password salah!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-5"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full animate-slideUp">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-10 text-center">
                    <div className="text-6xl mb-4">🌾</div>
                    <h1 className="text-3xl font-bold mb-2">Sistem Klasifikasi</h1>
                    <p className="text-sm opacity-90">Monitoring Kualitas Tebu</p>
                </div>

                <div className="p-10">
                    {error && (
                        <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 mb-5 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base bg-gray-50 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                                placeholder="Masukkan username"
                                autoFocus
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base bg-gray-50 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                                placeholder="Masukkan password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Loading...' : 'Login'}
                        </button>
                    </form>
                </div>

                <div className="text-center py-5 bg-gray-50 text-xs text-gray-600">
                    &copy; 2026 Sistem Klasifikasi Kualitas Tebu
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideUp {
                    animation: slideUp 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}

export default Login;
