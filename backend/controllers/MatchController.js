import { Match } from "../models/MatchModel.js";
import { Peserta } from "../models/PesertaModel.js";
import { Bagan } from "../models/BaganModel.js";
import { Jadwal } from "../models/JadwalModel.js";
import { DoubleTeam } from "../models/DoubleTeamModel.js";
import { MatchScoreLog } from "../models/MatchScoreLog.js";
import { KelompokUmur } from "../models/KelompokUmurModel.js";
import { ScoreRule } from "../models/ScoreRuleModel.js";
import { User } from "../models/UserModel.js";

import { Op } from "sequelize";

const points = ["0", "15", "30", "40"];


const _processMatchPeserta = async (matchId, side1Id, side2Id, kategori) => {
  const match = await Match.findByPk(matchId);
  if (!match) return null;

  const isDouble = kategori === "double";
  let newStatus = "belum";
  let newWinnerId = null;

  // Logika BYE: Jika salah satu sisi null, yang ada isinya otomatis menang
  if (side1Id !== null && side2Id === null) {
    newStatus = "selesai";
    newWinnerId = side1Id;
  } else if (side1Id === null && side2Id !== null) {
    newStatus = "selesai";
    newWinnerId = side2Id;
  } else if (side1Id === null && side2Id === null) {
    // Jika keduanya null (kasus jarang), tetap belum
    newStatus = "belum";
  }

  if (isDouble) {
    match.doubleTeam1Id = side1Id;
    match.doubleTeam2Id = side2Id;
    match.winnerDoubleId = newWinnerId;
  } else {
    match.peserta1Id = side1Id;
    match.peserta2Id = side2Id;
    match.winnerId = newWinnerId;
  }

  match.status = newStatus;
  await match.save();

  // Promosi ke babak selanjutnya jika otomatis menang (BYE)
  if (newStatus === "selesai" && match.nextMatchId) {
    const nextMatch = await Match.findByPk(match.nextMatchId);
    if (nextMatch) {
      if (isDouble) {
        if (!nextMatch.doubleTeam1Id) nextMatch.doubleTeam1Id = newWinnerId;
        else nextMatch.doubleTeam2Id = newWinnerId;
      } else {
        if (!nextMatch.peserta1Id) nextMatch.peserta1Id = newWinnerId;
        else nextMatch.peserta2Id = newWinnerId;
      }
      await nextMatch.save();
    }
  }
  return match;
};


