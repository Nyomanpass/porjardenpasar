import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

export default function NewsDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [news, setNews] = useState(null);
  const [newsLain, setNewsLain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      setError("Slug news tidak ditemukan di URL");
      setLoading(false);
      return;
    }

    fetchNewsDetail();
    fetchNewsLain();
  }, [slug]);

  const fetchNewsDetail = async () => {
    try {
      const res = await api.get(`/news/slug/${slug}`);
      setNews(res.data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "News tidak ditemukan"
          : "Gagal mengambil data news"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsLain = async () => {
    try {
      const res = await api.get(`/news/get`);
      const others = res.data.filter(
        (n) => n.slug !== slug
      );
      setNewsLain(others.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="py-32 text-center text-gray-500">Memuat news...</div>;
  }

  if (error) {
    return (
      <div className="py-32 text-center text-red-500">
        {error}
        <br />
        <button
          onClick={() => navigate("/berita")}
          className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Kembali ke News
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      {/* HERO */}
       <div className="relative w-full h-[260px] sm:h-[320px] md:h-[400px] mt-16">
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
      <section className="bg-gray-50 py-10 sm:py-16">
        <div className="px-4 sm:px-10 lg:px-20 mx-auto px-4 sm:px-8 lg:px-12">

          {/* Breadcrumb */}
          <div className="text-xs sm:text-sm mb-6 text-gray-500">
            <Link to="/" className="hover:text-yellow-600">Home</Link> /{" "}
            <Link to="/berita" className="hover:text-yellow-600">Berita</Link> /{" "}
            <span className="text-gray-700 font-medium">Detail</span>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

            {/* MAIN */}
            <article className="lg:col-span-8 bg-white rounded-xl shadow-sm p-4 sm:p-6 md:p-8">
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                {news.title}
              </h1>

              <div className="mt-3 text-[10px] sm:text-xs md:text-sm text-gray-500">
                <span className="mr-4">
                  {new Date(news.tanggalUpload).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span>Oleh: {news.penulis || "Admin PELTI Denpasar"}</span>
              </div>

              <div className="mt-5 w-full h-52 sm:h-72 md:h-[380px] rounded-xl overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
              </div>

                <div
                  className="prose prose-sm sm:prose-base lg:prose-lg max-w-none mt-6 text-justify"
                  dangerouslySetInnerHTML={{ __html: news.desc }}
                />

            </article>

            {/* SIDEBAR */}
            <aside className="lg:col-span-4 space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                News Lainnya
              </h3>

              {newsLain.map((item) => (
                <Link
                  key={item.idNews}
                  to={`/berita/${item.slug}`}
                  className="flex gap-3 bg-white p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition"
                >
                  <div className="w-20 sm:w-24 h-16 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] sm:text-xs text-yellow-600 font-semibold">
                      {new Date(item.tanggalUpload).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </aside>
          </div>

        </div>
      </section>


      <Footer/>
    </>
  );
}
