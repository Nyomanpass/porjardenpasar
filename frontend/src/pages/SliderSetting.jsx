import { useState, useEffect } from "react";
import { PlusCircle, Edit, Image, Trash2 } from "lucide-react";
import api from "../api";
import { useRef } from "react";
import AlertMessage from "../components/AlertMessage";

export default function SliderSetting() {
  const [sliderList, setSliderList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const formRef = useRef(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });



  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ctaText: "",
    ctaLink: "",
    urutan: 1,
    isActive: true,
    image: null,
  });

  const [editingId, setEditingId] = useState(null);

  // ======================
  // PAGINATION
  // ======================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchSlider = async () => {
    try {
      const res = await api.get("/slider/get");
      setSliderList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSlider();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      ctaText: "",
      ctaLink: "",
      urutan: 1,
      isActive: true,
      image: null,
    });
    setEditingId(null);
    setPreviewImage(null);
  };

  const openForm = (slider = null) => {
    if (slider) {
      setFormData({
        title: slider.title || "",
        description: slider.description || "",
        ctaText: slider.ctaText || "",
        ctaLink: slider.ctaLink || "",
        urutan: slider.urutan || 1,
        isActive: slider.isActive ?? true,
        image: null,
      });
   
      setEditingId(slider.idSlider);
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
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("ctaText", formData.ctaText);
      fd.append("ctaLink", formData.ctaLink);
      fd.append("urutan", formData.urutan);
      fd.append("isActive", formData.isActive);
      if (formData.image) fd.append("image", formData.image);

      if (editingId) {
        await api.put(`/slider/update/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Slider berhasil diperbarui");
      } else {
        await api.post("/slider/create", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Slider berhasil ditambahkan");
      }

      resetForm();
      fetchSlider();
      setCurrentPage(1);

    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan slider");
    }
  };


  const handleDelete = (id) => {
    setConfirmDelete({ show: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/slider/delete/${confirmDelete.id}`);
      setSuccess("Slider berhasil dihapus");
      fetchSlider();
    } catch (err) {
      setError("Gagal menghapus slider");
    } finally {
      setConfirmDelete({ show: false, id: null });
    }
  };



  // ======================
  // PAGINATION LOGIC
  // ======================
  const totalPages = Math.ceil(sliderList.length / itemsPerPage);
  const paginatedData = sliderList.slice(
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
        Tambah / Kelola Slider
      </h1>

      {/* Form */}
      <form onSubmit={handleSubmit}   ref={formRef} className="mb-8 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["Judul", "title"],
            ["CTA Text", "ctaText"],
            ["CTA Link", "ctaLink"],
          ].map(([label, key]) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm font-semibold mb-1">{label}</label>
              <input
                type="text"
                value={formData[key]}
                onChange={(e) =>
                  setFormData({ ...formData, [key]: e.target.value })
                }
                className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
             focus:ring-2 focus:ring-yellow-500/70 
             focus:border-yellow-500 outline-none w-full"
                required
              />
            </div>
          ))}

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Urutan</label>
            <input
              type="number"
              value={formData.urutan}
              onChange={(e) =>
                setFormData({ ...formData, urutan: e.target.value })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
             focus:ring-2 focus:ring-yellow-500/70 
             focus:border-yellow-500 outline-none w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Gambar</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.files[0] })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
             focus:ring-2 focus:ring-yellow-500/70 
             focus:border-yellow-500 outline-none w-full"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Deskripsi</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
             focus:ring-2 focus:ring-yellow-500/70 
             focus:border-yellow-500 outline-none w-full"
            required
          />
        </div>

        <div className="flex justify-end">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            {editingId ? <Edit size={18} /> : <PlusCircle size={18} />}
            {editingId ? "Update" : "Tambah"}
          </button>
        </div>
      </form>

<div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
  <table className="min-w-full text-sm table-fixed">
    <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
      <tr>
        <th className="px-5 py-3 text-center w-12">No</th>
        <th className="px-5 py-3 text-left">Judul</th>
        <th className="px-5 py-3 text-left w-64">Deskripsi</th>
        <th className="px-5 py-3 text-left w-40">CTA Text</th>
        <th className="px-5 py-3 text-left w-52">CTA Link</th>
        <th className="px-5 py-3 text-center w-24">Gambar</th>
        <th className="px-5 py-3 text-center w-20">Urutan</th>
        <th className="px-5 py-3 text-center w-32">Aksi</th>
      </tr>
    </thead>

    <tbody className="divide-y">
      {paginatedData.map((s, i) => (
        <tr key={s.idSlider} className="hover:bg-yellow-50/50">
          <td className="px-5 py-3 text-center">
            {(currentPage - 1) * itemsPerPage + i + 1}
          </td>

          <td className="px-5 py-3 font-semibold text-left">
            {s.title}
          </td>

          <td className="px-5 py-3 text-left text-gray-700">
            {s.description
              ? s.description.length > 80
                ? s.description.slice(0, 80) + "..."
                : s.description
              : "-"}
          </td>

          <td className="px-5 py-3 text-left">
  {s.ctaText || "-"}
</td>

<td className="px-5 py-3 text-left break-all">
  {s.ctaLink ? (
    <a
      href={s.ctaLink}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline"
    >
      {s.ctaLink}
    </a>
  ) : (
    "-"
  )}
</td>


          <td className="px-5 py-3 text-center">
            {s.image ? (
              <img
                src={s.image}
                className="w-16 h-16 object-cover rounded mx-auto"
              />
            ) : (
              "-"
            )}
          </td>

          <td className="px-5 py-3 text-center">
            {s.urutan}
          </td>

          <td className="px-5 py-3">
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => openForm(s)}
                className="bg-yellow-500 text-white px-3 py-2 rounded-lg"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(s.idSlider)}
                className="bg-red-600 text-white px-3 py-2 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
              {s.image && (
                <button
                  onClick={() => setPreviewImage(s.image)}
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


      {/* Pagination */}
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

      {/* Preview */}
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
          message="Yakin ingin menghapus slider ini? Data tidak bisa dikembalikan."
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
