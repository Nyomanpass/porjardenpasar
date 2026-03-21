// src/pages/Login.jsx
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function Login() {
  const { login } = useContext(AuthContext);
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

 const submit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const user = await login(email, password);

    // 🔥 Ambil semua tournament
    const res = await api.get("/tournaments");
    const tournaments = res.data;

    let selectedTournament = null;

    if (tournaments.length > 0) {
      const activeTournaments = tournaments.filter(
        (t) => t.status === "aktif"
      );

      if (activeTournaments.length > 0) {
        // Ambil berdasarkan createdAt terbaru (lebih aman dari ID)
        selectedTournament = activeTournaments.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
      }
    }

    // 🔥 Simpan tournament kalau ada
    if (selectedTournament) {
      localStorage.setItem(
        "selectedTournament",
        selectedTournament.id
      );
      localStorage.setItem(
        "selectedTournamentName",
        selectedTournament.name
      );
    } else {
      localStorage.removeItem("selectedTournament");
      localStorage.removeItem("selectedTournamentName");
    }

    const roleRoutes = {
      admin: "/admin/peserta",
      wasit: "/wasit/peserta",
      panitia: "/panitia/peserta",
    };

    nav(roleRoutes[user.role] || "/");

  } catch (err) {
    if (err.response?.data?.message) {
      setError(err.response.data.message);
    } else {
      setError("Terjadi kesalahan, coba lagi");
    }
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
        {/* Logo dan Judul */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-20 h-20 mb-2"
          />
          <h1 className="text-xl font-bold text-gray-800">
            PELTI DENPASAR
          </h1>
          <p className="text-sm text-gray-600 -mt-1">
            Persatuan Lawn Tenis Indonesia
          </p>
        </div>

        {/* Subjudul */}
        <p className="text-center text-gray-700 mb-4">
          Silakan masukkan email dan password Anda
        </p>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-3">
            {error}
          </p>
        )}

        {/* Form Login */}
        <form onSubmit={submit} className="space-y-5">
          {/* EMAIL */}
          <div className="relative">
            <Mail
              className="absolute left-3 top-3.5 text-gray-400"
              size={18}
            />
            <input
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock
              className="absolute left-3 top-3.5 text-gray-400"
              size={18}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
              required
            />

            {/* ICON MATA */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-yellow-400 text-black font-semibold py-2.5 rounded-lg hover:bg-yellow-500 transition shadow-md"
          >
            Masuk
          </button>
        </form>

        {/* Link daftar */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Belum memiliki akun?{" "}
          <a
            href="/register"
            className="text-yellow-500 font-medium hover:underline"
          >
            Daftar Sekarang
          </a>
        </p>
      </div>
    </div>
  );
}
