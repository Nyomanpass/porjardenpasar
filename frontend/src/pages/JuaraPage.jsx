import React, { useState, useEffect } from 'react';
import api from '../api';
import { Trophy, Award, Crown, CheckCircle, Layout, FileText, Users2, User } from "lucide-react"; 
import { PDFDownloadLink } from '@react-pdf/renderer';
import JuaraPDF from './JuaraPDF'; 

const JuaraPage = () => {
  const [winnersData, setWinnersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterKategori, setFilterKategori] = useState("all");

  const [readyPDF, setReadyPDF] = useState(false);

  const [tName, setTName] = useState(localStorage.getItem("selectedTournamentName") || "TURNAMEN"); 
  const role = localStorage.getItem('role');

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const selectedTournament = localStorage.getItem("selectedTournament");
      setTName(localStorage.getItem("selectedTournamentName") || "TURNAMEN");

      if (!selectedTournament) {
        setError("Silakan pilih turnamen terlebih dahulu.");
        setIsLoading(false);
        return;
      }

      const baganResponse = await api.get("/bagan", {
        params: { tournamentId: selectedTournament }
      });

      const winnersPromises = baganResponse.data.map(async (bagan) => {
        try {
          const winnersResponse = await api.get(`/juara/${bagan.id}`);
          return {
            baganId: bagan.id,
            baganNama: bagan.nama,
            kategori: bagan.kategori ? bagan.kategori.toLowerCase().trim() : "single", 
            kelompokUmurId: bagan.kelompokUmurId, 
            winners: winnersResponse.data || {},
          };
        } catch (err) {
          return {
            baganId: bagan.id,
            baganNama: bagan.nama,
            kategori: bagan.kategori ? bagan.kategori.toLowerCase().trim() : "single",
            kelompokUmurId: bagan.kelompokUmurId, 
            winners: null,
          };
        }
      });

      const allWinners = await Promise.all(winnersPromises);
      setWinnersData(allWinners);
      setError(null);
    } catch (err) {
      console.error("Error fetch data:", err);
      setError("Gagal memuat data juara.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    
    const handleTournamentChange = () => {
      console.log("Turnamen berubah, memuat ulang data juara...");
      fetchAllData();
    };


    fetchAllData();


    window.addEventListener("tournament-changed", handleTournamentChange);

 
    return () => {
      window.removeEventListener("tournament-changed", handleTournamentChange);
    };
  }, []);


  useEffect(() => {
    setReadyPDF(false);
  }, [filterKategori]);

  const renderWinnerName = (winner) => {
    if (!winner) return "Belum Ditetapkan";
    if (winner.Player1 && winner.Player2) {
      return `${winner.Player1.namaLengkap} / ${winner.Player2.namaLengkap}`;
    }
    if (winner.namaTim) return winner.namaTim;
    return winner.namaLengkap || "N/A";
  };

  const filteredWinners = winnersData.filter((data) => {
    if (filterKategori === "all") return true;
    return data.kategori === filterKategori;
  });

  if (isLoading) return <div className="flex justify-center items-center h-screen font-bold text-gray-500">Memuat Data Juara...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-600 font-bold">{error}</div>;

  return (
    <div className="min-h-screen">
      <div className="mb-6 border-gray-100">
        <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                 Hasil Pertandingan
            </h1>
            <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-100 md:bg-transparent md:border-none md:px-0">
                <p className="text-[10px] md:text-sm text-yellow-700 md:text-yellow-600 font-bold uppercase tracking-widest">
                    Tournament: {localStorage.getItem("selectedTournamentName") || "Belum Memilih"}
                </p>
            </div>
        </div>
    </div>
        
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
  
{/* FILTER KATEGORI */}
<div className="flex bg-gray-100 p-1 
                rounded-xl 
                border border-gray-200 
                shadow-sm 
                w-full sm:w-fit mb-5 md:mb-0">

  {/* SEMUA */}
  <button
    onClick={() => setFilterKategori("all")}
    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 
                px-4 md:px-5 
                py-2 md:py-2.5 
                rounded-lg 
                font-bold 
                text-[11px] md:text-[12px] 
                uppercase tracking-wide 
                transition-all duration-300 ${
      filterKategori === "all"
        ? "bg-white text-yellow-600 shadow-sm"
        : "text-gray-500 hover:text-gray-700"
    }`}
  >
    Semua
  </button>

  {/* SINGLE */}
  <button
    onClick={() => setFilterKategori("single")}
    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 
                px-4 md:px-5 
                py-2 md:py-2.5 
                rounded-lg 
                font-bold 
                text-[11px] md:text-[12px] 
                uppercase tracking-wide 
                transition-all duration-300 ${
      filterKategori === "single"
        ? "bg-white text-yellow-600 shadow-sm"
        : "text-gray-500 hover:text-gray-700"
    }`}
  >
    <span className="hidden md:inline">
      <User size={14} />
    </span>
    Single
  </button>

  {/* DOUBLE */}
  <button
    onClick={() => setFilterKategori("double")}
    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 
                px-4 md:px-5 
                py-2 md:py-2.5 
                rounded-lg 
                font-bold 
                text-[11px] md:text-[12px] 
                uppercase tracking-wide 
                transition-all duration-300 ${
      filterKategori === "double"
        ? "bg-white text-yellow-600 shadow-sm"
        : "text-gray-500 hover:text-gray-700"
    }`}
  >
    <span className="hidden md:inline">
      <Users2 size={14} />
    </span>
    Double
  </button>

</div>


  {/* TOMBOL PDF */}
  
{(role === "admin" || role === "panitia")  && filteredWinners.length > 0 && (
  <div className="flex items-center">
    {!readyPDF ? (
      <button 
        key="btn-siapkan"
        onClick={() => setReadyPDF(true)}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95"
      >
        <FileText size={20} /> 
        Siapkan PDF {filterKategori !== 'all' ? filterKategori : ''}
      </button>
    ) : (
      <PDFDownloadLink
        key="btn-download"
        document={<JuaraPDF winnersData={filteredWinners} tournamentName={tName} />}
        fileName={`Juara_${tName}_${filterKategori}.pdf`}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
        onClick={() => {
          setTimeout(() => {
            setReadyPDF(false);
          }, 3000);
        }}
      >
        {({ loading }) => (
          <>
            <Trophy size={20} />
            {loading ? "Menyusun..." : "Download Sekarang (Klik)"}
          </>
        )}
      </PDFDownloadLink>
    )}
  </div>
)}
</div>
        {/* --- LIST DATA JUARA --- */}
     {filteredWinners.length === 0 ? (
  <div className="p-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
    <p className="text-gray-500 text-sm font-medium">Tidak ada data juara untuk kategori {filterKategori}.</p>
  </div>
) : (
  filteredWinners
    .sort((a, b) => a.kelompokUmurId - b.kelompokUmurId)
    .map((data) => {
      const winners = data.winners;
      return (
        <div key={data.baganId} className="bg-white p-4 md:p-8 rounded-2xl border border-gray-100 mb-6 md:mb-10">
          {/* HEADER BAGAN */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 mb-5 gap-2">
            <h2 className="text-base md:text-2xl font-black text-gray-800 flex items-center gap-2">
              <Trophy size={18} className="text-yellow-500 shrink-0 md:w-6 md:h-6" /> 
              {data.baganNama}
            </h2>
            <span className={`shrink-0 px-2 max-w-max py-0.5 rounded text-[8px] md:text-[10px] font-black uppercase tracking-wider border ${
                data.kategori === 'double' 
                ? 'bg-purple-50 text-purple-600 border-purple-100' 
                : 'bg-blue-50 text-blue-600 border-blue-100'
            }`}>
                {data.kategori}
            </span>
          </div>

          {!winners || (!winners.juara1 && !winners.juara2) ? (
            <div className="p-5 text-center bg-gray-50 rounded-xl">
              <p className="text-gray-400 text-[10px] md:text-sm italic font-medium">Data juara belum tersedia.</p>
            </div>
          ) : (
            <>
              {/* KARTU JUARA (URUTAN 1 - 2 - 3) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                {/* Juara 1 - EMAS */}
                <div className="bg-yellow-500 p-4 md:p-6 rounded-xl text-center text-white">
                  <Trophy size={24} className="mx-auto mb-2 md:w-8 md:h-8" />
                  <h3 className="font-bold uppercase text-[8px] md:text-[10px] mb-1 opacity-90">Juara 1</h3>
                  <p className="text-xs md:text-lg font-black break-words leading-snug">
                    {renderWinnerName(winners.juara1)}
                  </p>
                </div>
                
                {/* Juara 2 - perak */}
                <div className="bg-orange-50 p-4 md:p-6 rounded-xl text-center text-orange-800 border border-orange-200">
                  <Crown size={24} className="mx-auto mb-2 text-orange-400 md:w-8 md:h-8" />
                  <h3 className="font-bold uppercase text-[8px] md:text-[10px] mb-1 opacity-70">Juara 2</h3>
                  <p className="text-xs md:text-lg font-black break-words leading-snug">
                    {renderWinnerName(winners.juara2)}
                  </p>

                </div>

                    {/* Juara 3 - perunggu */}
                <div className="bg-gray-100 p-4 md:p-6 rounded-xl text-center text-gray-700 border border-gray-200">
                  <Award size={24} className="mx-auto mb-2 text-gray-400 md:w-8 md:h-8" />
                  <h3 className="font-bold uppercase text-[8px] md:text-[10px] mb-1 opacity-70">Juara 3</h3>
                  <p className="text-xs md:text-lg font-black break-words leading-snug">
                    {Array.isArray(winners.juara3) 
                      ? winners.juara3.filter(x => x).map(renderWinnerName).join(" & ") 
                      : renderWinnerName(winners.juara3)}
                  </p>
                </div>
              </div>

              {/* KLASEMEN (Ringkas) */}
              {winners.klasemen && winners.klasemen.length > 0 && (
                <div className="mt-6 md:mt-8">
                  <h3 className="text-[11px] md:text-sm font-black text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
                    Klasemen Akhir
                  </h3>
                  
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="min-w-full text-[10px] md:text-xs bg-white">
                      <thead className="bg-gray-50 text-gray-400 border-b">
                        <tr>
                          <th className="px-3 py-2.5 text-center font-bold">#</th>
                          <th className="px-3 py-2.5 text-left font-bold">PESERTA</th>
                          <th className="px-3 py-2.5 text-center font-black text-blue-600 bg-blue-50/30">PTS</th>
                          <th className="px-2 py-2.5 text-center">M</th>
                          <th className="px-2 py-2.5 text-center">K</th>
                          <th className="px-3 py-2.5 text-center font-bold">+/-</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {winners.klasemen.map((p, index) => (
                          <tr key={index}>
                            <td className="px-3 py-3 text-center text-gray-400 font-bold">{index + 1}</td>
                            <td className="px-3 py-3 font-bold text-gray-700 uppercase">{renderWinnerName(p.peserta)}</td>
                            <td className="px-3 py-3 text-center text-blue-600 font-black bg-blue-50/20">{p.poin || '0'}</td>
                            <td className="px-2 py-3 text-center font-bold text-green-600">{p.menang || '0'}</td>
                            <td className="px-2 py-3 text-center text-red-400">{p.kalah || '0'}</td>
                            <td className="px-3 py-3 text-center font-bold text-gray-600">{p.selisih}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    })
)}

      </div>
  );
};

export default JuaraPage;