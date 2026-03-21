import { Menu, LogOut, Bell, User, Settings, Globe, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import VerificationDrawer from "./VerificationDrawer";
import api from "../api"; // Pastikan Anda mengimpor API instance

function NavbarDashboard({ toggleSidebar, toggleCollapse, isCollapsed }) {
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State untuk drawer verifikasi
  const [pendingUsers, setPendingUsers] = useState([]); // State untuk data pending

  const userName = localStorage.getItem("role");
  const role = localStorage.getItem("role") || "Admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleGoToWebsite = () => {
    window.open("/",); 
  };
  
  const handleDropdownToggle = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };
  
  // Menutup dropdown saat klik di luar
  const handleBlur = () => {
      setTimeout(() => setIsProfileDropdownOpen(false), 200);
  }

  // --- LOGIKA FETCH DAN HANDLER VERIFIKASI ---
  
  // 1. Fetch data peserta pending
  const fetchPendingUsers = async () => {
    try {
      const res = await api.get("/peserta?status=pending");
      setPendingUsers(res.data);
    } catch (err) {
      console.error("Gagal mengambil peserta pending:", err);
    }
  };

  // 2. Efek untuk fetch saat komponen dimuat
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // Handler Verifikasi (Setuju)
  const handleVerify = async (id) => {
    try {
      await api.put(`/peserta/${id}/verify`, { status: "verified" });
      fetchPendingUsers();
    } catch (error) {
      console.error(error);
    }
  };

  // Handler Tolak (Reject)
const handleReject = async (id, message) => {
  try {
    // 1. Cari data peserta dari state lokal SEBELUM dihapus di backend
    const user = pendingUsers.find(p => p.id === id);
    
    if (!user) {
     
      return;
    }

    // 2. Panggil API untuk hapus data di backend
    await api.put(`/peserta/${id}/verify`, { 
      status: "rejected", 
      alasan: message 
    });

    // 3. Jalankan logika WhatsApp
    let phone = user.nomorWhatsapp; // Pastikan nama field sesuai dengan Model (nomorWhatsapp)
    
    if (phone) {
      // Format nomor: ubah 08... menjadi 628...
      if (phone.startsWith("0")) phone = "62" + phone.slice(1);
      
      const text = `Halo *${user.namaLengkap}*,\n\nMohon maaf, pendaftaran Anda di PELTI Denpasar ditolak dengan alasan:\n\n_"${message}"_\n\nSilakan melakukan pendaftaran ulang dengan data yang benar. Terima kasih.`;
      
      // Buka link WhatsApp
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, "_blank");
    }

    // 4. Refresh list (karena data sudah dihapus di backend, list akan otomatis berkurang)
    fetchPendingUsers();
   

  } catch (error) {
    console.error(error);
  
  }
};
  
  // 5. Handler Detail (Navigasi)
  const handleViewDetail = (id) => {
      setIsDrawerOpen(false); // Tutup drawer sebelum navigasi
      navigate(`/${role}/detail-peserta/${id}`);
  }
  // --- END LOGIKA FETCH DAN HANDLER VERIFIKASI ---


  return (
    <>
    <nav className={`
      w-full bg-white shadow-sm px-4 py-3 flex items-center justify-between
      fixed top-0 left-0 z-50
      transition-all duration-300
      ${isCollapsed
        ? "md:left-20 md:w-[calc(100%-5rem)]"
        : "md:left-72 md:w-[calc(100%-18rem)]"}
    `}>



        {/* KIRI: Logo, Toggle Menu, dan Judul */}
        <div className="flex items-center gap-2">
          {/* tombol buka sidebar (mobile) */}
          <button
            className="md:hidden p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={toggleSidebar}
          >
            <Menu size={22} />
          </button>

          {/* tombol minimize sidebar (desktop) */}
          <button
            onClick={toggleCollapse}
            className="hidden md:block p-2 rounded-full hover:bg-gray-100 text-gray-700"
            title="Minimize Sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Logo Pelatnas Denpasar */}
          <div className="flex items-center gap-4">
            <img 
              src="/logo.png" 
              alt="Logo Persatuan Tenis Seluruh Indonesia PELTI" 
              className="w-10 md:w-12 h-auto" 
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/000000/ffffff?text=PELTI" }} 
            />
            <div className="hidden md:block">
              <h1 className="font-bold text-lg text-black leading-none">PELTI DENPASAR</h1>
              <p className="text-xs text-gray-600 font-semibold mt-1">Persatuan Lawn Tenis Indonesia</p>
            </div>
          </div>
        </div>

        {/* KANAN: Notifikasi dan Menu Profil */}
        <div className="flex items-center gap-2">
          
          {/* Tombol Notifikasi (Lonceng) - Mengubah menjadi BUTTON Aksi */}
          {(role === "admin" || role === "panitia") && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-3 rounded-full text-gray-600 hover:bg-gray-100 transition-colors relative"
              title="Notifikasi Verifikasi Peserta"
            >
              <Bell size={20} />
              {/* Badge Notifikasi Real-time */}
              {pendingUsers.length > 0 && (
                  <span className="absolute top-2 right-2 flex items-center justify-center h-4 w-4 rounded-full bg-red-600 ring-2 ring-white text-xs text-white font-bold">
                      {pendingUsers.length > 9 ? '9+' : pendingUsers.length}
                  </span>
              )}
            </button>
          )}

          {/* Menu Profil dengan Dropdown */}
          <div 
              className="relative" 
              onBlur={handleBlur} 
              tabIndex={0} 
          >
            <button
              onClick={handleDropdownToggle}
              className="flex items-center gap-2 p-2 pl-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <span className="text-sm font-semibold text-gray-700 hidden sm:inline">
                Halo, {userName}
              </span>
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                {userName[0].toUpperCase()}
              </div>
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-lg shadow-2xl bg-white border border-gray-100 z-50 overflow-hidden">
                
                {/* Info Pengguna di Dropdown */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800">
                      Akun {role}
                    </p>
                </div>

                <ul className="py-1">
                  <li>
                    <button
                      onClick={handleGoToWebsite}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Globe size={18} className="text-blue-500"/> Kembali ke Website
                    </button>
                  </li>
                    {role === "admin" && (
                      <>
                        <li>
                          <a
                            href="/admin/profile"
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <User size={18} className="text-yellow-500"/>
                            Profile
                          </a>
                        </li>
                    
                      
                      <li>
                        {/* Menggunakan elemen <a> atau Link dari React Router, bukan Link dari Lucide */}
                        <a
                          href="/admin/settings" 
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)} 
                        >
                          <Settings size={18} className="text-gray-500"/> Pengaturan
                        </a>
                      </li>
                      </>
                    )}

                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 border-t border-gray-100 mt-1"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {/* 2. Komponen Drawer Verifikasi */}
      {(role === "admin" || role === "panitia") && (
        <VerificationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          pendingUsers={pendingUsers}
          onVerify={handleVerify}
          onReject={handleReject}
          onViewDetail={handleViewDetail} // Menambahkan handler detail
        />
      )}
    </>
  );
}

export default NavbarDashboard;