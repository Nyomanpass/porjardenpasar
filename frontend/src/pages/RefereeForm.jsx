import React, { useState, useEffect } from 'react';
import api from '../api';
import { ChevronLeft, History, Trophy, RotateCcw, RefreshCw} from 'lucide-react';
import AlertMessage from '../components/AlertMessage';

const RefereeForm = ({ match, onFinish, onBack }) => {
  // State Skor Utama
  const [p1Point, setP1Point] = useState("0");
  const [p2Point, setP2Point] = useState("0");
  const [p1Game, setP1Game] = useState(0);
  const [p2Game, setP2Game] = useState(0);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isServeEnabled, setIsServeEnabled] = useState(false);
  
  const [currentSet, setCurrentSet] = useState(1);
  const [setMenangP1, setSetMenangP1] = useState(0);
  const [setMenangP2, setSetMenangP2] = useState(0);
  

  const [showResultConfirm, setShowResultConfirm] = useState(false);
  const [finalWinnerData, setFinalWinnerData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const points = ["0", "15", "30", "40", "Ad"];

  const [scoreRule, setScoreRule] = useState(null);
  const targetSetWin = scoreRule ? Math.ceil(scoreRule.jumlahSet / 2) : null;

  const [server, setServer] = useState(1); 
  const [serveCount, setServeCount] = useState(2); 

  const [setScores, setSetScores] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmUndo, setConfirmUndo] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const [matchDuration, setMatchDuration] = useState(0); // dalam detik
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStartedAt, setTimerStartedAt] = useState(null);
  const [confirmPause, setConfirmPause] = useState(false);
  const [, forceRender] = useState(0);


useEffect(() => {
  let interval;

  if (isTimerRunning) {
    interval = setInterval(() => {
      forceRender(prev => prev + 1); // 🔥 paksa render tiap detik
    }, 1000);
  }

  return () => clearInterval(interval);
}, [isTimerRunning]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hrs.toString().padStart(2, "0"),
      mins.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0")
    ].join(":");
  };


