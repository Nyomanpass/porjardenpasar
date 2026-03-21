// File: src/components/admin/Peserta.jsx

import React, { useEffect, useState, useCallback } from "react";
import api from "../../api";
import { Link, useLocation } from "react-router-dom"; // Tambahkan useLocation
import { Eye, Trash2, Search, ChevronDown, ChevronUp, User, Users2 } from "lucide-react"; // Tambahkan Users2
import AlertMessage from "../AlertMessage";

function Peserta({ tournamentId, searchTerm: searchTermFromProps }) {
  const location = useLocation();
  const [kelompokUmur, setKelompokUmur] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ show: false, pesertaId: null });

  const role = localStorage.getItem("role");
  const currentTournamentName = localStorage.getItem("selectedTournamentName");

  // Logika pencarian gabungan
  const finalSearch = searchTermFromProps !== undefined ? searchTermFromProps : localSearch;
  const basePath = `/${role}`;

  const totalPeserta = kelompokUmur.reduce((total, ku) => {
    return total + (ku.peserta?.length || 0);
  }, 0);
  // Fungsi pengecekan link aktif
  const isActive = (path) => location.pathname === path;

  const fetchPeserta = useCallback(async () => {
    const idToUse = tournamentId || localStorage.getItem("selectedTournament");
    if (!idToUse) {
      setKelompokUmur([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/peserta/kelompok-umur?tournamentId=${idToUse}`);
      setKelompokUmur(res.data);
    } catch (err) {
      setError("Gagal mengambil data peserta");
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
  fetchPeserta();

  const handleTournamentChange = () => {
    fetchPeserta();
  };

  window.addEventListener("tournament-changed", handleTournamentChange);

  return () => {
    window.removeEventListener("tournament-changed", handleTournamentChange);
  };
}, [fetchPeserta]);

  

  // ... handler interaksi (toggleGroup, handleDelete, dll tetap sama) ...
  const toggleGroup = (id) => setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  const handleDelete = (id) => setConfirmDelete({ show: true, pesertaId: id });
  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/peserta/${confirmDelete.pesertaId}`);
      setSuccess("Peserta berhasil dihapus");
      fetchPeserta();
    } catch (err) { setError("Gagal menghapus"); }
    finally { setConfirmDelete({ show: false, pesertaId: null }); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
        <p className="text-gray-500 font-medium">Memuat data peserta...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* --- HEADER ADMIN OTOMATIS (Sesuai Request Anda) --- */}
      {searchTermFromProps === undefined && (
        <div className="mb-8 border-b pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
                Manajement Peserta
              </h1>
              <p className="text-sm text-yellow-600 font-bold uppercase tracking-widest mt-2">
                Tournament: {currentTournamentName || "Belum Memilih"}
              </p>
               <div className="mt-3 flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  Total Peserta
                </span>
                <div className="px-4 py-1.5 bg-yellow-500 text-white rounded-xl font-black text-sm shadow-md">
                  {totalPeserta}
                </div>
            </div>

            </div>

           
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Navigasi Button Kategori (Single / Double) */}
              {(role === "admin" || role === "wasit" || role === "panitia") && (
                <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-sm">
                  
                  <Link 
                    to={`${basePath}/peserta`} 
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all ${
                      isActive(`${basePath}/peserta`)
                        ? "bg-white text-yellow-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <User size={14} /> Single
                  </Link>

                  <Link 
                    to={`${basePath}/peserta-ganda`} 
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all ${
                      isActive(`${basePath}/peserta-ganda`)
                        ? "bg-white text-yellow-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Users2 size={14} /> Double
                  </Link>

                </div>
              )}


              {/* Input Pencarian */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari nama peserta..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-sm transition-all font-medium"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALERT & CONTENT TABLE (Gunakan finalSearch di sini) */}
      {/* --- NOTIFIKASI SUKSES (Pojok Kanan Atas - 8 Detik) --- */}
      {success && (
        <AlertMessage 
          type="success" 
          message={success} 
          onClose={() => setSuccess("")} 
        />
      )}

      {/* --- NOTIFIKASI ERROR (Pojok Kanan Atas - 8 Detik) --- */}
      {error && (
        <AlertMessage 
          type="error" 
          message={error} 
          onClose={() => setError("")} 
        />
      )}

      {(() => {
        const allPesertaRaw = kelompokUmur.flatMap(ku => ku.peserta || []);
        const allFilteredPeserta = kelompokUmur.flatMap(ku => 
          (ku.peserta || []).filter(p => 
            p.namaLengkap.toLowerCase().includes(finalSearch.toLowerCase())
          )
        );

        if (allPesertaRaw.length === 0) {
          return (
            <div className="p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <User size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">Belum ada peserta terdaftar.</p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {kelompokUmur.map((ku) => {
              const filteredPeserta = (ku.peserta || []).filter((p) =>
                p.namaLengkap.toLowerCase().includes(finalSearch.toLowerCase())
              );

              if (finalSearch !== "" && filteredPeserta.length === 0) return null;
              if (ku.peserta.length === 0) return null;

              const isCollapsed = collapsedGroups[ku.id];

              return (
                <div key={ku.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                  <button 
                    onClick={() => toggleGroup(ku.id)}
                    className="w-full flex items-center justify-between p-5 bg-gray-50/50 hover:bg-gray-100/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-yellow-500 text-white rounded-xl flex items-center justify-center font-black text-sm">
                        {ku.nama.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">{ku.nama}</h2>
                        <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest mt-1 block">
                          {filteredPeserta.length} Peserta
                        </span>
                      </div>
                    </div>
                    {isCollapsed ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronUp size={20} className="text-gray-400" />}
                  </button>

                  {!isCollapsed && (
                  <div className="overflow-x-auto border-t border-gray-50">
  <table className="w-full text-left border-collapse">
    <thead>
      <tr className="bg-gray-50/30">
        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-16">No</th>
        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama</th>
        
        {/* Kolom Kontak hanya untuk Admin */}
        {(role === "admin" || role === "panitia") && (
          <th className="hidden md:table-cell px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kontak</th>
        )}
        
        <th className="hidden md:table-cell px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-50">
      {filteredPeserta.map((p, index) => (
        <tr key={p.id} className="hover:bg-yellow-50/20 transition-colors group">
          <td className="px-6 py-4 text-xs font-bold text-gray-300 text-center">{index + 1}</td>
          
          <td className="px-6 py-4">
            <span className="text-sm font-black text-gray-800 block group-hover:text-yellow-600 transition-colors">
              {p.namaLengkap}
            </span>

            {/* TANGGAL LAHIR: Hanya Admin yang lihat */}
            {(role === "admin" || role === "panitia") && (
              <span className="text-[10px] text-gray-400 font-bold uppercase block">
                {p.tanggalLahir || "Tgl Lahir -"}
              </span>
            )}

            {/* STATUS (Verified/Pending): Muncul di Mobile DAN Desktop (jika bukan admin) */}
            <div className={`${(role === "admin" || role === "panitia") ? "md:hidden" : "block"} mt-1`}>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-black uppercase
                ${p.status === "pending" ? "bg-yellow-100 text-yellow-700" : 
                  p.status === "verified" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {p.status}
              </span>
            </div>
          </td>

          {/* KOLOM KONTAK: Hanya Admin */}
          {(role === "admin" || role === "panitia") && (
            <td className="hidden md:table-cell px-6 py-4">
              <span className="text-xs font-bold text-gray-600 block">{p.nomorWhatsapp || "-"}</span>
              {/* Status untuk Admin di Desktop muncul di sini */}
              <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase
                  ${p.status === "pending" ? "bg-yellow-100 text-yellow-700" : 
                    p.status === "verified" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {p.status}
              </span>
            </td>
          )}

          <td className="hidden md:table-cell px-6 py-4">
            <div className="flex justify-center gap-2">
              {(role === "admin" || role === "panitia") ? (
                <>
                  <Link to={`/${role}/detail-peserta/${p.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Eye size={16} />
                  </Link>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </>
              ) : (
                <span className="text-gray-300 text-[9px] font-black uppercase italic border px-2 py-1 rounded-lg">
                  Limited View
                </span>
              )}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* MODAL KONFIRMASI HAPUS TETAP SAMA */}
      {confirmDelete.show && (
        <AlertMessage 
          type="warning" 
          message="Yakin mau menghapus peserta ini? Data yang sudah dihapus tidak bisa dikembalikan." 
          onClose={() => setConfirmDelete({ show: false, pesertaId: null })}
        >
         <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
            <button
              onClick={() => setConfirmDelete({ show: false, pesertaId: null })}
              className="flex-1 order-2 sm:order-1 min-h-[56px] px-8 py-4 rounded-2xl bg-gray-100 text-gray-800 font-black text-sm uppercase tracking-tighter hover:bg-gray-200 active:scale-95 transition-all border-2 border-transparent"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmDelete}
              className="flex-1 order-1 sm:order-2 min-h-[56px] px-8 py-4 rounded-2xl bg-red-600 text-white font-black text-sm uppercase tracking-tighter shadow-[0_10px_20px_rgba(220,38,38,0.3)] hover:bg-red-700 active:scale-95 transition-all"
            >
              Ya, Hapus
            </button>
          </div>
        </AlertMessage>
      )}
    </div>
  );
}

export default Peserta;