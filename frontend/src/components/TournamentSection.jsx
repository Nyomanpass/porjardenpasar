import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, ScrollText, ChevronRight } from "lucide-react";
import api from "../api";

function TournamentSection() {
  const [tournaments, setTournaments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await api.get("/tournaments");
      // Urutkan yang terbaru lalu ambil 3 saja
      const sorted = res.data.sort(
        (a, b) => new Date(b.start_date) - new Date(a.start_date)
      );
      setTournaments(sorted.slice(0, 3)); // ⬅ tampil hanya 3
    } catch (err) {
      console.error("Gagal ambil turnamen:", err);
    }
  };

  const handleViewDetail = (tournament) => {
    // 1. Simpan ID dan Nama Turnamen ke Local Storage
    localStorage.setItem("selectedTournament", tournament.id);
    localStorage.setItem("selectedTournamentName", tournament.name);
    
    // 2. Navigasi ke halaman detail statis
    // Kita asumsikan rute Anda adalah /tournament-detail (Statis, tanpa ID/Slug)
    navigate("/tournament-detail"); 

    // Opsional: Jika sidebar perlu tahu, kirim event seperti yang Anda lakukan sebelumnya
    window.dispatchEvent(new Event("tournament-changed"));
  };

  // Format tanggal helper
  const formatDateRange = (start, end) => {
    if (!start || !end) return "-";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startStr = startDate.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
    const endStr = endDate.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
    return `${startStr} - ${endStr}`;
  };

  return (
    <section id="tournaments" className="py-24 relative overflow-hidden">
      <div className="relative container mx-auto px-4 md:px-20">
        
        {/* Header */}
        <div className="mb-20 relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="lg:w-1/2">
            <p className="text-[#D4A949] font-bold text-lg uppercase tracking-widest mb-2">
              TURNAMEN KAMI
            </p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-secondary">
              Daftar Turnamen
            </h2>
            <p className="mt-6">
              Berikut daftar turnamen tenis terbaru yang diadakan oleh PELTI Denpasar.
            </p>
          </div>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {tournaments.length > 0 ? (
            tournaments.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:border-b-4 hover:border-primary transform hover:-translate-y-1 transition duration-300 flex flex-col"
              >
                {/* Poster */}
                <div className="h-full w-full overflow-hidden">
                  {t.poster ? (
                    <img
                      src={`http://localhost:5004/${t.poster}`}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      Tidak ada poster
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex-grow">
                  <h3 className="text-xl font-extrabold text-secondary mb-3">{t.name}</h3>

                  <div className="space-y-2 text-gray-700">
                    <p className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-indigo-600 flex-shrink-0" />
                      <span className="font-medium">{formatDateRange(t.start_date, t.end_date)}</span>
                    </p>
                    <p className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-indigo-600 flex-shrink-0" />
                      <span className="font-medium">{t.location || "Lokasi belum ditentukan"}</span>
                    </p>
                    <p className="flex items-center text-sm italic text-gray-500 line-clamp-2 pt-2 border-t mt-2">
                      <ScrollText className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                      {t.description || "Tidak ada deskripsi singkat."}
                    </p>
                  </div>
                </div>

                {/* Tombol detail */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleViewDetail(t)}
                    className="w-full inline-flex items-center justify-center bg-primary text-secondary font-bold py-2.5 rounded-full hover:bg-yellow-500 transition duration-300 text-sm shadow-md"
                  >
                    Info Detail
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 italic">
              Belum ada turnamen saat ini
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default TournamentSection;
