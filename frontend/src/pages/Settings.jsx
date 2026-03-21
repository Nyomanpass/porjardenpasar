// src/pages/Settings.jsx
import { useEffect, useState } from "react";
import api from "../api";
import { Edit, Trash2, PlusCircle, Users, MapPin, XCircle, CheckCircle,  Eye, EyeOff } from "lucide-react";
import SettingScoreRule from "../components/admin/SettingScoreRule";
import AlertMessage from "../components/AlertMessage";



export default function Settings() {
  // ================= Kelompok Umur =================
  const [kelompokUmur, setKelompokUmur] = useState([]);
  const [namaUmur, setNamaUmur] = useState("");
  const [umur, setUmur] = useState(""); 
  const [editingUmurId, setEditingUmurId] = useState(null);

  const [wasit, setWasit] = useState([]);
  const [namaWasit, setNamaWasit] = useState("");
  const [emailWasit, setEmailWasit] = useState("");
  const [passwordWasit, setPasswordWasit] = useState("");
  const [editingWasitId, setEditingWasitId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [panitia, setPanitia] = useState([]);
  const [namaPanitia, setNamaPanitia] = useState("");
  const [emailPanitia, setEmailPanitia] = useState("");
  const [passwordPanitia, setPasswordPanitia] = useState("");
  const [editingPanitiaId, setEditingPanitiaId] = useState(null);
  const [showPasswordPanitia, setShowPasswordPanitia] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, type: null });



  const fetchWasit = async () => {
    const res = await api.get("/wasit");
    setWasit(res.data);
  };


  const handleSubmitWasit = async (e) => {
    e.preventDefault();

    const payload = {
      name: namaWasit,
      email: emailWasit,
    };

    // kalau password diisi → ikut dikirim
    if (passwordWasit) {
      payload.password = passwordWasit;
    }

    if (editingWasitId) {
      // UPDATE
      await api.put(`/wasit/${editingWasitId}`, payload);
      setSuccess("Wasit berhasil diperbarui");
    } else {
      // CREATE
      await api.post("/wasit", {
        ...payload,
        password: passwordWasit,
      });
      setSuccess("Wasit berhasil ditambahkan");
    }

    setNamaWasit("");
    setEmailWasit("");
    setPasswordWasit("");
    setEditingWasitId(null);
    fetchWasit();
  };


  const updateStatus = async (id, status) => {
    await api.put(`/wasit/${id}/status`, { status });
    fetchWasit();
  };

  const deleteWasit = async (id) => {
    await api.delete(`/wasit/${id}`);
    setSuccess("Wasit berhasil dihapus");
    fetchWasit();
  };

  const handleEditWasit = (w) => {
    setNamaWasit(w.name);
    setEmailWasit(w.email);
    setPasswordWasit(""); 
    setEditingWasitId(w.id);
  };

  const fetchPanitia = async () => {
    const res = await api.get("/panitia");
    setPanitia(res.data);
  };


  const handleSubmitPanitia = async (e) => {
    e.preventDefault();

    const payload = {
      name: namaPanitia,
      email: emailPanitia,
    };

    if (passwordPanitia) {
      payload.password = passwordPanitia;
    }

    if (editingPanitiaId) {
      await api.put(`/panitia/${editingPanitiaId}`, payload);
      setSuccess("Panitia berhasil diperbarui");
    } else {
      await api.post("/panitia", {
        ...payload,
        password: passwordPanitia,
      });
      setSuccess("Panitia berhasil ditambahkan");
    }

    setNamaPanitia("");
    setEmailPanitia("");
    setPasswordPanitia("");
    setEditingPanitiaId(null);

    fetchPanitia();
  };

  const updateStatusPanitia = async (id, status) => {
    await api.put(`/panitia/${id}/status`, { status });
    fetchPanitia();
  };

  const deletePanitia = async (id) => {
    await api.delete(`/panitia/${id}`);
    setSuccess("Panitia berhasil dihapus");
    fetchPanitia();
  };


  const fetchKelompokUmur = async () => {
    try {
      const res = await api.get("/kelompok-umur");
      setKelompokUmur(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitUmur = async (e) => {
      e.preventDefault();
      try {
        // Mengirim payload dengan nama dan umur
        const payload = { 
          nama: namaUmur, 
          umur: parseInt(umur) 
        };

        if (editingUmurId) {
          await api.put(`/kelompok-umur/${editingUmurId}`, payload);
           setSuccess("Kelompok umur berhasil diupdate");
        } else {
          await api.post("/kelompok-umur", payload);
          setSuccess("Kelompok umur berhasil ditambahkan");
        }
        

        setNamaUmur("");
        setUmur("");
        setEditingUmurId(null);
        fetchKelompokUmur();
      } catch (error) {
        setError("Gagal menyimpan kelompok umur");
      }
    };

  const handleDeleteUmur = async (id) => {
    try {
      await api.delete(`/kelompok-umur/${id}`);
      setSuccess("Kelompok umur berhasil dihapus");
      fetchKelompokUmur();
    } catch (error) {
      setError("Gagal menghapus kelompok umur, masih ada data peserta");
      console.error(error);
    }
  };

  const handleEditUmur = (item) => {
      setNamaUmur(item.nama);
      setUmur(item.umur); 
      setEditingUmurId(item.id);
    }

  // ================= Lapangan =================
  const [lapangan, setLapangan] = useState([]);
  const [namaLapangan, setNamaLapangan] = useState("");
  const [lokasiLapangan, setLokasiLapangan] = useState("");
  const [editingLapanganId, setEditingLapanganId] = useState(null);

  const fetchLapangan = async () => {
    try {
      const res = await api.get("/lapangan");
      setLapangan(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitLapangan = async (e) => {
    e.preventDefault();
    try {
      if (editingLapanganId) {
        await api.put(`/lapangan/${editingLapanganId}`, {
          nama: namaLapangan,
          lokasi: lokasiLapangan,
        });
         setSuccess("Lapangan berhasil diedit");
      } else {
        await api.post("/lapangan", {
          nama: namaLapangan,
          lokasi: lokasiLapangan,
        });
         setSuccess("Lapangan berhasil dbuat");
      }
      setNamaLapangan("");
      setLokasiLapangan("");
      setEditingLapanganId(null);
      fetchLapangan();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteLapangan = async (id) => {
    try {
      await api.delete(`/lapangan/${id}`);
      setSuccess("Lapangan berhasil dihapus");
      fetchLapangan();
    } catch (error) {
      setError("Gagal menghapus lapangan, masih ada data jadwal");
      console.error(error);
    }
  };

  const handleEditLapangan = (item) => {
    setNamaLapangan(item.nama);
    setLokasiLapangan(item.lokasi);
    setEditingLapanganId(item.id);
  };

  // ================= Lifecycle =================
  useEffect(() => {
    fetchKelompokUmur();
    fetchLapangan();
    fetchWasit();
     fetchPanitia(); 
  }, []);


 const handleConfirmDelete = async () => {
  try {

    if (confirmDelete.type === "umur") {
      await handleDeleteUmur(confirmDelete.id);
    }

    if (confirmDelete.type === "lapangan") {
      await handleDeleteLapangan(confirmDelete.id);
    }

    if (confirmDelete.type === "wasit") {
      await deleteWasit(confirmDelete.id);
    }

    if (confirmDelete.type === "panitia") {
      await deletePanitia(confirmDelete.id);
    }

  } catch (error) {
    setError("Gagal menghapus data");
  } finally {
    setConfirmDelete({ show: false, id: null, type: null });
  }
};



  return (
<div className="font-sans bg-gray-50 min-h-screen">

    {success && (
        <AlertMessage type="success" message={success} onClose={() => setSuccess("")} />
      )}
      {error && (
        <AlertMessage type="error" message={error} onClose={() => setError("")} />
      )}

  <div className="space-y-12 mx-auto">
    
    {/* --- 1. SETTINGS KELOMPOK UMUR --- */}
    <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-yellow-500/50 pb-3 flex items-center gap-2">
            <Users size={24} className="text-blue-600"/> Settings Kelompok Umur
          </h1>

          {/* Form Kelompok Umur */}
          <form onSubmit={handleSubmitUmur} className="mb-8 flex flex-wrap gap-4 items-end">
            <div className="flex flex-col flex-[2]">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                    Nama Kelompok
                </label>
                <input
                    type="text"
                    value={namaUmur}
                    onChange={(e) => setNamaUmur(e.target.value)}
                    placeholder="Contoh: KU 10 PA"
                    className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
                    required
                />
            </div>

            {/* --- INPUT BARU: ANGKA UMUR --- */}
            <div className="flex flex-col flex-grow">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                    Umur (Tahun)
                </label>
                <input
                    type="number"
                    value={umur}
                    onChange={(e) => setUmur(e.target.value)}
                    placeholder="10"
                    className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
                    required
                />
            </div>
            
            <div className="flex gap-3">
                {editingUmurId && (
                    <button
                      type="button"
                      onClick={() => {
                          setEditingUmurId(null);
                          setNamaUmur("");
                          setUmur("");
                      }}
                      className="bg-gray-500 hover:bg-gray-600 transition text-white px-5 py-3 rounded-xl shadow-md font-semibold"
                    >
                      Batal
                    </button>
                )}
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-2"
                >
                    {editingUmurId ? <Edit size={18}/> : <PlusCircle size={18}/>}
                    {editingUmurId ? "Update" : "Tambah"}
                </button>
            </div>
          </form>

          {/* Table Kelompok Umur */}
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">ID</th>
                  <th className="px-5 py-3 text-left">Nama Kelompok</th>
                  <th className="px-5 py-3 text-left">Umur</th> {/* KOLOM BARU */}
                  <th className="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {kelompokUmur.map((item) => (
                  <tr key={item.id} className="hover:bg-yellow-50/50 transition">
                    <td className="px-5 py-3 font-medium text-gray-700">{item.id}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800">{item.nama}</td>
                    <td className="px-5 py-3 text-blue-600 font-bold">{item.umur} Tahun</td> {/* DATA BARU */}
                    <td className="px-5 py-3 flex gap-3 justify-center">
                      <button
                        onClick={() => handleEditUmur(item)}
                        className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg shadow-md transition"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ show: true, id: item.id, type: "umur" })}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg shadow-md transition"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


    {/* --- 2. SETTINGS LAPANGAN --- */}
    <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-yellow-500/50 pb-3 flex items-center gap-2">
        <MapPin size={24} className="text-blue-600"/> Settings Lapangan
      </h1>

      {/* Form Lapangan */}
      <form onSubmit={handleSubmitLapangan} className="mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col flex-grow">
            <label className="text-sm font-semibold text-gray-700 mb-1">
                Nama Lapangan
            </label>
            <input
                type="text"
                value={namaLapangan}
                onChange={(e) => setNamaLapangan(e.target.value)}
                placeholder="Contoh: Lapangan A"
                className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
                required
            />
        </div>
        
        <div className="flex flex-col flex-grow">
            <label className="text-sm font-semibold text-gray-700 mb-1">
                Lokasi Lapangan
            </label>
            <input
                type="text"
                value={lokasiLapangan}
                onChange={(e) => setLokasiLapangan(e.target.value)}
                placeholder="Contoh: Indor"
                className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
                required
            />
        </div>

        {/* Tombol Aksi Form Lapangan */}
        <div className="flex gap-3">
            {editingLapanganId && (
                <button
                type="button"
                onClick={() => {
                    setEditingLapanganId(null);
                    setNamaLapangan("");
                    setLokasiLapangan("");
                }}
                className="bg-gray-500 hover:bg-gray-600 transition text-white px-5 py-3 rounded-xl shadow-md font-semibold"
                >
                Batal
                </button>
            )}
            <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-2"
            >
                {editingLapanganId ? <Edit size={18}/> : <PlusCircle size={18}/>}
                {editingLapanganId ? "Update" : "Tambah"}
            </button>
        </div>
      </form>

      {/* Table Lapangan */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">ID</th>
              <th className="px-5 py-3 text-left">Nama</th>
              <th className="px-5 py-3 text-left">Lokasi</th>
              <th className="px-5 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {lapangan.map((item) => (
              <tr key={item.id} className="hover:bg-yellow-50/50 transition">
                <td className="px-5 py-3 font-medium text-gray-700">{item.id}</td>
                <td className="px-5 py-3 font-semibold text-gray-800">{item.nama}</td>
                <td className="px-5 py-3 text-gray-600">{item.lokasi}</td>
                <td className="px-5 py-3 flex gap-3 justify-center">
                  <button
                    onClick={() => handleEditLapangan(item)}
                    className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg shadow-md transition"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                     onClick={() => setConfirmDelete({ show: true, id: item.id, type: "lapangan" })}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg shadow-md transition"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {lapangan.length === 0 && (
              <tr><td colSpan="4" className="text-center py-5 text-gray-500 italic bg-white">
              Tidak ada data lapangan tersedia.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>


      {/* --- SETTINGS PANITIA --- */}
    <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100 mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-purple-500/50 pb-3 flex items-center gap-2">
        <Users size={24} className="text-purple-600"/> Settings Akun Panitia
      </h1>

      {/* FORM PANITIA */}
      <form onSubmit={handleSubmitPanitia} className="mb-8 flex flex-wrap gap-4 items-end">

        <div className="flex flex-col flex-grow">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Nama Panitia
          </label>
          <input
            type="text"
            value={namaPanitia}
            onChange={(e) => setNamaPanitia(e.target.value)}
            placeholder="Nama lengkap panitia"
            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500 outline-none w-full shadow-sm"
            required
          />
        </div>

        <div className="flex flex-col flex-grow">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Email Panitia
          </label>
          <input
            type="email"
            value={emailPanitia}
            onChange={(e) => setEmailPanitia(e.target.value)}
            placeholder="Email lengkap panitia"
            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500 outline-none w-full shadow-sm"
            required
          />
        </div>

        <div className="flex flex-col flex-grow">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Password
          </label>

          <div className="relative">
            <input
              type={showPasswordPanitia ? "text" : "password"}
              value={passwordPanitia}
              onChange={(e) => setPasswordPanitia(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="border border-gray-300 px-4 py-3 pr-12 rounded-xl focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500 outline-none w-full shadow-sm"
              required={!editingPanitiaId}
            />

            <button
              type="button"
              onClick={() => setShowPasswordPanitia(!showPasswordPanitia)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPasswordPanitia ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          {editingPanitiaId && (
            <button
              type="button"
              onClick={() => {
                setEditingPanitiaId(null);
                setNamaPanitia("");
                setEmailPanitia("");
                setPasswordPanitia("");
              }}
              className="bg-gray-500 hover:bg-gray-600 transition text-white px-5 py-3 rounded-xl shadow-md font-semibold"
            >
              Batal
            </button>
          )}

          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 transition text-white px-5 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-2"
          >
            {editingPanitiaId ? <Edit size={18}/> : <PlusCircle size={18}/>}
            {editingPanitiaId ? "Update" : "Tambah"}
          </button>
        </div>

      </form>

      {/* TABLE PANITIA */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">ID</th>
              <th className="px-5 py-3 text-left">Nama</th>
              <th className="px-5 py-3 text-left">Email</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {panitia.map((p) => (
              <tr key={p.id} className="hover:bg-purple-50/50 transition">
                <td className="px-5 py-3 font-medium text-gray-700">{p.id}</td>
                <td className="px-5 py-3 font-semibold text-gray-800">{p.name}</td>
                <td className="px-5 py-3 text-gray-600">{p.email}</td>

                <td className="px-5 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${p.status === "verified" && "bg-green-100 text-green-700"}
                    ${p.status === "pending" && "bg-yellow-100 text-yellow-700"}
                    ${p.status === "rejected" && "bg-red-100 text-red-700"}
                  `}>
                    {p.status}
                  </span>
                </td>

                <td className="px-5 py-3 flex gap-3 justify-center">

                  {/* VERIFY */}
                  <button
                    onClick={() => updateStatusPanitia(p.id, "verified")}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg shadow-md transition"
                    title="Verifikasi"
                  >
                    <CheckCircle size={16}/>
                  </button>

                  {/* REJECT */}
                  <button
                    onClick={() => updateStatusPanitia(p.id, "rejected")}
                    className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg shadow-md transition"
                    title="Tolak"
                  >
                    <XCircle size={16}/>
                  </button>

                  {/* EDIT */}
                  <button
                    onClick={() => {
                      setNamaPanitia(p.name);
                      setEmailPanitia(p.email);
                      setPasswordPanitia("");
                      setEditingPanitiaId(p.id);
                    }}
                    className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg shadow-md transition"
                    title="Edit"
                  >
                    <Edit size={16}/>
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => setConfirmDelete({ show: true, id: p.id, type: "panitia" })}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg shadow-md transition"
                    title="Hapus"
                  >
                    <Trash2 size={16}/>
                  </button>

                </td>
              </tr>
            ))}

            {panitia.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-5 text-gray-500 italic bg-white">
                  Tidak ada data panitia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>


      {/* --- SETTINGS WASIT --- */}
      <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100 mt-10">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-yellow-500/50 pb-3 flex items-center gap-2">
          <Users size={24} className="text-blue-600"/> Settings Akun Wasit
        </h1>

        {/* Form Wasit */}
        <form onSubmit={handleSubmitWasit} className="mb-8 flex flex-wrap gap-4 items-end">
          <div className="flex flex-col flex-grow">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Nama Wasit
            </label>
            <input
              type="text"
              value={namaWasit}
              onChange={(e) => setNamaWasit(e.target.value)}
              placeholder="Nama lengkap wasit"
              className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
              required
            />
          </div>

          <div className="flex flex-col flex-grow">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Email Wasit
            </label>
            <input
              type="email"
              value={emailWasit}
              onChange={(e) => setEmailWasit(e.target.value)}
              placeholder="Email lengkap wasit"
              className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
              required
            />
          </div>

          <div className="flex flex-col flex-grow">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordWasit}
                onChange={(e) => setPasswordWasit(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="border border-gray-300 px-4 py-3 pr-12 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
                required
              />

              {/* Icon Mata */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>


            <div className="flex gap-3">
              {editingWasitId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingWasitId(null);
                    setNamaWasit("");
                    setEmailWasit("");
                    setPasswordWasit("");
                  }}
                  className="bg-gray-500 hover:bg-gray-600 transition text-white px-5 py-3 rounded-xl shadow-md font-semibold"
                >
                  Batal
                </button>
              )}

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-2"
              >
                
                {editingWasitId ? <Edit size={18}/> : <PlusCircle size={18}/>}
                {editingWasitId ? "Update" : "Tambah"}
              </button>
            </div>

        </form>

        {/* Table Wasit */}
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Nama</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {wasit.map((w) => (
                <tr key={w.id} className="hover:bg-yellow-50/50 transition">
                  <td className="px-5 py-3 font-medium text-gray-700">{w.id}</td>
                  <td className="px-5 py-3 font-semibold text-gray-800">{w.name}</td>
                  <td className="px-5 py-3 text-gray-600">{w.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${w.status === "verified" && "bg-green-100 text-green-700"}
                      ${w.status === "pending" && "bg-yellow-100 text-yellow-700"}
                      ${w.status === "rejected" && "bg-red-100 text-red-700"}
                    `}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 flex gap-3 justify-center">
                    <button
                      onClick={() => updateStatus(w.id, "verified")}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg shadow-md transition"
                      title="Verifikasi"
                    >
                     <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => updateStatus(w.id, "rejected")}
                      className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg shadow-md transition"
                      title="Tolak"
                    >
                      <XCircle size={16} />
                    </button>
                    <button
                      onClick={() => handleEditWasit(w)}
                      className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg shadow-md transition"
                      title="Edit"
                    >
                        <Edit size={16} />
                    </button>

                    <button
                      onClick={() => setConfirmDelete({ show: true, id: w.id, type: "wasit" })}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg shadow-md transition"
                      title="Hapus"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}

              {wasit.length === 0 && (
                <tr><td colSpan="5" className="text-center py-5 text-gray-500 italic bg-white">
                Tidak ada data wasit.
                </td></tr>

              )}
            </tbody>
          </table>
        </div>
      </div>

      <SettingScoreRule/>

  </div>

  {confirmDelete.show && (
  <AlertMessage
    type="warning"
    message="Yakin ingin menghapus data ini? Data yang sudah dihapus tidak bisa dikembalikan."
    onClose={() => setConfirmDelete({ show: false, id: null, type: null })}
  >
    <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
      
      <button
        onClick={() => setConfirmDelete({ show: false, id: null, type: null })}
        className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
      >
        Batal
      </button>

      <button
        onClick={handleConfirmDelete}
        className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition"
      >
        Ya, Hapus
      </button>

    </div>
  </AlertMessage>
)}

</div>

  );
}
