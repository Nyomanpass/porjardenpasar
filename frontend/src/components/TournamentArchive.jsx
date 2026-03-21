import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, ScrollText, ChevronRight } from 'lucide-react';
import api from "../api";

function TournamentArchive() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            setLoading(true);
            const res = await api.get("/tournaments");
            const sortedData = res.data.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
            setTournaments(sortedData);
            setError(null);
        } catch (err) {
            console.error("Gagal ambil turnamen:", err);
            setError("Gagal memuat data turnamen dari server.");
        } finally {
            setLoading(false);
        }
    };

    const formatDateRange = (start, end) => {
        if (!start || !end) return "-";
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate) || isNaN(endDate)) return "Tanggal tidak valid";

        const startOptions = { day: "2-digit", month: "short" };
        const endOptions = { day: "2-digit", month: "short", year: "numeric" };

        return `${startDate.toLocaleDateString("id-ID", startOptions)} - ${endDate.toLocaleDateString("id-ID", endOptions)}`;
    };

    const handleViewDetail = (tournament) => {
        localStorage.setItem("selectedTournament", tournament.id);
        localStorage.setItem("selectedTournamentName", tournament.name);
        navigate("/tournament-detail"); 
        window.dispatchEvent(new Event("tournament-changed"));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-xl font-bold text-blue-600 animate-pulse">Memuat arsip turnamen...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-700 px-4 text-center">
                <p className="text-lg font-bold">ERROR: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 lg:py-24 px-4 sm:px-8 lg:px-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight text-balance">
                Rekam Jejak & Jadwal
              </h2>
              <p className="text-sm sm:text-base text-gray-500 italic mt-2 max-w-2xl mx-auto">
                Semua Turnamen Pelti Denpasar
              </p>
              <div className="w-12 h-1 bg-yellow-600 mx-auto mt-4 rounded-full"></div>
            </div>

            {/* GRID TURNAMEN */}
            {tournaments.length === 0 ? (
                <p className="text-center text-gray-500 italic py-10 text-lg">
                    Belum ada data turnamen yang ditemukan.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
  {tournaments.map((t) => (
    <div
      key={t.id}
      className="group bg-white rounded-[1.5rem] shadow-sm hover:shadow-xl border border-gray-100
                 transform hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* POSTER - Dibuat lebih pendek (slim) */}
      <div className="relative h-48 lg:h-56 w-full overflow-hidden">
        {t.poster ? (
          <img
            src={`${BASE_URL}/${t.poster}`} 
            alt={t.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 text-xs font-bold">
            Poster Tidak Tersedia
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* CONTENT - Padding dikurangi agar slim */}
      <div className="p-5 lg:p-6 flex-grow flex flex-col">
        {/* Nama Turnamen - Ukuran disesuaikan */}
        <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-yellow-600 transition-colors">
          {t.name}
        </h3>

        <div className="space-y-3 mb-5 flex-grow">
          {/* Tanggal & Lokasi dalam baris yang lebih rapat */}
          <div className="flex items-center text-gray-700">
            <Calendar className="w-4 h-4 text-yellow-600 mr-3 flex-shrink-0" />
            <span className="font-semibold text-xs lg:text-sm">
              {formatDateRange(t.start_date, t.end_date)}
            </span>
          </div>

          <div className="flex items-center text-gray-700">
            <MapPin className="w-4 h-4 text-yellow-600 mr-3 flex-shrink-0" />
            <span className="font-semibold text-xs lg:text-sm truncate">
              {t.location || "Lokasi Belum Ditentukan"}
            </span>
          </div>

          {/* Deskripsi - Dibuat lebih ringkas */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[11px] lg:text-xs text-gray-500 line-clamp-2 leading-relaxed italic">
              {t.description || "Tidak ada deskripsi singkat."}
            </p>
          </div>
        </div>

        {/* FOOTER / BUTTON - Dibuat lebih ramping */}
        <button
          onClick={() => handleViewDetail(t)}
          className="w-full flex items-center justify-center
                     bg-yellow-600 text-white font-bold
                     py-2.5 lg:py-3 rounded-xl text-xs lg:text-sm
                     hover:bg-gray-900 transition-all duration-300 shadow-md shadow-yellow-100"
        >
          Lihat Detail
          <ChevronRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  ))}
</div>
            )}
        </div>
    );
}

export default TournamentArchive;
