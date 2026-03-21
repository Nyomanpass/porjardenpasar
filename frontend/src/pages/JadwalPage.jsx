import React, { useState, useEffect } from 'react';
import api from '../api';
import WinnerModal from "../components/modalbox/WinnerModal";
import { Edit, Scale, Calendar, Clock, PlusCircle, CheckCircle, XCircle, Layout, Filter, ChevronUp } from "lucide-react";
import { PDFDownloadLink } from '@react-pdf/renderer';
import JadwalPDF from './JadwalPDF';
import RefereeForm from './RefereeForm';
import AlertMessage from '../components/AlertMessage';


const JadwalPage = () => {
  const [jadwal, setJadwal] = useState([]);
  const [matches, setMatches] = useState([]);
  const [lapangan, setLapangan] = useState([]);
  const role = localStorage.getItem('role');
  const selectedTournamentName = localStorage.getItem("selectedTournamentName");
  const [isRefereeMode, setIsRefereeMode] = useState(false);
  const [activeMatchData, setActiveMatchData] = useState(null);
  
  // --- STATE BARU UNTUK PILIH BAGAN ---
  const [baganList, setBaganList] = useState([]);
  const [selectedBaganId, setSelectedBaganId] = useState('');

  // Form state
  const [selectedMatch, setSelectedMatch] = useState('');
  const [selectedLapangan, setSelectedLapangan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [waktuMulai, setWaktuMulai] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State untuk mode edit
  const [editingJadwalId, setEditingJadwalId] = useState(null);


  //filter jadwal dnegna tanggal
  const [selectedTanggalFilter, setSelectedTanggalFilter] = useState('');
  const [readyToDownload, setReadyToDownload] = useState(false);

  const [filterBaganKategori, setFilterBaganKategori] = useState("all");

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [scoreRules, setScoreRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState("");
  const [pendingJadwal, setPendingJadwal] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);

  const [showForm, setShowForm] = useState(true); 

  const [manualWinnerMatch, setManualWinnerMatch] = useState(null);

  const [ruleMode, setRuleMode] = useState(null); 



  const uniqueTanggal = [...new Set(jadwal.map(j => j.tanggal))].sort(
  (a, b) => new Date(a) - new Date(b)
  );

  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    jadwalId: null,
  });



