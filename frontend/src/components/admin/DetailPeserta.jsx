import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import { ArrowLeft, User, Phone, Calendar, Users, FileText, CheckCircle, X, Bell, XCircle, Send, Pencil } from "lucide-react";
import AlertMessage from "../AlertMessage";

export default function DetailPeserta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [peserta, setPeserta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  // State baru untuk fitur Tolak
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [newFotoKartu, setNewFotoKartu] = useState(null);
  const [newBuktiBayar, setNewBuktiBayar] = useState(null);
  const [previewFotoKartu, setPreviewFotoKartu] = useState(null);
  const [previewBuktiBayar, setPreviewBuktiBayar] = useState(null);
  const [kelompokUmurList, setKelompokUmurList] = useState([]);


  const [success, setSuccess] = useState("");
  const [errorAlert, setErrorAlert] = useState("");
  const [showVerifyConfirm, setShowVerifyConfirm] = useState(false);



const BASE_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    fetchPesertaDetail();
    fetchPendingTotal();
    fetchKelompokUmur();
  }, [id]);

  useEffect(() => {
    if (peserta) {
      setFormData({
        namaLengkap: peserta.namaLengkap,
        nomorWhatsapp: peserta.nomorWhatsapp,
        tanggalLahir: peserta.tanggalLahir,
        kelompokUmurId: peserta.kelompokUmurId,
      });
    }
  }, [peserta]);

  useEffect(() => {
    if (peserta) {
      setPreviewFotoKartu(`${BASE_URL}/${peserta.fotoKartu}`);
      setPreviewBuktiBayar(`${BASE_URL}/${peserta.buktiBayar}`);
    }
  }, [peserta]);


  const fetchKelompokUmur = async () => {
  try {
    const res = await api.get("/kelompok-umur");
    setKelompokUmurList(res.data);
  } catch (err) {
    console.error("Gagal ambil kelompok umur", err);
  }
};


  const fetchPesertaDetail = async () => {
    try {
      const res = await api.get(`/peserta/${id}`);
      setPeserta(res.data);
    } catch (err) {
      setError("Gagal mengambil data peserta.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingTotal = async () => {
    try {
      const res = await api.get("/peserta?status=pending");
      setPendingCount(res.data.length);
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async () => {
    try {
      const form = new FormData();
      form.append("namaLengkap", formData.namaLengkap);
      form.append("nomorWhatsapp", formData.nomorWhatsapp);
      form.append("tanggalLahir", formData.tanggalLahir);
      form.append("kelompokUmurId", formData.kelompokUmurId);

      if (newFotoKartu) {
        form.append("fotoKartu", newFotoKartu);
      }

      if (newBuktiBayar) {
        form.append("buktiBayar", newBuktiBayar);
      }

      await api.put(`/peserta/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSuccess("Data peserta berhasil diperbarui ✅");
      setIsEditing(false);
      fetchPesertaDetail();
    } catch (err) {
      console.error(err);
      setError("Gagal update peserta");
    }
  };



  const handleVerify = async () => {
  try {
    await api.put(`/peserta/${id}/verify`, { status: "verified" });
    setPeserta(p => ({ ...p, status: "verified" }));
    fetchPendingTotal();
    setSuccess(`Peserta ${peserta.namaLengkap} berhasil diverifikasi!`); 
    setShowVerifyConfirm(false);
  } catch (err) {
    console.error(err);
    setErrorAlert("Gagal memverifikasi peserta."); 
    setShowVerifyConfirm(false);
  }
};


  // HANDLER TOLAK (REJECT)
  const handleReject = async () => {
    if (!rejectMessage) {
      setErrorAlert("Mohon masukkan alasan penolakan.");
      return;
    }

    try {
      // 1. Update status di backend
      await api.put(`/peserta/${id}/verify`, { 
        status: "rejected", 
        alasan: rejectMessage 
      });

      // 2. Logika WhatsApp
      let phone = peserta.nomorWhatsapp;
      if (phone) {
        if (phone.startsWith("0")) phone = "62" + phone.slice(1);
        const text = `Halo *${peserta.namaLengkap}*,\n\nMohon maaf, pendaftaran Anda di PELTI Denpasar *DITOLAK* dengan alasan:\n\n_"${rejectMessage}"_\n\nSilakan melakukan pendaftaran ulang dengan data yang benar. Terima kasih.`;
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, "_blank");
      }

      setSuccess(`Peserta ${peserta.namaLengkap} berhasil ditolak dan WA disiapkan.`);
      navigate(-1); // Kembali ke list karena data sudah ditolak/dihapus
    } catch (error) {
      console.error(error);
      setError("Gagal memproses penolakan.");
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Memuat data...</div>;
  if (error || !peserta) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="mx-auto p-4 md:p-6 min-h-screen font-sans">
       
      {success && (
        <AlertMessage
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      {errorAlert && (
        <AlertMessage
          type="error"
          message={errorAlert}
          onClose={() => setErrorAlert("")}
        />
      )}

      {/* Modal Popup Gambar (Tetap sama) */}
      {modalImage && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4" onClick={() => setModalImage(null)}>
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalImage(null)} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"><X size={24} /></button>
            <div className="p-2"><img src={modalImage} alt="Preview" className="w-full max-h-[80vh] object-contain rounded-lg" /></div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black bg-white rounded-lg border border-gray-200 shadow-sm"><ArrowLeft size={18} /> Kembali</button>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
            <Bell size={18} /> <span className="text-sm font-bold">{pendingCount} Peserta Menunggu</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className={`h-4 ${peserta.status === 'verified' ? 'bg-green-500' : peserta.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>

        <div className="p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">
              {peserta.namaLengkap}
            </h1>
            <p className="text-gray-500 mt-1">
              Turnamen: <span className="font-semibold text-gray-800">
                {peserta.tournament?.name || "-"}
              </span>
            </p>

           
          </div>

          <div className="flex items-center gap-3">
            {/* Badge Status */}
            <div
              className={`px-6 py-2 rounded-full font-bold text-sm border shadow-sm ${
                peserta.status === "verified"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : peserta.status === "rejected"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
              }`}
            >
              {peserta.status.toUpperCase()}
            </div>

            {/* Button Edit */}
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 transition text-white px-4 py-2 rounded-xl shadow-md font-semibold"
            >
              <Pencil size={18} />
              Edit
            </button>
          </div>
        </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* KOLOM KIRI: DATA PRIBADI & AKSI */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><User size={20} className="text-blue-500" /> Data Pribadi</h2>
              <div className="grid gap-3">
               

                <InfoRow label="Whatsapp" value={peserta.nomorWhatsapp} icon={<Phone size={16}/>} />
                <InfoRow label="Tgl Lahir" value={new Date(peserta.tanggalLahir).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })} icon={<Calendar size={16}/>} />
                <InfoRow label="Kelompok Umur" value={peserta.kelompokUmur?.nama || "Umum"} icon={<Users size={16}/>} />
              </div>

              {/* TOMBOL AKSI VERIFIKASI / TOLAK */}
              {peserta.status === "pending" && (
                <div className="mt-8 space-y-4">
                  {!isRejecting ? (
                    <div className="flex gap-4">
                      <button onClick={() => setShowVerifyConfirm(true)} className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 shadow-lg transition-transform active:scale-95">
                        <CheckCircle size={22} /> Verifikasi
                      </button>
                      <button onClick={() => setIsRejecting(true)} className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 shadow-lg transition-transform active:scale-95">
                        <XCircle size={22} /> Tolak
                      </button>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-red-700 mb-2">Alasan Penolakan:</label>
                      <textarea 
                        className="w-full p-3 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm"
                        placeholder="Contoh: Bukti transfer tidak terbaca / palsu..."
                        rows="3"
                        value={rejectMessage}
                        onChange={(e) => setRejectMessage(e.target.value)}
                      />
                      <div className="flex gap-2 mt-3">
                        <button onClick={handleReject} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700">
                          <Send size={18}/> Kirim & WA
                        </button>
                        <button onClick={() => setIsRejecting(false)} className="px-5 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300">Batal</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* KOLOM KANAN: DOKUMEN */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FileText size={20} className="text-orange-500" /> Dokumen</h2>
              <div className="flex flex-col gap-4">
                <DocButton label="Bukti Pembayaran" path={peserta.buktiBayar} baseUrl={BASE_URL} onOpen={setModalImage} color="bg-emerald-600" />
                <DocButton label="Kartu Identitas (KK/KTP)" path={peserta.fotoKartu} baseUrl={BASE_URL} onOpen={setModalImage} color="bg-blue-600" />
              </div>
            </div>
          </div>
          
        </div>
      </div>
              {isEditing && (
  <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
    <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100 w-full max-w-3xl relative animate-in fade-in zoom-in">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-blue-500/40 pb-3 flex items-center gap-2">
        Edit Data Peserta
      </h1>

      {/* CLOSE */}
      <button
        onClick={() => setIsEditing(false)}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 transition text-white px-3 py-1 rounded-lg shadow-md"
      >
        ✕
      </button>

      {/* FORM */}
      <div className="grid md:grid-cols-2 gap-6">

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
          <input
            value={formData.namaLengkap}
            onChange={(e)=>setFormData({...formData, namaLengkap:e.target.value})}
            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 outline-none shadow-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">Nomor Whatsapp</label>
          <input
            value={formData.nomorWhatsapp}
            onChange={(e)=>setFormData({...formData, nomorWhatsapp:e.target.value})}
            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 outline-none shadow-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">Tanggal Lahir</label>
          <input
            type="date"
            value={formData.tanggalLahir}
            onChange={(e)=>setFormData({...formData, tanggalLahir:e.target.value})}
            className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm"
          />
        </div>

      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-1">
          Kelompok Umur
        </label>
        <select
          value={formData.kelompokUmurId}
          onChange={(e)=>setFormData({...formData, kelompokUmurId: e.target.value})}
          className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/70"
        >
          <option value="">-- Pilih Kelompok Umur --</option>
          {kelompokUmurList.map((ku) => (
            <option key={ku.id} value={ku.id}>
              {ku.nama}
            </option>
          ))}
        </select>
      </div>


      </div>

      {/* PREVIEW FILE */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">

        <div>
          <p className="text-sm font-bold text-gray-700 mb-2">Foto Kartu</p>
          <div className="border rounded-xl p-3 bg-gray-50 shadow-inner">
            <img
              src={previewFotoKartu}
              className="w-full h-48 object-contain rounded"
            />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e)=>{
              setNewFotoKartu(e.target.files[0]);
              setPreviewFotoKartu(URL.createObjectURL(e.target.files[0]));
            }}
            className="mt-3"
          />
        </div>

        <div>
          <p className="text-sm font-bold text-gray-700 mb-2">Bukti Pembayaran</p>
          <div className="border rounded-xl p-3 bg-gray-50 shadow-inner">
            <img
              src={previewBuktiBayar}
              className="w-full h-48 object-contain rounded"
            />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e)=>{
              setNewBuktiBayar(e.target.files[0]);
              setPreviewBuktiBayar(URL.createObjectURL(e.target.files[0]));
            }}
            className="mt-3"
          />
        </div>

      </div>

      {/* BUTTON */}
      <div className="flex justify-end gap-3 mt-10">
        <button
          onClick={() => setIsEditing(false)}
          className="bg-gray-300 hover:bg-gray-400 transition px-6 py-3 rounded-xl font-semibold"
        >
          Batal
        </button>

        <button
          onClick={handleUpdate}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-xl shadow-lg font-semibold"
        >
          Simpan Perubahan
        </button>
      </div>

    </div>
  </div>
)}

{showVerifyConfirm && (
  <AlertMessage
    type="warning"
    message={`Pastikan data dan dokumen ${peserta.namaLengkap} sudah sesuai. Setelah diverifikasi, peserta akan masuk ke daftar siap tanding.`}
    onClose={() => setShowVerifyConfirm(false)}
  >
    <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
      <button
        onClick={() => setShowVerifyConfirm(false)}
        className="flex-1 order-2 sm:order-1 min-h-[56px] px-8 py-4 rounded-2xl bg-gray-100 text-gray-800 font-black text-sm uppercase tracking-tighter hover:bg-gray-200 active:scale-95 transition-all"
      >
        Batal
      </button>
      <button
        onClick={handleVerify}
        className="flex-1 order-1 sm:order-2 min-h-[56px] px-8 py-4 rounded-2xl bg-green-600 text-white font-black text-sm uppercase tracking-tighter shadow-[0_10px_20px_rgba(22,163,74,0.3)] hover:bg-green-700 active:scale-95 transition-all"
      >
        Ya, Verifikasi
      </button>
    </div>
  </AlertMessage>
)}


    </div>
  );
}

// Komponen Pembantu (InfoRow & DocButton) sama dengan sebelumnya...
function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-2 bg-white rounded-lg text-blue-600">{icon}</div>
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400">{label}</p>
        <p className="text-gray-800 font-bold">{value}</p>
      </div>
    </div>
  );
}

function DocButton({ label, path, baseUrl, onOpen, color }) {
  const isExist = !!path;
  return (
    <button onClick={() => isExist && onOpen(`${baseUrl}/${path}`)} disabled={!isExist} className={`flex items-center justify-between w-full p-5 rounded-2xl font-bold transition-all ${isExist ? `${color} text-white shadow-md hover:scale-[1.01]` : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
      <div className="flex items-center gap-3"><FileText size={20} /><span>{label}</span></div>
      <span className="text-[10px] bg-white/20 px-2 py-1 rounded">{isExist ? "LIHAT" : "N/A"}</span>
    </button>
  );
}