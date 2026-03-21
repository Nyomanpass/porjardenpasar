import { Users, Calendar, Trophy, List, Monitor, ClipboardList, CheckSquare, Settings, Award, ChevronDown, ChevronUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

function Sidebar({ isOpen, isCollapsed }) {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const [openTournamentMenu, setOpenTournamentMenu] = useState(false);
  const basePath = `/${role}`;



  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(
    localStorage.getItem("selectedTournament") || ""
  );
  
  // STATE BARU untuk mengontrol tampilan list tournament (Accordion)
  const [isTournamentListOpen, setIsTournamentListOpen] = useState(false);

  // Ambil daftar tournament aktif
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await api.get('/tournaments');
        const active = res.data.filter((t) => t.status === "aktif");
        setTournaments(active);
      } catch (err) {
        console.error("Fetch tournament error:", err);
      }
    };

    fetchTournament();
  }, []);

  // Listener event
  useEffect(() => {
    const handleTournamentChangeLocal = () => {
      console.log("Tournament berubah (Sidebar menerima event)");
    };

    window.addEventListener("tournament-changed", handleTournamentChangeLocal);
    return () => {
      window.removeEventListener("tournament-changed", handleTournamentChangeLocal);
    };
  }, []);
  
  // FUNGSI BARU: Menggantikan handleTournamentChange (untuk Menu Accordion)
  const handleTournamentSelect = (t) => {
    const id = t.id;              
    const name = t.name; 

    setSelectedTournament(id);
    localStorage.setItem("selectedTournament", id);
    localStorage.setItem("selectedTournamentName", name);

    // Broadcast event
    window.dispatchEvent(new Event("tournament-changed"));
  };


  // Catatan: Saya mengubah ukuran icon menjadi 18px agar seragam dan lebih proporsional di sidebar
