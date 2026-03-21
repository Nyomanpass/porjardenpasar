import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Eye, PlusCircle, Layout, Filter, User, Users, Users2, ChevronRight } from "lucide-react";
import AlertMessage from "../components/AlertMessage";


import api from "../api"; 


export default function BaganPage({onSelectBagan}) {
  const [kelompokUmurList, setKelompokUmurList] = useState([]);
  const [selectedKelompok, setSelectedKelompok] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("single"); 
  const [baganList, setBaganList] = useState([]);
  const role = localStorage.getItem('role');
  const selectedTournamentName = localStorage.getItem("selectedTournamentName");
  const [filterKategori, setFilterKategori] = useState("all");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmInput, setConfirmInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    baganId: null,
    baganName: "",
  });
    const isExactMatch = confirmInput === confirmDelete.baganName;


  

  const navigate = useNavigate();
  const isSelectorMode = !!onSelectBagan;


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


  const fetchKelompokUmur = async () => {
    try {
      const res = await api.get("/kelompok-umur");
      setKelompokUmurList(res.data);
    } catch (err) {
      console.error("Gagal fetch kelompok umur:", err);
    }
  };

  useEffect(() => {
      const reloadBagan = () => {
        console.log("Tournament berubah → reload bagan");
        fetchBagan();
        fetchKelompokUmur();
      };

      window.addEventListener("tournament-changed", reloadBagan);

      return () => {
        window.removeEventListener("tournament-changed", reloadBagan);
      };
    }, []);


  useEffect(() => {
    fetchKelompokUmur();
    fetchBagan();
  }, []);


  const handleCreateBagan = async () => {
  if (!selectedKelompok) {
     setError("Pilih kelompok umur terlebih dahulu.");
    return;
  }

  const tournamentId = localStorage.getItem("selectedTournament");

  try {
    await api.post("/bagan", { 
      kelompokUmurId: selectedKelompok,
      tournamentId,
      kategori: selectedKategori // Kirim kategori ke backend
    });

    setSuccess("Bagan berhasil dibuat!");
    setSelectedKelompok(""); // Reset pilihan
    fetchBagan();
  } catch (err) {
    console.error("Gagal membuat bagan:", err);
    setError("Gagal membuat bagan. Pastikan data peserta sudah ada.");
  }
};


  // --- DELETE BAGAN ---

const handleDeleteBagan = (bagan) => {
  setConfirmDelete({ 
    show: true, 
    baganId: bagan.id,
    baganName: bagan.nama
  });
};


  

