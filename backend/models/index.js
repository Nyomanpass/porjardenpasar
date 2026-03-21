// models/index.js
import { Tournament } from "./TournamentModel.js";
import { Peserta } from "./PesertaModel.js";
import { KelompokUmur } from "./KelompokUmurModel.js";
import { Lapangan } from "./LapanganModel.js";
import { Jadwal } from "./JadwalModel.js";
import { Match } from "./MatchModel.js";
import { Bagan } from "./BaganModel.js";
import { ScoreRule } from "./ScoreRuleModel.js"; 
import { Athlete } from "./AthleteModel.js";
import { User } from "./UserModel.js";



// -------------------
// 🔹 Relasi Tournament
// -------------------
Tournament.hasMany(Peserta, { foreignKey: "tournamentId", as: "peserta", onDelete: "RESTRICT"});
Peserta.belongsTo(Tournament, { foreignKey: "tournamentId", as: "tournament" });

Tournament.hasMany(Bagan, { foreignKey: "tournamentId", as: "bagan",  onDelete: "RESTRICT"  });
Bagan.belongsTo(Tournament, { foreignKey: "tournamentId", as: "tournament"});

Tournament.hasMany(Match, { foreignKey: "tournamentId", as: "matches",  onDelete: "RESTRICT"  });
Match.belongsTo(Tournament, { foreignKey: "tournamentId", as: "tournament"});

Tournament.hasMany(Jadwal, { foreignKey: "tournamentId", as: "jadwal",  onDelete: "RESTRICT"  });
Jadwal.belongsTo(Tournament, { foreignKey: "tournamentId", as: "tournament"});

// -------------------
// 🔹 Relasi lain (sudah ada)
// -------------------
KelompokUmur.hasMany(Peserta, { foreignKey: "kelompokUmurId", as: "peserta", onDelete: "RESTRICT" });
Peserta.belongsTo(KelompokUmur, { foreignKey: "kelompokUmurId", as: "kelompokUmur" });

Lapangan.hasMany(Jadwal, { foreignKey: "lapanganId", as: "jadwal", onDelete: "RESTRICT" });
Jadwal.belongsTo(Lapangan, { foreignKey: "lapanganId", as: "lapangan" });

Match.hasOne(Jadwal, { foreignKey: "matchId", as: "jadwal" });
Jadwal.belongsTo(Match, { foreignKey: "matchId", as: "match" });


// -------------------
// 🔹 Export semua model
// -------------------
ScoreRule.hasMany(Match, { foreignKey: "scoreRuleId", as: "matches",  onDelete: "RESTRICT" });
Match.belongsTo(ScoreRule, { foreignKey: "scoreRuleId", as: "scoreRule" });


// -------------------
// 🔹 Relasi Athlete
// -------------------
KelompokUmur.hasMany(Athlete, { 
  foreignKey: "kelompokUmurId", 
  as: "athletes" 
});

Athlete.belongsTo(KelompokUmur, { 
  foreignKey: "kelompokUmurId", 
  as: "kelompokUmur" 
});


User.hasMany(Match, {
  foreignKey: "refereeId",
  as: "matchesAsReferee"
});

Match.belongsTo(User, {
  foreignKey: "refereeId",
  as: "referee",
  onDelete: "SET NULL",   // Aman, match tidak ikut terhapus
  onUpdate: "CASCADE"
});


// -------------------
// 🔹 Export semua model
// -------------------
export {
  Tournament,
  Peserta,
  KelompokUmur,
  Lapangan,
  Jadwal,
  Match,
  Bagan,
  ScoreRule,
  Athlete,
  User
};
