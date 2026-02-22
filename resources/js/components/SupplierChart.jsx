import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import axios from 'axios';

// Default static data (shown when no supplier is selected or API has no data)
const defaultData = [
    { year: '2019', kualitas: 50 },
    { year: '2020', kualitas: 65 },
    { year: '2021', kualitas: 75 },
    { year: '2022', kualitas: 62 },
    { year: '2023', kualitas: 80 },
    { year: '2024', kualitas: 88 },
    { year: '2025', kualitas: 92 },
];

function SupplierChart({ suppliers = [], selectedSupplier, onSupplierChange, loading }) {
    const [chartData, setChartData] = useState(defaultData);
    const [chartLoading, setChartLoading] = useState(false);

    useEffect(() => {
        if (selectedSupplier) {
            fetchSupplierData(selectedSupplier);
        } else {
            setChartData(defaultData);
        }
    }, [selectedSupplier]);

    const fetchSupplierData = async (supplierId) => {
        setChartLoading(true);
        try {
            const response = await axios.get(`/api/supplier/${supplierId}/kualitas`);
            if (response.data.success && response.data.data.length > 0) {
                setChartData(response.data.data);
            } else {
                setChartData(defaultData);
            }
        } catch (err) {
            // Fallback to default data if API not ready
            setChartData(defaultData);
        } finally {
            setChartLoading(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <p className="font-semibold text-gray-700 mb-1">Tahun {label}</p>
                    <p className="text-blue-600 font-bold">
                        Kualitas: {payload[0].value}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Card Header */}
            <div className="relative flex items-center justify-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 text-center">
                    Dashboard Monitoring Supplier
                </h3>

                {/* Supplier Dropdown — pojok kanan */}
                <div className="absolute right-0">
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white min-w-[160px]"
                        value={selectedSupplier}
                        onChange={(e) => onSupplierChange(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">-- Pilih Supplier --</option>
                        {suppliers.map((supplier) => (
                            <option key={supplier.id_supplier} value={supplier.id_supplier}>
                                {supplier.nama_supplier}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Chart */}
            {chartLoading ? (
                <div className="flex items-center justify-center h-72">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="year"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={false}
                        />
                        <YAxis
                            domain={[0, 100]}
                            tickCount={11}
                            label={{
                                value: 'Kualitas (%)',
                                angle: -90,
                                position: 'insideLeft',
                                offset: -5,
                                style: { fill: '#6b7280', fontSize: 12 }
                            }}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
                        <Bar
                            dataKey="kualitas"
                            fill="#4A90D9"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default SupplierChart;
