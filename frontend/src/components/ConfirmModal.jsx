import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({ show, title, message, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in">
        
        <div className="flex items-center gap-2 mb-3 text-yellow-600">
          <AlertTriangle />
          <h2 className="text-lg font-bold">{title || "Konfirmasi"}</h2>
        </div>

        <p className="text-gray-600 mb-6 text-sm">
          {message || "Apakah Anda yakin?"}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
          >
            Batal
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
