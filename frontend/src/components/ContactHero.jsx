import React, { useState, useEffect } from 'react';

// Data untuk setiap slide, dengan penambahan field 'description'
const slides = [
  {
    title: "Hubungi Kami", 
    description: "Kami siap menjawab pertanyaan Anda mengenai pembinaan atlet, keanggotaan, jadwal turnamen, atau peluang kemitraan.",
    image: "hero.jpg"
  },
];


function ContactHero() {

  return (
    <section id="home" className="relative w-full h-screen max-h-[600px] overflow-hidden">
      
      {/* Container Slide */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out bg-cover bg-center ${
           'opacity-100' 
          }`}
          // Ganti 'bg-opacity' dengan transform/opacity pada elemen background
          style={{ backgroundImage: `url('${slide.image}')` }}
        >
          {/* Overlay Gelap dengan Gradien Emas di bawah */}
          <div className="absolute inset-0 bg-black/40"></div> {/* Sedikit lebih gelap */}
          {/* Gradien Emas untuk Aksen Keren di bawah */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent"></div>

          {/* Konten Teks */}
          <div className="absolute inset-0 flex items-center justify-start px-4 md:px-8 lg:px-20">
            <div className="max-w-5xl text-center mx-auto transform translate-y-10 md:translate-y-0">
            
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#F0E68C] leading-tight drop-shadow-lg">
                {slide.title}
              </h1>

              {/* Deskripsi Tambahan (Teks Penjelas Baru) */}
              <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-200 font-light leading-relaxed drop-shadow-md">
                {slide.description}
              </p>
            
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export default ContactHero;