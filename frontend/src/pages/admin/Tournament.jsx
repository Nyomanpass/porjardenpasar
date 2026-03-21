import React, { useEffect, useState } from "react";
import api from "../../api";
import { Edit, Trash2, Upload, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import AlertMessage from "../../components/AlertMessage";
import QRCode from "qrcode";
import { QrCode } from "lucide-react";



function Tournament() {
  const [tournaments, setTournaments] = useState([]);
  const [preview, setPreview] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_URL;


  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const level = query.get("level"); 

  const [success, setSuccess] = useState("");
  const [errorAlert, setErrorAlert] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, name: "" });


  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    location: "",
    description: "",
    status: "nonaktif",
    poster: null, 
    type: "gratis", 
    level: level || "",
    nominal: "",    
    bank_info: "",  
    requireSchool: false,
  });

  const [editingId, setEditingId] = useState(null);
  
  useEffect(() => {
    if (level) {
      setForm((prev) => ({
        ...prev,
        level: level,
      }));
    }
  }, [level]);



  // 🔹 Ambil semua turnamen
  useEffect(() => {
    fetchTournaments();
  }, [level]);

  const fetchTournaments = async () => {
    try {
      let url = "/tournaments";
      if (level) {
        url += `?level=${level}`;
      }

      const res = await api.get(url);
      setTournaments(res.data);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
  };


  // 🔹 Handle input teks
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Handle upload file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, poster: file });
      // Gunakan URL.createObjectURL HANYA untuk file baru yang dipilih dari komputer
      setPreview(URL.createObjectURL(file));
    }
  };

  // 🔹 Tambah / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorAlert("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("start_date", form.start_date);
      formData.append("end_date", form.end_date);
      formData.append("location", form.location);
      formData.append("description", form.description);
      formData.append("status", form.status);
      formData.append("type", form.type);
      formData.append("level", form.level); 
      formData.append("nominal", form.nominal);
      formData.append("bank_info", form.bank_info);
      formData.append("requireSchool", form.requireSchool);


      if (form.poster) {
        formData.append("poster", form.poster);
      }

      if (editingId) {
        await api.put(`/tournaments/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setTimeout(() => setSuccess(`Perubahan pada "${form.name}" berhasil disimpan!`), 100);
      } else {
        await api.post("/tournaments", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setTimeout(() => setSuccess(`Turnamen "${form.name}" berhasil dipublikasikan!`), 100);
      }

      resetForm();
      fetchTournaments();
    } catch (err) {
       setErrorAlert("Gagal menyimpan data turnamen. Periksa kembali inputan.");
    }
  };



const handleDownloadQR = async (tournament) => {
  const baseDomain = window.location.origin;

  const url = `${baseDomain}/daftar-peserta?tournament=${encodeURIComponent(
    tournament.name
  )}`;

  try {
    const qr = await QRCode.toDataURL(url, {
      width: 500,          // 🔥 BESARKAN DI SINI
      margin: 2,
      errorCorrectionLevel: "H", // kualitas tinggi
    });

    const link = document.createElement("a");
    link.href = qr;
    link.download = `${tournament.name}-qr.png`;
    link.click();
  } catch (err) {
    console.error(err);
  }
};



  // 🔹 Hapus
  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/tournaments/${confirmDelete.id}`);
      
      // Munculkan pesan sukses
      setSuccess(`Turnamen "${confirmDelete.name}" telah dihapus.`);
      
      fetchTournaments();
    } catch (err) {
      console.error("Gagal hapus data:", err);
      setErrorAlert("Gagal menghapus turnamen. Mungkin data masih digunakan di bagian lain.");
    } finally {
      // Tutup modal konfirmasi
      setConfirmDelete({ show: false, id: null, name: "" });
    }
  };

  // 🔹 Edit
  const handleEdit = (t) => {
    setForm({
      name: t.name,
      start_date: t.start_date,
      end_date: t.end_date,
      location: t.location,
      description: t.description,
      status: t.status,
      poster: null,
      type: t.type || "gratis",
      level: t.level || level || "", 
      nominal: t.nominal || 0,
      bank_info: t.bank_info || "",
      requireSchool: t.requireSchool || false   
    });
    setEditingId(t.id);
    if (t.poster) {
      setPreview(`${BASE_URL}/${t.poster}`);
    } else {
      setPreview(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({
      name: "",
      start_date: "",
      end_date: "",
      location: "",
      description: "",
      status: "nonaktif",
      poster: null,
      type: "gratis",
      level: level || "",   
      nominal: 0,
      bank_info: "",
      requireSchool: false   
    });
    setPreview(null);
    setEditingId(null);
  };

  return (
  <div className="mx-auto"> {/* Max width sedikit diperluas */}
    {/* --- TOAST ALERTS --- */}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess("")} />}
      {errorAlert && <AlertMessage type="error" message={errorAlert} onClose={() => setErrorAlert("")} />}

      {/* --- MODAL HAPUS RAKSASA --- */}
      {confirmDelete.show && (
        <AlertMessage 
          type="warning" 
          message={`Hapus turnamen "${confirmDelete.name}"? Semua data pendaftaran terkait mungkin akan terdampak.`} 
          onClose={() => setConfirmDelete({ show: false, id: null, name: "" })}
        >
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
            <button
              onClick={() => setConfirmDelete({ show: false, id: null, name: "" })}
              className="flex-1 order-2 sm:order-1 min-h-[56px] px-8 py-4 rounded-2xl bg-gray-100 text-gray-800 font-black text-sm uppercase tracking-tighter hover:bg-gray-200 active:scale-95 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="flex-1 order-1 sm:order-2 min-h-[56px] px-8 py-4 rounded-2xl bg-red-600 text-white font-black text-sm uppercase tracking-tighter shadow-lg hover:bg-red-700 active:scale-95 transition-all"
            >
              Ya, Hapus
            </button>
          </div>
        </AlertMessage>
      )}
    {/* --- FORM SECTION --- */}
    <div className="bg-white p-8 rounded-2xl shadow-2xl mb-10 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-yellow-500/50 pb-3">
            {editingId ? "✏️ Edit Detail Turnamen" : "➕ Tambah Turnamen Baru"}
        </h2>

        {level && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Kategori Turnamen:</span>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-bold uppercase">
              {level}
            </span>
          </div>
        )}


        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Input Nama */}
            <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                    Nama Turnamen <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: Kejuaraan Nasional 2025"
                    className="border border-gray-300 p-3 rounded-lg focus:ring-3 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-200 shadow-sm"
                />
            </div>

            {/* Input Lokasi */}
            <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                    Lokasi Turnamen
                </label>
                <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Contoh: GOR Jaya Sakti"
                    className="border border-gray-300 p-3 rounded-lg focus:ring-3 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-200 shadow-sm"
                />
            </div>

            {/* Input Tanggal Mulai */}
            <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                    Tanggal Mulai
                </label>
                <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded-lg focus:ring-3 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-200 shadow-sm appearance-none"
                />
            </div>

            {/* Input Tanggal Selesai */}
            <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                    Tanggal Selesai
                </label>
                <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded-lg focus:ring-3 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-200 shadow-sm appearance-none"
                />
            </div>

            {/* Select Status */}
            <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                    Status
                </label>
                <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded-lg focus:ring-3 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-200 shadow-sm bg-white appearance-none"
                >
                    <option value="aktif">🟢 Aktif</option>
                    <option value="nonaktif">🔴 Nonaktif</option>
                </select>
            </div>

            {/* Pilih Tipe */}
            <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">Tipe Turnamen</label>
                <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded-lg bg-white"
                >
                    <option value="gratis">Gratis</option>
                    <option value="berbayar">Berbayar</option>
                </select>
            </div>

            {/* Require School Toggle */}
            <div className="flex items-center gap-3 mt-2">
              <input
                type="checkbox"
                id="requireSchool"
                checked={form.requireSchool}
                onChange={(e) =>
                  setForm({ ...form, requireSchool: e.target.checked })
                }
                className="w-4 h-4 accent-yellow-500"
              />
              <label
                htmlFor="requireSchool"
                className="text-sm font-semibold text-gray-700"
              >
                Wajib Isi Asal Sekolah Saat Pendaftaran
              </label>
            </div>


            {/* Jika Admin pilih Berbayar, Munculkan ini */}
            {form.type === "berbayar" && (
                <>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">Nominal (Rp)</label>
                        <input
                            type="number"
                            name="nominal"
                            value={form.nominal}
                            onChange={handleChange}
                            placeholder="150000"
                            className="border border-gray-300 p-3 rounded-lg"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">Info Bank & Rekening</label>
                        <input
                            type="text"
                            name="bank_info"
                            value={form.bank_info}
                            onChange={handleChange}
                            placeholder="BCA - 1234567 a/n PELTI"
                            className="border border-gray-300 p-3 rounded-lg"
                        />
                    </div>
                </>
            )}

            {/* Upload Poster (Menggunakan Custom Style) */}
            <div className="flex flex-col text-left relative">
            <label className="text-sm font-bold text-gray-600 mb-1">Poster Turnamen</label>
            <label htmlFor="poster-upload" className="flex items-center justify-center border-2 border-dashed border-gray-300 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition">
              <Upload size={18} className="mr-2 text-gray-400"/>
              <span className="text-sm text-gray-500 truncate">{form.poster ? form.poster.name : "Pilih Gambar..."}</span>
            </label>
            <input id="poster-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            {/* AREA PREVIEW GAMBAR */}
            {preview && (
              <div className="mt-3 relative group">
                <div className="w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                  <img src={preview} alt="Preview" className="w-full h-full object-contain bg-gray-50" />
                </div>
                <button 
                  type="button" 
                  onClick={() => {setPreview(null); setForm({...form, poster: null})}}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:scale-110 transition"
                >
                  <X size={14} />
                </button>
                <p className="text-[10px] text-center mt-1 text-gray-400 font-bold uppercase tracking-tighter">
                  {form.poster ? "Preview File Baru" : "Gambar Terpasang"}
                </p>
              </div>
            )}
          </div>

            {/* Textarea Deskripsi */}
            <div className="flex flex-col md:col-span-2 lg:col-span-3">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                    Deskripsi
                </label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="4" // Menggunakan rows daripada h-24
                    placeholder="Masukkan deskripsi singkat tentang turnamen..."
                    className="border border-gray-300 p-3 rounded-lg focus:ring-3 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-200 shadow-sm resize-none"
                />
            </div>

            {/* Tombol Aksi */}
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-4 mt-4">
                {editingId && (
                    <button
                        type="button"
                        onClick={resetForm}
                        className="flex items-center bg-gray-500 text-white px-6 py-3 rounded-xl shadow-md hover:bg-gray-600 transition-colors duration-200"
                    >
                        Batal
                    </button>
                )}
                <button
                    type="submit"
                    className="flex items-center bg-yellow-500 text-gray-900 px-6 py-3 rounded-xl shadow-lg font-bold hover:bg-yellow-600 transition-colors duration-200 transform hover:scale-[1.01]"
                >
                    {editingId ? "Simpan Perubahan" : "Tambah Turnamen"}
                </button>
            </div>
        </form>
    </div>

    {/* --- TABEL SECTION --- */}
    <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-gray-300/50 pb-3">
        Daftar Turnamen Aktif
    </h2>
    <div className="overflow-x-auto shadow-2xl rounded-2xl border border-gray-100">
        <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider">
                <tr>
                    <th className="px-4 py-3 text-left border-b border-gray-200">Poster</th>
                    <th className="px-4 py-3 text-left border-b border-gray-200">Nama Turnamen</th>
                    <th className="px-4 py-3 text-left border-b border-gray-200">Tanggal Pelaksanaan</th>
                    <th className="px-4 py-3 text-left border-b border-gray-200 hidden sm:table-cell">Lokasi</th>
                    <th className="px-4 py-3 text-center border-b border-gray-200">Status</th>
                    <th className="px-4 py-3 text-center border-b border-gray-200">Aksi</th>
                </tr>
            </thead>
            <tbody>
                {tournaments.map((t) => (
                    <tr key={t.id} className="border-b border-gray-100 hover:bg-yellow-50/50 transition-colors">
                        <td className="px-4 py-3 text-center w-24">
                            {t.poster ? (
                                <img
                                    src={`${BASE_URL}/${t.poster}`}
                                    alt={t.name}
                                    className="h-16 w-16 object-cover mx-auto rounded-md shadow-md"
                                />
                            ) : (
                                <span className="text-gray-400 text-xs">N/A</span>
                            )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{t.name}</td>
                        <td className="px-4 py-3 text-gray-600">
                            {t.start_date} - {t.end_date}
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{t.location}</td>
                        <td className="px-4 py-3 text-center">
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                    t.status === "aktif" 
                                      ? "bg-green-100 text-green-700" 
                                      : "bg-red-100 text-red-700"
                                }`}
                            >
                                {t.status.toUpperCase()}
                            </span>
                        </td>
                        <td className="px-4 py-3 flex gap-2 justify-center">
                            <button
                                onClick={() => handleEdit(t)}
                                className="p-2 text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                                title="Edit"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={() => setConfirmDelete({ 
                                  show: true, 
                                  id: t.id, 
                                  name: t.name 
                                })}
                                className="p-2 text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                title="Hapus"
                            >
                                <Trash2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDownloadQR(t)}
                              className="p-2 text-purple-600 rounded-xl hover:bg-purple-100 transition-all duration-200 group"
                            >
                              <QrCode size={18} className="group-hover:scale-110 transition-transform" />
                            </button>

                        </td>
                    </tr>
                ))}
                {tournaments.length === 0 && (
                    <tr>
                        <td colSpan="6" className="p-5 text-center text-gray-500 italic bg-white">
                            Belum ada data turnamen yang tersedia.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
</div>
  );
}

export default Tournament;
