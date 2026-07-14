/**
 * PageHeader - Komponen header reusable
 *
 * Props:
 *   title    : string - Judul utama halaman (contoh: "Manajemen Supplier Tebu")
 *   subtitle : string - Subjudul halaman (contoh: "Sistem Monitoring Supplier Tebu")
 */
function PageHeader({ title = 'Manajemen Supplier Tebu', subtitle = 'Sistem Monitoring Supplier Tebu' }) {
    return (
        <header
            className="flex items-center shadow-md sticky top-0 z-40"
            style={{ backgroundColor: '#1e3a5f', minHeight: '72px', position: 'sticky' }}
        >
            {/* ===== Logo PTPN X - ujung kiri ===== */}
            <div
                className="hidden md:flex items-center px-6"
                style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
            >
                <img
                    src="/images/logo.png"
                    alt="Logo PTPN X"
                    style={{ height: '80px', width: 'auto', objectFit: 'contain' }}
                />
            </div>

            {/* ===== Judul - benar-benar di tengah ===== */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-32">
                {/* Baris 1: ikon tebu + judul */}
                <div className="flex items-center gap-2">
                    <img
                        src="/images/tebu.png"
                        alt="Ikon Tebu"
                        className="h-5 md:h-7"
                        style={{ width: 'auto', objectFit: 'contain' }}
                    />
                    <h1 className="text-white font-bold text-base md:text-2xl leading-tight text-center">
                        {title}
                    </h1>
                </div>
                {/* Baris 2: subtitle */}
                <p className="text-gray-300 text-xs md:text-sm mt-0.5 text-center line-clamp-1">{subtitle}</p>
            </div>
        </header>

    );
}

export default PageHeader;
