import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Kepengurusan() {

  // Function ambil inisial maksimal 4 huruf
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
    {
      title: "Dewan Pembina",
      members: [
        { nama: "Walikota Denpasar" },
        { nama: "Ketua Umum Koni Kota Denpasar" },
      ],
    },
    {
      title: "Dewan Penyantun",
      members: [
        { nama: "Dr. I Wayan Sudana, M.Kes" },
        { nama: "dr. Gede Harsa Wardana, MM, MARS" },
        { nama: "Prof. I Dewa Gede Ary Subagia, S.T., M.T., Ph.D" },
      ],
    },
    {
      title: "Bidang Pembinaan dan Prestasi",
      members: [
        { nama: "Ida Bagus Wayan Mega Antara, S.T" },
        { nama: "I Made Agus Armana, S.Kom" },
        { nama: "I Wayan Eka Sanjaya, S.E" },
      ],
    },
    {
      title: "Bidang Pertandingan dan Perwakilan",
      members: [
        { nama: "I Gst Agung Kurniawan, S.Pt" },
        { nama: "Joko Prasetyo" },
        { nama: "Wayan Widya" },
      ],
    },
    {
      title: "Bidang Kepelatihan",
      members: [
        { nama: "Ir. Ketut Dirga, S.T., M.Si" },
        { nama: "Hamzah" },
        { nama: "Nyoman Partadi, S.Pi" },
      ],
    },
    {
      title: "Bidang Penelitian dan Pengembangan",
      members: [
        { nama: "Prof. Dr. I Nyoman Gede Arya Astawa, S.T., M.Kom" },
        { nama: "Dr. I Gede Ary Wirajaya, S.E., M.Si., Ak" },
        { nama: "Dr. dr. I Ketut Mariadi, Sp.PD, K-GEH" },
      ],
    },
    {
      title: "Bidang Organisasi",
      members: [
        { nama: "Gede Sukadarmika, S.T., M.Sc" },
        { nama: "Ir. Ida Bagus Gede Indramanik S.T., M.T" },
        { nama: "I Made Dwi Budiana Penindra, S.T., M.T" },
      ],
    },
    {
      title: "Bidang Humas dan Kerjasama",
      members: [
        { nama: "I Gusti Agung Ketut Chatur Adhi Wirya Aryadi, S.T., M.T" },
        { nama: "I Gusti Agung Kade Suriadi, S.T., M.T" },
        { nama: "Ketut Bhaswara Kader, S.T" },
      ],
    },
    {
      title: "Bidang Dana dan Usaha",
      members: [
        { nama: "Haji Eddy Soetjahyo" },
        { nama: "Benny Heryanto" },
        { nama: "Ir. Ketut Medy Suharta" },
      ],
    },
  ];

  return (
    <>
      <Navbar />

      {/* HERO */}
      <div className="relative w-full h-[260px] sm:h-[320px] md:h-[400px] mt-16">
        <img
          src="/hero.jpg"
          alt="Kepengurusan Pelti Denpasar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Kepengurusan
          </h2>
          <p className="max-w-xl text-xs sm:text-sm md:text-base opacity-90">
            Kepengurusan ini mencakup seluruh pengurus PELTI Kota Denpasar.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 space-y-14">

          {kepengurusan.map((bidang, i) => (
            <div key={i} className="space-y-8">

              {/* JUDUL BIDANG */}
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 text-center">
                {bidang.title}
              </h3>

              {/* CARD GRID */}
              <div className="flex flex-wrap justify-center gap-5 sm:gap-6">
                {bidang.members.map((p, idx) => (
                  <div key={idx} className="w-[140px] sm:w-[160px] md:w-[180px]">
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition">

                      {/* Avatar Huruf */}
                      <div className="h-[170px] sm:h-[180px] bg-gradient-to-b from-yellow-400 to-yellow-50 flex items-center justify-center">
                        <div className="text-4xl sm:text-5xl tracking-widest text-yellow-600 font-bold">
                          {getInitial(p.nama)}
                        </div>
                      </div>

                      {/* TEXT */}
                      <div className="p-3 text-center">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-800">
                          {p.nama}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                          Anggota
                        </p>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}

        </div>
      </section>

      <Footer />
    </>
  );
}
