// src/components/ScrollToTop.jsx

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // Dapatkan objek lokasi saat ini dari React Router
  const { pathname } = useLocation();

  useEffect(() => {
    // Setiap kali 'pathname' (URL) berubah, paksa window untuk scroll ke atas
    window.scrollTo(0, 0);
    
    // Dependencies array: useEffect hanya akan dijalankan jika pathname berubah
  }, [pathname]);

  // Komponen ini tidak me-render apapun
  return null;
};

export default ScrollToTop;