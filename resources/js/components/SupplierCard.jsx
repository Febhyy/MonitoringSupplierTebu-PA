import { useNavigate } from 'react-router-dom';

function SupplierCard({ supplier, onEdit, onDelete }) {
    const navigate = useNavigate();

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'S';
    };

    // Jumlah pengiriman & total berat dari API (real data)
    const totalPengiriman = supplier.transaksi_count ?? 0;
    const totalBeratTon = supplier.total_berat_kg
        ? (Number(supplier.total_berat_kg) / 1000).toFixed(2)
        : '0.00';

    return (
        <div
            onClick={() => navigate(`/pemasokan/${supplier.id_supplier}`)}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 relative"
        >
            <div className="absolute top-4 right-4 flex gap-1 z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(supplier); }}
                    className="p-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors shadow-sm"
                    title="Edit Supplier"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); if (onDelete) onDelete(supplier); }}
                    className="p-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors shadow-sm"
                    title="Hapus Supplier"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            
            <div className="flex items-start gap-4 mb-4 pr-16">
                <div className="w-12 h-12 rounded-full bg-slate-700 text-white flex items-center justify-center font-semibold text-lg shrink-0">
                    {getInitial(supplier.nama_supplier)}
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-lg">
                        {supplier.nama_supplier}
                    </h4>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>{supplier.asal_kebun}</span>
                    </div>
                </div>
            </div>

            {/* Stat boxes */}
            <div className="flex gap-3 mt-4">
                <div className="flex-1 bg-gray-100 rounded-2xl py-4 text-center">
                    <div className="text-2xl font-bold text-gray-800">{totalPengiriman}</div>
                    <div className="text-sm text-gray-500 mt-1">Pengiriman</div>
                </div>
                <div className="flex-1 bg-gray-100 rounded-2xl py-4 text-center">
                    <div className="text-2xl font-bold text-gray-800">{totalBeratTon} T</div>
                    <div className="text-sm text-gray-500 mt-1">Total Berat</div>
                </div>
            </div>
        </div>
    );
}

export default SupplierCard;
