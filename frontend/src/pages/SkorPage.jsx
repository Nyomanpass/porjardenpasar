import React, { useState, useEffect } from "react";
import api from "../api";
import jsPDF from "jspdf";
import { useLocation } from "react-router-dom";


import { 
  Trophy, Calendar, Search, 
  ChevronRight, Clock, Users, User, Tag, Layers
} from "lucide-react";

function SkorPage() {
  const [matchHistory, setMatchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tiebreakSummary, setTiebreakSummary] = useState({});
  const location = useLocation();
  const highlightMatchId = location.state?.matchId;
  
  // State Filter (Kategori Dihapus)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKU, setFilterKU] = useState("Semua");
  const [filterType, setFilterType] = useState("Semua");
  const [filterDate, setFilterDate] = useState("Semua");

  // State Modal
  const [selectedLog, setSelectedLog] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMatchInfo, setActiveMatchInfo] = useState(null);

// Fungsi fetch dipisah agar bisa dipanggil berulang kali


 // Fungsi fetch dipisah agar bisa dipanggil berulang kali
const fetchHistory = async () => {
  try {
    setIsLoading(true);
    const tournamentId = localStorage.getItem("selectedTournament");
    if (!tournamentId) {
      setMatchHistory([]);
      setIsLoading(false);
      return;
    }

    const response = await api.get("/matches", {
      params: { tournamentId: tournamentId, status: "selesai" }
    });

    const matches = response.data;
    setMatchHistory(matches);

    const newTiebreakSummary = {};

    for (const match of matches) {
      // Penentuan Trigger Tiebreak: 
      // Jika set sampai 6, TB di 6-6. Jika set sampai 8 (Pro Set), TB di 7-7 atau 8-8 tergantung rules.
      // Kita asumsikan standar: TB selalu terjadi jika skor akhir selisih 1 dan mencapai batas gamePerSet.
      const gameLimit = match.scoreRule?.gamePerSet || 6;

      const totalSetPlayed = match.score1 + match.score2;

      const needsTiebreak =
        // Tiebreak normal (7-6)
        [1, 2].some((sNum) => {
          const s1 = parseInt(match[`set${sNum}P1`]);
          const s2 = parseInt(match[`set${sNum}P2`]);

          return (
            !isNaN(s1) &&
            !isNaN(s2) &&
            Math.abs(s1 - s2) === 1 &&
            (s1 >= gameLimit || s2 >= gameLimit)
          );
        })
        ||
        // 🔥 Tambahan: jika match sampai Set 3 → pasti super tiebreak
        totalSetPlayed === 3;

      if (needsTiebreak) {
        try {
          const logRes = await api.get(`/match-logs/${match.id}`);
          if (logRes.data?.length > 0) {
            const sortedLogs = [...logRes.data].sort((a, b) => a.id - b.id);
            const tbData = {};

            [1, 2, 3].forEach((sNum) => {
              // Ambil Tiebreak untuk set ini
              const s1 = parseInt(match[`set${sNum}P1`]);
            const s2 = parseInt(match[`set${sNum}P2`]);

            // Panggil fungsi dengan mengirimkan skor akhir s1 dan s2
            const result = getTiebreakFromLogs(sortedLogs, sNum, s1, s2);
              if (result) tbData[`set${sNum}`] = result;
            });
            newTiebreakSummary[match.id] = tbData;
          }
        } catch (err) {
          console.error(`Gagal ambil tiebreak:`, err);
        }
      }
    }
    setTiebreakSummary(newTiebreakSummary);
  } catch (err) {
    console.error("Gagal mengambil riwayat:", err);
  } finally {
    setIsLoading(false);
  }
};


