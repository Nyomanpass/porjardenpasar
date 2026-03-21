import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../api";

export default function Club() {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);

  // ======================
  // FETCH CLUB
  // ======================
  const fetchClubs = async () => {
    try {
      const res = await api.get("/club/get");
      setClubs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  return (
    <>
      <Navbar />

      {/* ================= HERO ================= */}
      {/* HERO */}
<div className="relative w-full h-[260px] sm:h-[320px] md:h-[400px] mt-16">
  <img
    src="/hero.jpg"
    alt="Club Pelti Denpasar"
    className="w-full h-full object-cover"
  />
  <div className="absolute inset-0 bg-black/50"></div>

  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
      Kolektif Club
    </h2>
    <p className="max-w-xl text-xs sm:text-sm md:text-base opacity-90">
      Berikut adalah daftar Club tenis yang tergabung secara resmi
      bersama PELTI Denpasar.
    </p>
  </div>
</div>

{/* ================= CONTENT ================= */}
<section className="bg-gray-50 py-12 sm:py-16">
  <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12">

    {clubs.length === 0 ? (
      <p className="text-center text-gray-500 text-sm sm:text-base">
        Belum ada data club.
      </p>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6">
        {clubs.map((c) => (
          <div
            key={c.idClub}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition 
            flex flex-col items-center text-center p-4"
          >
            {/* LOGO */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 overflow-hidden mb-3">
              {c.photo ? (
                <img
                  src={c.photo}
                  alt={c.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-xs text-gray-400">
                  No Logo
                </div>
              )}
            </div>

            {/* NAME */}
            <h4 className="font-semibold text-xs sm:text-sm text-gray-800 line-clamp-2">
              {c.name}
            </h4>

            {/* BUTTON */}
            <button
              onClick={() => setSelectedClub(c)}
              className="mt-2 text-[10px] sm:text-xs text-yellow-600 hover:text-yellow-700 font-semibold underline"
            >
              Lihat Detail
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
</section>


      {/* ================= MODAL DETAIL ================= */}
      {selectedClub && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedClub(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              onClick={() => setSelectedClub(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            {/* LOGO */}
            <div className="flex justify-center mb-4">
              <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden">
                {selectedClub.photo ? (
                  <img
                    src={selectedClub.photo}
                    alt={selectedClub.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                    No Logo
                  </div>
                )}
              </div>
            </div>

            {/* INFO */}
            <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
              {selectedClub.name}
            </h3>

            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Alamat:</span>{" "}
                {selectedClub.address || "-"}
              </p>
              <p>
                <span className="font-semibold">Telepon:</span>{" "}
                {selectedClub.phone || "-"}
              </p>
              <p>
                <span className="font-semibold">Ketua Club:</span>{" "}
                {selectedClub.leaderName || "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
