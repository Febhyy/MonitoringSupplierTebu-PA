import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageHeader from '../components/PageHeader';

// ─────────────────────────── HELPERS ─────────────────────────────────
function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Interpretasi ditentukan dari % Rendemen dan Hasil Akhir
function getInterpretasi(rendemen, hasilAkhir) {
    const r = Number(rendemen);
    if (!rendemen || isNaN(r)) return null;

    if (hasilAkhir === 'Tebu Bersih') {
        if (r >= 9) return { label: 'Kualitas bagus', color: '#14532d', bg: '#dcfce7' };
        if (r >= 7.5) return { label: 'Cukup bagus', color: '#1d4ed8', bg: '#dbeafe' };
        return { label: 'Bersih tapi tidak manis', color: '#92400e', bg: '#fef3c7' };
    } else {
        if (r >= 9) return { label: 'Hasil bagus, tapi kotor', color: '#7c3aed', bg: '#ede9fe' };
        if (r >= 7.5) return { label: 'Hasil sedang + kotor', color: '#c2410c', bg: '#ffedd5' };
        return { label: 'Kualitas buruk', color: '#991b1b', bg: '#fee2e2' };
    }
}

// ─────────────────────────── MAIN PAGE ───────────────────────────────
export default function PengirimanDetailPage() {
    const { id_transaksi } = useParams();
    const navigate = useNavigate();

    // ── state ──
    const [transaksi, setTransaksi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [nir, setNir] = useState({ briks: '', pol: '', rendemen: '' });
    const [nirStatus, setNirStatus] = useState(''); // '' | 'loading' | 'saved' | 'updated'

    useEffect(() => {
        fetchTransaksi();

        const intervalId = setInterval(() => {
            fetchTransaksi(true);
        }, 3000);

        return () => clearInterval(intervalId);
    }, [id_transaksi]);

    // ── fetch data transaksi ASLI dari API ──
    const fetchTransaksi = async (isPolling = false) => {
        if (!isPolling) setLoading(true);
        if (!isPolling) setError('');
        try {
            const res = await axios.get(`/api/transaksi/${id_transaksi}`);
            if (res.data.success) {
                const data = res.data.data;
                setTransaksi(data);
                
                // Hanya update form NIR saat load awal untuk mencegah ketikan user terhapus
                if (data.hasil && !isPolling) {
                    setNir({
                        briks: data.hasil.nilai_brix ?? '',
                        pol: data.hasil.nilai_pol ?? '',
                        rendemen: data.hasil.nilai_rendemen ?? ''
                    });
                }
            } else {
                setError('Data pengiriman tidak ditemukan.');
            }
        } catch (err) {
            if (!isPolling) setError('Gagal memuat data pengiriman.');
            console.error(err);
        } finally {
            if (!isPolling) setLoading(false);
        }
    };

    // ── update status antrian ──
    const handleStatusAntrianChange = async (e) => {
        const newStatus = e.target.value;
        try {
            const res = await axios.put(`/api/transaksi/${id_transaksi}/status-antrian`, { status_antrian: newStatus });
            if (res.data.success) {
                setTransaksi({ ...transaksi, status_antrian: newStatus });
            }
        } catch (err) {
            alert('Gagal mengubah status antrian: ' + (err.response?.data?.message || err.message));
        }
    };

    // ── hapus klasifikasi ──
    const handleDeleteKlasifikasi = async (id_klasifikasi) => {
        try {
            const res = await axios.delete(`/api/klasifikasi/${id_klasifikasi}`);
            if (res.data.success) {
                fetchTransaksi(); // Langsung fetch ulang agar stats update
            }
        } catch (err) {
            alert('Gagal menghapus data klasifikasi: ' + (err.response?.data?.message || err.message));
        }
    };

    // ── simpan / update NIR ──
    const handleNirAction = async (type) => {
        if (!nir.pol || !nir.rendemen) {
            alert('% Pol dan % Rendemen wajib diisi!');
            return;
        }

        setNirStatus('loading');

        // Payload API mengikuti backend HasilController
        const payload = {
            id_transaksi: id_transaksi,
            nilai_brix: nir.briks || null,
            nilai_pol: nir.pol,
            nilai_rendemen: nir.rendemen,
        };

        try {
            let res;
            if (transaksi?.hasil && transaksi.hasil.id_hasil) {
                res = await axios.put(`/api/hasil/${transaksi.hasil.id_hasil}`, payload);
            } else {
                res = await axios.post('/api/hasil', payload);
            }

            if (res.data.success) {
                // Auto-update status to selesai
                if (transaksi?.status !== 'selesai') {
                    try {
                        await axios.put(`/api/transaksi/${id_transaksi}/status`, { status: 'selesai' });
                    } catch (e) {
                        console.error('Failed auto-update status lab', e);
                    }
                }
                
                setNirStatus(type === 'saved' ? 'saved' : 'updated');
                fetchTransaksi(); // Refresh transaksi untuk memuat hasil akhir & interpretasi dari backend
            } else {
                alert('Gagal: ' + (res.data.message || 'Terjadi kesalahan'));
                setNirStatus('');
            }
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(', ')
                : err.response?.data?.message || 'Gagal menyimpan data NIR.';
            alert(msg);
            setNirStatus('');
        } finally {
            setTimeout(() => setNirStatus(''), 2500);
        }
    };

    // ─────────────────────────── LOADING / ERROR ─────────────────────
    if (loading && !transaksi) {
        return (
            <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f1f5f9' }}>
                <PageHeader title="Detail Pengiriman" subtitle="Sistem Monitoring Supplier Tebu" />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500 animate-pulse">Memuat data...</p>
                </div>
            </div>
        );
    }

    if (error || !transaksi) {
        return (
            <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f1f5f9' }}>
                <PageHeader title="Detail Pengiriman" subtitle="Sistem Monitoring Supplier Tebu" />
                <div className="flex-1 flex items-center justify-center flex-col gap-3">
                    <p className="text-red-500">{error || 'Data tidak ditemukan.'}</p>
                    <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">← Kembali</button>
                </div>
            </div>
        );
    }

    // ─────────────────────────── DERIVED DATA ────────────────────────
    // Info transaksi
    const supplierNama = transaksi.supplier?.nama_supplier ?? '-';
    const idSupplier = transaksi.id_supplier;
    const beratDisplay = transaksi.tebu?.berat_tebu
        ? Number(transaksi.tebu.berat_tebu).toLocaleString('id-ID') + ' Kg'
        : '-';
    const noKendaraan = transaksi.tebu?.no_kendaraan ?? '-';
    const tanggalDisplay = formatTanggal(transaksi.tanggal_masuk);
    const waktuDisplay = transaksi.jam_masuk?.slice(0, 5) ?? '-';

    // Data Klasifikasi dan Hasil
    const klasifikasi = transaksi.klasifikasi || [];
    const savedHasil = transaksi.hasil;

    // Kalkulasi hasil klasifikasi frontend
    const total = klasifikasi.length;
    const bersihCount = klasifikasi.filter(k => k.label.toLowerCase().includes('bersih')).length;
    const kotorCount = klasifikasi.filter(k => k.label.toLowerCase().includes('kotor')).length;
    const avgAkurasi = total > 0
        ? Math.round(klasifikasi.reduce((s, k) => s + Number(k.akurasi), 0) / total)
        : 0;

    // Hasil Akhir diambil dari backend jika ada, jika tidak ada/kosong kembalikan '-'
    const hasilAkhir = total === 0 ? '-' : (savedHasil?.hasil_akhir || '-');

    // Interpretasi 
    // Walaupun backend sudah menghitung interpretasi_kualitas, kita bisa juga menghitung local / menampilkannya
    const kualitasInfo = getInterpretasi(savedHasil?.nilai_rendemen, hasilAkhir);
    const interpretasi = savedHasil?.interpretasi_kualitas || kualitasInfo?.label || null;

    // ─────────────────────────── RENDER ──────────────────────────────
    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f1f5f9' }}>

            {/* ══ HEADER ══ */}
            <PageHeader
                title={`Detail Pengiriman #${transaksi.id_transaksi}`}
                subtitle={`${supplierNama} - ${tanggalDisplay}`}
            />

            {/* ══ BREADCRUMB ══ */}
            <div className="px-8 py-2.5 bg-white border-b border-gray-200 flex items-center gap-2 text-sm text-gray-500">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v7a1 1 0 001 1h4v-5h2v5h4a1 1 0 001-1v-7h1a1 1 0 00.707-1.707l-7-7z" />
                    </svg>
                    Dashboard
                </button>
                <span className="text-gray-400">&gt;</span>
                <button
                    onClick={() => navigate(`/pemasokan/${idSupplier}`)}
                    className="hover:text-blue-600 transition-colors"
                >
                    {supplierNama}
                </button>
                <span className="text-gray-400">&gt;</span>
                <span className="text-gray-700 font-medium">Pengiriman #{transaksi.id_transaksi}</span>
            </div>

            {/* ══ MAIN ══ */}
            <main className="flex-1 px-8 py-6 max-w-5xl mx-auto w-full">

                {/* ── Info Card (data ASLI dari API) ── */}
                <div className="bg-white rounded-2xl shadow-sm px-6 py-4 mb-6 flex flex-wrap items-center gap-4">
                    <span className="text-lg font-bold text-gray-800">
                        Pengiriman #{transaksi.id_transaksi}
                    </span>
                    <div className="flex flex-wrap gap-6 ml-auto items-center">

                        {/* ── Status Antrian Dropdown ── */}
                        <div className="flex items-center gap-2 mr-2">
                            <span className="text-sm text-gray-500 font-medium">Status Antrian:</span>
                            <select
                                value={transaksi.status_antrian || 'menunggu'}
                                onChange={handleStatusAntrianChange}
                                className={`text-sm font-semibold rounded-lg px-3 py-1.5 outline-none cursor-pointer border focus:ring-2 transition-colors
                                    ${transaksi.status_antrian === 'menunggu' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 focus:ring-yellow-400' :
                                        transaksi.status_antrian === 'diproses' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-400' :
                                            'bg-green-50 text-green-700 border-green-200 focus:ring-green-400'}`}
                            >
                                <option value="menunggu">Menunggu</option>
                                <option value="diproses">Diproses</option>
                                <option value="selesai">Selesai</option>
                            </select>
                        </div>

                        {/* ── Status Lab Badge ── */}
                        <div className="flex items-center gap-2 mr-4">
                            <span className="text-sm text-gray-500 font-medium">Status Lab:</span>
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg
                                ${transaksi.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}
                            >
                                {transaksi.status === 'pending' ? 'Pending' : 'Selesai'}
                            </span>
                        </div>

                        {[
                            { label: 'Berat Tebu', value: beratDisplay },
                            { label: 'Tanggal & Waktu', value: `${tanggalDisplay} - ${waktuDisplay}` },
                            { label: 'Nomor Kendaraan', value: noKendaraan },
                        ].map(item => (
                            <div
                                key={item.label}
                                className="rounded-xl px-4 py-2"
                                style={{ backgroundColor: '#f1f5f9' }}
                            >
                                <div className="text-xs text-gray-500 leading-tight">{item.label}</div>
                                <div className="text-sm font-semibold text-gray-700 mt-0.5">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Grid 2 Kolom ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ════ KIRI: Hasil Klasifikasi ════ */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
                        <h3 className="text-base font-bold text-gray-800 mb-4">Hasil Klasifikasi</h3>

                        {total === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-6">
                                Belum ada data klasifikasi untuk pengiriman ini.
                            </div>
                        ) : (
                            <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2">
                                {klasifikasi.map((k, i) => (
                                    <div
                                        key={k.id_klasifikasi}
                                        className="flex items-center gap-3 rounded-xl p-3"
                                        style={{ backgroundColor: '#dce8f5' }}
                                    >
                                        {/* Nomor */}
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                                            style={{ backgroundColor: '#5b8ec4' }}
                                        >
                                            #{i + 1}
                                        </div>

                                        {/* Foto */}
                                        {k.gambar ? (
                                            <img
                                                src={`/storage/${k.gambar}`}
                                                alt={`Sampel ${i + 1}`}
                                                className="w-16 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-200"
                                            />
                                        ) : (
                                            <div
                                                className="w-16 h-12 rounded-lg flex-shrink-0 flex items-center justify-center"
                                                style={{ background: 'linear-gradient(135deg, #3a5a1c, #6b9a2f)' }}
                                            >
                                                <span className="text-xl">🌾</span>
                                            </div>
                                        )}

                                        {/* Label & akurasi */}
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-800 text-sm">{k.label}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                Akurasi : {Number(k.akurasi).toFixed(0)}%
                                            </div>
                                        </div>

                                        {/* Tombol Hapus Tanpa Konfirmasi */}
                                        <button
                                            onClick={() => handleDeleteKlasifikasi(k.id_klasifikasi)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/50 text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                                            title="Hapus"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Hasil akhir banner */}
                        <div
                            className="mt-5 rounded-3xl p-5 text-center text-white"
                            style={{ backgroundColor: '#7a9cc6' }}
                        >
                            <div className="font-bold text-xl mb-1">Hasil Akhir : {hasilAkhir}</div>
                            <div className="text-sm mt-1 font-medium opacity-90">
                                {total} Sampel | Akurasi Rata-Rata : {avgAkurasi}%
                            </div>
                            <div className="text-sm mt-0.5 font-medium opacity-90">
                                Bersih : {bersihCount} ({total ? Math.round(bersihCount / total * 100) : 0}%)
                                {' '}| Kotor : {kotorCount} ({total ? Math.round(kotorCount / total * 100) : 0}%)
                            </div>
                        </div>
                    </div>

                    {/* ════ KANAN: NIR + Interpretasi ════ */}
                    <div className="flex flex-col gap-6">

                        {/* Input Data NIR */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-base font-bold text-gray-800 mb-1">Input Data NIR</h3>
                            <p className="text-xs text-gray-400 mb-4">
                                {savedHasil && savedHasil.nilai_rendemen ? 'Data NIR tersimpan — edit lalu klik Update' : 'Belum ada data NIR — isi lalu klik Save'}
                            </p>

                            <div className="space-y-3">
                                {[
                                    { key: 'briks', label: '% Briks', placeholder: '18.5', required: false },
                                    { key: 'pol', label: '% Pol', placeholder: '16.3', required: true },
                                    { key: 'rendemen', label: '% Rendemen', placeholder: '8.9', required: true },
                                ].map(field => (
                                    <div key={field.key}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {field.label}
                                            {field.required && <span className="text-red-500"> *</span>}
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={nir[field.key]}
                                            onChange={e => setNir({ ...nir, [field.key]: e.target.value })}
                                            placeholder={field.placeholder}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    onClick={() => handleNirAction('updated')}
                                    disabled={nirStatus === 'loading'}
                                    className="px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                                    style={{ backgroundColor: '#1e6ab0' }}
                                >
                                    {nirStatus === 'updated' ? 'Diupdate ✓' : 'Update'}
                                </button>
                                <button
                                    onClick={() => handleNirAction('saved')}
                                    disabled={nirStatus === 'loading'}
                                    className="px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                                    style={{ backgroundColor: '#1e3a5f' }}
                                >
                                    {nirStatus === 'saved' ? 'Tersimpan ✓' : nirStatus === 'loading' ? 'Menyimpan...' : 'Save'}
                                </button>
                            </div>
                        </div>

                        {/* Interpretasi Kualitas */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 flex-1">
                            <h3 className="text-base font-bold text-gray-800 mb-4">Interpretasi Kualitas</h3>

                            {savedHasil && interpretasi ? (
                                <div className="space-y-2 text-sm">
                                    {/* % Rendemen */}
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-500">% Rendemen</span>
                                        <span className="font-semibold text-gray-800">
                                            {savedHasil.nilai_rendemen != null
                                                ? Number(savedHasil.nilai_rendemen).toFixed(1) + '%'
                                                : '-'}
                                        </span>
                                    </div>
                                    {/* Hasil Akhir */}
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Hasil Akhir</span>
                                        <span className="font-semibold text-gray-800">{hasilAkhir}</span>
                                    </div>
                                    {/* Badge interpretasi */}
                                    <div
                                        className="mt-3 p-3 rounded-xl text-center font-bold text-sm"
                                        style={{
                                            color: kualitasInfo?.color || '#1e3a5f',
                                            backgroundColor: kualitasInfo?.bg || '#dce8f5'
                                        }}
                                    >
                                        Kualitas Tebu : {interpretasi}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                                    <svg className="w-10 h-10 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M9 17v-2m3 2v-4m3 4v-6M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                    </svg>
                                    <p className="text-sm">Isi % Rendemen untuk melihat interpretasi kualitas</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
