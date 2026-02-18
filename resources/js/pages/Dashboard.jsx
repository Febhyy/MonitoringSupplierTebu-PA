import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import SupplierChart from '../components/SupplierChart';
import PageHeader from '../components/PageHeader';
import SupplierSection from '../components/SupplierSection';

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [loading, setLoading] = useState(true);

    // State modal Add Supplier — dikontrol dari Dashboard
    const [showModal, setShowModal] = useState(false);

    // Ref untuk kedua section
    const dashboardSectionRef = useRef(null);
    const supplierSectionRef = useRef(null);

    // Simpan ratio masing-masing section
    const ratioRef = useRef({ dashboard: 0, supplier: 0 });

    // Ref untuk showModal agar observer tidak perlu di-recreate
    const showModalRef = useRef(false);

    // Flag agar scroll+modal hanya dijalankan sekali saat mount
    const didInitRef = useRef(false);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    // Handle route awal: /supplier → scroll ke section supplier
    //                    /tambahsupplier → scroll ke section supplier + buka modal
    useEffect(() => {
        if (didInitRef.current) return;
        didInitRef.current = true;

        const path = location.pathname;

        if (path === '/supplier' || path === '/tambahsupplier') {
            // Jika /tambahsupplier, kunci URL SEKARANG sebelum observer sempat jalan
            if (path === '/tambahsupplier') {
                showModalRef.current = true;
            }
            // Tunggu sebentar agar DOM sudah render, lalu scroll + buka modal
            setTimeout(() => {
                supplierSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                if (path === '/tambahsupplier') {
                    setShowModal(true);
                }
            }, 300);
        }
    }, [location.pathname]);

    // IntersectionObserver: URL ikut section yang paling dominan di viewport
    // Observer dibuat SEKALI saja, membaca showModalRef untuk cek modal
    useEffect(() => {
        const updateUrl = () => {
            // Jika modal sedang terbuka, URL tetap /tambahsupplier — jangan ubah
            if (showModalRef.current) return;
            const { dashboard, supplier } = ratioRef.current;
            if (supplier > dashboard) {
                window.history.replaceState(null, '', '/supplier');
            } else {
                window.history.replaceState(null, '', '/dashboard');
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.target === dashboardSectionRef.current) {
                        ratioRef.current.dashboard = entry.intersectionRatio;
                    } else if (entry.target === supplierSectionRef.current) {
                        ratioRef.current.supplier = entry.intersectionRatio;
                    }
                });
                updateUrl();
            },
            { threshold: Array.from({ length: 21 }, (_, i) => i * 0.05) }
        );

        if (dashboardSectionRef.current) observer.observe(dashboardSectionRef.current);
        if (supplierSectionRef.current) observer.observe(supplierSectionRef.current);

        return () => observer.disconnect();
    }, []); // dependency kosong — observer hanya dibuat sekali

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get('/api/supplier');
            if (response.data.success) {
                setSuppliers(response.data.data);
            }
        } catch (err) {
            console.error('Gagal memuat data supplier', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        showModalRef.current = true;
        window.history.replaceState(null, '', '/tambahsupplier');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        showModalRef.current = false;
        // Kembalikan URL ke /supplier karena kita ada di section supplier
        window.history.replaceState(null, '', '/supplier');
        setShowModal(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">

            {/* ===== TOP HEADER ===== */}
            <PageHeader
                title="Manajemen Supplier Tebu"
                subtitle="Sistem Monitoring Supplier Tebu"
            />

            {/* ===== BODY: Sidebar + Content ===== */}
            <div className="flex flex-1">

                {/* Sidebar */}
                <aside>
                    <nav>
                        <a
                            href="#"
                            className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                            </svg>
                            Dashboard
                        </a>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">

                    {/* Section Dashboard (chart) */}
                    <div ref={dashboardSectionRef}>
                        <SupplierChart
                            suppliers={suppliers}
                            selectedSupplier={selectedSupplier}
                            onSupplierChange={setSelectedSupplier}
                            loading={loading}
                        />
                    </div>

                    {/* Section Supplier */}
                    <div ref={supplierSectionRef}>
                        <SupplierSection
                            suppliers={suppliers}
                            onSupplierAdded={fetchSuppliers}
                            showModal={showModal}
                            onOpenModal={handleOpenModal}
                            onCloseModal={handleCloseModal}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
