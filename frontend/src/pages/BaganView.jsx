import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bracket, Seed, SeedItem, SeedTeam } from "react-brackets";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "../api"; // Mengimpor instans axios dari file api.js
import { Info, Star, Users } from "lucide-react";
import AlertMessage from "../components/AlertMessage";

// Modal
import PesertaModal from "../components/modalbox/PesertaModal";
import WinnerModal from "../components/modalbox/WinnerModal";
import SeedingModal from "../components/modalbox/SeedingModal";

export default function BaganView({baganId}) {
  const { id } = useParams();
  const [bagan, setBagan] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [allPeserta, setAllPeserta] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeedingLoading, setIsSeedingLoading] = useState(false); 
  const [byeSlotsCount, setByeSlotsCount] = useState(0);
  const role = localStorage.getItem('role')
  const tournamentId = localStorage.getItem("selectedTournament");
  const finalId = baganId || id;
  const isRoundRobin = bagan?.tipe === "roundrobin";
  const [isLocked, setIsLocked] = useState(false);
  const [tiebreakSummary, setTiebreakSummary] = useState({});
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showLockConfirm, setShowLockConfirm] = useState(false);

  const [drawStage, setDrawStage] = useState("rolling"); 
  const [rollingName, setRollingName] = useState("");
  const [currentSlotInfo, setCurrentSlotInfo] = useState(null);





  // Load data bagan menggunakan axios
  const loadBagan = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/bagan/${finalId}`);
      const data = res.data; // Mengakses data dari properti .data
      setBagan(data);
      await fetchTiebreakForBagan(data.Matches);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  

const getTiebreakFromLogs = (allLogs, setNum, finalS1, finalS2, gameLimit = 6) => {
  // Ambil semua log untuk set ini saja
  const setLogs = allLogs
    .filter(log => log.setKe === setNum)
    .sort((a, b) => a.id - b.id);

  if (setLogs.length === 0) return null;

  // --- LOGIKA KHUSUS SET 3 (SUPER TIEBREAK) ---
  // Kita cek jika ini set 3, ambil log paling terakhir untuk poinnya
  if (setNum === 3) {
    const lastLog = setLogs[setLogs.length - 1];
    return {
      p1: parseInt(lastLog.skorP1) || 0,
      p2: parseInt(lastLog.skorP2) || 0,
    };
  }

  // --- LOGIKA TIEBREAK NORMAL (SET 1 & 2) ---
  const isRealTiebreak =
    Math.abs(finalS1 - finalS2) === 1 &&
    (finalS1 >= gameLimit || finalS2 >= gameLimit);

  if (!isRealTiebreak) return null;

  let tbEndIndex = -1;
  for (let i = 0; i < setLogs.length - 1; i++) {
    if (setLogs[i].gameP1 !== setLogs[i + 1].gameP1 || 
        setLogs[i].gameP2 !== setLogs[i + 1].gameP2) {
      tbEndIndex = i;
    }
  }

  if (tbEndIndex === -1) return null;

  const lastTbLog = setLogs[tbEndIndex];
  let p1 = parseInt(lastTbLog.skorP1) || 0;
  let p2 = parseInt(lastTbLog.skorP2) || 0;

  // Tambah 1 ke pemenang set karena log poin terakhir biasanya terputus saat game berganti
  if (finalS1 > finalS2) p1 += 1; else p2 += 1;

  return { p1, p2 };
};

const fetchTiebreakForBagan = async (matches) => {
  const newTb = {};

  for (const match of matches) {
    try {
      const logRes = await api.get(`/match-logs/${match.id}`);
      if (!logRes.data?.length) continue;

      const sortedLogs = [...logRes.data].sort((a, b) => a.id - b.id);
      const tbData = {};

      [1, 2, 3].forEach((sNum) => {
        const s1 = parseInt(match[`set${sNum}P1`]);
        const s2 = parseInt(match[`set${sNum}P2`]);

        const gameLimit = match.scoreRule?.gamePerSet || 6;

        const result = getTiebreakFromLogs(
          sortedLogs,
          sNum,
          s1,
          s2,
          gameLimit
        );
        if (result) {
          tbData[`set${sNum}`] = result;
        }
      });

      if (Object.keys(tbData).length > 0) {
        newTb[match.id] = tbData;
      }

    } catch (err) {
      console.error(err);
    }
  }

  setTiebreakSummary(newTb);
};

const formatSetScore = (m) => {
  const sets = [];

  for (let i = 1; i <= 3; i++) {
    const s1 = parseInt(m[`set${i}P1`]);
    const s2 = parseInt(m[`set${i}P2`]);
    const tbPoint = tiebreakSummary[m.id]?.[`set${i}`];

    if (isNaN(s1) || isNaN(s2)) continue;

    // ❌ Skip set kosong
    if (s1 === 0 && s2 === 0 && !tbPoint) continue;

    // 🔥 SET 3 = SUPER TIEBREAK (hanya tampil point)
    if (i === 3 && tbPoint) {
      sets.push(`${tbPoint.p1}-${tbPoint.p2}`);
      continue;
    }

    // 🔥 NORMAL TIEBREAK (kalau ada tbPoint berarti memang tiebreak)
    if (tbPoint) {
      sets.push(`${s1}-${s2}(${tbPoint.p1}-${tbPoint.p2})`);
    } else {
      sets.push(`${s1}-${s2}`);
    }
  }

  return sets.join(" ");
};

  const loadAllPeserta = async (kelompokUmurId) => {
    try {
      const isDouble = bagan?.kategori === "double";
      const endpoint = isDouble ? '/double-teams' : '/pesertafilter';
      
      const res = await api.get(endpoint, {
        params: {
          kelompokUmurId: kelompokUmurId,
          status: 'verified',
          tournamentId
        }
      });
      
      const data = res.data;
      setAllPeserta(data);
      
      const totalPeserta = data.length;
      let bracketSize = 2;
      while (bracketSize < totalPeserta) {
        bracketSize *= 2;
      }
      setByeSlotsCount(bracketSize - totalPeserta);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadBagan();
  }, [id]);

  useEffect(() => {
    if (bagan && bagan.kelompokUmurId) {
      loadAllPeserta(bagan.kelompokUmurId);
    }
  }, [bagan]);

  
const handleExportPDF = async () => {
  const bracketEl = document.getElementById(
    isRoundRobin ? "roundrobin-pdf" : "bracket-container"
  );
  const ketPdfEl = document.getElementById("keterangan-pdf");

  if (!bracketEl || !bagan) return;

  try {


    await new Promise(r => setTimeout(r, 200));

    if (isRoundRobin) {
      bracketEl.style.display = "block";
      bracketEl.style.position = "absolute";
      bracketEl.style.left = "-9999px"; // supaya tidak terlihat user
    }

    const canvas = await html2canvas(bracketEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    });

    const img = canvas.toDataURL("image/png", 1.0); // pakai PNG biar warna aman

    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "l" : "p",
      unit: "px",
      format: [canvas.width + 40, canvas.height + 140]
    });

    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFontSize(28);
    pdf.text(
      (bagan.Tournament?.name || "PELTI DENPASAR").toUpperCase(),
      pageWidth / 2,
      40,
      { align: "center" }
    );

    pdf.setFontSize(18);
    pdf.text(bagan.nama, pageWidth / 2, 70, { align: "center" });

    pdf.addImage(img, "PNG", 20, 100, canvas.width, canvas.height);

    if (ketPdfEl && !isRoundRobin) {
      ketPdfEl.style.display = "block";
      await new Promise(r => setTimeout(r, 200));

      const ketCanvas = await html2canvas(ketPdfEl, {
        scale: 2,
        backgroundColor: "#ffffff"
      });

      pdf.addPage();
      pdf.addImage(
        ketCanvas.toDataURL("image/png", 1.0),
        "PNG",
        20,
        40,
        ketCanvas.width,
        ketCanvas.height
      );

      ketPdfEl.style.display = "none";
    }

    pdf.save(`Bagan-${bagan.nama}.pdf`);

    if (isRoundRobin) {
      bracketEl.style.display = "none";
      bracketEl.style.position = "";
      bracketEl.style.left = "";
    }



  } catch (err) {
    console.error(err);
    alert("Export gagal. Coba reload halaman.");
  }
};





const handleLockBagan = async () => {
  try {
    setIsLoading(true);
    await api.patch(`/bagan/${finalId}/lock`);
    await loadBagan();

    setAlertType("success");
    setAlertMessage("Bagan berhasil dikunci dan tidak bisa diubah lagi.");
  } catch (error) {
    setAlertType("error");
    setAlertMessage("Gagal mengunci bagan.");
  } finally {
    setIsLoading(false);
    setShowLockConfirm(false);
  }
};


  // Lakukan pengundian menggunakan axios
const handleUndian = async (seededPeserta, byeSlots) => {
  setIsSeedingLoading(true);
  setDrawStage("rolling");
  setModalType(null);

  try {
    await api.post(`/bagan/${id}/undian`, { seededPeserta, byeSlots });

    const res = await api.get(`/bagan/${finalId}`);
    const newBagan = res.data;

    startVisualDraw(newBagan);

  } catch (error) {
    console.error(error);
  }
};

const startVisualDraw = (newBagan) => {

  const matches = newBagan.Matches
    .filter(m => m.round === 1);

  if (!matches.length) return;

  const isDouble = newBagan.kategori === "double";

  const getName = (match, index) => {
    if (isDouble) {
      const team = index === 1 ? match.doubleTeam1 : match.doubleTeam2;
      if (!team) return "BYE";
      return `${team.Player1?.namaLengkap} / ${team.Player2?.namaLengkap}`;
    } else {
      const peserta = index === 1 ? match.peserta1 : match.peserta2;
      return peserta?.namaLengkap || "BYE";
    }
  };

  setDrawStage("rolling");

  let speed = 80;
  let totalTime = 0;
  let rollingInterval;

  const startRolling = () => {
    rollingInterval = setInterval(() => {
      const randomMatch =
        matches[Math.floor(Math.random() * matches.length)];

      const p1 = getName(randomMatch, 1);
      const p2 = getName(randomMatch, 2);

      setRollingName(`${p1} VS ${p2}`);
    }, speed);
  };

  startRolling();

  const slowdownTimer = setInterval(() => {
    totalTime += 1000;

    if (totalTime >= 3000) {
      speed += 40;
      clearInterval(rollingInterval);
      startRolling();
    }

    if (totalTime >= 10000) {
      clearInterval(rollingInterval);
      clearInterval(slowdownTimer);

      setDrawStage("slots");
      revealSlots([...matches], newBagan);
    }
  }, 1000);
};



const revealSlots = (matches, newBagan) => {

  const isDouble = newBagan.kategori === "double";

  const getName = (match, index) => {
    if (isDouble) {
      const team = index === 1 ? match.doubleTeam1 : match.doubleTeam2;
      if (!team) return "BYE";
      return `${team.Player1?.namaLengkap} / ${team.Player2?.namaLengkap}`;
    } else {
      const peserta = index === 1 ? match.peserta1 : match.peserta2;
      return peserta?.namaLengkap || "BYE";
    }
  };

  let index = 0;

  if (matches.length > 0) {
    const firstMatch = matches[0];

    setCurrentSlotInfo({
      slot: 1,
      p1: getName(firstMatch, 1),
      p2: getName(firstMatch, 2)
    });

    index = 1;
  }

  const slotInterval = setInterval(() => {

    if (index >= matches.length) {
      clearInterval(slotInterval);

      setTimeout(() => {
        setBagan(newBagan);
        setIsSeedingLoading(false);
        setDrawStage("done");
      }, 1500);

      return;
    }

    const match = matches[index];

    setCurrentSlotInfo({
      slot: index + 1,
      p1: getName(match, 1),
      p2: getName(match, 2)
    });

    index++;

  }, 2000);
};





  if (!bagan) {
    return <div className="p-6 text-center text-gray-500">⏳ Loading...</div>;
  }
  
  // Konversi Matches ke format react-brackets
 // --- MULAI GANTI DARI SINI ---
  const roundsMap = {};
  const isDouble = bagan.kategori === "double"; 

  bagan.Matches.forEach((m) => {
    if (!roundsMap[m.round]) roundsMap[m.round] = [];

    // Fungsi pembantu untuk menentukan nama (Ganda atau Tunggal)
    const getTeamName = (peserta, doubleTeam, id, doubleId) => {
      if (isDouble) {
        if (doubleTeam) return `${doubleTeam.Player1?.namaLengkap} / ${doubleTeam.Player2?.namaLengkap}`;
        return doubleId ? "TBD" : "BYE";
      }
      if (peserta) return peserta.namaLengkap;
      return id ? "TBD" : "BYE";
    };

    roundsMap[m.round].push({
      id: m.id,
      teams: [
        { name: getTeamName(m.peserta1, m.doubleTeam1, m.peserta1Id, m.doubleTeam1Id) },
        { name: getTeamName(m.peserta2, m.doubleTeam2, m.peserta2Id, m.doubleTeam2Id) },
      ],
      raw: m,
    });
  });
  // --- SAMPAI DI SINI ---

  const rounds = Object.keys(roundsMap)
    .sort((a, b) => a - b)
    .map((round) => ({
      title: `Babak ${round}`,
      seeds: roundsMap[round],
    }));
// --- GANTI BAGIAN JUARA INI ---
  const finalRound = Math.max(...bagan.Matches.map((m) => m.round));
  const finalMatch = bagan.Matches.find((m) => m.round === finalRound);

  let juara = null;

  let juaraRR = null;

if (isRoundRobin) {
  const klasemen = {};
  let semuaSelesai = true;

  bagan.Matches.forEach(m => {
    const p1 = isDouble ? m.doubleTeam1 : m.peserta1;
    const p2 = isDouble ? m.doubleTeam2 : m.peserta2;
    const wId = isDouble ? m.winnerDoubleId : m.winnerId;

    // ⛔ kalau ada match belum ada pemenang
    if (!wId) semuaSelesai = false;

    if (!p1 || !p2) return;

    [p1, p2].forEach(p => {
      if (!klasemen[p.id]) {
        klasemen[p.id] = { peserta: p, poin: 0 };
      }
    });

    if (wId === p1.id) klasemen[p1.id].poin += 3;
    if (wId === p2.id) klasemen[p2.id].poin += 3;
  });

  if (semuaSelesai) {
    const ranking = Object.values(klasemen).sort((a,b)=>b.poin-a.poin);
    juaraRR = ranking[0]?.peserta || null;
  } else {
    juaraRR = null; // ❗ BELUM ADA JUARA
  }
}

  
  if (finalMatch) {
    if (isDouble && finalMatch.winnerDoubleId) {
      const winner = finalMatch.winnerDoubleId === finalMatch.doubleTeam1Id ? finalMatch.doubleTeam1 : finalMatch.doubleTeam2;
      juara = winner ? `${winner.Player1?.namaLengkap} / ${winner.Player2?.namaLengkap}` : "TBD";
    } else if (!isDouble && finalMatch.winnerId) {
      juara = finalMatch.winnerId === finalMatch.peserta1Id ? finalMatch.peserta1?.namaLengkap : finalMatch.peserta2?.namaLengkap;
    }
  }

  const thStyle = {
    border: "1px solid #d1d5db",
    padding: "8px",
    fontSize: 12,
    textAlign: "left"
  };

  const tdStyle = {
    border: "1px solid #e5e7eb",
    padding: "8px",
    fontSize: 12
  };


  return (
    <div className="min-h-screen w-full">
      <div className="max-full mx-auto mb-10">
        <h1 className="text-xl md:text-4xl font-extrabold mb-9 text-center text-gray-800">
          {bagan.nama}
        </h1>
      
      {(role === "admin" || role === "panitia") && (
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="flex justify-center gap-4">
            {/* Tombol Undian: HANYA tampil jika BELUM dikunci DAN BUKAN Round Robin */}
            {!bagan.isLocked && !isRoundRobin && (
              <button
                onClick={() => setModalType("seeding")}
                className="px-8 py-3 bg-purple-700 text-white font-bold rounded-xl shadow-lg hover:bg-purple-800 transition-all"
                disabled={isSeedingLoading}
              >
                Lakukan Pengundian
              </button>
            )}

            {/* Tombol Kunci: HANYA tampil jika BELUM dikunci */}
            {!bagan.isLocked && (
              <button
                onClick={() => setShowLockConfirm(true)}
                className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl"
              >
                Kunci Bagan 🔒
              </button>

            )}

            {/* Tombol Export PDF: Selalu Tampil */}
            <button
              onClick={handleExportPDF}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all"
            >
              Export PDF
            </button>
          </div>

          {/* Label Status: Tampil jika SUDAH dikunci */}
          {bagan.isLocked && (
            <div className="mt-4 px-6 py-2 bg-amber-100 text-amber-700 font-bold rounded-full border border-amber-200 flex items-center gap-2">
              🔒 Bagan Telah Disepakati & Dikunci (Permanen)
            </div>
          )}
        </div>
      )}

        {/* Bracket */}
        <div 
          id="bracket-container" 
          className="w-full bg-white overflow-x-auto rounded-3xl" 
        >
          {isRoundRobin ? (
            /* TAMPILAN ROUND ROBIN (TABEL) */
            <div className="space-y-6">

  <div className="w-full overflow-x-auto rounded-2xl md:border md:border-gray-200 md:shadow-md">
    
    <table className="min-w-[780px] w-full border-separate border-spacing-y-2 text-sm md:text-base">
      
      <thead>
        <tr className="bg-gray-100 text-gray-700">
          <th className="px-4 py-4 text-left">Match</th>
          <th className="px-4 py-4 text-left">Peserta 1</th>
          <th className="px-4 py-4 text-center">VS</th>
          <th className="px-4 py-4 text-left">Peserta 2</th>
          <th className="px-4 py-4 text-center">Skor</th>
          {(role === "admin" || role === "panitia") && (
            <th className="px-4 py-4 text-center">Aksi</th>
          )}
        </tr>
      </thead>

      <tbody>
        {bagan.Matches.map((m, index) => (
          <tr
            key={m.id}
            className="bg-white hover:bg-blue-50 transition-all rounded-xl shadow-sm"
          >
            <td className="px-4 py-5 font-semibold text-gray-500">
              #{index + 1}
            </td>

            <td
              className={`px-4 py-5 font-semibold text-md ${
                (isDouble
                  ? m.winnerDoubleId === m.doubleTeam1Id
                  : m.winnerId === m.peserta1Id)
                  ? "text-blue-600"
                  : "text-gray-800"
              }`}
            >
              {isDouble
                ? (m.doubleTeam1?.namaTim ||
                  (m.doubleTeam1Id ? "TBD" : "BYE"))
                : (m.peserta1?.namaLengkap ||
                  (m.peserta1Id ? "TBD" : "BYE"))}
            </td>

            <td className="px-4 py-5 text-center text-gray-400 font-bold text-md">
              VS
            </td>

            <td
              className={`px-4 py-5 font-semibold text-md ${
                (isDouble
                  ? m.winnerDoubleId === m.doubleTeam2Id
                  : m.winnerId === m.peserta2Id)
                  ? "text-blue-600"
                  : "text-gray-800"
              }`}
            >
              {isDouble
                ? (m.doubleTeam2?.namaTim ||
                  (m.doubleTeam2Id ? "TBD" : "BYE"))
                : (m.peserta2?.namaLengkap ||
                  (m.peserta2Id ? "TBD" : "BYE"))}
            </td>

            <td className="px-4 py-5 text-center">
              <span className="bg-gray-100 px-4 py-2 rounded-lg font-bold text-sm shadow-sm">
                {formatSetScore(m)}
              </span>
            </td>

            {(role === "admin" || role === "panitia") && (
              <td className="px-4 py-5 text-center">
                {(
                  (!isDouble && !m.winnerId) ||
                  (isDouble && !m.winnerDoubleId)
                ) ? (
                  <button
                    onClick={() => {
                      setSelectedMatch(m);
                      setModalType("winner");
                    }}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold hover:bg-blue-200 transition"
                  >
                    Input Skor
                  </button>
                ) : (
                  <span className="text-sm text-gray-400 italic">
                    Selesai
                  </span>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>

    </table>
  </div>

</div>

          ) : (
           

          <div
                className="w-full overflow-hidden rounded-3xl"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
                }}
              >

            {/* Wrapper scroll manual */}
            <div 
              className="overflow-x-auto" 
              style={{ 
                display: 'block', 
                width: '100%',
                WebkitOverflowScrolling: 'touch',
                backgroundColor: '#ffffff' // HEX supaya PDF aman
              }}
            >
              
              {/* Gunakan max-content agar div ini selebar total semua babak pertandingan */}
            <div style={{ display: 'inline-block', minWidth: '100%' }} className="p-4 md:p-10">
                
                <Bracket
                  rounds={rounds}
                  /* Tambahkan properti mobileBreakpoint jika library mendukung untuk mematikannya */
                  mobileBreakpoint={0} 
                  renderSeedComponent={(props) => {
                    const match = props.seed.raw;
                    const isDouble = bagan.kategori === "double";

                    return (
                      <Seed
                        {...props}
                        onClick={() => {
                          setSelectedMatch(match);
                          const hasS1 = isDouble ? match.doubleTeam1Id : match.peserta1Id;
                          const hasS2 = isDouble ? match.doubleTeam2Id : match.peserta2Id;
                          const isFinished = isDouble ? !!match.winnerDoubleId : !!match.winnerId;

                          if (hasS1 !== null && hasS2 !== null && !isFinished) {
                            setModalType("winner");
                          }
                        }}
                      >
                        <SeedItem>
                          <div className="relative" style={{ backgroundColor: "#ffffff" }}>
                            {/* TAMPILAN ASLI KAMU (GAYA LAMA) */}
                            {formatSetScore(match) && (
                              <div className="absolute -top-3 -right-3 z-10">
                                <span style={{ color: "#000000" }} className="font-bold text-md px-2 py-0.5">
                                  {formatSetScore(match)}
                                </span>
                              </div>
                            )}

                            <SeedTeam
                              className={`rounded-lg min-w-[220px] px-3 py-2 text-start text-lg font-medium border-2 
                                ${(isDouble ? match.winnerDoubleId === match.doubleTeam1Id : match.winnerId === match.peserta1Id)
                                  ? "bg-[#fef3c7] text-[#78350f] border-[#fcd34d]"
                                  : "bg-[#f3f4f6] text-[#1f2937] border-[#e5e7eb]"
                                }`}
                            >
                              {isDouble 
                                ? (match.doubleTeam1?.namaTim || (match.doubleTeam1Id ? "TBD" : "BYE"))
                                : (match.peserta1?.namaLengkap || (match.peserta1Id ? "TBD" : "BYE"))}
                            </SeedTeam>

                            <SeedTeam
                              className={`rounded-lg min-w-[220px] px-3 py-2 mt-2 text-start text-lg font-medium border-2 
                                ${(isDouble ? match.winnerDoubleId === match.doubleTeam2Id : match.winnerId === match.peserta2Id)
                                  ? "bg-[#fef3c7] text-[#78350f] border-[#fcd34d]"
                                  : "bg-[#f3f4f6] text-[#1f2937] border-[#e5e7eb]"
                                }`}
                            >
                              {isDouble 
                                ? (match.doubleTeam2?.namaTim || (match.doubleTeam2Id ? "TBD" : "BYE"))
                                : (match.peserta2?.namaLengkap || (match.peserta2Id ? "TBD" : "BYE"))}
                            </SeedTeam>
                          </div>
                        </SeedItem>
                      </Seed>
                    );
                  }}
                />
              </div>
            </div>
          </div>
          )}
        </div>

        {/* ===== KETERANGAN KHUSUS PDF (TANPA TAILWIND) ===== */}
        <div
          id="keterangan-pdf"
          style={{
            background: "#ffffff",
            padding: "32px",
            fontFamily: "Arial, Helvetica, sans-serif",
            display: "none",
            width: "100%"
          }}
        >

          {/* JUDUL */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, marginBottom: 6, color: "#1f2937" }}>
              Keterangan Penempatan
            </h3>
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              Seeding & Plotting Peserta
            </p>
          </div>

          {/* GRID 2 KOLOM */}
          <div style={{ display: "flex", gap: 32 }}>
            
            {/* KOLOM SEED */}
            <div
              style={{
                flex: 1,
                border: "1px solid #fde68a",
                background: "#fffbeb",
                borderRadius: 12,
                padding: 16
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <strong style={{ color: "#92400e" }}>Peserta Unggulan (Seeded)</strong>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {bagan.Matches.filter(m => m.round === 1)
                  .flatMap(m => {
                    const arr = [];
                    if (m.peserta1?.isSeeded) arr.push(m.peserta1.namaLengkap);
                    if (m.peserta2?.isSeeded) arr.push(m.peserta2.namaLengkap);
                    return arr;
                  })
                  .map((n, i) => (
                  <div
                    key={i}
                    style={{
                      position: "relative",          // 🔥 WAJIB
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 44px 8px 12px",   // kanan diperbesar
                      background: "#ffffff",
                      border: "1px solid #fde68a",
                      borderRadius: 8,
                      minHeight: 36
                    }}
                  >

                     <span style={{ fontSize: 13, color: "#1f2937" }}>
                      {n}
                    </span>

                    <span
                      style={{
                        position: "absolute",   // 🔥 LEPAS DARI BASELINE
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)", // 🔥 CENTER VERTIKAL FIX
                        fontSize: 10,
                        color: "#92400e",
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontWeight: "bold",
                        lineHeight: 1,
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      SEED
                    </span>



                    </div>
                  ))}
              </div>
            </div>

            {/* KOLOM PLOTTING */}
            <div
              style={{
                flex: 1,
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                borderRadius: 12,
                padding: 16
              }}
            >
              <strong style={{ color: "#1f2937" }}>Penempatan Khusus</strong>
              <p style={{ fontSize: 13, color: "#4b5563", marginTop: 10, lineHeight: 1.5 }}>
                Beberapa peserta ditempatkan secara manual untuk menghindari
                pertemuan dini antar rekan satu tim atau instansi yang sama.
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div
            style={{
              marginTop: 32,
              paddingTop: 12,
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              color: "#6b7280"
            }}
          >
            <span>PELTI DENPASAR OFFICIAL SYSTEM</span>
            <span>{new Date().toLocaleString("id-ID")}</span>
          </div>

          {(isRoundRobin ? juaraRR : juara) && (
            <div
              style={{
                marginTop: 32,
                padding: "24px",
                borderRadius: 14,
                border: "2px solid #facc15",
                background: "#fffbeb",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  color: "#ca8a04",
                  marginBottom: 6
                }}
              >
                🏆 Juara
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: 10
                }}
              >
                {isRoundRobin
                ? (isDouble
                    ? `${juaraRR?.Player1?.namaLengkap} / ${juaraRR?.Player2?.namaLengkap}`
                    : juaraRR?.namaLengkap)
                : juara}

              </div>
            </div>
          )}

        </div>

        {/* ===== ROUND ROBIN PDF (KHUSUS EXPORT) ===== */}
        <div
          id="roundrobin-pdf"
          style={{
            background: "#ffffff",
            padding: "32px",
            fontFamily: "Arial, Helvetica, sans-serif",
            display: "none",
            width: "100%"
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={thStyle}>No</th>
                <th style={thStyle}>Peserta 1</th>
                <th style={thStyle}>VS</th>
                <th style={thStyle}>Peserta 2</th>
                <th style={thStyle}>Skor</th>
              </tr>
            </thead>
            <tbody>
              {bagan.Matches.map((m, i) => (
                <tr key={m.id}>
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={tdStyle}>
                    {isDouble
                      ? m.doubleTeam1?.namaTim
                      : m.peserta1?.namaLengkap}
                  </td>
                  <td style={tdStyle}>VS</td>
                  <td style={tdStyle}>
                    {isDouble
                      ? m.doubleTeam2?.namaTim
                      : m.peserta2?.namaLengkap}
                  </td>
                  <td style={tdStyle}>
                   {formatSetScore(m)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(isRoundRobin ? juaraRR : juara) && (
            <div
              style={{
                marginTop: 32,
                padding: 20,
                border: "2px solid #facc15",
                borderRadius: 12,
                background: "#fffbeb",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: 20, fontWeight: "bold", color: "#ca8a04" }}>
                🏆 Juara
              </div>
              <div style={{ fontSize: 16, marginTop: 6 }}>
                {isRoundRobin
                  ? (isDouble
                      ? `${juaraRR?.Player1?.namaLengkap} / ${juaraRR?.Player2?.namaLengkap}`
                      : juaraRR?.namaLengkap)
                  : juara}
              </div>
            </div>
          )}
        </div>



        {/* Hanya tampil jika BUKAN Round Robin */}
        {!isRoundRobin && (
        <div
          id="keterangan-container"
          className="mt-12 md:mt-16 border-t border-gray-200 
                    pt-8 md:pt-12 
                    px-4 
                    bg-white"
        >

          {/* Title */}
          <h3 className="text-lg sm:text-xl md:text-2xl 
                        font-bold text-gray-800 
                        mb-6 md:mb-8 
                        flex items-center gap-2">
            <Info size={20} className="text-blue-500" />
            Keterangan Penempatan (Seeding & Plotting)
          </h3>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">

            {/* Kolom Seed */}
            <div className="space-y-4">
              <p className="text-xs sm:text-sm 
                            font-extrabold text-gray-400 
                            uppercase tracking-widest 
                            flex items-center gap-2">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                Peserta Unggulan (Seeded)
              </p>

              <div className="space-y-3">
                {(() => {
                  const seededFinal = [];
                  const seenIds = new Set();

                  bagan.Matches.filter(m => m.round === 1).forEach((m) => {
                    const p1 = isDouble ? m.doubleTeam1 : m.peserta1;
                    const p2 = isDouble ? m.doubleTeam2 : m.peserta2;
                    const id1 = isDouble ? m.doubleTeam1Id : m.peserta1Id;
                    const id2 = isDouble ? m.doubleTeam2Id : m.peserta2Id;

                    if (id1 && p1?.isSeeded && !seenIds.has(id1)) {
                      seededFinal.push(p1);
                      seenIds.add(id1);
                    }
                    if (id2 && p2?.isSeeded && !seenIds.has(id2)) {
                      seededFinal.push(p2);
                      seenIds.add(id2);
                    }
                  });

                  if (seededFinal.length === 0) {
                    return (
                      <p className="text-sm text-gray-400 italic">
                        Tidak ada peserta unggulan.
                      </p>
                    );
                  }

                  return seededFinal.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center 
                                p-3 md:p-4 
                                bg-white 
                                border border-yellow-200 
                                rounded-xl 
                                shadow-sm"
                    >
                      <span className="text-sm md:text-base 
                                      font-semibold text-gray-800 break-words">
                        {isDouble
                          ? (p.namaTim || p.Player1?.namaLengkap)
                          : p.namaLengkap}
                      </span>

                      <span className="text-[10px] md:text-xs 
                                      bg-yellow-400 text-white 
                                      px-2 py-1 
                                      rounded-full 
                                      font-bold">
                        SEED
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Kolom Plotting */}
            <div className="space-y-4">
              <p className="text-xs sm:text-sm 
                            font-extrabold text-gray-400 
                            uppercase tracking-widest 
                            flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                Penempatan Khusus (Non-Seed)
              </p>

              <div className="bg-gray-50 p-4 md:p-6 
                              rounded-xl 
                              border border-gray-100">
                <p className="text-[11px] md:text-base 
                              text-gray-600 
                              leading-relaxed italic">
                  Beberapa peserta telah dipisahkan posisinya secara manual 
                  (Plotting) guna menghindari pertemuan dini antar rekan satu tim 
                  atau instansi yang sama.
                </p>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="mt-10 md:mt-14 
                          pt-6 border-t border-gray-100 
                          flex flex-col sm:flex-row 
                          justify-between items-center 
                          gap-3 
                          text-[10px] sm:text-xs 
                          text-gray-400 
                          font-medium uppercase tracking-widest">
            <span>PELTI DENPASAR OFFICIAL SYSTEM</span>
            <span>{new Date().toLocaleString('id-ID')}</span>
          </div>

        </div>

        )}

        {/* 🏆 Juara */}
        {juara && (
          <div className="mt-8 md:mt-12 text-center bg-white p-5 md:p-8 
                rounded-xl md:rounded-2xl 
                shadow-md md:shadow-lg 
                border-2 border-yellow-400">

              <h2 className="text-xl sm:text-2xl md:text-3xl 
                            font-bold text-yellow-600">
                🏆 Juara
              </h2>

              <p className="text-base sm:text-lg md:text-2xl 
                            font-semibold text-gray-900 
                            mt-2 md:mt-3 break-words">
                {isRoundRobin
                  ? (isDouble
                      ? `${juaraRR?.Player1?.namaLengkap} / ${juaraRR?.Player2?.namaLengkap}`
                      : juaraRR?.namaLengkap)
                  : juara}
              </p>

            </div>

        )}
      </div>

      {/* Modal */}
      {modalType === "peserta" && (role === "admin" || role === "panitia") && (
        <PesertaModal
          match={selectedMatch}
          kelompokUmurId={bagan.kelompokUmurId}
          onClose={() => setModalType(null)}
          onSaved={loadBagan}
        />
      )}
      {modalType === "winner" && (role === "admin" || role === "panitia") && (
        <WinnerModal
          match={selectedMatch}
          onClose={() => setModalType(null)}
          onSaved={loadBagan}
        />
      )}
      {modalType === "seeding" && (role === "admin" || role === "panitia") && (
        <SeedingModal
          pesertaList={allPeserta}
          byeSlotsCount={byeSlotsCount}
          onClose={() => setModalType(null)}
          onSaved={handleUndian}
        />
      )}

      {/* Loading Modal Pop-up */}
{isSeedingLoading && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md">

    <div className="relative bg-white/95 backdrop-blur-xl rounded-[2.5rem] px-20 py-16 w-[900px] text-center shadow-[0_30px_100px_rgba(0,0,0,0.6)] border border-yellow-400/40 overflow-hidden">

      {/* Glow Background */}
     

      {/* HEADER */}
      <div className="mb-10 relative z-10">
        <h2 className="text-4xl font-extrabold text-yellow-500 tracking-wide">
          LIVE DRAW CEREMONY
        </h2>
        <p className="text-gray-500 mt-3 text-lg tracking-wide">
          Sistem Pengundian Resmi & Transparan
        </p>
      </div>

      {/* 🔄 ROLLING MODE */}
      {drawStage === "rolling" && (
        <div className="relative z-10">

          {/* Logo + Spinner */}
          <div className="relative w-40 h-40 mx-auto mb-12">
            <div className="absolute inset-0 rounded-full border-[6px] border-yellow-400/30"></div>
            <div className="absolute inset-0 rounded-full border-[6px] border-yellow-500 border-t-transparent animate-spin"></div>

            <div className="absolute inset-6 rounded-full bg-white flex items-center justify-center shadow-inner">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>

          {/* VERTICAL MATCH DISPLAY */}
          <div className="flex flex-col items-center justify-center transition-all duration-300">

            {/* Peserta 1 */}
            <div className="text-4xl font-bold text-gray-800">
              {rollingName?.split(" VS ")[0]}
            </div>

            {/* VS */}
            <div className="my-8 relative">
              <div className="absolute inset-0 blur-xl bg-yellow-400 opacity-40 rounded-full"></div>
              <div className="relative px-10 py-2 rounded-full 
                              bg-gradient-to-r from-yellow-500 to-orange-500 
                              text-white font-extrabold text-2xl shadow-xl tracking-widest">
                VS
              </div>
            </div>

            {/* Peserta 2 */}
            <div className="text-4xl font-bold text-gray-800">
              {rollingName?.split(" VS ")[1]}
            </div>

          </div>

          <p className="mt-10 text-gray-400 tracking-[0.3em] uppercase text-sm">
            Mengacak Peserta...
          </p>

        </div>
      )}

      {/* 🎯 SLOT MODE */}
      {drawStage === "slots" && currentSlotInfo && (
        <div className="relative z-10">

          <h3 className="text-2xl font-bold text-gray-600 mb-8 tracking-widest">
            SLOT {currentSlotInfo.slot}
          </h3>

          <div className="flex flex-col items-center justify-center">

            {/* Peserta 1 */}
            <div className="text-4xl font-extrabold text-gray-800">
              {currentSlotInfo.p1}
            </div>

            {/* VS */}
            <div className="my-8 relative">
              <div className="absolute inset-0 blur-xl bg-yellow-400 opacity-40 rounded-full"></div>
              <div className="relative px-10 py-2 rounded-full 
                              bg-gradient-to-r from-yellow-500 to-orange-500 
                              text-white font-extrabold text-2xl shadow-xl tracking-widest">
                VS
              </div>
            </div>

            {/* Peserta 2 */}
            <div className="text-4xl font-extrabold text-gray-800">
              {currentSlotInfo.p2}
            </div>

          </div>

          <p className="mt-10 text-gray-400 tracking-[0.3em] uppercase text-sm">
            Slot Telah Ditentukan
          </p>

        </div>
      )}

      {/* FOOTER */}
      <div className="mt-16 text-xs text-gray-400 tracking-[0.4em] uppercase relative z-10">
        PELTI DENPASAR OFFICIAL SYSTEM
      </div>

    </div>
  </div>
)}




{showLockConfirm && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in">
      
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Kunci Bagan?
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        Setelah dikunci, bagan tidak bisa diundi ulang atau diubah.
      </p>

      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setShowLockConfirm(false)}
          className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
        >
          Batal
        </button>

        <button
          onClick={handleLockBagan}
          className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
        >
          Ya, Kunci
        </button>
      </div>
    </div>
  </div>
)}

<AlertMessage
  type={alertType}
  message={alertMessage}
  onClose={() => setAlertMessage("")}
/>


    </div>
  );
}
