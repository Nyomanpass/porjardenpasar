import { useState, useEffect } from "react";
import { Trash2, Edit, Image, PlusCircle } from "lucide-react";
import api from "../api";
import { format } from "date-fns";
import { useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AlertMessage from "../components/AlertMessage";


export default function NewsSetting() {
  const [newsList, setNewsList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    image: null,
    tanggalUpload: format(new Date(), "yyyy-MM-dd")
  });
  const [editingId, setEditingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  const [formKey, setFormKey] = useState(0);
  const fileInputRef = useRef(null);




  const fetchNews = async () => {
    try {
      const res = await api.get("/news/get");
      setNewsList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      desc: "",
      image: null,
      tanggalUpload: format(new Date(), "yyyy-MM-dd"),
    });

    setEditingId(null);

    // 🔥 Reset file input secara manual
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // 🔥 Paksa React rebuild seluruh form
    setFormKey(prev => prev + 1);
  };


  const openForm = (news = null) => {
    if (news) {
      setFormData({
        title: news.title || "",
        desc: news.desc || "",
        image: null,
        tanggalUpload: news.tanggalUpload
          ? news.tanggalUpload.slice(0, 10)
          : format(new Date(), "yyyy-MM-dd"),
      });
      setEditingId(news.idNews);
           setTimeout(() => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
    } else {
      resetForm();
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("desc", formData.desc);
      fd.append("tanggalUpload", formData.tanggalUpload);
      if (formData.image) fd.append("image", formData.image);

      if (editingId) {
        await api.put(`/news/update/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("News berhasil diperbarui");
      } else {
        await api.post("/news/create", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("News berhasil ditambahkan");
      }

     
      resetForm();
      fetchNews();
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
      await api.delete(`/news/delete/${confirmDelete.id}`);
      setSuccess("News berhasil dihapus");
      fetchNews();
    } catch (err) {
      setError("Gagal menghapus news");
    } finally {
      setConfirmDelete({ show: false, id: null });
    }
  };



  // ======================
  // PAGINATION (MAX 5)
  // ======================
  const totalPages = Math.ceil(newsList.length / itemsPerPage);

  const paginatedNews = newsList.slice(
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

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
  ];

  const stripHtml = (html) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };



  return (
    <div className="bg-white shadow-2xl max-width-5xl rounded-2xl p-8 border border-gray-100">
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
        <PlusCircle size={24} className="text-blue-600" /> Tambah / Kelola News
      </h1>

      {/* Form */}
      <form
        key={formKey}
        onSubmit={handleSubmit}
        ref={formRef}
        className="mb-8 flex flex-col gap-4"
      >

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Judul
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Tanggal Upload
            </label>
            <input
              type="date"
              value={formData.tanggalUpload}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tanggalUpload: e.target.value,
                })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Gambar
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.files[0] })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col mt-4">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Deskripsi
          </label>

          <div className="border border-gray-300 rounded-xl shadow-sm 
                          focus-within:ring-2 focus-within:ring-yellow-500/70 
                          focus-within:border-yellow-500 transition overflow-hidden">

            <ReactQuill
              theme="snow"
              value={formData.desc}
              onChange={(value) =>
                setFormData({ ...formData, desc: value })
              }
              modules={modules}
              formats={formats}
              className="bg-white"
            />

          </div>
        </div>


        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-2"
          >
            {editingId ? <Edit size={18} /> : <PlusCircle size={18} />}
            {editingId ? "Update" : "Tambah"}
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">No</th>
              <th className="px-5 py-3 text-left">Judul</th>
              <th className="px-5 py-3 text-left">Deskripsi</th>
              <th className="px-5 py-3 text-left">Gambar</th>
              <th className="px-5 py-3 text-left">Tanggal Upload</th>
              <th className="px-5 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedNews.map((n, idx) => (
              <tr key={n.idNews} className="hover:bg-yellow-50/50 transition">
                <td className="px-5 py-3 font-medium text-gray-700">
                  {(currentPage - 1) * itemsPerPage + idx + 1}
                </td>
                <td className="px-5 py-3 font-semibold text-gray-800">
                  {n.title}
                </td>
                <td className="px-5 py-3 text-gray-700">
                  {stripHtml(n.desc).length > 100
                    ? stripHtml(n.desc).slice(0, 100) + "..."
                    : stripHtml(n.desc)}
                </td>

                <td className="px-5 py-3">
                  {n.image ? (
                    <img
                      src={n.image}
                      alt="news"
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-5 py-3 text-gray-500">
                  {n.tanggalUpload
                    ? format(new Date(n.tanggalUpload), "dd MMM yyyy")
                    : "-"}
                </td>
                <td className="px-5 py-3 flex gap-2 justify-center">
                  <button
                    onClick={() => openForm(n)}
                    className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg shadow-md transition"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(n.idNews)}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg shadow-md transition"
                  >
                    <Trash2 size={16} />
                  </button>
                  {n.image && (
                    <button
                      onClick={() => setPreviewImage(n.image)}
                      className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow-md transition"
                    >
                      <Image size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>

          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded hover:bg-gray-300 ${
                currentPage === page
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview News"
            className="max-h-[90vh] max-w-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {confirmDelete.show && (
        <AlertMessage
          type="warning"
          message="Yakin ingin menghapus news ini? Data tidak bisa dikembalikan."
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