const handleExportPDFLog = () => {
  const doc = new jsPDF({
    orientation: "p",
    unit: "pt",
    format: "a4"
  });

  const match = activeMatchInfo;
  const isDouble = !!match.doubleTeam1Id;
  const p1Name = isDouble ? match.doubleTeam1?.namaTim : match.peserta1?.namaLengkap;
  const p2Name = isDouble ? match.doubleTeam2?.namaTim : match.peserta2?.namaLengkap;
  const tournamentName = localStorage.getItem("selectedTournamentName") || "PELTI DENPASAR";

  // --- 1. HEADER UTAMA ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(20, 50, 100);
  doc.text(tournamentName.toUpperCase(), 297, 50, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("LAPORAN RESMI HASIL PERTANDINGAN", 297, 68, { align: "center" });

  doc.setDrawColor(220, 220, 220);
  doc.line(40, 80, 555, 80);

  // --- 2. INFO PERTANDINGAN ---
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Bagan: ${match.bagan?.nama || "-"}`, 40, 100);
  doc.text(`Kategori: ${isDouble ? "Ganda" : "Tunggal"} (${match.bagan?.KelompokUmur?.nama || "Umum"})`, 40, 115);
  doc.text(`Waktu: ${new Date(match.updatedAt).toLocaleString("id-ID")}`, 40, 130);

  // --- 3. BOX SKOR UTAMA DENGAN DYNAMIC WRAPPING ---
  const boxWidth = 515;
  const boxX = 40;
  const boxY = 145;
  const centerX = 297;

  // Persiapkan Nama Peserta (Gunakan wrapping agar tidak keluar jalur)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);

  const fullMatchTitle = `${p1Name} VS ${p2Name}`;
  // Split teks jika lebih lebar dari 480pt
  const splitTitle = doc.splitTextToSize(fullMatchTitle, 480);
  
  // Hitung tinggi berdasarkan jumlah baris teks nama
  const lineSpacing = 15;
  const titleHeight = splitTitle.length * lineSpacing;
  const dynamicBoxHeight = 55 + titleHeight; // 55pt extra untuk skor dan padding

  // Gambar Box Utama
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(230, 235, 240);
  doc.roundedRect(boxX, boxY, boxWidth, dynamicBoxHeight, 10, 10, "FD");

  // Tampilkan Nama yang sudah di-wrap
  doc.text(splitTitle, centerX, boxY + 20, { align: "center" });

  // Skor Utama (Y-nya relatif terhadap tinggi teks nama)
  const scoreY = boxY + 20 + titleHeight + 5;
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
  doc.text(`${match.score1} - ${match.score2}`, centerX, scoreY, { align: "center" });

  // Rekap Per Set (8-5, 8-3, dst)
  const rekapSet = [];
  [1, 2, 3].forEach(sNum => {
    const s1 = match[`set${sNum}P1`];
    const s2 = match[`set${sNum}P2`];
    if (s1 !== null && s2 !== null && (s1 > 0 || s2 > 0)) {
      rekapSet.push(`${s1}-${s2}`);
    }
  });

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text(`(${rekapSet.join(", ")})`, centerX, scoreY + 18, { align: "center" });

  // --- 4. DETAIL POIN PER SET (TABEL MANUAL) ---
  // yPos sekarang dinamis mengikuti tinggi box
  let yPos = boxY + dynamicBoxHeight + 30;

  const sets = selectedLog.reduce((acc, log) => {
    if (!acc[log.setKe]) acc[log.setKe] = [];
    acc[log.setKe].push(log);
    return acc;
  }, {});

  Object.keys(sets).forEach((setKe) => {
    // Cek jika halaman hampir habis
    if (yPos > 700) { doc.addPage(); yPos = 50; }

    // Header Set
    doc.setFillColor(30, 41, 59);
    doc.rect(40, yPos, 515, 20, "F");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`DETAIL POIN - SET ${setKe}`, centerX, yPos + 14, { align: "center" });
    
    yPos += 20;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(40, yPos, 515, 18, "F");
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.text("#", 55, yPos + 12);
    doc.text("SKOR POIN", 100, yPos + 12);
    doc.text("GAME", 200, yPos + 12);
    doc.text("KETERANGAN", 300, yPos + 12);
    
    yPos += 18;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    sets[setKe].forEach((log, index) => {
      // Cek Page Break
      if (yPos > 780) { doc.addPage(); yPos = 50; }

      doc.text(`${index + 1}`, 55, yPos + 14);
      doc.setFont("helvetica", "bold");
      doc.text(`${log.skorP1} - ${log.skorP2}`, 100, yPos + 14);
      doc.setFont("helvetica", "normal");
      doc.text(`${log.gameP1} - ${log.gameP2}`, 200, yPos + 14);
      
      // Keterangan Point (Beri Font Kecil agar aman)
      doc.setFontSize(7);
      doc.text(log.keterangan || "Point Exchange", 300, yPos + 14);
      doc.setFontSize(8);
      
      doc.setDrawColor(240, 240, 240);
      doc.line(40, yPos + 18, 555, yPos + 18);
      yPos += 18;
    });

    yPos += 25; // Jarak antar set
  });

  // Footer Page
  doc.setFontSize(7);
  doc.setTextColor(180);
  doc.text("Dokumen ini dihasilkan secara otomatis oleh Sistem Skor Pertandingan.", 297, 820, { align: "center" });

  doc.save(`Skor_${p1Name.replace(/\s+/g, '_')}_vs_${p2Name.replace(/\s+/g, '_')}.pdf`);
};


  useEffect(() => {
    // 1. Jalankan pertama kali saat halaman dibuka
    fetchHistory();

    // 2. Buat fungsi listener untuk mendeteksi perubahan turnamen
    const handleTournamentChange = () => {
      console.log("Turnamen berubah, memuat ulang skor...");
      fetchHistory();
    };

    // 3. Pasang pendengar (listener) event
    window.addEventListener("tournament-changed", handleTournamentChange);

    // 4. Bersihkan pendengar saat pindah halaman (cleanup)
    return () => {
      window.removeEventListener("tournament-changed", handleTournamentChange);
    };
  }, []); // Kosongkan dependency agar tidak loop

  // --- PREPARASI OPSI FILTER ---
  const listKU = ["Semua", ...new Set(matchHistory.map(m => m.bagan?.KelompokUmur?.nama).filter(Boolean))];

 // --- AMBIL TANGGAL UNIK DARI DATA YANG ADA ---
  const listDates = ["Semua", ...new Set(matchHistory
    .map(m => {
      // Kita ambil dari updatedAt karena itu tanggal skor diselesaikan
      if (!m.updatedAt) return null;
      const d = new Date(m.updatedAt);
      return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
    })
    .filter(Boolean) // Membuang nilai null atau Invalid
  )].sort((a, b) => {
    if (a === "Semua") return -1;
    if (b === "Semua") return 1;
    return new Date(b) - new Date(a); // Urutkan: Tanggal terbaru muncul paling atas
  });

  // --- LOGIKA FILTER UTAMA ---
  const filteredMatches = matchHistory.filter((m) => {

    const p1Exists = m.peserta1Id || m.doubleTeam1Id;
    const p2Exists = m.peserta2Id || m.doubleTeam2Id;

    if (!p1Exists || !p2Exists) return false;

    const isDouble = !!m.doubleTeam1Id;

    // 1. Filter Nama
    const p1Names = isDouble 
      ? `${m.doubleTeam1?.namaTim} ${m.doubleTeam1?.Player1?.namaLengkap} ${m.doubleTeam1?.Player2?.namaLengkap}`
      : `${m.peserta1?.namaLengkap}`;
    const p2Names = isDouble 
      ? `${m.doubleTeam2?.namaTim} ${m.doubleTeam2?.Player1?.namaLengkap} ${m.doubleTeam2?.Player2?.namaLengkap}`
      : `${m.peserta2?.namaLengkap}`;
    const isNameMatch = (p1Names + p2Names).toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Filter Kelompok Umur
    const matchKU = m.bagan?.KelompokUmur?.nama || "Umum";
    const isKUMatch = filterKU === "Semua" || matchKU === filterKU;

    // 3. Filter Format (Tunggal / Ganda)
    const isTypeMatch = filterType === "Semua" || 
      (filterType === "Ganda" && isDouble) || 
      (filterType === "Tunggal" && !isDouble);

    // 4. Filter Tanggal
    const matchDate = new Date(m.updatedAt).toISOString().split('T')[0];
    const isDateMatch = filterDate === "Semua" || matchDate === filterDate;

    return isNameMatch && isKUMatch && isTypeMatch && isDateMatch;
  });

  const handleLihatLog = async (match) => {
    try {
      const response = await api.get(`/match-logs/${match.id}`);

      if (response.data?.length > 0) {

        // 🔥 SORTING PALING AMAN
        const sortedLogs = response.data.sort((a, b) => {
          if (a.setKe !== b.setKe) {
            return a.setKe - b.setKe;   // urut berdasarkan set dulu
          }
          return a.id - b.id;           // lalu urut berdasarkan id
        });

        const tbData = {};
      [1, 2, 3].forEach(sNum => {
        // AMBIL SKOR AKHIR DARI OBJECT match
        const s1 = parseInt(match[`set${sNum}P1`]);
        const s2 = parseInt(match[`set${sNum}P2`]);
        
        // KIRIM s1 dan s2 ke fungsi
        const result = getTiebreakFromLogs(sortedLogs, sNum, s1, s2);
        if (result) tbData[`set${sNum}`] = result;
      });

       setTiebreakSummary(prev => ({ ...prev, [match.id]: tbData }));
        setSelectedLog(sortedLogs);
        setActiveMatchInfo(match);
        setIsModalOpen(true);

      } else {
        alert("Log poin belum tersedia.");
      }
    } catch (err) {
      console.error(err);
    }
  };


  const formatDuration = (seconds = 0) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [
    hrs.toString().padStart(2, "0"),
    mins.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0"),
  ].join(":");
};

const getTiebreakFromLogs = (allLogs, setNum, finalS1, finalS2) => {
  const setLogs = allLogs
    .filter(log => log.setKe === setNum)
    .sort((a, b) => a.id - b.id);

  if (setLogs.length === 0) return null;

  const isSuperTiebreak =
    setNum === 3 &&
    setLogs.every(
      log => Number(log.gameP1) === 0 && Number(log.gameP2) === 0
    );

   if (isSuperTiebreak) {
    const lastLog = setLogs[setLogs.length - 1];

    return {
      p1: Number(lastLog.skorP1),
      p2: Number(lastLog.skorP2),
    };
  }


  // 🔥 Cari index saat game berubah (match ended)
  let tbEndIndex = -1;

  for (let i = 0; i < setLogs.length - 1; i++) {
    const current = setLogs[i];
    const next = setLogs[i + 1];

    // Jika game berubah (7-7 → 7-8 misalnya)
    if (
      current.gameP1 !== next.gameP1 ||
      current.gameP2 !== next.gameP2
    ) {
      tbEndIndex = i;
    }
  }

  if (tbEndIndex === -1) return null;

  const lastTbLog = setLogs[tbEndIndex];

  let p1 = Number(lastTbLog.skorP1);
  let p2 = Number(lastTbLog.skorP2);

  // Tambah 1 ke pemenang set
  if (finalS1 > finalS2) {
    p1 += 1;
  } else {
    p2 += 1;
  }

  return { p1, p2 };
};

  return (
    <div className="min-h-screen">
      
      <div className="mx-auto mb-10">
        <div className="mb-6 border-gray-100">
            <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                    Skor Pertandingan
                </h1>
                <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-100 md:bg-transparent md:border-none md:px-0">
                    <p className="text-[10px] md:text-sm text-yellow-700 md:text-yellow-600 font-bold uppercase tracking-widest">
                        Tournament: {localStorage.getItem("selectedTournamentName") || "Belum Memilih"}
                    </p>
                </div>
            </div>
        </div>


        {/* Panel Filter Grid - Sekarang 4 Kolom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100">
  {/* Filter Cari */}
  <div className="relative">
    <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-wider">
      Cari Pemain / Tim
    </label>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
      <input 
        type="text" 
        className="w-full pl-9 pr-4 py-2.5 md:py-2 bg-slate-50 border border-transparent focus:border-blue-500 rounded-xl text-[11px] md:text-xs font-medium outline-none transition-all" 
        placeholder="Ketik nama..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
      />
    </div>
  </div>

  {/* Filter Kelompok Umur */}
  <div>
    <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-wider">
      Kelompok Umur
    </label>
    <select 
      className="w-full px-3 py-2.5 md:py-2 bg-slate-50 border border-transparent focus:border-blue-500 rounded-xl text-[11px] md:text-xs font-bold outline-none cursor-pointer appearance-none transition-all" 
      value={filterKU} 
      onChange={(e) => setFilterKU(e.target.value)}
    >
      {listKU.map(ku => <option key={ku} value={ku}>{ku}</option>)}
    </select>
  </div>

  {/* Filter Format */}
  <div>
    <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-wider">
      Format
    </label>
    <select 
      className="w-full px-3 py-2.5 md:py-2 bg-slate-50 border border-transparent focus:border-blue-500 rounded-xl text-[11px] md:text-xs font-bold outline-none cursor-pointer appearance-none transition-all" 
      value={filterType} 
      onChange={(e) => setFilterType(e.target.value)}
    >
      <option value="Semua">Semua Format</option>
      <option value="Tunggal">Tunggal</option>
      <option value="Ganda">Ganda</option>
    </select>
  </div>

  {/* Filter Tanggal */}
  <div>
    <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-wider">
      Tanggal
    </label>
    <select 
      className="w-full px-3 py-2.5 md:py-2 bg-slate-50 border border-transparent focus:border-blue-500 rounded-xl text-[11px] md:text-xs font-bold outline-none cursor-pointer appearance-none transition-all" 
      value={filterDate} 
      onChange={(e) => setFilterDate(e.target.value)}
    >
      {listDates.map((dateString) => (
        <option key={dateString} value={dateString}>
          {dateString === "Semua" 
            ? "Semua Tanggal" 
            : new Date(dateString).toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })
          }
        </option>
      ))}
    </select>
  </div>
</div>
      </div>

      <div className="mx-auto space-y-4 md:space-y-6">
  {isLoading ? (
    <div className="text-center py-20 font-black text-slate-300 animate-pulse uppercase tracking-[0.3em] text-xs">
      Memuat Riwayat...
    </div>
  ) : filteredMatches.length === 0 ? (
    <div className="bg-white py-20 rounded-[2rem] text-center border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
      Data tidak ditemukan
    </div>
  ) : (
    filteredMatches.map((match) => {
      const isDouble = !!match.doubleTeam1Id;
      const p1Name = isDouble ? match.doubleTeam1?.namaTim : match.peserta1?.namaLengkap;
      const p2Name = isDouble ? match.doubleTeam2?.namaTim : match.peserta2?.namaLengkap;
      
      const isP1Winner = isDouble ? (match.winnerDoubleId === match.doubleTeam1Id) : (match.winnerId === match.peserta1Id);
      const isP2Winner = isDouble ? (match.winnerDoubleId === match.doubleTeam2Id) : (match.winnerId === match.peserta2Id);

      return (
        <div key={match.id} className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-300 shadow-md transition-all duration-300 overflow-hidden group">
          <div className="p-5 md:p-8">
            {/* Badge Row - Dibuat lebih rapat di mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8">
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 bg-yellow-600 text-white text-[8px] md:text-[9px] font-black rounded-md uppercase tracking-wider flex items-center gap-1">
                  <Tag size={10} /> {match.bagan?.nama || "Match"}
                </span>
                  {/* Badge Kategori - Biru untuk Tunggal, Ungu untuk Ganda */}
                <span className={`shrink-0 px-2 py-0.5 max-w-max rounded text-[8px] md:text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                    isDouble 
                    ? 'bg-purple-50 text-purple-600 border-purple-100' 
                    : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                    {isDouble ? <Users size={10}/> : <User size={10}/>}
                    {isDouble ? 'Single' : 'Double'}
                </span>
              </div>
              <div className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-tight">
                Match {match.slot} • Round {match.round}
              </div>
            </div>

            {/* Score Display - Grid diubah total untuk Mobile */}
           <div className="grid grid-cols-1 md:grid-cols-3 items-center py-10 gap-6 md:gap-10">

              {/* ================= NAMA KIRI ================= */}
              <div
                className={`w-full text-center md:text-start ${
                  isP1Winner
                    ? "text-slate-900"
                    : "text-slate-400 opacity-90"
                }`}
              >
                <h4 className="text-sm md:text-lg font-black leading-tight uppercase tracking-tight">
                  {p1Name}
                </h4>

                

                {isP1Winner && (
                  <span className="inline-block mt-1 bg-yellow-400 text-white text-[7px] md:text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                    Winner
                  </span>
                )}
              </div>

              {/* ================= SCORE TENGAH ================= */}
              <div className="flex items-center justify-center gap-4">
                {[1, 2, 3].map((sNum) => {
                  const s1 = parseInt(match[`set${sNum}P1`]);
                  const s2 = parseInt(match[`set${sNum}P2`]);

                 if (isNaN(s1) || isNaN(s2)) return null;

            
                  if (sNum === 3) {
                    const totalSetPlayed = match.score1 + match.score2;
                    if (totalSetPlayed < 3) {
                      return null;
                    }
                  }

                  if (s1 === 0 && s2 === 0 && sNum === 2) {
                    return null;
                  }
                                
                  const gameLimit = match.scoreRule?.gamePerSet || 6;
                  const isTiebreakGame =
                    Math.abs(s1 - s2) === 1 &&
                    (s1 >= gameLimit || s2 >= gameLimit);

                  const tbPoint =
                    tiebreakSummary[match.id]?.[`set${sNum}`];

                  return (
                    <div
                      key={sNum}
                      className="flex flex-col items-center bg-slate-900 px-4 py-3 rounded-2xl min-w-[90px] border border-slate-800 shadow-lg"
                    >
                      <span className="text-[7px] md:text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">
                        SET {sNum}
                      </span>

                      <div className="flex items-center justify-center gap-2 font-black text-white text-xl md:text-2xl">

                       {/* Player 1 */}
                        <div className="relative inline-flex">
                          <span>
                            {sNum === 3 && tbPoint
                              ? tbPoint.p1
                              : s1}
                          </span>

                          {sNum !== 3 && isTiebreakGame && tbPoint && (
                            <span className="absolute -top-1.5 -right-2.5 text-[10px] md:text-[11px] text-orange-400 font-bold">
                              {tbPoint.p1}
                            </span>
                          )}
                        </div>

                        <span className="text-slate-700 mx-1">-</span>

                        {/* Player 2 */}
                        <div className="relative inline-flex">
                          <span>
                            {sNum === 3 && tbPoint
                              ? tbPoint.p2
                              : s2}
                          </span>

                          {sNum !== 3 && isTiebreakGame && tbPoint && (
                            <span className="absolute -top-1.5 -right-2.5 text-[10px] md:text-[11px] text-orange-400 font-bold">
                              {tbPoint.p2}
                            </span>
                          )}
                        </div>
                      </div>

                      {isTiebreakGame && !tbPoint && (
                        <div className="mt-1 flex gap-1">
                          <div className="w-1 h-1 bg-orange-400/40 rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-orange-400/40 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ================= NAMA KANAN ================= */}
              <div
                className={`w-full text-center md:text-end ${
                  isP2Winner
                    ? "text-slate-900"
                    : "text-slate-400 opacity-90"
                }`}
              >
                <h4 className="text-sm md:text-lg font-black leading-tight uppercase tracking-tight ">
                  {p2Name}
                </h4>


                {isP2Winner && (
                  <span className="inline-block mt-1 bg-yellow-400 text-white text-[7px] md:text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                    Winner
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer Card */}
          <div className="bg-slate-50/50 px-5 py-3 md:px-8 md:py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex flex-wrap items-center gap-3 md:gap-5 text-[12px] font-semibold text-slate-700">

          {/* Tanggal */}
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl">
              <Calendar size={14} />
              <span>
                {new Date(match.updatedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            {/* Jam */}
            <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl">
              <Clock size={14} />
              <span>
                {formatDuration(match.durasi)}
              </span>
            </div>

            {/* Wasit */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl
              ${match.referee 
                ? "bg-emerald-50 text-emerald-700" 
                : "bg-slate-100 text-slate-500"
              }`}>
              <User size={14} />
              <span>
                Wasit: {match.referee?.name || "Belum ada"}
              </span>
            </div>

            {/* Rules Skor */}
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl">
              <Layers size={14} />
              <span>
                Rules: {match.scoreRule?.name || "Default"}
              </span>
            </div>

            </div>
            <button 
              onClick={() => handleLihatLog(match)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-blue-600 active:bg-blue-600 active:text-white rounded-xl text-[9px] font-black uppercase transition-all shadow-sm"
            >
              Detail Poin <ChevronRight size={12} />
            </button>
          </div>
        </div>
      );
    })
  )}
</div>

      {/* --- MODAL LOG (Tanpa Perubahan) --- */}
    {isModalOpen && (
  <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-md">
    <div className="bg-white rounded-t-[2rem] sm:rounded-[2.5rem] w-full max-w-3xl h-[90vh] sm:h-auto sm:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
      
    {/* HEADER MODAL */}
    <div className="p-5 md:p-8 border-b bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        {/* Ikon Dekorasi untuk Mobile agar lebih hidup */}
        <div className="p-2.5 bg-red-50 rounded-2xl sm:hidden">
          <Trophy size={18} className="text-red-600" />
        </div>
        <div>
          <h3 className="font-black text-slate-900 uppercase tracking-tighter text-base md:text-lg">Detail Poin</h3>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            {activeMatchInfo?.bagan?.nama} • Slot {activeMatchInfo?.slot}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {/* TOMBOL EXPORT PDF - Sekarang Warna Merah & Full Width di Mobile */}
        <button 
          onClick={handleExportPDFLog}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-black text-[10px] md:text-xs uppercase shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all"
        >
          <Trophy size={14} /> Export PDF
        </button>

        {/* TOMBOL TUTUP */}
        <button 
          onClick={() => setIsModalOpen(false)} 
          className="flex-none p-2.5 sm:px-4 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all font-black text-[10px] md:text-xs uppercase"
        >
          <span className="hidden sm:inline">Tutup</span>
          {/* Ikon silang hanya muncul di mobile untuk hemat ruang */}
          <span className="sm:hidden text-lg">✕</span>
        </button>
      </div>
    </div>

      {/* BODY MODAL */}
      <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-8 md:space-y-10">
        {Object.values(
          [...selectedLog].reduce((acc, log) => {
            if (!acc[log.setKe]) acc[log.setKe] = { set: log.setKe, data: [] };
            acc[log.setKe].data.push(log);
            return acc;
          }, {})
        ).map((group) => (
          <div key={group.set}>
            {/* Set Divider */}
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-slate-900 text-white text-[9px] md:text-[10px] font-black rounded-lg">SET {group.set}</span>
              <div className="h-[1px] flex-1 bg-slate-100"></div>
            </div>

            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden md:block border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-center w-12">#</th>
                    <th className="px-4 py-3">Skor Poin</th>
                    <th className="px-4 py-3 text-center">Rekap Game</th>
                    <th className="px-4 py-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {group.data.map((log, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30">
                      <td className="px-4 py-4 text-center font-bold text-slate-300">{idx + 1}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-mono font-black ${log.skorP1 > log.skorP2 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>{log.skorP1}</span>
                          <span className="text-slate-200">:</span>
                          <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-mono font-black ${log.skorP2 > log.skorP1 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>{log.skorP2}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-black text-slate-800 bg-slate-50/50">{log.gameP1} - {log.gameP2}</td>
                      <td className="px-4 py-4 italic text-slate-500 font-medium">{log.keterangan || "Point Exchange"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Hidden on Desktop) */}
            <div className="md:hidden space-y-2">
              {group.data.map((log, idx) => (
                <div key={idx} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-300 w-4">#{idx + 1}</span>
                    <div className="flex items-center gap-1.5 font-mono font-black text-sm">
                      <span className={log.skorP1 > log.skorP2 ? 'text-blue-600' : 'text-slate-400'}>{log.skorP1}</span>
                      <span className="text-slate-300">:</span>
                      <span className={log.skorP2 > log.skorP1 ? 'text-red-600' : 'text-slate-400'}>{log.skorP2}</span>
                    </div>
                  </div>
                  <div className="flex-1 text-[10px] text-slate-500 italic truncate ml-2">
                    {log.keterangan || "Poin"}
                  </div>
                  <div className="bg-white px-2 py-1 rounded-lg border border-slate-100 font-black text-[10px] text-slate-800">
                    {log.gameP1}-{log.gameP2}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default SkorPage;