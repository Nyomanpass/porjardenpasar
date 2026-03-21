import React from 'react';

function JoinTournamentCTA() {
  return (
    <section id="join-tournament" className="py-20 bg-white">
      <div className="container mx-auto ">
        
        {/* Menggunakan layout split-section (dua kolom) sesuai referensi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-gray-50 overflow-hidden">
          
          {/* Kolom Kiri: Teks Ajakan (CTA) */}
          <div className="py-8 md:py-16 px-4 md:px-8 lg:px-20 lg:order-1 order-2">
            
            <p className="text-xl font-semibold text-primary uppercase tracking-wider mb-2">
              JADILAH BAGIAN DARI SEJARAH
            </p>
            
            <h2 className="text-xl md:text-4xl font-extrabold text-secondary leading-tight mb-6">
              Adu Skill di Turnamen Resmi Denpasar
            </h2>
            
            <p className="text-lg text-gray-700 mb-8">
              Siap menguji kemampuan terbaik Anda? PELTI Denpasar mengundang atlet dan pegiat tenis dari segala kelompok usia untuk bersaing di kompetisi resmi kami. Dapatkan Poin Peringkat Nasional dan raih pengalaman tak ternilai!
            </p>
            
            {/* Tombol Ajakan Aksi (CTA Button) */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="bg-primary text-white font-bold py-4 px-8 rounded-full text-md shadow-xl transition-all duration-300 transform hover:scale-105 hover:bg-[#A37A3C]">
                  Daftar Sekarang →
                </button>
               
            </div>
          </div>
          
          {/* Kolom Kanan: Gambar Atlet Tenis (Visual Impact) */}
          <div className="lg:order-2 order-1 h-96 lg:h-full">
            <img
              // Menggunakan gambar lapangan tenis yang menarik
              src="juara.webp"
              alt="Atlet tenis sedang melakukan servis di lapangan hijau"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/1200x800/2A7B43/FFFFFF?text=Aksi+Tenis+di+Lapangan+Denpasar" }}
            />
          </div>
        </div>

      </div>
    </section>
  );
}

export default JoinTournamentCTA;