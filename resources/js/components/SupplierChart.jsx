import { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import axios from 'axios';

function SupplierChart({ suppliers = [], selectedSupplier, onSupplierChange, loading }) {
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [rankingList, setRankingList] = useState([]);

    // Summary data yang tetap (keseluruhan, diload sekali saja)
    const [overallSummary, setOverallSummary] = useState({
        total_supplier: 0,
        total_berat_kg: 0,
        total_berat_today_kg: 0
    });

    // Data kualitas untuk Pie Chart (terpengaruh filter)
    const [pieSummary, setPieSummary] = useState({
        bersih_percentage: 0,
        kotor_percentage: 0
    });

    // 1. Ambil data awal (termasuk list tahun & summary keseluruhan) saat pertama kali mount
    useEffect(() => {
        const fetchInitialData = async () => {
            setSummaryLoading(true);
            try {
                const response = await axios.get('/api/dashboard/kualitas');
                if (response.data.success) {
                    if (response.data.years) {
                        setYears(response.data.years);
                    }
                    if (response.data.summary) {
                        setOverallSummary({
                            total_supplier: response.data.summary.total_supplier,
                            total_berat_kg: response.data.summary.total_berat_kg,
                            total_berat_today_kg: response.data.summary.total_berat_today_kg
                        });
                        setPieSummary({
                            bersih_percentage: response.data.summary.bersih_percentage,
                            kotor_percentage: response.data.summary.kotor_percentage
                        });
                    }
                    if (response.data.ranking) {
                        setRankingList(response.data.ranking);
                    }
                }
            } catch (err) {
                console.error('Gagal memuat data awal dashboard', err);
            } finally {
                setSummaryLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // 2. Ambil data kualitas terfilter (hanya untuk Pie Chart) ketika filter berubah
    useEffect(() => {
        // Lewati pemanggilan pertama jika summary masih loading awal
        if (summaryLoading) return;

        const fetchFilteredChartData = async () => {
            setChartLoading(true);
            try {
                const params = {};
                if (selectedSupplier) params.supplier_id = selectedSupplier;
                if (selectedYear) params.tahun = selectedYear;

                const response = await axios.get('/api/dashboard/kualitas', { params });
                if (response.data.success) {
                    if (response.data.summary) {
                        setPieSummary({
                            bersih_percentage: response.data.summary.bersih_percentage,
                            kotor_percentage: response.data.summary.kotor_percentage
                        });
                    }
                    if (response.data.ranking) {
                        setRankingList(response.data.ranking);
                    }
                }
            } catch (err) {
                console.error('Gagal memproses filter dashboard', err);
            } finally {
                setChartLoading(false);
            }
        };

        fetchFilteredChartData();
    }, [selectedSupplier, selectedYear, summaryLoading]);

    const pieData = [
        { name: 'Bersih', value: pieSummary.bersih_percentage, color: '#3b82f6' }, // Biru
        { name: 'Kotor', value: pieSummary.kotor_percentage, color: '#ef4444' }    // Merah
    ];

    const isEmpty = pieSummary.bersih_percentage === 0 && pieSummary.kotor_percentage === 0;
    const displayData = isEmpty
        ? [{ name: 'Tidak Ada Data', value: 100, color: '#9ca3af' }]
        : pieData;

    return (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm mb-8">
            {/* Header Utama Frame */}
            <div className="flex justify-center items-center mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 tracking-wide text-center">
                    Dashboard Monitoring Supplier
                </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Bagian Kiri: 3 Card Statistik (Static, load sekali, background abu container, card putih) */}
                <div className="flex flex-col gap-4 lg:col-span-1 justify-center bg-gray-50 border border-gray-200/60 rounded-3xl p-5 shadow-inner">

                    {/* Card 1: Total Supplier */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a7 7 0 00-7 7v1h12v-1a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">
                                Total Supplier
                            </span>
                            {summaryLoading ? (
                                <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-lg mt-1"></div>
                            ) : (
                                <span className="text-xl font-extrabold text-gray-800 tracking-tight block mt-0.5">
                                    {overallSummary.total_supplier}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Card 2: Total Semua Pengiriman */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">
                                Total Semua Pengiriman
                            </span>
                            {summaryLoading ? (
                                <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-lg mt-1"></div>
                            ) : (
                                <span className="text-xl font-extrabold text-gray-800 tracking-tight block mt-0.5">
                                    {Number((overallSummary.total_berat_kg || 0) / 1000).toLocaleString('id-ID', {
                                        minimumFractionDigits: 3,
                                        maximumFractionDigits: 3
                                    })} <span className="text-xs font-medium text-gray-400">ton</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Card 3: Pengiriman Hari Ini */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">
                                Pengiriman Hari Ini
                            </span>
                            {summaryLoading ? (
                                <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-lg mt-1"></div>
                            ) : (
                                <span className="text-xl font-extrabold text-gray-800 tracking-tight block mt-0.5">
                                    {Number((overallSummary.total_berat_today_kg || 0) / 1000).toLocaleString('id-ID', {
                                        minimumFractionDigits: 3,
                                        maximumFractionDigits: 3
                                    })} <span className="text-xs font-medium text-gray-400">ton</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bagian Kanan: Pie Chart Card (Tema terang, dengan Loading terpisah) */}
                <div className="lg:col-span-2 bg-gray-50 border border-gray-200/60 rounded-2xl p-6 shadow-sm flex flex-col relative min-h-[340px] transition-all duration-300">

                    {/* Header Card dengan Dropdown Filter */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200 w-full">
                        <div>
                            <h4 className="text-gray-800 text-sm font-bold uppercase tracking-wider">
                                Persentase Kualitas Tebu
                            </h4>
                        </div>

                        <div className="flex gap-3 w-full sm:w-auto">
                            {/* Filter Supplier */}
                            <div className="relative w-full sm:w-auto">
                                <select
                                    className="w-full sm:w-auto appearance-none pl-4 pr-10 py-1.5 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 shadow-sm transition-all duration-200 cursor-pointer"
                                    value={selectedSupplier}
                                    onChange={(e) => onSupplierChange(e.target.value)}
                                    disabled={loading || summaryLoading}
                                >
                                    <option value="">Semua Supplier</option>
                                    {suppliers.map((supplier) => (
                                        <option key={supplier.id_supplier} value={supplier.id_supplier}>
                                            {supplier.nama_supplier}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Filter Tahun */}
                            <div className="relative w-full sm:w-auto">
                                <select
                                    className="w-full sm:w-auto appearance-none pl-4 pr-10 py-1.5 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 shadow-sm transition-all duration-200 cursor-pointer"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    disabled={loading || summaryLoading}
                                >
                                    <option value="">Semua Tahun</option>
                                    {years.map((y) => (
                                        <option key={y} value={y}>
                                            Tahun {y}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Konten Chart */}
                    <div className="flex-1 w-full flex flex-col items-center justify-center relative">
                        {chartLoading ? (
                            <div className="absolute inset-0 bg-gray-50/70 flex items-center justify-center z-10 rounded-xl">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                            </div>
                        ) : null}

                        <div className="relative w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={displayData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={0}
                                        startAngle={90}
                                        endAngle={-270}
                                        dataKey="value"
                                    >
                                        {displayData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '12px' }}
                                        itemStyle={{ color: '#1f2937' }}
                                        formatter={(value, name) => [`${value}%`, name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Label Tengah Donut Chart */}
                            <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-center pointer-events-none">
                                <span className={`text-2xl font-extrabold block leading-none ${isEmpty || pieSummary.bersih_percentage >= pieSummary.kotor_percentage
                                    ? 'text-blue-600'
                                    : 'text-red-600'
                                    }`}>
                                    {isEmpty
                                        ? '0%'
                                        : pieSummary.bersih_percentage >= pieSummary.kotor_percentage
                                            ? `${pieSummary.bersih_percentage}%`
                                            : `${pieSummary.kotor_percentage}%`
                                    }
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">
                                    {isEmpty
                                        ? 'Bersih'
                                        : pieSummary.bersih_percentage >= pieSummary.kotor_percentage
                                            ? 'Bersih'
                                            : 'Kotor'
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Legend Bawah */}
                        <div className="flex justify-center gap-6 mt-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span>
                                <span className="text-xs font-semibold text-gray-600">
                                    Bersih {isEmpty ? '0%' : `${pieSummary.bersih_percentage}%`}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
                                <span className="text-xs font-semibold text-gray-600">
                                    Kotor {isEmpty ? '0%' : `${pieSummary.kotor_percentage}%`}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            
        </div>
    );
}

export default SupplierChart;
