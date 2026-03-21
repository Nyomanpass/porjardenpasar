import React from 'react';

// Data Visi dan Misi
const visi = "Menjadi organisasi tenis terdepan di Bali yang melahirkan atlet berprestasi nasional dan internasional pada tahun 2045.";

const misi = [
  "Meningkatkan kualitas program pembinaan usia dini dengan standar latihan terkini.",
  "Mengadakan turnamen regional berstandar nasional secara rutin untuk mengasah mental kompetisi.",
  "Membangun ekosistem komunitas tenis yang solid, inklusif, dan menjangkau seluruh lapisan masyarakat Denpasar.",
];

function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-20">
        
        {/* Header Section */}
        <div className="text-center mb-16">
           <p className="text-[#D4A949] font-bold text-lg uppercase tracking-widest">
            LANDASAN KAMI
          </p>
          <h2 className="mt-2 text-4xl font-extrabold text-secondary sm:text-5xl">
            Tentang PELTI Denpasar
          </h2>
        </div>

        {/* Layout Dua Kolom (Dua Gambar Bertumpuk & Teks) */}
        {/* Menggunakan items-stretch di lg:flex-row agar kedua kolom (kiri dan kanan) memiliki tinggi yang sama */}
        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-stretch">
          
          {/* KOLOM KIRI: Dua Gambar Bertumpuk (UPDATED FOR ALIGNMENT) */}
          {/* Tambahkan flex-grow dan relative untuk mengatur posisi absolut gambar di dalamnya */}
          <div className="lg:w-5/12 w-full relative flex-grow min-h-[450px] lg:min-h-0">
            {/* Div penutup untuk mengatur rasio tinggi gambar agar menempel pada batas kolom kanan */}
            {/* Tinggi diatur dengan h-full agar mengisi seluruh tinggi dari parent-nya yang sejajar dengan kolom kanan */}
            <div className="relative h-full"> 
                {/* Gambar 1: Latar Belakang */}
                <img 
                src="/about.webp" 
                alt="Pemain tenis sedang beraksi di lapangan" 
                // Diatur untuk memenuhi sebagian besar ruang
                className="absolute top-0 left-0 w-10/12 h-[80%] rounded-3xl shadow-xl object-cover z-10 transform -rotate-2"
                onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = `https://placehold.co/800x600/5A4B29/D4A949?text=FOTO+1`;
                }}
                />
                
                {/* Gambar 2: Bertumpuk di Depan */}
                <img 
                src="/aboutdua.webp" 
                alt="Komunitas tenis Denpasar" 
                // Diatur untuk menempel di bagian bawah kanan
                className="absolute bottom-0 right-0 w-7/12 h-[55%] rounded-3xl shadow-2xl object-cover z-20 transform rotate-3"
                onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = `https://placehold.co/500x350/D4A949/5A4B29?text=FOTO+2`;
                }}
                />
                
            
                
            </div>
          </div>

          
          <div className="lg:w-7/12 w-full pt-10 lg:pt-0"> 
            
            {/* Paragraf Pendahuluan */}
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Persatuan Lawn Tenis Indonesia (PELTI) Kota Denpasar didirikan dengan komitmen penuh untuk memajukan olahraga tenis, dari tingkat pembinaan hingga prestasi elit. Kami adalah rumah bagi atlet, pelatih, dan komunitas tenis di ibu kota Bali.
            </p>

            {/* Visi */}
            <div className="mb-8 p-6 bg-primary rounded-2xl shadow-lg">
                <h3 className="text-2xl font-extrabold text-white mb-3 flex items-center">
                    Visi Kami
                </h3>
                <p className="text-white text-lg italic">
                    {visi}
                </p>
            </div>

            {/* Misi */}
            <div>
                <h3 className="text-2xl font-extrabold text-secondary mb-4 flex items-center">
                    Tiga Misi Utama
                </h3>
                <ul className="space-y-3 pl-0">
                    {misi.map((point, index) => (
                        <li key={index} className="flex items-start text-gray-700">
                            <span className="text-[#D4A949] font-extrabold mr-3 text-2xl leading-none">&bull;</span>
                            <span className="text-lg">
                                {point}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Tombol Lanjut ke Halaman Profil */}
            <a 
              href="/profil" 
              className="mt-8 inline-block bg-secondary text-white font-bold text-lg px-8 py-3 rounded-xl shadow-md hover:bg-[#c29841] transition duration-300 transform hover:scale-[1.01] uppercase tracking-wide"
            >
              Lihat Profil Lengkap &rarr;
            </a>

          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;