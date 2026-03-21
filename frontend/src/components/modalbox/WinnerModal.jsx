import { useState, useEffect } from "react";
import api from "../../api";

function WinnerModal({ match, onClose, onSaved }) {
  const isDouble = !!match.doubleTeam1Id;

  const p1Id = isDouble ? match.doubleTeam1Id : match.peserta1Id;
  const p2Id = isDouble ? match.doubleTeam2Id : match.peserta2Id;

  const p1Name = isDouble
    ? match.doubleTeam1?.namaTim
    : match.peserta1?.namaLengkap;

  const p2Name = isDouble
    ? match.doubleTeam2?.namaTim
    : match.peserta2?.namaLengkap;

  const [rule, setRule] = useState(null);
  const [winnerId, setWinnerId] = useState("");
  const [loading, setLoading] = useState(false);

  // ambil ScoreRule dari backend
  useEffect(() => {
    if (!match.scoreRuleId) return;

    api.get(`/score-rules/${match.scoreRuleId}`).then(res => {
      setRule(res.data);
    });
  }, [match.scoreRuleId]);

  if (!rule) return null;

  // =========================
  // ✅ SIMPAN WO (AUTO POINT → GAME → SET)
  // =========================
 const handleWO = async () => {
  if (!winnerId) {
    alert("Pilih pemenang dulu");
    return;
  }

  const isDouble = !!match.doubleTeam1Id;
  const winnerSide = winnerId === p1Id ? "p1" : "p2";

  const finalSetWin = Math.ceil(rule.jumlahSet / 2);

  try {
    setLoading(true);

    // 1. Buat skor WO otomatis
    await api.post("/matches/manual-wo-point", {
      matchId: match.id,
      winnerSide
    });

    // 2. SET WINNER (INI YANG MEMICU BAGAN LANJUT)
    await api.patch(`/${match.id}/winner`, {
      winnerId: isDouble ? null : winnerId,
      winnerDoubleId: isDouble ? winnerId : null,
      score1: winnerSide === "p1" ? finalSetWin : 0,
      score2: winnerSide === "p2" ? finalSetWin : 0,
      isDouble
    });

    onSaved();
    onClose();
  } catch (err) {
    console.error(err);
    alert("Gagal menyimpan WO");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999]">
  <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 animate-in zoom-in duration-200">

    {/* HEADER */}
    <div className="text-center mb-5">
      <h3 className="text-2xl font-extrabold text-gray-900">
        Input Skor Manual (WO)
      </h3>
      <p className="text-sm text-gray-500 mt-1">
        Rule: <b>{rule.name}</b> • {rule.jumlahSet} set • {rule.gamePerSet} game
      </p>
    </div>

    {/* PILIH PEMENANG */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <button
        onClick={() => setWinnerId(p1Id)}
        className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all duration-200 flex flex-col items-center gap-2
          ${
            winnerId === p1Id
              ? "bg-green-500 text-white border-green-600 shadow-lg scale-105"
              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-green-50 hover:border-green-400"
          }
        `}
      >
        🏆
        <span className="text-center">{p1Name}</span>
      </button>

      <button
        onClick={() => setWinnerId(p2Id)}
        className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all duration-200 flex flex-col items-center gap-2
          ${
            winnerId === p2Id
              ? "bg-green-500 text-white border-green-600 shadow-lg scale-105"
              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-green-50 hover:border-green-400"
          }
        `}
      >
        🏆
        <span className="text-center">{p2Name}</span>
      </button>
    </div>

    {/* INFO */}
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center mb-5">
      <p className="text-xs text-gray-600 leading-relaxed">
        Sistem akan otomatis membuat skor:
        <br />
        <b className="text-gray-800">
          {rule.gamePerSet}-0 per set sampai menang{" "}
          {Math.ceil(rule.jumlahSet / 2)} set
        </b>
      </p>
    </div>

    {/* TOMBOL AKSI */}
    <div className="space-y-3">
      <button
        onClick={handleWO}
        disabled={!winnerId || loading}
        className={`w-full py-3 rounded-2xl font-extrabold text-white transition-all shadow-lg
          ${
            winnerId
              ? "bg-red-600 hover:bg-red-700 active:scale-95"
              : "bg-gray-300 cursor-not-allowed"
          }
        `}
      >
        {loading ? "⏳ Menyimpan..." : "Menang WO (lawan tidak hadir)"}
      </button>

      <button
        onClick={onClose}
        className="w-full py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition"
      >
        Batal
      </button>
    </div>

  </div>
</div>

  );
}

export default WinnerModal;
