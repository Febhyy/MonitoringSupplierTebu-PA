import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageHeader from '../components/PageHeader';

// Format tanggal: "19 Jun 2025"
function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Format berat: "2.500 Kg"
function formatBerat(berat) {
    if (!berat) return '-';
    return Number(berat).toLocaleString('id-ID') + ' Kg';
}

// Inisial dari nama
function getInitial(name) {
    return name ? name.charAt(0).toUpperCase() : 'S';
}

function PemasokanPage() {
    const { id_supplier } = useParams();
    const navigate = useNavigate();

    const [supplier, setSupplier] = useState(null);
    const [transaksi, setTransaksi] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal Add/Edit Pengiriman
    const [showModal, setShowModal] = useState(false);
    const [editingTransaksi, setEditingTransaksi] = useState(null); // null = mode add

    // Tanggal & jam minimum (tidak boleh sebelum sekarang)
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toTimeString().slice(0, 5);

    const [form, setForm] = useState({
        berat_tebu: '',
        no_kendaraan: '',
        tanggal_masuk: todayStr,
        jam_masuk: nowTimeStr,
        catatan: '',
        status: 'pending',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Jam minimum: jika tanggal = hari ini, min jam = sekarang; jika hari lain tidak ada batasan
    const minJam = form.tanggal_masuk === todayStr ? nowTimeStr : '00:00';

    useEffect(() => {
        fetchData();
    }, [id_supplier]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [supplierRes, transaksiRes] = await Promise.all([
                axios.get(`/api/supplier/${id_supplier}`),
                axios.get(`/api/supplier/${id_supplier}/transaksi`),
            ]);
            if (supplierRes.data.success) setSupplier(supplierRes.data.data);
            if (transaksiRes.data.success) setTransaksi(transaksiRes.data.data);
        } catch (err) {
            console.error('Gagal memuat data', err);
        } finally {
            setLoading(false);
        }
    };

    const totalPengiriman = transaksi.length;
    const totalSelesai = transaksi.filter(t => t.status === 'selesai').length;

    // Lock scroll saat modal terbuka
    useEffect(() => {
        document.body.style.overflow = showModal ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showModal]);

    const handleOpenModal = () => {
        // Hitung waktu saat modal dibuka (bukan saat komponen mount)
        const now = new Date();
        const nowDate = now.toISOString().split('T')[0];
        const nowTime = now.toTimeString().slice(0, 5);
        setEditingTransaksi(null);
        setForm({
            berat_tebu: '',
            no_kendaraan: '',
            tanggal_masuk: nowDate,
            jam_masuk: nowTime,
            catatan: '',
            status: 'pending',
        });
        setError('');
        setShowModal(true);
    };

    const handleEdit = (t) => {
        setEditingTransaksi(t);
        setForm({
            berat_tebu: t.tebu?.berat_tebu ?? '',
            no_kendaraan: t.tebu?.no_kendaraan ?? '',
            tanggal_masuk: t.tanggal_masuk?.split('T')[0] ?? todayStr,
            jam_masuk: t.jam_masuk?.slice(0, 5) ?? '',
            catatan: t.catatan ?? '',
            status: t.status ?? 'pending',
        });
        setError('');
        // Ubah URL ke /pemasokan/{id_supplier}/edit/{id_transaksi}
        window.history.replaceState(null, '', `/pemasokan/${id_supplier}/edit/${t.id_transaksi}`);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setError('');
        // Kembalikan URL ke /pemasokan/{id_supplier}
        window.history.replaceState(null, '', `/pemasokan/${id_supplier}`);
    };

    const handleSave = async () => {
        if (!form.berat_tebu || !form.no_kendaraan) {
            setError('Berat tebu dan No. Kendaraan wajib diisi.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            if (editingTransaksi) {
                // Mode EDIT — update tebu + transaksi
                await axios.put(`/api/transaksi/${editingTransaksi.id_transaksi}`, {
                    id_supplier: id_supplier,
                    id_tebu: editingTransaksi.id_tebu,
                    berat_tebu: form.berat_tebu,
                    no_kendaraan: form.no_kendaraan,
                    tanggal_masuk: form.tanggal_masuk,
                    jam_masuk: form.jam_masuk,
                    catatan: form.catatan,
                    status: form.status,
                });
            } else {
                // Mode ADD — buat tebu + transaksi baru
                await axios.post('/api/transaksi/public', {
                    ...form,
                    id_supplier: id_supplier,
                });
            }
            handleCloseModal();
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan data.');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateStatus = async (id_transaksi, newStatus) => {
        try {
            await axios.put(`/api/transaksi/${id_transaksi}/status`, { status: newStatus });
            setTransaksi(prev =>
                prev.map(t =>
                    t.id_transaksi === id_transaksi ? { ...t, status: newStatus } : t
                )
            );
        } catch (err) {
            console.error('Gagal update status', err);
        }
    };

    const handleDelete = async (id_transaksi) => {
        if (!window.confirm('Hapus pengiriman ini?')) return;
        try {
            const res = await axios.delete(`/api/transaksi/${id_transaksi}`);
            if (res.data.success) {
                setTransaksi(prev => prev.filter(t => t.id_transaksi !== id_transaksi));
            } else {
                alert('Gagal menghapus: ' + (res.data.message || 'Unknown error'));
            }
        } catch (err) {
            alert('Gagal menghapus: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <PageHeader
                    title="Pemasokan"
                    subtitle="Sistem Monitoring Supplier Tebu"
                />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">Memuat data...</p>
                </div>
            </div>
        );
    }

    if (!supplier) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <PageHeader title="Pemasokan" subtitle="Sistem Monitoring Supplier Tebu" />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-red-500">Supplier tidak ditemukan.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <PageHeader
                title={`Pemasokan - ${supplier.nama_supplier}`}
                subtitle={supplier.asal_kebun || 'Sistem Monitoring Supplier Tebu'}
            />

            {/* Breadcrumb */}
            <div className="px-8 py-3 bg-white border-b border-gray-200 flex items-center gap-2 text-sm text-gray-500">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                    Dashboard
                </button>
                <span> &gt; </span>
                <span className="text-gray-700 font-medium">{supplier.nama_supplier}</span>
            </div>

            <main className="flex-1 p-8">
                {/* Info Card Supplier */}
                <div className="bg-gray-100 rounded-xl shadow-sm p-6 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gray-700 text-white flex items-center justify-center text-2xl font-bold">
                            {getInitial(supplier.nama_supplier)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{supplier.nama_supplier}</h2>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                {supplier.asal_kebun}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-8 text-center">
                        <div>
                            <div className="text-3xl font-bold text-gray-800">{totalPengiriman}</div>
                            <div className="text-xs text-gray-500 mt-1">Pengiriman</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-800">{totalSelesai}</div>
                            <div className="text-xs text-gray-500 mt-1">Selesai</div>
                        </div>
                    </div>
                </div>

                {/* Tombol Add Pengiriman */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={handleOpenModal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl shadow transition-colors text-sm"
                    >
                        + Add Pengiriman
                    </button>
                </div>

                {/* Tabel Pengiriman */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ backgroundColor: '#1e3a5f' }} className="text-white">
                                <th className="px-6 py-4 text-left font-semibold">Informasi Pengiriman</th>
                                <th className="px-6 py-4 text-left font-semibold">Berat (Kg)</th>
                                <th className="px-6 py-4 text-left font-semibold">Tanggal</th>
                                <th className="px-6 py-4 text-left font-semibold">Status</th>
                                <th className="px-6 py-4 text-left font-semibold">NIR</th>
                                <th className="px-6 py-4 text-center font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transaksi.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-400">
                                        Belum ada data pengiriman.
                                    </td>
                                </tr>
                            ) : (
                                transaksi.map((t, idx) => (
                                    <tr
                                        key={t.id_transaksi}
                                        className="border-t border-gray-100 hover:bg-blue-50 transition-colors"
                                    >
                                        {/* Informasi Pengiriman */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-800">
                                                        Pengiriman #{t.id_transaksi}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        {t.jam_masuk?.slice(0, 5)} &mdash; {t.tebu?.no_kendaraan || '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Berat */}
                                        <td className="px-6 py-4 font-medium text-gray-700">
                                            {formatBerat(t.tebu?.berat_tebu)}
                                        </td>

                                        {/* Tanggal */}
                                        <td className="px-6 py-4 text-gray-500">
                                            {formatTanggal(t.tanggal_masuk)}
                                        </td>

                                        {/* Status — bisa diklik untuk toggle */}
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleUpdateStatus(
                                                    t.id_transaksi,
                                                    t.status === 'selesai' ? 'pending' : 'selesai'
                                                )}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${t.status === 'selesai'
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                    }`}
                                            >
                                                {t.status === 'selesai' ? 'Selesai' : 'Pending'}
                                            </button>
                                        </td>

                                        {/* NIR — dummy dulu */}
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {t.status === 'selesai'
                                                ? '18.5% | 16,3% | 8,9%'
                                                : <span className="text-gray-300">—</span>
                                            }
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                {/* Detail */}
                                                <button
                                                    onClick={() => navigate(`/pengiriman/${t.id_transaksi}`)}
                                                    className="text-blue-500 hover:text-blue-700 transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                {/* Edit */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(t); }}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                                    </svg>
                                                </button>
                                                {/* Hapus */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(t.id_transaksi); }}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Hapus"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* ===== MODAL Add Pengiriman ===== */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                            {editingTransaksi ? 'Edit Pengiriman' : 'Data Pemasokan'}
                        </h2>

                        {error && (
                            <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-2 mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Berat Tebu */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Berat Tebu (Kg)</label>
                                <input
                                    type="number"
                                    value={form.berat_tebu}
                                    onChange={e => setForm({ ...form, berat_tebu: e.target.value })}
                                    placeholder="2.500"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                            {/* No. Kendaraan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">No. Kendaraan</label>
                                <input
                                    type="text"
                                    value={form.no_kendaraan}
                                    onChange={e => setForm({ ...form, no_kendaraan: e.target.value })}
                                    placeholder="Contoh : BM 6789 PA"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                            {/* Tanggal Masuk */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Masuk</label>
                                <input
                                    type="date"
                                    value={form.tanggal_masuk}
                                    onChange={e => setForm({ ...form, tanggal_masuk: e.target.value })}
                                    min={todayStr}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                            {/* Jam Masuk */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jam Masuk</label>
                                <input
                                    type="time"
                                    value={form.jam_masuk}
                                    onChange={e => setForm({ ...form, jam_masuk: e.target.value })}
                                    min={minJam}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                        </div>

                        {/* Catatan */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan</label>
                            <textarea
                                value={form.catatan}
                                onChange={e => setForm({ ...form, catatan: e.target.value })}
                                placeholder="Catatan khusus untuk kondisi tebu ataupun informasi tambahan lainnya"
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                            />
                        </div>

                        {/* Status */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                            >
                                <option value="pending">Pending</option>
                                <option value="selesai">Selesai</option>
                            </select>
                        </div>

                        {/* Tombol */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-5 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Menyimpan...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PemasokanPage;
