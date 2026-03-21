import { useState, useEffect } from "react";
import api from "../../api"; // Mengimpor instans axios dari file api.js

function PesertaModal({ match, kelompokUmurId, onClose, onSaved }) {
  const [peserta1Id, setPeserta1Id] = useState(match.peserta1Id || "");
  const [peserta2Id, setPeserta2Id] = useState(match.peserta2Id || "");
  const [pesertaList, setPesertaList] = useState([]);

  useEffect(() => {
    if (!kelompokUmurId) return;

    const fetchPeserta = async () => {
      try {
        const res = await api.get("/pesertafilter", {
          params: {
            kelompokUmurId: kelompokUmurId,
            status: "verified",
          },
        });
        setPesertaList(res.data);
      } catch (err) {
        console.error("Gagal fetch peserta:", err);
      }
    };

    fetchPeserta();
  }, [kelompokUmurId]);

  const save = async () => {
    try {
      const res = await api.patch(`/${match.id}/peserta`, {
        peserta1Id,
        peserta2Id,
      });

      // Axios akan melempar error untuk status non-2xx, jadi cukup cek di sini.
      if (res.status === 200) {
        onSaved();
      } else {
        throw new Error("Gagal menyimpan peserta.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded shadow w-96">
        <h3 className="font-bold mb-3">Atur Peserta Match #{match.id}</h3>

        {/* Peserta 1 */}
        <label className="block text-sm mb-1">Peserta 1</label>
        <select
          className="border p-2 w-full mb-2"
          value={peserta1Id || ""}
          onChange={(e) => setPeserta1Id(e.target.value === "" ? null : Number(e.target.value))}
        >
          <option value="">Pilih Peserta 1</option>
          <option value="">BYE</option> {/* Opsi "BYE" */}
          {pesertaList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.namaLengkap}
            </option>
          ))}
        </select>

        {/* Peserta 2 */}
        <label className="block text-sm mb-1">Peserta 2</label>
        <select
          className="border p-2 w-full mb-2"
          value={peserta2Id || ""}
          onChange={(e) => setPeserta2Id(e.target.value === "" ? null : Number(e.target.value))}
        >
          <option value="">Pilih Peserta 2</option>
          <option value="">BYE</option> {/* Opsi "BYE" */}
          {pesertaList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.namaLengkap}
            </option>
          ))}
        </select>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-3">
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">
            Batal
          </button>
          <button onClick={save} className="px-3 py-1 bg-blue-600 text-white rounded">
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

export default PesertaModal;
