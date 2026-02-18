import { useNavigate } from 'react-router-dom';

function SupplierCard({ supplier }) {
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
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
        >
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-700 text-white flex items-center justify-center font-semibold text-lg">
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

            <div className="flex gap-4 pt-4 border-t border-gray-200">
                <div className="flex-1 text-center">
                    <div className="text-2xl font-bold text-gray-800">{totalPengiriman}</div>
                    <div className="text-xs text-gray-600 mt-1">Pengiriman</div>
                </div>
                <div className="flex-1 text-center border-l border-gray-200">
                    <div className="text-2xl font-bold text-gray-800">{totalBeratTon} T</div>
                    <div className="text-xs text-gray-600 mt-1">Total Berat</div>
                </div>
            </div>
        </div>
    );
}

export default SupplierCard;
