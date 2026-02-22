import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // ← dipakai untuk fetch data transaksi asli
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

// ────────── DATA DUMMY (hanya untuk klasifikasi, NIR, hasil) ──────────
const DUMMY_KLASIFIKASI = [
    { id_klasifikasi: 101, label: 'Tebu Bersih', akurasi: 94.5, gambar: null },
    { id_klasifikasi: 102, label: 'Tebu Bersih', akurasi: 91.2, gambar: null },
    { id_klasifikasi: 103, label: 'Tebu Kotor', akurasi: 88.7, gambar: null },
    { id_klasifikasi: 104, label: 'Tebu Bersih', akurasi: 96.1, gambar: null },
];

const DUMMY_HASIL = {
    id_hasil: 55,
    nilai_brix: 18.5,
    nilai_pol: 16.3,
    nilai_rendemen: 8.9,
};
// ─────────────────────────────────────────────────────────────────────

// ─────────────────────────── MAIN PAGE ───────────────────────────────
export default function PengirimanDetailPage() {
    const { id_transaksi } = useParams();
    const navigate = useNavigate();

    // ── state ──
    const [transaksi, setTransaksi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Klasifikasi, NIR, hasil — menggunakan dummy
    const [klasifikasi, setKlasifikasi] = useState([]);
    const [nir, setNir] = useState({ briks: '', pol: '', rendemen: '' });
    const [savedHasil, setSavedHasil] = useState(null);
    const [nirStatus, setNirStatus] = useState(''); // '' | 'loading' | 'saved' | 'updated'

    useEffect(() => {
        fetchTransaksi();
        loadDummyKlasifikasi();
    }, [id_transaksi]);

    // ── fetch data transaksi ASLI dari API ──
    const fetchTransaksi = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`/api/transaksi/${id_transaksi}`);
            if (res.data.success) {
                setTransaksi(res.data.data);
            } else {
                setError('Data pengiriman tidak ditemukan.');
            }
        } catch (err) {
            setError('Gagal memuat data pengiriman.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ── load DATA DUMMY untuk klasifikasi, NIR, hasil ──
    const loadDummyKlasifikasi = () => {
        // Simulasi delay
        setTimeout(() => {
            setKlasifikasi(DUMMY_KLASIFIKASI);
            setSavedHasil(DUMMY_HASIL);
            setNir({
                briks: DUMMY_HASIL.nilai_brix,
                pol: DUMMY_HASIL.nilai_pol,
                rendemen: DUMMY_HASIL.nilai_rendemen,
            });
        }, 300);
    };

    // ── simpan / update NIR (DUMMY — tidak hit API) ──
    const handleNirAction = (type) => {
        if (!nir.pol || !nir.rendemen) {
            alert('% Pol dan % Rendemen wajib diisi!');
            return;
        }

        setNirStatus('loading');

        // Simulasi simpan
        setTimeout(() => {
            const fakeHasil = {
                id_hasil: savedHasil?.id_hasil ?? 55,
                nilai_brix: nir.briks || null,
                nilai_pol: nir.pol,
                nilai_rendemen: nir.rendemen,
            };
            setSavedHasil(fakeHasil);
            setNirStatus(type === 'saved' ? 'saved' : 'updated');
            setTimeout(() => setNirStatus(''), 2500);
        }, 800);

        /* ── KODE ASLI NIR (dicomment sementara) ─────────────────────────
        setNirStatus('loading');
        const firstKlas = klasifikasi?.[0];
        const payload = {
            id_klasifikasi:    firstKlas?.id_klasifikasi ?? null,
            nilai_brix:        nir.briks || null,
            nilai_pol:         nir.pol,
            nilai_rendemen:    nir.rendemen,
            hasil_klasifikasi: hasilAkhir !== '-' ? hasilAkhir : 'Bersih',
        };

        try {
            let res;
            if (!savedHasil || type === 'saved') {
                res = await axios.post('/api/hasil', payload);
            } else {
                res = await axios.put(`/api/hasil/${savedHasil.id_hasil}`, payload);
            }

            if (res.data.success) {
                setSavedHasil(res.data.data);
                setNirStatus(type === 'saved' ? 'saved' : 'updated');
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
        ────────────────────────────────────────────────────────────────── */
    };

    // ─────────────────────────── LOADING / ERROR ─────────────────────
    if (loading) {
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
    // Info transaksi → dari API asli
    const supplierNama = transaksi.supplier?.nama_supplier ?? '-';
    const idSupplier = transaksi.id_supplier;
    const beratDisplay = transaksi.tebu?.berat_tebu
        ? Number(transaksi.tebu.berat_tebu).toLocaleString('id-ID') + ' Kg'
        : '-';
    const noKendaraan = transaksi.tebu?.no_kendaraan ?? '-';
    const tanggalDisplay = formatTanggal(transaksi.tanggal_masuk);
    const waktuDisplay = transaksi.jam_masuk?.slice(0, 5) ?? '-';

    // Kalkulasi hasil klasifikasi → dari dummy
    const total = klasifikasi.length;
    const bersihCount = klasifikasi.filter(k => k.label === 'Tebu Bersih').length;
    const kotorCount = klasifikasi.filter(k => k.label === 'Tebu Kotor').length;
    const avgAkurasi = total > 0
        ? Math.round(klasifikasi.reduce((s, k) => s + Number(k.akurasi), 0) / total)
        : 0;
    const hasilAkhir = total === 0 ? '-' : (bersihCount >= kotorCount ? 'Tebu Bersih' : 'Tebu Kotor');

    // Interpretasi → dari dummy NIR + hasil klasifikasi dummy
    const kualitasInfo = getInterpretasi(savedHasil?.nilai_rendemen, hasilAkhir);
    const interpretasi = kualitasInfo?.label ?? null;

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
                    <div className="flex flex-wrap gap-8 ml-auto">
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

                    {/* ════ KIRI: Hasil Klasifikasi (DUMMY) ════ */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
                        <h3 className="text-base font-bold text-gray-800 mb-4">Hasil Klasifikasi</h3>

                        {total === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-6">
                                Belum ada data klasifikasi untuk pengiriman ini.
                            </div>
                        ) : (
                            <div className="space-y-3 flex-1">
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
                                                className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
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
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Hasil akhir banner (DUMMY) */}
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

                        {/* Input Data NIR (DUMMY) */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-base font-bold text-gray-800 mb-1">Input Data NIR</h3>
                            <p className="text-xs text-gray-400 mb-4">
                                {savedHasil ? 'Data NIR tersimpan — edit lalu klik Update' : 'Belum ada data NIR — isi lalu klik Save'}
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

                        {/* Interpretasi Kualitas (DUMMY) */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 flex-1">
                            <h3 className="text-base font-bold text-gray-800 mb-4">Interpretasi Kualitas</h3>

                            {savedHasil && kualitasInfo ? (
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
                                        style={{ color: kualitasInfo.color, backgroundColor: kualitasInfo.bg }}
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