// 2. UPDATE WINNER (FIXED UNTUK DOUBLE)
export const updateWinner = async (req, res) => {
  try {
    const { matchId } = req.params;
    // Ambil winnerId (ini bisa berisi ID Peserta atau ID DoubleTeam dari frontend)
    const { winnerId, winnerDoubleId, score1, score2 } = req.body;

    const match = await Match.findByPk(matchId, {
      include: [{ model: Bagan, as: "bagan" }]
    });


    if (!match) return res.status(404).json({ msg: "Match tidak ditemukan" });

    const isDouble = match.bagan?.kategori === "double";

    // 1. Update Winner & Score pada Match saat ini
    if (isDouble) {
      match.winnerDoubleId = winnerDoubleId || winnerId; // Menangani jika frontend kirim salah satu
    } else {
      match.winnerId = winnerId;
    }

     // 🔥 Ambil user login
    const userId = req.user?.id;

    // 🔥 Isi referee jika belum ada
    if (!match.refereeId) {
      match.refereeId = userId;
    }
    
    match.score1 = score1;
    match.score2 = score2;
    match.status = "selesai";
    await match.save();

    // 2. Update status Jadwal jika ada
    await Jadwal.update({ status: "selesai" }, { where: { matchId } });

    // 3. LOGIKA PROMOSI: Pindahkan pemenang ke nextMatchId
    if (match.nextMatchId) {
      const next = await Match.findByPk(match.nextMatchId);
      if (next) {
        const idToPromote = isDouble ? match.winnerDoubleId : match.winnerId;

        if (isDouble) {
          // Cek slot mana yang kosong di babak berikutnya untuk Double
          if (!next.doubleTeam1Id) {
            next.doubleTeam1Id = idToPromote;
          } else if (next.doubleTeam1Id !== idToPromote) { 
            // Isi slot 2 jika slot 1 sudah terisi oleh pemenang dari match lain
            next.doubleTeam2Id = idToPromote;
          }
        } else {
          // Cek slot mana yang kosong di babak berikutnya untuk Single
          if (!next.peserta1Id) {
            next.peserta1Id = idToPromote;
          } else if (next.peserta1Id !== idToPromote) {
            next.peserta2Id = idToPromote;
          }
        }
        await next.save();

        // 4. CEK BYE DI BABAK BERIKUTNYA
        // Jika setelah promosi babak berikutnya ternyata lawannya KOSONG (BYE), 
        // jalankan proses otomatis lagi agar dia naik terus
        const side1 = isDouble ? next.doubleTeam1Id : next.peserta1Id;
        const side2 = isDouble ? next.doubleTeam2Id : next.peserta2Id;
        
        // Jika salah satu sisi terisi dan yang lain memang tidak akan pernah diisi (BYE)
        // Anda bisa memanggil _processMatchPeserta di sini jika diperlukan
      }
    }

    res.json({ msg: "Match diupdate dan pemenang dilanjutkan", match });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};


// 3. GENERATE UNDIAN (FIXED LOGIC)
export const generateUndian = async (req, res) => {
  try {
    const { id } = req.params;
    const { seededPeserta = [] } = req.body; 

    const bagan = await Bagan.findByPk(id);
    if (!bagan) return res.status(404).json({ msg: "Bagan tidak ditemukan" });
    
    const { tournamentId, kelompokUmurId, kategori } = bagan;
    const isDouble = (kategori === "double"); 
    const ModelTarget = isDouble ? DoubleTeam : Peserta;

    // 1. RESET semua status seed lama agar Budi Santoso dkk kembali ke 0
    await ModelTarget.update(
      { isSeeded: false }, 
      { where: { tournamentId, kelompokUmurId } }
    );

    // 2. Ambil semua peserta yang statusnya 'verified'
    const allPeserta = await ModelTarget.findAll({ 
      where: { tournamentId, kelompokUmurId, status: "verified" } 
    });

    if (allPeserta.length === 0) {
      return res.status(400).json({ msg: `Data ${kategori} verified tidak ditemukan!` });
    }

    // 3. Tentukan ukuran bracket
    let bracketSize = 2;
    while (bracketSize < allPeserta.length) bracketSize *= 2;

    const initialSlots = new Array(bracketSize).fill('EMPTY');
    const assignedSlots = new Set();

    // --- PERBAIKAN DI SINI ---
    // Gunakan satu variabel saja untuk menampung ID yang akan dijadikan Seed
    // Filter hanya yang memiliki properti isSeeded dari modal
    const idsYangAkanJadiSeed = seededPeserta
      .filter(p => p.isSeeded)
      .map(p => Number(p.id));
    
    // 4. Update database agar peserta yang dipilih sekarang menjadi isSeeded = true
    if (idsYangAkanJadiSeed.length > 0) {
      await ModelTarget.update(
        { isSeeded: true }, 
        { where: { id: idsYangAkanJadiSeed } }
      );
    }

    // 5. Plotting Seeded ke slot bracket
    // 5. Plotting peserta ke slot (seed & non-seed manual)
    const plottedIds = new Set(); // 🔥 PENENTU UTAMA

    seededPeserta.forEach(p => {
      const idx = p.slot - 1;
      if (idx >= 0 && idx < bracketSize) {
        const pid = Number(p.id);
        initialSlots[idx] = pid;
        assignedSlots.add(idx);
        plottedIds.add(pid); // 🔥 CEGAH DOBEL
      }
    });


    // 6. Plotting BYE
    let byeCount = bracketSize - allPeserta.length;
    placeByes(initialSlots, assignedSlots, byeCount, seededPeserta);

    // 7. Isi sisa slot dengan peserta Non-Seeded
    // Gunakan variabel idsYangAkanJadiSeed untuk memfilter
    const nonSeededIds = shuffle(
      allPeserta
        .filter(p => !plottedIds.has(Number(p.id))) // 🔥 FIX UTAMA
        .map(p => p.id)
    );

    // --- AKHIR PERBAIKAN ---

    let poolIdx = 0;
    for (let i = 0; i < bracketSize; i++) {
      if (initialSlots[i] === 'EMPTY') {
        initialSlots[i] = poolIdx < nonSeededIds.length ? nonSeededIds[poolIdx++] : null;
      }
    }

    // ... (Sisa kode Match.destroy dan Match.bulkCreate tetap sama seperti sebelumnya)
    await Match.destroy({ where: { baganId: id } });
    
    let matchCount = bracketSize / 2;
    let round = 1;
    const totalRounds = Math.log2(bracketSize);

    while (matchCount >= 1) {
      let matchesToCreate = [];
      for (let i = 0; i < matchCount; i++) {
        const mObj = { baganId: id, round, slot: i + 1, tournamentId, status: "belum" };
        if (round === 1) {
          const s1 = initialSlots[i * 2];
          const s2 = initialSlots[i * 2 + 1];
          if (isDouble) {
            mObj.doubleTeam1Id = s1; mObj.doubleTeam2Id = s2;
          } else {
            mObj.peserta1Id = s1; mObj.peserta2Id = s2;
          }
        }
        matchesToCreate.push(mObj);
      }
      await Match.bulkCreate(matchesToCreate);
      matchCount /= 2; round++;
    }

    // 8. Hubungkan nextMatchId dan proses BYE
    const finalMatches = await Match.findAll({ where: { baganId: id }, order: [['round', 'ASC']] });
    for (const m of finalMatches) {
      if (m.round < totalRounds) {
        const nS = Math.ceil(m.slot / 2);
        const nM = finalMatches.find(x => x.round === m.round + 1 && x.slot === nS);
        if (nM) await m.update({ nextMatchId: nM.id });
      }
      if (m.round === 1) {
        const side1 = isDouble ? m.doubleTeam1Id : m.peserta1Id;
        const side2 = isDouble ? m.doubleTeam2Id : m.peserta2Id;
        if ((side1 && !side2) || (!side1 && side2)) {
          await _processMatchPeserta(m.id, side1, side2, kategori);
        }
      }
    }

    res.json({ msg: "Sukses Generate" });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ msg: err.message }); 
  }
};