// --- GANTI DENGAN KODE INI ---
useEffect(() => {
  if (uniqueTanggal.length > 0 && !selectedTanggalFilter) {
    // 1. Dapatkan tanggal hari ini (Format YYYY-MM-DD)
    const today = new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    // 2. Cek apakah hari ini ada di daftar jadwal
    const isTodayAvailable = uniqueTanggal.includes(today);

    if (isTodayAvailable) {
      // JIKA ADA HARI INI: Aktifkan hari ini
      setSelectedTanggalFilter(today);
    } else {
      // JIKA TIDAK ADA: Ambil tanggal paling besar/terakhir
      // Karena uniqueTanggal sudah di-sort (a - b), maka index terakhir adalah yang terbesar
      const tanggalTerakhir = uniqueTanggal[uniqueTanggal.length - 1];
      setSelectedTanggalFilter(tanggalTerakhir);
    }
  }
}, [uniqueTanggal, selectedTanggalFilter]);


  useEffect(() => {
    fetchJadwal();
    fetchBagan();
    fetchLapangan();
  }, []);



  // --- Gunakan useEffect ini untuk memuat matches saat bagan dipilih ---
  useEffect(() => {
    // Hanya memuat matches jika ada bagan yang dipilih
    if (selectedBaganId) {
      fetchMatches(selectedBaganId);
    } else {
      // Kosongkan matches jika tidak ada bagan yang dipilih
      setMatches([]);
    }
  }, [selectedBaganId]);

  useEffect(() => {
    api.get("/score-rules").then(res => setScoreRules(res.data));
  }, []);


  useEffect(() => {
    const reloadAll = () => {
      fetchBagan();          // ← ambil bagan baru sesuai tournament baru
      setSelectedBaganId(""); // ← reset bagan yg dipilih
      setMatches([]);         // ← kosongkan match dulu
      fetchJadwal();
    };

    window.addEventListener("tournament-changed", reloadAll);

    return () => window.removeEventListener("tournament-changed", reloadAll);
  }, []);



  const fetchJadwal = async () => {
    try {
      const tournamentId = localStorage.getItem("selectedTournament");
      const response = await api.get('/jadwal', {
        params: { tournamentId }
      });
      setJadwal(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError('Gagal mengambil jadwal.');
    }
  };

  // --- FUNGSI BARU UNTUK MENGAMBIL DAFTAR BAGAN ---
const fetchBagan = async () => {
  try {
    const newTournamentId = localStorage.getItem("selectedTournament"); // ← ambil ulang setiap kali fetch
    const res = await api.get("/bagan", {
      params: { tournamentId: newTournamentId }
    });

    setBaganList(res.data);
  } catch (err) {
    console.error("Gagal fetch bagan:", err);
  }
};


  const fetchMatches = async (baganId, currentEditingId = null) => {
    try {
      const newTournamentId = localStorage.getItem("selectedTournament");
      const response = await api.get('/matches', {
        params: { baganId: baganId, tournamentId: newTournamentId }
      });
      
      let data = response.data;

      let matchesBelumSelesai = data.filter(
        m => m.status === 'belum' || m.status === 'aktif'
      );

      // Gunakan currentEditingId dari parameter, bukan dari state global
      matchesBelumSelesai = matchesBelumSelesai.filter(
        m => !jadwal.some(j => j.matchId === m.id && j.id !== (currentEditingId || editingJadwalId))
      );

      setMatches(matchesBelumSelesai);
      return matchesBelumSelesai; 
    } catch (err) {
      console.error('Error:', err);
    }
  };


  const fetchLapangan = async () => {
    try {
      const response = await api.get('/lapangan');
      setLapangan(response.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleEditClick = async (jadwalData) => { 
    // 1. Set ID yang sedang diedit ke state
    setEditingJadwalId(jadwalData.id);
    
    const baganId = jadwalData.match.baganId;
    setSelectedBaganId(baganId);
    
    // 2. Oper jadwalData.id secara langsung sebagai argumen kedua
    // Ini memastikan filter di fetchMatches tahu bahwa match ini BOLEH muncul
    await fetchMatches(baganId, jadwalData.id); 

    // 3. Baru set matchId-nya
    setSelectedMatch(jadwalData.matchId);
    setSelectedLapangan(jadwalData.lapanganId);
    setTanggal(jadwalData.tanggal);

    const waktuMulaiFormatted = jadwalData.waktuMulai.slice(11, 16);
    setWaktuMulai(waktuMulaiFormatted);
    
    setSuccess('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingJadwalId(null);
    setSelectedBaganId(''); // Tambahkan ini
    setMatches([]);
    setSelectedMatch('');
    setSelectedLapangan('');
    setTanggal('');
    setWaktuMulai('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedMatch || !selectedLapangan || !tanggal || !waktuMulai) {
      setError('Semua kolom harus diisi.');
      return;
    }

    const waktuMulaiFull = `${tanggal}T${waktuMulai}:00.000Z`;
    const tournamentId = localStorage.getItem("selectedTournament");

    const jadwalData = {
      matchId: selectedMatch,
      lapanganId: selectedLapangan,
      tanggal,
      waktuMulai: waktuMulaiFull,
      tournamentId
    };

    try {
      if (editingJadwalId) {
        await api.put(`/jadwal/${editingJadwalId}`, jadwalData);
        setSuccess('Jadwal berhasil diperbarui!');
        handleCancelEdit(); // Ini biasanya sudah mereset form
         // --- RESET FORM SECARA TOTAL ---
        setSelectedBaganId(null); // Reset pilihan bagan
        setSelectedMatch('');
        setSelectedLapangan('');
        setTanggal('');
        setWaktuMulai('');
      } else {
        await api.post('/jadwal', jadwalData);
        setSuccess('Jadwal berhasil dibuat!');
        
        // --- RESET FORM SECARA TOTAL ---
        setSelectedBaganId(null); // Reset pilihan bagan
        setSelectedMatch('');
        setSelectedLapangan('');
        setTanggal('');
        setWaktuMulai('');
      }
      
      // Refresh data dari database
      fetchJadwal();

    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Gagal menyimpan jadwal.');
    }
  };
    
  const handleUpdateStatus = async (jadwalId, newStatus) => {
    try {
      await api.put(`/jadwal/${jadwalId}/status`, { status: newStatus });
      setSuccess('Status jadwal berhasil diubah.');
      fetchJadwal();
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Gagal mengubah status jadwal.');
    }
  };

  const handleDeleteJadwal = (jadwalId) => {
    setConfirmDelete({
      show: true,
      jadwalId: jadwalId,
    });
  };

  const confirmDeleteJadwal = async () => {
    try {
      await api.delete(`/jadwal/${confirmDelete.jadwalId}`);
      setSuccess("Jadwal berhasil dihapus.");
      fetchJadwal();
    } catch (err) {
      setError("Gagal menghapus jadwal.");
    } finally {
      setConfirmDelete({ show: false, jadwalId: null });
    }
  };

  const filteredMatches = matches.filter((m) => {
    const isAlreadyScheduled = jadwal.some(
      (j) => Number(j.matchId) === Number(m.id)
    );

    if (editingJadwalId && Number(selectedMatch) === Number(m.id)) {
      return true;
    }
    return !isAlreadyScheduled;
  });
  
const groupedJadwal = [...jadwal]
  .sort((a, b) => {
    // 1. Urutkan berdasarkan lapangan
    if (a.lapanganId !== b.lapanganId) {
      return a.lapanganId - b.lapanganId;
    }
    // 2. Jika lapangan sama, urutkan berdasarkan waktu
    return new Date(a.waktuMulai) - new Date(b.waktuMulai);
  })
  .reduce((acc, currentJadwal) => {
    const lapanganName = currentJadwal.lapangan?.nama || "Lapangan Tidak Dikenal";
    if (!acc[lapanganName]) {
      acc[lapanganName] = [];
    }
    acc[lapanganName].push(currentJadwal);
    return acc;
  }, {});


  const lapanganList = Object.keys(groupedJadwal);

  const openRefereePanel = (jadwal) => {
    setActiveMatchData(jadwal); // Menyimpan data match yang dipilih
    setIsRefereeMode(true);     // Pindah ke tampilan wasit
  };


  if (isRefereeMode) {
    return (
      <RefereeForm 
        match={activeMatchData.match} 
        onFinish={async (finalData) => {
          try {
            // 1. Update status JADWAL menjadi selesai
            await api.put(`/jadwal/${activeMatchData.id}/status`, { 
              status: 'selesai' 
            });

            // 2. Keluar dari mode wasit
            setIsRefereeMode(false);

            // 3. Refresh data agar kartu langsung jadi hijau dan skor muncul
            fetchJadwal();
            setSuccess("Pertandingan selesai & skor otomatis tersimpan!");
          } catch (err) {
            console.error("Gagal menutup jadwal:", err);
            setIsRefereeMode(false);
          }
        }}
        onBack={() => setIsRefereeMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen">
      {/* Notifikasi */}
      <AlertMessage
        type="success"
        message={success}
        onClose={() => setSuccess("")}
      />

<AlertMessage
  type="error"
  message={error}
  onClose={() => setError("")}
/>

{/* --- HEADER UTAMA --- */}
<div className="mb-6 border-gray-100">
    <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
            Jadwal Pertandingan
        </h1>
        <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-100 md:bg-transparent md:border-none md:px-0">
            <p className="text-[10px] md:text-sm text-yellow-700 md:text-yellow-600 font-bold uppercase tracking-widest">
                Tournament: {selectedTournamentName || "Semua Tournament"}
            </p>
        </div>
    </div>
</div>

  
  {/* --- BAGIAN FORM: ADMIN --- */}
{(role === "admin" || role === "panitia") && (
  <div className="mb-10">
    {/* 1. TOMBOL UNTUK MEMBUKA KEMBALI FORM (Hanya muncul jika showForm false) */}
    {!showForm && (
      <div className="flex justify-start">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-3 bg-slate-900 text-white py-4 px-8 rounded-2xl shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all font-black text-xs uppercase tracking-[0.2em] transform active:scale-95 animate-in fade-in zoom-in duration-300"
        >
          <PlusCircle size={20} />
          Buat / Edit Jadwal Pertandingan
        </button>
      </div>
    )}

    {/* 2. FORM UTAMA (Hanya muncul jika showForm true) */}
    {showForm && (
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-200">
              {editingJadwalId ? <Edit className="text-yellow-900" size={24} /> : <PlusCircle className="text-yellow-900" size={24} />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 leading-none">
                {editingJadwalId ? 'Update Jadwal' : 'Buat Jadwal Baru'}
              </h2>
              <p className="text-slate-400 text-sm font-medium mt-1">Atur waktu dan lapangan pertandingan</p>
            </div>
          </div>

          {/* TOMBOL TUTUP FORM */}
          <button 
            type="button"
            onClick={() => setShowForm(false)}
            className="flex flex-col items-center gap-1 p-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all group border border-transparent hover:border-red-100"
            title="Sembunyikan Form"
          >
            <ChevronUp size={20} className="group-hover:-translate-y-1 transition-transform" />
            <span className="text-[8px] font-black uppercase tracking-tighter">Tutup</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* --- SELEKSI BAGAN --- */}
          <div className="space-y-4">
            <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Layout size={16} className="text-blue-600" /> Pilih Kelompok Umur
            </label>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200/50">
              {["all", "single", "double"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterBaganKategori(cat)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filterBaganKategori === cat 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {cat === "all" ? "Semua" : cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {baganList
                .filter(b => filterBaganKategori === "all" ? true : b.kategori === filterBaganKategori)
                .sort((a, b) => a.kelompokUmurId - b.kelompokUmurId)
                .map((bagan) => {
                  const ringkasNama = bagan.nama
                    .replace(/Bagan/gi, '')
                    .replace(/\(Tunggal\)/gi, '')
                    .replace(/\(Ganda\)/gi, '')
                    .trim();

                  return (
                    <button
                      key={bagan.id}
                      type="button"
                      onClick={() => setSelectedBaganId(Number(bagan.id))}
                      className={`group relative py-3 px-5 rounded-2xl transition-all duration-300 border shadow-sm flex flex-col items-start gap-1 min-w-[100px]
                        ${selectedBaganId === Number(bagan.id)
                          ? 'bg-blue-600 border-blue-700 ring-4 ring-blue-100'
                          : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
                        }
                      `}
                    >
                      <span className={`text-xs font-black uppercase tracking-tight ${
                        selectedBaganId === Number(bagan.id) ? 'text-white' : 'text-slate-700'
                      }`}>
                        {ringkasNama}
                      </span>
                      <span className={`text-[8px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-md ${
                        selectedBaganId === Number(bagan.id) 
                        ? 'bg-blue-500 text-blue-100' 
                        : 'bg-slate-100 text-slate-400'
                      }`}>
                        {bagan.kategori}
                      </span>
                    </button>
                  );
                })
              }
            </div>
          </div>

          {/* Match Selection */}
          <div className="max-w-5xl">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Pertandingan:</label>
            <select
              value={selectedMatch}
              onChange={(e) => setSelectedMatch(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-100 p-4 shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-slate-50 font-bold text-slate-700 text-sm outline-none appearance-none"
              disabled={!selectedBaganId}
            >
              <option value="">-- Pilih Match --</option>
              {filteredMatches.map((m) => {
                const p1 = m.doubleTeam1?.namaTim || m.peserta1?.namaLengkap || 'TBD';
                const p2 = m.doubleTeam2?.namaTim || m.peserta2?.namaLengkap || 'TBD';
                return (
                  <option key={m.id} value={m.id}>{p1} vs {p2}</option>
                );
              })}
            </select>
            {!selectedBaganId && <p className="text-[10px] text-red-400 mt-2 font-bold italic"> Pilih kategori umur dulu.</p>}
          </div>
                
          {/* Grid Input Utama */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Lapangan:</label>
              <select
                value={selectedLapangan}
                onChange={(e) => setSelectedLapangan(e.target.value)}
                className="w-full rounded-2xl border-2 border-slate-100 p-4 shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-slate-50 font-bold text-slate-700 text-sm outline-none"
              >
                <option value="">-- Lapangan --</option>
                {lapangan.map((l) => (
                  <option key={l.id} value={l.id}>{l.nama}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Tanggal:</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full rounded-2xl border-2 border-slate-100 p-4 shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-slate-50 font-bold text-slate-700 text-sm outline-none"
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Waktu:</label>
              <select
                value={waktuMulai}
                onChange={(e) => setWaktuMulai(e.target.value)}
                className="w-full rounded-2xl border-2 border-slate-100 p-4 shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-slate-50 font-bold text-slate-700 text-sm outline-none"
              >
                <option value="">Pilih Jam</option>
                {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((jam) => (
                  <option key={jam} value={`${jam.toString().padStart(2, '0')}:00`}>
                    Pukul {jam}:00
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Tombol Aksi Form */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-400 italic">Pastikan data sudah benar sebelum menyimpan.</p>
            <div className="flex gap-3">
              {editingJadwalId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 bg-slate-100 text-slate-500 py-3 px-8 rounded-[1.2rem] hover:bg-slate-200 transition-all font-black text-xs uppercase tracking-widest"
                >
                  <XCircle size={18}/> Batal
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-3 bg-slate-900 text-white py-4 px-10 rounded-[1.2rem] shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all font-black text-xs uppercase tracking-[0.2em] transform active:scale-95"
              >
                {editingJadwalId ? <Edit size={18}/> : <PlusCircle size={18}/>}
                {editingJadwalId ? 'Simpan Update' : 'Publish Jadwal'}
              </button>
            </div>
          </div>
        </form>
      </div>
    )}
  </div>
)}

  
  {/* --- BAGIAN FILTER DAN DOWNLOAD PDF --- */}
<div className="mb-8 p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
    
    {/* Filter Sisi Kiri - Full Width di Mobile */}
    <div className="flex-1 w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-yellow-50 rounded-lg">
          <Filter size={18} className="text-yellow-600" />
        </div>
        <p className="text-[11px] md:text-sm font-black text-gray-400 uppercase tracking-widest">Filter Tanggal</p>
      </div>

      {/* Container Button - Scroll Horizontal di Mobile jika tgl sangat banyak */}
      <div className="flex flex-wrap md:flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
       {uniqueTanggal.map(tgl => (
          <button
            key={tgl}
            onClick={() => setSelectedTanggalFilter(tgl)}
            className={`whitespace-nowrap py-2.5 px-4 md:px-5 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 
              ${selectedTanggalFilter === tgl 
                ? 'bg-yellow-500 text-gray-900 shadow-md transform scale-105' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-200 border border-gray-100'}
            `}
          >
            {new Date(tgl).toLocaleDateString('id-ID', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })}
          </button>
        ))}
        
        {selectedTanggalFilter && (
          <button
            onClick={() => setSelectedTanggalFilter('')}
            className="py-2.5 px-4 rounded-xl font-bold text-xs md:text-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>

    {/* --- BAGIAN TOMBOL EXPORT PDF --- */}
    {(role === "admin" || role === "panitia") && (
      <div className="w-full md:w-auto flex items-center md:border-l border-gray-100 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0">
        {!readyToDownload ? (
          <button
            onClick={() => setReadyToDownload(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 py-3 px-8 rounded-xl font-black text-xs md:text-sm bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-100"
          >
            <Layout size={18}/> SIAPKAN PDF
          </button>
        ) : (
          <PDFDownloadLink
            document={
              <JadwalPDF 
                jadwal={selectedTanggalFilter 
                  ? jadwal.filter(j => j.tanggal === selectedTanggalFilter) 
                  : jadwal
                } 
                lapanganList={[...new Set(jadwal.map(j => j.lapangan?.nama))].filter(Boolean)} 
                selectedTanggal={selectedTanggalFilter}
                tournamentName={selectedTournamentName}
              />
            }
            fileName={`Jadwal_${selectedTournamentName || 'Turnamen'}.pdf`}
            className="w-full md:w-auto flex items-center justify-center gap-2 py-3 px-8 rounded-xl font-black text-xs md:text-sm bg-green-600 text-white hover:bg-green-700 transition shadow-lg shadow-green-100"
          >
            {({ loading }) => (
              loading ? (
                <span className="flex items-center gap-2 animate-pulse">Memproses...</span>
              ) : (
                <span className="flex items-center gap-2" onClick={() => setTimeout(() => setReadyToDownload(false), 2000)}>
                   ✅ DOWNLOAD JADWAL
                </span>
              )
            )}
          </PDFDownloadLink>
        )}
      </div>
    )}
  </div>
</div>


{/* ===== TAMPILAN JADWAL PREMIUM (WARNA KONTRAS & RAPI) ===== */}
{lapanganList.length > 0 ? (
  /* Container utama dengan overflow-x-auto agar bisa di-swipe di mobile */
  <div className="w-full overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 bg-white">
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
      <table className="w-full min-w-[600px] md:min-w-full table-fixed border-separate border-spacing-x-1 md:border-spacing-x-2 border-spacing-y-2">
        
        <colgroup>
          {/* Kolom JAM lebih ramping di mobile */}
          <col className="w-[60px] md:w-[80px]" />
          {lapanganList.map((_, i) => (
            <col key={i} className="w-[200px] md:w-auto" />
          ))}
        </colgroup>

        <thead>
          <tr>
            <th className="py-4 md:py-6 sticky left-0 z-40 bg-white/95 backdrop-blur-sm shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col items-center justify-center opacity-60">
                <Clock size={14} className="text-black mb-1 md:size-[16px]" />
                <span className="text-[8px] md:text-[10px] font-black text-black uppercase tracking-widest">JAM</span>
              </div>
            </th>
            {lapanganList.map((lap) => (
              <th key={lap} className="py-4 md:py-6 px-1">
                <div className="bg-white border-2 border-yellow-500 py-2 md:py-2.5 px-2 md:px-4 rounded-xl md:rounded-2xl text-[10px] md:text-[12px] font-black text-gray-900 uppercase tracking-widest shadow-sm flex items-center justify-center gap-1.5 md:gap-2">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></span>
                  <span className="truncate">{lap}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-transparent">
          {[...new Set(
            jadwal
              .filter(j => !selectedTanggalFilter || j.tanggal === selectedTanggalFilter)
              .map(j => j.waktuMulai.slice(11, 16))
          )]
            .sort()
            .map((jam) => (
              <tr key={jam} className="group">
                {/* Kolom JAM Sticky agar saat swipe ke kanan, jam tetap terlihat */}
                <td className="py-2 md:py-4 sticky left-0 z-40 bg-white/95 backdrop-blur-sm group-hover:bg-yellow-50 transition-colors rounded-xl md:rounded-2xl shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                  <div className="text-center">
                    <span className="block text-sm md:text-md font-extrabold text-gray-900 leading-none tracking-tighter">{jam}</span>
                  </div>
                </td>

                {lapanganList.map((lap) => {
                  const match = jadwal.find(j =>
                    j.waktuMulai.slice(11, 16) === jam &&
                    j.lapangan?.nama === lap &&
                    j.tanggal === selectedTanggalFilter
                  );

                  return (
                    <td key={lap} className="py-2 md:py-3 align-top">
                      {match ? (
                        <div className="h-full bg-white border border-gray-100 rounded-[1.2rem] md:rounded-[1.8rem] p-3 md:p-5 shadow-md hover:shadow-xl hover:border-yellow-400 md:hover:-translate-y-1 transition-all duration-300 relative group/card overflow-hidden">
                          
                          {/* Menu Admin (⋮) */}
                          {["admin", "panitia", "wasit"].includes(role) && (
                            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-30">
                              <button
                                onClick={() => setOpenMenuId(openMenuId === match.id ? null : match.id)}
                                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-yellow-500 hover:text-white transition-all shadow-sm"
                              >
                                <span className="font-black text-sm md:text-lg">⋮</span>
                              </button>
                              
                              {/* Dropdown Menu disesuaikan ukurannya */}
                              {openMenuId === match.id && (
                                <div className="absolute right-0 mt-2 bg-white rounded-xl md:rounded-2xl shadow-2xl z-50 min-w-[120px] md:min-w-[140px] overflow-hidden border border-slate-100">
                                  {(role === "admin" || role === "panitia") && (
                                  
                                    <button onClick={() => { handleEditClick(match); setOpenMenuId(null); }} className="block w-full text-left px-4 py-2.5 hover:bg-yellow-50 text-[10px] md:text-[11px] font-extrabold text-gray-700 border-b border-gray-50">Edit</button>
                                  )}
                                  {match.status !== "selesai" && ["admin", "panitia", "wasit"].includes(role) && (
                                    <button onClick={() => {
                                        setPendingJadwal(match);
                                        setRuleMode("manual");

                                        if (!match.match.scoreRuleId) {
                                          setShowRuleModal(true);
                                        } else {
                                          setManualWinnerMatch(match.match);
                                        }

                                        setOpenMenuId(null);
                                      }}
                                    className="block w-full text-left px-4 py-2.5 hover:bg-blue-50 text-[10px] md:text-[11px] font-extrabold text-blue-500 border-b border-gray-50">Input Pemenang</button>
                                  )}
                                  {(role === "admin" || role === "panitia") && (
                                    <button onClick={() => { handleDeleteJadwal(match.id); setOpenMenuId(null); }} className="block w-full text-left px-4 py-2.5 hover:bg-red-50 text-[10px] md:text-[11px] font-extrabold text-red-600">Hapus</button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex flex-col h-full">
                            <div className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase tracking-wider mb-2 md:mb-3 truncate pr-8">
                              {match.match?.bagan?.nama || 'Tournament'}
                            </div>
                            
                            {/* Nama Tim/Pemain dengan text wrap yang lebih baik */}
                            <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                              <p className="font-black text-gray-900 text-[11px] md:text-[13px] leading-tight line-clamp-2 uppercase">
                                {match.match?.doubleTeam1?.namaTim || match.match?.peserta1?.namaLengkap}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="h-[1px] flex-1 bg-gray-100"></div>
                                <span className="text-[8px] font-black text-gray-300 italic">VS</span>
                                <div className="h-[1px] flex-1 bg-gray-100"></div>
                              </div>
                              <p className="font-black text-gray-900 text-[11px] md:text-[13px] leading-tight line-clamp-2 uppercase">
                                {match.match?.doubleTeam2?.namaTim || match.match?.peserta2?.namaLengkap}
                              </p>
                            </div>

                            <div className="mt-auto pt-2 md:pt-3 border-t border-gray-50 flex flex-col gap-2 md:gap-3">
                               <div className="flex items-center justify-between gap-1">
                                  <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest truncate
                                    ${match.status === "selesai" ? "bg-green-500 text-white" : 
                                      match.status === "berlangsung" ? "bg-yellow-500 text-gray-900 animate-pulse" : 
                                      "bg-blue-500 text-white"}`}
                                  >
                                    {match.status}
                                  </span>
                                   

                               </div>

                                {/* Tombol Aksi Wasit/Admin */}
                                {["admin", "panitia", "wasit"].includes(role) && (
                                  <div className="w-full">
                                    {(match.status === "terjadwal" || match.status === "belum" || match.status === "aktif") && (
                                      <button
                                        onClick={() => handleUpdateStatus(match.id, "berlangsung")}
                                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-[9px] md:text-[10px] font-black rounded-lg md:rounded-xl py-2 md:py-2.5 transition-all flex items-center justify-center gap-1 md:gap-2"
                                      >
                                            <CheckCircle size={16} className="md:w-[18px] md:h-[18px] text-white" />
                                            <span className="tracking-wide text-white">MULAI</span>

                                      </button>
                                    )}

                                    {match.status === "berlangsung" && (
                                        <button
                                           onClick={() => {
                                              // simpan jadwal yg diklik
                                              setPendingJadwal(match);

                                              // tentukan mode wasit
                                              setRuleMode("wasit");

                                              // kalau match belum punya rule → buka modal pilih rule
                                              if (!match.match.scoreRuleId) {
                                                setShowRuleModal(true);
                                              } else {
                                                // kalau sudah ada rule → langsung buka panel wasit
                                                openRefereePanel(match);
                                              }
                                            }}
                                          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-[9px] md:text-[10px] font-black rounded-lg md:rounded-xl py-2 md:py-2.5 transition-all flex items-center justify-center gap-1 md:gap-2"
                                      >
                                        PANEL WASIT
                                      </button>
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Slot Kosong */
                        <div className="h-full flex items-center justify-center py-6 md:py-10 opacity-20">
                           <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-slate-400"></div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
) : (
  <div className="py-12 md:py-24 text-center bg-gray-50 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-gray-200 m-4">
    <Calendar size={32} className="text-gray-300 mx-auto mb-4 md:size-[48px]" />
    <h3 className="text-lg md:text-xl font-bold text-gray-700">Tidak Ada Jadwal</h3>
    <p className="text-xs md:text-sm text-gray-500">Pilih tanggal lain atau buat jadwal baru.</p>
  </div>
)}



{showRuleModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999]">
    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 p-7 animate-in fade-in zoom-in duration-300">

      {/* HEADER */}
      <div className="text-center mb-5">
        <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <Scale size={24} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-800">
          Pilih Aturan Skor
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Tentukan sistem perhitungan skor sebelum pertandingan dimulai
        </p>
      </div>

      {/* SELECT */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Aturan Skor
        </label>
        <select
          value={selectedRule}
          onChange={(e) => setSelectedRule(e.target.value)}
          className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800
                     focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
        >
          <option value="">-- Pilih Rule --</option>
          {scoreRules.map(r => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* ACTION */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => {
            setShowRuleModal(false);
            setSelectedRule("");
          }}
          className="w-1/2 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
        >
          Batal
        </button>

        <button
          disabled={!selectedRule}
          onClick={async () => {
            await api.patch(`/matches/${pendingJadwal.match.id}/set-rule`, {
              scoreRuleId: selectedRule
            });

            const updatedMatch = {
              ...pendingJadwal.match,
              scoreRuleId: selectedRule
            };

            const updatedJadwal = {
              ...pendingJadwal,
              match: updatedMatch
            };

            setPendingJadwal(updatedJadwal);
            setShowRuleModal(false);

            if (ruleMode === "wasit") {
              openRefereePanel(updatedJadwal);
            }

            if (ruleMode === "manual") {
              setManualWinnerMatch(updatedMatch);
            }

            setRuleMode(null);
            setSelectedRule("");
          }}
          className={`w-1/2 py-3 rounded-xl font-extrabold text-white transition-all shadow-lg
            ${selectedRule
              ? "bg-blue-600 hover:bg-blue-700 active:scale-95"
              : "bg-blue-300 cursor-not-allowed"
            }
          `}
        >
          Lanjutkan
        </button>
      </div>

    </div>
  </div>
)}


{/* MODAL KONFIRMASI HAPUS JADWAL (Style Raksasa & Mewah) */}
{confirmDelete.show && (
  <AlertMessage
    type="warning"
    message="Hapus jadwal ini. Match akan kembali ke daftar tersedia untuk dijadwalkan ulang."
    onClose={() => setConfirmDelete({ show: false, jadwalId: null })}
  >
    <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
      <button
        onClick={() => setConfirmDelete({ show: false, jadwalId: null })}
        className="flex-1 order-2 sm:order-1 min-h-[56px] px-8 py-4 rounded-2xl bg-gray-100 text-gray-800 font-black text-sm uppercase tracking-tighter hover:bg-gray-200 active:scale-95 transition-all"
      >
        Batal
      </button>
      <button
        onClick={confirmDeleteJadwal}
        className="flex-1 order-1 sm:order-2 min-h-[56px] px-8 py-4 rounded-2xl bg-red-600 text-white font-black text-sm uppercase tracking-tighter shadow-[0_10px_20px_rgba(220,38,38,0.3)] hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <XCircle size={20} /> Ya, Hapus
      </button>
    </div>
  </AlertMessage>
)}

{manualWinnerMatch && (
  <WinnerModal
    match={manualWinnerMatch}
    onClose={() => setManualWinnerMatch(null)}
    onSaved={() => {
      setManualWinnerMatch(null);
      fetchJadwal(); // refresh tabel
    }}
  />
)}


</div>



  );
};

export default JadwalPage;