// File: src/components/TournamentDetailPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 💡 Tambahkan 'Search' di import lucide-react
import { Trophy, Users, GitBranch, CalendarDays, BarChart, Medal, User, Users2, Search } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

// 💡 Import komponen yang dibutuhkan
import PesertaView from './admin/Peserta';
import BaganSelectorParent from './BaganSelectorParent';
import JadwalPage from '../pages/JadwalPage';
import JuaraPage from '../pages/JuaraPage';
import SkorPage from '../pages/SkorPage';
import PesertaGanda from './admin/PesertaGanda';

const TABS = {
    PESERTA: 'peserta',
    BAGAN: 'bagan',
    JADWAL: 'jadwal',
    SKOR: 'skor',
    HASIL: 'hasil',
};

const TournamentDetailPage = () => {
    const selectedTournamentId = localStorage.getItem("selectedTournament");
    const selectedTournamentName = localStorage.getItem("selectedTournamentName");
    
    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState(TABS.PESERTA);
    const [subTabPeserta, setSubTabPeserta] = useState('single');
    const [tournamentData, setTournamentData] = useState(null);
    
    // 💡 Definisikan searchTerm agar tidak error ReferenceError
    const [searchTerm, setSearchTerm] = useState("");

    // Nama tournament diambil dari data state atau localStorage
    const currentTournamentName = tournamentData?.name || selectedTournamentName || "Tournament";

    const renderContent = () => {
        if (!selectedTournamentId) {
            return (
                <div className="p-6 sm:p-8 text-center bg-yellow-50 rounded-xl border border-yellow-300">
                    <Trophy size={32} className="text-yellow-600 mx-auto mb-3" />
                    <p className="text-lg text-gray-700 font-semibold">
                        Turnamen belum dipilih. Silakan kembali ke halaman utama.
                    </p>
                </div>
            );
        }

        switch (activeTab) {
            case TABS.PESERTA:
                return (
                    <div className="space-y-6">
                        {/* --- HEADER MANAJEMEN PESERTA --- */}
                        <div className="mb-6 md:mb-8 border-b border-gray-100 pb-5 md:pb-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                
                                {/* Judul & Nama Tournament */}
                                <div className="text-center md:text-left">
                                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                                        Manajemen Peserta
                                    </h1>
                                    <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-100 md:bg-transparent md:border-none md:px-0">
                                        <p className="text-[10px] md:text-sm text-yellow-700 md:text-yellow-600 font-bold uppercase tracking-widest">
                                            Tournament: {currentTournamentName}
                                        </p>
                                    </div>
                                </div>

                                {/* Filter Single/Double & Search Bar */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                    
                                    {/* Sub-Navigasi Single/Double */}
                                    <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">

                                        <button
                                            onClick={() => setSubTabPeserta('single')}
                                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 
                                                        px-5 md:px-6 
                                                        py-2.5 md:py-2 
                                                        rounded-xl 
                                                        font-black 
                                                        text-[10px] md:text-xs 
                                                        uppercase tracking-widest 
                                                        transition-all duration-300 ${
                                            subTabPeserta === 'single'
                                                ? "bg-white text-yellow-600 shadow-sm"
                                                : "text-gray-500 hover:text-gray-700"
                                            }`}
                                        >
                                            <span className="hidden md:inline">
                                            <User size={16} />
                                            </span>
                                            Single
                                        </button>

                                        <button
                                            onClick={() => setSubTabPeserta('ganda')}
                                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 
                                                        px-5 md:px-6 
                                                        py-2.5 md:py-2 
                                                        rounded-xl 
                                                        font-black 
                                                        text-[10px] md:text-xs 
                                                        uppercase tracking-widest 
                                                        transition-all duration-300 ${
                                            subTabPeserta === 'ganda'
                                                ? "bg-white text-yellow-600 shadow-sm"
                                                : "text-gray-500 hover:text-gray-700"
                                            }`}
                                        >
                                            <span className="hidden md:inline">
                                            <Users2 size={16} />
                                            </span>
                                            Double
                                        </button>

                                    </div>


                                    {/* Input Pencarian */}
                                    <div className="relative w-full md:w-64 group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-600 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Cari nama peserta..."
                                            className="w-full pl-10 pr-4 py-3 md:py-2 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none text-sm transition-all font-medium"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- ISI KONTEN (Tabel Peserta) --- */}
                        {subTabPeserta === 'single' ? (
                            <PesertaView tournamentId={selectedTournamentId} searchTerm={searchTerm} />
                        ) : (
                            <PesertaGanda tournamentId={selectedTournamentId} searchTerm={searchTerm} />
                        )}
                    </div>
                );
               
            case TABS.BAGAN:
                return <BaganSelectorParent tournamentId={selectedTournamentId} />;

            case TABS.JADWAL:
                return <JadwalPage tournamentId={selectedTournamentId} />;

            case TABS.SKOR:
                return <SkorPage tournamentId={selectedTournamentId} />;

            case TABS.HASIL:
                return <JuaraPage tournamentId={selectedTournamentId} />;

            default:
                return null;
        }
    };

    return (
        <>
            <Navbar />
            <div className="font-sans bg-gray-50 min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto w-full">
                    {/* --- JUDUL UTAMA --- */}
                    <header className="mb-4 mt-6 md:mt-16 sm:mb-8 px-4 py-4 sm:px-6 sm:py-6 bg-white rounded-xl shadow-lg border-t-4 border-yellow-500">
                        <div className="flex items-center gap-3 sm:gap-5">
                            <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg">
                                <Trophy className="text-yellow-600 w-5 h-5 sm:w-7 sm:h-7" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase">
                                    Detail Turnamen
                                </p>
                                <h1 className="text-sm sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                                    {selectedTournamentName || "Memuat Detail Turnamen..."}
                                </h1>
                            </div>
                        </div>
                    </header>

                    {/* --- TAB NAVIGASI --- */}
                    <div className="mb-4 sm:mb-6">
                        <nav className="flex flex-wrap justify-center gap-2 sm:gap-4" aria-label="Tabs">
                            {[
                                { id: TABS.PESERTA, name: "Peserta", icon: Users },
                                { id: TABS.BAGAN, name: "Bagan", icon: GitBranch },
                                { id: TABS.JADWAL, name: "Jadwal", icon: CalendarDays },
                                { id: TABS.SKOR, name: "Skor", icon: Medal },
                                { id: TABS.HASIL, name: "Hasil", icon: BarChart },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        ${tab.id === activeTab
                                            ? "border-yellow-500 text-yellow-600 bg-yellow-50 shadow-sm"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        }
                                        w-[calc(33.333%-8px)] sm:w-auto
                                        min-w-[90px] sm:min-w-[120px] lg:min-w-[150px]
                                        flex items-center justify-center gap-1.5 sm:gap-2
                                        px-3 sm:px-6 py-2.5 sm:py-3
                                        border-b-2
                                        text-[11px] sm:text-sm lg:text-base font-bold
                                        rounded-t-lg transition-all duration-200
                                    `}
                                >
                                    <tab.icon
                                        className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                                            tab.id === activeTab ? "text-yellow-500" : "text-gray-400"
                                        }`}
                                    />
                                    <span className="truncate">{tab.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* --- KONTEN AKTIF --- */}
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
                        {renderContent()}
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default TournamentDetailPage;