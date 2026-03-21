import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Zap, AlertCircle } from "lucide-react";
import api from "../api";

const TournamentComming = () => {
  const [tournaments, setTournaments] = useState([]);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isTournamentOpen = (t) => {
    const deadline = new Date(t.start_date);
    deadline.setDate(deadline.getDate() - 1);
    deadline.setHours(23, 59, 59, 999);
    return t.status === "aktif" && new Date() <= deadline;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/tournaments");
        setTournaments(res.data.filter(isTournamentOpen));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  
  return (
    <section className="py-10 sm:py-16 bg-gray-50">
      <div className="mx-auto px-4 sm:px-10 lg:px-20">
        
        {/* HEADER - Menggunakan text-balance agar baris teks lebih rapi */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight text-balance">
            Turnamen Mendatang
          </h2>
          <p className="text-sm sm:text-base text-gray-500 italic mt-2 max-w-2xl mx-auto">
            Siapkan fisik dan mental, raih prestasi tertinggi di arena pertandingan.
          </p>
          <div className="w-12 h-1 bg-yellow-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* GRID */}
        <div className={`max-w-5xl mx-auto gap-6 sm:gap-8`}>
          {tournaments.map((t) => {
            const deadline = new Date(t.start_date);
            deadline.setDate(deadline.getDate() - 1);
            deadline.setHours(15, 0, 0, 0);
            const isClosed = new Date() > deadline;

            return (
              <div
                key={t.id}
                className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden mt-10"
              >
                <div className="flex flex-col md:flex-row h-full">
                  
                  {/* LEFT SIDE: IMAGE SECTION */}
                  <div className="relative w-full md:w-[350px] lg:w-[400px] shrink-0 bg-gray-200 overflow-hidden">
                    <img
                      src={t.poster ? `${BASE_URL}/${t.poster}` : "/default-tournament.jpg"}
                      alt={t.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Status Badge di atas Gambar */}
                    <span
                      className={`absolute top-4 left-4 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md z-10 ${
                        isClosed ? "bg-red-500/90 text-white" : "bg-yellow-400 text-gray-900"
                      }`}
                    >
                      {isClosed ? "Pendaftaran Ditutup" : "Pendaftaran Dibuka"}
                    </span>

                    {/* Overlay tipis agar transisi ke konten lebih smooth */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent md:block hidden"></div>
                  </div>

                  {/* RIGHT SIDE: CONTENT SECTION */}
                  <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between bg-white">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                          {t.name}
                        </h3>
                      </div>

                      <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed max-w-2xl">
                        {t.description}
                      </p>

                      {/* INFO GRID - 2 Kolom yang rapi */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-6">
                        <InfoItem
                          icon={<Calendar size={18} className="text-blue-600" />}
                          label="Tanggal"
                          value={`${formatDate(t.start_date)} - ${formatDate(t.end_date)}`}
                        />
                        <InfoItem
                          icon={<MapPin size={18} className="text-red-500" />}
                          label="Lokasi"
                          value={t.location}
                        />
                        <InfoItem
                          icon={<Zap size={18} className="text-emerald-600" />}
                          label="Biaya"
                          value={
                            t.type === "berbayar"
                              ? `Rp ${Number(t.nominal).toLocaleString("id-ID")}`
                              : "GRATIS"
                          }
                        />
                        <InfoItem
                          icon={<AlertCircle size={18} className="text-orange-500" />}
                          label="Batas Daftar"
                          value={formatDate(deadline)}
                          isDeadline
                        />
                      </div>

                      {t.type === "berbayar" && t.bank_info && (
                        <div className="inline-block p-3 bg-blue-50 rounded-2xl text-xs border border-blue-100 text-blue-800">
                          <span className="font-bold mr-1">💳 Info Pembayaran:</span> {t.bank_info}
                        </div>
                      )}
                    </div>

                    {/* ACTION BUTTON */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                      <div className="hidden sm:block text-xs text-gray-400">
                        Pastikan data diri sesuai kartu identitas.
                      </div>
                      
                      {isClosed ? (
                        <button disabled className="w-full sm:w-auto bg-gray-100 text-gray-400 px-8 py-3 rounded-2xl text-sm font-bold cursor-not-allowed">
                          PENDAFTARAN DITUTUP
                        </button>
                      ) : (
                        <a
                          href={`/daftar-peserta?tournament=${encodeURIComponent(t.name)}`}
                          className="inline-flex items-center justify-center w-full sm:w-auto bg-yellow-400 text-gray-900 px-8 py-3 rounded-2xl hover:bg-yellow-500 hover:shadow-lg transition-all duration-300 text-sm font-bold"
                        >
                          Daftar Sekarang
                          <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Komponen InfoItem yang sudah dioptimasi tulisannya
const InfoItem = ({ icon, label, value, isDeadline }) => (
  <div className="flex items-start gap-3 min-w-0">
    <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0 group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">
        {label}
      </p>
      <p
        className={`text-xs sm:text-[15px] font-semibold truncate leading-tight ${
          isDeadline ? "text-red-600" : "text-gray-800"
        }`}
        title={value}
      >
        {value}
      </p>
    </div>
  </div>
);

export default TournamentComming;