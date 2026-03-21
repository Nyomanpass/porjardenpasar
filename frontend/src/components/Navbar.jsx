import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

/* ================= ICON ================= */
const IconWrapper = ({ children, className }) => (
  <span className={`inline-flex items-center justify-center ${className}`}>
    {children}
  </span>
);

const FacebookIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.78 4.09H5.22A3.22 3.22 0 0 0 2 7.31v9.38A3.22 3.22 0 0 0 5.22 20h13.56A3.22 3.22 0 0 0 22 16.69V7.31A3.22 3.22 0 0 0 18.78 4.09zM10.47 14.41V9.59l4.13 2.41-4.13 2.41z" />
  </svg>
);

const DownArrow = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* ================= NAVBAR ================= */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 80) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

  const navItems = [
    { name: "Home", path: "/" },
    {
      name: "Tentang Kami",
      children: [
        { name: "Visi & Misi", path: "/visi-misi" },
        { name: "Struktur Organisasi", path: "/struktur-organisasi" },
        { name: "Kepengurusan", path: "/kepengurusan" },
        { name: "Club", path: "/anggota" },
        { name: "Berita", path: "/berita" },
      ],
    },
    { name: "Turnamen", path: "/tournament" },
    { name: "Atlet", path: "/atlet" },
    { name: "Contact", path: "/contact" },
  ];

  const isParentActive = (children) =>
    children.some((c) => location.pathname === c.path);

  const linkClass = ({ isActive }) =>
    `text-sm uppercase transition ${
      isActive
        ? "text-amber-700 font-bold border-b-2 border-amber-700 pb-1"
        : "text-gray-700 hover:text-amber-700"
    }`;

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        showNav ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* TOP BAR */}
      <div className="bg-black hidden md:flex text-white text-xs px-4 sm:px-10 lg:px-20 py-1 justify-between items-center">
        <p className="truncate">
          Jalan Gunung Agung, Desa Pemecutan Kaja, Kota Denpasar, Bali
        </p>
        <div className="flex gap-3">
          <IconWrapper><FacebookIcon className="w-4 h-4" /></IconWrapper>
          <IconWrapper><InstagramIcon className="w-4 h-4" /></IconWrapper>
          <IconWrapper><YoutubeIcon className="w-4 h-4" /></IconWrapper>
        </div>
      </div>

      {/* MAIN NAV */}
      <nav className="bg-white px-4 sm:px-10 lg:px-20 py-4 shadow-md flex justify-between items-center">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="PELTI" className="w-10 md:w-14" />
          <div>
            <h1 className="font-bold text-lg md:text-2xl">PELTI DENPASAR</h1>
            <p className="text-[10px] md:text-xs font-semibold">
              Persatuan Lawn Tenis Indonesia
            </p>
          </div>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden lg:flex items-center gap-6">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.name} className="relative group">
                <span
                  className={`cursor-pointer uppercase text-sm flex items-center gap-1 ${
                    isParentActive(item.children)
                      ? "text-amber-700 font-bold"
                      : "text-gray-700 hover:text-amber-700"
                  }`}
                >
                  {item.name}
                  <DownArrow className="w-3 h-3" />
                </span>

                <div className="absolute left-0 top-full mt-3 w-56 bg-white shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.name}
                      to={child.path}
                      className={({ isActive }) =>
                        `block px-5 py-3 text-sm rounded-xl hover:bg-amber-50 ${
                          isActive ? "text-amber-700 font-bold" : ""
                        }`
                      }
                    >
                      {child.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink key={item.name} to={item.path} className={linkClass}>
                {item.name}
              </NavLink>
            )
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden text-2xl"
        >
          ☰
        </button>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="lg:hidden bg-white shadow-lg px-6 py-4 space-y-3">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.name}>
                <button
                  onClick={() =>
                    setDropdownOpen((p) => ({
                      ...p,
                      [item.name]: !p[item.name],
                    }))
                  }
                  className="w-full flex justify-between font-semibold"
                >
                  {item.name}
                  <DownArrow
                    className={`w-3 h-3 transition ${
                      dropdownOpen[item.name] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen[item.name] && (
                  <div className="pl-4 mt-2 space-y-2">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.name}
                        to={child.path}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `block text-sm ${
                            isActive ? "text-amber-700 font-bold" : ""
                          }`
                        }
                      >
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block py-2 ${
                    isActive
                      ? "text-amber-700 font-bold border-b-2 border-amber-700"
                      : ""
                  }`
                }
              >
                {item.name}
              </NavLink>
            )
          )}
        </div>
      )}
    </header>
  );
}
