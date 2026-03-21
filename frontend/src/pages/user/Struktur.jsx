import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Struktur() {

  // Function ambil inisial max 4 huruf
  const getInitial = (nama) => {
    if (!nama) return "";
    return nama
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 4)
      .toUpperCase();
  };

  const kepengurusan = [
    // Baris 1
    { jabatan: "Ketua Umum", nama: "Made Widiatmika, SE, M.Si" },
    { jabatan: "Wakil Ketua I", nama: "Made Sumarsana" },
    { jabatan: "Wakil Ketua II", nama: "I Gusti Ngurah Ketut Sukadarma, S.Kp, M.Kes" },

    // Baris 2
    { jabatan: "Sekretaris Umum", nama: "I Rudi Thomas Worek, SE" },
    { jabatan: "Wakil Sekretaris Umum I", nama: "Wahyudianto, SE" },
    { jabatan: "Bendahara", nama: "I Made Widiartha, SE" },
    { jabatan: "Wakil Bendahara", nama: "I Gusti Nyoman Bagus Wiraatmaja, SE" },
  ];

  const baris1 = kepengurusan.slice(0, 3);
  const baris2 = kepengurusan.slice(3);

  return (
    <>
      <Navbar />

      {/* HERO */}
      <div className="relative w-full h-[260px] sm:h-[320px] md:h-[400px] mt-16">
        <img
          src="/hero.jpg"
          alt="Struktur Organisasi Pelti Denpasar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Struktur Organisasi
          </h2>
          <p className="max-w-xl text-xs sm:text-sm md:text-base opacity-90">
            Struktur organisasi ini menampilkan pengurus inti PELTI Kota Denpasar.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 space-y-10">

          {/* Baris 1 */}
          <div className="flex flex-wrap justify-center gap-5 sm:gap-6">
            {baris1.map((p, idx) => (
              <div key={idx} className="w-[140px] sm:w-[160px] md:w-[180px]">
                <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition">

                  <div className="h-[170px] sm:h-[180px] w-full bg-gradient-to-b from-yellow-400 to-yellow-50 flex items-center justify-center">
                    <div className="text-4xl sm:text-5xl tracking-widest text-yellow-600 font-bold">
                      {getInitial(p.nama)}
                    </div>
                  </div>

                  <div className="p-3 text-center">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-800">
                      {p.nama}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                      {p.jabatan}
                    </p>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Baris 2 */}
          <div className="flex flex-wrap justify-center gap-5 sm:gap-6">
            {baris2.map((p, idx) => (
              <div key={idx} className="w-[140px] sm:w-[160px] md:w-[180px]">
                <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition">

                  <div className="h-[170px] sm:h-[180px] w-full bg-gradient-to-b from-yellow-400 to-yellow-50 flex items-center justify-center">
                    <div className="text-4xl sm:text-5xl tracking-widest text-yellow-600 font-bold">
                      {getInitial(p.nama)}
                    </div>
                  </div>

                  <div className="p-3 text-center">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-800">
                      {p.nama}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                      {p.jabatan}
                    </p>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
