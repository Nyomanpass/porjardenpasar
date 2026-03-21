import { X, CheckCircle, XCircle, UserCheck, Eye, Send } from "lucide-react"; 
import { useState } from "react";
import AlertMessage from "../components/AlertMessage";

export default function VerificationDrawer({ 
  isOpen, 
  onClose, 
  pendingUsers, 
  onVerify, 
  onReject,
  onViewDetail
}) {
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectMessage, setRejectMessage] = useState("");
  const [confirmVerifyData, setConfirmVerifyData] = useState(null); // Ubah jadi object untuk ambil nama

  const [success, setSuccess] = useState("");
  const [errorAlert, setErrorAlert] = useState("");
  const [warning, setWarning] = useState("");

  const drawerClasses = isOpen ? "translate-x-0" : "translate-x-full";

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length > 1) return (parts[0][0] + parts.at(-1)[0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const cancelReject = () => {
    setRejectingId(null);
    setRejectMessage("");
  };

  return (
    <>
      {/* Toast Notifications (Pojok Kanan Atas) */}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess("")} />}
      {errorAlert && <AlertMessage type="error" message={errorAlert} onClose={() => setErrorAlert("")} />}
      {warning && <AlertMessage type="warning" message={warning} onClose={() => setWarning("")} />}

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99]" onClick={onClose}></div>
      )}

      <div className={`fixed top-0 right-0 w-full sm:w-[30rem] bg-white h-full shadow-2xl z-[100] p-0 
        transition-transform duration-500 ease-in-out ${drawerClasses}`}>
        
        {/* HEADER */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <UserCheck size={24} className="text-yellow-600"/> Verifikasi Peserta
            </h2>
            <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest mt-1">
              {pendingUsers?.length || 0} Peserta Menunggu
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* LIST */}
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-110px)] pb-20">
          {pendingUsers && pendingUsers.length > 0 ? (
            pendingUsers.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-yellow-100">
                    {getInitials(p.namaLengkap)} 
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-gray-800 truncate group-hover:text-yellow-600 transition-colors">
                      {p.namaLengkap}
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                      {p.nomorWhatsapp || "No Whatsapp -"}
                    </p>
                  </div>
                  <button 
                      onClick={() => onViewDetail(p.id)}
                      className="p-2 bg-gray-50 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all h-fit"
                    >
                      <Eye size={18}/>
                  </button>
                </div>

                {rejectingId === p.id ? (
                  <div className="mt-3 p-4 bg-red-50 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-red-700 uppercase mb-2 block">Alasan Penolakan</label>
                    <textarea 
                      className="w-full p-3 text-sm border-2 border-red-100 rounded-xl focus:border-red-500 outline-none font-medium"
                      placeholder="Contoh: Bukti transfer tidak valid..."
                      rows="3"
                      value={rejectMessage}
                      onChange={(e) => setRejectMessage(e.target.value)}
                    />
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={async () => {
                          if (!rejectMessage) {
                             setErrorAlert("Mohon masukkan alasan penolakan.");
                            return;
                          }
                          try {
                            await onReject(p.id, rejectMessage);
                            setSuccess(`Pendaftaran ${p.namaLengkap} ditolak.`);
                            cancelReject();
                          } catch {setErrorAlert(`Gagal menolak ${p.namaLengkap}. Silakan coba lagi.`); }
                        }}
                        className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-200"
                      >
                        Tolak & WA
                      </button>
                      <button onClick={cancelReject} className="px-4 py-3 bg-white text-gray-500 rounded-xl font-black text-[10px] uppercase border border-gray-200">
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 border-t border-gray-50 pt-4">
                    <button 
                      onClick={() => setConfirmVerifyData(p)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
                    >
                      <CheckCircle size={16}/> Verifikasi
                    </button>
                    <button 
                      onClick={() => setRejectingId(p.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-white text-red-600 border-2 border-red-50 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95"
                    >
                      <XCircle size={16}/> Tolak
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 m-4">
              <UserCheck size={48} className="mx-auto mb-4 text-gray-300"/>
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Semua Bersih!</p>
              <p className="text-[10px] text-gray-400 mt-1">Tidak ada peserta pending.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL KONFIRMASI RAKSASA (Sama dengan Bagan & Peserta) */}
      {confirmVerifyData && (
        <AlertMessage
          type="warning"
          message={`Pastikan data dan dokumen ${confirmVerifyData.namaLengkap} sudah sesuai. Setelah diverifikasi, peserta akan masuk ke daftar siap tanding.`}
          onClose={() => setConfirmVerifyData(null)}
        >
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
            <button
              onClick={() => setConfirmVerifyData(null)}
              className="flex-1 order-2 sm:order-1 min-h-[56px] px-8 py-4 rounded-2xl bg-gray-100 text-gray-800 font-black text-sm uppercase tracking-tighter hover:bg-gray-200 active:scale-95 transition-all"
            >
              Batal
            </button>
            <button
              onClick={async () => {
                try {
                  await onVerify(confirmVerifyData.id);
                  setSuccess(`${confirmVerifyData.namaLengkap} berhasil diverifikasi!`);
                  setConfirmVerifyData(null);
                } catch {
                  setErrorAlert("Gagal memverifikasi.");
                  setConfirmVerifyData(null);
                }
              }}
              className="flex-1 order-1 sm:order-2 min-h-[56px] px-8 py-4 rounded-2xl bg-green-600 text-white font-black text-sm uppercase tracking-tighter shadow-[0_10px_20px_rgba(22,163,74,0.3)] hover:bg-green-700 active:scale-95 transition-all"
            >
              Ya, Verifikasi
            </button>
          </div>
        </AlertMessage>
      )}
    </>
  );
}