// 4. GET MATCHES (FIXED: SEED SEKARANG TERBAWA)
export const getMatches = async (req, res) => {
  try {
    const { baganId, tournamentId, status } = req.query;
    
    // 1. Tentukan filter (Where)
    let whereCondition = {};
    
    if (baganId) {
      // Jika dipanggil dari sistem BAGAN (seperti sebelumnya)
      whereCondition.baganId = baganId;
    } else if (tournamentId) {
      // Jika dipanggil dari SKOR PAGE
      whereCondition.tournamentId = tournamentId;
    }

    // 2. Tambahkan filter status jika dikirim (misal: 'selesai')
    if (status) {
      whereCondition.status = status;
    }

    const matches = await Match.findAll({
      where: whereCondition, // Menggunakan filter dinamis
      include: [
       { 
          model: Bagan, 
          as: "bagan",
          // --- INI KUNCINYA: Ambil data KelompokUmur dari dalam Bagan ---
          include: [{ 
            model: KelompokUmur,
            attributes: ["nama"] // Kita hanya butuh kolom 'nama'
          }] 
        },
        { model: Peserta, as: "peserta1", attributes: ["namaLengkap", "isSeeded"] },
        { model: Peserta, as: "peserta2", attributes: ["namaLengkap", "isSeeded"] },
        { 
          model: DoubleTeam, as: "doubleTeam1", 
          attributes: ["id", "namaTim", "isSeeded"],
          include: [
            { model: Peserta, as: "Player1", attributes: ["namaLengkap", "isSeeded"] }, 
            { model: Peserta, as: "Player2", attributes: ["namaLengkap", "isSeeded"] }
          ] 
        },
        { 
          model: DoubleTeam, as: "doubleTeam2", 
          attributes: ["id", "namaTim", "isSeeded"],
          include: [
            { model: Peserta, as: "Player1", attributes: ["namaLengkap", "isSeeded"] }, 
            { model: Peserta, as: "Player2", attributes: ["namaLengkap", "isSeeded"] }
          ] 
        },
        {
          model: User,
          as: "referee",
          attributes: ["id", "name"] // sesuaikan dengan kolom di tabel user kamu
        },
        {
          model: ScoreRule,
          as: "scoreRule",
          attributes: ["id", "name"]
        }
      ],
      // Jika status 'selesai', urutkan berdasarkan waktu update terbaru
      order: status === 'selesai' 
        ? [['updatedAt', 'DESC']] 
        : [['round', 'ASC'], ['slot', 'ASC']]
    });
    
    res.json(matches);
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

export const updateMatchDuration = async (req, res) => {
  try {
    const { id } = req.params;
    const { durasi, isTimerRunning, timerStartedAt } = req.body;

    const match = await Match.findByPk(id);
    if (!match) return res.status(404).json({ msg: "Match tidak ditemukan" });

    if (durasi !== undefined) match.durasi = durasi;
    if (isTimerRunning !== undefined) match.isTimerRunning = isTimerRunning;
    if (timerStartedAt !== undefined) match.timerStartedAt = timerStartedAt;

    await match.save();

    res.json(match);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


export const setMatchPeserta = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { peserta1Id, peserta2Id } = req.body;

    const updatedMatch = await _processMatchPeserta(matchId, peserta1Id, peserta2Id);
    if (!updatedMatch) return res.status(404).json({ msg: "Match tidak ditemukan" });

    res.json(updatedMatch);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// 🔹 Helper untuk menempatkan BYE
function placeByes(initialSlots, assignedSlots, byeSlotsCount, seededPeserta) {
  const bracketSize = initialSlots.length;
  const blockSize = 4; // 1 blok = 4 slot
  const totalBlocks = Math.ceil(bracketSize / blockSize);

  // ===============================
  // 1. BYE untuk SEED (prioritas)
  // ===============================
  const blocksWithBye = new Set();

  for (const seed of seededPeserta) {
    if (byeSlotsCount <= 0) break;
    if (!seed.isSeeded) continue;

    const slotIndex = seed.slot - 1;
    const opponentIndex = slotIndex % 2 === 0 ? slotIndex + 1 : slotIndex - 1;
    const blockIndex = Math.floor(slotIndex / blockSize);

    if (!assignedSlots.has(opponentIndex)) {
      initialSlots[opponentIndex] = null; // BYE
      assignedSlots.add(opponentIndex);
      blocksWithBye.add(blockIndex);
      byeSlotsCount--;
    }
  }

  if (byeSlotsCount <= 0) return;

  // ===============================
  // 2. Cari blok yang BELUM punya BYE
  // ===============================
  let candidateBlocks = [];
  for (let b = 0; b < totalBlocks; b++) {
    if (!blocksWithBye.has(b)) {
      candidateBlocks.push(b);
    }
  }

  // Acak blok agar tidak selalu dari atas
  candidateBlocks = shuffle(candidateBlocks);

  // ===============================
  // 3. Taruh BYE di blok yang kosong
  // ===============================
  for (const blockIndex of candidateBlocks) {
    if (byeSlotsCount <= 0) break;

    const start = blockIndex * blockSize;
    const end = Math.min(start + blockSize, bracketSize);

    let possibleSlots = [];
    for (let i = start; i < end; i++) {
      const pairIndex = i % 2 === 0 ? i + 1 : i - 1;
      if (!assignedSlots.has(i) && !assignedSlots.has(pairIndex)) {
        possibleSlots.push(i);
      }
    }

    if (possibleSlots.length > 0) {
      const slot = possibleSlots[Math.floor(Math.random() * possibleSlots.length)];
      initialSlots[slot] = null;
      assignedSlots.add(slot);
      blocksWithBye.add(blockIndex);
      byeSlotsCount--;
    }
  }

  if (byeSlotsCount <= 0) return;

  // ===============================
  // 4. SISA BYE (kalau masih ada)
  // ===============================
  let fallbackSlots = [];
  for (let i = 0; i < bracketSize; i++) {
    const pairIndex = i % 2 === 0 ? i + 1 : i - 1;
    if (!assignedSlots.has(i) && !assignedSlots.has(pairIndex)) {
      fallbackSlots.push(i);
    }
  }

  fallbackSlots = shuffle(fallbackSlots);

  for (const slot of fallbackSlots) {
    if (byeSlotsCount <= 0) break;
    initialSlots[slot] = null;
    assignedSlots.add(slot);
    byeSlotsCount--;
  }
}





export const getUnscheduledMatches = async (req, res) => {
  try {
    const matches = await Match.findAll({
      where: { status: "belum" }, 
      include: [
        { model: Jadwal, required: false }, 
        { model: Peserta, as: "peserta1" },
        { model: Peserta, as: "peserta2" },
      ],
    });

    const filtered = matches.filter(m => !m.Jadwal); 
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getJuara = async (req, res) => {
  try {
    const { baganId } = req.params;
    const bagan = await Bagan.findByPk(baganId);
    if (!bagan) return res.status(404).json({ error: "Bagan tidak ditemukan." });

    const isDouble = bagan.kategori === "double";

    // KONTROL INCLUDE: Pastikan Player 1 & 2 ikut terambil jika Double
    const includePlayers = isDouble ? [
      { 
        model: DoubleTeam, as: isDouble ? "doubleTeam1" : "peserta1", // sesuaikan alias model anda
        include: [
          { model: Peserta, as: "Player1", attributes: ["namaLengkap"] },
          { model: Peserta, as: "Player2", attributes: ["namaLengkap"] }
        ]
      }
    ] : [{ model: Peserta, as: "peserta1", attributes: ["namaLengkap"] }];

    if (bagan.tipe === "knockout") {
      const finalMatch = await Match.findOne({
        where: { baganId, status: "selesai" },
        order: [["round", "DESC"]],
        include: [
          { model: Peserta, as: "peserta1" },
          { model: Peserta, as: "peserta2" },
          { 
            model: DoubleTeam, as: "doubleTeam1", 
            include: [{ model: Peserta, as: "Player1" }, { model: Peserta, as: "Player2" }] 
          },
          { 
            model: DoubleTeam, as: "doubleTeam2", 
            include: [{ model: Peserta, as: "Player1" }, { model: Peserta, as: "Player2" }] 
          },
        ],
      });

      if (!finalMatch) return res.status(404).json({ message: "Final belum selesai." });

      // LOGIKA PEMENANG GANDA VS SINGLE
      const winnerId = isDouble ? finalMatch.winnerDoubleId : finalMatch.winnerId;
      const p1Id = isDouble ? finalMatch.doubleTeam1Id : finalMatch.peserta1Id;
      
      const juara1 = winnerId === p1Id 
        ? (isDouble ? finalMatch.doubleTeam1 : finalMatch.peserta1) 
        : (isDouble ? finalMatch.doubleTeam2 : finalMatch.peserta2);

      const juara2 = winnerId === p1Id 
        ? (isDouble ? finalMatch.doubleTeam2 : finalMatch.peserta2) 
        : (isDouble ? finalMatch.doubleTeam1 : finalMatch.peserta1);

      // Ambil Juara 3 (Semi Finalis yang kalah)
      const semiMatches = await Match.findAll({
        where: { baganId, round: finalMatch.round - 1, status: "selesai" },
        include: [
          { model: Peserta, as: "peserta1" }, { model: Peserta, as: "peserta2" },
          { model: DoubleTeam, as: "doubleTeam1", include: ["Player1", "Player2"] },
          { model: DoubleTeam, as: "doubleTeam2", include: ["Player1", "Player2"] }
        ]
      });

      const juara3 = semiMatches.map(m => {
        const wId = isDouble ? m.winnerDoubleId : m.winnerId;
        const side1Id = isDouble ? m.doubleTeam1Id : m.peserta1Id;
        return wId === side1Id 
          ? (isDouble ? m.doubleTeam2 : m.peserta2) 
          : (isDouble ? m.doubleTeam1 : m.peserta1);
      });

      return res.json({ juara1, juara2, juara3 });
    }

    // LOGIKA ROUND ROBIN GANDA
// ===== LOGIKA ROUND ROBIN =====
// ===== ROUND ROBIN =====
if (bagan.tipe === "roundrobin") {
  const isDouble = bagan.kategori === "double";

  const matches = await Match.findAll({
    where: { baganId, status: "selesai" },
    include: [
      { model: Peserta, as: "peserta1", attributes: ["id", "namaLengkap"] },
      { model: Peserta, as: "peserta2", attributes: ["id", "namaLengkap"] },
      { 
        model: DoubleTeam, as: "doubleTeam1",
        include: ["Player1", "Player2"]
      },
      { 
        model: DoubleTeam, as: "doubleTeam2",
        include: ["Player1", "Player2"]
      },
    ],
  });

  if (!matches.length) {
    return res.status(404).json({ message: "Belum ada match." });
  }

  const klasemen = {};

 matches.forEach(m => {
  const p1 = isDouble ? m.doubleTeam1 : m.peserta1;
  const p2 = isDouble ? m.doubleTeam2 : m.peserta2;
  const winnerId = isDouble ? m.winnerDoubleId : m.winnerId;

  if (!p1 || !p2) return;

  [p1, p2].forEach(p => {
    if (!klasemen[p.id]) {
      klasemen[p.id] = {
        peserta: p,
        poin: 0,
        menang: 0,
        kalah: 0,
        gameMenang: 0,
        gameKalah: 0,
        headToHead: {}
      };
    }
  });

  // ✅ HITUNG GAME DARI SET
  const p1Game =
    (m.set1P1 || 0) +
    (m.set2P1 || 0) +
    (m.set3P1 || 0);

  const p2Game =
    (m.set1P2 || 0) +
    (m.set2P2 || 0) +
    (m.set3P2 || 0);

  klasemen[p1.id].gameMenang += p1Game;
  klasemen[p1.id].gameKalah += p2Game;

  klasemen[p2.id].gameMenang += p2Game;
  klasemen[p2.id].gameKalah += p1Game;

  // head to head
  klasemen[p1.id].headToHead[p2.id] = winnerId;
  klasemen[p2.id].headToHead[p1.id] = winnerId;

  // poin
  if (winnerId === p1.id) {
    klasemen[p1.id].poin += 3;
    klasemen[p1.id].menang++;
    klasemen[p2.id].kalah++;
  } else if (winnerId === p2.id) {
    klasemen[p2.id].poin += 3;
    klasemen[p2.id].menang++;
    klasemen[p1.id].kalah++;
  }
});

  // sorting dengan tie-break
  const ranking = Object.values(klasemen).sort((a, b) => {
    // 1️⃣ POIN
    if (b.poin !== a.poin) return b.poin - a.poin;

    // 2️⃣ SELISIH GAME
    const diffA = a.gameMenang - a.gameKalah;
    const diffB = b.gameMenang - b.gameKalah;
    if (diffB !== diffA) return diffB - diffA;

    // 3️⃣ HEAD TO HEAD
    const h2h = a.headToHead[b.peserta.id];
    if (h2h) {
      if (h2h === a.peserta.id) return -1;
      if (h2h === b.peserta.id) return 1;
    }

    // 4️⃣ fallback terakhir
    return a.peserta.id - b.peserta.id;
  });


  return res.json({
    juara1: ranking[0]?.peserta || null,
    juara2: ranking[1]?.peserta || null,
    juara3: ranking[2]?.peserta || null,
    klasemen: ranking.map(r => ({
      peserta: r.peserta,
      poin: r.poin,
      menang: r.menang,
      kalah: r.kalah,
      gameMenang: r.gameMenang,
      gameKalah: r.gameKalah,
      selisih: r.gameMenang - r.gameKalah
    }))
  });
}



  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getMatchDetailHistory = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    const logs = await MatchScoreLog.findAll({
      where: { matchId },
      order: [['createdAt', 'ASC']] // Urutkan dari poin pertama sampai terakhir
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const updateMatchPoint = async (req, res) => {
    try {
        const { 
            matchId, setKe, skorP1, skorP2, gameP1, gameP2, 
            setMenangP1, setMenangP2, statusMatch, winnerId 
        } = req.body;

        // 1. Cari data match dulu
        const match = await Match.findByPk(matchId);
        if (!match) return res.status(404).json({ msg: "Match tidak ditemukan" });

        // 2. Simpan ke Log (History) - PASTIKAN INI BERHASIL
        await MatchScoreLog.create({
            matchId,
            setKe,
            skorP1,
            skorP2,
            gameP1,
            gameP2,
            setMenangP1,
            setMenangP2,
            keterangan: statusMatch === 'selesai' ? "Match Ended" : `Point: ${skorP1}-${skorP2} (Game: ${gameP1}-${gameP2})`
        });

        // 3. Siapkan data update untuk tabel Match (Hanya satu kali update saja)
        const updateData = {
            status: statusMatch,
            currentSet: setKe,
            winnerId: (match.peserta1Id || !match.doubleTeam1Id) ? winnerId : null,
            winnerDoubleId: match.doubleTeam1Id ? winnerId : null,
            score1: setMenangP1, // Total set menang P1
            score2: setMenangP2, // Total set menang P2
        };

        // Simpan skor game ke kolom set yang sesuai di MatchModel
        if (setKe === 1) {
            updateData.set1P1 = gameP1;
            updateData.set1P2 = gameP2;
        } else if (setKe === 2) {
            updateData.set2P1 = gameP1;
            updateData.set2P2 = gameP2;
        } else if (setKe === 3) {
            updateData.set3P1 = gameP1;
            updateData.set3P2 = gameP2;
        }

        // 4. Jalankan Update Sekaligus
        await match.update(updateData);

        // 5. LOGIKA OTOMATIS LOLOS (Jika Selesai)
        if (statusMatch === 'selesai' && match.nextMatchId && winnerId) {
            const nextMatch = await Match.findByPk(match.nextMatchId);
            if (nextMatch) {
                if (match.slot % 2 !== 0) {
                    if (match.doubleTeam1Id) nextMatch.doubleTeam1Id = winnerId;
                    else nextMatch.peserta1Id = winnerId;
                } else {
                    if (match.doubleTeam1Id) nextMatch.doubleTeam2Id = winnerId;
                    else nextMatch.peserta2Id = winnerId;
                }
                await nextMatch.save();
            }
        }

        res.status(200).json({ msg: "Skor Berhasil Diperbarui" });
    } catch (error) {
        console.error("ERROR UPDATE POINT:", error);
        res.status(500).json({ msg: error.message });
    }
};

// Fungsi untuk mengambil log skor terakhir berdasarkan Match ID
export const getMatchLog = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Cari satu data terbaru di tabel MatchScoreLog (asumsi nama modelnya MatchScoreLog)
        // Jika nama model log kamu berbeda, silakan sesuaikan namanya
        const log = await MatchScoreLog.findOne({
            where: { matchId: id },
            order: [['id', 'DESC']] // Ambil yang paling baru (ID paling besar)
        });

        if (!log) {
            return res.status(200).json(null); // Kirim null jika belum ada poin sama sekali
        }

        res.status(200).json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Menghapus log skor paling baru untuk match tertentu
export const undoLastPoint = async (req, res) => {
    try {
        const { id } = req.params; // ini matchId
        
        // 1. Cari log paling terakhir
        const lastLog = await MatchScoreLog.findOne({
            where: { matchId: id },
            order: [['id', 'DESC']]
        });

        if (lastLog) {
            // 2. Hapus log tersebut
            await lastLog.destroy();
            res.status(200).json({ message: "Undo berhasil" });
        } else {
            res.status(404).json({ message: "Tidak ada data untuk di-undo" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getMatchLogs = async (req, res) => {
  try {
    const { matchId } = req.params;
    const logs = await MatchScoreLog.findAll({
      where: { matchId },
      order: [
        ['setKe', 'ASC'],
        ['id', 'ASC']
      ]
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const setScoreRuleToMatch = async (req, res) => {
  const { id } = req.params; // id match
  const { scoreRuleId } = req.body;

  const match = await Match.findByPk(id);
  if (!match) return res.status(404).json({ msg: "Match tidak ditemukan" });

  match.scoreRuleId = scoreRuleId;
  await match.save();

  res.json(match);
};



export const getMatchById = async (req, res) => {
  const match = await Match.findByPk(req.params.id, {
    include: [{ model: ScoreRule, as: "scoreRule" }]
  });

  res.json(match);
};


// RESET SEMUA SKOR MATCH
export const resetMatchScore = async (req, res) => {
  try {
    const { id } = req.params; // matchId

    // 1. Hapus semua log skor match ini
    await MatchScoreLog.destroy({
      where: { matchId: id }
    });

    // 2. Reset data match
    await Match.update(
      {
        score1: 0,
        score2: 0,
        winnerId: null,
        winnerDoubleId: null,
        status: "berlangsung"
      },
      {
        where: { id }
      }
    );

    res.status(200).json({ message: "Match berhasil di-reset" });
  } catch (error) {
    console.error("Reset match error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const manualWOPoint = async (req, res) => {
  try {
    const { matchId, winnerSide } = req.body; 
    // winnerSide = "p1" atau "p2"

    const match = await Match.findByPk(matchId);
    if (!match) return res.status(404).json({ msg: "Match tidak ditemukan" });

    const rule = await ScoreRule.findByPk(match.scoreRuleId);
    if (!rule) return res.status(400).json({ msg: "ScoreRule belum dipilih" });

    const { jumlahSet, gamePerSet } = rule;
    const targetSetWin = Math.ceil(jumlahSet / 2);
    const winnerIsP1 = winnerSide === "p1";
    const isDouble = !!match.doubleTeam1Id;

    let setMenangP1 = 0;
    let setMenangP2 = 0;

    for (let setKe = 1; setKe <= targetSetWin; setKe++) {
      let gameP1 = 0;
      let gameP2 = 0;

      while ((winnerIsP1 ? gameP1 : gameP2) < gamePerSet) {
        // POINT 15–30–40
        for (let i = 1; i < points.length; i++) {
          await MatchScoreLog.create({
            matchId: match.id,
            setKe,
            skorP1: winnerIsP1 ? points[i] : "0",
            skorP2: winnerIsP1 ? "0" : points[i],
            gameP1,
            gameP2,
            setMenangP1,
            setMenangP2,
            keterangan: "WO Auto Point"
          });
        }

        // GAME MENANG
        if (winnerIsP1) gameP1++;
        else gameP2++;

        await MatchScoreLog.create({
          matchId: match.id,
          setKe,
          skorP1: "0",
          skorP2: "0",
          gameP1,
          gameP2,
          setMenangP1,
          setMenangP2,
          keterangan: "WO Auto Game"
        });
      }

      // SET SELESAI
      if (winnerIsP1) setMenangP1++;
      else setMenangP2++;

      await MatchScoreLog.create({
        matchId: match.id,
        setKe,
        skorP1: "0",
        skorP2: "0",
        gameP1,
        gameP2,
        setMenangP1,
        setMenangP2,
        keterangan: "WO Auto Set"
      });
    }

    const winnerId = winnerIsP1
      ? (isDouble ? match.doubleTeam1Id : match.peserta1Id)
      : (isDouble ? match.doubleTeam2Id : match.peserta2Id);

    await match.update({
      winnerId: isDouble ? null : winnerId,
      winnerDoubleId: isDouble ? winnerId : null,
      score1: setMenangP1,
      score2: setMenangP2,

      // ⬇️ INI YANG KURANG
      set1P1: winnerIsP1 ? gamePerSet : 0,
      set1P2: winnerIsP1 ? 0 : gamePerSet,

      set2P1: targetSetWin >= 2 ? (winnerIsP1 ? gamePerSet : 0) : null,
      set2P2: targetSetWin >= 2 ? (winnerIsP1 ? 0 : gamePerSet) : null,

      set3P1: targetSetWin >= 3 ? (winnerIsP1 ? gamePerSet : 0) : null,
      set3P2: targetSetWin >= 3 ? (winnerIsP1 ? 0 : gamePerSet) : null,

      status: "selesai"
    });


    res.json({ msg: "WO + skor otomatis berhasil dibuat" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

