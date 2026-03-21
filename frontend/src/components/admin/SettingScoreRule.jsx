import { useEffect, useState } from "react";
import api from "../../api";
import { Settings as SettingsIcon } from "lucide-react"; // Import dengan alias agar tidak bentrok dengan nama komponen
import AlertMessage from "../AlertMessage";

export default function SettingScoreRule() {

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
  const [editId, setEditId] = useState(null);


  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({
    name: "",
    jumlahSet: 0,
    gamePerSet: 0,
    useDeuce: true,
    tieBreakPoint: 0,
    finalTieBreakPoint: 0
  });

  const fetchRules = async () => {
    const res = await api.get("/score-rules");
    setRules(res.data);
  };

  useEffect(() => {
    fetchRules();
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (editId) {
      // 🔥 UPDATE MODE
      await api.put(`/score-rules/${editId}`, form);
      setSuccess("Score rule berhasil diperbarui");
    } else {
      // 🔥 CREATE MODE
      await api.post("/score-rules", form);
      setSuccess("Score rule berhasil ditambahkan");
    }

    fetchRules();
    resetForm();

  } catch (err) {
    setError("Terjadi kesalahan saat menyimpan rule");
  }
};


const resetForm = () => {
  setForm({
    name: "",
    jumlahSet: 3,
    gamePerSet: 6,
    useDeuce: true,
    tieBreakPoint: 7,
    finalTieBreakPoint: 10
  });
  setEditId(null);
};

const handleEdit = (rule) => {
  setForm({
    name: rule.name,
    jumlahSet: rule.jumlahSet,
    gamePerSet: rule.gamePerSet,
    useDeuce: rule.useDeuce,
    tieBreakPoint: rule.tieBreakPoint,
    finalTieBreakPoint: rule.finalTieBreakPoint
  });

  setEditId(rule.id);
};

  const handleDelete = async (id) => {
    setConfirmDelete({ show: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/score-rules/${confirmDelete.id}`);
      setSuccess("Score rule berhasil dihapus");
      fetchRules();
    } catch (err) {
      setError("Gagal menghapus score rule, masih digunakan di pertandingan");
    } finally {
      setConfirmDelete({ show: false, id: null });
    }
  };



  return (
    <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100 mt-10">
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

  <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-yellow-500/50 pb-3 flex items-center gap-2">
    <SettingsIcon 
      size={24} 
      className="text-blue-600 group-hover:rotate-90 transition-transform duration-500" 
    />
    Settings Score Rules
  </h1>

  {/* FORM */}
  <form onSubmit={handleSubmit} className="mb-8 flex flex-wrap gap-4 items-end">

    <div className="flex flex-col flex-grow">
      <label className="text-sm font-semibold text-gray-700 mb-1">
        Nama Rule
      </label>
      <input
        placeholder="Contoh: BO3 Super Tiebreak"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
        required
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-1">
        Jumlah Set
      </label>
      <input
        type="number"
        value={form.jumlahSet}
        onChange={e => setForm({ ...form, jumlahSet: e.target.value })}
        className="border border-gray-300 px-4 py-3 rounded-xl w-32 shadow-sm"
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-1">
        Game per Set
      </label>
      <input
        type="number"
        value={form.gamePerSet}
        onChange={e => setForm({ ...form, gamePerSet: e.target.value })}
        className="border border-gray-300 px-4 py-3 rounded-xl w-32 shadow-sm"
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-1">
        Tie Break
      </label>
      <input
        type="number"
        value={form.tieBreakPoint}
        onChange={e => setForm({ ...form, tieBreakPoint: e.target.value })}
        className="border border-gray-300 px-4 py-3 rounded-xl w-32 shadow-sm"
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-1">
        Final Tie Break
      </label>
      <input
        type="number"
        value={form.finalTieBreakPoint}
        onChange={e => setForm({ ...form, finalTieBreakPoint: e.target.value })}
        className="border border-gray-300 px-4 py-3 rounded-xl w-36 shadow-sm"
      />
    </div>

    <div className="flex items-center gap-2 mt-6">
      <input
        type="checkbox"
        checked={form.useDeuce}
        onChange={e => setForm({ ...form, useDeuce: e.target.checked })}
      />
      <span className="text-sm font-semibold text-gray-700">Pakai Deuce</span>
    </div>

    {editId && (
      <button
        type="button"
        onClick={resetForm}
        className="bg-gray-400 hover:bg-gray-500 transition text-white px-6 py-3 rounded-xl shadow-lg font-semibold ml-3"
      >
        Batal Edit
      </button>
    )}
    <button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-xl shadow-lg font-semibold"
    >
      {editId ? "Update Rule" : "Simpan Rule"}
    </button>

  </form>

  {/* TABLE */}
  <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
    <table className="min-w-full text-sm">
    <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
      <tr>
      <th className="px-5 py-3 text-left">Nama</th>
      <th className="px-5 py-3 text-center">Set</th>
      <th className="px-5 py-3 text-center">Game</th>
      <th className="px-5 py-3 text-center">TB</th>
      <th className="px-5 py-3 text-center">Final TB</th>
      <th className="px-5 py-3 text-center">Deuce</th>
      <th className="px-5 py-3 text-center">Aksi</th>
      </tr>
      </thead>

      <tbody className="divide-y divide-gray-100 bg-white">
        {rules.map(r => (
          <tr key={r.id} className="hover:bg-yellow-50/50 transition">
            <td className="px-5 py-3 font-semibold text-gray-800">{r.name}</td>
            <td className="px-5 py-3 text-center">{r.jumlahSet}</td>
            <td className="px-5 py-3 text-center">{r.gamePerSet}</td>
            <td className="px-5 py-3 text-center">{r.tieBreakPoint}</td>
            <td className="px-5 py-3 text-center">{r.finalTieBreakPoint}</td>
            <td className="px-5 py-3 text-center">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold
                ${r.useDeuce ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {r.useDeuce ? "Ya" : "Tidak"}
              </span>
            </td>
            <td className="px-5 py-3 text-center">
              <td className="px-5 py-3 text-center flex gap-2 justify-center">
                <button
                  onClick={() => handleEdit(r)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-md transition"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(r.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition"
                >
                  Hapus
                </button>
              </td>
            </td>
          </tr>
        ))}

        {rules.length === 0 && (
          <tr><td colSpan="7" className="text-center py-5 text-gray-500 italic">
          Belum ada score rule.
          </td></tr>
        )}
      </tbody>
    </table>
  </div>
  {confirmDelete.show && (
  <AlertMessage
    type="warning"
    message="Yakin ingin menghapus score rule ini? Data tidak bisa dikembalikan."
    onClose={() => setConfirmDelete({ show: false, id: null })}
  >
    <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
      
      <button
        onClick={() => setConfirmDelete({ show: false, id: null })}
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
