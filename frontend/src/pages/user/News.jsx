// src/pages/News.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../api";

export default function News() {
  const [newsList, setNewsList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await api.get("/news/get");
      setNewsList(res.data);
    } catch (err) {
      console.error("Gagal fetch news:", err);
    }
  };

  const totalPages = Math.ceil(newsList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = newsList.slice(indexOfFirstItem, indexOfLastItem);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const stripHtml = (html) => {
      if (!html) return "";
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    };


  return (
    <>
      <Navbar />

      <section className="relative pb-16 bg-gray-50">
        {/* Header */}
    {/* HERO */}
<div className="relative w-full h-[260px] sm:h-[320px] md:h-[400px] mt-16 mb-10 sm:mb-14">
  <img
    src="/hero.jpg"
    alt="Berita Pelti Denpasar"
    className="w-full h-full object-cover"
  />
  <div className="absolute inset-0 bg-black/50"></div>

  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
      Berita Terbaru
    </h2>
    <p className="max-w-xl text-xs sm:text-sm md:text-base opacity-90">
      Ikuti perkembangan PELTI Denpasar terbaru melalui berita pilihan kami.
    </p>
  </div>
</div>

{/* CONTENT */}
<section className="bg-gray-50 py-10 sm:py-14">
  <div className="mx-auto px-4 sm:px-10 lg:px-20">

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 md:gap-10">
      {currentItems.map((item) => (
        <article
          key={item.idNews}
          className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md hover:shadow-xl transition duration-300 flex flex-col overflow-hidden"
        >
          {/* Gambar */}
          <div className="relative w-full overflow-hidden aspect-[16/10]">
            <img
              src={item.image || "/placeholder.png"}
              alt={item.title}
              className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Konten */}
          <div className="p-4 sm:p-6 flex flex-col flex-1">
            <time className="text-[10px] sm:text-xs md:text-sm text-yellow-600 font-semibold uppercase tracking-wide">
              {item.tanggalUpload
                ? new Date(item.tanggalUpload).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "-"}
            </time>

            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-900 mt-2 line-clamp-2">
              {item.title}
            </h3>

          <p className="text-xs sm:text-sm md:text-base text-gray-700 mt-2 sm:mt-3 flex-1 line-clamp-3">
            {stripHtml(item.desc).length > 120
              ? stripHtml(item.desc).slice(0, 120) + "..."
              : stripHtml(item.desc)}
          </p>

            <Link
              to={`/berita/${item.slug}`}
              className="mt-4 sm:mt-5 inline-flex items-center text-xs sm:text-sm md:text-base font-semibold text-yellow-600 hover:text-yellow-700 transition group"
            >
              Baca Selengkapnya
              <span className="ml-1 transform group-hover:translate-x-1 transition">
                →
              </span>
            </Link>
          </div>
        </article>
      ))}
    </div>

    {/* Pagination */}
    <div className="flex flex-wrap justify-center items-center gap-3 mt-10">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition ${
          currentPage === 1
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-yellow-500 hover:bg-yellow-600 text-white"
        }`}
      >
        Prev
      </button>

      <span className="text-xs sm:text-sm text-gray-600">
        Halaman {currentPage} dari {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-yellow-500 hover:bg-yellow-600 text-white"
        }`}
      >
        Next
      </button>
    </div>

  </div>
</section>


      </section>

      <Footer />
    </>
  );
}
