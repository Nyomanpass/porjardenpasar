import { useState, useEffect } from "react";
import api from "../api";

export default function News() {
  const [newsList, setNewsList] = useState([]);
  const [maxNews, setMaxNews] = useState(3);
  const [loading, setLoading] = useState(true);

  /* ===== Fetch News Asli ===== */
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await api.get("/news/get");
      setNewsList(res.data || []);
    } catch (err) {
      console.error("Gagal fetch news:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===== Handle Resize (ZOOM / LAYAR BESAR) ===== */
  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      if (width >= 1536) {
        setMaxNews(8);
      } else {
        setMaxNews(3);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const displayedNews = newsList.slice(0, maxNews);

  const getGridCols = () => {
    if (maxNews === 8) return "grid-cols-1 sm:grid-cols-1 xl:grid-cols-4";
    return "grid-cols-1 sm:grid-cols-1 lg:grid-cols-3";
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Memuat berita...
      </div>
    );
  }

  const stripHtml = (html) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };


  return (
    <section className="w-full py-8 sm:py-12">
      {/* ===== Header ===== */}
      <header className="text-center mb-8 sm:mb-12">
        <p className="text-sm md:text-base text-yellow-600 font-medium tracking-wide uppercase">
          PELTI DENPASAR
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-2">
          Berita Terbaru
        </h2>
      </header>

      {/* ===== Grid Berita ===== */}
      <div className="px-4 sm:px-10 lg:px-20">
        <div className={`grid gap-0 sm:gap-8 md:gap-10 ${getGridCols()}`}>
          {displayedNews.map((b) => (
            <article
              key={b.idNews}
              className="bg-white shadow-sm sm:shadow-md rounded-md sm:rounded-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 mb-3 sm:mb-0"
            >
              {/* Gambar */}
              <div className="relative w-full overflow-hidden aspect-[16/10]">
                <img
                  src={b.image || "/placeholder.png"}
                  alt={b.title}
                  className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Konten */}
              <div className="p-6 flex flex-col flex-1">
                <time className="text-xs md:text-sm text-yellow-600 font-semibold uppercase tracking-wide">
                  {b.tanggalUpload
                    ? new Date(b.tanggalUpload).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </time>

                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mt-2 line-clamp-2">
                  {b.title}
                </h3>

                <p className="text-sm md:text-base text-gray-700 mt-3 flex-1 line-clamp-3">
                  {stripHtml(b.desc).length > 120
                    ? stripHtml(b.desc).slice(0, 120) + "..."
                    : stripHtml(b.desc)}
                </p>


                <button
                  onClick={() => window.location.href = `/berita/${b.slug}`}
                  className="mt-5 inline-flex items-center justify-start text-sm md:text-base font-semibold text-yellow-600 hover:text-yellow-700 transition-colors group"
                >
                  Baca Selengkapnya
                  <span className="ml-1 transform group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ===== Lihat Selengkapnya ===== */}
      <div className="mt-8 sm:mt-12 text-center px-4 sm:px-6 md:px-8 lg:px-12">
        <a
          href="/berita"
          className="text-sm md:text-base text-gray-600 hover:text-yellow-600 underline underline-offset-4 transition-colors"
        >
          Lihat Selengkapnya
        </a>
      </div>
    </section>
  );
}