const adminMenu = [
  { label: "Peserta", path: "/admin/peserta", icon: <Users size={20} /> },
  { label: "Bagan", path: "/admin/bagan-peserta", icon: <List size={20} /> },
  { label: "Jadwal Pertandingan", path: "/admin/jadwal-pertandingan", icon: <Calendar size={20} /> },
  { label: "Skor", path: "/admin/skor", icon: <ClipboardList size={20} /> },
  { label: "Hasil Pertandingan", path: "/admin/hasil-pertandingan", icon: <Trophy size={20} /> },

  {
    label: "Tournament",
    icon: <Award size={20} />,
    children: [
      { label: "Local", path: "/admin/tournament?level=local" },
      { label: "Nasional", path: "/admin/tournament?level=nasional" },
      { label: "Internasional", path: "/admin/tournament?level=internasional" },
    ],
  },

  { label: "Game Settings", path: "/admin/settings", icon: <Settings size={20} /> },
  { label: "UI Settings", path: "/admin/uisettings", icon: <Monitor size={20} /> },
];

  const wasitMenu = [
    { label: "Peserta", path: "/wasit/peserta", icon: <Users size={20} /> },
    { label: "Jadwal Pertandingan", path: "/wasit/jadwal-pertandingan", icon: <Calendar size={20} /> },
    { label: "Bagan", path: "/wasit/bagan-peserta", icon: <List size={20} /> },
    { label: "Skor", path: "/wasit/skor", icon: <ClipboardList size={20} /> },
  ];

  const panitiaMenu = [
  { label: "Peserta", path: "/panitia/peserta", icon: <Users size={20} /> },
  { label: "Bagan", path: "/panitia/bagan-peserta", icon: <List size={20} /> },
  { label: "Jadwal Pertandingan", path: "/panitia/jadwal-pertandingan", icon: <Calendar size={20} /> },
  { label: "Skor", path: "/panitia/skor", icon: <ClipboardList size={20} /> },
  { label: "Hasil Pertandingan", path: "/panitia/hasil-pertandingan", icon: <Trophy size={20} /> },
];

  const menuItems =
  role === "admin"
    ? adminMenu
    : role === "panitia"
    ? panitiaMenu
    : wasitMenu;

  return (
  <aside
    className={`
      fixed top-0 left-0 h-screen ${isCollapsed ? "w-20" : "w-72"}
      bg-secondary shadow-xl
      z-50
      overflow-visible
      border-r border-gray-200
      flex flex-col
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full"} 
      md:translate-x-0
      pt-20 md:pt-0
    `}
  >
  {/* ===== SCROLL AREA ===== */}
  <nav className="px-4 mt-3 flex-1 overflow-visible relative">
    {/* ===============================
        BLOK PILIH TOURNAMENT (ACCORDION)
    =============================== */}
    <div className={`mb-6 ${isCollapsed ? "hidden" : ""}`}>
      <button
        onClick={() => setIsTournamentListOpen(!isTournamentListOpen)}
        className="
          flex items-center justify-between w-full p-3 rounded-lg
          text-white font-bold
          hover:bg-primary/80 transition-colors
        "
      >
        <div className="flex items-center gap-3">
          <List size={20} className="text-white" />
          {!isCollapsed && <span className="text-md">Pilih Tournament</span>}
        </div>
        {isTournamentListOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isTournamentListOpen && (
        <ul
          className="
            mt-2 space-y-1 bg-black/20 rounded-lg p-2
            max-h-56 overflow-y-auto
          "
        >
          {tournaments.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => handleTournamentSelect(t)}
                className={`
                  w-full text-left p-3 rounded-md text-sm
                  transition-all duration-150
                  ${selectedTournament === t.id
                    ? "bg-primary text-white font-bold"
                    : "text-gray-200 hover:bg-primary/80 hover:pl-4"}
                `}
              >
                {t.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>

    {/* ===============================
        MENU UTAMA
    =============================== */}
   <ul className="space-y-1 mt-6 border-t border-white/30 pt-4 overflow-y-auto max-h-[70vh]">
  {menuItems.map((item) => {
    const currentPath = location.pathname;

    // ===== JIKA ITEM PUNYA SUBMENU (TOURNAMENT) =====
if (item.children) {
  const isTournamentActive = currentPath.includes("/admin/tournament");

  // ======================
  // MODE COLLAPSED (kecil) → LANGSUNG KE LOCAL
  // ======================
  if (isCollapsed) {
    return (
      <li key={item.label}>
        <Link
          to="/admin/tournament?level=local"
          className={`
            flex items-center justify-center p-3 mb-3 rounded-lg
            transition-all
            ${isTournamentActive
              ? "bg-primary text-white"
              : "text-white hover:bg-white/30"}
          `}
          title="Tournament (Local)"
        >
          {item.icon}
        </Link>
      </li>
    );
  }

  // ======================
  // MODE NORMAL (besar) → ACCORDION
  // ======================
  return (
    <li key={item.label}>
      <button
        onClick={() => setOpenTournamentMenu(!openTournamentMenu)}
        className={`
          flex items-center justify-between w-full mb-3 p-3 rounded-lg text-md font-medium
          transition-all
          ${isTournamentActive
            ? "bg-primary text-white shadow-md"
            : "text-white hover:bg-white/30"}
        `}
      >
        <div className="flex items-center gap-4">
          {item.icon}
          {item.label}
        </div>
        {openTournamentMenu ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {openTournamentMenu && (
        <ul className="ml-6 space-y-1">
          {item.children.map((sub) => {
            const isSubActive = location.search.includes(
              sub.path.split("?")[1]
            );

            return (
              <li key={sub.path}>
                <Link
                  to={sub.path}
                  className={`
                    flex items-center gap-2 px-3 py-2 text-sm transition-all
                    ${isSubActive
                      ? "text-yellow-400 font-bold"
                      : "text-gray-300 hover:text-white"}
                  `}
                >
                  <span
                    className={`
                      w-2 h-2 rounded-full
                      ${isSubActive ? "bg-yellow-400" : "bg-gray-200"}
                    `}
                  />
                  {sub.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}



    // ===== MENU BIASA =====
    const isExact = currentPath === item.path;

    // khusus Bagan (list + detail)
    const isBaganActive =
        item.label === "Bagan" &&
        (currentPath.startsWith(`${basePath}/bagan-peserta`) ||
        currentPath.startsWith(`${basePath}/bagan-view`));


    // khusus Peserta (kalau mau sekalian aman)
   const isPesertaActive =
    item.label === "Peserta" &&
    (
      currentPath.startsWith(`${basePath}/peserta`) ||
      currentPath.startsWith(`${basePath}/detail-peserta`) ||
      currentPath.startsWith(`${basePath}/peserta-ganda`)
    );



    const isActive = isExact || isBaganActive || isPesertaActive;


    return (
      <li key={item.path}>
        <Link
        to={item.path}
        className={`
          flex items-center gap-4 mb-3 p-3 rounded-lg text-md font-medium
          transition-all duration-150
          ${isActive
            ? "bg-primary text-white shadow-md"
            : "text-white hover:bg-white/30 hover:text-white"}
        `}
      >

          {item.icon}
         {!isCollapsed && item.label}

        </Link>
      </li>
    );
  })}
</ul>

  </nav>
</aside>

  );
}

export default Sidebar;