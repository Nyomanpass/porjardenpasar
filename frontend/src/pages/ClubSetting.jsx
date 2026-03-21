import { useState, useEffect, useRef } from "react";
import { PlusCircle, Edit, Image, Trash2 } from "lucide-react";
import api from "../api";
import AlertMessage from "../components/AlertMessage";

export default function ClubSetting() {
  const [clubList, setClubList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const formRef = useRef(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });


  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    leaderName: "",
    photo: null,
  });

  const [editingId, setEditingId] = useState(null);

  // ======================
  // PAGINATION
  // ======================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ======================
  // FETCH DATA
  // ======================
  const fetchClubs = async () => {
    try {
      const res = await api.get("/club/get");
      setClubList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  // ======================
  // FORM HANDLER
  // ======================
  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      leaderName: "",
      photo: null,
    });
    setEditingId(null);
    setPreviewImage(null);
  };

  const openForm = (club = null) => {
    if (club) {
      setFormData({
        name: club.name || "",
        address: club.address || "",
        phone: club.phone || "",
        leaderName: club.leaderName || "",
        photo: null,
      });

      setEditingId(club.idClub);

      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } else {
      resetForm();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("address", formData.address);
      fd.append("phone", formData.phone);
      fd.append("leaderName", formData.leaderName);
      if (formData.photo) fd.append("photo", formData.photo);

      if (editingId) {
        await api.put(`/club/update/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Club berhasil diperbarui");
      } else {
        await api.post("/club/create", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Club berhasil ditambahkan");
      }

      resetForm();
      fetchClubs();
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    setConfirmDelete({ show: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/club/delete/${confirmDelete.id}`);
      setSuccess("Club berhasil dihapus");
      fetchClubs();
    } catch (err) {
      setError("Gagal menghapus club");
    } finally {
      setConfirmDelete({ show: false, id: null });
    }
  };



  // ======================
  // PAGINATION LOGIC
  // ======================
  const totalPages = Math.ceil(clubList.length / itemsPerPage);
  const paginatedData = clubList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = startPage + maxButtons - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
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

      {/* Header */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-yellow-500/50 pb-3 flex items-center gap-2">
        <PlusCircle size={24} className="text-blue-600" />
        Tambah / Kelola Club
      </h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        ref={formRef}
        className="mb-8 flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Name */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Nama Club</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
              focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none"
              required
            />
          </div>

          {/* Address */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Alamat</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
              focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Telepon</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
              focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none"
            />
          </div>

          {/* Leader Name */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Nama Ketua</label>
            <input
              type="text"
              value={formData.leaderName}
              onChange={(e) =>
                setFormData({ ...formData, leaderName: e.target.value })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
              focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none"
            />
          </div>

          {/* Photo */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Foto</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, photo: e.target.files[0] })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
              focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            {editingId ? <Edit size={18} /> : <PlusCircle size={18} />}
            {editingId ? "Update" : "Tambah"}
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full text-sm table-fixed">
          <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-center w-12">No</th>
              <th className="px-5 py-3 text-left">Nama Club</th>
              <th className="px-5 py-3 text-left">Alamat</th>
              <th className="px-5 py-3 text-center w-28">Telepon</th>
              <th className="px-5 py-3 text-left">Ketua</th>
              <th className="px-5 py-3 text-center w-24">Foto</th>
              <th className="px-5 py-3 text-center w-32">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((c, i) => (
              <tr key={c.idClub} className="hover:bg-yellow-50/50">
                <td className="px-5 py-3 text-center">
                  {(currentPage - 1) * itemsPerPage + i + 1}
                </td>

                <td className="px-5 py-3 font-semibold text-left">{c.name}</td>

                <td className="px-5 py-3">{c.address || "-"}</td>

                <td className="px-5 py-3 text-center">{c.phone || "-"}</td>

                <td className="px-5 py-3">{c.leaderName || "-"}</td>

                <td className="px-5 py-3 text-center">
                  {c.photo ? (
                    <img
                      src={c.photo}
                      className="w-16 h-16 object-cover rounded mx-auto"
                    />
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-5 py-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => openForm(c)}
                      className="bg-yellow-500 text-white px-3 py-2 rounded-lg"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(c.idClub)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>

                    {c.photo && (
                      <button
                        onClick={() => setPreviewImage(c.photo)}
                        className="bg-blue-500 text-white px-3 py-2 rounded-lg"
                      >
                        <Image size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {visiblePages.map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-4 py-2 rounded ${
                currentPage === p
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* PREVIEW */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            className="max-h-[90vh] rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {confirmDelete.show && (
        <AlertMessage
          type="warning"
          message="Yakin ingin menghapus club ini? Data tidak bisa dikembalikan."
          onClose={() => setConfirmDelete({ show: false, id: null })}
        >
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-6">
            
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