const handleStartResume = async () => {
  if (isTimerRunning) return; 

  const now = new Date();

  setIsTimerRunning(true);
  setTimerStartedAt(now);

  await api.patch(`/matches/${match.id}/duration`, {
    durasi: matchDuration,
    isTimerRunning: true,
    timerStartedAt: now
  });
};


  const handlePause = async () => {
    const now = new Date();
    const started = new Date(timerStartedAt);

    const diff = Math.floor((now - started) / 1000);
    const finalDuration = matchDuration + diff;

    setIsTimerRunning(false);
    setMatchDuration(finalDuration);
    setTimerStartedAt(null);

    await api.patch(`/matches/${match.id}/duration`, {
      durasi: finalDuration,
      isTimerRunning: false,
      timerStartedAt: null
    });
  };

  const handleResetTimer = async () => {
    setIsTimerRunning(false);
    setMatchDuration(0);
    setTimerStartedAt(null);

    await api.patch(`/matches/${match.id}/duration`, {
      durasi: 0,
      isTimerRunning: false,
      timerStartedAt: null
    });
  };


  const formatName = (name = "") => {
    return name
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const fetchSetHistory = async () => {
    try {
      const res = await api.get(`/matches/${match.id}`);
      const data = res.data;
      const history = [];
      if (data.set1P1 !== null) history.push({ set: 1, p1: data.set1P1, p2: data.set1P2 });
      if (data.set2P1 !== null) history.push({ set: 2, p1: data.set2P1, p2: data.set2P2 });
      if (data.set3P1 !== null) history.push({ set: 3, p1: data.set3P1, p2: data.set3P2 });
      setSetScores(history);
    } catch (err) {
      console.error("Gagal ambil history set", err);
    }
  };


useEffect(() => {
  const fetchLastScore = async () => {
    try {
      // 1. Ambil data MATCH dulu untuk tahu SET berapa sekarang
      const resMatch = await api.get(`/matches/${match.id}`);
      const matchData = resMatch.data;

      // 2. Ambil LOG terakhir untuk tahu POINT (0, 15, 30, 40)
      const resLog = await api.get(`/match-log/${match.id}`);
      
      if (resLog.data) {
        const log = resLog.data;
        
        // JIKA SET DI LOG BERBEDA DENGAN SET DI MATCH (KARENA BARU PINDAH SET)
        // MAKA RESET POINT KE 0-0
        if (log.setKe !== matchData.currentSet) {
          setP1Point("0");
          setP2Point("0");
          setP1Game(0); 
          setP2Game(0);
        } else {
          setP1Point(log.skorP1.toString());
          setP2Point(log.skorP2.toString());
          setP1Game(log.gameP1);
          setP2Game(log.gameP2);
        }
        
        setCurrentSet(matchData.currentSet); // Ambil dari MatchModel
        setSetMenangP1(matchData.score1 || 0);
        setSetMenangP2(matchData.score2 || 0);
      }
      
      // Susun histori set untuk tampilan atas
      const history = [];
      if (matchData.set1P1 !== null) history.push({ set: 1, p1: matchData.set1P1, p2: matchData.set1P2 });
      if (matchData.set2P1 !== null) history.push({ set: 2, p1: matchData.set2P1, p2: matchData.set2P2 });
      if (matchData.set3P1 !== null) history.push({ set: 3, p1: matchData.set3P1, p2: matchData.set3P2 });
      setSetScores(history);

    } catch (err) {
      console.error("Gagal sinkronisasi:", err);
    } finally {
      setIsLoading(false);
    }
  };
  fetchLastScore();
}, [match.id]);


useEffect(() => {
  api.get(`/matches/${match.id}`).then(res => {
    setScoreRule(res.data.scoreRule);
    const data = res.data;

    setMatchDuration(data.durasi || 0);

    if (data.isTimerRunning && data.timerStartedAt) {
      setIsTimerRunning(true);
      setTimerStartedAt(new Date(data.timerStartedAt));
    } else {
      setIsTimerRunning(false);
      setTimerStartedAt(null);
    }
  });
}, [match.id]);


const handleResetMatch = async () => {
  try {
    await api.delete(`/reset-match/${match.id}`);

    setP1Point("0");
    setP2Point("0");
    setP1Game(0);
    setP2Game(0);
    setCurrentSet(1);
    setSetMenangP1(0);
    setSetMenangP2(0);
    setSetScores([]);

   setSuccess("Match berhasil di-reset");
  } catch (err) {
    setError("Gagal reset match");
    console.error(err);
  } finally{
    setConfirmReset(false);
  }

};


const handlePoint = async (player) => {
  if (!scoreRule) return;

  // 1. variable untuk kalkulasi
  let nP1 = p1Point, nP2 = p2Point;
  let nG1 = parseInt(p1Game) || 0, nG2 = parseInt(p2Game) || 0;
  let nSetW1 = parseInt(setMenangP1) || 0, nSetW2 = parseInt(setMenangP2) || 0;
  let nSetKe = parseInt(currentSet) || 1;

  let isGameEnd = false;
  let isSetFinished = false;
  let isMatchFinished = false;
  let logDesc = "";

  const { jumlahSet, gamePerSet, tieBreakPoint, finalTieBreakPoint, useDeuce } = scoreRule;
  const isProset = jumlahSet === 1;
  const isBO3 = jumlahSet > 1;

 
  let isTieBreakMode = false;
  if (isProset) {
    isTieBreakMode = (nG1 === gamePerSet - 1 && nG2 === gamePerSet - 1);
  } else if (isBO3) {
     if (nSetKe === 3) {
      isTieBreakMode = true;
    } 
    // Set 1 & 2 → tiebreak kalau 6-6
    else {
      isTieBreakMode = (nG1 === gamePerSet && nG2 === gamePerSet);
    }
  }

  /* ================================
     A. LOGIKA POINT
  ================================== */
  if (isTieBreakMode) {
    let tP1 = parseInt(nP1) || 0;
    let tP2 = parseInt(nP2) || 0;
    player === 1 ? tP1++ : tP2++;

    nP1 = tP1.toString();
    nP2 = tP2.toString();

    // Khusus BO3 Set 3 pakai Final Tiebreak (misal 10 poin)
    let tbTarget = (isBO3 && nSetKe === 3) ? finalTieBreakPoint : tieBreakPoint;

    if ((tP1 >= tbTarget && tP1 - tP2 >= 2) || (tP2 >= tbTarget && tP2 - tP1 >= 2)) {
      isGameEnd = true; 
    }
    logDesc = `Tiebreak: ${nP1}-${nP2}`;
  } else {
    // Logika Skor Tenis (0, 15, 30, 40, Ad)
    const points = ["0", "15", "30", "40", "Ad"];
    if (useDeuce) {
      if (player === 1) {
        if (nP1 === "40" && nP2 !== "40" && nP2 !== "Ad") isGameEnd = true;
        else if (nP1 === "40" && nP2 === "40") nP1 = "Ad";
        else if (nP1 === "Ad") isGameEnd = true;
        else if (nP2 === "Ad") nP2 = "40";
        else nP1 = points[points.indexOf(nP1) + 1];
      } else {
        if (nP2 === "40" && nP1 !== "40" && nP1 !== "Ad") isGameEnd = true;
        else if (nP1 === "40" && nP2 === "40") nP2 = "Ad";
        else if (nP2 === "Ad") isGameEnd = true;
        else if (nP1 === "Ad") nP1 = "40";
        else nP2 = points[points.indexOf(nP2) + 1];
      }
    } else {
      if (player === 1) {
        if (nP1 === "40") isGameEnd = true;
        else nP1 = points[points.indexOf(nP1) + 1];
      } else {
        if (nP2 === "40") isGameEnd = true;
        else nP2 = points[points.indexOf(nP2) + 1];
      }
    }
    logDesc = `Point: ${nP1}-${nP2}`;
  }

  /* ================================
     B. LOGIKA GAME & SET (KHUSUS BO3 & PROSET)
  ================================== */
if (isGameEnd) {
  // 🔥 KHUSUS SET 3 (SUPER TIEBREAK)
  if (isBO3 && nSetKe === 3) {

    isSetFinished = true;

    const tP1 = parseInt(nP1);
    const tP2 = parseInt(nP2);

    // Tentukan pemenang dari poin tiebreak
    if (tP1 > tP2) {
      nG1 = 1;   // hanya untuk penentu winner
      nG2 = 0;
    } else {
      nG1 = 0;
      nG2 = 1;
    }

  } else {
    player === 1 ? nG1++ : nG2++;
    nP1 = "0";
    nP2 = "0";
    logDesc = `Game: ${nG1}-${nG2}`;

    if (isProset) {
      if (nG1 >= gamePerSet || nG2 >= gamePerSet) isSetFinished = true;
    } else if (isBO3) {
      const winNormal =
        (nG1 === gamePerSet && Math.abs(nG1 - nG2) >= 2) ||
        (nG2 === gamePerSet && Math.abs(nG1 - nG2) >= 2);

      const winDeuceGame =
        (nG1 === gamePerSet + 1 && nG2 === gamePerSet - 1) ||
        (nG2 === gamePerSet + 1 && nG1 === gamePerSet - 1);

      const winTiebreak = (nG1 > gamePerSet || nG2 > gamePerSet);

      if (winNormal || winDeuceGame || winTiebreak)
        isSetFinished = true;
    }
  }
}

  /* ================================
     C. LOGIKA MATCH
  ================================== */

  const finalGameP1InSet = nG1;
  const finalGameP2InSet = nG2;
  const setSelesaiTadi = nSetKe;

 if (isSetFinished) {

  const finishedSetNumber = nSetKe;
  const finalGameP1 = nG1;
  const finalGameP2 = nG2;

  setSetScores(prev => [
    ...prev,
    { set: finishedSetNumber, p1: finalGameP1, p2: finalGameP2 }
  ]);

  finalGameP1 > finalGameP2 ? nSetW1++ : nSetW2++;

  const targetWin = isProset ? 1 : Math.ceil(jumlahSet / 2);

  if (nSetW1 >= targetWin || nSetW2 >= targetWin) {
    isMatchFinished = true;
    logDesc = `Match Ended (${finalGameP1}-${finalGameP2})`;
    setSuccess(`Match Selesai! Skor Akhir: ${nSetW1}-${nSetW2}`);
  } else {
    logDesc = `Set ${finishedSetNumber} Ended (${finalGameP1}-${finalGameP2})`;
    setSuccess(`Set ${finishedSetNumber} Selesai! Skor: ${finalGameP1InSet}-${finalGameP2InSet}. Memasuki Set ${finishedSetNumber + 1}.`);

    // 🔥 RESET SET BARU SETELAH SIMPAN NILAI
    nSetKe++;
    nG1 = 0;
    nG2 = 0;
    nP1 = "0";
    nP2 = "0";
  }
}

  // 4. Update UI State
  setP1Point(nP1); setP2Point(nP2);
  setP1Game(nG1); setP2Game(nG2);
  setCurrentSet(nSetKe);
  setSetMenangP1(nSetW1); setSetMenangP2(nSetW2);

  // 5. Backend Update
  try {
    await api.post('/update-point', {
     matchId: match.id,
      // Jika set baru saja selesai, kirim log ke nomor set yang lama (misal Set 1)
      // Dan gunakan skor game terakhir (misal 3-6), bukan 0-0
      setKe: isSetFinished && !isMatchFinished ? setSelesaiTadi : nSetKe, 
      skorP1: nP1, 
      skorP2: nP2,
      gameP1: isSetFinished && !isMatchFinished ? finalGameP1InSet : nG1, 
      gameP2: isSetFinished && !isMatchFinished ? finalGameP2InSet : nG2,
      setMenangP1: nSetW1,
      setMenangP2: nSetW2,
      statusMatch: isMatchFinished ? 'selesai' : 'berlangsung',
      keterangan: logDesc
    });

    if (isSetFinished && !isMatchFinished) {
      await api.post('/update-point', {
        matchId: match.id,
        setKe: nSetKe, // Ini sudah angka set baru (misal: 2)
        skorP1: "0",
        skorP2: "0",
        gameP1: 0,
        gameP2: 0,
        setMenangP1: nSetW1,
        setMenangP2: nSetW2,
        statusMatch: 'berlangsung',
        keterangan: `Starting Set ${nSetKe}`
      });
    }

    if (isMatchFinished) {
        const finalDuration =
          isTimerRunning && timerStartedAt
            ? matchDuration +
              Math.floor((Date.now() - new Date(timerStartedAt)) / 1000)
            : matchDuration;

        setIsTimerRunning(false);
        setTimerStartedAt(null);
        setMatchDuration(finalDuration);

        await api.patch(`/matches/${match.id}/duration`, {
          durasi: finalDuration,
          isTimerRunning: false,
          timerStartedAt: null
        });


      const isDouble = !!match.doubleTeam1Id;
      const winnerId = nSetW1 > nSetW2 ? (isDouble ? match.doubleTeam1Id : match.peserta1Id) : (isDouble ? match.doubleTeam2Id : match.peserta2Id);

      await api.patch(`/${match.id}/winner`, {
        winnerId: isDouble ? null : winnerId,
        winnerDoubleId: isDouble ? winnerId : null,
        score1: nSetW1, score2: nSetW2, isDouble
      });

      setFinalWinnerData({ winnerId, score1: nSetW1, score2: nSetW2 });
      setShowResultConfirm(true);
    }
  } catch (err) { console.error("Gagal update server:", err); }
};


  const handleUndo = async () => {
   
      try {
        await api.delete(`/undo-point/${match.id}`);
        const response = await api.get(`/match-log/${match.id}`);
        if (response.data) {
          setP1Point(response.data.skorP1); setP2Point(response.data.skorP2);
          setP1Game(response.data.gameP1); setP2Game(response.data.gameP2);
          setCurrentSet(response.data.setKe);
          setSetMenangP1(response.data.setMenangP1);
          setSetMenangP2(response.data.setMenangP2);
        } else {
          setP1Point("0"); setP2Point("0"); setP1Game(0); setP2Game(0);
          setCurrentSet(1); setSetMenangP1(0); setSetMenangP2(0);
        }
         setSuccess("Undo berhasil. Poin terakhir dibatalkan.");
      } catch (err) { 
        setError("Tidak bisa undo poin.");
      } finally {
        setConfirmUndo(false);
      }
    
  };

  const displayedDuration =
  isTimerRunning && timerStartedAt
    ? matchDuration +
      Math.floor((Date.now() - new Date(timerStartedAt)) / 1000)
    : matchDuration;

  if (isLoading) return <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  return (
 <div
  className={`fixed inset-0 z-[1000] font-sans flex items-center justify-center p-4 overflow-hidden transition-colors duration-300 ${
    isDarkMode
      ? "bg-[#0a0f1e] text-white"
      : "bg-white text-black"
  }`}
>
    {success && (
      <AlertMessage
        type="success"
        message={success}
        onClose={() => setSuccess("")}
      />
    )}

    {error && (
      <AlertMessage
        type="error"
        message={error}
        onClose={() => setError("")}
      />
    )}



  {/* Header Indikator Status - Dibuat lebih melayang */}
<div className="min-h-screen w-[100%] md:w-[75%] flex items-center justify-center">
     <div className="w-full relative">
      {/* MENU ⋮ - Dibuat lebih modern */}
      <div className="absolute top-0 right-4 z-[60]">
        <div className="flex flex-col items-end">
          
          {/* Tombol Titik Tiga */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all border ${
              showMenu
                ? isDarkMode
                  ? "bg-slate-700 border-slate-500 shadow-lg"
                  : "bg-gray-200 border-gray-300 shadow-md"
                : isDarkMode
                  ? "bg-slate-800/50 border-slate-700 hover:bg-slate-700"
                  : "bg-gray-100 border-gray-300 hover:bg-gray-200"
            }`}
          >
            <span className={`text-xl font-black ${isDarkMode ? "text-white" : "text-black"}`}>
              {showMenu ? "✕" : "⋮"}
            </span>
          </button>

          {showMenu && (
            <div className="mt-3 flex flex-col gap-3 items-end animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Dropdown Menu */}
              <div
                className={`rounded-2xl shadow-2xl w-52 overflow-hidden backdrop-blur-xl border transition-colors ${
                  isDarkMode
                    ? "bg-slate-900/95 border-slate-700"
                    : "bg-white border-gray-300 shadow-lg"
                }`}
              >

                {/* Undo */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setConfirmUndo(true);
                  }}
                  className={`w-full text-left px-5 py-4 text-sm flex items-center gap-3 transition-colors border-b group ${
                    isDarkMode
                      ? "hover:bg-slate-800 border-slate-800"
                      : "hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  <RotateCcw
                    size={18}
                    className="text-blue-500 group-hover:rotate-[-45deg] transition-transform"
                  />
                  <span className={`font-semibold ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
                    Undo Last Point
                  </span>
                </button>

                {/* Reset */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setConfirmReset(true);
                  }}
                  className={`w-full text-left px-5 py-4 text-sm flex items-center gap-3 transition-colors group ${
                    isDarkMode
                      ? "hover:bg-red-950/40"
                      : "hover:bg-red-100"
                  }`}
                >
                  <RefreshCw
                    size={18}
                    className="text-red-500 group-hover:rotate-180 transition-transform duration-500"
                  />
                  <span className="font-semibold text-red-500">
                    Reset Match
                  </span>
                </button>

                {/* Toggle Dark / Light */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-full text-left px-5 py-4 text-sm flex items-center gap-3 transition-colors border-t ${
                    isDarkMode
                      ? "hover:bg-slate-800 border-slate-800 text-slate-200"
                      : "hover:bg-gray-100 border-gray-200 text-gray-800"
                  }`}
                >
                  <span className="font-semibold">
                    {isDarkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
                  </span>
                </button>

                <button
                  onClick={() => setIsServeEnabled(!isServeEnabled)}
                  className={`w-full text-left px-5 py-4 text-sm flex items-center gap-3 transition-colors border-t ${
                    isDarkMode
                      ? "hover:bg-slate-800 border-slate-800 text-slate-200"
                      : "hover:bg-gray-100 border-gray-200 text-gray-800"
                  }`}
                >
                  <span className="font-semibold">
                    {isServeEnabled ? "Disable Serve Buttons" : "Enable Serve Buttons"}
                  </span>
                </button>

                

                      <button
                        onClick={handleResetTimer}
                        className={`w-full text-left px-5 py-4 text-sm flex items-center gap-3 transition-colors border-t ${
                          isDarkMode
                            ? "hover:bg-slate-800 border-slate-800 text-slate-200"
                            : "hover:bg-gray-100 border-gray-200 text-gray-800"
                        }`}
                      >
                        Reset Timer
                      </button>
                  
              </div>

              {/* Info Aturan */}
              {scoreRule && (
                <div
                  className={`p-4 backdrop-blur-md rounded-2xl shadow-2xl w-64 border transition-colors ${
                    isDarkMode
                      ? "bg-slate-900/90 border-slate-700"
                      : "bg-white border-gray-300 shadow-lg"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p
                      className={`text-[9px] font-black uppercase tracking-widest ${
                        isDarkMode ? "text-slate-500" : "text-gray-500"
                      }`}
                    >
                      Tournament Rule
                    </p>

                    <p className="text-[9px] font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded italic leading-none">
                      {scoreRule.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold text-center ${
                        isDarkMode
                          ? "bg-slate-800 text-slate-400"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {scoreRule.jumlahSet} Sets
                    </span>

                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold text-center ${
                        isDarkMode
                          ? "bg-slate-800 text-slate-400"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {scoreRule.gamePerSet} Games
                    </span>

                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold text-center ${
                        isDarkMode
                          ? "bg-slate-800 text-slate-400"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {scoreRule.useDeuce ? "Deuce" : "No Deuce"}
                    </span>

                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold text-center ${
                        isDarkMode
                          ? "bg-slate-800 text-slate-400"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      TB: {scoreRule.tieBreakPoint}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

          <div className="flex justify-center mb-4">
            <div className={`px-6 py-2 rounded-full font-mono text-lg font-black tracking-widest ${
              isDarkMode ? "bg-slate-800 text-green-400" : "bg-gray-200 text-green-600"
            }`}>
              {formatTime(displayedDuration)}
            </div>
          </div>

         

      {/* Scoreboard Set Sejarah - Horizontal Scroller Style */}
    <div className="flex gap-3 overflow-x-auto no-scrollbar">
  {/* Jika belum ada satu pun set yang selesai, tampilkan teks kosong/placeholder */}
  {setScores.length === 0 ? (
    <span
      className={`text-xs font-medium italic ${
        isDarkMode ? "text-slate-600" : "text-gray-500"
      }`}
    >
      No completed sets yet...
    </span>
  ) : (
    <>
      {/* ✅ HANYA MENAMPILKAN SET YANG SUDAH SELESAI */}
      {setScores.map((s, index) => (
        <div
          key={index}
          className={`flex items-center px-4 py-2 mb-3 rounded-xl gap-3 min-w-fit border ${
            isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-300 shadow-sm"
          }`}
        >
          <span className="text-[10px] font-bold uppercase opacity-60">
            SET {s.set}
          </span>

          <span className="text-base font-black tabular-nums">
            {s.p1} - {s.p2}
          </span>
        </div>
      ))}
    </>
  )}
</div>

      {/* MAIN SCOREBOARD - The Heroes Section */}
  <div className={`rounded-[2.5rem] p-1 border mb-8 relative overflow-hidden transition-colors duration-300 ${
    isDarkMode
      ? "bg-gradient-to-br from-slate-900 via-[#131b2e] to-slate-900 border-white/10"
      : "bg-gray-100 border-gray-300"
  }`}>
    
    {/* Badge Set Aktif */}

    <div
      className={`absolute top-0 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-b-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-lg z-10 transition-colors ${
        isDarkMode
          ? "bg-blue-600 text-white"
          : "bg-blue-500 text-white shadow-blue-300/40"
      }`}
    >
      SET {currentSet}
    </div>

    {/* Status Area */}
   <div className="text-center mt-10 h-6">
  {scoreRule && (() => {

    const isProset = scoreRule.jumlahSet === 1;
    const isBO3 = scoreRule.jumlahSet > 1;

    const tbTrigger = isBO3
      ? scoreRule.gamePerSet
      : scoreRule.gamePerSet - 1;

    const isDeuceGame =
      p1Game === tbTrigger - 1 &&
      p2Game === tbTrigger - 1;

    const isTieBreak =
      p1Game === tbTrigger &&
      p2Game === tbTrigger;

    return (
      <>
       {isDeuceGame && (
          <span
            className={`inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border shadow-md transition-all duration-300
              ${
                isDarkMode
                  ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/30 shadow-yellow-500/10"
                  : "bg-yellow-100 text-yellow-700 border-yellow-300 shadow-yellow-300/40"
              }`}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
            Deuce Games
          </span>
        )}

        {isTieBreak && (
          <span
            className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl transition-all duration-300 animate-pulse
              ${
                isDarkMode
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-500/30"
                  : "bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-orange-400/40"
              }`}
          >
            Tie Break Round
          </span>
        )}
      </>
    );

  })()}
</div>
    <div className="pt-5 pb-8 px-4">
      <div className="grid grid-cols-2 gap-6 relative">
        
        {/* Divider Tengah */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3/4 w-[1px] bg-gradient-to-b from-transparent via-slate-700/50 to-transparent"></div>

        {/* PLAYER 1 */}
        <div className="flex flex-col items-center">
          {/* Serve Indicator - Menjadi penanda utama wasit */}
          {isServeEnabled && (
         <div className="h-6 mb-3 flex items-center justify-center">
            {server === 1 ? (
              <div
                className={`flex gap-1.5 px-3 py-1 rounded-full border transition-colors ${
                  isDarkMode
                    ? "bg-yellow-400/20 border-yellow-400/40 shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                    : "bg-yellow-100 border-yellow-300 shadow-sm"
                }`}
              >
                {Array.from({ length: serveCount }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full animate-pulse transition-colors ${
                      isDarkMode
                        ? "bg-yellow-400 shadow-[0_0_10px_#facc15]"
                        : "bg-yellow-500"
                    }`}
                  />
                ))}
              </div>
            ) : (
              <div className="h-6" />
            )}
          </div>
          )}

          {/* NAMA PEMAIN */}
        <div className="min-h-[80px] flex flex-col items-center justify-center mb-3">
          {match.doubleTeam1?.namaTim ? (
            <>
              {match.doubleTeam1.namaTim.split(" / ").map((name, i, arr) => (
                <div
                  key={i}
                  className={`text-sm md:text-base font-bold text-center leading-snug transition-colors ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  {formatName(name)}
                  {i === 0 && (
                    <div
                      className={`font-black my-1 transition-colors ${
                        isDarkMode ? "text-yellow-400" : "text-yellow-600"
                      }`}
                    >
                      &
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <h2
              className={`text-sm md:text-base font-bold text-center leading-snug transition-colors ${
                isDarkMode ? "text-white" : "text-black"
              }`}
            >
              {formatName(match.peserta1?.namaLengkap)}
            </h2>
          )}
        </div>

          {/* POIN UTAMA */}
         <div
          className={`text-5xl font-black tabular-nums tracking-tighter transition-colors duration-300 ${
            isDarkMode
              ? "text-white drop-shadow-2xl"
              : "text-black"
          }`}
        >
          {p1Point}
        </div>

          {/* GAMES SCORE */}
          <div className="mt-6 flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Games</span>
            <div className="px-4 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <span className="text-2xl font-black text-blue-500 italic">{p1Game}</span>
            </div>
          </div>
        </div>

        {/* PLAYER 2 */}
         <div className="flex flex-col items-center">
          {/* Serve Indicator */}
          {isServeEnabled && (
        <div className="h-6 mb-3 flex items-center justify-center">
          {server === 2 ? (
            <div
              className={`flex gap-1.5 px-3 py-1 rounded-full border transition-colors ${
                isDarkMode
                  ? "bg-yellow-400/20 border-yellow-400/40 shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                  : "bg-yellow-100 border-yellow-300 shadow-sm"
              }`}
            >
              {Array.from({ length: serveCount }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full animate-pulse transition-colors ${
                    isDarkMode
                      ? "bg-yellow-400 shadow-[0_0_10px_#facc15]"
                      : "bg-yellow-500"
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="h-6" />
          )}
        </div>
          )}

          {/* NAMA PEMAIN */}
        <div className="min-h-[80px] flex flex-col items-center justify-center mb-3">
          {match.doubleTeam2?.namaTim ? (
            <>
              {match.doubleTeam2.namaTim.split(" / ").map((name, i, arr) => (
                <div
                  key={i}
                  className={`text-sm md:text-base font-bold text-center leading-snug transition-colors ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  {formatName(name)}
                  {i === 0 && (
                    <div
                      className={`font-black my-1 transition-colors ${
                        isDarkMode ? "text-yellow-400" : "text-yellow-600"
                      }`}
                    >
                      &
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <h2
              className={`text-sm md:text-base font-bold text-center leading-snug transition-colors ${
                isDarkMode ? "text-white" : "text-black"
              }`}
            >
              {formatName(match.peserta2?.namaLengkap)}
            </h2>
          )}
        </div>
          {/* POIN UTAMA */}

          <div
            className={`text-5xl font-black tabular-nums tracking-tighter transition-colors duration-300 ${
              isDarkMode
                ? "text-white drop-shadow-2xl"
                : "text-black"
            }`}
          >
          {p2Point}
          </div>

          {/* GAMES SCORE */}
          <div className="mt-6 flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Games</span>
            <div className="px-4 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
              <span className="text-2xl font-black text-red-500 italic">{p2Game}</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    {/* Tie Break Label */}
   
  </div>

      {/* BUTTONS SECTION - Tactile Experience */}
  <div className="grid grid-cols-2 gap-3 px-1">
    {/* BUTTON PLAYER 1 - SLIM VERSION */}
    <button 
      onClick={() => handlePoint(1)} 
      className="group relative h-28 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[1.5rem] overflow-hidden shadow-lg shadow-blue-900/30 active:scale-95 transition-all flex flex-col items-center justify-center border-t border-white/20"
    >
      {/* Overlay kilatan saat ditekan */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity"></div>
      
      <span className="relative text-[10px] font-black text-blue-100/60 uppercase tracking-[0.2em] mb-1">
        Add Point P1
      </span>
      <div className="flex items-center gap-2">
        <span className="relative text-3xl font-black text-white">+</span>
        
      </div>
    </button>

    {/* BUTTON PLAYER 2 - SLIM VERSION */}
    <button 
      onClick={() => handlePoint(2)} 
      className="group relative h-28 bg-gradient-to-br from-red-600 to-red-700 rounded-[1.5rem] overflow-hidden shadow-lg shadow-red-900/30 active:scale-95 transition-all flex flex-col items-center justify-center border-t border-white/20"
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity"></div>
      
      <span className="relative text-[10px] font-black text-red-100/60 uppercase tracking-[0.2em] mb-1">
        Add Point P2
      </span>
      <div className="flex items-center gap-2">
        <span className="relative text-3xl font-black text-white">+</span>
      
      </div>
    </button>
  </div>

    <div className="grid grid-cols-1 gap-4 mt-6">
        <div className="">

          {!isTimerRunning ? (
            <button
              onClick={handleStartResume}
              className="w-full h-12 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold uppercase tracking-wide transition-all active:scale-95 shadow-md"
            >
              {matchDuration === 0 ? "Start Match" : "Resume Match"}
            </button>
          ) : (
            <button
              onClick={() => setConfirmPause(true)}
              className="w-full h-12 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold uppercase tracking-wide transition-all active:scale-95 shadow-md"
            >
              Pause Match
            </button>
          )}

        </div>
      </div>

      {/* SERVE CONTROLS */}
      {isServeEnabled && (
        <div className="grid grid-cols-2 gap-4 mt-6">

          <button
            onClick={() => {
              if (serveCount === 2) {
                setServeCount(1);
              } else {
                setServeCount(2);
                setServer(server === 1 ? 2 : 1);
              }
            }}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-yellow-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95"
          >
            Fault (Serve)
          </button>

          <button
            onClick={() => {
              setServer(server === 1 ? 2 : 1);
              setServeCount(2);
            }}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95"
          >
            Change Service
          </button>

        </div>
      )}
    </div>
</div>

  {/* MODAL FINISH - Premium Centered Modal */}
  {showResultConfirm && (
  <div
  className={`fixed inset-0 backdrop-blur-xl z-[2000] flex items-center justify-center p-6 transition-all ${
    isDarkMode ? "bg-black/80" : "bg-black/40"
  }`}
>
  <div
    className={`w-full max-w-sm rounded-[3rem] p-8 text-center relative overflow-hidden transition-colors ${
      isDarkMode
        ? "bg-[#0f172a] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
        : "bg-white border border-gray-300 shadow-2xl"
    }`}
  >
    {/* Glow Effect (dark only strong) */}
    <div
      className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[80px] ${
        isDarkMode ? "bg-blue-600/20" : "bg-blue-300/30"
      }`}
    ></div>

    {/* Trophy */}
    <div className="w-20 h-20 bg-gradient-to-tr from-yellow-600 to-yellow-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-500/20">
      <Trophy className="text-slate-900" size={36} />
    </div>

    <h2
      className={`text-3xl font-black mb-2 tracking-tighter italic transition-colors ${
        isDarkMode ? "text-white" : "text-black"
      }`}
    >
      MATCH OVER
    </h2>

    <p
      className={`text-xs font-bold uppercase tracking-widest mb-8 transition-colors ${
        isDarkMode ? "text-slate-500" : "text-gray-500"
      }`}
    >
      Review Final Results
    </p>

    {/* Winner Box */}
    <div
      className={`rounded-3xl p-6 mb-8 border shadow-inner transition-colors ${
        isDarkMode
          ? "bg-black/40 border-white/5"
          : "bg-gray-100 border-gray-200"
      }`}
    >
      <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">
        Winner
      </div>

      <div
        className={`font-black text-xl mb-4 uppercase leading-tight transition-colors ${
          isDarkMode ? "text-white" : "text-black"
        }`}
      >
        {finalWinnerData?.winnerId === (match.doubleTeam1Id || match.peserta1Id)
          ? (match.peserta1?.namaLengkap || match.doubleTeam1?.namaTim)
          : (match.peserta2?.namaLengkap || match.doubleTeam2?.namaTim)}
      </div>

      <div className="flex justify-center items-center gap-6 mt-4">
        <div
          className={`text-4xl font-black transition-colors ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          {finalWinnerData?.score1}
        </div>

        <div
          className={`h-8 w-[2px] ${
            isDarkMode ? "bg-slate-800" : "bg-gray-300"
          }`}
        ></div>

        <div
          className={`text-4xl font-black transition-colors ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          {finalWinnerData?.score2}
        </div>
      </div>
    </div>

    {/* Buttons */}
    <div className="flex flex-col gap-4">
      <button
        onClick={() => onFinish(finalWinnerData)}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-blue-600/30"
      >
        Submit Score
      </button>

      <button
        onClick={() => {
          setShowResultConfirm(false);
          handleUndo();
        }}
        className={`w-full bg-transparent py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors ${
          isDarkMode
            ? "text-slate-500 hover:text-white"
            : "text-gray-500 hover:text-black"
        }`}
      >
        Correction (Undo)
      </button>
    </div>
  </div>
</div>
  )}


  {confirmUndo && (
  <AlertMessage
    type="warning"
    message="Yakin ingin meng-undo poin terakhir?"
    onClose={() => setConfirmUndo(false)}
  >
    <div className="flex gap-4 mt-6">
      <button
        onClick={() => setConfirmUndo(false)}
        className="flex-1 px-4 py-3 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition"
      >
        Batal
      </button>

      <button
        onClick={handleUndo}
        className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-blue-500 transition"
      >
        Ya, Undo
      </button>
    </div>
  </AlertMessage>
)}

{confirmReset && (
  <AlertMessage
    type="warning"
    message="Yakin ingin mereset semua skor? Data pertandingan akan kembali ke awal."
    onClose={() => setConfirmReset(false)}
  >
    <div className="flex gap-4 mt-6">
      <button
        onClick={() => setConfirmReset(false)}
        className="flex-1 px-4 py-3 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition"
      >
        Batal
      </button>

      <button
        onClick={handleResetMatch}
        className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition"
      >
        Ya, Reset
      </button>
    </div>
  </AlertMessage>
)}

{confirmPause && (
  <AlertMessage
    type="warning"
    message="Yakin ingin pause match?"
    onClose={() => setConfirmPause(false)}
  >
    <div className="flex gap-4 mt-6">
      <button
        onClick={() => setConfirmPause(false)}
        className="flex-1 px-4 py-2 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition"
      >
        Batal
      </button>

      <button
        onClick={() => {
          handlePause();
          setConfirmPause(false);
        }}
        className="flex-1 px-4 py-2 rounded-xl bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition"
      >
        Ya, Pause
      </button>
    </div>
  </AlertMessage>
)}


</div>
  );
};

export default RefereeForm;