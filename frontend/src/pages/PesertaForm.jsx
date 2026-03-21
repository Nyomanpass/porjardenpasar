import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import { X, CheckCircle, Upload, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import AlertMessage from "../components/AlertMessage";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";



function PesertaForm({ onSuccess }) {
  const fileInputRef = useRef(null);
  const buktiBayarRef = useRef(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  
  const location = useLocation();


const [tournamentStatus, setTournamentStatus] = useState("checking");



  const [formData, setFormData] = useState({
    namaLengkap: "",
    nomorWhatsapp: "",
    tanggalLahir: "",
    kelompokUmurId: "",
    tournamentId: "",
    asalSekolah: "",
    fotoKartu: null,
    buktiBayar: null,
  });

  const [kelompokList, setKelompokList] = useState([]);
  const [tournamentList, setTournamentList] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [previewBayar, setPreviewBayar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchKelompok();
    fetchTournament();
  }, []);

  useEffect(() => {
  if (!tournamentList.length) return;

  const params = new URLSearchParams(location.search);
  const tournamentName = params.get("tournament");

  if (!tournamentName) return;

  const found = tournamentList.find(
    (t) =>
      t.name.trim().toLowerCase() ===
      decodeURIComponent(tournamentName).trim().toLowerCase()
  );

  if (found) {
    setSelectedTournament(found);
    setFormData((prev) => ({
      ...prev,
      tournamentId: found.id.toString(),
    }));
  }
  }, [tournamentList, location.search]);


  const fetchKelompok = async () => {
    try {
      const res = await api.get("/kelompok-umur");
      setKelompokList(res.data);
    } catch (err) {
      console.error("Gagal fetch kelompok umur:", err);
    }
  };


  const fetchTournament = async () => {
  try {
    const res = await api.get("/tournaments");
    const activeTournaments = res.data.filter(t => t.status === "aktif");

    setTournamentList(activeTournaments);

    const available = activeTournaments.filter(t => {
      const deadline = getDeadline(t.start_date);
      return new Date() <= deadline;
    });

    if (available.length === 0) {
      setTournamentStatus("closed");
    } else {
      setTournamentStatus("open");
    }

  } catch (err) {
    console.error(err);
    setTournamentStatus("closed");
  }
};



  const handleTournamentChange = (e) => {
    const id = e.target.value;
    if (!id) {
        setSelectedTournament(null);
        setFormData({ ...formData, tournamentId: "" });
        return;
    }

    const detail = tournamentList.find((t) => t.id === parseInt(id));
    
    const deadline = getDeadline(detail.start_date);
    const isRegistrationClosed = new Date() > deadline;

    if (isRegistrationClosed) {
        setError("Maaf, pendaftaran untuk turnamen ini sudah ditutup (Batas H-1).");
        setSelectedTournament(null);
        setFormData({ ...formData, tournamentId: "" }); // Reset pilihan
        return;
    }

    setSelectedTournament(detail);
    setFormData({ ...formData, tournamentId: id, buktiBayar: null });
    setPreviewBayar(null);
};

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      const objectUrl = URL.createObjectURL(file);
      if (name === "fotoKartu") setPreviewFoto(objectUrl);
      if (name === "buktiBayar") setPreviewBayar(objectUrl);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);

    return today.getFullYear() - birth.getFullYear();
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const age = calculateAge(formData.tanggalLahir);

    const selectedKelompok = kelompokList.find(
      (k) => k.id == formData.kelompokUmurId
    );

    if (!selectedKelompok) {
      setError("Pilih kategori terlebih dahulu");
      return;
    }

    if (age > selectedKelompok.umur) {
      setError(
        `Umur peserta (${age} tahun) melebihi batas kategori ${selectedKelompok.nama}`
      );
      return;
    }

  
    if (selectedTournament?.type === "berbayar" && !formData.buktiBayar) {
      setError("Harap unggah bukti pembayaran terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
      });

      await api.post("/peserta", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Pendaftaran berhasil! Data Anda akan diverifikasi panitia.");
      
      setFormData({
        namaLengkap: "", nomorWhatsapp: "", tanggalLahir: "",
        kelompokUmurId: "", tournamentId: "",   asalSekolah: "",  fotoKartu: null, buktiBayar: null,
      });
      setPreviewFoto(null);
      setPreviewBayar(null);
      setSelectedTournament(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (buktiBayarRef.current) buktiBayarRef.current.value = "";
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Hanya file JPG, JPEG, dan PNG yang diperbolehkan dengan ukuran maksimal 1.5MB");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDeadline = (startDate) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() - 1);
        // set ke akhir hari (23:59:59)
      date.setHours(23, 59, 59, 999);
      return date;
  };

  // Filter turnamen yang masih buka
  const availableTournaments = tournamentList.filter(t => {
      const deadline = getDeadline(t.start_date);
      return new Date() <= deadline;
  });


  if (tournamentStatus === "checking") {
  return null; // atau loader kosong
}

  // Jika Loading selesai tapi tidak ada turnamen yang pendaftarannya buka
if (tournamentStatus === "closed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-6">
        
        {/* Dekorasi Latar Belakang */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-50"></div>

        <div className="relative w-full max-w-lg">
          <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-10 text-center">
            
            {/* Bagian Icon */}
            <div className="mb-8 relative inline-block">
              <div className="absolute inset-0 bg-red-100 rounded-3xl rotate-12 scale-110"></div>
              <div className="relative bg-white p-6 rounded-3xl shadow-sm border border-red-50">
                <AlertCircle size={56} className="text-red-500" />
              </div>
            </div>

            {/* Teks Informasi */}
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
              Pendaftaran Ditutup
            </h2>
            
            <div className="space-y-4 mb-10">
              <p className="text-slate-600 leading-relaxed">
                Mohon maaf, saat ini pendaftaran untuk semua turnamen <span className="font-bold text-slate-800">telah berakhir</span> atau sedang <span className="font-bold text-slate-800">tidak tersedia</span>.
              </p>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest mb-1">Ketentuan</p>
                <p className="text-sm font-medium text-slate-700">Pendaftaran ditutup otomatis 1 hari (H-1) sebelum jadwal pertandingan dimulai.</p>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col gap-3">
              <a 
                href="/" 
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
              >
                Kembali ke Beranda
              </a>
              
              <a 
                href="https://wa.me/62xxxxxxxxxx" // Ganti dengan nomor Admin
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white text-blue-600 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest border-2 border-blue-50 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                Hubungi Panitia
              </a>
            </div>

            <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              PELTI Kota Denpasar • Persatuan Lawn Tenis Indonesia
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
       
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
      <div className="bg-white shadow-2xl w-full min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          
          {/* KOLOM KIRI: BRANDING & INFO (50%) */}
        <div className="relative bg-secondary 
                        px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20 
                        flex flex-col justify-center items-center 
                        text-white overflow-hidden">

          {/* Background Glow */}
          <div className="absolute top-0 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">

            {/* Logo & Title */}
            <div className="flex flex-col items-center mb-10">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-16 h-16 sm:w-20 sm:h-20 mb-4 drop-shadow-lg p-2 rounded-2xl bg-white/10" 
              />

              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                PELTI DENPASAR
              </h1>

              <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-blue-200 mt-1">
                Persatuan Lawn Tenis Indonesia
              </p>
            </div>

            {/* Headline */}
            <div className="mb-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl 
                            font-extrabold 
                            leading-snug 
                            mb-4">
                Ayo Gabung, Jadi Juara Baru!
              </h2>

              <p className="text-blue-100 text-sm sm:text-base 
                            opacity-90 
                            leading-relaxed 
                            max-w-md mx-auto">
                Raih gelar juara Turnamen Tenis PELTI Denpasar 
                di kategori umur Anda.
              </p>
            </div>

            {/* Steps */}
            <div className="hidden lg:block w-full space-y-4 mt-4">
              {[
                "Lengkapi data diri sesuai identitas.",
                "Pilih Kelompok Umur yang tersedia.",
                "Upload bukti identitas (KK/KTP).",
                "Lakukan pembayaran (untuk turnamen berbayar).",
              ].map((text, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-4 
                            bg-white/5 
                            p-4 
                            rounded-2xl 
                            border border-white/10 
                            backdrop-blur-sm 
                            transition-all duration-300 hover:bg-white/10"
                >
                  <span className="flex-shrink-0 w-8 h-8 
                                  flex items-center justify-center 
                                  bg-primary rounded-xl 
                                  text-white text-xs font-black shadow-lg">
                    {i + 1}
                  </span>

                  <p className="text-sm font-medium text-left leading-relaxed">
                    {text}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>


          {/* KOLOM KANAN: FORMULIR (50%) */}
          <div className="flex-1 p-6  bg-white flex flex-col justify-center items-center">
            <div className="w-full max-w-2xl">
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">Formulir Pendaftaran</h2>
                <p className="text-slate-500 text-sm italic">Lengkapi data peserta dengan benar untuk verifikasi.</p>
                <div className="w-16 h-1 bg-primary rounded-full mt-4 mx-auto lg:mx-0"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* PILIH TURNAMEN */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Turnamen</label>
                  <select
                    name="tournamentId"
                    value={formData.tournamentId}
                    onChange={handleTournamentChange}
                    className="w-full border-2 border-slate-100 bg-slate-50 p-3.5 rounded-xl focus:border-primary outline-none transition-all font-bold text-slate-700 text-sm"
                    required
                  >
                    <option value="">-- Pilih Turnamen Aktif --</option>
                    {tournamentList
                      .filter(t => new Date() <= getDeadline(t.start_date)) // HANYA TAMPILKAN YANG BELUM DEADLINE
                      .map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))
                    }
                  </select>
                </div>

                {/* AREA PEMBAYARAN */}
                {selectedTournament && selectedTournament.type === "berbayar" && (
                  <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-800">
                      <CreditCard size={18}/>
                      <h3 className="font-bold uppercase text-[11px] tracking-wider">Instruksi Pembayaran</h3>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-amber-100 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Nominal Transfer</p>
                        <p className="text-lg font-black text-blue-600">Rp {Number(selectedTournament.nominal).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Bank / Tujuan</p>
                        <p className="text-xs font-bold text-slate-700">{selectedTournament.bank_info}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-amber-700 ml-1 uppercase">Upload Bukti Transfer</label>
                      <input
                        ref={buktiBayarRef}
                        type="file"
                        name="buktiBayar"
                        onChange={handleChange}
                        required
                        className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-amber-500 file:text-white file:font-bold hover:file:bg-amber-600 cursor-pointer"
                      />
                      {previewBayar && (
                        <div className="relative w-24 aspect-square rounded-xl overflow-hidden shadow-md border-2 border-white mt-2">
                          <img src={previewBayar} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => { setPreviewBayar(null); setFormData({...formData, buktiBayar: null}); buktiBayarRef.current.value = ""; }}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md"
                          ><X size={12}/></button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* BIODATA PESERTA */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nama Lengkap</label>
                    <input type="text" name="namaLengkap" value={formData.namaLengkap} onChange={handleChange} className="w-full border-2 border-slate-100 p-3.5 rounded-xl outline-none focus:border-primary transition text-sm shadow-sm" placeholder="Nama Lengkap" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">No. WhatsApp</label>
                    <input type="text" name="nomorWhatsapp" value={formData.nomorWhatsapp} onChange={handleChange} className="w-full border-2 border-slate-100 p-3.5 rounded-xl outline-none focus:border-primary transition text-sm shadow-sm" placeholder="08xxxxxxxx" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2 w-full">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                      Tanggal Lahir
                    </label>

                    <div className="w-full">
                      <DatePicker
                        selected={
                          formData.tanggalLahir
                            ? new Date(formData.tanggalLahir)
                            : null
                        }
                        onChange={(date) =>
                          setFormData({
                            ...formData,
                            tanggalLahir: date.toISOString().split("T")[0],
                          })
                        }
                        dateFormat="yyyy-MM-dd"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        placeholderText="Pilih Tanggal Lahir"
                        popperPlacement="bottom-start"
                        className="w-full border-2 border-slate-100 bg-slate-50 p-3.5 rounded-xl outline-none focus:border-primary transition text-sm shadow-sm"
                        wrapperClassName="w-full"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kelompok Umur</label>
                    <select name="kelompokUmurId" value={formData.kelompokUmurId} onChange={handleChange} className="w-full border-2 border-slate-100 p-3.5 rounded-xl bg-white outline-none focus:border-primary transition text-sm shadow-sm font-medium" required>
                      <option value="">-- Pilih --</option>
                      {[...kelompokList]
                        .sort((a, b) => {
                          if (a.umur === b.umur) {
                            return a.id - b.id; // kalau umur sama → id terkecil dulu
                          }
                          return a.umur - b.umur; // umur terkecil dulu
                        })
                        .map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.nama}
                          </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ASAL SEKOLAH (MUNCUL JIKA TOURNAMENT WAJIB SEKOLAH) */}
                {selectedTournament?.requireSchool && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                      Asal Sekolah
                    </label>
                    <input
                      type="text"
                      name="asalSekolah"
                      value={formData.asalSekolah}
                      onChange={handleChange}
                      placeholder="Contoh: SMA Negeri 1 Denpasar"
                      required
                      className="w-full border-2 border-slate-100 p-3.5 rounded-xl outline-none focus:border-primary transition text-sm shadow-sm"
                    />
                  </div>
                )}


                {/* FOTO IDENTITAS */}
                <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <Upload size={16} className="text-primary"/> Foto Identitas (KK/KTP)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="fotoKartu"
                    accept="image/*"
                    onChange={handleChange}
                     required
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-slate-700 file:text-white file:font-bold hover:file:bg-black transition-all cursor-pointer"
                  />
                  {previewFoto && (
                    <div className="relative w-full max-w-[240px] aspect-video rounded-xl overflow-hidden shadow-lg border-2 border-white mt-2">
                      <img src={previewFoto} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => { setPreviewFoto(null); setFormData({...formData, fotoKartu: null}); fileInputRef.current.value = ""; }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md hover:bg-red-600 transition"
                      ><X size={14}/></button>
                    </div>
                  )}
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white font-black text-sm py-4 rounded-xl hover:bg-blue-600 transform hover:scale-[1.01] active:scale-95 transition-all duration-300 shadow-xl shadow-blue-100 flex items-center justify-center gap-3 uppercase tracking-widest disabled:bg-slate-300"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <>Daftar Sekarang <CheckCircle size={18}/></>}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PesertaForm;