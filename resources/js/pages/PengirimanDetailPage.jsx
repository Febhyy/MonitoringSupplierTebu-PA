import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageHeader from '../components/PageHeader';

function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Dummy klasifikasi — nanti dari tabel klasifikasi
const DUMMY_KLASIFIKASI = [
    { no: 1, label: 'Tebu Bersih', akurasi: 80 },
    { no: 2, label: 'Tebu Kotor', akurasi: 90 },
    { no: 3, label: 'Tebu Bersih', akurasi: 80 },
    { no: 4, label: 'Tebu Bersih', akurasi: 80 },
    { no: 5, label: 'Tebu Kotor', akurasi: 80 },
];

function PengirimanDetailPage() {
    const { id_transaksi } = useParams();
    const navigate = useNavigate();

    const [transaksi, setTransaksi] = useState(null);
    const [loading, setLoading] = useState(true);

    // NIR form — dummy, nanti dari tabel hasil
    const [nir, setNir] = useState({ briks: '', pol: '', rendemen: '' });
    const [nirStatus, setNirStatus] = useState(''); // '' | 'saved' | 'updated'

    useEffect(() => {
        fetchDetail();
    }, [id_transaksi]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/transaksi/${id_transaksi}`);
            if (res.data.success) setTransaksi(res.data.data);
        } catch (err) {
            console.error('Gagal memuat detail', err);
        } finally {
            setLoading(false);
        }
    };

    const handleNirAction = (type) => {
        // TODO: POST/PUT ke /api/hasil
        setNirStatus(type);
        setTimeout(() => setNirStatus(''), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col">
                <PageHeader title="Detail Pengiriman" subtitle="Sistem Monitoring Supplier Tebu" />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500 animate-pulse">Memuat data...</p>
                </div>
            </div>
        );
    }

    if (!transaksi) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col">
                <PageHeader title="Detail Pengiriman" subtitle="Sistem Monitoring Supplier Tebu" />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-red-500">Data pengiriman tidak ditemukan.</p>
                </div>
            </div>
        );
    }

    const supplierNama = transaksi.supplier?.nama_supplier ?? '-';
    const idSupplier = transaksi.id_supplier;
    const berat = transaksi.tebu?.berat_tebu
        ? Number(transaksi.tebu.berat_tebu).toLocaleString('id-ID') + ' Kg'
        : '-';
    const noKendaraan = transaksi.tebu?.no_kendaraan ?? '-';
    const tanggalWaktu = `${formatTanggal(transaksi.tanggal_masuk)} - ${transaksi.jam_masuk?.slice(0, 5) ?? ''}`;

    // Hitung hasil akhir dari dummy
    const bersihCount = DUMMY_KLASIFIKASI.filter(k => k.label === 'Tebu Bersih').length;
    const kotorCount = DUMMY_KLASIFIKASI.filter(k => k.label === 'Tebu Kotor').length;
    const avgAkurasi = Math.round(DUMMY_KLASIFIKASI.reduce((s, k) => s + k.akurasi, 0) / DUMMY_KLASIFIKASI.length);
    const hasilAkhir = bersihCount >= kotorCount ? 'Tebu Bersih' : 'Tebu Kotor';
    const total = DUMMY_KLASIFIKASI.length;

    // Interpretasi kualitas dari NIR
    const getKualitas = () => {
        const r = Number(nir.rendemen);
        if (!nir.rendemen) return null;
        if (r >= 9) return { label: 'Sangat Baik', color: 'text-green-700', bg: 'bg-green-50' };
        if (r >= 7) return { label: 'Baik', color: 'text-blue-700', bg: 'bg-blue-50' };
        if (r >= 5) return { label: 'Cukup', color: 'text-yellow-700', bg: 'bg-yellow-50' };
        return { label: 'Kurang', color: 'text-red-700', bg: 'bg-red-50' };
    };
    const kualitas = getKualitas();

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* ===== HEADER ===== */}
            <PageHeader
                title={`🌾 Detail Pengiriman #${transaksi.id_transaksi}`}
                subtitle={`${supplierNama} - ${formatTanggal(transaksi.tanggal_masuk)}`}
            />

            {/* ===== BREADCRUMB ===== */}
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
                <span>/</span>
                <button
                    onClick={() => navigate(`/pemasokan/${idSupplier}`)}
                    className="hover:text-blue-600 transition-colors"
                >
                    {supplierNama}
                </button>
                <span>/</span>
                <span className="text-gray-700 font-medium">Pengiriman #{transaksi.id_transaksi}</span>
            </div>

            <main className="flex-1 p-8 max-w-6xl mx-auto w-full">

                {/* ===== INFO CARD ===== */}
                <div className="bg-white rounded-xl shadow-sm p-5 mb-6 flex flex-wrap items-center gap-4">
                    <span className="text-lg font-bold text-gray-800 mr-2">
                        Pengiriman #{transaksi.id_transaksi}
                    </span>
                    {[
                        { label: 'Berat Tebu', value: berat },
                        { label: 'Tanggal & Waktu', value: tanggalWaktu },
                        { label: 'Nomor Kendaraan', value: noKendaraan },
                    ].map(item => (
                        <div key={item.label} className="bg-gray-100 rounded-lg px-4 py-2">
                            <div className="text-xs text-gray-500">{item.label}</div>
                            <div className="font-semibold text-gray-800 text-sm mt-0.5">{item.value}</div>
                        </div>
                    ))}
                </div>

                {/* ===== GRID UTAMA ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ===== KIRI: Hasil Klasifikasi ===== */}
                    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Hasil Klasifikasi</h3>

                        <div className="space-y-3 flex-1">
                            {DUMMY_KLASIFIKASI.map((k) => (
                                <div
                                    key={k.no}
                                    className="flex items-center gap-3 rounded-xl p-3"
                                    style={{ backgroundColor: '#dce8f5' }}
                                >
                                    {/* Nomor */}
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                                        style={{ backgroundColor: '#5b8ec4' }}
                                    >
                                        #{k.no}
                                    </div>

                                    {/* Gambar tebu dummy */}
                                    <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center">
                                        <span className="text-2xl">🌾</span>
                                    </div>

                                    {/* Label & akurasi */}
                                    <div>
                                        <div className="font-semibold text-gray-800 text-sm">{k.label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Akurasi : {k.akurasi}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Hasil Akhir */}
                        <div
                            className="mt-5 rounded-xl p-4 text-center text-white"
                            style={{ backgroundColor: '#1e3a5f' }}
                        >
                            <div className="font-bold text-base">Hasil Akhir : {hasilAkhir}</div>
                            <div className="text-sm mt-1 opacity-80">
                                {total} Sampel | Akurasi Rata-Rata : {avgAkurasi}%
                            </div>
                            <div className="text-xs mt-0.5 opacity-70">
                                Bersih : {bersihCount} ({Math.round(bersihCount / total * 100)}%) | Kotor : {kotorCount} ({Math.round(kotorCount / total * 100)}%)
                            </div>
                        </div>
                    </div>

                    {/* ===== KANAN: NIR + Interpretasi ===== */}
                    <div className="flex flex-col gap-6">

                        {/* Input Data NIR */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Input Data NIR</h3>

                            <div className="space-y-3">
                                {[
                                    { key: 'briks', label: '% Briks', placeholder: '18.5' },
                                    { key: 'pol', label: '% Pol', placeholder: '16.3' },
                                    { key: 'rendemen', label: '% Rendemen', placeholder: '8.9' },
                                ].map(field => (
                                    <div key={field.key}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {field.label} <span className="text-red-500">*</span>
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
                                    className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                                    style={{ backgroundColor: '#1e6ab0' }}
                                >
                                    {nirStatus === 'updated' ? 'Diupdate ✓' : 'Update'}
                                </button>
                                <button
                                    onClick={() => handleNirAction('saved')}
                                    className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                                    style={{ backgroundColor: '#1e3a5f' }}
                                >
                                    {nirStatus === 'saved' ? 'Tersimpan ✓' : 'Save'}
                                </button>
                            </div>
                        </div>

                        {/* Interpretasi Kualitas */}
                        <div className="bg-white rounded-xl shadow-sm p-6 flex-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Interpretasi Kualitas</h3>

                            {kualitas ? (
                                <div className="space-y-2 text-sm">
                                    {[
                                        { label: '% Briks', value: nir.briks + '%' },
                                        { label: '% Pol', value: nir.pol + '%' },
                                        { label: '% Rendemen', value: nir.rendemen + '%' },
                                    ].map(row => (
                                        <div key={row.label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                            <span className="text-gray-500">{row.label}</span>
                                            <span className="font-semibold text-gray-800">{row.value}</span>
                                        </div>
                                    ))}
                                    <div className={`mt-3 p-3 rounded-lg text-center ${kualitas.bg}`}>
                                        <span className={`font-bold text-sm ${kualitas.color}`}>
                                            Kualitas Tebu : {kualitas.label}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                                    <svg className="w-10 h-10 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                    </svg>
                                    <p className="text-sm">Isi data NIR untuk melihat interpretasi kualitas</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default PengirimanDetailPage;
