import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Visimisi() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      {/* HERO */}
<div className="relative w-full h-[260px] sm:h-[320px] md:h-[400px] mt-16">
  <img
    src="/hero.jpg"
    alt="Visi dan Misi Pelti Denpasar"
    className="w-full h-full object-cover"
  />
  <div className="absolute inset-0 bg-black/50"></div>

  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
      Visi & Misi
    </h2>
    <p className="max-w-xl text-xs sm:text-sm md:text-base opacity-90">
      PELTI Denpasar
    </p>
  </div>
</div>

{/* CONTENT */}
<section className="bg-gray-50 py-12 sm:py-16">
  <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 space-y-10">

    {/* VISI */}
    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 md:p-10">
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">
        Visi
      </h3>
      <div className="w-14 h-1 bg-gray-800 mb-5"></div>

      <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg max-w-3xl">
        Menjadi organisasi PELTI yang terkemuka di Indonesia, khususnya
        dalam pengembangan dan pembinaan tenis lapangan di Kota Denpasar.
      </p>
    </div>

    {/* MISI */}
    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 md:p-10">
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">
        Misi
      </h3>
      <div className="w-14 h-1 bg-gray-800 mb-5"></div>

      <ol className="space-y-3 list-decimal list-inside text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg max-w-3xl">
        <li>
          Membentuk manusia yang sehat dalam rangka mendukung pembangunan
          bangsa dan Negara Indonesia serta memupuk persahabatan antar
          PELTI melalui olahraga tenis lapangan.
        </li>
        <li>
          Membentuk anggota agar memiliki rasa kepemilikan dan kecintaan
          terhadap PELTI Pengurus Kota Denpasar demi kemajuan bersama.
        </li>
      </ol>
    </div>

  </div>
</section>

      <Footer />
    </>
  );
}
