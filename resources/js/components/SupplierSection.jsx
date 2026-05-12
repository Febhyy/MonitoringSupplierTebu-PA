import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import SupplierCard from './SupplierCard';

// showModal, onOpenModal, onCloseModal dikontrol dari Dashboard (parent)
function SupplierSection({ suppliers, onSupplierAdded, showModal, onOpenModal, onCloseModal }) {
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ nama_supplier: '', asal_kebun: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Lock scroll halaman saat modal terbuka
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showModal]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return suppliers.filter(
            (s) =>
                s.nama_supplier?.toLowerCase().includes(q) ||
                s.asal_kebun?.toLowerCase().includes(q)
        );
    }, [suppliers, search]);

    const handleOpen = () => {
        setForm({ nama_supplier: '', asal_kebun: '' });
        setError('');
        setEditMode(false);
        setSelectedSupplierId(null);
        setDeleteModal(false);
        onOpenModal('/tambahsupplier');
    };

    const handleOpenEdit = (supplier) => {
        setForm({ nama_supplier: supplier.nama_supplier, asal_kebun: supplier.asal_kebun });
        setError('');
        setEditMode(true);
        setSelectedSupplierId(supplier.id_supplier);
        setDeleteModal(false);
        onOpenModal(`/supplier/edit/${supplier.id_supplier}`);
    };

    const handleOpenDelete = (supplier) => {
        setSelectedSupplierId(supplier.id_supplier);
        setDeleteModal(true);
        onOpenModal(`/supplier/hapus/${supplier.id_supplier}`);
    };

    const handleClose = () => {
        setError('');
        setDeleteModal(false);
        onCloseModal();
    };

    const handleSave = async () => {
        if (!form.nama_supplier.trim()) {
            setError('Nama pemilik wajib diisi.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            if (editMode) {
                await axios.put(`/api/supplier/${selectedSupplierId}`, form);
            } else {
                await axios.post('/api/supplier/public', form);
            }
            handleClose();
            if (onSupplierAdded) onSupplierAdded();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan data.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await axios.delete(`/api/supplier/${selectedSupplierId}`);
            handleClose();
            if (onSupplierAdded) onSupplierAdded();
        } catch (err) {
            alert('Gagal menghapus data supplier.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="mt-10">
            {/* Search Bar */}
            <div className="relative mb-4">
                <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari Supplier berdasarkan nama atau lokasi.."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                />
            </div>

            {/* Tombol Add Supplier */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleOpen}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl shadow transition-colors text-sm"
                >
                    + Add Supplier
                </button>
            </div>

            {/* Grid Kartu Supplier */}
            {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-12">
                    {search ? 'Supplier tidak ditemukan.' : 'Belum ada data supplier.'}
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((supplier) => (
                        <SupplierCard key={supplier.id_supplier} supplier={supplier} onEdit={handleOpenEdit} onDelete={handleOpenDelete} />
                    ))}
                </div>
            )}

            {/* ===== MODALS ===== */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                    onClick={handleClose}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {deleteModal ? (
                            <>
                                <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
                                    Konfirmasi Hapus
                                </h2>
                                <p className="text-center text-gray-600 mb-6">
                                    Apakah Anda yakin ingin menghapus supplier ini? Semua data terkait mungkin akan ikut terhapus.
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={handleClose}
                                        className="px-5 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        {deleting ? 'Menghapus...' : 'Hapus'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                                    {editMode ? 'Edit Pemilik Tebu' : 'Data Pemilik Tebu'}
                                </h2>

                                {error && (
                                    <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-2 mb-4 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Nama Pemilik */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Pemilik
                                    </label>
                                    <input
                                        type="text"
                                        value={form.nama_supplier}
                                        onChange={(e) => setForm({ ...form, nama_supplier: e.target.value })}
                                        placeholder="Masukkan nama lengkap pemilik"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                </div>

                                {/* Asal Kebun */}
                                <div className="mb-7">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Asal Kebun / lokasi
                                    </label>
                                    <input
                                        type="text"
                                        value={form.asal_kebun}
                                        onChange={(e) => setForm({ ...form, asal_kebun: e.target.value })}
                                        placeholder="Contoh : Kebun Sukamaju, Lampung Tengah"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                </div>

                                {/* Tombol */}
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={handleClose}
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
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SupplierSection;