const confirmDeleteBagan = async () => {
  try {
    await api.delete(`/bagan/${confirmDelete.baganId}`);
    setSuccess("Bagan berhasil dihapus!");
    fetchBagan();
  } catch (err) {
    console.error("Gagal menghapus bagan:", err);
    setError("Gagal menghapus bagan.");
  } finally {
    setConfirmDelete({ show: false, baganId: null });
  }
};




  const handleViewDetail = (baganId) => {
    if (isSelectorMode) {
        // 1. MODE USER/SELECTOR: Panggil prop yang akan mengubah konten di parent (TournamentDetailPage)
        onSelectBagan(baganId); 
    } else {
        // 2. MODE ADMIN/HALAMAN TERPISAH: Gunakan navigate
        navigate(`/${role}/bagan-view/${baganId}`);
    }
}



  return (
    <div className="min-h-screen"> 

  
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

    
 {/* --- HEADER UTAMA --- */}
<div className="mb-6 border-gray-100">
    <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
            Bagan Pertandingan
        </h1>
        <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-100 md:bg-transparent md:border-none md:px-0">
            <p className="text-[10px] md:text-sm text-yellow-700 md:text-yellow-600 font-bold uppercase tracking-widest">
                Tournament: {selectedTournamentName || "Semua Tournament"}
            </p>
        </div>
    </div>
</div>

{/* --- TAB FILTER KATEGORI --- */}
<div className="flex bg-gray-100 p-1 
                rounded-xl 
                border border-gray-200 
                shadow-sm 
                w-full sm:w-fit mb-5">

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


   {/* --- FILTER DAN AKSI (ADMIN SECTION) --- */}
{(role === "admin" || role === "panitia") && (
    <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 flex flex-col md:flex-row md:items-center gap-4 border border-gray-100">
        
        <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <Filter size={20} />
            <span>Buat Bagan:</span>
        </div>

        {/* 1. Select Kategori */}
          <select
              className="border border-gray-300 p-3 rounded-xl focus:ring-3 focus:ring-yellow-500/50 bg-white"
              value={selectedKategori}
              onChange={(e) => {
                  setSelectedKategori(e.target.value);
                  setSelectedKelompok(""); // Tambahkan ini agar tidak terjadi bentrok pilihan lama
              }}
          >
              <option value="single">Single (Perseorangan)</option>
              <option value="double">Double (Ganda)</option>
          </select>

        {/* 2. Select Kelompok Umur */}
       <select
              className="border border-gray-300 p-3 rounded-xl focus:ring-3 focus:ring-yellow-500/50 md:flex-1 bg-white"
              value={selectedKelompok}
              onChange={(e) => setSelectedKelompok(e.target.value)}
          >
              <option value="">Pilih Kelompok Umur</option>
              {kelompokUmurList
                  .filter((k) => {
                      // Kita cek: Apakah sudah ada bagan dengan kelompok umur 'k.id' 
                      // DAN kategori 'selectedKategori' di list bagan yang sudah jadi?
                      const sudahAda = baganList.some(
                          (b) => b.kelompokUmurId === k.id && b.kategori === selectedKategori
                      );
                      // Jika sudah ada, kita sembunyikan (return false)
                      return !sudahAda;
                  })

                  .map((k) => (
                      <option key={k.id} value={k.id}>
                          {k.nama}
                      </option>
                  ))}
          </select>

        {/* Tombol Buat Bagan */}
        <button
            onClick={handleCreateBagan}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-green-700 transition font-semibold"
            disabled={!selectedKelompok}
        >
            <PlusCircle size={20} /> Buat Bagan
        </button>
    </div>
)}

<div className="space-y-3 md:space-y-4">
  {(() => {
    const filteredData = baganList
      .filter((b) => (filterKategori === "all" ? true : b.kategori === filterKategori))
      .sort((a, b) => a.kelompokUmurId - b.kelompokUmurId);

    if (filteredData.length === 0) {
      return (
        <div className="p-10 text-center bg-gray-50 rounded-2xl shadow-inner border border-gray-100">
          <Layout size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm md:text-lg text-gray-500 font-medium">
            Tidak ada bagan yang tersedia.
          </p>
        </div>
      );
    }

    return filteredData.map((bagan) => (
      <div
        key={bagan.id}
        className="group flex flex-row items-center justify-between bg-white border border-gray-100 p-3 md:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
        onClick={() => handleViewDetail(bagan.id)}
      >
        {/* INFO BAGAN (KIRI) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`shrink-0 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                bagan.kategori === 'double' 
                ? 'bg-purple-100 text-purple-600' 
                : 'bg-blue-100 text-blue-600'
            }`}>
                {bagan.kategori}
            </span>
            <h2 className="font-black text-sm md:text-lg text-gray-800 group-hover:text-yellow-600 transition-colors truncate">
              {bagan.nama}
            </h2>
          </div>

          <div className="flex items-center text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-tight">
            <Users size={12} className="mr-1 text-gray-300" /> 
            <span>{bagan.jumlahPeserta} Peserta</span>
          </div>
        </div>

        {/* TOMBOL AKSI (KANAN) */}
        <div className="flex items-center gap-1 md:gap-3 ml-3">
          {(role === "admin" || role === "panitia") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteBagan(bagan);
              }}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 size={16} />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetail(bagan.id);
            }}
            className="flex items-center justify-center gap-2 bg-yellow-500 text-white p-2.5 md:px-5 md:py-2.5 rounded-xl shadow-sm hover:bg-yellow-600 transition-all"
          >
            <Eye size={16} />
            {/* Teks "Lihat" disembunyikan di mobile, muncul di desktop */}
            <span className="hidden md:block text-[10px] font-black uppercase tracking-wider">
              Lihat
            </span>
          </button>
          
          {/* Pemanis: Panah kecil hanya muncul di mobile sebagai indikator klik */}
          <ChevronRight size={16} className="md:hidden text-gray-300" />
        </div>
      </div>
    ));
  })()}
</div>

{confirmDelete.show && (
  <AlertMessage
    type="warning"
    message={
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          Untuk menghapus bagan ini, ketik nama berikut dengan tepat:
        </p>

        <div className="bg-gray-100 px-4 py-3 rounded-xl text-center font-black text-sm tracking-wide">
          {confirmDelete.baganName}
        </div>

        <input
          type="text"
          value={confirmInput}
          onChange={(e) => setConfirmInput(e.target.value)}
          placeholder="Ketik nama bagan persis di sini..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-400 outline-none"
        />

        {confirmInput !== "" && !isExactMatch && (
          <p className="text-xs text-red-500 font-semibold">
            Nama tidak cocok. Perhatikan huruf besar, kecil, dan spasi.
          </p>
        )}
      </div>
    }
    onClose={() => {
      setConfirmDelete({ show: false, baganId: null, baganName: "" });
      setConfirmInput("");
    }}
  >
    <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
      <button
        onClick={() => {
          setConfirmDelete({ show: false, baganId: null, baganName: "" });
          setConfirmInput("");
        }}
        className="flex-1 px-6 py-4 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
      >
        Batal
      </button>

      <button
        onClick={confirmDeleteBagan}
        disabled={!isExactMatch}
        className={`flex-1 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
          isExactMatch
            ? "bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-200"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Ya, Hapus
      </button>
    </div>
  </AlertMessage>
)}


</div>
  );
}
