import { 
  MapPin, Phone, Mail, Facebook, Instagram 
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 w-full">
      
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-12 
                      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 
                      gap-8">

        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Logo Pelti" className="w-10 h-10 sm:w-12 sm:h-12" />
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-white">
                PELTI DENPASAR
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-400">
                Persatuan Lawn Tenis Indonesia
              </p>
            </div>
          </div>

          <p className="text-[11px] sm:text-sm leading-relaxed text-gray-400 max-w-xs">
            PELTI Denpasar adalah organisasi olahraga yang fokus pada 
            pengembangan tenis lapangan di Kota Denpasar, Bali.
          </p>
        </div>

        {/* Navigasi */}
        <div>
          <h2 className="text-sm sm:text-base font-semibold mb-4 text-white">
            Navigasi
          </h2>
          <ul className="space-y-2 text-[11px] sm:text-sm">
            {["Beranda", "Turnamen", "Bagan", "Jadwal", "Kontak"].map((item, i) => (
              <li 
                key={i} 
                className="hover:text-yellow-400 transition cursor-pointer"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Sosial */}
        <div>
          <h2 className="text-sm sm:text-base font-semibold mb-4 text-white">
            Media Sosial
          </h2>
          <div className="flex gap-3">
            <a
              href="#"
              className="p-2 rounded-full bg-slate-800 hover:bg-yellow-400 
                         hover:text-black transition-all duration-300"
            >
              <Facebook size={16} />
            </a>
            <a
              href="#"
              className="p-2 rounded-full bg-slate-800 hover:bg-yellow-400 
                         hover:text-black transition-all duration-300"
            >
              <Instagram size={16} />
            </a>
          </div>
        </div>

        {/* Kontak */}
        <div>
          <h2 className="text-sm sm:text-base font-semibold mb-4 text-white">
            Kontak
          </h2>

          <div className="space-y-3 text-[11px] sm:text-sm text-gray-400">

            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-1 text-yellow-400 shrink-0" />
              <span>
                Jalan Gunung Agung, Desa Pemecutan Kaja, 
                Kota Denpasar, Bali
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Phone size={16} className="text-yellow-400 shrink-0" />
              <span>(+62) 123-456-789</span>
            </div>

            <div className="flex items-center gap-2 break-all">
              <Mail size={16} className="text-yellow-400 shrink-0" />
              <span>peltidenpasar@gmail.com</span>
            </div>

          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 text-center py-4 
                      text-[10px] sm:text-xs text-gray-500">
        © 2025 
        <span className="text-yellow-400 font-semibold ml-1">
          PELTI Denpasar
        </span>. All Rights Reserved.
      </div>

    </footer>
  );
}
