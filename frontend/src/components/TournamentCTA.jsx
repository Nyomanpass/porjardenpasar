import React from 'react';
import { TrendingUp } from 'lucide-react'; 

const TournamentCTA = () => {
    
    // Tautan pendaftaran utama
    const mainRegistrationLink = "/pendaftaran/turnamen-aktif"; 

    return (
        <section id="emotional-cta" className="py-10 sm:py-20 bg-gray-50 text-black"> 
            <div className="container mx-auto px-4 max-w-3xl text-center">
                
                {/* Ikon Aksen */}
                <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-3 sm:mb-4 animate-bounce-slow" /> 
                
                {/* Headline Persuasif */}
                <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 leading-snug sm:leading-tight">
                    Jangan Hanya Menjadi Penonton!
                </h2>
                
                {/* Sub-headline */}
                <p className="text-[12px] sm:text-sm md:text-xl text-gray-700 mb-6 sm:mb-8 max-w-xl mx-auto">
                    Momen Anda adalah Sekarang. Buktikan kemampuan Anda, raih poin ranking tertinggi, dan ukir sejarah sebagai juara tenis Denpasar berikutnya.
                </p>
                
                {/* Tombol CTA Utama */}
                <a
                    href={mainRegistrationLink}
                    className="inline-flex flex-wrap justify-center items-center bg-primary text-white font-extrabold 
                               py-3 sm:py-4 px-4 sm:px-10 rounded-full text-[12px] sm:text-xl uppercase tracking-wider 
                               hover:bg-yellow-500 transition duration-300 shadow-xl transform hover:scale-105 w-full sm:w-auto"
                >
                    Daftar Turnamen Aktif Sekarang
                </a>
                
                {/* Catatan Kaki */}
                <p className="mt-4 sm:mt-6 text-xs sm:text-sm italic text-gray-500">
                    Batas waktu pendaftaran semakin dekat. Amankan tempat Anda sebelum kuota penuh!
                </p>

    </div>
  </section>
);

};

export default TournamentCTA;
