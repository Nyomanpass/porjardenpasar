import React from 'react';
import { Trophy, Rocket, Users } from "lucide-react";


// Data untuk 3 pilar utama PELTI Denpasar
const features = [
  {
    icon: <Trophy className="h-10 w-10 text-[#D4A949]" />,
    title: "Kompetisi Elit & Resmi",
    description:
      "Kami menyediakan panggung turnamen resmi, termasuk Walikota Cup. Tempat terbaik bagi atlet untuk menguji batas, mendapatkan poin ranking, dan meniti karir profesional.",
  },
  {
    icon: <Rocket className="h-10 w-10 text-[#D4A949]" />,
    title: "Membangun Juara",
    description:
      "Fokus utama kami adalah pembinaan usia dini. Program terpadu yang mencakup pelatihan fisik, strategi, dan mental untuk melahirkan atlet nasional dari Denpasar.",
  },
  {
    icon: <Users className="h-10 w-10 text-[#D4A949]" />,
    title: "Gairah Tenis Masyarakat",
    description:
      "Kami menyambut semua pecinta tenis! Bergabunglah dalam komunitas kami untuk Fun Match, kelas terbuka, dan menjaga gaya hidup sehat sambil memperluas jejaring pertemanan.",
  },
];


function FeatureSection() {
  return (
    <section id="features" className="py-20 bg-white"> {/* Background putih agar kontras dengan Hero */}
      <div className="container mx-auto px-4 md:px-20">
        
        {/* Header Section dengan Judul Baru yang lebih dinamis */}
        <div className="text-center mb-16">
          <p className="text-primary font-bold text-lg uppercase tracking-widest">
            MISI ORGANISASI KAMI
          </p>
          <h2 className="mt-2 text-4xl font-extrabold text-secondary sm:text-5xl">
            Jalur Prestasi Tenis Denpasar
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Kami adalah wadah resmi yang mengintegrasikan kompetisi berkelas, pembinaan berstandar tinggi, dan komunitas tenis yang solid di Denpasar.
          </p>
        </div>

        {/* Kartu Fitur (3 Kolom) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-gray-50 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 border-b-4 border-secondary border-opacity-70"
            >
              {/* Icon */}
              <div className="mb-4">
                <div className="bg-[#D4A949] rounded-full p-4 w-16 h-16 flex items-center justify-center shadow-md">
                  {React.cloneElement(feature.icon, { className: "h-8 w-8 text-white" })}
                </div>
              </div>

              
              {/* Judul Kartu */}
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>
              
              {/* Deskripsi Kartu */}
              <p className="text-gray-700 leading-relaxed">
                {feature.description}
              </p>
              
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default FeatureSection;